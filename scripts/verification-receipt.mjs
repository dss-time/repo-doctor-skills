import { lstatSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { changeGuardPathLabels, runChangeGuard, validateChangeGuardId } from './change-guard.mjs';
import { credentialFindings } from './credential-findings.mjs';
import { safePath } from './local-state-files.mjs';
import { inspectProjectTask, projectGuardPolicy, validateGuardPaths } from './project-state.mjs';

const levels = ['info', 'warning', 'violation', 'unknown'];
const coverageLimits = {
  ignored_paths_and_hidden_index_entries_not_observed: 'Git-ignored files and hidden index entries are outside observation.',
  submodule_internal_edits_not_observed: 'Submodule internal edits are outside observation.',
  observations_are_not_atomic: 'Observations are not atomic and may miss transient or concurrent writes.',
  configured_git_filters_disabled: 'Configured Git filters were disabled during observation.',
  missing_or_unavailable_baseline: 'Without an observable baseline comparison, changes and preexisting edits are unknown.',
  declarations_do_not_grant_authority: 'Declared scope and project policy are recorded for review. Actual authorization must be checked separately.',
  change_ownership_unknown: 'Change Guard cannot determine who made a change.',
  execution_not_reattested: 'Export does not run tests or restore host attestations. Dependency matches apply only to the recorded inputs.',
  business_behavior_not_verified_by_guard: 'Change Guard observes Git-visible worktree changes. Business behavior requires its own verification.',
  sensitive_metadata_omitted: 'Sensitive configuration paths and credential-like metadata may be omitted.',
};

function shareable(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 1024
    && !/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(value)
    && !credentialFindings(value).length && !credentialFindings(value.normalize('NFKC')).length;
}

function goalText(value) {
  // The goal is the only free-form field. Exclude multiline material, paths to
  // local machines, and common inline code or environment assignment syntax.
  return shareable(value) && !/[<>{}=$\x60\\]/.test(value)
    && !/(?:^|[\s("'])~?\//.test(value) ? value : null;
}

function pathLabel(value) {
  return shareable(value) && !changeGuardPathLabels(value).includes('sensitive_configuration') ? value : null;
}

function safeIdentifier(value) {
  return shareable(value) && /^[a-z0-9][a-z0-9._:-]{0,95}$/i.test(value) ? value : null;
}

function observe(root, id) {
  try { return runChangeGuard(root, 'check', { id }); }
  catch { return { status: 'unknown', findings: [{ level: 'unknown', code: 'baseline_or_workspace_unavailable' }] }; }
}

function observedChanges(guard) {
  const byPath = new Map();
  const findings = (guard.findings ?? []).map(item => {
    if (!byPath.has(item.path)) byPath.set(item.path, new Set());
    byPath.get(item.path).add(item.level);
    return {
      level: item.level,
      code: safeIdentifier(item.code) ?? 'detail_omitted',
      ...(item.path !== undefined ? { path: pathLabel(item.path) } : {}),
      ...(item.original_path !== undefined ? { original_path: pathLabel(item.original_path) } : {}),
    };
  });
  // Disabled filters limit coverage but do not erase Git-visible observations.
  const coverageUnknown = !Array.isArray(guard.changes) || findings.some(item =>
    item.level === 'unknown' && item.code !== 'configured_git_filters_disabled');
  const indicator = predicate => guard.changes?.some(predicate) ? 'observed' : coverageUnknown ? 'unknown' : 'not_observed';
  return {
    status: guard.status === 'missing_baseline' ? 'unknown' : guard.status,
    source: 'change_guard_check',
    preexisting_touched: indicator(item => item.preexisting),
    dependency_changed: indicator(item => item.labels.includes('dependency')),
    sensitive_configuration_changed: indicator(item => item.labels.includes('sensitive_configuration')),
    changes: guard.changes?.map(item => ({
      path: pathLabel(item.path),
      ...(item.original_path !== undefined ? { original_path: pathLabel(item.original_path) } : {}),
      kind: item.kind,
      levels: levels.filter(level => byPath.get(item.path)?.has(level)),
      preexisting: item.preexisting,
      labels: item.labels.map(safeIdentifier).filter(Boolean),
      origin: 'unknown',
      ...(item.type_changed ? { type_changed: true } : {}),
      ...(item.executable_changed ? { executable_changed: true } : {}),
    })) ?? null,
    findings,
  };
}

function verificationEvidence(task) {
  const entries = (task?.evidence ?? []).map(item => {
    const stale = task.stale || item.dependency_match === 'mismatch';
    return {
      id: safeIdentifier(item.id),
      kind: ['test', 'signal', 'review', 'analysis', 'check'].includes(item.kind) ? item.kind : 'other',
      recorded_result: ['pass', 'fail'].includes(item.result) ? item.result : 'unknown',
      status: stale ? 'STALE' : item.verification_deferred ? 'verification_deferred' : 'UNKNOWN',
      dependency_match: item.dependency_match,
      execution_attestation: 'unknown',
      ...(Number.isSafeInteger(item.exit_code) ? { recorded_exit_code: item.exit_code } : {}),
      ...(typeof item.recorded_at === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(item.recorded_at)
        ? { recorded_at: item.recorded_at } : {}),
    };
  });
  let status = 'not_recorded';
  if (task?.verification_deferred || task?.evidence.some(item => item.verification_deferred)) status = 'verification_deferred';
  else if (task?.stale || entries.some(item => item.status === 'STALE')) status = 'STALE';
  else if (task === undefined || entries.length) status = 'UNKNOWN';
  return {
    status,
    dependency_coverage: task?.dependency_coverage ?? 'unknown',
    entries,
  };
}

export async function buildVerificationReceipt(root, id) {
  validateChangeGuardId(id);
  root = realpathSync(root);
  if (root === path.parse(root).root) throw new Error('Project root must not be a filesystem root');
  if (!lstatSync(root).isDirectory()) throw new Error('Project root must be a directory');
  const guard = observe(root, id);
  let policy;
  try { policy = projectGuardPolicy(root); } catch { /* Unavailable project state remains unknown. */ }
  let task;
  try { task = await inspectProjectTask(root, { id }); } catch { /* Unreadable checkpoints are never used as evidence. */ }
  const limits = new Set([
    'ignored_paths_and_hidden_index_entries_not_observed', 'submodule_internal_edits_not_observed', 'observations_are_not_atomic',
    ...(guard.limitations ?? []),
    ...(guard.changes ? [] : ['missing_or_unavailable_baseline']),
    'declarations_do_not_grant_authority', 'change_ownership_unknown', 'execution_not_reattested',
    'business_behavior_not_verified_by_guard', 'sensitive_metadata_omitted',
  ]);
  const goal = goalText(task?.goal);
  return {
    schema_version: 1,
    kind: 'verification_receipt',
    id: safeIdentifier(id),
    authorization_and_scope: {
      task: task ? { status: 'recorded', revision: task.revision, goal, goal_status: goal ? 'recorded' : 'omitted' }
        : { status: task === null ? 'not_recorded' : 'unknown', goal: null },
      declared_scope: guard.scope?.map(pathLabel) ?? null,
      scope_status: guard.scope?.length ? 'declared' : guard.scope ? 'not_declared' : 'unknown',
      protected_path_policy: {
        baseline: { status: guard.protected_paths ? 'captured' : 'unknown', paths: guard.protected_paths?.map(pathLabel) ?? null },
        current: { status: !policy ? 'unknown' : policy.project_id ? 'recorded' : 'not_recorded', paths: policy?.protected_paths.map(pathLabel) ?? null },
      },
    },
    observed_changes: observedChanges(guard),
    verification_evidence: verificationEvidence(task),
    coverage_limits: [...limits].filter(code => Object.hasOwn(coverageLimits, code)),
  };
}

function markdownText(value) {
  // Encode Markdown and HTML punctuation as entities, including backticks,
  // mentions and issue references. Untrusted values remain literal PR text.
  return String(value ?? '[omitted]').replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_\x60{|}~]/g, char => '&#' + char.charCodeAt(0) + ';');
}

function codeSpan(value) {
  if (value === null) return '[omitted]';
  const delimiter = '\x60'.repeat(1 + Math.max(0, ...(value.match(/\x60+/g) ?? []).map(run => run.length)));
  const padding = /^\x60|\x60$/.test(value) ? ' ' : '';
  return delimiter + padding + value + padding + delimiter;
}

const pathList = paths => paths?.map(codeSpan).join(', ') || '—';
const displayedPath = item => (Object.hasOwn(item, 'path') ? ' — ' + codeSpan(item.path) : '')
  + (Object.hasOwn(item, 'original_path') ? ' ← ' + codeSpan(item.original_path) : '');

function markdown(receipt) {
  const scope = receipt.authorization_and_scope;
  const observed = receipt.observed_changes;
  const evidence = receipt.verification_evidence;
  return [
    '# Verification Receipt', '',
    '## Authorization & Scope', '',
    '- Task ID: ' + codeSpan(receipt.id),
    '- Task record: ' + scope.task.status + (scope.task.revision ? ' (revision ' + scope.task.revision + ')' : ''),
    ...(scope.task.status === 'recorded' ? ['- Goal: ' + markdownText(scope.task.goal)] : []),
    '- Change Guard scope (' + scope.scope_status + '): ' + pathList(scope.declared_scope),
    '- Protected paths at baseline (' + scope.protected_path_policy.baseline.status + '): ' + pathList(scope.protected_path_policy.baseline.paths),
    '- Current protected paths (' + scope.protected_path_policy.current.status + '): ' + pathList(scope.protected_path_policy.current.paths), '',
    '## Observed Changes', '',
    '- Change Guard status: ' + observed.status,
    '- Preexisting edits touched: ' + observed.preexisting_touched,
    '- Dependency changes: ' + observed.dependency_changed,
    '- Sensitive configuration changes: ' + observed.sensitive_configuration_changed,
    ...(observed.changes === null ? ['- Changed paths: unknown']
      : observed.changes.length === 0 ? ['- No changed paths observed']
        : observed.changes.map(item => '- ' + item.kind + displayedPath(item) + ' (' + item.levels.join(', ')
          + (item.preexisting ? ', preexisting' : '') + (item.labels.length ? ', ' + item.labels.map(codeSpan).join(', ') : '') + ')')),
    ...observed.findings.filter(item => item.level !== 'info' || observed.changes === null)
      .map(item => '- **' + item.level + '** ' + codeSpan(item.code) + displayedPath(item)), '',
    '## Verification Evidence', '',
    '- Status: ' + evidence.status,
    '- Checkpoint dependency coverage: ' + evidence.dependency_coverage,
    ...evidence.entries.map(item => '- ' + codeSpan(item.id) + ' (' + item.kind + ')'
      + ' · recorded result: ' + item.recorded_result + ' · status: ' + item.status
      + ' · recorded dependencies: ' + item.dependency_match + ' · execution attestation: unknown'
      + (item.recorded_exit_code !== undefined ? ' · recorded exit code: ' + item.recorded_exit_code : '')
      + (item.recorded_at ? ' · ' + item.recorded_at : '')), '',
    '<details>',
    '<summary>Coverage Limits (' + receipt.coverage_limits.length + ')</summary>', '',
    ...receipt.coverage_limits.map(code => '- ' + coverageLimits[code]), '',
    '</details>', '',
  ].join('\n');
}

export function renderVerificationReceipt(receipt, format) {
  const json = JSON.stringify(receipt, null, 2) + '\n';
  const output = format === 'json' ? json : markdown(receipt);
  if (credentialFindings(json).length || credentialFindings(output).length) {
    throw new Error('Receipt contains possible credentials; no output was generated');
  }
  return output;
}

export function writeVerificationReceipt(root, relative, output) {
  validateGuardPaths([relative]);
  // Exclude device/stream spellings and Windows aliases on every platform.
  if (!pathLabel(relative) || /[:*?"<>|]|[. ](?:\/|$)|(?:^|\/)(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|\/|$)/i.test(relative)) {
    throw new Error('Expected a portable repository-relative output file');
  }
  const parent = path.posix.dirname(relative);
  const repository = realpathSync.native(root);
  const directory = parent === '.' ? repository : realpathSync.native(safePath(repository, parent));
  if (directory !== repository) {
    validateGuardPaths([path.relative(repository, directory).split(path.sep).join('/')]);
  }
  // State is read-only. Exclusive creation is sufficient here and cannot
  // replace an existing project file, checkpoint, hard link or destination link.
  writeFileSync(safePath(repository, relative), output, { flag: 'wx', mode: 0o600 });
}
