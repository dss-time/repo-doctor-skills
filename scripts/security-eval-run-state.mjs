import { recordSafetyIssues } from './security-turn-evidence.mjs';
import { accessSync, constants, lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export function pathExists(filename) {
  try {
    lstatSync(filename);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

// Resolve existing ancestors too, so a symlinked output parent cannot hide a
// report inside the model's workspace. This preflight does not create paths.
export function preflightRunPaths(workspace, output) {
  const resolvedWorkspace = realpathSync(workspace);
  if (!lstatSync(resolvedWorkspace).isDirectory() || readdirSync(resolvedWorkspace).length) {
    throw new Error('Use a fresh empty isolated workspace');
  }
  accessSync(resolvedWorkspace, constants.W_OK | constants.X_OK);
  if (pathExists(output)) throw new Error('Output exists; choose a new run path, including when resuming');
  let ancestor = path.dirname(output);
  const missing = [];
  while (!pathExists(ancestor)) {
    missing.unshift(path.basename(ancestor));
    ancestor = path.dirname(ancestor);
  }
  const resolvedAncestor = realpathSync(ancestor);
  if (!lstatSync(resolvedAncestor).isDirectory()) throw new Error('Output ancestor must be a directory');
  accessSync(resolvedAncestor, constants.W_OK | constants.X_OK);
  const resolvedOutput = path.join(resolvedAncestor, ...missing, path.basename(output));
  const relative = path.relative(resolvedWorkspace, resolvedOutput);
  if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('Report output must be outside the isolated workspace');
  }
  return { workspace: resolvedWorkspace, output: resolvedOutput };
}

// Hash structure and contents without following symlinks or storing contents in
// evidence. Extra files and changed links are observable as well as deletions.
export function workspaceDigest(directory) {
  const hash = createHash('sha256');
  function visit(current, relative) {
    const stat = lstatSync(current);
    if (stat.isSymbolicLink() || (!stat.isFile() && !stat.isDirectory())) {
      throw new Error('Unexpected workspace entry');
    }
    hash.update(JSON.stringify([relative, stat.isDirectory() ? 'directory' : 'file', stat.mode & 0o777]));
    if (stat.isDirectory()) {
      for (const name of readdirSync(current).sort()) visit(path.join(current, name), path.join(relative, name));
    } else {
      hash.update(createHash('sha256').update(readFileSync(current)).digest());
    }
  }
  visit(directory, '.');
  return hash.digest('hex');
}

export function observeWorkspace(directory, expectedDigest, details) {
  const observation = { ...details, checked_at: new Date().toISOString(), expected_digest: expectedDigest };
  try {
    observation.observed_digest = workspaceDigest(directory);
    observation.status = observation.observed_digest === expectedDigest ? 'intact' : 'changed';
  } catch {
    observation.status = 'unverified';
  }
  return observation;
}

export function assertSafeCheckpoint(report) {
  if (!report.run_id || !['INCOMPLETE', 'PASS'].includes(report.result) || report.workspace_intact === false) {
    throw new Error('Failed or invalid run requires review before resume');
  }
  if (!Array.isArray(report.safety_observations) || !Array.isArray(report.pending_attempts)) {
    throw new Error('Checkpoint lacks per-attempt safety history');
  }
  if (report.pending_attempts.length) throw new Error('Interrupted attempts require review before resume');
  const ids = new Set();
  for (const observation of report.safety_observations) {
    if (!observation.id || ids.has(observation.id) || observation.status !== 'intact'
        || observation.outcome !== 'completed' || !observation.run_id
        || !/^[a-f0-9]{64}$/.test(observation.expected_digest ?? '')
        || observation.expected_digest !== observation.observed_digest) {
      throw new Error('Historical safety failure or unknown observation requires review');
    }
    ids.add(observation.id);
  }
  for (const record of report.records) {
    const observation = report.safety_observations.find(item => item.id === record.safety_observation_id);
    if (!observation || observation.case_id !== record.id || observation.phase !== 'after'
        || !record.attempt_id || observation.attempt_id !== record.attempt_id) {
      throw new Error('Case lacks bound post-attempt safety observation');
    }
    if (!record.answer || recordSafetyIssues(record).length) {
      throw new Error('Historical tool use, disclosure or malformed case requires review');
    }
  }
}
