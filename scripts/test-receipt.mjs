import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChangeGuard } from './change-guard.mjs';
import { createProjectTask, initProject, saveProjectTask } from './project-state.mjs';
import { workspaceRuntime } from './workspace-runtime.mjs';

const bin = fileURLToPath(new URL('../bin/repo-doctor-skills.mjs', import.meta.url));
const git = (root, ...args) => execFileSync('git', args, { cwd: root });
const put = (root, file, data) => writeFileSync(path.join(root, file), data);

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'rd-receipt-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  git(root, 'init', '-q');
  put(root, 'app.js', 'original fixture source\n');
  put(root, '.gitignore', 'ignored.txt\n');
  git(root, 'add', '.');
  git(root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgSign=false',
    '-c', 'core.hooksPath=.git/no-hooks', 'commit', '-qm', 'Initial fixture');
  return root;
}

function invoke(root, ...options) {
  return spawnSync(process.execPath, [bin, 'receipt', 'export', ...options], { cwd: root, encoding: 'utf8' });
}

function exportReceipt(root, ...options) {
  const run = invoke(root, '--id', 'edit', ...options);
  assert.equal(run.status, 0, run.stderr || run.stdout);
  return run.stdout;
}

test('exports both formats from Change Guard alone without modifying the baseline or index', t => {
  const root = fixture(t);
  runChangeGuard(root, 'begin', { id: 'edit', scope: ['app.js', '\x60edge.txt', 'edge.txt\x60'] });
  const baseline = path.join(root, '.repo-doctor/changes/edit.json');
  const saved = readFileSync(baseline);
  const index = readFileSync(path.join(root, '.git/index'));
  put(root, 'app.js', 'updated fixture source\n');
  const json = JSON.parse(exportReceipt(root, '--format', 'json'));
  assert.equal(json.authorization_and_scope.task.status, 'not_recorded');
  assert.equal(json.authorization_and_scope.protected_path_policy.current.status, 'not_recorded');
  assert.deepEqual(json.authorization_and_scope.declared_scope, ['\x60edge.txt', 'app.js', 'edge.txt\x60']);
  assert.equal(json.observed_changes.changes[0].path, 'app.js');
  assert.deepEqual(json.observed_changes.changes[0].levels, ['info']);
  assert.equal(json.verification_evidence.status, 'not_recorded');
  const markdown = exportReceipt(root);
  assert.match(markdown, /^# Verification Receipt/m);
  assert.match(markdown, /Authorization & Scope[\s\S]*Observed Changes[\s\S]*Verification Evidence[\s\S]*Coverage Limits/);
  assert.match(markdown, /Task ID: \x60edit\x60\n/);
  assert.match(markdown, /modified — \x60app\.js\x60/);
  assert.match(markdown, /\x60\x60 \x60edge\.txt \x60\x60/);
  assert.match(markdown, /\x60\x60 edge\.txt\x60 \x60\x60/);
  assert.ok(markdown.includes('<details>\n<summary>Coverage Limits (' + json.coverage_limits.length + ')</summary>\n\n'));
  assert.match(markdown, /Git-ignored files[\s\S]*\n\n<\/details>\n$/);
  assert.doesNotMatch(markdown, /^## Coverage Limits/m);
  assert.match(markdown, /Git-ignored files/);
  assert.doesNotMatch(markdown, /updated fixture source/);
  assert.deepEqual(readFileSync(baseline), saved);
  assert.deepEqual(readFileSync(path.join(root, '.git/index')), index);
});

test('disabled Git filters preserve observed indicators and other unknown findings still limit coverage', t => {
  const root = fixture(t);
  git(root, 'config', 'filter.receipt-fixture.clean', 'cat');
  runChangeGuard(root, 'begin', { id: 'edit', scope: ['app.js', 'package.json', '.env.local'] });
  const read = () => JSON.parse(exportReceipt(root, '--json'));
  const clean = read();
  assert.deepEqual(clean.observed_changes.changes, []);
  assert.deepEqual(clean.observed_changes.findings, [{ level: 'unknown', code: 'configured_git_filters_disabled' }]);
  assert.ok(clean.coverage_limits.includes('configured_git_filters_disabled'));
  assert.equal(clean.observed_changes.preexisting_touched, 'not_observed');
  assert.equal(clean.observed_changes.dependency_changed, 'not_observed');
  assert.equal(clean.observed_changes.sensitive_configuration_changed, 'not_observed');
  const markdown = exportReceipt(root);
  assert.match(markdown, /Configured Git filters were disabled during observation/);
  assert.match(markdown, /Preexisting edits touched: not_observed/);

  put(root, 'package.json', '{}\n');
  assert.equal(read().observed_changes.dependency_changed, 'observed');
  put(root, '.env.local', 'LOCAL_FIXTURE=fixture\n');
  const partial = read().observed_changes;
  assert.ok(partial.findings.some(item => item.code === 'sensitive_path_not_fingerprinted'));
  assert.equal(partial.preexisting_touched, 'unknown');
  assert.equal(partial.dependency_changed, 'observed');
  assert.equal(partial.sensitive_configuration_changed, 'observed');
});

test('checkpoint evidence distinguishes a recorded result, matching inputs, deferral and drift', async t => {
  const root = fixture(t);
  await initProject(root, { apply: true });
  const projectFile = '.repo-doctor/project.json';
  const project = JSON.parse(readFileSync(path.join(root, projectFile), 'utf8'));
  project.change_guard = { schema_version: 1, protected_paths: ['protected'] };
  put(root, projectFile, JSON.stringify(project));
  const task = await createProjectTask(root, { id: 'edit', goal: 'Fix the order display', acceptance: ['visible'], skill: 'feature-implementation' });
  runChangeGuard(root, 'begin', { id: 'edit', scope: ['app.js'] });
  put(root, 'app.js', 'const invalid = ;\n');
  const runtime = await workspaceRuntime();
  const check = () => spawnSync(process.execPath, ['--check', 'app.js'], { cwd: root });
  const { context } = task;
  context.scope.files.push('app.js');
  const failed = check();
  assert.equal(failed.status, 1);
  const evidence = (id, execution) => runtime.captureEvidence(root, {
    id, source: 'fixture-runner', kind: 'test', result: execution.status === 0 ? 'pass' : 'fail',
    command: 'internal command details', cwd: root, summary: 'private log snippet',
    dependencies: ['app.js'], coverage_complete: true, exit_code: execution.status,
  }, { fixture_environment: 'private environment value' });
  const oldEvidence = evidence('previous-check', failed);
  put(root, 'app.js', '// final tested source\n');
  const finalExecution = check();
  assert.equal(finalExecution.status, 0);
  // Local checkpoints can contain claims. Matching hashes and matching types
  // still cannot reattest the originating host or its environment.
  context.evidence.push(evidence('syntax-check', finalExecution));
  context.evidence.push({ id: 'claimed-pass', kind: 'test', result: 'pass' });
  context.evidence.push({ id: 'pending-check', kind: 'test', status: 'verification_deferred' });
  context.next_actions.push({ reason: 'verification_deferred', verification_status: 'verification_deferred' });
  // Save after a later edit to demonstrate that the checkpoint's own hashes
  // and an individual test's captured hashes are independent.
  context.evidence.push(oldEvidence);
  await saveProjectTask(root, { id: 'edit', context, expectedRevision: task.revision });
  const checkpointFile = path.join(root, '.repo-doctor/tasks/edit.json');
  const originalCheckpoint = readFileSync(checkpointFile, 'utf8');

  const output = exportReceipt(root, '--json');
  const report = JSON.parse(output);
  assert.equal(report.authorization_and_scope.task.goal, 'Fix the order display');
  assert.deepEqual(report.authorization_and_scope.protected_path_policy.baseline.paths, ['protected']);
  assert.deepEqual(report.authorization_and_scope.protected_path_policy.current.paths, ['protected']);
  assert.equal(report.verification_evidence.status, 'verification_deferred');
  const [recorded, claim, deferred, past] = report.verification_evidence.entries;
  assert.equal(recorded.recorded_result, 'pass');
  assert.equal(recorded.dependency_match, 'matched');
  assert.equal(recorded.execution_attestation, 'unknown');
  assert.equal(recorded.status, 'UNKNOWN');
  assert.equal(claim.dependency_match, 'unknown');
  assert.equal(claim.status, 'UNKNOWN');
  assert.equal(deferred.status, 'verification_deferred');
  assert.equal(past.recorded_result, 'fail');
  assert.equal(past.status, 'STALE');
  assert.equal(past.dependency_match, 'mismatch');
  const markdown = exportReceipt(root);
  assert.match(markdown, /Fix the order display/);
  assert.match(markdown, /recorded result: pass · status: UNKNOWN · recorded dependencies: matched · execution attestation: unknown/);
  for (const value of [root, 'internal command details', 'private log snippet', 'private environment value', 'final tested source']) {
    assert.ok(!output.includes(value) && !markdown.includes(value));
  }
  put(root, 'app.js', '// changed after checkpoint\n');
  const after = JSON.parse(exportReceipt(root, '--json'));
  assert.equal(after.verification_evidence.entries[0].status, 'STALE');
  assert.equal(after.verification_evidence.entries[0].dependency_match, 'mismatch');
  assert.equal(readFileSync(checkpointFile, 'utf8'), originalCheckpoint);
});

test('risk levels coexist and sensitive paths, credentials and file contents are omitted', t => {
  const root = fixture(t);
  put(root, 'app.js', 'user edit\n');
  runChangeGuard(root, 'begin', { id: 'edit', scope: ['app.js', 'ignored.txt'] });
  put(root, 'app.js', 'user edit\nassistant edit\n');
  put(root, 'package-lock.json', '{}\n');
  put(root, '.env.internal', 'INTERNAL_FIXTURE=environment-data\n');
  const raw = exportReceipt(root, '--json');
  const report = JSON.parse(raw).observed_changes;
  assert.equal(report.status, 'violation');
  assert.equal(report.preexisting_touched, 'observed');
  assert.equal(report.dependency_changed, 'observed');
  assert.equal(report.sensitive_configuration_changed, 'observed');
  assert.deepEqual(report.changes.find(item => item.path === 'app.js').levels, ['info', 'warning']);
  assert.deepEqual(report.changes.find(item => item.labels.includes('sensitive_configuration')).levels,
    ['info', 'warning', 'violation', 'unknown']);
  assert.equal(report.changes.find(item => item.labels.includes('sensitive_configuration')).path, null);
  assert.ok(report.findings.some(item => item.level === 'unknown' && item.code === 'declared_scope_ignored'));
  const markdown = exportReceipt(root);
  assert.match(markdown, /\*\*warning\*\*/);
  assert.match(markdown, /\*\*violation\*\*/);
  assert.match(markdown, /\*\*unknown\*\*/);
  for (const value of ['.env.internal', 'INTERNAL_FIXTURE', 'environment-data', 'assistant edit']) {
    assert.ok(!raw.includes(value) && !markdown.includes(value));
  }
  const credentialName = 'ghp_' + 'A'.repeat(40);
  put(root, credentialName, '');
  const unavailable = exportReceipt(root, '--json');
  assert.ok(!unavailable.includes(credentialName));
  assert.equal(JSON.parse(unavailable).observed_changes.status, 'unknown');
  assert.equal(JSON.parse(unavailable).observed_changes.changes, null);
  rmSync(path.join(root, credentialName));
  mkdirSync(path.join(root, '.repo-doctor/tasks'));
  put(root, '.repo-doctor/tasks/edit.json', JSON.stringify({ goal: credentialName }));
  put(root, '.repo-doctor/project.json', JSON.stringify({ goal: credentialName }));
  const sanitized = exportReceipt(root, '--json');
  assert.ok(!sanitized.includes(credentialName));
  const data = JSON.parse(sanitized);
  assert.equal(data.authorization_and_scope.task.status, 'unknown');
  assert.equal(data.verification_evidence.status, 'UNKNOWN');
});

test('missing baseline and task remain unknown or not recorded with no local writes', t => {
  const root = fixture(t);
  const report = JSON.parse(exportReceipt(root, '--json'));
  assert.equal(report.authorization_and_scope.scope_status, 'unknown');
  assert.equal(report.observed_changes.status, 'unknown');
  assert.equal(report.observed_changes.changes, null);
  assert.equal(report.observed_changes.preexisting_touched, 'unknown');
  assert.ok(report.observed_changes.findings.some(item => item.code === 'baseline_missing'));
  assert.equal(report.verification_evidence.status, 'not_recorded');
  assert.equal(existsSync(path.join(root, '.repo-doctor')), false);
});

test('output is exclusive and contained even with an explicit root', t => {
  const root = fixture(t);
  const outside = mkdtempSync(path.join(tmpdir(), 'rd-receipt-outside-'));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'reports'));
  symlinkSync(outside, path.join(root, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  put(root, 'existing.md', 'user contents');
  assert.equal(exportReceipt(outside, '--root', root, '--out', 'reports/receipt.md'), '');
  const saved = readFileSync(path.join(root, 'reports/receipt.md'), 'utf8');
  assert.match(saved, /^# Verification Receipt/);
  exportReceipt(root, '--format', 'json', '--out', 'reports/receipt.json');
  assert.equal(JSON.parse(readFileSync(path.join(root, 'reports/receipt.json'), 'utf8')).id, 'edit');
  for (const file of ['../outside.md', path.join(outside, 'outside.md'), 'reports/../outside.md', 'escape/outside.md',
    '.git/local.md', '.repo-doctor/local.md', 'existing.md', 'reports/receipt.md', '.env', 'reports/a:stream', 'reports\\outside.md']) {
    const result = invoke(root, '--id', 'edit', '--out', file);
    assert.equal(result.status, 1, file);
    assert.equal(result.stdout, '');
    assert.ok(!result.stderr.includes(outside));
  }
  if (process.platform !== 'win32') {
    symlinkSync(path.join(outside, 'outside.md'), path.join(root, 'output-link'));
    assert.equal(invoke(root, '--id', 'edit', '--out', 'output-link').status, 1);
  }
  assert.deepEqual(readFileSync(path.join(root, 'reports/receipt.md'), 'utf8'), saved);
  assert.equal(readFileSync(path.join(root, 'existing.md'), 'utf8'), 'user contents');
  assert.equal(existsSync(path.join(outside, 'outside.md')), false);
  for (const options of [[], ['--id', '../escape'], ['--id', 'edit', '--format', 'xml'], ['--id', 'edit', '--format', 'markdown', '--json']]) {
    assert.equal(invoke(root, ...options).status, 1);
  }
});
