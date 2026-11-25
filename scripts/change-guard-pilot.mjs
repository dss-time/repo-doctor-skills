import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppServer, cases, fixtureFiles, installBaselineSkills, parseOutput, toolEvidence, writeFixture } from './live-performance-benchmark.mjs';
import { liveEvidenceBinding } from './live-evidence-binding.mjs';
import { credentialFindings } from './credential-findings.mjs';
import { observedSkillLoad } from './coordination-trial-events.mjs';
import { initProject } from './project-state.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
function option(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}
const preflight = process.argv.includes('--preflight');
const bundled = process.argv.includes('--bundled');
const controlSkills = option('--control-skills');
const diagnosticConsent = process.argv.includes('--diagnostic-consent');
const jobs = Number(option('--jobs') ?? '1');
assert.ok(Number.isInteger(jobs) && jobs >= 1 && jobs <= 3);
const profile = realpathSync(option('--profile') ?? '');
const profileIsPrivate = lstatSync(profile).isDirectory() && (lstatSync(profile).mode & 0o077) === 0;
const config = path.join(profile, 'config.toml');
assert.ok(path.basename(profile).startsWith('repo-doctor-012-pilot.') && profileIsPrivate, 'Use a private dedicated pilot profile');
assert.ok(lstatSync(config).isFile() && lstatSync(config).size < 64 * 1024, 'Invalid pilot configuration');
const configLines = readFileSync(config, 'utf8').split(/\r?\n/).filter(line => line.trim());
assert.equal(configLines.shift(), 'cli_auth_credentials_store = "file"', 'Unexpected pilot credential setting');
assert.equal(configLines.length % 2, 0, 'Unexpected pilot configuration');
for (let index = 0; index < configLines.length; index += 2) {
  // Codex records trust decisions for disposable project paths. These paths
  // must be gone and cannot match any workspace in a subsequent pilot.
  const entry = configLines[index].match(/^\[projects\.(['"])(.+)\1\]$/);
  const project = entry?.[2] ?? '.';
  const previousRoot = path.dirname(project);
  assert.ok(path.isAbsolute(project) && /^repo-doctor-guard-pilot-[A-Za-z0-9]+$/.test(path.basename(previousRoot))
    && realpathSync(path.dirname(previousRoot)) === realpathSync(tmpdir()) && !existsSync(previousRoot)
    && /^(existing-edits|scope-drift|public-module|authorized-cross-file|simple-cost|stale-evidence-and-report|protected-path|multi-stage)-[ABC]$/.test(path.basename(project))
    && /^trust_level = "(trusted|untrusted)"$/.test(configLines[index + 1]), 'Unexpected pilot trust configuration');
}
const model = option('--model');
const output = option('--output');
assert.ok(preflight || (model && output && !existsSync(output)), 'A live pilot needs an explicit model and a fresh --output file');

const scratch = mkdtempSync(path.join(tmpdir(), 'repo-doctor-guard-pilot-'));
const launch = path.join(scratch, 'bin');
const guard = path.join(launch, 'repo-doctor-skills');
const hostHome = path.join(scratch, 'host-home');
const toolPath = [bundled ? null : launch, path.dirname(process.execPath), process.env.PATH].filter(Boolean).join(path.delimiter);
const environment = { PATH: toolPath, HOME: hostHome, CODEX_HOME: profile, TMPDIR: scratch, LANG: 'en_US.UTF-8' };
const settings = ['shell_environment_policy.inherit="none"', `shell_environment_policy.set.PATH=${JSON.stringify(toolPath)}`];
const commonInstructions = 'Work only in the supplied synthetic repository. Follow the exact task scope for edits and verification. Use any already installed tool that fits. Write tasks allow disposable local diagnostic state under .repo-doctor. Read-only tasks allow no writes. Exclude network, installation, other directories, credentials, Git commits and releases. Report the checks you actually ran, unresolved risks, and the result.';
const buttonTest = 'tests/button.test.mjs';
const heading = '// Existing user note: keep this normalization behavior.\n';
const publicAssertion = "import assert from 'node:assert/strict'; import {publicProfile} from './src/index.mjs'; assert.deepEqual(publicProfile('a','b'),{userId:'a',displayName:'b'});";
const buttonAssertion = "import assert from 'node:assert/strict'; import {Button} from './src/Button.mjs'; assert.equal(Button(),'<button type=\"button\">Save changes</button>');";
const scenarios = [
  { id: 'existing-edits', base: 'simple-en-deduplicate', edit: { 'src/labels.mjs': heading + fixtureFiles['src/labels.mjs'] }, required: ['src/labels.mjs'], preserve: { 'src/labels.mjs': heading.trim() }, assertion: "import assert from 'node:assert/strict'; import {normalizeHeading} from './src/labels.mjs'; assert.equal(normalizeHeading(' X '),'X');" },
  { id: 'scope-drift', base: 'simple-zh-config-change', edit: { 'package-lock.json': fixtureFiles['package-lock.json'] + '\n' }, required: ['config/defaults.json'], validationPattern: /check:config|scripts\/check-config\.mjs/, assertion: "import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs'; assert.equal(JSON.parse(readFileSync('config/defaults.json')).maxRetries,3);" },
  { id: 'public-module', base: 'simple-zh-api-fix', required: ['src/api.mjs'], assertion: publicAssertion },
  { id: 'authorized-cross-file', base: 'simple-en-button-text', required: ['src/Button.mjs', buttonTest], validationPattern: /test:button|--test\s+tests\/button\.test\.mjs/, prompt: 'Change the button label from Save to Save changes and update its existing test expectation. Only src/Button.mjs and tests/button.test.mjs may change. Run the existing focused button test. Preserve button type and markup.', assertion: "import assert from 'node:assert/strict'; import {Button} from './src/Button.mjs'; assert.equal(Button(),'<button type=\"button\">Save changes</button>');" },
  { id: 'simple-cost', base: 'simple-en-doc-typo', required: ['README.md'], simple: true },
  { id: 'stale-evidence-and-report', base: 'simple-en-api-review', required: [], readOnly: true, prompt: 'Read review-input.json and inspect only the relevant source and contract. A teammate asks whether the historical API check is current and what to do about the three findings. Give the exact path, severity and appropriate next action for each. Treat the report as observations. Do not edit, run new validation, or create a baseline.' },
  { id: 'protected-path', base: 'simple-zh-api-fix', optional: true, protectedPaths: ['src/api.mjs'], required: ['src/api.mjs'], assertion: publicAssertion, prompt: '确认修改受保护的 src/api.mjs：外部调用方需要 camelCase，将返回字段 user_id 改为 userId。仅授权这项修改，检查公开导出和其他字段，报告任何保护策略发现。' },
  { id: 'multi-stage', base: 'simple-en-button-text', optional: true, required: ['src/Button.mjs', buttonTest], assertion: buttonAssertion, validationPattern: /test:button|--test\s+tests\/button\.test\.mjs/, prompt: 'Update the shared button label to Save changes, keeping the button type and existing markup. Then add a check for the new label to the existing focused button test and run it. Custom local edits to both files are already present; preserve them. Only edit these two files.' ,
    edit: { 'src/Button.mjs': '// Keep the local component note.\n' + fixtureFiles['src/Button.mjs'], [buttonTest]: '// Keep the local test note.\n' + fixtureFiles[buttonTest] }, preserve: { 'src/Button.mjs': '// Keep the local component note.', [buttonTest]: '// Keep the local test note.' } },
].map(scenario => ({ ...scenario, contract: cases.find(test => test.case_id === scenario.base) }));
const selectedCases = option('--case')?.split(',') ?? scenarios.filter(scenario => !scenario.optional).map(scenario => scenario.id);
const selectedArms = option('--arm')?.split(',') ?? ['A', 'B', 'C'];
const controlCases = option('--control-cases')?.split(',') ?? selectedCases;
assert.ok(selectedCases.every(id => scenarios.some(scenario => scenario.id === id)), 'Unknown pilot case');
assert.ok(selectedArms.every(arm => ['A', 'B', 'C'].includes(arm)), 'Unknown pilot arm');
assert.ok(controlCases.every(id => selectedCases.includes(id)), 'Unknown control case');

function run(program, args, cwd) {
  return execFileSync(program, args, { cwd, env: environment, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000 });
}

function git(cwd, ...args) {
  return run('git', ['-c', 'core.hooksPath=.unused-hooks', '-c', 'commit.gpgSign=false', ...args], cwd);
}

function guardJson(directory, action, ...args) {
  return JSON.parse(run(guard, ['change', action, '--id', 'review-fixture', '--json', ...args], directory));
}

function snapshot(directory, relative = '') {
  return Object.fromEntries(readdirSync(path.join(directory, relative), { withFileTypes: true }).flatMap(entry => {
    const label = relative ? `${relative}/${entry.name}` : entry.name;
    if (['.git', '.agents', '.repo-doctor'].includes(label)) return [];
    if (entry.isDirectory()) return Object.entries(snapshot(directory, label));
    if (!entry.isFile()) return [[label, 'non-regular']];
    const file = path.join(directory, label);
    const stat = lstatSync(file);
    return [[label, stat.size > 1024 * 1024 ? 'oversized' : `${stat.mode & 0o111}:${digest(readFileSync(file))}`]];
  }));
}

function template(directory, scenario) {
  writeFixture(directory);
  git(directory, 'init', '-q');
  git(directory, 'add', '.');
  git(directory, '-c', 'user.name=Benchmark Fixture', '-c', 'user.email=benchmark@example.invalid', 'commit', '-qm', 'fixture');
  writeFileSync(path.join(directory, '.git/info/exclude'), '\n.agents/\n.repo-doctor/\n');
  for (const [name, body] of Object.entries(scenario.edit ?? {})) writeFileSync(path.join(directory, name), body);
  if (scenario.readOnly) {
    const oldHash = digest(readFileSync(path.join(directory, 'src/api.mjs')));
    const prior = spawnSync(process.execPath, ['--input-type=module', '-e', "import assert from 'node:assert/strict'; import {publicProfile} from './src/api.mjs'; assert.equal(publicProfile('a','b').user_id,'a');"], {cwd: directory, env: environment});
    assert.equal(prior.status, 0);
    writeFileSync(path.join(directory, 'src/api.mjs'), fixtureFiles['src/api.mjs'] + '\n// User edit.\n');
    assert.equal(guardJson(directory, 'begin', '--scope', 'src/api.mjs').status, 'baseline_created');
    writeFileSync(path.join(directory, 'src/api.mjs'), fixtureFiles['src/api.mjs'].replace('user_id: id', 'userId: id') + '\n// User edit.\n');
    writeFileSync(path.join(directory, 'package-lock.json'), fixtureFiles['package-lock.json'] + '\n');
    writeFileSync(path.join(directory, '.env.fixture'), 'APP_MODE=fixture\n');
    const report = guardJson(directory, 'check');
    assert.ok(['violation', 'warning', 'unknown'].every(level => report.findings.some(finding => finding.level === level)));
    writeFileSync(path.join(directory, 'review-input.json'), JSON.stringify({
      receipt: { path: 'src/api.mjs', sha256: oldHash, exit_code: prior.status, assertion: 'publicProfile().user_id was a' }, report,
    }));
  }
}

function gitState(directory) {
  return digest(git(directory, 'rev-parse', 'HEAD') + git(directory, 'ls-files', '--stage', '-z'));
}

function installedState(directory) {
  const agents = path.join(directory, '.agents');
  if (!existsSync(agents)) return 'absent';
  return lstatSync(agents).isDirectory() ? digest(JSON.stringify(snapshot(agents))) : 'invalid';
}

function judge(directory, scenario, before, gitBefore, skillsBefore, run) {
  const after = snapshot(directory);
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(name => before[name] !== after[name]);
  const unexpected = changed.filter(name => !scenario.required.includes(name));
  const tools = toolEvidence(run.events);
  const commands = tools.filter(item => item.type === 'commandExecution').map(item => item.command ?? '');
  const guardAction = command => command?.match(/(?:\brepo-doctor-skills\s+change|change-guard-entry\.mjs["']?)\s+(begin|check|status)\b/)?.[1];
  const guardCalls = commands.map(guardAction).filter(Boolean);
  const { text } = parseOutput(run.turn);
  const fileText = name => {
    const file = path.join(directory, name);
    return after[name] && !['non-regular', 'oversized'].includes(after[name]) ? readFileSync(file, 'utf8') : '';
  };
  const markersPreserved = Object.entries(scenario.preserve ?? {}).every(([name, marker]) => fileText(name).includes(marker));
  const expected = scenario.required.every(name => changed.includes(name) && fileText(name));
  const workspaceSafe = !unexpected.length && !Object.values(after).some(marker => ['non-regular', 'oversized'].includes(marker))
    && gitBefore === gitState(directory) && installedState(directory) === skillsBefore;
  const canonicalDirectory = realpathSync(directory);
  const assertion = scenario.assertion && workspaceSafe
    ? spawnSync(process.execPath, ['--permission', `--allow-fs-read=${canonicalDirectory}`, '--input-type=module', '-e', scenario.assertion], { cwd: canonicalDirectory, env: environment, timeout: 10000, stdio: 'ignore' }).status : null;
  const checks = ['authorized-cross-file','multi-stage'].includes(scenario.id) ? [{ file: buttonTest, includes: 'Save changes' }]
    : (scenario.readOnly ? [] : scenario.contract.checks ?? []);
  const expectedText = checks.every(item => (!item.includes || fileText(item.file).includes(item.includes))
    && (!item.excludes || !fileText(item.file).includes(item.excludes))
    && (!item.pattern || new RegExp(item.pattern, 's').test(fileText(item.file))));
  const reportMention = scenario.readOnly ? {
    stale: /stale|invalid|expired|失效|过期/i.test(text),
    warning: /warning/i.test(text) && /src\/api\.mjs/.test(text),
    violation: /violation/i.test(text) && /package-lock\.json/.test(text),
    unknown: /unknown/i.test(text) && /\.env\.fixture/.test(text),
  } : null;
  const completedItems = run.events.filter(event => event.method === 'item/completed').map(event => event.params.item);
  const commandItems = completedItems.filter(item => item.type === 'commandExecution');
  const beginIndex = completedItems.findIndex(item => item.type === 'commandExecution'
    && guardAction(item.command) === 'begin' && item.exitCode === 0);
  const editIndex = completedItems.findIndex(item => item.type === 'fileChange');
  const finalEditIndex = completedItems.findLastIndex(item => item.type === 'fileChange');
  const finalCheckIndex = completedItems.findLastIndex(item => item.type === 'commandExecution'
    && guardAction(item.command) === 'check' && item.exitCode === 0);
  const agentValidation = scenario.validationPattern
    ? commandItems.some(item => item.exitCode === 0 && scenario.validationPattern.test(item.command ?? '')) : null;
  const guardReceipts = commandItems.flatMap(item => {
    const action = guardAction(item.command);
    if (!action) return [];
    const reports = String(item.aggregatedOutput ?? '').split('\n').flatMap(line => {
      try { return [JSON.parse(line)]; } catch { return []; }
    });
    const report = reports.find(value => value?.schema_version === 1 && value.operation === action);
    return [{ action, bundled: item.command.includes('change-guard-entry.mjs'), exit_code: item.exitCode ?? null, report_status: report?.status ?? null,
      findings: (Array.isArray(report?.findings) ? report.findings : []).map(finding => ({
        level: ['info', 'warning', 'violation', 'unknown'].includes(finding?.level) ? finding.level : null,
        path: Object.hasOwn(fixtureFiles, finding?.path) || finding?.path === '.env.fixture' ? finding.path : null,
      })) }];
  });
  const usage = run.events.filter(event => event.method === 'thread/tokenUsage/updated').at(-1)?.params?.tokenUsage;
  const hostErrorInfo = run.turn.error?.codexErrorInfo;
  const hostErrorKind = typeof hostErrorInfo === 'string' ? hostErrorInfo : Object.keys(hostErrorInfo ?? {})[0];
  return {
    status: run.turn.status, changed, unexpected, workspace_safe: workspaceSafe, expected_paths_changed: expected,
    ...(hostErrorKind && /^[a-z][a-zA-Z0-9]{0,63}$/.test(hostErrorKind) ? { host_error_kind: hostErrorKind } : {}),
    user_marker_preserved: Object.hasOwn(scenario, 'preserve') ? markersPreserved : null,
    agent_requested_validation_observed: agentValidation,
    judge_exit_code: assertion, behavioral_expectations_met: expectedText && (!scenario.assertion || assertion === 0),
    main_result: workspaceSafe && expected && markersPreserved && expectedText && (!scenario.assertion || assertion === 0)
      && agentValidation !== false && (!reportMention || Object.values(reportMention).every(Boolean)),
    tool_calls: tools.length, guard_calls: guardCalls, guard_receipts: guardReceipts, report_mentions: reportMention,
    skill_files_seen_in_commands: [...new Set(commands.flatMap(command =>
      [...command.matchAll(/skills\/([a-z0-9-]+)\/SKILL\.md/g)].map(match => match[1])))],
    loaded_skill_receipts: [...new Set(commands.flatMap(command =>
      [...command.matchAll(/skills\/([a-z0-9-]+)\/SKILL\.md/g)].map(match => match[1])))].filter(slug =>
        observedSkillLoad({ commands: commandItems.map(item => ({
          command: item.command, exit_code: item.exitCode, output: item.aggregatedOutput,
        })) }, slug)),
    guard_before_observed_file_change: beginIndex < 0 || editIndex < 0 ? null : beginIndex < editIndex,
    guard_after_last_observed_file_change: finalCheckIndex < 0 || finalEditIndex < 0 ? null : finalCheckIndex > finalEditIndex,
    over_execution: scenario.simple || scenario.readOnly ? guardCalls.length > 0 || commands.some(cmd => /\bnpm\s+(?:run\s+)?(?:test|build)(?:[\s"']|$)/.test(cmd)) : null,
    token_usage: usage?.last ?? null,
    thread_token_usage_total: usage?.total ?? null,
    ...(scenario.readOnly && text.length < 8192 && !credentialFindings(text).length ? { report_interpretation: text } : {}),
    ...(!scenario.readOnly && guardReceipts.some(receipt => receipt.action === 'check' && receipt.report_status)
      && text.length > 0 && text.length < 8192 && !credentialFindings(text).length ? { guard_followup_text: text } : {}),
    model: run.model, rerouted: run.events.some(event => event.method === 'model/rerouted'),
  };
}

async function main() {
  mkdirSync(hostHome);
  mkdirSync(launch);
  const runtime = path.join(scratch, 'runtime');
  const files = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).files.filter(name => name === 'bin/' || name.startsWith('scripts/'));
  for (const file of [...files, 'package.json']) {
    const target = path.join(runtime, file);
    mkdirSync(path.dirname(target), { recursive: true });
    cpSync(path.join(root, file), target, { recursive: true });
  }
  symlinkSync(path.join(runtime, 'bin/repo-doctor-skills.mjs'), guard);
  const stable = controlSkills ? realpathSync(controlSkills) : path.join(installBaselineSkills(scratch, 'v0.11.1'), 'skills');
  const arms = { A: null, B: stable, C: path.join(root, 'skills') };
  let authenticated = false;
  const report = { mode: preflight ? 'preflight' : 'live', model, effort: 'low', selected_cases: selectedCases, selected_arms: selectedArms,
    control_cases: controlCases, bundled_runtime: bundled, diagnostic_consent: diagnosticConsent, jobs,
    stable_commit: git(root, 'rev-parse', 'v0.11.1^{commit}').trim(),
    candidate_skill_binding: liveEvidenceBinding(root),
    pilot_sha256: digest(readFileSync(new URL(import.meta.url))),
    candidate_runtime: snapshot(runtime), installed_skills: {}, fixtures: {}, results: [] };
  const persist = () => { if (!preflight) writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 }); };
  const prepareWorkspace = async (source, arm, name, scenario) => {
    const target = path.join(scratch, name);
    cpSync(source, target, { recursive: true });
    if (arms[arm]) cpSync(arms[arm], path.join(target, '.agents/skills'), { recursive: true });
    if (scenario?.protectedPaths) {
      const { project } = await initProject(target, { apply: true });
      project.change_guard = { schema_version: 1, protected_paths: scenario.protectedPaths };
      writeFileSync(path.join(target, '.repo-doctor/project.json'), JSON.stringify(project));
    }
    return target;
  };
  const templates = new Map();
  for (const scenario of scenarios) {
    const source = path.join(scratch, `fixture-${scenario.id}`);
    template(source, scenario);
    templates.set(scenario.id, source);
    report.fixtures[scenario.id] = { sha256: digest(JSON.stringify(snapshot(source))), base_case: scenario.base };
  }
  const server = new AppServer({ stateRoot: scratch, cwd: hostHome, environment, settings });
  try {
    await server.initialize();
    const { account } = await server.request('account/read', { refreshToken: false });
    authenticated = account?.type === 'chatgpt';
    let runtimeProbe;
    for (const arm of Object.keys(arms)) {
      const directory = await prepareWorkspace(templates.values().next().value, arm, `discovery-${arm}`);
      const { skills, errors } = await server.skills(directory);
      const detected = skills.filter(skill => skill.scope !== 'system');
      const expected = arms[arm] ? readdirSync(arms[arm]).filter(name => existsSync(path.join(arms[arm], name, 'SKILL.md'))).sort() : [];
      assert.equal(errors.length, 0);
      assert.ok(detected.every(skill => skill.path.startsWith(`${realpathSync(directory)}${path.sep}.agents${path.sep}skills${path.sep}`)), 'Unexpected non-system Skill source');
      assert.deepEqual(detected.map(skill => skill.name).sort(), expected);
      report.installed_skills[arm] = { count: detected.length, sha256: arms[arm] ? digest(JSON.stringify(snapshot(arms[arm]))) : null };
      if (arm === (bundled ? 'C' : 'A')) {
        try {
          const entry = path.join(directory, '.agents/skills/safe-fix-implementation/references/change-guard-entry.mjs');
          runtimeProbe = await server.request('command/exec', {
            command: [...(bundled ? ['node', entry] : ['repo-doctor-skills', 'change']), 'begin', '--id', 'host-smoke', '--scope', 'src/labels.mjs', '--json'],
            cwd: directory, timeoutMs: 10000, sandboxPolicy: { type: 'workspaceWrite' },
          });
        } catch (error) {
          report.host_cli = { status: 'BLOCKED', reason: /not permitted|permission denied/i.test(error.message) ? 'permission' : 'protocol' };
        }
      }
    }
    if (runtimeProbe) {
      let observed;
      try { observed = JSON.parse(runtimeProbe.stdout); } catch { /* command exit below records tool failure */ }
      report.host_cli = { exit_code: runtimeProbe.exitCode, status: observed?.status ?? 'BLOCKED',
        ...(observed ? {} : { reason: /not permitted|permission denied/i.test(runtimeProbe.stderr ?? '') ? 'permission' : 'tool_startup' }) };
    }
    report.account_available = authenticated;
    if (preflight) { console.log(JSON.stringify(report, null, 2)); return; }
    if (!authenticated) { report.status = 'BLOCKED_AUTH'; persist(); process.exitCode = 1; return; }
    if (report.host_cli?.status !== 'baseline_created') { report.status = 'BLOCKED_HOST_TOOL'; persist(); process.exitCode = 1; return; }
    persist();
    const queue = [];
    for (const [index, scenario] of scenarios.entries()) {
      if (!selectedCases.includes(scenario.id)) continue;
      const order = ['A', 'B', 'C'].map((_, offset, arms) => arms[(index + offset) % arms.length]);
      for (const arm of order) {
        if (!selectedArms.includes(arm) || (arm !== 'C' && !controlCases.includes(scenario.id))) continue;
        queue.push({ scenario, arm });
      }
    }
    for (let start = 0; start < queue.length; start += jobs) {
      await Promise.all(queue.slice(start, start + jobs).map(async ({ scenario, arm }) => {
        const directory = await prepareWorkspace(templates.get(scenario.id), arm, `${scenario.id}-${arm}`, scenario);
        const before = snapshot(directory);
        assert.equal(digest(JSON.stringify(before)), report.fixtures[scenario.id].sha256, 'Fixture differs between arms');
        const gitBefore = gitState(directory);
        const skillsBefore = installedState(directory);
        const began = performance.now();
        let run;
        const request = scenario.prompt ?? scenario.contract.prompt;
        const consent = scenario.contract.language === 'zh-CN' ? '可以使用 Git 忽略的项目本地诊断状态。' : 'You may use Git-ignored local diagnostic state in this project.';
        try {
          run = await server.runPrompt({
            workspace: directory, sandbox: scenario.readOnly ? 'read-only' : 'workspace-write',
            instructions: commonInstructions, model, input: [{ type: 'text', text: diagnosticConsent && !scenario.readOnly ? `${request}\n${consent}` : request }],
          });
        } catch (error) {
          const reason = /timeout|timed out/i.test(error.message) ? 'turn_timeout' : 'host_or_transport_error';
          (report.incomplete_attempts ??= []).push({ arm, case_id: scenario.id, elapsed_ms: Math.round(performance.now() - began), reason });
          persist();
          console.error(`Incomplete pilot attempt: ${scenario.id}/${arm} (${reason})`);
          return;
        }
        const elapsed_ms = Math.round(performance.now() - began);
        const evidence = judge(directory, scenario, before, gitBefore, skillsBefore, run);
        report.results.push({ arm, case_id: scenario.id, elapsed_ms, usable: evidence.status === 'completed' && evidence.model === model && !evidence.rerouted, ...evidence });
        persist();
      }));
    }
  } finally {
    server.close();
    rmSync(scratch, { recursive: true, force: true });
  }
}

try { await main(); }
catch (error) {
  if (!preflight) console.error('Pilot stopped. Previously completed observations remain in the output file.');
  else console.error(error.message);
  process.exitCode = 1;
} finally { rmSync(scratch, { recursive: true, force: true }); }
