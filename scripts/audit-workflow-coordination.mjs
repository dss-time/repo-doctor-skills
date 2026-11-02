// Read-only core audit: isolated synthetic inputs, no production writes or core fixes.
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYamlSubset } from './validate-yaml-schemas.mjs';
import { discoverSkillInventory } from './validate-workflows.mjs';
import { createTask, captureEvidence, operationBinding, digest, taskBinding, nextAction, advance, finishStep, reopen,
  restoreTask, encodeTask, evidenceValidity, validationPlan } from '../packs/engineering/repo-doctor/references/workflow-coordination.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = parseYamlSubset(readFileSync(path.join(repo, 'packs/engineering/repo-doctor/workflows.yaml'), 'utf8'));
const inventory = discoverSkillInventory(repo);
export function auditCoordination() {
  const root = mkdtempSync(path.join(tmpdir(), 'rd-coordination-audit-'));
  writeFileSync(path.join(root, 'scope.txt'), 'Synthetic audit fixture; not business validation evidence.');
  const findings = [];
  function setup(selector) {
    const task = createTask({ id: 'audit', goal: 'Synthetic boundary audit', acceptance: ['fixture'], ...selector }, registry, inventory);
    const host = { root, registry, inventory, scopeReviewed: true, continuationAuthorized: true, environment: { node: process.version },
      trustedEvidence: new Set(), conditions: {}, requests: {}, grants: [], skillChecks: {}, risks: [], reviewBinding: 'audit-basis',
      execution: 'same_agent', capabilities: { read_files: true, write_files: true } };
    function evidence(id, skill, claims, extra = {}) {
      const e = captureEvidence(root, { id, operation_binding: operationBinding(host), source: 'synthetic audit host', summary: 'Boundary fixture only', kind: 'analysis',
        task_binding: taskBinding(task), dependencies: ['scope.txt'], result: 'pass', coverage_complete: true, skill, claims, ...extra, ...(claims.some(c => c.startsWith('stage:')) ? { request_binding: digest(host.requests[claims.find(c => c.startsWith('stage:')).slice(6)]) } : {}) }, host.environment);
      task.evidence.push(e); host.trustedEvidence.add(digest(e)); return e.id;
    }
    const facts = evidence('facts', 'host', []);
    const stages = selector.workflow_id ? registry.workflows[selector.workflow_id].stages
      : [{ id: 'task', skill: selector.skill_id, type: 'skill', permission: inventory.get(selector.skill_id).permissions.write_files ? 'write_scoped' : 'read_only' }];
    for (const stage of stages) {
      host.conditions[stage.condition] = { value: true, regression: 'Synthetic host predicate', evidence_ids: [facts] };
      if (stage.type === 'gate') continue;
      const capabilities = stage.permission === 'write_scoped' ? ['read_files', 'write_files'] : ['read_files'];
      host.requests[stage.id] = { capabilities, paths: ['scope.txt'] };
      host.skillChecks[stage.id] = { allowed: true, source: 'Synthetic fixture mode/body assessment', request_binding: digest(host.requests[stage.id]), skill_binding: digest(inventory.get(stage.skill)) };
      for (const capability of capabilities) host.grants.push({ task_id: task.id, skill: stage.skill, skills: [stage.skill], capability, paths: ['scope.txt'], source: 'explicit audit fixture grant' });
    }
    for (const name of new Set([...(selector.workflow_id ? registry.workflows[selector.workflow_id].stop_conditions : []), ...stages.flatMap(s => s.stop_conditions ?? [])])) host.conditions[name] = { value: false, reason: 'Audit fixture assessed stop', evidence_ids: [facts] };
    return { task, host, evidence, stages };
  }
  try {
    // Partial writes followed by failure must not become replayable without reconciliation.
    {
      const { task, host } = setup({ skill_id: 'safe-fix-implementation' });
      advance(task, host);
      writeFileSync(path.join(root, 'scope.txt'), 'Observed partial non-idempotent write: count=1');
      finishStep(task, 'task', [], host, 'Validation failed after a partial write');
      let refused = false;
      try { reopen(task, 'task', host, { regression: 'retry failure', source: 'audit host' }); } catch { refused = true; }
      const observed = refused ? 'blocked' : nextAction(task, host).action;
      findings.push({ id: 'failed-write-retry', severity: 'P1', expected: 'blocked', observed,
        passed: refused, original_location: 'workflow-coordination.mjs:300', regression: 'validation_failed writes are omitted from reconciliation checks' });
    }
    // Optional stage applicability cannot erase an interrupted write's unknown effects.
    {
      const { task, host, evidence, stages } = setup({ workflow_id: 'feature-delivery' });
      for (const stage of stages) {
        if (stage.id === 'test-implementation') break;
        task.steps[stage.id].status = 'completed';
        if (stage.type !== 'gate') task.steps[stage.id].evidence_ids = [evidence(`stage-${stage.id}`, stage.skill, [`stage:${stage.id}`], stage.skill === 'safe-code-review' ? { kind: 'review', independent: true, review_basis: host.reviewBinding } : {})];
      }
      task.steps['test-implementation'].status = 'running';
      task.steps['test-implementation'].attempts = 1;
      const restored = restoreTask(encodeTask(task), registry, inventory);
      host.conditions.test_changes_authorized = { value: false, regression: 'Scope changed during interruption', evidence_ids: ['facts'] };
      const action = nextAction(restored, host);
      findings.push({ id: 'interrupted-optional-skip', severity: 'P1', expected: 'blocked', observed: action.action, passed: action.action === 'blocked',
        original_location: 'workflow-coordination.mjs:185', regression: 'optional condition is handled before interrupted/running state reconciliation' });
    }
    // A read-only mode must not demand a write grant just because another mode can write.
    {
      const { task, host } = setup({ skill_id: 'requirements-clarification' });
      host.requests.task.capabilities = ['read_files']; host.grants = host.grants.filter(g => g.capability === 'read_files');
      host.skillChecks.task.request_binding = digest(host.requests.task);
      const action = nextAction(task, host);
      findings.push({ id: 'read-only-conditional-skill', severity: 'P1', expected: 'execute', observed: action.action, detail: action.reason,
        passed: action.action === 'execute', original_location: 'workflow-coordination.mjs:94', regression: 'write_files metadata is treated as mandatory write permission for all modes' });
    }
    // An older pre-execution checkpoint is stale even if its status says pending.
    {
      const { task, host, evidence } = setup({ skill_id: 'documentation-sync' });
      const pending = encodeTask(task);
      advance(task, host);
      writeFileSync(path.join(root, 'scope.txt'), 'Completed non-idempotent operation: count=1');
      const receipt = evidence('completed-write', 'documentation-sync', ['stage:task', 'acceptance:fixture']);
      finishStep(task, 'task', [receipt], host);
      const restored = restoreTask(pending, registry, inventory);
      const observed = nextAction(restored, host).action;
      findings.push({ id: 'old-pending-checkpoint-replay', severity: 'P1', expected: 'blocked', observed, passed: observed === 'blocked',
        original_location: 'workflow-coordination.mjs:309', regression: 'restore cannot detect operations completed after a pending checkpoint' });
    }
    // Completed output must match the current requested scope, not only the old goal.
    {
      const { task, host, evidence } = setup({ skill_id: 'documentation-sync' });
      advance(task, host);
      const receipt = evidence('completed-scope-A', 'documentation-sync', ['stage:task', 'acceptance:fixture']);
      finishStep(task, 'task', [receipt], host);
      host.requests.task.paths = ['unauthorized-B.txt'];
      const observed = nextAction(task, host).action;
      findings.push({ id: 'completed-scope-change', severity: 'P1', expected: 'permission_blocked or evidence_insufficient', observed,
        passed: ['permission_blocked', 'evidence_insufficient', 'blocked'].includes(observed), original_location: 'workflow-coordination.mjs:202',
        regression: 'completed results do not compare their request binding with the current requested operation' });
    }
    // Unknown evidence is not a historical or current observed failure.
    {
      const { task, host } = setup({ skill_id: 'documentation-sync' });
      const e = captureEvidence(root, { id: 'unknown-result', source: 'synthetic audit host', summary: 'Result genuinely unavailable',
        task_binding: taskBinding(task), dependencies: ['scope.txt'], result: 'unknown', coverage_complete: true }, host.environment);
      host.trustedEvidence.add(digest(e));
      const validity = evidenceValidity(e, host);
      findings.push({ id: 'unknown-result-as-failure', severity: 'P2', expected: 'unknown / investigate', observed: `${validity.status} / ${validationPlan([e], host)[0].action}`,
        passed: validity.status === 'unknown', original_location: 'workflow-coordination.mjs:51', regression: 'any result except pass is classified as observed_failure before validity checks' });
    }
    return { scope: 'coordination core independently checked against requirements and actual Skill contracts',
      result: findings.every(f => f.passed) ? 'PASS' : 'FINDINGS', findings };
  } finally { rmSync(root, { recursive: true, force: true }); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditCoordination(); process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  process.exitCode = report.result === 'PASS' ? 0 : 1;
}
