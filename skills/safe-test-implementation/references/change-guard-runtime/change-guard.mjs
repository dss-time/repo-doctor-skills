import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, constants, fstatSync, lstatSync, openSync, readdirSync, readlinkSync, readSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { credentialFindings } from './credential-findings.mjs';
import { ensureDirectory, ensurePrivateIgnore, maxStateBytes, readJson, safePath, validateRelativePath, withLock, writeJson } from './local-state-files.mjs';
import { projectGuardPolicy, projectRootBinding, validateGuardPaths } from './project-state.mjs';

const DIRECTORY = '.repo-doctor/changes';
const SOURCE = 'git_status_and_worktree_fingerprints';
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sort = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const fileLimit = 8 * 1024 * 1024;
const snapshotLimit = 64 * 1024 * 1024;

function git(root, args, allowed = [0], input) {
  // Do not inherit an alternate index, worktree, config override or trace output.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_/i.test(key)));
  Object.assign(env, { GIT_OPTIONAL_LOCKS: '0', GIT_NO_LAZY_FETCH: '1', GIT_ALLOW_PROTOCOL: '', GIT_TERMINAL_PROMPT: '0' });
  const result = spawnSync('git', ['--no-pager', '-c', 'core.fsmonitor=false', ...args], {
    cwd: root, env, input, timeout: 10000, maxBuffer: maxStateBytes, windowsHide: true,
  });
  if (!allowed.includes(result.status)) throw new Error(result.error?.code === 'ENOENT' ? 'git_unavailable' : 'git_observation_failed');
  // Never propagate Git stderr, which can include repository paths or config values.
  return { status: result.status, output: decoder.decode(result.stdout) };
}

function safeMetadata(value) {
  if (credentialFindings(JSON.stringify(value, null, 2)).length) throw new Error('sensitive_metadata_omitted');
  return value;
}

function statusPath(relative) {
  validateRelativePath(relative);
  if (relative.split('/').some(part => part.toLowerCase() === '.git')) throw new Error('Unsupported Git path');
  if (process.platform === 'win32' && /[:*?"<>|]|[. ](?:\/|$)/.test(relative)) throw new Error('Unsupported Windows Git path');
  return relative;
}

function categories(relative) {
  const name = path.posix.basename(relative).toLowerCase();
  const labels = [];
  if (/^\.env(?:\.|$)|^(?:\.npmrc|\.pypirc|\.netrc|\.git-credentials|credentials(?:\..*)?|secrets?(?:\..*)?|id_(?:rsa|ed25519))$|\.(?:pem|key|p12|pfx)$/.test(name)
      || /(?:^|\/)(?:\.aws|\.ssh|\.kube|\.repo-doctor)(?:\/|$)/i.test(relative)) labels.push('sensitive_configuration');
  if (/^(?:package(?:-lock)?\.json|npm-shrinkwrap\.json|pnpm-(?:lock\.yaml|workspace\.yaml)|yarn\.lock|bun\.lockb?|cargo\.(?:toml|lock)|go\.(?:mod|sum)|pyproject\.toml|requirements(?:[-.][\w.-]+)?\.txt|poetry\.lock|uv\.lock|gemfile(?:\.lock)?|composer\.(?:json|lock)|pom\.xml|gradle\.lockfile|build\.gradle(?:\.kts)?)$/.test(name)) labels.push('dependency');
  if (/(?:^|\/)(?:openapi|swagger|schemas?|contracts?)(?:[./_-]|$)|\.(?:proto|graphqls?)$/i.test(relative)) labels.push('contract_candidate');
  if (/(?:^|\/)(?:migrations?|database|auth|permissions?)(?:[./_-]|$)/i.test(relative)) labels.push('data_or_permission_candidate');
  if (/(?:^|\/)(?:tests?|__tests__|spec)(?:\/|$)|\.(?:test|spec)\.[^/]+$/i.test(relative)) labels.push('test');
  if (/(?:^|\/)(?:\.github|\.gitlab|\.circleci)(?:\/|$)|^(?:\.gitattributes|\.gitignore|\.gitmodules|\.editorconfig|(?:ts|js)config.*\.json|dockerfile(?:\..*)?)$/.test(relative) || /(?:^|\.)config\.[^/]+$/.test(name)) labels.push('configuration');
  return labels;
}

function statKey(stat) {
  // Windows can update the directory-entry change timestamp while opening a
  // file for a read-only fingerprint. Keep the stable identity, mode, size and
  // modification timestamp in the observation key there. The second lstat
  // still detects a content write or replacement during capture.
  return process.platform === 'win32'
    ? [stat.dev, stat.ino, stat.mode, stat.size, stat.mtimeNs].join(':')
    : [stat.dev, stat.ino, stat.mode, stat.size, stat.mtimeNs, stat.ctimeNs].join(':');
}

function sample(root, relative, budget) {
  try {
    const parent = path.posix.dirname(relative);
    const directory = parent === '.' ? root : safePath(root, parent);
    const filename = path.join(directory, path.posix.basename(relative));
    const before = lstatSync(filename, { bigint: true });
    if (before.isSymbolicLink()) {
      const digest = createHash('sha256').update(readlinkSync(filename, { encoding: 'buffer' })).digest('hex');
      if (statKey(before) !== statKey(lstatSync(filename, { bigint: true }))) return { state: 'unknown', reason: 'file_changed_during_capture' };
      return { state: 'symlink', digest };
    }
    if (!before.isFile()) return { state: 'unknown', reason: 'unsupported_file_type' };
    const size = Number(before.size);
    if (size > fileLimit || size > budget.remaining) return { state: 'unknown', reason: 'fingerprint_limit' };
    budget.remaining -= size;
    // O_NONBLOCK also avoids hanging if another writer replaces a regular file with a FIFO.
    const fd = openSync(filename, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
    try {
      if (parent !== '.') safePath(root, parent);
      if (statKey(before) !== statKey(fstatSync(fd, { bigint: true }))) return { state: 'unknown', reason: 'file_changed_during_capture' };
      const digest = createHash('sha256');
      const buffer = Buffer.allocUnsafe(Math.min(65536, size));
      let remaining = size;
      while (remaining > 0) {
        const count = readSync(fd, buffer, 0, Math.min(buffer.length, remaining), null);
        if (count === 0) return { state: 'unknown', reason: 'file_changed_during_capture' };
        digest.update(buffer.subarray(0, count));
        remaining -= count;
      }
      if (parent !== '.') safePath(root, parent);
      if (statKey(before) !== statKey(fstatSync(fd, { bigint: true }))
          || statKey(before) !== statKey(lstatSync(filename, { bigint: true }))) return { state: 'unknown', reason: 'file_changed_during_capture' };
      return { state: 'file', executable: Boolean(Number(before.mode) & 0o111), digest: digest.digest('hex') };
    } finally { closeSync(fd); }
  } catch (error) {
    if (error.code === 'ENOENT') return { state: 'missing' };
    return { state: 'unknown', reason: 'path_unreadable_or_unsafe' };
  }
}

function pathIsMissing(root, relative) {
  const parent = path.posix.dirname(relative);
  try {
    const directory = parent === '.' ? root : safePath(root, parent);
    lstatSync(path.join(directory, path.posix.basename(relative)));
    return false;
  } catch (error) { return error.code === 'ENOENT'; }
}

function symlinkSpelling(root, relative) {
  const parent = path.posix.dirname(relative);
  const dir = parent === '.' ? root : safePath(root, parent);
  const leaf = path.posix.basename(relative);
  const link = lstatSync(path.join(dir, leaf), { bigint: true });
  if (!link.isSymbolicLink()) return null;
  const fold = name => name.normalize('NFC').toLowerCase();
  const names = readdirSync(dir).filter(name => fold(name) === fold(leaf));
  if (names.includes(leaf)) return path.join(realpathSync.native(dir), leaf);
  if (names.length !== 1) return null;
  const observed = lstatSync(path.join(dir, names[0]), { bigint: true });
  return observed.isSymbolicLink() && observed.dev === link.dev && observed.ino === link.ino
    ? path.join(realpathSync.native(dir), names[0]) : null;
}

function pathAliases(root, relatives) {
  const aliases = new Set(relatives);
  for (const relative of relatives) {
    let parent = relative;
    const tail = [];
    while (parent !== '.') {
      try {
        // Native realpath resolves the on-disk spelling on case-insensitive filesystems.
        let canonical;
        try { canonical = realpathSync.native(safePath(root, parent)); }
        catch (error) {
          if (error.code) throw error;
          canonical = symlinkSpelling(root, parent);
          if (!canonical) break;
        }
        const resolved = path.relative(root, canonical).split(path.sep).concat(tail).join('/');
        validateRelativePath(resolved);
        aliases.add(resolved);
        break;
      } catch (error) {
        if (error.code !== 'ENOENT') break;
        tail.unshift(path.posix.basename(parent));
        parent = path.posix.dirname(parent);
      }
    }
  }
  return [...aliases].sort(sort);
}

function statusSettings(root) {
  const settings = ['-c', 'core.untrackedCache=false', '-c', 'status.renames=true', '-c', 'status.aheadBehind=false'];
  // Status may refresh index entries by running a configured clean/process filter.
  // Disable those commands before status and report the comparison limitation.
  const keys = git(root, ['config', '--null', '--name-only', '--get-regexp', '^filter\\..*\\.(clean|process)$'], [0, 1]).output;
  const drivers = [...new Set(keys.split('\0').filter(Boolean).map(key => key.slice(0, key.lastIndexOf('.'))))].sort();
  for (const driver of drivers) {
    settings.push('-c', `${driver}.clean=`, '-c', `${driver}.process=`, '-c', `${driver}.required=false`);
  }
  return { settings, filtersDisabled: drivers.length > 0 };
}

function snapshot(root, scope, previousUntracked) {
  let policy = null;
  try { policy = projectGuardPolicy(root); } catch { /* Keep observing Git paths when the profile cannot be read. */ }
  const { settings, filtersDisabled } = statusSettings(root);
  const items = git(root, [...settings, 'status', '--porcelain=v2', '-z', '--branch', '--untracked-files=all', '--ignore-submodules=dirty']).output.split('\0');
  const limitations = ['ignored_paths_and_hidden_index_entries_not_observed', 'submodule_internal_edits_not_observed', 'observations_are_not_atomic'];
  if (filtersDisabled) limitations.push('configured_git_filters_disabled');
  const unreachable_scope = [];
  const inspectableScope = scope.filter(relative => {
    const parent = path.posix.dirname(relative);
    if (parent === '.') return true;
    try { safePath(root, parent); return true; }
    catch { unreachable_scope.push(relative); return false; }
  });
  const ignored_scope = inspectableScope.length
    ? git(root, ['check-ignore', '-z', '--stdin'], [0, 1], inspectableScope.map(relative => './' + relative).join('\0') + '\0')
      .output.split('\0').filter(Boolean).map(relative => relative.slice(2))
    : [];
  const byPath = new Map();
  let head;
  let branch;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (item.startsWith('# branch.oid ')) { head = item.slice(13); continue; }
    if (item.startsWith('# branch.head ')) { branch = item.slice(14); continue; }
    if (!item || item.startsWith('# ')) continue;
    const type = item[0];
    if (!['?', '1', '2', 'u'].includes(type)) throw new Error('unsupported_git_status');
    const prefix = item.match(/^(?:[^ ]+ ){1,10}/)?.[0];
    const length = { '?': 1, 1: 8, 2: 9, u: 10 }[type];
    const fields = prefix?.split(' ').slice(0, length);
    if (fields?.length !== length || fields.some(field => !field)) throw new Error('unsupported_git_status');
    const relative = statusPath(item.slice(fields.join(' ').length + 1));
    const original = type === '2' ? statusPath(items[++index]) : null;
    const labels = [...new Set([...categories(relative), ...(original ? categories(original) : [])])];
    const sensitive = labels.includes('sensitive_configuration');
    const entry = {
      path: relative, ...(original ? { original_path: original } : {}),
      xy: type === '?' ? '??' : fields[1],
      type, labels, git: sensitive ? null : fields.slice(2),
      ...(sensitive ? { worktree: { state: 'unknown', reason: 'sensitive_path_not_fingerprinted' } } : {}),
    };
    const previous = byPath.get(relative);
    if (previous) {
      // Git emits a staged deletion and an untracked replacement as two rows.
      if ((previous.type === '?') === (type === '?')) throw new Error('unsupported_git_status');
      byPath.set(relative, { ...(type === '?' ? previous : entry), untracked_replacement: true });
    } else byPath.set(relative, entry);
  }
  if (!head || !branch) throw new Error('unsupported_git_status');
  const budget = { remaining: snapshotLimit };
  const entries = [...byPath.values()].sort((a, b) => sort(a.path, b.path));
  for (const entry of entries) {
    if (entry.worktree) continue;
    if (entry.git.some(field => field === '160000' || /^S[.C][.M][.U]$/.test(field))) {
      entry.worktree = { state: 'unknown', reason: 'submodule_worktree_not_fingerprinted' };
    } else entry.worktree = sample(root, entry.path, budget);
  }
  const missing_untracked = previousUntracked.filter(relative => !byPath.has(relative) && pathIsMissing(root, relative));
  return safeMetadata({
    head, branch, policy, entries, limitations, ignored_scope, unreachable_scope, missing_untracked,
    scope_aliases: pathAliases(root, scope),
    protected_aliases: pathAliases(root, policy?.protected_paths ?? []),
  });
}

function observe(root, scope, baseline) {
  try {
    const top = git(root, ['rev-parse', '--show-toplevel'], [0, 128]);
    if (top.status === 128) return { reason: 'git_worktree_unavailable' };
    const reportedRoot = realpathSync(top.output.replace(/\r?\n$/, ''));
    const sameRoot = process.platform === 'win32'
      ? reportedRoot.toLowerCase() === root.toLowerCase()
      : reportedRoot === root;
    if (!sameRoot) return { reason: 'use_git_worktree_root' };
    const previousUntracked = baseline?.entries
      .filter(entry => entry.type === '?' && !entry.labels.includes('sensitive_configuration'))
      .map(entry => entry.path) ?? [];
    const first = snapshot(root, scope, previousUntracked);
    const second = snapshot(root, scope, previousUntracked);
    if (hash(first) !== hash(second) || second.entries.some(entry => entry.worktree.reason === 'file_changed_during_capture')) {
      return { reason: 'workspace_changed_during_capture' };
    }
    return { snapshot: second };
  } catch (error) {
    const known = ['git_unavailable', 'git_observation_failed', 'unsupported_git_status', 'sensitive_metadata_omitted'];
    return { reason: known.includes(error.message) ? error.message : 'workspace_observation_failed' };
  }
}

function load(root, filename, id) {
  try { lstatSync(safePath(root, filename)); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  const saved = readJson(root, filename);
  const { baseline, checksum } = saved ?? {};
  if (baseline?.schema_version !== 1 || baseline.id !== id || baseline.root_binding !== projectRootBinding(root)
      || checksum !== hash(baseline) || !Array.isArray(baseline.snapshot?.entries)
      || !Array.isArray(baseline.snapshot?.policy?.protected_paths) || !Array.isArray(baseline.snapshot?.limitations)) {
    throw new Error('Invalid Change Guard baseline or worktree binding');
  }
  validateGuardPaths(baseline.scope);
  validateGuardPaths(baseline.snapshot.policy.protected_paths);
  for (const entry of baseline.snapshot.entries) {
    statusPath(entry.path);
    if (entry.original_path) statusPath(entry.original_path);
    if (typeof entry.xy !== 'string' || !entry.worktree || !Array.isArray(entry.labels)) throw new Error('Invalid Change Guard entry');
  }
  return baseline;
}

const within = (relative, prefixes) => prefixes.some(prefix => relative === prefix || relative.startsWith(prefix + '/'));
const finding = (level, code, details = {}) => ({ level, code, ...details });
const reportStatus = findings => ['violation', 'warning', 'unknown'].find(level => findings.some(item => item.level === level)) ?? 'observed';

function scopeFindings(...snapshots) {
  return [['ignored_scope', 'declared_scope_ignored'], ['unreachable_scope', 'declared_scope_unreachable']]
    .flatMap(([key, code]) => [...new Set(snapshots.flatMap(snapshot => snapshot[key] ?? []))]
      .map(relative => finding('unknown', code, { path: relative })));
}

function changedModes(old, current, sameHead) {
  // Normal porcelain entries contain HEAD, index and worktree modes, in that order.
  const oldModes = ['1', '2'].includes(old?.type) ? old.git : null;
  const currentModes = ['1', '2'].includes(current?.type) ? current.git : null;
  const cleanMode = sameHead ? (currentModes ?? oldModes)?.[1] : undefined;
  const before = old ? [oldModes?.[2], oldModes?.[3]] : [cleanMode, cleanMode];
  const after = current ? [currentModes?.[2], currentModes?.[3]] : [cleanMode, cleanMode];
  const regular = mode => mode === '100644' || mode === '100755';
  const type = mode => /^(100644|100755|120000|160000)$/.test(mode) ? mode.slice(0, 3) : null;
  const sameSampleType = old?.worktree.state === current?.worktree.state;
  const sampleTypesKnown = [old?.worktree.state, current?.worktree.state].every(state => state === 'file' || state === 'symlink');
  return {
    typeChanged: (sampleTypesKnown && !sameSampleType)
      || before.some((mode, index) => type(mode) && type(after[index]) && type(mode) !== type(after[index]))
      || (sameHead && !currentModes && [...(current?.xy ?? '')].some((state, index) =>
        state === 'T' && old?.xy?.[index] !== 'T')),
    executableChanged: (sampleTypesKnown && sameSampleType && old.worktree.state === 'file'
      && old.worktree.executable !== current.worktree.executable)
      || before.some((mode, index) => regular(mode) && regular(after[index]) && mode !== after[index]),
  };
}

function compare(before, after, scope, root) {
  const findings = [];
  const oldEntries = new Map(before.entries.map(entry => [entry.path, entry]));
  const newEntries = new Map(after.entries.map(entry => [entry.path, entry]));
  const paths = [...new Set([...oldEntries.keys(), ...newEntries.keys()])].sort(sort);
  const missingUntracked = new Set(after.missing_untracked);
  const changes = [];
  if (!scope.length) findings.push(finding('unknown', 'scope_not_declared'));
  if (before.head !== after.head || before.branch !== after.branch) findings.push(finding('unknown', 'head_or_branch_changed'));
  if (!after.policy) findings.push(finding('unknown', 'project_policy_unavailable'));
  else if (hash(before.policy) !== hash(after.policy)) findings.push(finding('unknown', 'project_identity_or_policy_changed'));
  findings.push(...scopeFindings(before, after));
  if ([...before.limitations, ...after.limitations].includes('configured_git_filters_disabled')) findings.push(finding('unknown', 'configured_git_filters_disabled'));
  const scopes = [...new Set([...scope, ...(before.scope_aliases ?? []), ...after.scope_aliases])];
  const protectedPaths = [...new Set([
    ...before.policy.protected_paths, ...(before.protected_aliases ?? []), ...after.protected_aliases,
  ])];
  const matches = (item, prefixes) => within(item, prefixes)
    || pathAliases(root, [item]).some(alias => within(alias, prefixes));
  for (const relative of paths) {
    const old = oldEntries.get(relative);
    const current = newEntries.get(relative);
    const originalPath = current?.original_path ?? old?.original_path;
    const renameChanged = current?.original_path && current.original_path !== old?.original_path;
    const affected = renameChanged ? [relative, current.original_path] : [relative];
    const context = { path: relative, ...(originalPath ? { original_path: originalPath } : {}) };
    const incomplete = [old, current].filter(entry => entry?.worktree.state === 'unknown');
    for (const reason of new Set(incomplete.map(entry => entry.worktree.reason))) findings.push(finding('unknown', reason, context));
    if (hash(old ?? null) === hash(current ?? null)) continue;
    let kind = 'modified';
    if (renameChanged) kind = current.git?.at(-1)?.startsWith('C') ? 'copied' : 'renamed';
    else if (current?.xy.includes('D')) kind = 'deleted';
    else if (current?.xy.includes('A') || current?.type === '?') kind = old ? 'modified' : 'added';
    else if (!current) kind = missingUntracked.has(relative) ? 'deleted' : 'baseline_entry_cleared';
    const labels = [...new Set([...(old?.labels ?? []), ...(current?.labels ?? [])])];
    const preexisting = Boolean(old || (originalPath && oldEntries.has(originalPath)));
    const details = { ...context, kind, before: old?.xy ?? null, after: current?.xy ?? null, preexisting, origin: 'unknown', labels };
    if (old?.untracked_replacement || current?.untracked_replacement) {
      details.untracked_replacement = { before: Boolean(old?.untracked_replacement), after: Boolean(current?.untracked_replacement) };
    }
    const modes = changedModes(old, current, before.head === after.head);
    if (modes.typeChanged) details.type_changed = true;
    if (modes.executableChanged) details.executable_changed = true;
    changes.push(details);
    findings.push(finding('info', 'change_observed', context));
    if (scope.length && affected.some(item => !matches(item, scopes))) {
      findings.push(finding('violation', 'outside_declared_scope', context));
    }
    if (protectedPaths.length && affected.some(item => matches(item, protectedPaths))) {
      findings.push(finding('violation', 'protected_path_changed', context));
    }
    if (preexisting) findings.push(finding('warning', 'preexisting_change_touched', context));
    for (const label of ['dependency', 'sensitive_configuration']) {
      if (labels.includes(label)) findings.push(finding('warning', `${label}_changed`, context));
    }
    if (current?.type === 'u') findings.push(finding('warning', 'unmerged_path', context));
  }
  return { findings, changes, status: reportStatus(findings) };
}

export function runChangeGuard(root, action, { id, scope = [] }) {
  if (typeof id !== 'string' || id.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Invalid baseline ID: use lowercase letters, digits and hyphens (maximum 64)');
  if (!['begin', 'check', 'status'].includes(action)) throw new Error('Unknown Change Guard operation');
  validateGuardPaths(scope);
  safeMetadata({ id, scope });
  root = realpathSync(root);
  if (root === path.parse(root).root) throw new Error('Project root must not be a filesystem root');
  const filename = `${DIRECTORY}/${id}.json`;
  const metadata = { schema_version: 1, operation: action, id, source: SOURCE };
  const baseline = load(root, filename, id);
  if (action === 'begin' && baseline) throw new Error('Baseline ID already exists; choose a new ID to preserve the original baseline');
  if (action !== 'begin' && !baseline) return { ...metadata, status: 'missing_baseline', findings: [finding('unknown', 'baseline_missing')] };
  if (action === 'status') return {
    ...metadata, status: 'baseline_available', created_at: baseline.created_at, head: baseline.snapshot.head,
    branch: baseline.snapshot.branch, scope: baseline.scope, preexisting_paths: baseline.snapshot.entries.length,
    unverified_paths: baseline.snapshot.entries.filter(entry => entry.worktree.state === 'unknown').length,
    findings: scopeFindings(baseline.snapshot),
    limitations: baseline.snapshot.limitations,
  };
  const observed = observe(root, baseline?.scope ?? scope, baseline?.snapshot);
  if (!observed.snapshot) return { ...metadata, status: 'unknown', findings: [finding('unknown', observed.reason)] };
  const current = observed.snapshot;
  if (action === 'check') return {
    ...metadata, ...compare(baseline.snapshot, current, baseline.scope, root),
    scope: baseline.scope, limitations: [...new Set([...baseline.snapshot.limitations, ...current.limitations])],
  };
  if (!current.policy) return { ...metadata, status: 'unknown', findings: [finding('unknown', 'project_policy_unavailable')] };
  if (git(root, ['ls-files', '-z', '--', '.repo-doctor']).output) throw new Error('Change Guard requires untracked local state');
  ensureDirectory(root, '.repo-doctor');
  ensurePrivateIgnore(root);
  if (git(root, ['check-ignore', '--no-index', '-q', '--', filename], [0, 1]).status !== 0) {
    throw new Error('Change Guard baseline path must be Git-ignored');
  }
  ensureDirectory(root, DIRECTORY);
  const created = {
    schema_version: 1, id, root_binding: projectRootBinding(root), created_at: new Date().toISOString(),
    scope: [...scope].sort(sort), snapshot: current,
  };
  return withLock(root, `${DIRECTORY}/${id}.lock`, () => {
    if (load(root, filename, id)) throw new Error('Baseline ID already exists; choose a new ID to preserve the original baseline');
    writeJson(root, filename, { baseline: created, checksum: hash(created) });
    return {
      ...metadata, status: 'baseline_created', created_at: created.created_at, head: current.head,
      branch: current.branch, scope: created.scope, preexisting_paths: current.entries.length,
      unverified_paths: current.entries.filter(entry => entry.worktree.state === 'unknown').length,
      findings: scopeFindings(current),
      limitations: current.limitations,
    };
  });
}
