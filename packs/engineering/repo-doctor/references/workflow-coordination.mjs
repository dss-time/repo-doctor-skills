/** Platform-neutral serial coordination. No command execution, network or persistence.
 * Registry and host attestations are trusted inputs, never imported from Task Context.
 */
import { createHash, randomUUID } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';

export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const operationBinding = host => digest(host.requests ?? {});
export const taskBinding = task => digest({ id: task.id, goal: task.goal, acceptance: task.acceptance, decisions: task.decisions });
const copy = value => JSON.parse(JSON.stringify(value));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const recovered = new WeakMap();
const runtimeTasks = new WeakSet();
const states = new Set(['pending', 'running', 'completed', 'reused', 'skipped', 'evidence_insufficient', 'permission_blocked', 'validation_failed', 'interrupted']);
const allowedCapabilities = ['read_files', 'write_files', 'run_shell_commands', 'access_network', 'destructive_actions_allowed'];
const safePath = p => typeof p === 'string' && p !== '' && !path.isAbsolute(p) && !p.split(/[\\/]/).includes('..');

function checkPath(root, relative) {
  assert(safePath(relative), 'Dependency path must be repository-relative');
  let current = realpathSync(root);
  for (const part of relative.split(/[\\/]/)) {
    current = path.join(current, part);
    try { assert(!lstatSync(current).isSymbolicLink(), 'Symlink paths require host inspection'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return current;
}

// Include directory membership (new/deleted files), executable bits and file bytes.
// Never follow symlinks or read outside the explicitly supplied repository root.
export function fingerprint(root, relative) {
  const current = checkPath(root, relative);
  try { lstatSync(current); } catch (error) { if (error.code === 'ENOENT') return 'missing'; throw error; }
  function visit(file) {
    const stat = lstatSync(file);
    assert(!stat.isSymbolicLink(), 'Symlink dependencies require host inspection');
    if (stat.isDirectory()) return readdirSync(file).sort().map(name => [name, visit(path.join(file, name))]);
    assert(stat.isFile(), 'Only regular files/directories can be fingerprinted');
    return [stat.mode & 0o111, createHash('sha256').update(readFileSync(file)).digest('hex')];
  }
  return digest(visit(current));
}

export function captureEvidence(root, input, environment) {
  assert(input.id && input.source && input.summary, 'Evidence needs id, source and summary');
  assert(Array.isArray(input.dependencies) && input.dependencies.length, 'Evidence needs dependency coverage');
  const bindings = Object.fromEntries(input.dependencies.map(p => [p, fingerprint(root, p)]));
  return { ...copy(input), bindings, environment: copy(environment), recorded_at: new Date().toISOString() };
}

export function evidenceValidity(evidence, host) {
  if (!evidence || !host.trustedEvidence?.has(digest(evidence))) return { status: 'unknown', reason: 'source_not_attested' };
  if (!['pass', 'fail'].includes(evidence.result)) return { status: 'unknown', reason: 'result_not_observed' };
  if (evidence.coverage_complete !== true || !evidence.bindings || !Object.keys(evidence.bindings).length
      || !evidence.environment || !Object.keys(evidence.environment).length) {
    return { status: 'unknown', reason: 'dependency_or_environment_coverage_unknown' };
  }
  if (evidence.kind === 'test' && (!evidence.command || !evidence.cwd || !Number.isInteger(evidence.exit_code) || (evidence.result === 'pass' ? evidence.exit_code !== 0 : evidence.exit_code === 0))) {
    return { status: 'unknown', reason: 'execution_receipt_missing' };
  }
  if (evidence.kind === 'signal' && (!evidence.command || !evidence.cwd || !Number.isInteger(evidence.exit_code)
      || evidence.observed_target_failure !== true || !evidence.success_criterion || !evidence.failure_criterion)) {
    return { status: 'unknown', reason: 'reliable_failure_signal_missing' };
  }
  let unknownReason = null;
  for (const [key, value] of Object.entries(evidence.environment)) {
    if (!(key in (host.environment ?? {}))) { unknownReason ??= `environment_unknown:${key}`; continue; }
    if (host.environment[key] !== value) return { status: 'stale', reason: `environment_changed:${key}` };
  }
  for (const [file, hash] of Object.entries(evidence.bindings)) {
    try {
      if (fingerprint(host.root, file) !== hash) return { status: 'stale', reason: `dependency_changed:${file}` };
    } catch (error) { unknownReason ??= error.message; }
  }
  if (unknownReason) return { status: 'unknown', reason: unknownReason };
  return evidence.result === 'pass' ? { status: 'valid', reason: 'attested_inputs_unchanged' } : { status: 'failed', reason: 'observed_failure' };
}

export function validationPlan(evidence, host) {
  return evidence.map(item => ({ id: item.id, ...evidenceValidity(item, host) }))
    .map(item => ({ ...item, action: item.status === 'valid' ? 'reuse' : item.status === 'unknown' ? 'investigate' : 'rerun' }));
}

export function reviewBinding(root, task, baseline, files) {
  assert(baseline && Array.isArray(files) && files.length, 'Review needs a baseline and complete changed/related paths');
  return digest({ baseline, goal: task.goal, acceptance: task.acceptance, decisions: task.decisions,
    files: [...new Set(files)].sort().map(file => [file, fingerprint(root, file)]) });
}

function definition(task, registry, inventory) {
  assert(runtimeTasks.has(task), 'Untrusted Task Context: use createTask or restoreTask');
  assert(task.registry_binding === digest(registry), 'Registry changed; explicitly migrate/reselect workflow');
  if (task.workflow_id) {
    const workflow = registry.workflows[task.workflow_id];
    assert(workflow, 'Unknown registered workflow');
    return workflow;
  }
  assert(inventory.has(task.skill_id), 'Unknown single Skill');
  return { stages: [{ id: 'task', type: 'skill', skill: task.skill_id, optional: false, condition: 'always', prerequisites: [], next: [], permission: 'request_scoped', stop_conditions: [] }], stop_conditions: [] };
}

export function createTask({ id, goal, acceptance, workflow_id = null, skill_id = null }, registry, inventory) {
  assert(id && goal && Array.isArray(acceptance) && acceptance.length, 'Goal and acceptance are required');
  assert(acceptance.every(item => typeof item === 'string' && item.length) && new Set(acceptance).size === acceptance.length, 'Acceptance IDs must be distinct strings');
  assert(Boolean(workflow_id) !== Boolean(skill_id), 'Choose one registered workflow or one existing Skill');
  const task = { schema_version: 2, id, goal, acceptance: copy(acceptance), workflow_id, skill_id,
    registry_binding: digest(registry), decisions: [], scope: { files: [], modules: [], interfaces: [] },
    risks: [], permission_refs: [], evidence: [], changes: [], unresolved: [], next_actions: [],
    current_stage: null, steps: {}, history: [] };
  runtimeTasks.add(task);
  for (const stage of definition(task, registry, inventory).stages) task.steps[stage.id] = { status: 'pending', attempts: 0, evidence_ids: [] };
  return task;
}

function evidenceFor(task, ids, host) {
  return ids?.length > 0 && ids.every(id => {
    const evidence = task.evidence.find(e => e.id === id);
    return evidence?.task_binding === taskBinding(task) && evidenceValidity(evidence, host).status === 'valid';
  });
}
function condition(task, name, host) {
  if (name === 'always') return true;
  const fact = host.conditions?.[name];
  return fact && typeof fact.value === 'boolean' && fact.reason && evidenceFor(task, fact.evidence_ids, host) ? fact.value : undefined;
}
function permission(skill, stage, task, host) {
  const metadata = host.inventory.get(skill);
  if (!metadata || !['draft', 'beta', 'stable'].includes(metadata.status)) return 'skill_unavailable';
  const request = host.requests?.[stage.id];
  if (!request) return 'operation_scope_missing';
  if (!Array.isArray(request.capabilities) || !request.capabilities.length) return 'capabilities_missing';
  if (stage.permission === 'write_scoped' && !request.capabilities.includes('write_files')) return 'write_scope_missing';
  if (stage.permission === 'read_only' && request.capabilities.includes('write_files')) return 'read_only_stage';
  for (const capability of request.capabilities) {
    if (!allowedCapabilities.includes(capability) || metadata.permissions?.[capability] !== true
        || host.capabilities?.[capability] !== true) return `capability_denied:${capability}`;
    const grants = host.grants?.filter(g => g.task_id === task.id && g.capability === capability && g.source
      && g.skills.includes(skill)) ?? [];
    if (!grants.length) return `user_authorization_missing:${capability}`;
    if (['read_files', 'write_files'].includes(capability)) {
      if (!request.paths?.length || request.paths.some(p => !safePath(p))) return 'explicit_paths_missing';
      if (request.paths.some(p => !grants.some(g => g.paths?.includes(p)))) return `path_not_authorized:${capability}`;
      try { for (const p of request.paths) checkPath(host.root, p); } catch { return 'unsafe_path'; }
    } else if (!request.operation || !grants.some(g => g.operations?.includes(request.operation))) return `operation_not_authorized:${capability}`;
  }
  const check = host.skillChecks?.[stage.id];
  if (!check?.source || check.request_binding !== digest(request) || check.skill_binding !== digest(metadata) || check.allowed !== true) return 'skill_scope_not_verified';
  if (request.capabilities.includes('run_shell_commands') && request.preflight !== 'safe') return 'command_preflight_missing';
  return null;
}

function potentiallyEffectful(stage, host) {
  return host.requests?.[stage.id]?.capabilities?.some(c => c !== 'read_files') || stage.permission === 'write_scoped';
}

function writes(stage, host) {
  return stage.permission === 'write_scoped' || (stage.permission === 'request_scoped' && host.requests?.[stage.id]?.capabilities?.includes('write_files'));
}

export function reconciliationBinding(task, stageId, host) {
  return digest({ intent: taskBinding(task), stage: stageId, step: task.steps[stageId], request: host.requests?.[stageId] });
}

export function recoveryBinding(task, host) {
  const checkpoint = recovered.get(task);
  return checkpoint ? digest({ checkpoint, intent: taskBinding(task), requests: host.requests, skillChecks: host.skillChecks }) : null;
}

function requirement(task, requirement, host) {
  return task.evidence.some(e => e.claims?.includes(requirement.claim)
    && e.task_binding === taskBinding(task) && e.operation_binding === operationBinding(host)
    && (!requirement.skill || e.skill === requirement.skill)
    && (!requirement.kind || e.kind === requirement.kind)
    && (requirement.kind !== 'review' || (e.kind === 'review' && e.independent === true && host.reviewBinding && e.review_basis === host.reviewBinding))
    && evidenceValidity(e, host).status === 'valid');
}

function stepEvidence(task, stage, host, executionAttempt = null) {
  const step = task.steps[stage.id];
  if (!evidenceFor(task, step.evidence_ids, host)) return false;
  const evidence = step.evidence_ids.map(id => task.evidence.find(e => e.id === id));
  const scoped = evidence.filter(e => e.skill === stage.skill && e.request_binding === digest(host.requests[stage.id]) && e.claims?.includes(`stage:${stage.id}`)
    && (executionAttempt === null || e.execution_attempt === executionAttempt));
  if (!scoped.length) return false;
  if (stage.skill === 'safe-code-review' && !scoped.some(e => e.kind === 'review' && e.independent === true
      && e.review_basis && e.review_basis === host.reviewBinding)) return false;
  if (stage.skill === 'bug-root-cause-analysis' && !scoped.some(e => e.signal_ids?.length
      && e.signal_ids.every(id => task.evidence.some(signal => signal.id === id && signal.kind === 'signal' && signal.task_binding === taskBinding(task)
        && evidenceValidity(signal, host).status === 'valid')))) return false;
  return true;
}

function unresolvedFailures(task, host) {
  const unresolved = [];
  for (const failed of task.evidence.filter(e => e.kind === 'test' && e.result === 'fail')) {
    const validity = evidenceValidity(failed, host);
    if (validity.status === 'stale' || validity.reason === 'source_not_attested') continue;
    if (validity.status === 'unknown') {
      unresolved.push(failed);
      continue;
    }
    const resolution = host.failureResolutions?.get(digest(failed));
    const replacement = resolution?.source && task.evidence.find(e => e.id === resolution.replacement);
    const identity = e => digest({ command: e.command, cwd: e.cwd, bindings: e.bindings, environment: e.environment });
    if (!replacement || replacement.task_binding !== taskBinding(task) || replacement.kind !== 'test'
        || evidenceValidity(replacement, host).status !== 'valid' || identity(replacement) !== identity(failed)
        || !(Date.parse(replacement.recorded_at) > Date.parse(failed.recorded_at))) {
      unresolved.push(failed);
    }
  }
  return unresolved;
}

/** Recompute a decision every time. No imported context field grants execution authority. */
export function nextAction(task, host) {
  assert(new Set(task.evidence.map(e => e.id)).size === task.evidence.length, 'Duplicate evidence IDs');
  const workflow = definition(task, host.registry, host.inventory);
  assert(Object.keys(task.steps).length === workflow.stages.length && workflow.stages.every(s => task.steps[s.id]), 'Task stages differ from Registry');
  if (!host.scopeReviewed) return { action: 'evidence_insufficient', reason: 'risk_and_dependency_scope_not_reviewed' };
  if (workflow.stages.length > 1 && !host.continuationAuthorized) return { action: 'permission_blocked', reason: 'continuous_workflow_not_authorized' };
  if (host.openDecisions?.length) return { action: 'decision_required', skill: 'requirements-clarification', reason: host.openDecisions.join(', ') };
  if (host.activeStops?.length) return { action: 'blocked', reason: host.activeStops.join(', ') };
  const recovery = recoveryBinding(task, host);
  const recoveryCheck = recovery && host.recoveryChecks?.get(recovery);
  if (recovery && (!recoveryCheck?.source || recoveryCheck.reconciled !== true)) return { action: 'blocked', reason: 'recovered_execution_state_needs_reconciliation' };
  // Unknown effects cannot disappear when an optional predicate or prerequisite changes.
  const inflight = workflow.stages.find(stage => ['running', 'interrupted'].includes(task.steps[stage.id].status));
  if (inflight) return { stage: inflight.id, skill: inflight.skill, action: 'blocked', reason: 'inflight_operation_needs_reconciliation' };
  const uncertain = workflow.stages.find(stage => task.steps[stage.id].effect_state === 'uncertain');
  if (uncertain) return { stage: uncertain.id, skill: uncertain.skill, action: 'validation_failed', reason: 'failed_operation_needs_reconciliation' };
  const completed = new Set();
  for (const stage of workflow.stages) {
    const step = task.steps[stage.id];
    if (stage.prerequisites.some(id => !completed.has(id))) continue;
    if (step.request_binding && step.request_binding !== digest(host.requests?.[stage.id])) {
      return { stage: stage.id, skill: stage.skill, action: 'evidence_insufficient', reason: 'operation_scope_changed' };
    }
    const applies = condition(task, stage.condition, host);
    const decision = { stage: stage.id, skill: stage.skill };
    const stopAssessments = [...new Set([...(workflow.stop_conditions ?? []), ...stage.stop_conditions])].map(name => [name, condition(task, name, host)]);
    const stop = stopAssessments.find(([, value]) => value === true);
    if (stop) return { ...decision, action: 'blocked', reason: `stop_condition:${stop[0]}` };
    const unknownStop = stopAssessments.find(([, value]) => value === undefined);
    if (unknownStop) return { ...decision, action: 'evidence_insufficient', reason: `stop_condition_unknown:${unknownStop[0]}` };
    if (applies === undefined) return { ...decision, action: 'evidence_insufficient', reason: `condition_unknown:${stage.condition}` };
    // Completed effects stay protected even when applicability changes. A new receipt
    // is not a reconciliation of the previous attempt's potentially different effects.
    const wasCompleted = ['completed', 'reused'].includes(step.status);
    const effectful = step.effect_state === 'known' || writes(stage, host)
      || host.requests?.[stage.id]?.capabilities?.some(c => c !== 'read_files');
    if (stage.type === 'skill' && wasCompleted) {
      const denied = permission(stage.skill, stage, task, host);
      if (denied) return { ...decision, action: 'permission_blocked', reason: denied };
      if (!stepEvidence(task, stage, host) && effectful) return { ...decision, action: 'blocked', reason: 'stale_write_result_needs_reconciliation' };
    }
    if (!applies) {
      if (!stage.optional) return { ...decision, action: 'evidence_insufficient', reason: `required_condition_false:${stage.condition}` };
      // Applicability must not erase a completed operation or its known effects.
      if (['completed', 'reused'].includes(step.status)) { completed.add(stage.id); continue; }
      if (step.status !== 'skipped' || step.condition_binding !== digest(host.conditions[stage.condition])) return { ...decision, action: 'skip', reason: `not_applicable:${stage.condition}` };
      completed.add(stage.id); continue;
    }
    if (stage.type === 'gate') {
      const children = workflow.stages.filter(s => s.approval_gate === stage.id);
      if (!children.length) return { ...decision, action: 'permission_blocked', reason: 'gate_has_no_consumer' };
      for (const child of children) {
        const denied = permission(child.skill, child, task, host);
        if (denied) return { ...decision, action: 'permission_blocked', reason: denied };
      }
      // Always re-evaluate gates against host grants, never reuse persisted approval.
      if (step.status !== 'completed') return { ...decision, action: 'approve', reason: 'existing_scoped_host_authorization' };
      completed.add(stage.id); continue;
    }
    const denied = permission(stage.skill, stage, task, host);
    if (denied) return { ...decision, action: 'permission_blocked', reason: denied };
    if (['completed', 'reused'].includes(step.status) && stepEvidence(task, stage, host)) {
      completed.add(stage.id); continue;
    }
    const failure = step.status === 'validation_failed';
    if (failure) return { ...decision, action: 'validation_failed', reason: step.reason || 'explicit_retry_required' };
    // Risk checks are additive obligations referencing existing Skills, not new workflows.
    if (potentiallyEffectful(stage, host)) {
      const gap = (host.risks ?? []).flatMap(r => host.registry.coordination?.risk_requirements?.[r]?.before_write ?? [{ claim: `unclassified-risk:${r}` }])
        .find(r => !requirement(task, r, host));
      if (gap) return { ...decision, action: 'risk_check', requirement: gap, reason: 'risk_requires_additional_evidence' };
    }
    const candidate = host.reuse?.[stage.id];
    if (candidate) {
      const provisional = copy(task); provisional.steps[stage.id].evidence_ids = candidate;
      if (stepEvidence(provisional, stage, host)) return { ...decision, action: 'reuse', evidence_ids: candidate, reason: 'valid_existing_result' };
    }
    if ((writes(stage, host) || step.effect_state === 'known' || host.requests[stage.id].capabilities.some(c => c !== 'read_files')) && ['completed', 'reused'].includes(step.status)) {
      return { ...decision, action: 'blocked', reason: 'stale_write_result_needs_reconciliation' };
    }
    const unresolved = unresolvedFailures(task, host).find(failed => {
      const repair = host.failureRepairs?.get(digest(failed));
      return !repair?.source || repair.stages?.[stage.id] !== digest(host.requests[stage.id]);
    });
    if (unresolved) return { ...decision, action: evidenceValidity(unresolved, host).status === 'unknown' ? 'evidence_insufficient' : 'validation_failed', reason: 'unresolved_current_test_failure', evidence_id: unresolved.id };
    return { ...decision, action: 'execute', reason: ['completed', 'reused'].includes(step.status) ? 'prior_evidence_stale_or_unknown' : 'applicable_stage', mode: host.execution === 'same_agent' ? 'same_agent' : 'manual_handoff' };
  }
  if (completed.size !== workflow.stages.length) return { action: 'evidence_insufficient', reason: 'unresolved_dependencies' };
  const obligations = [
    ...task.acceptance.map(id => ({ claim: `acceptance:${id}` })),
    ...([...completed].some(id => {
      const stage = workflow.stages.find(s => s.id === id);
      return task.steps[id].status !== 'skipped'
        && ['feature-implementation', 'safe-fix-implementation', 'safe-test-implementation'].includes(stage.skill);
    }) ? [{ claim: 'behavior-validation', kind: 'test' }] : []),
    ...(host.deliveryRequirements ?? []),
    ...(host.risks ?? []).flatMap(r => {
      const rules = host.registry.coordination?.risk_requirements?.[r];
      return rules ? [...rules.before_write, ...rules.before_delivery] : [{ claim: `unclassified-risk:${r}` }];
    }),
  ];
  const failure = unresolvedFailures(task, host)[0];
  if (failure) return { action: evidenceValidity(failure, host).status === 'unknown' ? 'evidence_insufficient' : 'validation_failed', reason: 'unresolved_current_test_failure', evidence_id: failure.id };
  const missing = obligations.filter(r => !requirement(task, r, host));
  if (task.unresolved.length || missing.length) return { action: 'evidence_insufficient', reason: 'delivery_not_proven', missing };
  return { action: 'complete', reason: 'applicable_stages_and_acceptance_proven', release_authorized: false };
}

function event(task, stage, status, reason) {
  task.current_stage = stage;
  task.history.push({ sequence: task.history.length + 1, stage, status, reason });
}

export function advance(task, host) {
  const action = nextAction(task, host);
  if (['skip', 'approve', 'reuse', 'execute'].includes(action.action)) {
    const step = task.steps[action.stage];
    step.status = { skip: 'skipped', approve: 'completed', reuse: 'reused', execute: 'running' }[action.action];
    step.reason = action.reason;
    if (['execute', 'reuse'].includes(action.action)) step.request_binding = digest(host.requests[action.stage]);
    if (action.action === 'execute') {
      step.attempts++;
      step.effect_state = host.requests[action.stage].capabilities.some(c => c !== 'read_files') ? 'uncertain' : 'none';
    }
    if (action.action === 'skip') {
      const stage = definition(task, host.registry, host.inventory).stages.find(s => s.id === action.stage);
      step.condition_binding = digest(host.conditions[stage.condition]);
    }
    if (action.action === 'reuse') step.effect_state = host.requests[action.stage].capabilities.some(c => c !== 'read_files') ? 'known' : 'none';
    if (action.evidence_ids) step.evidence_ids = action.evidence_ids;
    event(task, action.stage, step.status, action.reason);
  }
  task.next_actions = [action];
  return action;
}

export function finishStep(task, stageId, evidenceIds, host, failureReason = null) {
  const stage = definition(task, host.registry, host.inventory).stages.find(s => s.id === stageId);
  const step = task.steps[stageId];
  assert(stage && step?.status === 'running', 'Only a running stage may finish');
  assert(step.request_binding === digest(host.requests[stageId]), 'Operation scope changed while running');
  const denied = permission(stage.skill, stage, task, host);
  assert(!denied, denied);
  if (failureReason) { step.status = 'validation_failed'; step.reason = failureReason; step.evidence_ids = [...evidenceIds]; }
  else {
    const provisional = copy(task); provisional.steps[stageId].evidence_ids = evidenceIds;
    assert(stepEvidence(provisional, stage, host, step.attempts), 'Completion requires valid, scoped current-attempt evidence and independent review');
    step.evidence_ids = [...evidenceIds]; step.status = 'completed'; step.effect_state = step.effect_state === 'none' ? 'none' : 'known';
  }
  event(task, stageId, step.status, failureReason || 'observed_completion');
}

/** Reopening is an explicit host decision; only descendants are reopened.
 * Evidence is retained, so still-valid independent checks can be reused.
 */
export function reopen(task, stageId, host, { reason, source, safeToRetry = false } = {}) {
  assert(reason && source, 'Reopen requires a sourced reason');
  const workflow = definition(task, host.registry, host.inventory);
  assert(task.steps[stageId], 'Unknown stage');
  const affected = new Set([stageId]);
  let changed = true;
  while (changed) { changed = false; for (const stage of workflow.stages) {
    if (!affected.has(stage.id) && stage.prerequisites.some(id => affected.has(id))) { affected.add(stage.id); changed = true; }
  } }
  for (const id of affected) {
    const stage = workflow.stages.find(s => s.id === id);
    if (['running', 'interrupted'].includes(task.steps[id].status)
        || task.steps[id].effect_state === 'uncertain'
        || ((writes(stage, host) || task.steps[id].effect_state === 'known' || host.requests?.[id]?.capabilities?.some(c => c !== 'read_files')) && ['completed', 'reused', 'validation_failed'].includes(task.steps[id].status))) {
      assert(safeToRetry && host.reconciled?.has(reconciliationBinding(task, id, host)), 'Unknown side effects must be reconciled before retry');
    }
  }
  for (const id of affected) {
    const previous = task.steps[id].request_binding;
    task.steps[id].status = 'pending'; task.steps[id].effect_state = 'reconciled';
    delete task.steps[id].request_binding;
    event(task, id, 'pending', `${reason} (${source})`);
    if (previous) task.history.at(-1).previous_request_binding = previous;
  }
}

export function encodeTask(task) { return JSON.stringify(task, null, 2) + '\n'; }
export function restoreTask(serialized, registry, inventory) {
  const task = JSON.parse(serialized);
  assert(task.schema_version === 2 && task.id && task.goal && Array.isArray(task.acceptance) && task.acceptance.length, 'Invalid Task Context');
  assert(Boolean(task.workflow_id) !== Boolean(task.skill_id), 'Choose one registered workflow or one existing Skill');
  assert(task.acceptance.every(item => typeof item === 'string' && item.length)
    && new Set(task.acceptance).size === task.acceptance.length, 'Invalid acceptance IDs');
  const shape = createTask({ id: task.id, goal: task.goal, acceptance: task.acceptance, workflow_id: task.workflow_id, skill_id: task.skill_id }, registry, inventory);
  assert(Object.keys(task).every(key => Object.hasOwn(shape, key)) && Object.keys(shape).every(key => Object.hasOwn(task, key)), 'Unexpected or missing Task Context fields');
  for (const name of ['decisions', 'risks', 'permission_refs', 'evidence', 'changes', 'unresolved', 'history', 'next_actions']) assert(Array.isArray(task[name]), `Invalid ${name}`);
  assert(task.scope && Array.isArray(task.scope.files) && Array.isArray(task.scope.modules) && Array.isArray(task.scope.interfaces), 'Invalid scope');
  runtimeTasks.add(task);
  const workflow = definition(task, registry, inventory);
  assert(task.steps && Object.keys(task.steps).length === workflow.stages.length, 'Invalid step set');
  for (const stage of workflow.stages) {
    const step = task.steps[stage.id];
    assert(step && states.has(step.status) && Number.isInteger(step.attempts) && step.attempts >= 0 && Array.isArray(step.evidence_ids), 'Invalid step state');
    if (step.status === 'running') step.status = 'interrupted';
  }
  assert(new Set(task.evidence.map(e => e.id)).size === task.evidence.length, 'Duplicate evidence IDs');
  // No grants, trustedEvidence, capabilities, conditions or runtime commands restored.
  task.next_actions = [];
  recovered.set(task, { checkpoint: digest(task), import_id: randomUUID() });
  return task;
}
