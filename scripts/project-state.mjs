/** Local checkpoints are data only. No command execution or restored host authority. */
import { createHash, randomUUID } from 'node:crypto';
import { lstatSync, realpathSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { safePath, readJson, ensureDirectory, withLock, writeJson } from './local-state-files.mjs';
import { workspaceRuntime } from './workspace-runtime.mjs';

const CONFIG = '.repo-doctor/project.json';
const DOCS = ['AGENTS.md', 'README.md', 'README.zh-CN.md', 'CONTRIBUTING.md', 'GLOSSARY.md', 'CLAUDE.md'];
const SOURCES = [
  'package.json', 'package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml',
  'yarn.lock', 'bun.lock', 'bun.lockb', 'CMakeLists.txt', 'Makefile',
  'Cargo.toml', 'Cargo.lock', 'go.mod', 'go.sum', 'pyproject.toml', 'requirements.txt',
  ...DOCS,
];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HASH = /^[a-f0-9]{64}$/;
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
function assert(value, message) {
  if (!value) throw new Error(message);
}
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const binding = root => createHash('sha256').update(realpathSync(root)).digest('hex');
function checkRoot(root) {
  const actual = realpathSync(root);
  assert(actual !== path.parse(actual).root, 'Project root must not be a filesystem root');
}
function taskPath(id) {
  validateId(id);
  return `.repo-doctor/tasks/${id}.json`;
}
function nextRevision(revision) {
  assert(Number.isSafeInteger(revision) && revision > 0 && revision < Number.MAX_SAFE_INTEGER, 'Revision overflow');
  return revision + 1;
}
function validateId(id) {
  assert(typeof id === 'string' && id.length <= 64 && ID.test(id), 'Invalid task ID: use lowercase letters, digits and hyphens (maximum 64)');
}
function keys(value, allowed, label) {
  assert(plain(value) && Object.keys(value).length === allowed.length && allowed.every(key => Object.hasOwn(value, key)), `Invalid ${label} fields`);
}
function exists(root, relative) {
  try { return lstatSync(safePath(root, relative)); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function fingerprint(root, relative, runtime) {
  safePath(root, relative);
  return runtime.fingerprint(root, relative);
}
function validateBindings(root, dependencies) {
  assert(Array.isArray(dependencies), 'Invalid dependency bindings');
  const seen = new Set();
  for (const item of dependencies) {
    keys(item, ['path', 'fingerprint'], 'dependency');
    safePath(root, item.path);
    assert(!seen.has(item.path) && (item.fingerprint === 'missing' || HASH.test(item.fingerprint)), 'Invalid dependency binding');
    seen.add(item.path);
  }
}
function validateConfig(root, config) {
  keys(config, ['schema_version', 'kind', 'id', 'root_binding', 'revision', 'commands', 'documents', 'sources', 'environment_safety'], 'project');
  assert(config.schema_version === 1 && config.kind === 'repo-doctor-project' && UUID.test(config.id)
    && config.root_binding === binding(root) && Number.isSafeInteger(config.revision) && config.revision > 0
    && config.environment_safety === 'unverified', 'Invalid project identity or root binding');
  assert(Array.isArray(config.commands) && Array.isArray(config.documents), 'Invalid project discovery');
  for (const command of config.commands) {
    keys(command, ['manager', 'script'], 'command reference');
    assert(['npm', 'pnpm', 'yarn', 'bun'].includes(command.manager) && typeof command.script === 'string'
      && /^[a-zA-Z0-9:_-]+$/.test(command.script), 'Invalid package script reference');
  }
  for (const document of config.documents) {
    assert(DOCS.includes(document), 'Invalid document path');
    safePath(root, document);
  }
  validateBindings(root, config.sources);
  assert(config.sources.length === SOURCES.length && SOURCES.every(source => config.sources.some(item => item.path === source)), 'Invalid project source coverage');
  return config;
}
function loadConfig(root) {
  checkRoot(root);
  assert(exists(root, CONFIG), 'Project is not initialized');
  const config = readJson(root, CONFIG);
  return validateConfig(root, config);
}
function drift(root, dependencies, runtime) {
  return dependencies.filter(item => fingerprint(root, item.path, runtime) !== item.fingerprint).map(item => item.path);
}

function ensurePrivateIgnore(root) {
  const relative = '.repo-doctor/.gitignore';
  const filename = safePath(root, relative);
  try {
    writeFileSync(filename, '*\n', { flag: 'wx', mode: 0o600 });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    // Preserve user-authored rules, while refusing links and non-file state paths.
    assert(exists(root, relative)?.isFile(), 'Local ignore rules must be a regular file');
  }
}

function discoverProject(root, runtime, identity) {
  const sources = SOURCES.map(relative => ({
    path: relative,
    fingerprint: fingerprint(root, relative, runtime),
  }));
  const packageInfo = readJson(root, 'package.json', { optional: true });
  assert(packageInfo === null || plain(packageInfo), 'Invalid package manifest');
  if (packageInfo?.scripts !== undefined) {
    assert(plain(packageInfo.scripts) && Object.values(packageInfo.scripts).every(value => typeof value === 'string'),
      'Invalid package script definitions');
  }
  let manager = 'npm';
  if (exists(root, 'pnpm-lock.yaml')) manager = 'pnpm';
  else if (exists(root, 'yarn.lock')) manager = 'yarn';
  else if (exists(root, 'bun.lock') || exists(root, 'bun.lockb')) manager = 'bun';
  const commands = Object.keys(packageInfo?.scripts ?? {})
    .filter(script => /^[a-zA-Z0-9:_-]+$/.test(script))
    .sort()
    .map(script => ({ manager, script }));
  return {
    schema_version: 1,
    kind: 'repo-doctor-project',
    id: identity.id,
    root_binding: binding(root),
    revision: identity.revision,
    commands,
    documents: DOCS.filter(relative => exists(root, relative)?.isFile()),
    sources,
    environment_safety: 'unverified',
  };
}

export async function refreshProject(root, { apply = false, expectedRevision } = {}) {
  assert(typeof apply === 'boolean', 'Apply must be a boolean');
  const runtime = await workspaceRuntime();
  const previous = loadConfig(root);
  if (expectedRevision !== undefined) {
    assert(Number.isSafeInteger(expectedRevision) && expectedRevision > 0, 'Expected revision is required');
    assert(previous.revision === expectedRevision, 'Project revision conflict');
  }
  if (!apply) {
    const project = discoverProject(root, runtime, {
      id: previous.id,
      revision: nextRevision(previous.revision),
    });
    validateConfig(root, project);
    return { applied: false, status: 'PREVIEW', expectedRevision: previous.revision, project };
  }
  assert(Number.isSafeInteger(expectedRevision) && expectedRevision > 0, 'Expected revision is required');
  return withLock(root, '.repo-doctor/project.lock', () => {
    const current = loadConfig(root);
    assert(current.revision === expectedRevision, 'Project revision conflict');
    const project = discoverProject(root, runtime, {
      id: current.id,
      revision: nextRevision(current.revision),
    });
    validateConfig(root, project);
    writeJson(root, CONFIG, project);
    return { applied: true, status: 'REFRESHED', project };
  });
}

export async function initProject(root, { apply = false } = {}) {
  checkRoot(root);
  assert(typeof apply === 'boolean', 'Apply must be a boolean');
  const runtime = await workspaceRuntime();
  if (exists(root, CONFIG)) {
    const result = { applied: false, existing: true, ...await checkProject(root) };
    if (!apply) return result;
    return withLock(root, '.repo-doctor/project.lock', () => {
      loadConfig(root);
      ensurePrivateIgnore(root);
      return result;
    });
  }
  const project = discoverProject(root, runtime, { id: randomUUID(), revision: 1 });
  validateConfig(root, project);
  if (!apply) return { applied: false, existing: false, status: 'PREVIEW', project };
  ensureDirectory(root, '.repo-doctor');
  return withLock(root, '.repo-doctor/project.lock', () => {
    const concurrent = readJson(root, CONFIG, { optional: true });
    if (exists(root, CONFIG)) {
      validateConfig(root, concurrent);
      ensurePrivateIgnore(root);
      return { applied: false, existing: true, project: concurrent };
    }
    ensurePrivateIgnore(root);
    writeJson(root, CONFIG, project);
    return { applied: true, existing: false, status: 'INITIALIZED', project };
  });
}

export async function checkProject(root) {
  const runtime = await workspaceRuntime();
  const project = loadConfig(root);
  const changed_paths = drift(root, project.sources, runtime);
  return { status: changed_paths.length ? 'STALE' : 'CURRENT', changed_paths, project, environment_safety: 'unverified' };
}

const FORBIDDEN = new Set(['grants', 'conditions', 'capabilities', 'trustedEvidence', 'skillChecks', 'recoveryChecks', 'recoveredExecutionChecks', 'reconciled', 'failureRepairs', 'failureResolutions']);
function rejectAuthority(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert(!FORBIDDEN.has(key), 'Host authority cannot be persisted in Task Context');
    rejectAuthority(child);
  }
}
function validateContext(context, id, runtime, { allowRegistryChanged = false } = {}) {
  keys(context, [
    'schema_version', 'id', 'goal', 'acceptance', 'workflow_id', 'skill_id',
    'registry_binding', 'decisions', 'scope', 'risks', 'permission_refs', 'evidence',
    'changes', 'unresolved', 'next_actions', 'current_stage', 'steps', 'history',
  ], 'Task Context');
  assert(context.schema_version === 2 && context.id === id
    && typeof context.goal === 'string' && context.goal.trim(), 'Invalid task context identity or goal');
  assert(Array.isArray(context.acceptance) && context.acceptance.length > 0
    && context.acceptance.every(item => typeof item === 'string' && item.length > 0)
    && new Set(context.acceptance).size === context.acceptance.length, 'Invalid acceptance IDs');
  assert((typeof context.workflow_id === 'string' && context.workflow_id.length > 0 && context.skill_id === null)
    || (typeof context.skill_id === 'string' && context.skill_id.length > 0 && context.workflow_id === null),
  'Invalid task Skill/workflow identity');
  assert(typeof context.registry_binding === 'string' && HASH.test(context.registry_binding), 'Invalid registry binding');
  for (const name of ['decisions', 'risks', 'permission_refs', 'evidence', 'changes', 'unresolved', 'history', 'next_actions']) {
    assert(Array.isArray(context[name]), 'Invalid Task Context array');
  }
  keys(context.scope, ['files', 'modules', 'interfaces'], 'scope');
  assert(Object.values(context.scope).every(Array.isArray), 'Invalid scope');
  assert(plain(context.steps) && Object.keys(context.steps).length > 0, 'Invalid step set');
  const statuses = new Set([
    'pending', 'running', 'completed', 'reused', 'skipped', 'evidence_insufficient',
    'permission_blocked', 'validation_failed', 'interrupted',
  ]);
  for (const step of Object.values(context.steps)) {
    assert(plain(step) && statuses.has(step.status) && Number.isSafeInteger(step.attempts)
      && step.attempts >= 0 && Array.isArray(step.evidence_ids), 'Invalid step state');
  }
  assert(context.current_stage === null || (typeof context.current_stage === 'string'
    && Object.hasOwn(context.steps, context.current_stage)), 'Invalid current stage');
  assert(context.evidence.every(plain)
    && new Set(context.evidence.map(item => item.id)).size === context.evidence.length, 'Invalid evidence records');
  rejectAuthority(context);
  const registryChanged = context.registry_binding !== runtime.digest(runtime.registry);
  if (registryChanged) {
    assert(allowRegistryChanged, 'Registry changed; explicitly migrate/reselect workflow');
    return;
  }
  runtime.restoreTask(runtime.encodeTask(context), runtime.registry, runtime.inventory);
}
function collectDependencies(root, context, runtime) {
  const paths = new Set();
  for (const relative of context.scope.files) {
    safePath(root, relative);
    paths.add(relative);
  }
  let complete = paths.size > 0 && context.scope.modules.length === 0 && context.scope.interfaces.length === 0;
  for (const evidence of context.evidence) {
    assert(plain(evidence), 'Invalid evidence record');
    if (!Array.isArray(evidence.dependencies) || !evidence.dependencies.length) complete = false;
    else {
      for (const relative of evidence.dependencies) {
        safePath(root, relative);
        paths.add(relative);
      }
    }
    if (evidence.coverage_complete !== true) complete = false;
  }
  return { dependencies: [...paths].sort().map(relative => ({ path: relative, fingerprint: fingerprint(root, relative, runtime) })), dependency_coverage: complete ? 'recorded' : 'unknown' };
}
function validateRecord(root, record, id, project, runtime, options) {
  keys(record, ['schema_version', 'kind', 'project_id', 'root_binding', 'id', 'revision', 'context', 'dependencies', 'dependency_coverage'], 'task record');
  assert(record.schema_version === 1 && record.kind === 'repo-doctor-task', 'Invalid task record schema');
  assert(record.id === id && record.project_id === project.id
    && record.root_binding === binding(root), 'Invalid task identity or root binding');
  assert(Number.isSafeInteger(record.revision) && record.revision > 0, 'Invalid task revision identity');
  assert(['recorded', 'unknown'].includes(record.dependency_coverage), 'Invalid dependency coverage');
  validateContext(record.context, id, runtime, options);
  validateBindings(root, record.dependencies);
  const current = collectDependencies(root, record.context, runtime);
  assert(current.dependencies.length === record.dependencies.length
    && current.dependencies.every(item => record.dependencies.some(saved => saved.path === item.path))
    && current.dependency_coverage === record.dependency_coverage, 'Invalid task dependency coverage');
  return record;
}
function loadRecord(root, id, project, runtime, options) {
  return validateRecord(root, readJson(root, taskPath(id)), id, project, runtime, options);
}
function recordFor(root, project, id, revision, context, runtime) {
  validateContext(context, id, runtime);
  // Keep the original context (including running states and history); restore only validates a copy.
  return {
    schema_version: 1,
    kind: 'repo-doctor-task',
    project_id: project.id,
    root_binding: binding(root),
    id,
    revision,
    context: JSON.parse(runtime.encodeTask(context)),
    ...collectDependencies(root, context, runtime),
  };
}

export async function createProjectTask(root, { id, goal, acceptance, skill = null, workflow = null } = {}) {
  validateId(id);
  const runtime = await workspaceRuntime();
  const project = loadConfig(root);
  assert(typeof goal === 'string' && goal.trim(), 'Goal is required');
  const context = runtime.createTask({ id, goal, acceptance, skill_id: skill, workflow_id: workflow }, runtime.registry, runtime.inventory);
  const record = recordFor(root, project, id, 1, context, runtime);
  ensureDirectory(root, '.repo-doctor/tasks');
  return withLock(root, '.repo-doctor/project.lock', () => {
    assert(!exists(root, taskPath(id)), 'Task already exists');
    writeJson(root, taskPath(id), record);
    return { status: 'CREATED', ...record, requires_host_revalidation: true };
  });
}

export async function saveProjectTask(root, { id, context, expectedRevision } = {}) {
  validateId(id);
  assert(Number.isSafeInteger(expectedRevision) && expectedRevision > 0, 'Expected revision is required');
  const runtime = await workspaceRuntime();
  const project = loadConfig(root);
  return withLock(root, '.repo-doctor/project.lock', () => {
    const previous = loadRecord(root, id, project, runtime);
    assert(previous.revision === expectedRevision, 'Task revision conflict');
    const record = recordFor(root, project, id, nextRevision(previous.revision), context, runtime);
    assert(record.context.skill_id === previous.context.skill_id && record.context.workflow_id === previous.context.workflow_id,
      'Task Skill/workflow identity cannot change');
    assert(previous.context.history.every((entry, index) =>
      JSON.stringify(record.context.history[index]) === JSON.stringify(entry)),
    'Task history cannot be removed or rewritten');
    assert(previous.context.evidence.every(entry => record.context.evidence.some(current =>
      current.id === entry.id && JSON.stringify(current) === JSON.stringify(entry))),
    'Recorded evidence cannot be removed or rewritten');
    writeJson(root, taskPath(id), record);
    return { status: 'SAVED', ...record, requires_host_revalidation: true };
  });
}

export async function listProjectTasks(root) {
  const runtime = await workspaceRuntime();
  const project = loadConfig(root);
  const directory = exists(root, '.repo-doctor/tasks');
  if (!directory) return { tasks: [] };
  assert(directory.isDirectory(), 'Task storage must be a directory');
  const tasks = [];
  for (const name of readdirSync(safePath(root, '.repo-doctor/tasks')).sort()) {
    assert(name.endsWith('.json'), 'Unexpected entry in task storage');
    const id = name.slice(0, -5);
    const record = loadRecord(root, id, project, runtime, { allowRegistryChanged: true });
    tasks.push({ id, revision: record.revision, skill: record.context.skill_id, workflow: record.context.workflow_id });
  }
  return { tasks };
}

export async function resumeProjectTask(root, { id } = {}) {
  validateId(id);
  const runtime = await workspaceRuntime();
  const project = loadConfig(root);
  const record = loadRecord(root, id, project, runtime, { allowRegistryChanged: true });
  const changed_paths = [...new Set([
    ...drift(root, project.sources, runtime),
    ...drift(root, record.dependencies, runtime),
  ])];
  const registry_changed = record.context.registry_binding !== runtime.digest(runtime.registry);
  // A changed registry cannot be restored by the core. Keep historical data on disk
  // and return no executable in-memory context until explicit migration/reselection.
  const context = registry_changed ? null
    : runtime.restoreTask(runtime.encodeTask(record.context), runtime.registry, runtime.inventory);
  return {
    id,
    revision: record.revision,
    context,
    status: registry_changed || changed_paths.length ? 'STALE' : 'UNKNOWN',
    changed_paths,
    registry_changed,
    needs_migration: registry_changed,
    source_context: registry_changed ? taskPath(id) : null,
    dependency_coverage: record.dependency_coverage,
    requires_host_revalidation: true,
  };
}
