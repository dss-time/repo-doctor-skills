import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync,
  symlinkSync, chmodSync, realpathSync, renameSync, rmSync, lstatSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  installationStatePaths, readInstallationState, recordInstallation,
  treeDigest, inspectInstallations,
} from './installation-state.mjs';

// Every writable fixture is owned by this test run, outside source/user installs.
const createdRoots = [];
after(() => {
  for (const root of createdRoots) rmSync(root, { recursive: true, force: true });
});
function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'rd-installation-test-'));
  createdRoots.push(root);
  return { root, target: path.join(root, 'skills') };
}
function skill(target, slug, text = 'test') {
  mkdirSync(path.join(target, slug), { recursive: true });
  writeFileSync(path.join(target, slug, 'SKILL.md'), text);
}
function record(target, slugs, expectedRevision = 0) {
  return recordInstallation(target, {
    slugs, version: '1.2.3', language: 'en', expectedRevision,
  });
}
function inspect(targets, options = {}) {
  return inspectInstallations({ targets, ...options });
}

test('records outside target, preserves unselected entries, checks revision', () => {
  const { root, target } = fixture();
  skill(target, 'one');
  skill(target, 'two');
  const paths = installationStatePaths(target);
  assert.equal(paths.root, realpathSync(root));
  assert.equal(path.dirname(paths.ledger), '.');
  assert.equal(record(target, ['one']).revision, 1);
  assert.equal(record(target, ['two'], 1).revision, 2);
  assert.deepEqual(Object.keys(readInstallationState(target).entries), ['one', 'two']);
  assert.deepEqual(readdirSync(target).sort(), ['one', 'two']);
  assert.throws(() => record(target, ['one'], 0), /revision/i);
});

test('diagnosis distinguishes tracked changes; untracked stays unknown', () => {
  const { target } = fixture();
  skill(target, 'one');
  skill(target, 'two');
  record(target, ['one', 'two']);
  writeFileSync(path.join(target, 'one', 'SKILL.md'), 'changed');
  skill(target, 'three');
  const report = inspect([{ label: 'local', path: target }], {
    activeSlugs: ['one'], sourceRoot: target,
  });
  const rows = report.targets[0].records;
  assert.equal(rows.find(row => row.slug === 'one').content_state, 'modified');
  assert.equal(rows.find(row => row.slug === 'two').content_state, 'current');
  assert.equal(rows.find(row => row.slug === 'three').origin, 'unknown');
  assert.equal(rows.find(row => row.slug === 'three').content_state, 'unknown');
  assert.equal(rows.find(row => row.slug === 'three').source_content_state, 'same');
  assert.equal(JSON.stringify(report).includes('changed'), false);
});

test('migration and duplicate hints never confer name-based ownership', () => {
  const { root, target } = fixture();
  const second = path.join(root, 'second');
  skill(target, 'requirements-to-spec');
  skill(target, 'pdf-review-basic');
  skill(target, 'one', 'a');
  skill(second, 'one', 'b');
  const report = inspect([
    { label: 'a', path: target }, { label: 'b', path: second },
  ], { activeSlugs: ['one'] });
  const rows = report.targets[0].records;
  assert.deepEqual(rows.find(row => row.slug === 'requirements-to-spec'), {
    slug: 'requirements-to-spec',
    origin: 'unknown',
    content_state: 'unknown',
    reason: 'renamed',
    replacement: 'requirements-clarification',
  });
  assert.equal(rows.find(row => row.slug === 'pdf-review-basic').reason, 'removed');
  assert.equal(report.duplicates[0].content_state, 'different');
  assert.equal(report.duplicates[0].source_unknown, true);
  assert.equal(readFileSync(path.join(target, 'one', 'SKILL.md'), 'utf8'), 'a');
});

test('bad JSON/schema produces target warning and unknown ownership', () => {
  for (const invalid of ['broken', 'null', '{}']) {
    const { root, target } = fixture();
    skill(target, 'one');
    const { ledger } = installationStatePaths(target);
    writeFileSync(path.join(root, ledger), invalid);
    assert.throws(() => readInstallationState(target));
    const report = inspect([{ label: 'a', path: target }]);
    assert.equal(report.targets[0].ledger_status, 'invalid');
    assert.equal(report.targets[0].records[0].origin, 'unknown');
    assert.ok(report.targets[0].warnings.length);
  }
});

test('strict ledger validation rejects hostile fields and metadata', () => {
  const { root, target } = fixture();
  skill(target, 'one');
  const good = record(target, ['one']);
  const filename = path.join(root, installationStatePaths(target).ledger);
  const cases = [
    { ...good, revision: -1 },
    { ...good, extra: true },
    { ...good, entries: { '../escape': good.entries.one } },
    { ...good, entries: { one: { ...good.entries.one, extra: true } } },
    { ...good, entries: { one: { ...good.entries.one, digest: 'x' } } },
    { ...good, entries: { one: { ...good.entries.one, digest: `${'a'.repeat(64)}\n` } } },
    { ...good, entries: { one: { ...good.entries.one, source: 'other' } } },
    { ...good, entries: { one: { ...good.entries.one, version: 'latest' } } },
  ];
  for (const value of cases) {
    writeFileSync(filename, JSON.stringify(value));
    assert.throws(() => readInstallationState(target), /Invalid/);
  }
});

test('failed reads, requests and writes preserve previous ledger bytes', () => {
  const { root, target } = fixture();
  skill(target, 'one');
  record(target, ['one']);
  const filename = path.join(root, installationStatePaths(target).ledger);
  const previous = readFileSync(filename, 'utf8');
  assert.throws(() => record(target, ['one', 'missing'], 1));
  assert.equal(readFileSync(filename, 'utf8'), previous);
  assert.throws(() => record(target, ['../escape'], 1));
  assert.equal(readFileSync(filename, 'utf8'), previous);
  // Synthetic credential-shaped build metadata exercises shared write refusal.
  assert.throws(() => recordInstallation(target, {
    slugs: ['one'],
    version: `1.2.3+sk-${'x'.repeat(40)}`,
    language: 'en',
    expectedRevision: 1,
  }));
  assert.equal(readFileSync(filename, 'utf8'), previous);
  assert.ok(readdirSync(root).every(name => !name.endsWith('.tmp')));
});

test('digest includes names, bytes, empty directories and executable bits', () => {
  const { target } = fixture();
  skill(target, 'one');
  const directory = path.join(target, 'one');
  const original = treeDigest(directory);
  chmodSync(path.join(directory, 'SKILL.md'), 0o755);
  assert.notEqual(treeDigest(directory), original);
  const afterMode = treeDigest(directory);
  mkdirSync(path.join(directory, 'empty'));
  assert.notEqual(treeDigest(directory), afterMode);
  const afterDirectory = treeDigest(directory);
  writeFileSync(path.join(directory, 'SKILL.md'), 'changed');
  assert.notEqual(treeDigest(directory), afterDirectory);
  const afterBytes = treeDigest(directory);
  renameSync(path.join(directory, 'SKILL.md'), path.join(directory, 'renamed.md'));
  assert.notEqual(treeDigest(directory), afterBytes);
});

test('symlink targets, ledger and contents are never followed', () => {
  const { root, target } = fixture();
  const linked = path.join(root, 'linked');
  skill(target, 'one');
  symlinkSync(target, linked);
  assert.throws(() => installationStatePaths(linked), /symlink/i);
  assert.throws(() => treeDigest(linked));
  symlinkSync(path.join(target, 'one'), path.join(target, 'link'));
  assert.throws(() => record(target, ['link']));
  const report = inspect([{ label: 'a', path: target }]);
  const linkedRecord = report.targets[0].records.find(row => row.slug === 'link');
  assert.equal(linkedRecord.content_state, 'UNVERIFIED');
  symlinkSync(path.join(root, 'absent'), path.join(target, 'one', 'escape'));
  assert.throws(() => treeDigest(path.join(target, 'one')), /symlink/i);
  const { ledger } = installationStatePaths(target);
  symlinkSync(path.join(root, 'absent-ledger'), path.join(root, ledger));
  assert.throws(() => readInstallationState(target), /symlink/i);
});

test('special files are refused without opening them', () => {
  if (process.platform === 'win32') return;
  const { target } = fixture();
  skill(target, 'one');
  execFileSync('mkfifo', [path.join(target, 'one', 'fifo')]);
  assert.throws(() => treeDigest(path.join(target, 'one')), /special/i);
  assert.throws(() => record(target, ['one']), /special/i);
  const report = inspect([{ label: 'a', path: target }]);
  assert.equal(report.targets[0].records[0].content_state, 'UNVERIFIED');
});

test('inspection has zero filesystem writes, including absent paths', () => {
  const { root, target } = fixture();
  skill(target, 'one');
  record(target, ['one']);
  const before = treeDigest(root);
  inspect([
    { label: 'a', path: target },
    { label: 'missing', path: path.join(root, 'absent', 'skills') },
  ]);
  assert.equal(treeDigest(root), before);
  assert.deepEqual(readdirSync(root).sort(), [
    installationStatePaths(target).ledger, 'skills',
  ].sort());
});

test('root, home, escapes and malformed calls fail closed', () => {
  assert.throws(() => installationStatePaths(path.parse(process.cwd()).root));
  assert.throws(() => installationStatePaths(os.homedir()));
  const { root, target } = fixture();
  const traversal = `${path.join(root, 'x')}${path.sep}..${path.sep}skills`;
  assert.throws(() => installationStatePaths(traversal));
  assert.throws(() => recordInstallation(target, {
    slugs: ['a'], version: '1.2.3', language: 'bad', expectedRevision: 0,
  }));
});

test('tracked absence is missing; prototype names remain untracked', () => {
  const { root, target } = fixture();
  skill(target, 'one');
  const ledger = record(target, ['one']);
  ledger.entries.missing = ledger.entries.one;
  const paths = installationStatePaths(target);
  writeFileSync(path.join(root, paths.ledger), JSON.stringify(ledger));
  skill(target, 'constructor');
  const rows = inspect([{ label: 'a', path: target }]).targets[0].records;
  assert.equal(rows.find(row => row.slug === 'missing').content_state, 'missing');
  assert.equal(rows.find(row => row.slug === 'constructor').origin, 'unknown');
});

test('unsafe duplicates are UNVERIFIED; identical content is same', () => {
  const { root, target } = fixture();
  const second = path.join(root, 'second');
  skill(target, 'one');
  skill(second, 'one');
  const targets = [{ label: 'a', path: target }, { label: 'b', path: second }];
  let report = inspect(targets);
  assert.equal(report.duplicates[0].content_state, 'same');
  symlinkSync(path.join(root, 'missing'), path.join(second, 'one', 'escape'));
  report = inspect(targets);
  assert.equal(report.duplicates[0].content_state, 'UNVERIFIED');
  assert.equal(report.duplicates[0].source_unknown, true);
});

test('unsafe ledger cannot conceal real unknown Skill directories', () => {
  const { root, target } = fixture();
  skill(target, 'one');
  const paths = installationStatePaths(target);
  symlinkSync(path.join(root, 'elsewhere'), path.join(root, paths.ledger));
  const result = inspect([{ label: 'a', path: target }]).targets[0];
  assert.equal(result.ledger_status, 'invalid');
  assert.equal(result.records[0].slug, 'one');
  assert.equal(result.records[0].origin, 'unknown');
});

test('SemVer accepts releases/prerelease/build and rejects malformed versions', () => {
  const { root, target } = fixture();
  skill(target, 'one');
  let revision = 0;
  const versions = ['0.0.0', '1.2.3', '1.2.3-alpha.1', '1.2.3-0+build.01'];
  for (const version of versions) {
    recordInstallation(target, {
      slugs: ['one'], version, language: 'bilingual', expectedRevision: revision,
    });
    revision += 1;
  }
  const filename = path.join(root, installationStatePaths(target).ledger);
  const previous = readFileSync(filename, 'utf8');
  const invalid = [
    'v1.2.3', 'latest', '1.2', '01.2.3', '1.2.3-01',
    '1.2.3+', '1.2.3-', '1.2.3-a..b', '1.2.3\n',
  ];
  for (const version of invalid) {
    assert.throws(() => recordInstallation(target, {
      slugs: ['one'], version, language: 'en', expectedRevision: revision,
    }), /Invalid/);
    assert.equal(readFileSync(filename, 'utf8'), previous);
  }
});

test('receipt commit failure rolls back the whole install and preserves the previous receipt', async () => {
  const { install } = await import('./install.mjs');
  const filesystem = await import('node:fs');
  const { syncBuiltinESMExports } = await import('node:module');
  const { target } = fixture();
  await install({ target });
  writeFileSync(path.join(target, 'safe-code-review', 'custom.txt'), 'user modification');
  const originalTree = treeDigest(target);
  const paths = installationStatePaths(target);
  const receipt = path.join(paths.root, paths.ledger);
  const originalReceipt = readFileSync(receipt);
  const originalRename = filesystem.default.renameSync;
  filesystem.default.renameSync = (from, to) => {
    if (to === receipt) throw new Error('injected receipt commit failure');
    return originalRename(from, to);
  };
  syncBuiltinESMExports();
  try {
    await assert.rejects(install({ preset: 'full', target }), /previous Skills restored/);
  } finally {
    filesystem.default.renameSync = originalRename;
    syncBuiltinESMExports();
  }
  assert.equal(treeDigest(target), originalTree);
  assert.deepEqual(readFileSync(receipt), originalReceipt);
});

test('physical target aliases do not create duplicate installation reports', () => {
  const { root, target } = fixture();
  skill(target, 'one');
  record(target, ['one']);
  const aliasParent = path.join(root, 'parent-alias');
  symlinkSync(root, aliasParent, 'dir');
  const report = inspect([
    { label: 'actual', path: target },
    { label: 'alias', path: path.join(aliasParent, 'skills') },
  ]);
  assert.deepEqual(report.duplicates, []);
  assert.equal(report.targets[1].alias_of, 'actual');
});

test('case aliases share a receipt on case-insensitive filesystems', t => {
  const { root, target } = fixture();
  skill(target, 'one');
  const upper = path.join(root, 'SKILLS');
  try { if (!lstatSync(upper).isDirectory()) return t.skip('case-sensitive filesystem'); }
  catch (error) { if (error.code === 'ENOENT') return t.skip('case-sensitive filesystem'); throw error; }
  record(target, ['one']);
  assert.equal(readInstallationState(upper).target_name, 'skills');
  assert.equal(record(upper, ['one'], 1).revision, 2);
  assert.equal(readInstallationState(target).revision, 2);
});

test('Unicode path aliases share the same receipt and lock when supported', t => {
  const { root } = fixture();
  const target = path.join(root, 'café-skills');
  const alias = path.join(root, 'cafe\u0301-skills');
  skill(target, 'one');
  try { lstatSync(alias); }
  catch (error) { if (error.code === 'ENOENT') return t.skip('normalization-sensitive filesystem'); throw error; }
  assert.deepEqual(installationStatePaths(target), installationStatePaths(alias));
  record(target, ['one']);
  assert.equal(record(alias, ['one'], 1).revision, 2);
  assert.equal(readInstallationState(target).revision, 2);
});
