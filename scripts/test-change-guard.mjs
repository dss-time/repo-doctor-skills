import assert from 'node:assert/strict';
import { execFile, spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { promisify } from 'node:util';

if (process.platform === 'win32') process.env.REPO_DOCTOR_DEBUG_WINDOWS = '1';

const cli = fileURLToPath(new URL('../bin/repo-doctor-skills.mjs', import.meta.url));
const asyncExec = promisify(execFile);

function command(cmd, args, root, status = 0, env = process.env) {
  const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', timeout: 30000, env });
  assert.equal(result.status, status, result.stderr || result.stdout || String(result.error));
  return result;
}

function git(root, ...args) {
  return command('git', args, root).stdout;
}

function run(root, args, status = 0, env) {
  return command(process.execPath, [cli, ...args], root, status, env);
}

function change(root, action, id = 'edit', args = []) {
  return JSON.parse(run(root, ['change', action, '--id', id, '--json', ...args]).stdout);
}

function fixture(t, { repository = true, commit = true } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'repo-doctor-guard-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  if (!repository) return root;
  git(root, 'init', '-q');
  git(root, 'config', 'user.name', 'Guard Fixture');
  git(root, 'config', 'user.email', 'fixture@example.invalid');
  git(root, 'config', 'commit.gpgSign', 'false');
  git(root, 'config', 'core.autocrlf', 'false');
  mkdirSync(path.join(root, 'src'));
  for (const name of ['app.js', 'old.js', 'remove.js', 'mode.js']) put(root, 'src/' + name, name + '\n');
  put(root, 'package-lock.json', '{}\n');
  put(root, 'outside.txt', 'untouched\n');
  put(root, '.gitignore', 'ignored.txt\n');
  if (commit) {
    git(root, 'add', '.');
    git(root, '-c', 'core.hooksPath=.unused-hooks', 'commit', '-qm', 'fixture');
  }
  return root;
}

function put(root, relative, text) { writeFileSync(path.join(root, relative), text); }
function reportHas(report, level, code, relative) {
  return report.findings.some(item => item.level === level && item.code === code && item.path === relative);
}

test('independently installed writing skills share an existing baseline and project policy', t => {
  const root = fixture(t);
  const installs = fixture(t, { repository: false });
  const installedEntry = skill => {
    const source = fileURLToPath(new URL(`../skills/${skill}/references/`, import.meta.url));
    const references = path.join(installs, skill, 'references');
    cpSync(source, references, { recursive: true });
    return path.join(references, 'change-guard-entry.mjs');
  };
  const implementation = installedEntry('feature-implementation');
  const testing = installedEntry('safe-test-implementation');
  const invoke = (entry, ...args) => JSON.parse(command(
    process.execPath, [entry, ...args, '--id', 'shared-task', '--root', root, '--json'], installs,
  ).stdout);

  const profile = JSON.parse(run(root, ['project', 'init', '--apply']).stdout).project;
  profile.change_guard = { schema_version: 1, protected_paths: ['src/app.js'] };
  put(root, '.repo-doctor/project.json', JSON.stringify(profile));
  put(root, 'src/app.js', '// existing user change\n');
  const origin = invoke(implementation, 'begin', '--scope', 'src');
  if (process.platform === 'win32' && origin.status !== 'baseline_created') console.log('windows change guard diagnostic', origin);
  assert.equal(origin.status, 'baseline_created');
  const baseline = path.join(root, '.repo-doctor/changes/shared-task.json');
  const receipt = readFileSync(baseline);
  put(root, 'src/app.js', '// existing user change\nexport const state = 1;\n');
  assert.equal(invoke(testing, 'status').created_at, origin.created_at);
  const review = invoke(testing, 'check');
  assert.ok(reportHas(review, 'violation', 'protected_path_changed', 'src/app.js'));
  assert.ok(reportHas(review, 'warning', 'preexisting_change_touched', 'src/app.js'));
  assert.deepEqual(readFileSync(baseline), receipt);
});

test('compares dirty contents, index transitions, dependencies, renames and explicit scope', t => {
  const root = fixture(t);
  put(root, 'src/app.js', 'existing unstaged edit\n');
  put(root, 'user notes.txt', 'original user contents\n');
  put(root, 'ignored.txt', 'ignored\n');
  git(root, 'add', 'src/app.js');
  put(root, 'src/app.js', 'existing additional edit\n');
  const index = git(root, 'ls-files', '--stage');
  const baseline = change(root, 'begin', 'edit', ['--scope', 'src']);
  assert.equal(baseline.status, 'baseline_created');
  assert.equal(baseline.preexisting_paths, 2);
  assert.equal(git(root, 'ls-files', '--stage'), index);
  const saved = path.join(root, '.repo-doctor/changes/edit.json');
  const original = readFileSync(saved, 'utf8');
  assert.ok(!original.includes('existing additional edit') && !original.includes('original user contents'));
  if (process.platform !== 'win32') assert.equal(statSync(saved).mode & 0o077, 0);
  assert.equal(change(root, 'status').status, 'baseline_available');
  assert.equal(change(root, 'check').changes.length, 0);
  put(root, 'src/app.js', 'concurrent diff under the same Git status\n');
  put(root, 'src/new file.js', 'new code\n');
  put(root, 'package-lock.json', '{"updated":true}\n');
  put(root, 'outside.txt', 'different\n');
  git(root, 'mv', 'src/old.js', 'src/renamed file.js');
  rmSync(path.join(root, 'src/remove.js'));
  rmSync(path.join(root, 'user notes.txt'));
  put(root, 'ignored.txt', 'ignored update\n');
  const report = change(root, 'check');
  assert.equal(report.status, 'violation');
  const byPath = new Map(report.changes.map(item => [item.path, item]));
  assert.equal(byPath.get('src/app.js').before, 'MM');
  assert.equal(byPath.get('src/app.js').after, 'MM');
  assert.equal(byPath.get('src/app.js').origin, 'unknown');
  assert.equal(byPath.get('src/new file.js').kind, 'added');
  assert.equal(byPath.get('src/remove.js').kind, 'deleted');
  assert.equal(byPath.get('user notes.txt').kind, 'deleted');
  assert.equal(byPath.get('src/renamed file.js').kind, 'renamed');
  assert.equal(byPath.get('src/renamed file.js').original_path, 'src/old.js');
  assert.equal(byPath.has('ignored.txt'), false);
  assert.ok(reportHas(report, 'warning', 'preexisting_change_touched', 'src/app.js'));
  assert.ok(reportHas(report, 'warning', 'dependency_changed', 'package-lock.json'));
  assert.ok(reportHas(report, 'violation', 'outside_declared_scope', 'outside.txt'));
  git(root, 'add', 'src/app.js');
  assert.equal(change(root, 'check').changes.find(item => item.path === 'src/app.js').after, 'M.');
  assert.equal(readFileSync(saved, 'utf8'), original);
  assert.equal(readFileSync(path.join(root, 'src/app.js'), 'utf8'), 'concurrent diff under the same Git status\n');
  const duplicate = run(root, ['change', 'begin', '--id', 'edit', '--json'], 1);
  assert.equal(JSON.parse(duplicate.stderr).status, 'error');
});

test('protects both sides of a newly observed rename and preserves the optional project policy', t => {
  const root = fixture(t);
  const profile = JSON.parse(run(root, ['project', 'init', '--apply']).stdout).project;
  profile.change_guard = { schema_version: 1, protected_paths: ['src/old.js'] };
  put(root, '.repo-doctor/project.json', JSON.stringify(profile));
  const refresh = JSON.parse(run(root, ['project', 'refresh', '--revision', '1', '--apply']).stdout);
  assert.deepEqual(refresh.project.change_guard, profile.change_guard);
  change(root, 'begin', 'edit', ['--scope', 'src/destination.js']);
  git(root, 'mv', 'src/old.js', 'src/destination.js');
  put(root, '.repo-doctor/project.json', JSON.stringify({ ...refresh.project, change_guard: { schema_version: 1, protected_paths: [] } }));
  const report = change(root, 'check');
  assert.ok(reportHas(report, 'unknown', 'project_identity_or_policy_changed'));
  assert.ok(reportHas(report, 'violation', 'protected_path_changed', 'src/destination.js'));
  assert.ok(reportHas(report, 'violation', 'outside_declared_scope', 'src/destination.js'));
  profile.change_guard.protected_paths = ['../escaped'];
  put(root, '.repo-doctor/project.json', JSON.stringify(profile));
  run(root, ['project', 'check'], 1);
  const withoutPolicy = change(root, 'check');
  assert.ok(reportHas(withoutPolicy, 'unknown', 'project_policy_unavailable'));
  assert.ok(reportHas(withoutPolicy, 'violation', 'protected_path_changed', 'src/destination.js'));
});

test('reports non-Git, nested roots, absent baselines, invalid input and ignored-state conflicts', t => {
  const plain = fixture(t, { repository: false });
  assert.equal(change(plain, 'begin').status, 'unknown');
  assert.equal(change(plain, 'check').status, 'missing_baseline');
  assert.equal(existsSync(path.join(plain, '.repo-doctor')), false);
  const root = fixture(t);
  assert.ok(reportHas(change(root, 'begin', 'ignored', ['--scope', 'ignored.txt']), 'unknown', 'declared_scope_ignored', 'ignored.txt'));
  assert.ok(reportHas(change(root, 'check', 'ignored'), 'unknown', 'declared_scope_ignored', 'ignored.txt'));
  assert.ok(reportHas(change(path.join(root, 'src'), 'begin'), 'unknown', 'use_git_worktree_root'));
  assert.match(run(root, ['change', 'status', '--id', 'edit']).stdout, /missing_baseline/);
  for (const options of [['--id', '../escape'], ['--id', 'valid', '--scope', '../escape'], ['--id', 'valid', '--scope', '.git/config'], ['--id', 'valid', '--other']]) {
    run(root, ['change', 'begin', ...options], 1);
  }
  mkdirSync(path.join(root, '.repo-doctor'), { recursive: true });
  put(root, '.repo-doctor/.gitignore', 'other\n');
  run(root, ['change', 'begin', '--id', 'edit'], 1);
  assert.equal(readFileSync(path.join(root, '.repo-doctor/.gitignore'), 'utf8'), 'other\n');
  assert.equal(existsSync(path.join(root, '.repo-doctor/changes/edit.json')), false);
});

test('handles an unborn branch, linked worktree identity and HEAD drift', t => {
  const root = fixture(t, { commit: false });
  assert.equal(change(root, 'begin', 'initial', ['--scope', 'src']).head, '(initial)');
  git(root, 'add', '.');
  git(root, '-c', 'core.hooksPath=.unused-hooks', 'commit', '-qm', 'first commit');
  assert.ok(reportHas(change(root, 'check', 'initial'), 'unknown', 'head_or_branch_changed'));
  const worktree = path.join(fixture(t, { repository: false }), 'linked');
  git(root, 'worktree', 'add', '--detach', worktree, 'HEAD');
  const linked = change(worktree, 'begin', 'edit', ['--scope', 'src']);
  assert.equal(linked.status, 'baseline_created');
  assert.equal(linked.branch, '(detached)');
  assert.equal(change(root, 'status').status, 'missing_baseline');
  mkdirSync(path.join(root, '.repo-doctor/changes'), { recursive: true });
  put(root, '.repo-doctor/changes/edit.json', readFileSync(path.join(worktree, '.repo-doctor/changes/edit.json')));
  run(root, ['change', 'status', '--id', 'edit'], 1);
});

test('does not execute configured Git filters, record sensitive content or trust an alternate index', t => {
  const root = fixture(t);
  put(root, '.gitattributes', 'src/app.js filter=fixture\n');
  git(root, 'config', 'filter.fixture.clean', 'echo invoked > should-not-exist');
  git(root, 'config', 'filter.fixture.required', 'true');
  put(root, 'src/app.js', 'dirty content\n');
  put(root, '.env.local', 'PRIVATE_FIXTURE_CONTENT=synthetic-only\n');
  const baseline = change(root, 'begin', 'edit', ['--scope', 'src', '--scope', '.env.local']);
  assert.equal(baseline.status, 'baseline_created');
  assert.equal(baseline.unverified_paths, 1);
  assert.equal(existsSync(path.join(root, 'should-not-exist')), false);
  const filename = path.join(root, '.repo-doctor/changes/edit.json');
  assert.ok(!readFileSync(filename, 'utf8').includes('PRIVATE_FIXTURE_CONTENT'));
  put(root, '.env.local', 'PRIVATE_FIXTURE_CONTENT=synthetic-modified\n');
  const result = JSON.parse(run(root, ['change', 'check', '--id', 'edit', '--json'], 0, {
    ...process.env, GIT_INDEX_FILE: path.join(root, 'different-index'),
  }).stdout);
  assert.ok(reportHas(result, 'unknown', 'configured_git_filters_disabled'));
  assert.ok(reportHas(result, 'unknown', 'sensitive_path_not_fingerprinted', '.env.local'));
  assert.equal(existsSync(path.join(root, 'should-not-exist')), false);
  assert.equal(existsSync(path.join(root, 'different-index')), false);
});

test('preserves the staged deletion when the same path has an untracked replacement', t => {
  const root = fixture(t);
  change(root, 'begin', 'edit', ['--scope', 'src']);
  git(root, 'rm', '--cached', 'src/remove.js');
  const changeAtPath = change(root, 'check').changes.find(item => item.path === 'src/remove.js');
  assert.equal(changeAtPath.kind, 'deleted');
  assert.equal(changeAtPath.after, 'D.');
  assert.deepEqual(changeAtPath.untracked_replacement, { before: false, after: true });
});

test('detects executable and symlink type changes without following external targets', { skip: process.platform === 'win32' }, t => {
  const root = fixture(t);
  const external = fixture(t, { repository: false });
  put(external, 'target.txt', 'external fixture contents\n');
  change(root, 'begin', 'edit', ['--scope', 'src']);
  git(root, 'config', 'core.filemode', 'true');
  chmodSync(path.join(root, 'src/mode.js'), 0o755);
  rmSync(path.join(root, 'src/remove.js'));
  symlinkSync(path.join(external, 'target.txt'), path.join(root, 'src/remove.js'));
  const report = change(root, 'check');
  assert.equal(report.changes.find(item => item.path === 'src/mode.js').executable_changed, true);
  assert.equal(report.changes.find(item => item.path === 'src/remove.js').type_changed, true);
  mkdirSync(path.join(root, '.repo-doctor/elsewhere'));
  symlinkSync(path.join(external, 'target.txt'), path.join(root, '.repo-doctor/changes/linked.json'));
  run(root, ['change', 'status', '--id', 'linked'], 1);
});

test('concurrent begin calls leave exactly one immutable baseline', async t => {
  const root = fixture(t);
  const args = [cli, 'change', 'begin', '--id', 'same', '--json'];
  const outcomes = await Promise.allSettled([
    asyncExec(process.execPath, args, { cwd: root, timeout: 30000 }),
    asyncExec(process.execPath, args, { cwd: root, timeout: 30000 }),
  ]);
  assert.equal(outcomes.filter(item => item.status === 'fulfilled').length, 1);
  assert.equal(outcomes.find(item => item.status === 'rejected').reason.code, 1);
  assert.equal(change(root, 'status', 'same').status, 'baseline_available');
  assert.ok(reportHas(change(root, 'check', 'same'), 'unknown', 'scope_not_declared'));
});

test('reports a further edit to a preexisting rename as a destination change', t => {
  const root = fixture(t);
  git(root, 'mv', 'src/old.js', 'src/destination.js');
  change(root, 'begin', 'edit', ['--scope', 'src/destination.js']);
  put(root, 'src/destination.js', 'new fixture content\n');
  const report = change(root, 'check');
  assert.equal(report.changes.length, 1);
  assert.equal(report.changes[0].kind, 'modified');
  assert.equal(report.changes[0].original_path, 'src/old.js');
  assert.ok(reportHas(report, 'warning', 'preexisting_change_touched', 'src/destination.js'));
  assert.equal(reportHas(report, 'violation', 'outside_declared_scope', 'src/destination.js'), false);
});

test('mode and type flags describe transitions after the baseline', { skip: process.platform === 'win32' }, t => {
  const root = fixture(t);
  git(root, 'config', 'core.filemode', 'true');
  const executable = path.join(root, 'src/mode.js');
  const link = path.join(root, 'src/remove.js');
  chmodSync(executable, 0o755);
  rmSync(link);
  symlinkSync('old.js', link);
  change(root, 'begin', 'edit', ['--scope', 'src']);
  put(root, 'src/mode.js', 'content only after baseline\n');
  rmSync(link);
  symlinkSync('mode.js', link);
  const changes = change(root, 'check').changes;
  assert.equal(changes.find(entry => entry.path === 'src/mode.js').executable_changed, undefined);
  assert.equal(changes.find(entry => entry.path === 'src/remove.js').type_changed, undefined);
  chmodSync(executable, 0o644);
  rmSync(link);
  put(root, 'src/remove.js', 'remove.js\n');
  const restored = change(root, 'check').changes;
  assert.equal(restored.find(entry => entry.path === 'src/mode.js').executable_changed, true);
  assert.equal(restored.find(entry => entry.path === 'src/remove.js').type_changed, true);
});

test('partial scope coverage keeps valid observations when a declared path traverses a symlink', { skip: process.platform === 'win32' }, t => {
  const root = fixture(t);
  const elsewhere = fixture(t, { repository: false });
  symlinkSync(elsewhere, path.join(root, 'linked'));
  const scope = ['--scope', 'src', '--scope', 'linked/file.txt'];
  assert.ok(reportHas(change(root, 'begin', 'edit', scope), 'unknown', 'declared_scope_unreachable', 'linked/file.txt'));
  assert.ok(reportHas(change(root, 'status'), 'unknown', 'declared_scope_unreachable', 'linked/file.txt'));
  put(root, 'outside.txt', 'outside scope\n');
  const report = change(root, 'check');
  assert.ok(reportHas(report, 'unknown', 'declared_scope_unreachable', 'linked/file.txt'));
  assert.ok(reportHas(report, 'violation', 'outside_declared_scope', 'outside.txt'));
});

test('rejects damaged state, preserves Git index bytes and reports hidden entries as a coverage limit', t => {
  const root = fixture(t);
  git(root, 'update-index', '--assume-unchanged', 'src/app.js');
  git(root, 'update-index', '--skip-worktree', 'src/old.js');
  const index = path.join(root, '.git', 'index');
  const original = readFileSync(index);
  change(root, 'begin', 'edit', ['--scope', 'src']);
  put(root, 'src/app.js', 'edit hidden by index\n');
  put(root, 'src/old.js', 'edit hidden by sparse index flag\n');
  put(root, 'src/中文 café.txt', 'visible CRLF\r\n');
  const report = change(root, 'check');
  assert.deepEqual(report.changes.map(item => item.path.normalize('NFC')), ['src/中文 café.txt']);
  assert.ok(report.limitations.includes('ignored_paths_and_hidden_index_entries_not_observed'));
  assert.deepEqual(readFileSync(index), original);
  const saved = '.repo-doctor/changes/edit.json';
  put(root, saved, 'null\n');
  for (const operation of ['begin', 'check', 'status']) {
    const result = run(root, ['change', operation, '--id', 'edit', '--json'], 1);
    assert.equal(result.stdout, '');
    assert.equal(JSON.parse(result.stderr).status, 'error');
  }
  assert.equal(readFileSync(path.join(root, saved), 'utf8'), 'null\n');
});

test('matches scope and protection aliases on case-insensitive filesystems', t => {
  const root = fixture(t);
  if (!existsSync(path.join(root, 'SRC/APP.JS'))) { t.skip('fixture filesystem is case-sensitive'); return; }
  const profile = JSON.parse(run(root, ['project', 'init', '--apply']).stdout).project;
  profile.change_guard = { schema_version: 1, protected_paths: ['SRC/APP.JS'] };
  if (process.platform !== 'win32') {
    symlinkSync('old.js', path.join(root, 'src/link'));
    profile.change_guard.protected_paths.push('SRC/LINK');
  }
  put(root, '.repo-doctor/project.json', JSON.stringify(profile));
  change(root, 'begin', 'edit', ['--scope', 'SRC']);
  rmSync(path.join(root, 'src/app.js'));
  if (process.platform !== 'win32') rmSync(path.join(root, 'src/link'));
  const report = change(root, 'check');
  assert.ok(reportHas(report, 'violation', 'protected_path_changed', 'src/app.js'));
  assert.equal(reportHas(report, 'violation', 'outside_declared_scope', 'src/app.js'), false);
  if (process.platform !== 'win32') assert.ok(reportHas(report, 'violation', 'protected_path_changed', 'src/link'));
});

test('observes a changed gitlink while distinguishing submodule-internal edits', t => {
  const root = fixture(t);
  const source = fixture(t);
  git(root, '-c', 'core.hooksPath=.unused-hooks', '-c', 'protocol.file.allow=always', 'submodule', 'add', '-q', source, 'vendor');
  git(root, '-c', 'core.hooksPath=.unused-hooks', 'commit', '-qm', 'add submodule');
  change(root, 'begin', 'edit', ['--scope', 'vendor']);
  const submodule = path.join(root, 'vendor');
  put(submodule, 'outside.txt', 'submodule edit\n');
  const internal = change(root, 'check');
  assert.deepEqual(internal.changes, []);
  assert.ok(internal.limitations.includes('submodule_internal_edits_not_observed'));
  git(submodule, 'add', 'outside.txt');
  git(submodule, '-c', 'commit.gpgSign=false', '-c', 'core.hooksPath=.unused-hooks',
    '-c', 'user.name=Guard Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'update submodule');
  const gitlink = change(root, 'check');
  assert.equal(gitlink.changes.find(item => item.path === 'vendor').origin, 'unknown');
  assert.ok(reportHas(gitlink, 'unknown', 'submodule_worktree_not_fingerprinted', 'vendor'));
});
