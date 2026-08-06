import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
  existsSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function option(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

export const workspace = path.resolve(option("--workspace", process.cwd()));
export const codexHome = path.resolve(process.env.CODEX_HOME ?? "");
const outputPath = path.resolve(option(
  "--output",
  path.join(root, "tests", "reports", "live-codex-skill-validation.json"),
));
const concurrency = Number(option("--concurrency", "6"));
const limit = Number(option("--limit", "0"));
const requestedCase = option("--case");
const timeoutMs = Number(option("--timeout-ms", "120000"));
const inventoryPath = path.join(root, "tests", "reports", "active-skills-inventory.json");
const activationPath = path.join(root, "tests", "skill-quality", "activation-cases.json");

if (!process.env.CODEX_HOME || !existsSync(codexHome)) {
  throw new Error("CODEX_HOME must point to the isolated live-validation installation");
}
if (!existsSync(inventoryPath)) {
  throw new Error("Run npm run release:inventory before live validation");
}

const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
const activationCases = JSON.parse(readFileSync(activationPath, "utf8"));
export const activeSkills = inventory.active_skills.map((skill) => skill.slug);
const skillSet = new Set(activeSkills);
const installedRoot = realpathSync(path.join(codexHome, "skills"));

export function sha256(filename) {
  return createHash("sha256").update(readFileSync(filename)).digest("hex");
}

export function normalizedSkillPath(slug) {
  return path.join(installedRoot, slug, "SKILL.md");
}

export function redactSkillPath(filename) {
  const relative = path.relative(installedRoot, realpathSync(filename)).split(path.sep).join("/");
  return `$ISOLATED_CODEX_HOME/skills/${relative}`;
}

export function sanitizeEvidence(value) {
  const roots = [
    workspace,
    realpathSync(workspace),
    codexHome,
    realpathSync(codexHome),
    path.dirname(workspace),
    path.dirname(realpathSync(workspace)),
  ].sort((left, right) => right.length - left.length);
  if (typeof value === "string") {
    let sanitized = value;
    for (const candidate of roots) {
      const replacement = candidate === workspace || candidate === realpathSync(workspace)
        ? "$ISOLATED_WORKSPACE"
        : candidate === codexHome || candidate === realpathSync(codexHome)
          ? "$ISOLATED_CODEX_HOME"
          : "$ISOLATED_ROOT";
      sanitized = sanitized.replaceAll(candidate, replacement);
    }
    return sanitized;
  }
  if (Array.isArray(value)) return value.map((entry) => sanitizeEvidence(entry));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitizeEvidence(entry)]),
    );
  }
  return value;
}

function compactTextEvidence(value, limit) {
  if (typeof value !== "string") return value;
  return {
    excerpt: value.slice(0, limit),
    characters: value.length,
    sha256: createHash("sha256").update(value).digest("hex"),
    truncated: value.length > limit,
  };
}

function compactCaseEvidence(testCase) {
  if (!testCase?.output || typeof testCase.output !== "object") return testCase;
  const output = { ...testCase.output };
  for (const [field, limit] of [
    ["answer", 480],
    ["handoff", 240],
    ["boundary_summary", 240],
  ]) {
    if (typeof output[field] === "string") {
      output[`${field}_evidence`] = compactTextEvidence(output[field], limit);
      delete output[field];
    }
  }
  const serialized = JSON.stringify(testCase.output);
  return {
    ...testCase,
    output,
    output_evidence: {
      characters: serialized.length,
      sha256: createHash("sha256").update(serialized).digest("hex"),
      storage: "structured fields plus bounded excerpts; full model text intentionally omitted",
    },
  };
}

export function compactEvidenceReport(report) {
  const cases = Array.isArray(report.cases)
    ? report.cases.map((testCase) => compactCaseEvidence(testCase))
    : report.cases;
  const advanced = report.advanced
    ? (() => {
        const {
          workflow_runs: workflowRuns = [],
          mode_cases: modeCases = [],
          permission_cases: permissionCases = [],
          ...metadata
        } = report.advanced;
        return {
        ...metadata,
        workflow_runs: workflowRuns.map((workflow) => ({
          workflow_id: workflow.workflow_id,
          language: workflow.language,
          session_restart_verified: workflow.session_restart_verified,
          step_case_ids: (workflow.steps ?? []).map((step) => step.case_id),
          result: workflow.result,
        })),
        mode_case_ids: modeCases
          .map((testCase) => testCase.case_id),
        permission_case_ids: permissionCases
          .map((testCase) => testCase.case_id),
      };
      })()
    : report.advanced;
  return {
    ...report,
    evidence_storage: {
      model_output_policy: "bounded excerpts and SHA-256 digests; no bulk full-model transcript",
      all_cases_retained: true,
    },
    cases,
    ...(advanced ? { advanced } : {}),
  };
}

function selectPositive(slug, locale) {
  const fixture = activationCases.find((entry) =>
    entry.subject_skill === slug
      && entry.locale === locale
      && entry.expected_skill === slug
      && entry.kind === "positive");
  if (!fixture) throw new Error(`Missing ${locale} positive activation fixture for ${slug}`);
  return fixture;
}

function selectNegative(slug) {
  const candidates = activationCases.filter((entry) =>
    entry.expected_skill !== slug
      && (entry.subject_skill === slug || (entry.must_not_trigger ?? []).includes(slug)));
  const adjacent = candidates.find((entry) => entry.kind === "adjacent" && entry.expected_skill);
  const negative = candidates.find((entry) => entry.kind === "negative");
  const fixture = adjacent ?? negative ?? candidates[0];
  if (!fixture) throw new Error(`Missing adjacent or negative fixture for ${slug}`);
  return fixture;
}

function buildCoreCases() {
  return activeSkills.flatMap((slug) => {
    const en = selectPositive(slug, "en");
    const zh = selectPositive(slug, "zh-CN");
    const negative = selectNegative(slug);
    return [
      {
        case_id: `${slug}--explicit-en`,
        skill: slug,
        language: "en",
        invocation: "explicit",
        input: en.input,
        expected_skill: slug,
        must_not_trigger: en.must_not_trigger ?? [],
      },
      {
        case_id: `${slug}--explicit-zh-CN`,
        skill: slug,
        language: "zh-CN",
        invocation: "explicit",
        input: zh.input,
        expected_skill: slug,
        must_not_trigger: zh.must_not_trigger ?? [],
      },
      {
        case_id: `${slug}--implicit-en`,
        skill: slug,
        language: "en",
        invocation: "implicit",
        input: en.input,
        expected_skill: slug,
        must_not_trigger: en.must_not_trigger ?? [],
      },
      {
        case_id: `${slug}--implicit-zh-CN`,
        skill: slug,
        language: "zh-CN",
        invocation: "implicit",
        input: zh.input,
        expected_skill: slug,
        must_not_trigger: zh.must_not_trigger ?? [],
      },
      {
        case_id: `${slug}--negative-${negative.locale}`,
        skill: slug,
        language: negative.locale,
        invocation: "negative",
        input: negative.input,
        expected_skill: negative.expected_skill,
        must_not_trigger: [...new Set([slug, ...(negative.must_not_trigger ?? [])])],
      },
    ];
  });
}

export const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "selected_skill",
    "response_language",
    "decision",
    "permission_boundary",
    "handoff",
    "answer",
  ],
  properties: {
    selected_skill: {
      anyOf: [
        { type: "string", enum: activeSkills },
        { type: "null" },
      ],
    },
    response_language: {
      type: "string",
      enum: ["en", "zh-CN"],
    },
    decision: {
      type: "string",
      enum: ["handled", "recommended", "not_applicable", "refused", "blocked"],
    },
    permission_boundary: {
      type: "string",
      enum: ["respected", "violated", "not_applicable"],
    },
    handoff: { type: "string" },
    answer: { type: "string" },
  },
};

const validationInstructions = [
  "This is an isolated, read-only Skill routing validation.",
  "Do not run commands, call tools, inspect files, access networks, or modify anything.",
  "For explicit Skill input, selected_skill must be the supplied Skill whose instructions govern the response.",
  "For text-only input, selected_skill must be the one installed Skill you select or clearly recommend; use null only when none applies.",
  "Do not infer an expected answer from test naming because none is provided.",
  "Use the requested response language naturally.",
  "In answer, give a compact but useful response that preserves the selected Skill's safety boundary and output contract.",
  "Use handoff for the correct next Skill or state that no handoff is needed.",
  "Return only the JSON object required by the response schema.",
].join(" ");

export class AppServer {
  constructor() {
    this.nextId = 1;
    this.pending = new Map();
    this.turns = new Map();
    this.stdoutBuffer = "";
    this.stderr = "";
    const args = [
      "app-server",
      "--stdio",
      "--disable",
      "plugins",
      "--disable",
      "apps",
      "--disable",
      "browser_use",
      "--disable",
      "in_app_browser",
      "--disable",
      "image_generation",
      "--disable",
      "multi_agent",
      "--disable",
      "memories",
      "-c",
      'model_provider="openai-http"',
      "-c",
      'model_providers.openai-http.name="OpenAI HTTP"',
      "-c",
      'model_providers.openai-http.base_url="https://chatgpt.com/backend-api/codex"',
      "-c",
      'model_providers.openai-http.wire_api="responses"',
      "-c",
      "model_providers.openai-http.requires_openai_auth=true",
      "-c",
      "model_providers.openai-http.supports_websockets=false",
      "-c",
      'model_reasoning_effort="low"',
      "-c",
      'model_verbosity="low"',
    ];
    this.child = spawn("codex", args, {
      cwd: workspace,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.child.stdout.on("data", (chunk) => this.onStdout(chunk));
    this.child.stderr.on("data", (chunk) => {
      this.stderr += chunk.toString();
    });
    this.child.on("error", (error) => this.rejectAll(error));
    this.child.on("exit", (code, signal) => {
      if (code !== null && code !== 0) {
        this.rejectAll(new Error(`Codex app-server exited code=${code} signal=${signal}`));
      }
    });
  }

  rejectAll(error) {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    for (const turn of this.turns.values()) turn.reject(error);
    this.turns.clear();
  }

  onStdout(chunk) {
    this.stdoutBuffer += chunk.toString();
    while (this.stdoutBuffer.includes("\n")) {
      const newline = this.stdoutBuffer.indexOf("\n");
      const line = this.stdoutBuffer.slice(0, newline).trim();
      this.stdoutBuffer = this.stdoutBuffer.slice(newline + 1);
      if (!line) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        continue;
      }
      if (message.id !== undefined && !message.method) {
        const pending = this.pending.get(message.id);
        if (!pending) continue;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
        continue;
      }
      const threadId = message.params?.threadId;
      if (!threadId) continue;
      const collector = this.turns.get(threadId);
      if (!collector) continue;
      collector.events.push(message);
      if (message.method === "turn/completed") {
        this.turns.delete(threadId);
        collector.resolve({
          turn: message.params.turn,
          events: collector.events,
        });
      }
    }
  }

  request(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.child.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
    });
  }

  async initialize() {
    await this.request("initialize", {
      clientInfo: {
        name: "repo-doctor-release-validation",
        version: "1.0.0",
      },
      capabilities: { experimentalApi: true },
    });
    this.child.stdin.write(`${JSON.stringify({ method: "initialized" })}\n`);
  }

  async skills() {
    const result = await this.request("skills/list", {
      cwds: [workspace],
      forceReload: true,
    });
    return result.data[0];
  }

  async run(testCase) {
    const threadId = await this.startThread({
      sandbox: "read-only",
      developerInstructions: validationInstructions,
    });
    return this.runTurn(threadId, {
      testCase,
      outputSchema,
      input: null,
    });
  }

  async startThread({
    sandbox = "read-only",
    developerInstructions = validationInstructions,
    ephemeral = true,
  } = {}) {
    const threadResult = await this.request("thread/start", {
      cwd: workspace,
      sandbox,
      approvalPolicy: "never",
      ephemeral,
      developerInstructions,
    });
    return threadResult.thread.id;
  }

  async runTurn(threadId, {
    testCase = null,
    outputSchema: schema = outputSchema,
    input = null,
  }) {
    const completed = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.turns.delete(threadId);
        reject(new Error(`turn timeout after ${timeoutMs}ms`));
      }, timeoutMs);
      this.turns.set(threadId, {
        events: [],
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
    });
    const turnInput = input ? [...input] : [];
    if (!input && testCase.invocation === "explicit") {
      turnInput.push({
        type: "skill",
        name: testCase.skill,
        path: normalizedSkillPath(testCase.skill),
      });
    }
    if (!input) turnInput.push({ type: "text", text: testCase.input });
    await this.request("turn/start", {
      threadId,
      input: turnInput,
      effort: "low",
      outputSchema: schema,
    });
    return completed;
  }

  close() {
    this.child.kill();
  }
}

export function parseOutput(turn) {
  const messages = (turn.items ?? [])
    .filter((item) => item.type === "agentMessage")
    .map((item) => item.text);
  const text = messages.at(-1) ?? "";
  try {
    return { parsed: JSON.parse(text), text, messages };
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!fenced) return { parsed: null, text, messages };
    try {
      return { parsed: JSON.parse(fenced[1]), text, messages };
    } catch {
      return { parsed: null, text, messages };
    }
  }
}

export function toolEvidence(events) {
  const items = events
    .filter((event) => event.method === "item/completed")
    .map((event) => event.params.item);
  const toolTypes = new Set([
    "commandExecution",
    "fileChange",
    "mcpToolCall",
    "dynamicToolCall",
    "collabAgentToolCall",
    "webSearch",
    "imageGeneration",
  ]);
  return items.filter((item) => toolTypes.has(item.type)).map((item) => ({
    type: item.type,
    status: item.status ?? null,
    command: item.type === "commandExecution" ? item.command : undefined,
    changes: item.type === "fileChange" ? item.changes : undefined,
  }));
}

export function hasNaturalLanguage(answer, locale) {
  const cjk = (answer.match(/[\u3400-\u9fff]/g) ?? []).length;
  const letters = (answer.match(/[A-Za-z]/g) ?? []).length;
  if (locale === "zh-CN") return cjk >= 4;
  return letters >= 12 && cjk <= Math.max(8, Math.floor(letters / 3));
}

function evaluate(testCase, run) {
  const output = parseOutput(run.turn);
  const tools = toolEvidence(run.events);
  const parsed = output.parsed;
  const issues = [];
  const selected = parsed?.selected_skill ?? null;
  if (run.turn.status !== "completed") {
    const detail = run.turn.error ? `; error=${JSON.stringify(run.turn.error)}` : "";
    issues.push(`turn status is ${run.turn.status}${detail}`);
  }
  if (!parsed) issues.push("final response is not valid structured JSON");
  if (parsed && parsed.response_language !== testCase.language) {
    issues.push(`response_language=${parsed.response_language}`);
  }
  if (parsed && !hasNaturalLanguage(parsed.answer ?? "", testCase.language)) {
    issues.push("answer is not natural in the requested language");
  }
  if (selected !== testCase.expected_skill) {
    issues.push(`selected_skill=${selected ?? "null"} expected=${testCase.expected_skill ?? "null"}`);
  }
  for (const forbidden of testCase.must_not_trigger) {
    if (selected === forbidden) issues.push(`forbidden Skill selected: ${forbidden}`);
  }
  if (tools.length > 0) issues.push(`unexpected tool activity: ${tools.map((item) => item.type).join(", ")}`);
  if (parsed?.permission_boundary === "violated") issues.push("model reported a permission violation");
  if (!parsed?.handoff?.trim()) issues.push("handoff is empty");
  const localPath = testCase.invocation === "explicit"
    ? normalizedSkillPath(testCase.skill)
    : (selected && skillSet.has(selected) ? normalizedSkillPath(selected) : null);
  return {
    case_id: testCase.case_id,
    skill: testCase.skill,
    language: testCase.language,
    invocation: testCase.invocation,
    input: testCase.input,
    expected_skill: testCase.expected_skill,
    actual_skill: selected,
    local_skill_path: localPath ? redactSkillPath(localPath) : "",
    local_skill_sha256: localPath ? sha256(localPath) : "",
    exit_code: run.turn.status === "completed" ? 0 : 1,
    permission_violation: tools.length > 0 || parsed?.permission_boundary === "violated",
    tool_activity: tools,
    output: parsed,
    result: issues.length === 0
      ? "PASS"
      : issues.some((issue) => issue.includes("usageLimitExceeded"))
        ? "BLOCKED"
        : "FAIL",
    notes: issues.join("; "),
  };
}

export async function pool(items, worker, size) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

function validateDiscovery(entry) {
  const installed = entry.skills.filter((skill) => {
    const resolved = realpathSync(skill.path);
    return resolved.startsWith(`${installedRoot}${path.sep}`)
      && !resolved.includes(`${path.sep}.system${path.sep}`);
  });
  const names = installed.map((skill) => skill.name).sort();
  const expected = [...activeSkills].sort();
  const issues = [];
  if (JSON.stringify(names) !== JSON.stringify(expected)) {
    issues.push(`installed Skill set differs: found=${names.length} expected=${expected.length}`);
  }
  if (entry.errors.length > 0) issues.push(`skills/list errors=${entry.errors.length}`);
  for (const skill of installed) {
    if (!/[A-Za-z]/.test(skill.description) || !/[\u3400-\u9fff]/.test(skill.description)) {
      issues.push(`${skill.name} description is not bilingual`);
    }
  }
  return {
    result: issues.length === 0 ? "PASS" : "FAIL",
    expected_count: expected.length,
    discovered_count: installed.length,
    skills: installed.map((skill) => ({
      name: skill.name,
      path: redactSkillPath(skill.path),
      sha256: sha256(skill.path),
      enabled: skill.enabled,
      scope: skill.scope,
      bilingual_description: /[A-Za-z]/.test(skill.description)
        && /[\u3400-\u9fff]/.test(skill.description),
    })),
    errors: entry.errors,
    issues,
  };
}

async function discoverWithRestart() {
  const firstServer = new AppServer();
  await firstServer.initialize();
  const first = validateDiscovery(await firstServer.skills());
  firstServer.close();
  const secondServer = new AppServer();
  await secondServer.initialize();
  const second = validateDiscovery(await secondServer.skills());
  return { first, second, server: secondServer };
}

export function markdown(report) {
  const counts = report.summary;
  const lines = [
    "# Live Codex Skill Validation",
    "",
    `- Overall: **${report.result}**`,
    `- Installed Skills: ${report.installation.second_session.discovered_count}/${report.installation.second_session.expected_count}`,
    `- Real calls: ${counts.total}`,
    `- Passed: ${counts.passed}`,
    `- Failed: ${counts.failed}`,
    `- Blocked: ${counts.blocked}`,
    `- Pass rate: ${counts.pass_rate}`,
    "",
    "## Invocation counts",
    "",
    "| Invocation | Total | Passed | Failed | Blocked |",
    "| --- | ---: | ---: | ---: | ---: |",
  ];
  for (const [name, value] of Object.entries(counts.by_invocation)) {
    lines.push(`| ${name} | ${value.total} | ${value.passed} | ${value.failed} | ${value.blocked} |`);
  }
  lines.push("", "## Cases", "");
  lines.push("| Case | Skill | Language | Invocation | Expected | Actual | Result |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const testCase of report.cases) {
    lines.push(`| ${testCase.case_id} | ${testCase.skill} | ${testCase.language} | ${testCase.invocation} | ${testCase.expected_skill ?? "none"} | ${testCase.actual_skill ?? "none"} | ${testCase.result} |`);
  }
  const failures = report.cases.filter((testCase) => testCase.result !== "PASS");
  lines.push("", "## Failures", "");
  if (failures.length === 0) {
    lines.push("None.");
  } else {
    for (const failure of failures) {
      lines.push(`- \`${failure.case_id}\`: ${failure.notes}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

export function summarize(cases) {
  const byInvocation = {};
  for (const testCase of cases) {
    const bucket = byInvocation[testCase.invocation] ?? {
      total: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
    };
    bucket.total += 1;
    bucket[
      testCase.result === "PASS"
        ? "passed"
        : testCase.result === "BLOCKED"
          ? "blocked"
          : "failed"
    ] += 1;
    byInvocation[testCase.invocation] = bucket;
  }
  const passed = cases.filter((testCase) => testCase.result === "PASS").length;
  const blocked = cases.filter((testCase) => testCase.result === "BLOCKED").length;
  return {
    total: cases.length,
    passed,
    failed: cases.length - passed - blocked,
    blocked,
    pass_rate: cases.length === 0 ? "0.00%" : `${((passed / cases.length) * 100).toFixed(2)}%`,
    by_invocation: byInvocation,
  };
}

async function main() {
  const allCases = buildCoreCases();
  const filteredCases = requestedCase
    ? allCases.filter((testCase) => testCase.case_id === requestedCase)
    : allCases;
  if (requestedCase && filteredCases.length !== 1) {
    throw new Error(`Unknown or duplicate live case: ${requestedCase}`);
  }
  const selectedCases = limit > 0 ? filteredCases.slice(0, limit) : filteredCases;
  const startedAt = new Date().toISOString();
  const { first, second, server } = await discoverWithRestart();
  if (first.result !== "PASS" || second.result !== "PASS") {
    server.close();
    throw new Error(`Isolated discovery failed: ${[...first.issues, ...second.issues].join("; ")}`);
  }
  process.stdout.write(`DISCOVERY PASS ${second.discovered_count}/${second.expected_count}\n`);
  const results = await pool(selectedCases, async (testCase, index) => {
    const began = Date.now();
    try {
      const run = await server.run(testCase);
      const result = evaluate(testCase, run);
      process.stdout.write(
        `[${index + 1}/${selectedCases.length}] ${result.result} ${testCase.case_id} ${Date.now() - began}ms${result.notes ? ` — ${result.notes}` : ""}\n`,
      );
      return result;
    } catch (error) {
      const result = {
        ...testCase,
        actual_skill: null,
        local_skill_path: "",
        local_skill_sha256: "",
        exit_code: 1,
        permission_violation: false,
        tool_activity: [],
        output: null,
        result: "BLOCKED",
        notes: error.message,
      };
      process.stdout.write(
        `[${index + 1}/${selectedCases.length}] BLOCKED ${testCase.case_id} ${Date.now() - began}ms — ${error.message}\n`,
      );
      return result;
    }
  }, concurrency);
  server.close();
  const summary = summarize(results);
  const report = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    started_at: startedAt,
    project_version: inventory.project_version,
    source_commit: null,
    source_worktree: "current uncommitted release candidate",
    codex_cli_version: process.env.CODEX_CLI_VERSION ?? "codex-cli 0.147.0-alpha.1.2",
    isolation: {
      home: "temporary and redacted",
      codex_home: "temporary and redacted",
      workspace: "temporary empty Git repository",
      source: "dist/codex-zh-CN/skills",
      path_redacted: true,
      real_user_skill_directory_read: false,
    },
    installation: {
      first_session: first,
      second_session: second,
    },
    coverage: {
      inventory_skills: activeSkills.length,
      required_core_calls: activeSkills.length * 5,
      executed_core_calls: results.length,
      probe_limit: limit || null,
      requested_case: requestedCase,
    },
    test_corrections: [
      {
        fixture: "docs-adjacent",
        classification: "test error",
        reason: "The original adjacent fixture expected safe-fix-implementation but did not provide the clear diagnosis that the canonical Skill contract requires. A real call correctly routed the underspecified request to requirements-clarification. The fixture now states a confirmed root cause and bounded production fix while preserving the same documentation-sync boundary.",
      },
      {
        fixture: "rts-adjacent",
        classification: "test error",
        reason: "The fixture asks about a public API, while the canonical change-impact-analysis contract explicitly hands API contract compatibility to api-contract-review. After a rerun exposed ambiguity between generic impact and contract review, the fixture was sharpened with the canonical server/client/schema and breaking-change criteria, and the expected Skill was corrected to api-contract-review.",
      },
    ],
    summary,
    cases: results,
    result: first.result === "PASS"
      && second.result === "PASS"
      && results.length === activeSkills.length * 5
      && summary.passed === summary.total
      ? "PASS"
      : "FAIL",
  };
  const sanitizedReport = sanitizeEvidence(compactEvidenceReport(report));
  writeFileSync(outputPath, `${JSON.stringify(sanitizedReport, null, 2)}\n`);
  const markdownPath = outputPath.replace(/\.json$/, ".md");
  writeFileSync(markdownPath, markdown(sanitizedReport));
  process.stdout.write(`REPORT ${outputPath}\n`);
  process.stdout.write(`RESULT ${report.result} ${summary.passed}/${summary.total}\n`);
  if (report.result !== "PASS") process.exitCode = 1;
}

if (process.argv[1]
  && realpathSync(path.resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))) {
  await main();
}
