// Candidate gate supplements, and never replaces, the existing stable full-corpus gate.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { liveEvidenceBinding, assertLiveEvidenceBinding } from './live-evidence-binding.mjs';
import { discoverSkillInventory } from './validate-workflows.mjs';
import { reviewAccepted, observedPermissionViolations } from './coordination-trial-events.mjs';
export function inspectCoordinationRelease(root, report, version) {
  const errors = [];
  const inventory = discoverSkillInventory(root);
  try { assertLiveEvidenceBinding(report.content_binding, liveEvidenceBinding(root)); }
  catch (error) { errors.push(error.message); }
  if (report.project_version !== version) errors.push('Coordination trial belongs to another project version');
  if (report.result !== 'PASS') errors.push('Coordination trial did not pass');
  const cases = report.cases ?? [];
  for (const name of ['simple', 'workflow', 'core-review']) {
    const selected = cases.filter(c => c.case === name);
    if (selected.length !== 1) { errors.push(`Expected one ${name} trial`); continue; }
    const testCase = selected[0];
    if (testCase.result !== (name === 'core-review' ? 'REVIEW_COMPLETED' : 'PASS')) errors.push(`${name} trial failed`);
    const runs = testCase.runs ?? [testCase.run];
    if (runs.length !== (name === 'workflow' ? 3 : 1)) errors.push(`${name}: wrong number of observed turns`);
    if (name === 'workflow' && !['gap','regression','review'].every(id => runs.some(r => r?.id === id))) errors.push('Workflow lacks freshly observed stages');
    const expectedSkills = { simple: 'documentation-sync', gap: 'test-gap-analysis', regression: 'safe-test-implementation', review: 'safe-code-review', 'core-review': 'safe-code-review' };
    for (const run of runs) {
      if (!run?.completed || run.exit_code !== 0 || !run.usage || run.permission_violations?.length !== 0) errors.push(`${name}: incomplete or unauthorized run`);
      const loaded = run?.host_loaded_skill;
      if (!loaded?.slug || !/^[a-z0-9-]+$/.test(loaded.slug)) { errors.push(`${name}: installed Skill source not verified`); continue; }
      if (loaded.slug !== expectedSkills[run.id]) errors.push(`${name}: stage used the wrong Skill`);
      const metadata = inventory.get(loaded.slug);
      if (!metadata || !Array.isArray(run.commands) || !Array.isArray(run.tools) || observedPermissionViolations(run, metadata.permissions).length) errors.push(`${name}: actual tool events violate permissions`);
      try {
        const hash = createHash('sha256').update(readFileSync(path.join(root, 'skills', loaded.slug, 'SKILL.md'))).digest('hex');
        if (hash !== loaded.sha256) errors.push(`${name}: installed Skill content changed`);
      } catch { errors.push(`${name}: installed Skill unavailable`); }
      if (['review','core-review'].includes(run.id) && (!reviewAccepted(run.final_answer) || run.sandbox !== 'read-only')) errors.push(`${name}: independent review not accepted`);
    }
    if (name === 'simple' && (testCase.changed_files?.length !== 1 || testCase.changed_files[0] !== 'README.md')) errors.push('Simple trial changed an unexpected scope');
    if (name === 'core-review' && testCase.changed_files?.length !== 0) errors.push('Core review was not read-only');
    if (name === 'workflow') {
      if (testCase.changed_files?.length !== 1 || testCase.changed_files[0] !== 'tests/cart.test.mjs') errors.push('Workflow changed an unexpected scope');
      if (testCase.focused_test?.exit_code !== 0 || !Number.isInteger(testCase.focused_test?.test_count) || testCase.focused_test.test_count < 3 || !Number.isInteger(testCase.mutation_sensitivity?.exit_code) || testCase.mutation_sensitivity.exit_code <= 0) errors.push('Workflow verification or sensitivity absent');
      if (!testCase.resumed_from_checkpoint || testCase.final_action_before_invalidation?.action !== 'complete') errors.push('Workflow did not safely resume and complete');
      if (testCase.incremental?.afterUnrelated?.[0]?.action !== 'reuse' || testCase.incremental?.afterRelated?.[0]?.action !== 'rerun') errors.push('Incremental evidence behavior not verified');
    }
  }
  return errors;
}
