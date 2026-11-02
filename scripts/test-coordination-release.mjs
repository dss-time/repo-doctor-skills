import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { liveEvidenceBinding } from './live-evidence-binding.mjs';
import { inspectCoordinationRelease } from './check-coordination-release.mjs';
const version = '0.9.0-beta.1';
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'rd-candidate-gate-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const names = ['documentation-sync','test-gap-analysis','safe-test-implementation','safe-code-review'];
  mkdirSync(path.join(root, 'packs/engineering/demo'), { recursive: true });
  writeFileSync(path.join(root, 'packs/engineering/demo/pack.yaml'), `id: engineering.demo\nstatus: beta\nskills: [${names.join(', ')}]\n`);
  const hashes = {};
  for (const name of names) {
    const pack = path.join(root, 'packs/engineering/demo/skills', name); mkdirSync(pack, { recursive: true });
    writeFileSync(path.join(pack, 'skill.yaml'), `id: demo.${name}\nstatus: beta\npermissions:\n  run_shell_commands: ${['documentation-sync','safe-test-implementation'].includes(name)}\n`);
    const body = `name: ${name}\n`; const installed = path.join(root, 'skills', name); mkdirSync(installed, { recursive: true }); writeFileSync(path.join(installed, 'SKILL.md'), body);
    hashes[name] = createHash('sha256').update(body).digest('hex');
  }
  const verdict = JSON.stringify({ verdict: 'clear', axes: { conformance: 'checked', intent: 'checked', safety: 'checked' }, findings: [], summary: 'Synthetic contract fixture only' });
  const run = (id, slug) => ({ id, host_loaded_skill: { slug, sha256: hashes[slug] }, completed: true, exit_code: 0, sandbox: ['review','core-review'].includes(id) ? 'read-only' : 'workspace-write', usage: { input_tokens: 1, output_tokens: 1 }, permission_violations: [], commands: [], tools: [], final_answer: verdict });
  const report = { project_version: version, content_binding: liveEvidenceBinding(root), result: 'PASS', cases: [
    { case: 'simple', result: 'PASS', changed_files: ['README.md'], run: run('simple','documentation-sync') },
    { case: 'workflow', result: 'PASS', changed_files: ['tests/cart.test.mjs'], runs: [run('gap','test-gap-analysis'),run('regression','safe-test-implementation'),run('review','safe-code-review')], focused_test: { exit_code: 0, test_count: 3 }, mutation_sensitivity: { exit_code: 1 }, resumed_from_checkpoint: true, final_action_before_invalidation: { action: 'complete' }, incremental: { afterUnrelated: [{ action: 'reuse' }], afterRelated: [{ action: 'rerun' }] } },
    { case: 'core-review', result: 'REVIEW_COMPLETED', changed_files: [], run: run('core-review','safe-code-review') },
  ] };
  return { root, report };
}

test('A complete scoped candidate contract can pass without fabricating a full-corpus PASS', t => {
  const f = fixture(t); assert.deepEqual(inspectCoordinationRelease(f.root, f.report, version), []);
});
test('Another version or changed source cannot reuse a candidate report', t => {
  const f = fixture(t); f.report.project_version = 'older'; assert.ok(inspectCoordinationRelease(f.root, f.report, version).length);
  f.report.project_version = version; writeFileSync(path.join(f.root, 'packs/new-input.txt'), 'new'); assert.ok(inspectCoordinationRelease(f.root, f.report, version).length);
});
test('Missing stages, sensitivity or independent verdict blocks the candidate', t => {
  const f = fixture(t); f.report.cases[1].mutation_sensitivity = {}; assert.ok(inspectCoordinationRelease(f.root, f.report, version).length);
  f.report.cases[1].mutation_sensitivity = { exit_code: 1 }; f.report.cases[2].run.final_answer = 'No issues'; assert.ok(inspectCoordinationRelease(f.root, f.report, version).length);
});
test('Actual forbidden Shell receipts fail even if a report claims no violation', t => {
  const f = fixture(t); f.report.cases[2].run.commands.push({ command: 'cat core.mjs', exit_code: 0 });
  assert.ok(inspectCoordinationRelease(f.root, f.report, version).some(e => e.includes('actual tool events')));
});
test('A different Skill or changed installed content cannot stand in for the required stage', t => {
  const f = fixture(t); f.report.cases[1].runs[0].host_loaded_skill.slug = 'safe-code-review'; assert.ok(inspectCoordinationRelease(f.root, f.report, version).length);
});

test('Missing actual turns and unexpected file scope cannot inherit a PASS label', t => {
  const f = fixture(t); f.report.cases[0].runs = [];
  assert.ok(inspectCoordinationRelease(f.root, f.report, version).some(e => e.includes('number of observed')));
  delete f.report.cases[0].runs; f.report.cases[1].changed_files.push('src/production.mjs');
  assert.ok(inspectCoordinationRelease(f.root, f.report, version).some(e => e.includes('unexpected scope')));
});
