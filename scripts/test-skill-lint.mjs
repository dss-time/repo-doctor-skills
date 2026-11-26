import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(new URL('../bin/repo-doctor-skills.mjs', import.meta.url));
function fixture(t) {
  const cwd = mkdtempSync(path.join(tmpdir(), 'rd-skill-lint-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  return {
    cwd,
    put(directory, content) {
      const dir = path.join(cwd, directory);
      mkdirSync(dir, { recursive: true });
      const file = path.join(dir, 'SKILL.md');
      writeFileSync(file, content);
      return file;
    },
    run(...args) {
      return spawnSync(process.execPath, [bin, 'skills', 'lint', ...args], { cwd, encoding: 'utf8' });
    },
  };
}
const skill = (name, description, body = '# Instructions\nExplain the findings.', extra = '') =>
  '---\nname: ' + name + '\ndescription: ' + JSON.stringify(description) + '\n' + extra + '---\n' + body + '\n';

test('lints a standalone SKILL.md and parses standard YAML without repository metadata', t => {
  const { put, run } = fixture(t);
  const source = '\uFEFF---\r\n"name": standalone\r\ndescription: >-\r\n  Review a supplied design\r\n  and summarize key feedback.\r\nmetadata: { version: "1.0", team: example }\r\n---\r\nSummarize the supplied notes.\r\n';
  const file = put('standalone', source);
  const result = run('standalone/SKILL.md', '--json');
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.summary.files, 1);
  assert.deepEqual(report.diagnostics, []);
  assert.equal(readFileSync(file, 'utf8'), source);
});

test('recursively reports explicit trigger overlaps and similar descriptions, once per pair', t => {
  const { put, run } = fixture(t);
  put('catalog/.agents/first', skill('first', 'Analyze database migration safety and schema rollback coverage.', undefined,
    'triggers: [review migrations]\n'));
  put('catalog/second', skill('second', 'Analyze database migration safety and schema rollback coverage for teams.'));
  put('other/third', skill('third', 'Draft a conference talk outline.', undefined,
    'triggers: "Review Migrations!"\n'));
  put('catalog/node_modules/ignored', 'not a Skill');
  const result = run('other', 'catalog', 'catalog/second/SKILL.md', '--json');
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.summary, { files: 3, errors: 0, warnings: 2 });
  assert.deepEqual(report.diagnostics.map(({ path, related_path, severity, rule_id }) => ({ path, related_path, severity, rule_id })), [
    { path: 'catalog/second/SKILL.md', related_path: 'catalog/.agents/first/SKILL.md', severity: 'warning', rule_id: 'routing.description-overlap' },
    { path: 'other/third/SKILL.md', related_path: 'catalog/.agents/first/SKILL.md', severity: 'warning', rule_id: 'routing.trigger-overlap' },
  ]);
  assert.ok(report.diagnostics.every(item => item.suggestion.length));
  assert.equal(run('catalog/second/SKILL.md', 'catalog', 'other', '--json').stdout, result.stdout);
});

test('reports frontmatter errors in JSON and exits nonzero without leaking document content', t => {
  const { put, run } = fixture(t);
  put('absent', 'No frontmatter.');
  put('invalid', '---\nname: invalid\nname: another\nsecret: do-not-echo-this-content\n---\n');
  put('fields', '---\nname: Bad_Name\ndescription: [not, a, scalar]\n---\n');
  const result = run('--json');
  assert.equal(result.status, 1);
  assert.equal(result.stderr, '');
  const report = JSON.parse(result.stdout);
  assert.equal(report.schema_version, 1);
  assert.deepEqual(report.summary, { files: 3, errors: 4, warnings: 0 });
  assert.deepEqual(report.diagnostics.map(item => item.rule_id),
    ['frontmatter.missing', 'frontmatter.description', 'frontmatter.name', 'frontmatter.invalid']);
  assert.doesNotMatch(result.stdout, /do-not-echo-this-content/);
  assert.match(run().stdout, /Scanned 3 SKILL\.md file\(s\): 4 error/);
});

test('flags budgets and unbounded effects, while recognizing explicit limits', t => {
  const { put, run } = fixture(t);
  put('oversized', skill('oversized', 'Detail '.repeat(160).trim(), [
    'Write files into the repository.', '',
    'Execute shell commands.', '',
    'Fetch external URLs.', '',
    '参考资料'.repeat(1300),
  ].join('\n')));
  put('bounded', skill('bounded', 'Carry out a maintenance request.', [
    'Write files only within the approved directory.',
    'Run shell commands only after explicit approval.',
    'Do not access the network.',
  ].join('\n')));
  const result = run('--json');
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.diagnostics.map(item => item.rule_id), [
    'boundary.file-write', 'boundary.network', 'boundary.shell', 'budget.body', 'budget.description',
  ]);
  assert.ok(report.diagnostics.every(item => item.path === 'oversized/SKILL.md' && item.severity === 'warning'));
});

test('terminal output prioritizes errors and routing, groups paths and summarizes boundary warnings', t => {
  const { put, run } = fixture(t);
  put('broken', '---\nname: Bad_Name\ndescription: []\n---\n');
  put('alpha', skill('alpha', 'Summarize meeting feedback.', 'Write files into the repository.', 'triggers: [review notes]\n'));
  put('beta', skill('beta', 'Detail '.repeat(160).trim(), [
    'Write files into the repository.', '', 'Execute shell commands.', '', '参考资料'.repeat(1300),
  ].join('\n'), 'triggers: [review notes]\n'));
  put('wrong-directory', skill('other-name', 'Read a specific input.'));

  const result = run();
  assert.equal(result.status, 1, result.stderr);
  const lines = result.stdout.trimEnd().split('\n');
  assert.equal(lines[0], 'Scanned 4 SKILL.md file(s): 2 error(s), 7 warning(s) (1 routing, 2 budget, 3 boundary, 1 other)');
  const headings = ['Errors', 'Routing & Budget Warnings', 'Other Warnings', 'Boundary Warnings'];
  assert.deepEqual(lines.filter(line => headings.includes(line)), headings);

  const errors = lines.slice(lines.indexOf('Errors'), lines.indexOf('Routing & Budget Warnings')).join('\n');
  assert.equal(errors.match(/"broken\/SKILL\.md"/g)?.length, 1);
  assert.match(errors, /\[frontmatter\.description\]/);
  assert.match(errors, /\[frontmatter\.name\]/);
  const important = lines.slice(lines.indexOf('Routing & Budget Warnings'), lines.indexOf('Other Warnings')).join('\n');
  assert.equal(important.match(/"beta\/SKILL\.md"/g)?.length, 1);
  assert.match(important, /Body has 5 lines and about \d+ tokens/);
  assert.match(important, /Description exceeds 1,024 characters/);
  assert.match(important, /Related: "alpha\/SKILL\.md"/);
  assert.match(result.stdout, /\[frontmatter\.directory-name\]/);
  assert.deepEqual(lines.filter(line => /^\s+"[^"]+\/SKILL\.md" \[/.test(line)).map(line => line.trim()), [
    '"alpha/SKILL.md" [file-write]',
    '"beta/SKILL.md" [file-write, shell]',
  ]);
  assert.equal(lines.filter(line => line.includes('trusted third-party')).length, 1);
  assert.doesNotMatch(result.stdout, /State which paths|State which commands/);

  const json = run('--json');
  assert.equal(json.status, result.status);
  const report = JSON.parse(json.stdout);
  assert.deepEqual(report.summary, { files: 4, errors: 2, warnings: 7 });
  assert.equal(report.diagnostics.filter(item => item.rule_id === 'boundary.file-write'
    && item.suggestion === 'State which paths may be changed and when user approval is required.').length, 2);
});

test('handles input errors, ignores discovered links and never installs or executes a Skill', t => {
  const { cwd, put, run } = fixture(t);
  const file = put('real', skill('real', 'Read a specific input.'));
  if (process.platform !== 'win32') symlinkSync(file, path.join(cwd, 'SKILL.md'));
  const report = JSON.parse(run('--json').stdout);
  assert.equal(report.summary.files, 1);
  const missing = run('--json', 'missing');
  assert.equal(missing.status, 1);
  assert.equal(JSON.parse(missing.stdout).diagnostics[0].rule_id, 'input.unreadable');
  mkdirSync(path.join(cwd, 'empty'));
  assert.equal(JSON.parse(run('empty', '--json').stdout).diagnostics[0].rule_id, 'input.no-skills');
  assert.equal(run('--unsupported').status, 2);
});
