import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync, symlinkSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseYamlSubset, validateSchema } from './validate-yaml-schemas.mjs';
import { discoverSkillInventory } from './validate-workflows.mjs';
import { createTask, captureEvidence, operationBinding, evidenceValidity, validationPlan, digest, taskBinding, reviewBinding, nextAction, advance,
  finishStep, reopen, recoveryBinding, reconciliationBinding, encodeTask, restoreTask, fingerprint } from '../packs/engineering/repo-doctor/references/workflow-coordination.mjs';

const registry = parseYamlSubset(readFileSync('packs/engineering/repo-doctor/workflows.yaml', 'utf8'));
const inventory = discoverSkillInventory(process.cwd());
function setup(t, selector = { skill_id: 'documentation-sync' }) {
  const root = mkdtempSync(path.join(tmpdir(), 'rd-coordination-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const name of ['src', 'tests', 'snapshots']) mkdirSync(path.join(root, name));
  for (const [name, text] of Object.entries({ 'README.md': 'helo', 'facts.txt': 'settled scope', 'src/main.mjs': 'export const add = (a,b) => a+b;',
    'tests/main.mjs': "import assert from 'node:assert/strict'; import {add} from '../src/main.mjs'; assert.equal(add(2,3),5);",
    'snapshots/broken.mjs': "import assert from 'node:assert/strict'; assert.equal(2-3,5);", 'lock.json': '{}', 'other.txt': 'unrelated' })) writeFileSync(path.join(root, name), text);
  const task = createTask({ id: 'fixture', goal: 'Deliver behavior', acceptance: ['behavior'], ...selector }, registry, inventory);
  const stages = task.workflow_id ? registry.workflows[task.workflow_id].stages : [{ id: 'task', skill: task.skill_id, type: 'skill', permission: inventory.get(task.skill_id).permissions.write_files ? 'write_scoped' : 'read_only' }];
  const host = { root, registry, inventory, scopeReviewed: true, continuationAuthorized: true, execution: 'same_agent',
    environment: { node: process.version, platform: process.platform }, trustedEvidence: new Set(), conditions: {}, requests: {}, grants: [],
    capabilities: { read_files: true, write_files: true, run_shell_commands: true, access_network: false, destructive_actions_allowed: false },
    skillChecks: {}, recoveryChecks: new Map(), risks: [], reviewBinding: 'diff-1', deliveryRequirements: [], reuse: {} };
  function evidence(id, claims = [], extra = {}) {
    const e = captureEvidence(root, { id, operation_binding: operationBinding(host), task_binding: taskBinding(task), kind: 'analysis', source: `fixture:${id}`, summary: id, dependencies: ['facts.txt'], coverage_complete: true,
      result: 'pass', claims, ...extra, ...(claims.some(c => c.startsWith('stage:')) ? { request_binding: digest(host.requests[claims.find(c => c.startsWith('stage:')).slice(6)]), execution_attempt: task.steps[claims.find(c => c.startsWith('stage:')).slice(6)].attempts } : {}) }, host.environment);
    task.evidence.push(e); host.trustedEvidence.add(digest(e)); return e;
  }
  const facts = evidence('facts');
  for (const stage of stages) {
    if (stage.condition && stage.condition !== 'always') host.conditions[stage.condition] = { value: true, reason: 'fixture scope explicitly assessed', evidence_ids: [facts.id] };
    if (stage.type === 'gate') continue;
    const caps = stage.permission === 'write_scoped' ? ['read_files', 'write_files'] : ['read_files'];
    host.requests[stage.id] = { capabilities: caps, paths: ['README.md', 'src/main.mjs', 'tests/main.mjs'] };
    host.skillChecks[stage.id] = { allowed: true, source: 'Fixture explicitly assessed Skill body and mode', request_binding: digest(host.requests[stage.id]), skill_binding: digest(inventory.get(stage.skill)) };
    for (const capability of caps) host.grants.push({ task_id: task.id, capability, skills: [stage.skill], paths: [...host.requests[stage.id].paths], source: 'fixture user scope' });
  }
  const workflowStops = task.workflow_id ? registry.workflows[task.workflow_id].stop_conditions : [];
  for (const name of new Set([...workflowStops, ...stages.flatMap(s => s.stop_conditions ?? [])])) host.conditions[name] = { value: false, reason: 'Fixture explicitly checked stop predicate', evidence_ids: [facts.id] };
  function setCondition(name, value) { host.conditions[name] = { value, reason: 'explicit assessed fixture condition', evidence_ids: ['facts'] }; }
  function complete(action, extra = {}) {
    const e = evidence(`result-${action.stage}-${task.evidence.length}`, [`stage:${action.stage}`], { skill: action.skill, ...extra });
    finishStep(task, action.stage, [e.id], host); return e;
  }
  function pump(stopAt = null) {
    const actions = [];
    for (let guard = 0; guard < 100; guard++) {
      const a = nextAction(task, host); if (a.stage === stopAt) return actions;
      if (!['execute', 'approve', 'skip', 'reuse'].includes(a.action)) return [...actions, a];
      advance(task, host); actions.push(a);
      if (a.action === 'execute') complete(a, a.skill === 'safe-code-review' ? { kind: 'review', independent: true, review_basis: host.reviewBinding } : {});
    }
    throw new Error('Workflow did not converge');
  }
  function runTest() {
    const result = spawnSync(process.execPath, ['tests/main.mjs'], { cwd: root, encoding: 'utf8' });
    return evidence(`test-${task.evidence.length}`, ['acceptance:behavior', 'behavior-validation', 'regression-validation'], {
      kind: 'test', command: `${process.execPath} tests/main.mjs`, cwd: '.', exit_code: result.status,
      result: result.status === 0 ? 'pass' : 'fail', dependencies: ['src', 'tests', 'lock.json'] });
  }
  return { root, task, host, evidence, setCondition, complete, pump, runTest };
}

test('A: one documentation edit, no Router, interview, tickets or full regression', t => {
  const f = setup(t); const a = advance(f.task, f.host); assert.equal(a.skill, 'documentation-sync');
  writeFileSync(path.join(f.root, 'README.md'), 'hello');
  assert.equal(readFileSync(path.join(f.root, 'README.md'), 'utf8'), 'hello');
  f.complete(a, { dependencies: ['README.md'], claims: ['stage:task', 'acceptance:behavior'] });
  assert.equal(nextAction(f.task, f.host).action, 'complete');
  assert.equal(f.task.history.filter(e => e.status === 'running').length, 1);
});

test('B: diagnosed local fix uses one Skill and actual focused regression', t => {
  const f = setup(t, { skill_id: 'safe-fix-implementation' });
  writeFileSync(path.join(f.root, 'src/main.mjs'), 'export const add=(a,b)=>a-b;');
  const initialFailure = f.runTest(); assert.equal(initialFailure.result, 'fail');
  f.host.failureRepairs = new Map([[digest(initialFailure), { source: 'Fixture authorized diagnosis/repair path for this observed failure', stages: Object.fromEntries(Object.entries(f.host.requests).map(([id, request]) => [id, digest(request)])) }]]);
  const a = advance(f.task, f.host);
  writeFileSync(path.join(f.root, 'src/main.mjs'), 'export const add=(a,b)=>a+b;');
  const green = f.runTest(); assert.equal(green.result, 'pass');
  f.complete(a, { dependencies: ['src/main.mjs'] });
  assert.equal(nextAction(f.task, f.host).action, 'complete');
  writeFileSync(path.join(f.root, 'other.txt'), 'unrelated edit');
  assert.equal(evidenceValidity(green, f.host).status, 'valid');
  writeFileSync(path.join(f.root, 'lock.json'), '{"version":2}');
  assert.equal(validationPlan([green], f.host)[0].action, 'rerun');
});

test('C: unknown root cause cannot complete diagnosis without an observed failure signal', t => {
  const f = setup(t, { workflow_id: 'bug-repair' });
  writeFileSync(path.join(f.root, 'src/main.mjs'), 'export const add=(a,b)=>a-b;');
  const initialFailure = f.runTest(); assert.equal(initialFailure.result, 'fail');
  f.host.failureRepairs = new Map([[digest(initialFailure), { source: 'Fixture authorized diagnosis/repair path for this observed failure', stages: Object.fromEntries(Object.entries(f.host.requests).map(([id, request]) => [id, digest(request)])) }]]);
  f.pump('root-cause');
  const a = advance(f.task, f.host); assert.equal(a.skill, 'bug-root-cause-analysis');
  assert.throws(() => f.complete(a), /Completion requires/);
  const failure = spawnSync(process.execPath, ['snapshots/broken.mjs'], { cwd: f.root, encoding: 'utf8' });
  assert.notEqual(failure.status, 0);
  const signal = f.evidence('signal', [], { kind: 'signal', dependencies: ['snapshots'], command: `${process.execPath} snapshots/broken.mjs`, cwd: '.', exit_code: failure.status,
    observed_target_failure: true, success_criterion: '2+3 equals 5', failure_criterion: 'subtraction produces -1' });
  f.complete(a, { signal_ids: [signal.id] });
  f.setCondition('shared_contract_affected', false);
  f.setCondition('regression_test_required', false); f.setCondition('regression_after_fix', false); f.setCondition('candidate_available', false);
  f.pump('fix'); const fix = advance(f.task, f.host);
  writeFileSync(path.join(f.root, 'src/main.mjs'), 'export const add=(a,b)=>a+b;');
  f.complete(fix, { dependencies: ['src'] });
  assert.equal(f.runTest().result, 'pass');
  const actions = f.pump(); assert.equal(actions.at(-1).action, 'complete');
  assert.equal(f.task.steps.impact.status, 'skipped');
  assert.equal(f.task.steps['root-cause'].attempts, 1);
});

test('D: cross-module delivery retains specification, impact, implementation, tests and independent review', t => {
  const f = setup(t, { workflow_id: 'feature-delivery' });
  f.setCondition('material_decisions_open', false); f.setCondition('candidate_available', false);
  f.setCondition('test_changes_required', false); f.setCondition('test_changes_authorized', false);
  const spec = f.evidence('existing-spec', ['stage:specification'], { skill: 'requirements-to-spec' }); f.host.reuse.specification = [spec.id];
  f.host.requests.implementation.paths.push('src/math.mjs');
  for (const grant of f.host.grants.filter(g => g.skills.includes('feature-implementation'))) grant.paths.push('src/math.mjs');
  f.host.skillChecks.implementation.request_binding = digest(f.host.requests.implementation);
  f.pump('implementation'); const implementation = advance(f.task, f.host);
  writeFileSync(path.join(f.root, 'src/math.mjs'), 'export const sum=(a,b)=>a+b;');
  writeFileSync(path.join(f.root, 'src/main.mjs'), "import {sum} from './math.mjs'; export const add=(a,b)=>sum(a,b);");
  f.task.changes = [{ path: 'src/math.mjs', source: 'fixture implementation' }, { path: 'src/main.mjs', source: 'fixture implementation' }];
  f.complete(implementation, { dependencies: ['src'] });
  assert.equal(f.runTest().result, 'pass');
  f.host.reviewBinding = reviewBinding(f.root, f.task, 'fixture-base', ['src', 'tests']);
  const actions = f.pump(); assert.equal(actions.at(-1).action, 'complete');
  assert.equal(f.task.steps.specification.status, 'reused'); assert.equal(f.task.steps.clarification.status, 'skipped');
  for (const id of ['work-items', 'impact', 'plan', 'implementation', 'review', 'test-gap']) assert.equal(f.task.steps[id].status, 'completed');
  writeFileSync(path.join(f.root, 'tests/extra.mjs'), 'export {};');
  f.host.reviewBinding = reviewBinding(f.root, f.task, 'fixture-base', ['src', 'tests']);
  assert.equal(nextAction(f.task, f.host).stage, 'review');
});

test('E: a fast security/database request cannot bypass specialist evidence or write grants', t => {
  for (const risk of ['security', 'database', 'public-interface']) {
    const f = setup(t, { skill_id: 'safe-fix-implementation' }); f.host.risks = [risk];
    assert.equal(nextAction(f.task, f.host).action, 'risk_check');
    for (const r of registry.coordination.risk_requirements[risk].before_write) f.evidence(r.claim, [r.claim], { skill: r.skill });
    const grants = f.host.grants; f.host.grants = []; assert.equal(nextAction(f.task, f.host).action, 'permission_blocked');
    f.task.permission_refs.push({ claim: 'user authorized all' }); assert.equal(nextAction(f.task, f.host).action, 'permission_blocked');
    f.host.grants = grants; const a = advance(f.task, f.host); f.complete(a); f.runTest();
    assert.equal(nextAction(f.task, f.host).action, 'evidence_insufficient');
    for (const r of registry.coordination.risk_requirements[risk].before_delivery.filter(r => r.kind !== 'test')) f.evidence(r.claim, [r.claim], { skill: r.skill, kind: r.kind || 'analysis', independent: true, review_basis: f.host.reviewBinding });
    assert.equal(nextAction(f.task, f.host).action, 'complete');
  }
});

test('F: interrupted writes never replay; restored context cannot restore authority', t => {
  const f = setup(t); advance(f.task, f.host);
  const restored = restoreTask(encodeTask(f.task), registry, inventory);
  assert.equal(restored.steps.task.status, 'interrupted');
  assert.equal(nextAction(restored, f.host).reason, 'recovered_execution_state_needs_reconciliation');
  assert.throws(() => reopen(restored, 'task', f.host, { reason: 'resume', source: 'host' }), /reconciled/);
  f.host.recoveryChecks.set(recoveryBinding(restored, f.host), { source: 'Fixture inspected all checkpoint effects', reconciled: true });
  f.host.reconciled = new Set([reconciliationBinding(restored, 'task', f.host)]); reopen(restored, 'task', f.host, { reason: 'no mutation occurred', source: 'inspection', safeToRetry: true });
  assert.equal(nextAction(restored, f.host).action, 'execute');
  f.host.trustedEvidence.clear(); assert.equal(evidenceValidity(f.task.evidence[0], f.host).status, 'unknown');
  f.host.grants = []; assert.equal(nextAction(restored, f.host).action, 'permission_blocked');
});

test('F: completed writes with stale evidence require reconciliation, not blind retry', t => {
  const f = setup(t); const a = advance(f.task, f.host); f.complete(a, { dependencies: ['README.md'] });
  writeFileSync(path.join(f.root, 'README.md'), 'changed externally');
  assert.equal(nextAction(f.task, f.host).reason, 'stale_write_result_needs_reconciliation');
});

test('G: review failure reopens fix and review, preserving unaffected test evidence', t => {
  const f = setup(t, { workflow_id: 'feature-delivery' });
  f.setCondition('material_decisions_open', false); f.setCondition('test_changes_required', false); f.setCondition('test_changes_authorized', false); f.setCondition('candidate_available', false);
  const green = f.runTest(); f.pump('review'); const a = advance(f.task, f.host);
  finishStep(f.task, a.stage, [], f.host, 'acceptance mismatch');
  assert.equal(nextAction(f.task, f.host).action, 'validation_failed');
  f.host.reconciled = new Set([reconciliationBinding(f.task, 'implementation', f.host)]);
  reopen(f.task, 'implementation', f.host, { reason: 'review finding; current diff inspected', source: 'review:1', safeToRetry: true });
  assert.equal(f.task.steps.specification.status, 'completed'); assert.equal(f.task.steps.review.status, 'pending');
  assert.equal(validationPlan([green], f.host)[0].action, 'reuse');
  f.host.reviewBinding = 'corrected-diff'; const actions = f.pump(); assert.equal(actions.at(-1).action, 'complete');
  assert.equal(f.task.steps.review.attempts, 2);
});

test('Unknown applicability does not skip; required false condition does not advance', t => {
  const f = setup(t, { workflow_id: 'feature-delivery' }); f.pump('clarification');
  delete f.host.conditions.material_decisions_open; assert.equal(nextAction(f.task, f.host).action, 'evidence_insufficient');
  f.setCondition('material_decisions_open', false); advance(f.task, f.host); f.setCondition('material_decisions_closed', false);
  assert.match(nextAction(f.task, f.host).reason, /required_condition_false/);
});

test('Added/deleted files, environment changes and unknown dependencies invalidate precisely', t => {
  const f = setup(t); const e = f.runTest();
  writeFileSync(path.join(f.root, 'src/new.mjs'), 'export const x=1;'); assert.equal(evidenceValidity(e, f.host).status, 'stale');
  rmSync(path.join(f.root, 'src/new.mjs')); assert.equal(evidenceValidity(e, f.host).status, 'valid');
  f.host.environment.node = 'different'; assert.equal(evidenceValidity(e, f.host).status, 'stale');
  delete f.host.environment.node; assert.equal(evidenceValidity(e, f.host).status, 'unknown');
  const unknown = f.evidence('incomplete', [], { coverage_complete: false }); assert.equal(evidenceValidity(unknown, f.host).status, 'unknown');
});

test('Context tampering and registry drift cannot reuse evidence', t => {
  const f = setup(t); const text = JSON.parse(encodeTask(f.task)); text.evidence[0].summary = 'tampered';
  const restored = restoreTask(JSON.stringify(text), registry, inventory); assert.equal(evidenceValidity(restored.evidence[0], f.host).status, 'unknown');
  assert.throws(() => restoreTask(encodeTask(f.task), { ...registry, version: 999 }, inventory), /Registry changed|Unknown/);
});

test('Skill restrictions and scoped grants are intersected, not unioned', t => {
  const f = setup(t, { skill_id: 'safe-code-review' }); f.host.requests.task.capabilities.push('write_files');
  assert.equal(nextAction(f.task, f.host).action, 'permission_blocked');
  const g = setup(t); g.host.requests.task.paths.push('private.txt'); assert.match(nextAction(g.task, g.host).reason, /path_not_authorized/);
  g.host.requests.task.paths = ['../outside']; assert.equal(nextAction(g.task, g.host).reason, 'explicit_paths_missing');
});

test('Review completion rejects implementation self-evaluation', t => {
  const f = setup(t, { skill_id: 'safe-code-review' }); const a = advance(f.task, f.host);
  assert.throws(() => f.complete(a, { kind: 'review', independent: false, review_basis: f.host.reviewBinding }), /independent review/);
});

test('Conditions can reopen; unsupported host falls back to manual handoff', t => {
  const f = setup(t); f.host.execution = 'unavailable'; assert.equal(nextAction(f.task, f.host).mode, 'manual_handoff');
  f.host.openDecisions = ['data retention']; assert.equal(nextAction(f.task, f.host).action, 'decision_required');
});

test('Dependency traversal and symlink escape are rejected', t => {
  const f = setup(t); assert.throws(() => fingerprint(f.root, '../outside'), /relative/);
  symlinkSync('/tmp', path.join(f.root, 'escape')); assert.throws(() => fingerprint(f.root, 'escape'), /Symlink/);
});

test('New risks and stop conditions interrupt an otherwise valid flow', t => {
  const f = setup(t, { skill_id: 'safe-fix-implementation' });
  const a = advance(f.task, f.host); f.complete(a); f.runTest();
  assert.equal(nextAction(f.task, f.host).action, 'complete');
  f.host.risks = ['security']; assert.equal(nextAction(f.task, f.host).reason, 'delivery_not_proven');
  f.host.risks = ['unclassified']; assert.equal(nextAction(f.task, f.host).missing[0].claim, 'unclassified-risk:unclassified');
  const g = setup(t, { workflow_id: 'feature-delivery' }); g.setCondition('material_decision_unresolved', true);
  assert.equal(nextAction(g.task, g.host).action, 'blocked');
});

test('Persisted gate approval never replaces current authorization', t => {
  const f = setup(t, { workflow_id: 'feature-delivery' }); f.setCondition('material_decisions_open', false);
  f.pump('implementation'); assert.equal(f.task.steps['implementation-approval'].status, 'completed');
  const restored = restoreTask(encodeTask(f.task), registry, inventory);
  f.host.recoveryChecks.set(recoveryBinding(restored, f.host), { source: 'Fixture verified checkpoint state', reconciled: true }); f.host.grants = [];
  assert.equal(nextAction(restored, f.host).action, 'permission_blocked');
});

test('A failed or unknown test is not reusable; new relevant coverage triggers investigation', t => {
  const f = setup(t); const e = f.runTest(); e.exit_code = 2; f.host.trustedEvidence.add(digest(e));
  assert.equal(evidenceValidity(e, f.host).status, 'unknown');
  e.result = 'fail'; f.host.trustedEvidence.add(digest(e)); assert.equal(validationPlan([e], f.host)[0].action, 'rerun');
});

test('Permission preflight rejects symlink targets even with a matching path grant', t => {
  const f = setup(t); symlinkSync('/tmp', path.join(f.root, 'escape'));
  f.host.requests.task.paths = ['escape/file'];
  for (const grant of f.host.grants) grant.paths = ['escape/file'];
  assert.equal(nextAction(f.task, f.host).reason, 'unsafe_path');
});

test('Changed goal/acceptance cannot inherit old stage or acceptance claims', t => {
  const f = setup(t); const a = advance(f.task, f.host);
  f.complete(a, { claims: ['stage:task', 'acceptance:behavior'] });
  assert.equal(nextAction(f.task, f.host).action, 'complete');
  f.task.goal = 'A different outcome'; assert.notEqual(nextAction(f.task, f.host).action, 'complete');
});

test('Review basis binds actual files, acceptance and baseline; context matches its schema', t => {
  const f = setup(t); const before = reviewBinding(f.root, f.task, 'base-commit', ['src', 'tests']);
  writeFileSync(path.join(f.root, 'tests/extra.mjs'), 'export {};');
  assert.notEqual(reviewBinding(f.root, f.task, 'base-commit', ['src', 'tests']), before);
  const schema = JSON.parse(readFileSync('schemas/task-context.schema.json', 'utf8'));
  assert.deepEqual(validateSchema(f.task, schema), []);
  assert.ok(validateSchema({ ...f.task, workflow_id: 42 }, schema).length);
  f.task.steps.task.attempts = -1;
  assert.ok(validateSchema(f.task, schema).length);
});

test('Production completion cannot substitute self-reported acceptance for actual verification', t => {
  const f = setup(t, { skill_id: 'safe-fix-implementation' }); const a = advance(f.task, f.host);
  f.complete(a, { claims: ['stage:task', 'acceptance:behavior'] });
  const next = nextAction(f.task, f.host);
  assert.equal(next.action, 'evidence_insufficient');
  assert.ok(next.missing.some(r => r.claim === 'behavior-validation'));
});

test('Distribution ships the same standalone coordinator without a pre-existing dist directory', async t => {
  const f = setup(t); const projectRoot = process.cwd();
  cpSync(path.join(projectRoot, 'packs'), path.join(f.root, 'packs'), { recursive: true });
  for (const target of ['claude-code-zh-CN', 'cursor-zh-CN', 'generic-en']) {
    const built = spawnSync(process.execPath, [path.join(projectRoot, 'scripts/build-skills.mjs'), '--target', target], { cwd: f.root, encoding: 'utf8' });
    assert.equal(built.status, 0, built.stderr);
  }
  const { syncRepoDoctorPlugin } = await import('./sync-repo-doctor-plugin.mjs');
  syncRepoDoctorPlugin({ root: f.root, pluginRoot: path.join(f.root, 'plugins/repo-doctor'), log: false });
  const source = readFileSync('packs/engineering/repo-doctor/references/workflow-coordination.mjs');
  for (const file of [
    'skills/safe-fix-implementation/references/workflow-coordination.mjs',
    'plugins/repo-doctor/skills/safe-fix-implementation/references/workflow-coordination.mjs',
    'dist/claude-code-zh-CN/.claude/skills/safe-fix-implementation/references/workflow-coordination.mjs',
    'dist/cursor-zh-CN/.cursor/rules/references/workflow-coordination.mjs',
    'dist/generic-en/references/workflow-coordination.mjs',
  ]) assert.deepEqual(readFileSync(path.join(f.root, file)), source, file);
});

test('An explicit release-preparation request cannot skip its release gate', t => {
  const f = setup(t, { workflow_id: 'release-preparation' }); f.pump('release-check');
  f.setCondition('candidate_known', false);
  assert.equal(nextAction(f.task, f.host).action, 'evidence_insufficient');
  assert.match(nextAction(f.task, f.host).reason, /required_condition_false/);
});

test('Audited retry, interrupted skip, stale checkpoint, scope and evidence regressions remain closed', async () => {
  const { auditCoordination } = await import('./audit-workflow-coordination.mjs');
  const audit = auditCoordination(); assert.equal(audit.findings.length, 6);
  assert.deepEqual(audit.findings.filter(f => !f.passed), []);
});

test('Read-only conditional modes need no writes, while narrower mode rules remain mandatory', t => {
  const f = setup(t, { skill_id: 'requirements-clarification' });
  f.host.requests.task = { mode: 'fast', capabilities: ['read_files'], paths: ['README.md'] };
  f.host.grants = f.host.grants.filter(g => g.capability === 'read_files');
  assert.equal(nextAction(f.task, f.host).reason, 'skill_scope_not_verified');
  f.host.skillChecks.task = { source: 'Actual body read: fast is read-only', allowed: true, request_binding: digest(f.host.requests.task), skill_binding: digest(inventory.get('requirements-clarification')) };
  assert.equal(nextAction(f.task, f.host).action, 'execute');
  f.host.requests.task.mode = 'documented';
  assert.equal(nextAction(f.task, f.host).reason, 'skill_scope_not_verified');
});

test('Recovery approval cannot be reused for another import of the same pending checkpoint', t => {
  const f = setup(t); const checkpoint = encodeTask(f.task);
  const first = restoreTask(checkpoint, registry, inventory);
  f.host.recoveryChecks.set(recoveryBinding(first, f.host), { source: 'Workspace and attempt ledger inspected', reconciled: true });
  assert.equal(nextAction(first, f.host).action, 'execute');
  const second = restoreTask(checkpoint, registry, inventory);
  assert.equal(nextAction(second, f.host).reason, 'recovered_execution_state_needs_reconciliation');
});

test('Failed-write reconciliation must name the current attempt and scope', t => {
  const f = setup(t); advance(f.task, f.host);
  finishStep(f.task, 'task', [], f.host, 'partial write');
  const old = reconciliationBinding(f.task, 'task', f.host);
  f.host.reconciled = new Set([old]);
  reopen(f.task, 'task', f.host, { reason: 'first failure inspected', source: 'host', safeToRetry: true });
  advance(f.task, f.host); finishStep(f.task, 'task', [], f.host, 'second partial write');
  assert.throws(() => reopen(f.task, 'task', f.host, { reason: 'retry', source: 'host', safeToRetry: true }), /reconciled/);
});

test('Historical failures become stale; unobserved results require investigation', t => {
  const f = setup(t); const e = f.runTest();
  e.result = 'fail'; e.exit_code = 1; f.host.trustedEvidence.add(digest(e));
  assert.equal(evidenceValidity(e, f.host).status, 'failed');
  f.host.environment.node = 'changed'; assert.equal(evidenceValidity(e, f.host).status, 'stale');
  const unknown = f.evidence('unknown-status', [], { result: 'unknown' });
  assert.equal(validationPlan([unknown], f.host)[0].action, 'investigate');
});

test('Raw imported JSON cannot bypass the recovery boundary', t => {
  const f = setup(t); const raw = JSON.parse(encodeTask(f.task));
  assert.throws(() => nextAction(raw, f.host), /Untrusted Task Context/);
});

test('Stale shell-only results cannot replay a potentially effectful operation', t => {
  const f = setup(t, { skill_id: 'safe-fix-implementation' });
  f.host.requests.task = { capabilities: ['read_files', 'run_shell_commands'], paths: ['README.md'], operation: 'local fixture command', preflight: 'safe' };
  f.host.grants.push({ task_id: f.task.id, capability: 'run_shell_commands', skills: ['safe-fix-implementation'], operations: ['local fixture command'], source: 'fixture authorization' });
  f.host.skillChecks.task.request_binding = digest(f.host.requests.task);
  const a = advance(f.task, f.host); f.complete(a);
  f.host.environment.node = 'changed';
  assert.equal(nextAction(f.task, f.host).action, 'blocked');
});

test('Independent review evidence must itself match the current stage and request', t => {
  const f = setup(t, { skill_id: 'safe-code-review' }); const a = advance(f.task, f.host);
  const scopedAnalysis = f.evidence('scoped-analysis', ['stage:task'], { skill: 'safe-code-review', request_binding: digest(f.host.requests.task) });
  const oldReview = f.evidence('old-review', [], { skill: 'safe-code-review', kind: 'review', independent: true, review_basis: f.host.reviewBinding, request_binding: 'different operation' });
  assert.throws(() => finishStep(f.task, a.stage, [scopedAnalysis.id, oldReview.id], f.host), /independent review/);
});

test('A reconciled attempt can reopen for a newly authorized scope without reusing old results', t => {
  const f = setup(t); const a = advance(f.task, f.host); const old = f.complete(a);
  const previousBinding = f.task.steps.task.request_binding;
  f.host.reconciled = new Set([reconciliationBinding(f.task, 'task', f.host)]);
  reopen(f.task, 'task', f.host, { reason: 'previous operation inspected; new scope next', source: 'host', safeToRetry: true });
  f.host.requests.task.paths = ['other.txt'];
  for (const grant of f.host.grants) grant.paths = ['other.txt'];
  f.host.skillChecks.task.request_binding = digest(f.host.requests.task);
  f.host.reuse.task = [old.id];
  assert.equal(nextAction(f.task, f.host).action, 'execute');
  assert.equal(f.task.history.at(-1).previous_request_binding, previousBinding);
});

test('Portable context cannot retain injected host authority fields', t => {
  const f = setup(t); const raw = JSON.parse(encodeTask(f.task)); raw.grants = [{ capability: 'write_files' }];
  assert.throws(() => restoreTask(JSON.stringify(raw), registry, inventory), /Unexpected or missing/);
});

test('Optional applicability toggles retain completed writes instead of making them pending again', t => {
  const f = setup(t, { workflow_id: 'feature-delivery' });
  f.setCondition('material_decisions_open', false);
  f.pump('test-implementation'); const a = advance(f.task, f.host); f.complete(a);
  f.setCondition('test_changes_authorized', false); f.setCondition('candidate_available', false);
  f.runTest(); f.pump();
  assert.equal(f.task.steps['test-implementation'].status, 'completed');
  f.setCondition('test_changes_authorized', true);
  assert.notEqual(nextAction(f.task, f.host).action, 'execute');
  const e = f.task.evidence.find(e => e.id === f.task.steps['test-implementation'].evidence_ids[0]);
  writeFileSync(path.join(f.root, 'facts.txt'), 'changed');
  assert.equal(evidenceValidity(e, f.host).status, 'stale');
});

test('Reused effectful results require exact reconciliation before reopen', t => {
  const f = setup(t, { skill_id: 'safe-fix-implementation' });
  f.host.requests.task = { capabilities: ['read_files','run_shell_commands'], paths: ['README.md'], operation: 'fixture', preflight: 'safe' };
  f.host.grants.push({ task_id: f.task.id, capability: 'run_shell_commands', skills: ['safe-fix-implementation'], operations: ['fixture'], source: 'host' });
  f.host.skillChecks.task.request_binding = digest(f.host.requests.task);
  const e = f.evidence('prior-command', ['stage:task'], { skill: 'safe-fix-implementation' });
  f.host.reuse.task = [e.id]; assert.equal(advance(f.task, f.host).action, 'reuse');
  f.host.environment.node = 'changed';
  assert.equal(nextAction(f.task, f.host).action, 'blocked');
  assert.throws(() => reopen(f.task, 'task', f.host, { reason: 'retry', source: 'host' }), /reconciled/);
});

test('Replacement receipts cannot clear reconciliation of a stale completed write', t => {
  const f = setup(t); const a = advance(f.task, f.host); const old = f.complete(a, { dependencies: ['README.md'] });
  writeFileSync(path.join(f.root, 'README.md'), 'new state');
  const replacement = f.evidence('new-write-result', ['stage:task'], { skill: 'documentation-sync', dependencies: ['README.md'] });
  f.host.reuse.task = [replacement.id];
  assert.equal(evidenceValidity(old, f.host).status, 'stale');
  assert.equal(nextAction(f.task, f.host).reason, 'stale_write_result_needs_reconciliation');
});

test('A false optional condition cannot hide stale completed effects or revoked grants', t => {
  const f = setup(t, { workflow_id: 'feature-delivery' }); f.setCondition('material_decisions_open', false);
  f.pump('test-implementation'); const a = advance(f.task, f.host);
  f.complete(a, { dependencies: ['README.md'] });
  f.setCondition('test_changes_authorized', false); f.setCondition('candidate_available', false);
  writeFileSync(path.join(f.root, 'README.md'), 'changed after implementation');
  assert.equal(nextAction(f.task, f.host).stage, 'test-implementation');
  assert.equal(nextAction(f.task, f.host).reason, 'stale_write_result_needs_reconciliation');
  f.host.grants = f.host.grants.filter(g => !g.skills.includes('safe-test-implementation'));
  assert.equal(nextAction(f.task, f.host).action, 'permission_blocked');
});

test('Unknown, missing and stale stop evidence require investigation', t => {
  const f = setup(t, { workflow_id: 'feature-delivery' });
  delete f.host.conditions.no_verified_skill;
  assert.equal(nextAction(f.task, f.host).reason, 'stop_condition_unknown:no_verified_skill');
  f.setCondition('no_verified_skill', false);
  f.host.trustedEvidence.clear();
  assert.equal(nextAction(f.task, f.host).action, 'evidence_insufficient');
});

test('Shell-only risk operations cannot bypass specialist pre-operation checks', t => {
  const f = setup(t, { skill_id: 'safe-fix-implementation' });
  f.host.requests.task = { capabilities: ['read_files','run_shell_commands'], paths: ['README.md'], operation: 'local edit', preflight: 'safe' };
  f.host.grants.push({ task_id: f.task.id, capability: 'run_shell_commands', skills: ['safe-fix-implementation'], operations: ['local edit'], source: 'fixture' });
  f.host.skillChecks.task.request_binding = digest(f.host.requests.task); f.host.risks = ['security'];
  assert.equal(nextAction(f.task, f.host).action, 'risk_check');
});

test('A current failed command cannot be masked by a valid pass without investigated resolution', t => {
  const f = setup(t, { skill_id: 'safe-fix-implementation' }); const a = advance(f.task, f.host); f.complete(a); const green = f.runTest();
  const failed = { ...green, id: 'later-failure', result: 'fail', exit_code: 1 };
  f.task.evidence.push(failed); f.host.trustedEvidence.add(digest(failed));
  assert.equal(nextAction(f.task, f.host).action, 'validation_failed');
  const rerun = f.runTest();
  f.host.failureResolutions = new Map([[digest(failed), { source: 'Host inspected environmental flake and observed rerun', replacement: rerun.id }]]);
  assert.equal(nextAction(f.task, f.host).action, 'complete');
});

test('An investigated failure cannot be cleared using a pass predating the failure', t => {
  const f = setup(t, { skill_id: 'safe-fix-implementation' }); const a = advance(f.task, f.host); f.complete(a); const green = f.runTest();
  const failed = { ...green, id: 'new-failure', result: 'fail', exit_code: 1, recorded_at: new Date(Date.parse(green.recorded_at) + 1000).toISOString() };
  f.task.evidence.push(failed); f.host.trustedEvidence.add(digest(failed));
  f.host.failureResolutions = new Map([[digest(failed), { source: 'Attempted old-pass reuse', replacement: green.id }]]);
  assert.equal(nextAction(f.task, f.host).action, 'validation_failed');
});

test('Unresolved failed verification blocks dependent execution until an explicit repair path exists', t => {
  const f = setup(t, { skill_id: 'safe-fix-implementation' }); const green = f.runTest();
  const failed = { ...green, id: 'current-failure', result: 'fail', exit_code: 1 };
  f.task.evidence.push(failed); f.host.trustedEvidence.add(digest(failed));
  assert.equal(nextAction(f.task, f.host).action, 'validation_failed');
  f.host.failureRepairs = new Map([[digest(failed), { source: 'Authorized targeted repair', stages: { task: digest(f.host.requests.task) } }]]);
  assert.equal(nextAction(f.task, f.host).action, 'execute');
});

test('Missing environment information cannot erase an attested failure before execution or delivery', t => {
  for (const completed of [false, true]) {
    const f = setup(t);
    if (completed) {
      const action = advance(f.task, f.host);
      f.complete(action, { claims: ['stage:task', 'acceptance:behavior'] });
      assert.equal(nextAction(f.task, f.host).action, 'complete');
    }
    f.host.environment.testRuntime = 'original';
    const failed = f.evidence('observed-failure', [], {
      kind: 'test', command: 'synthetic observed check', cwd: '.', exit_code: 1, result: 'fail',
    });
    assert.equal(nextAction(f.task, f.host).action, 'validation_failed');
    delete f.host.environment.testRuntime;
    assert.equal(evidenceValidity(failed, f.host).status, 'unknown');
    assert.equal(nextAction(f.task, f.host).action, 'evidence_insufficient');
    f.host.environment.testRuntime = 'original';
    assert.equal(nextAction(f.task, f.host).action, 'validation_failed');
    f.host.environment.testRuntime = 'changed';
    assert.equal(evidenceValidity(failed, f.host).status, 'stale');
    assert.equal(nextAction(f.task, f.host).action, completed ? 'complete' : 'execute');
  }
});

test('Completion rejects a previous execution attempt while explicit reuse remains available', t => {
  const f = setup(t);
  const first = advance(f.task, f.host);
  const old = f.complete(first, { claims: ['stage:task', 'acceptance:behavior'] });
  f.host.reconciled = new Set([reconciliationBinding(f.task, 'task', f.host)]);
  reopen(f.task, 'task', f.host, { reason: 'Retry inspected operation', source: 'host', safeToRetry: true });
  advance(f.task, f.host);
  assert.equal(f.task.steps.task.attempts, 2);
  assert.throws(() => finishStep(f.task, 'task', [old.id], f.host), /current-attempt/);
  f.complete({ stage: 'task', skill: 'documentation-sync' }, { claims: ['stage:task', 'acceptance:behavior'] });
  assert.equal(nextAction(f.task, f.host).action, 'complete');
  f.host.reconciled = new Set([reconciliationBinding(f.task, 'task', f.host)]);
  reopen(f.task, 'task', f.host, { reason: 'Reuse verified existing result', source: 'host', safeToRetry: true });
  f.host.reuse.task = [old.id];
  assert.equal(advance(f.task, f.host).action, 'reuse');
});

test('Demonstrated dependency or environment changes take precedence over unknown inputs', t => {
  const f = setup(t);
  f.host.environment.extra = 'original';
  const receipt = f.runTest();
  delete f.host.environment.node;
  f.host.environment.extra = 'changed';
  assert.equal(evidenceValidity(receipt, f.host).status, 'stale');
  f.host.environment.extra = 'original';
  assert.equal(evidenceValidity(receipt, f.host).status, 'unknown');
  writeFileSync(path.join(f.root, 'lock.json'), '{"changed":true}');
  assert.equal(evidenceValidity(receipt, f.host).status, 'stale');
});

test('Acceptance and risk claims cannot cross an authorized operation scope change', t => {
  const f = setup(t); const a = advance(f.task, f.host); const prior = f.complete(a, { claims: ['stage:task','acceptance:behavior'] });
  assert.equal(nextAction(f.task, f.host).action, 'complete');
  f.host.reconciled = new Set([reconciliationBinding(f.task, 'task', f.host)]);
  reopen(f.task, 'task', f.host, { reason: 'Scope A inspected before scope B', source: 'host', safeToRetry: true });
  f.host.requests.task.paths = ['other.txt']; for (const grant of f.host.grants) grant.paths = ['other.txt'];
  f.host.skillChecks.task.request_binding = digest(f.host.requests.task);
  const b = advance(f.task, f.host); f.complete(b);
  assert.equal(evidenceValidity(prior, f.host).status, 'valid');
  assert.equal(nextAction(f.task, f.host).reason, 'delivery_not_proven');
});
