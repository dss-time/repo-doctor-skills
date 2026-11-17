import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { initProject } from './project-state.mjs';

test('init preview has no write effects and apply is repeatable', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'rd-state-test-'));
  try {
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ scripts: { test: 'node test.mjs' } }));
    const preview = await initProject(root);
    assert.equal(preview.applied, false);
    assert.equal(existsSync(path.join(root, '.repo-doctor')), false);
    const applied = await initProject(root, { apply: true });
    const original = readFileSync(path.join(root, '.repo-doctor/project.json'), 'utf8');
    assert.equal(applied.applied, true);
    await initProject(root, { apply: true });
    assert.equal(readFileSync(path.join(root, '.repo-doctor/project.json'), 'utf8'), original);
    assert.equal(original.includes('node test.mjs'), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

import { mkdirSync, symlinkSync, cpSync, readdirSync } from 'node:fs';
import { refreshProject, checkProject, createProjectTask, saveProjectTask, listProjectTasks, resumeProjectTask } from './project-state.mjs';

async function fixture(run) {
  const root = mkdtempSync(path.join(tmpdir(), 'rd-state-test-'));
  try {
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ scripts: { test: 'node test.mjs' } }));
    writeFileSync(path.join(root, 'README.md'), 'fixture');
    await initProject(root, { apply: true });
    await run(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
const create = (root, id = 'local-task') => createProjectTask(root, {
  id, goal: 'Private task description', acceptance: ['behavior'], skill: 'feature-implementation',
});
const content = (root, relative = '.repo-doctor/tasks/local-task.json') => readFileSync(path.join(root, relative), 'utf8');

test('config reports relative drift and rejects malformed state and unknown fields', () => fixture(async root => {
  assert.equal((await checkProject(root)).status, 'CURRENT');
  writeFileSync(path.join(root, 'README.md'), 'changed');
  const stale = await checkProject(root);
  assert.equal(stale.status, 'STALE');
  assert.deepEqual(stale.changed_paths, ['README.md']);
  const filename = path.join(root, '.repo-doctor/project.json');
  const original = content(root, '.repo-doctor/project.json');
  writeFileSync(filename, '{broken');
  await assert.rejects(checkProject(root), /Invalid .*JSON|Invalid JSON/);
  await assert.rejects(initProject(root, { apply: true }));
  assert.equal(readFileSync(filename, 'utf8'), '{broken');
  writeFileSync(filename, JSON.stringify({ ...JSON.parse(original), extra: true }));
  await assert.rejects(checkProject(root), /fields/);
}));

test('task creation requires init, valid IDs and existing registry identities', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'rd-state-test-'));
  try {
    await assert.rejects(create(root), /not initialized/);
    await initProject(root, { apply: true });
    for (const id of ['../escape', 'Uppercase', 'a'.repeat(65), 'two--hyphens', '']) {
      await assert.rejects(create(root, id), /Invalid task ID/);
    }
    await assert.rejects(createProjectTask(root, { id: 'unknown', goal: 'g', acceptance: ['a'], skill: 'unknown' }), /Unknown/);
    const saved = await create(root);
    assert.equal(saved.revision, 1);
    assert.equal(saved.requires_host_revalidation, true);
    await assert.rejects(create(root), /already exists/);
    const listed = await listProjectTasks(root);
    assert.deepEqual(listed.tasks, [{ id: 'local-task', revision: 1, skill: 'feature-implementation', workflow: null }]);
    assert.equal(JSON.stringify(listed).includes('Private task description'), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('save preserves raw context/history, checks revisions and rejects invalid contexts atomically', () => fixture(async root => {
  const created = await create(root);
  const context = structuredClone(created.context);
  context.steps.task.status = 'running';
  context.steps.task.attempts = 1;
  context.history.push({ event: 'original-history' });
  context.next_actions.push({ type: 'data-only' });
  context.scope.files = ['README.md'];
  const saved = await saveProjectTask(root, { id: created.id, context, expectedRevision: 1 });
  assert.equal(saved.revision, 2);
  assert.equal(saved.context.steps.task.status, 'running');
  assert.deepEqual(saved.context.history, context.history);
  const original = content(root);
  await assert.rejects(saveProjectTask(root, { id: created.id, context, expectedRevision: 1 }), /revision conflict/);
  for (const invalid of [{ ...context, id: 'another' }, { ...context, schema_version: 1 }, { ...context, grants: {} }, { ...context, steps: {} }]) {
    await assert.rejects(saveProjectTask(root, { id: created.id, context: invalid, expectedRevision: 2 }));
    assert.equal(content(root), original);
  }
  const resumed = await resumeProjectTask(root, { id: created.id });
  assert.equal(resumed.context.steps.task.status, 'interrupted');
  assert.deepEqual(resumed.context.next_actions, []);
  assert.equal(resumed.requires_host_revalidation, true);
  assert.equal(resumed.status, 'UNKNOWN');
  assert.equal(content(root), original);
  writeFileSync(path.join(root, 'README.md'), 'dependency changed');
  const stale = await resumeProjectTask(root, { id: created.id });
  assert.equal(stale.status, 'STALE');
  assert.deepEqual(stale.changed_paths, ['README.md']);
}));

test('dependencies record directories and evidence without treating receipts as authority', () => fixture(async root => {
  mkdirSync(path.join(root, 'src'));
  writeFileSync(path.join(root, 'src/a.txt'), 'a');
  const task = await create(root);
  task.context.scope.files = ['src'];
  task.context.evidence.push({ id: 'fake-receipt', dependencies: ['src'], coverage_complete: true, result: 'pass', receipt: { claim: 'not trusted' } });
  const saved = await saveProjectTask(root, { id: task.id, context: task.context, expectedRevision: 1 });
  assert.equal(saved.dependencies[0].path, 'src');
  assert.equal((await resumeProjectTask(root, { id: task.id })).status, 'UNKNOWN');
  writeFileSync(path.join(root, 'src/new.txt'), 'new member');
  const resumed = await resumeProjectTask(root, { id: task.id });
  assert.equal(resumed.status, 'STALE');
  assert.deepEqual(resumed.changed_paths, ['src']);
}));

test('bad records and sensitive inputs are rejected without replacing original bytes', () => fixture(async root => {
  const task = await create(root);
  const original = content(root);
  const sensitive = 'sk-' + 'A'.repeat(40);
  task.context.goal = sensitive;
  await assert.rejects(saveProjectTask(root, { id: task.id, context: task.context, expectedRevision: 1 }), error => {
    assert.equal(error.message.includes(sensitive), false);
    return /credentials/.test(error.message);
  });
  assert.equal(content(root), original);
  writeFileSync(path.join(root, '.repo-doctor/tasks/local-task.json'), '{broken');
  await assert.rejects(listProjectTasks(root));
  await assert.rejects(resumeProjectTask(root, { id: task.id }));
  await assert.rejects(saveProjectTask(root, { id: task.id, context: JSON.parse(original).context, expectedRevision: 1 }));
  assert.equal(content(root), '{broken');
}));

test('root binding rejects copied project and task identity mismatch', () => fixture(async root => {
  await create(root);
  const other = mkdtempSync(path.join(tmpdir(), 'rd-state-other-'));
  try {
    cpSync(path.join(root, '.repo-doctor'), path.join(other, '.repo-doctor'), { recursive: true });
    await assert.rejects(checkProject(other), /root binding/);
    await assert.rejects(listProjectTasks(other), /root binding/);
    const filename = path.join(root, '.repo-doctor/tasks/local-task.json');
    const record = JSON.parse(content(root));
    record.project_id = 'different';
    writeFileSync(filename, JSON.stringify(record));
    await assert.rejects(resumeProjectTask(root, { id: 'local-task' }), /identity/);
  } finally { rmSync(other, { recursive: true, force: true }); }
}));

test('all discovered paths reject symlinks, escaping dependencies and unexpected task entries', () => fixture(async root => {
  const task = await create(root);
  const original = content(root);
  task.context.scope.files = ['../escape'];
  await assert.rejects(saveProjectTask(root, { id: task.id, context: task.context, expectedRevision: 1 }), /relative path/);
  symlinkSync(path.join(root, 'README.md'), path.join(root, 'linked'));
  task.context.scope.files = ['linked'];
  await assert.rejects(saveProjectTask(root, { id: task.id, context: task.context, expectedRevision: 1 }), /symlink/);
  assert.equal(content(root), original);
  symlinkSync(path.join(root, 'README.md'), path.join(root, '.repo-doctor/tasks/linked.json'));
  await assert.rejects(listProjectTasks(root), /symlink/);
}));

test('init rejects a linked state directory and lock is never automatically removed', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'rd-state-test-'));
  const target = mkdtempSync(path.join(tmpdir(), 'rd-state-target-'));
  try {
    symlinkSync(target, path.join(root, '.repo-doctor'));
    await assert.rejects(initProject(root), /symlink/);
    assert.deepEqual(readdirSync(target), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(target, { recursive: true, force: true });
  }
  await fixture(async root => {
    mkdirSync(path.join(root, '.repo-doctor/project.lock'));
    await assert.rejects(create(root), /busy/);
    assert.equal(existsSync(path.join(root, '.repo-doctor/project.lock')), true);
  });
});

test('config path injection and discovered source links fail closed', () => fixture(async root => {
  const filename = path.join(root, '.repo-doctor/project.json');
  const original = JSON.parse(content(root, '.repo-doctor/project.json'));
  writeFileSync(filename, JSON.stringify({ ...original, documents: ['../outside'] }));
  await assert.rejects(checkProject(root), /document path/);
  writeFileSync(filename, JSON.stringify(original));
  rmSync(path.join(root, 'README.md'));
  symlinkSync('/etc/hosts', path.join(root, 'README.md'));
  await assert.rejects(checkProject(root), /symlink/);
}));

test('task enumeration rejects directories and storage directory links', () => fixture(async root => {
  await create(root);
  mkdirSync(path.join(root, '.repo-doctor/tasks/directory.json'));
  await assert.rejects(listProjectTasks(root), /regular JSON file/);
  rmSync(path.join(root, '.repo-doctor/tasks/directory.json'), { recursive: true });
  writeFileSync(path.join(root, '.repo-doctor/tasks/unrecognized.txt'), 'not a task');
  await assert.rejects(listProjectTasks(root), /Unexpected entry/);
  rmSync(path.join(root, '.repo-doctor/tasks'), { recursive: true });
  symlinkSync(root, path.join(root, '.repo-doctor/tasks'));
  await assert.rejects(listProjectTasks(root), /symlink/);
}));

test('sensitive create and imported JSON do not reveal sensitive values or replace checkpoints', () => fixture(async root => {
  const sensitive = 'ghp_' + 'A'.repeat(40);
  await assert.rejects(createProjectTask(root, { id: 'sensitive', goal: sensitive, acceptance: ['a'], skill: 'feature-implementation' }), error => {
    assert.equal(error.message.includes(sensitive), false);
    return /credentials/.test(error.message);
  });
  assert.equal(existsSync(path.join(root, '.repo-doctor/tasks/sensitive.json')), false);
  const task = await create(root);
  const filename = path.join(root, '.repo-doctor/tasks/local-task.json');
  const record = JSON.parse(content(root));
  record.context.goal = sensitive;
  const imported = JSON.stringify(record);
  writeFileSync(filename, imported);
  await assert.rejects(resumeProjectTask(root, { id: task.id }), error => {
    assert.equal(error.message.includes(sensitive), false);
    return /credentials/.test(error.message);
  });
  assert.equal(content(root), imported);
}));

test('refresh previews without writes then rediscovers sources using an explicit revision', () => fixture(async root => {
  const original = content(root, '.repo-doctor/project.json');
  const identity = JSON.parse(original).id;
  writeFileSync(path.join(root, 'package.json'), JSON.stringify({ scripts: { build: 'do not execute' } }));
  writeFileSync(path.join(root, 'Cargo.toml'), '[package]\nname = "fixture"');
  writeFileSync(path.join(root, 'GLOSSARY.md'), 'Vocabulary');
  const preview = await refreshProject(root);
  assert.equal(preview.status, 'PREVIEW');
  assert.equal(preview.applied, false);
  assert.equal(preview.expectedRevision, 1);
  assert.equal(preview.project.revision, 2);
  assert.equal(preview.project.id, identity);
  assert.deepEqual(preview.project.commands, [{ manager: 'npm', script: 'build' }]);
  assert.equal(preview.project.documents.includes('GLOSSARY.md'), true);
  assert.equal(content(root, '.repo-doctor/project.json'), original);
  assert.equal((await checkProject(root)).status, 'STALE');
  await assert.rejects(refreshProject(root, { apply: true }), /Expected revision/);
  await assert.rejects(refreshProject(root, { apply: true, expectedRevision: 2 }), /revision conflict/);
  assert.equal(content(root, '.repo-doctor/project.json'), original);
  const refreshed = await refreshProject(root, { apply: true, expectedRevision: 1 });
  assert.equal(refreshed.project.revision, 2);
  assert.equal(refreshed.project.id, identity);
  assert.equal(refreshed.project.root_binding, JSON.parse(original).root_binding);
  assert.equal((await checkProject(root)).status, 'CURRENT');
  const saved = content(root, '.repo-doctor/project.json');
  await assert.rejects(refreshProject(root, { apply: true, expectedRevision: 1 }), /revision conflict/);
  assert.equal(content(root, '.repo-doctor/project.json'), saved);
  mkdirSync(path.join(root, '.repo-doctor/project.lock'));
  await assert.rejects(refreshProject(root, { apply: true, expectedRevision: 2 }), /busy/);
  assert.equal(content(root, '.repo-doctor/project.json'), saved);
  assert.equal(existsSync(path.join(root, '.repo-doctor/project.lock')), true);
}));

test('refresh never replaces invalid config or overflows revision', () => fixture(async root => {
  const filename = path.join(root, '.repo-doctor/project.json');
  const original = JSON.parse(content(root, '.repo-doctor/project.json'));
  for (const config of [{ ...original, extra: true }, { ...original, revision: Number.MAX_SAFE_INTEGER + 1 }]) {
    const invalid = JSON.stringify(config);
    writeFileSync(filename, invalid);
    await assert.rejects(refreshProject(root, { apply: true, expectedRevision: 1 }));
    assert.equal(content(root, '.repo-doctor/project.json'), invalid);
  }
  const maximum = JSON.stringify({ ...original, revision: Number.MAX_SAFE_INTEGER });
  writeFileSync(filename, maximum);
  await assert.rejects(refreshProject(root), /overflow/);
  await assert.rejects(refreshProject(root, { apply: true, expectedRevision: Number.MAX_SAFE_INTEGER }), /overflow/);
  assert.equal(content(root, '.repo-doctor/project.json'), maximum);
}));

test('non-Node manifests are fingerprinted without inferring executable commands', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'rd-state-test-'));
  try {
    const sources = ['CMakeLists.txt', 'Makefile', 'Cargo.toml', 'Cargo.lock', 'go.mod', 'go.sum', 'pyproject.toml', 'requirements.txt'];
    for (const source of sources) writeFileSync(path.join(root, source), 'fixture metadata');
    const initialized = await initProject(root, { apply: true });
    assert.deepEqual(initialized.project.commands, []);
    for (const source of sources) {
      assert.notEqual(initialized.project.sources.find(item => item.path === source).fingerprint, 'missing');
    }
    writeFileSync(path.join(root, 'go.mod'), 'changed');
    assert.deepEqual((await checkProject(root)).changed_paths, ['go.mod']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('registry drift returns stale migration information without restoring or saving historical context', () => fixture(async root => {
  const task = await create(root);
  const filename = path.join(root, '.repo-doctor/tasks/local-task.json');
  const record = JSON.parse(content(root));
  record.context.registry_binding = 'a'.repeat(64);
  record.context.steps.task.status = 'running';
  const historical = JSON.stringify(record);
  writeFileSync(filename, historical);
  const resumed = await resumeProjectTask(root, { id: task.id });
  assert.equal(resumed.status, 'STALE');
  assert.equal(resumed.registry_changed, true);
  assert.equal(resumed.needs_migration, true);
  assert.equal(resumed.context, null);
  assert.equal(resumed.source_context, '.repo-doctor/tasks/local-task.json');
  assert.equal(resumed.requires_host_revalidation, true);
  assert.equal((await listProjectTasks(root)).tasks[0].id, task.id);
  await assert.rejects(saveProjectTask(root, { id: task.id, context: record.context, expectedRevision: 1 }), /Registry changed/);
  assert.equal(content(root), historical);
  record.context.scope = null;
  writeFileSync(filename, JSON.stringify(record));
  await assert.rejects(resumeProjectTask(root, { id: task.id }), /scope/);
}));

test('task revision overflow and unsafe expected revisions never replace records', () => fixture(async root => {
  const task = await create(root);
  const filename = path.join(root, '.repo-doctor/tasks/local-task.json');
  const record = JSON.parse(content(root));
  record.revision = Number.MAX_SAFE_INTEGER;
  writeFileSync(filename, JSON.stringify(record));
  const original = content(root);
  await assert.rejects(saveProjectTask(root, { id: task.id, context: record.context, expectedRevision: Number.MAX_SAFE_INTEGER }), /overflow/);
  await assert.rejects(saveProjectTask(root, { id: task.id, context: record.context, expectedRevision: Number.MAX_SAFE_INTEGER + 1 }), /Expected revision/);
  assert.equal(content(root), original);
  record.revision = Number.MAX_SAFE_INTEGER + 1;
  writeFileSync(filename, JSON.stringify(record));
  await assert.rejects(resumeProjectTask(root, { id: task.id }), /identity/);
}));

test('applied init creates private local ignore rules once and preserves user rules', () => fixture(async root => {
  const ignore = path.join(root, '.repo-doctor/.gitignore');
  assert.equal(readFileSync(ignore, 'utf8'), '*\n');
  const { statSync } = await import('node:fs');
  assert.equal(statSync(ignore).mode & 0o777, 0o600);
  const first = statSync(ignore);
  await initProject(root, { apply: true });
  assert.equal(statSync(ignore).mtimeMs, first.mtimeMs);
  writeFileSync(ignore, '*\n!project.json\n');
  await initProject(root, { apply: true });
  assert.equal(readFileSync(ignore, 'utf8'), '*\n!project.json\n');
  assert.equal(existsSync(path.join(root, '.gitignore')), false);
}));

test('existing false, zero, empty-string and null profiles are never overwritten', () => fixture(async root => {
  const filename = path.join(root, '.repo-doctor/project.json');
  for (const value of [false, 0, '', null]) {
    const original = JSON.stringify(value);
    writeFileSync(filename, original);
    await assert.rejects(initProject(root, { apply: true }), /Invalid project/);
    assert.equal(readFileSync(filename, 'utf8'), original);
  }
}));

test('oversized checkpoint updates preserve the prior readable record', () => fixture(async root => {
  const task = await create(root);
  const original = content(root);
  task.context.goal = 'x'.repeat(4 * 1024 * 1024);
  await assert.rejects(saveProjectTask(root, { id: task.id, context: task.context, expectedRevision: 1 }), /size limit/);
  assert.equal(content(root), original);
  assert.equal((await resumeProjectTask(root, { id: task.id })).revision, 1);
}));

test('JSON read/write limits match and decoded credential patterns are never returned', () => fixture(async root => {
  const { readJson, writeJson, maxStateBytes } = await import('./local-state-files.mjs');
  const exact = 'x'.repeat(maxStateBytes - 3);
  writeJson(root, 'limit.json', exact);
  assert.equal(readJson(root, 'limit.json'), exact);
  assert.throws(() => writeJson(root, 'limit.json', exact + 'x'), /size limit/);
  assert.equal(readJson(root, 'limit.json'), exact);
  const escapedToken = '{"value":"\\u0073k-' + 'x'.repeat(40) + '"}';
  writeFileSync(path.join(root, 'escaped.json'), escapedToken);
  assert.throws(() => readJson(root, 'escaped.json'), /possible credentials/);
  writeFileSync(path.join(root, 'escaped.json'), '{"pass\\u0077ord":"not-for-output"}');
  assert.throws(() => readJson(root, 'escaped.json'), /possible credentials/);
}));

test('project setup refuses filesystem roots before discovery or writes', async () => {
  await assert.rejects(initProject(path.parse(process.cwd()).root, { apply: true }), /filesystem root/);
});

test('later checkpoints retain prior history and immutable observations', () => fixture(async root => {
  const task = await create(root);
  task.context.history.push({ sequence: 1, stage: 'task', status: 'pending', reason: 'original observation' });
  task.context.evidence.push({ id: 'original-observation', dependencies: ['README.md'], result: 'fail' });
  const saved = await saveProjectTask(root, { id: task.id, context: task.context, expectedRevision: 1 });
  const original = content(root);
  const withoutHistory = structuredClone(saved.context);
  withoutHistory.history = [];
  await assert.rejects(saveProjectTask(root, { id: task.id, context: withoutHistory, expectedRevision: 2 }), /history/);
  const withoutEvidence = structuredClone(saved.context);
  withoutEvidence.evidence = [];
  await assert.rejects(saveProjectTask(root, { id: task.id, context: withoutEvidence, expectedRevision: 2 }), /evidence/);
  assert.equal(content(root), original);
  saved.context.history.push({ sequence: 2, stage: 'task', status: 'pending', reason: 'later observation' });
  assert.equal((await saveProjectTask(root, { id: task.id, context: saved.context, expectedRevision: 2 })).revision, 3);
}));
