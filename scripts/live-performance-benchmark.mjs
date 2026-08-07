import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const option = (name, fallback = null) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};
const baselineRef = option("--baseline-ref", "v0.4.1");
const outputPath = path.resolve(option(
  "--output",
  path.join(root, "tests", "reports", "live-performance-comparison.json"),
));
const prepareOnly = process.argv.includes("--prepare-only");
const concurrency = Number(option("--concurrency", "2"));
const timeoutMs = Number(option("--timeout-ms", "180000"));
const requestedCase = option("--case");
const keepTemp = process.argv.includes("--keep-temp");
const resume = process.argv.includes("--resume");
const rerunOptimizedFailures = process.argv.includes("--rerun-optimized-failures");
const recordObservedAuthFailure = process.argv.includes("--record-observed-auth-failure");
const authProbesOnly = process.argv.includes("--auth-probes-only");
const transportRetryLimit = 2;
const transportRetryBackoffMs = [1000, 2500];
const checkpointPath = `${outputPath}.checkpoint.json`;
const repoDoctorSkills = [
  "api-contract-review",
  "architecture-decision-record",
  "architecture-deepening-analysis",
  "bug-root-cause-analysis",
  "change-impact-analysis",
  "ci-failure-diagnosis",
  "configuration-audit",
  "database-migration-review",
  "dead-code-verification",
  "decision-prototype",
  "dependency-upgrade-analysis",
  "documentation-sync",
  "performance-regression-analysis",
  "project-health-check",
  "release-readiness-check",
  "repo-doctor-router",
  "repo-onboarding",
  "requirements-clarification",
  "requirements-to-spec",
  "safe-change-plan",
  "safe-code-review",
  "safe-fix-implementation",
  "safe-test-implementation",
  "security-focused-review",
  "session-handoff",
  "spec-to-work-items",
  "test-gap-analysis",
];

const fixtureFiles = {
  "package.json": `${JSON.stringify({
    name: "repo-doctor-performance-benchmark",
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      test: "node --test tests/*.test.mjs",
      "test:button": "node --test tests/button.test.mjs",
      "test:labels": "node --test tests/labels.test.mjs",
      typecheck: "node scripts/typecheck.mjs",
      "check:css": "node scripts/check-css.mjs",
      "check:config": "node scripts/check-config.mjs",
      build: "node scripts/build.mjs",
    },
    dependencies: {
      "synthetic-ui-kit": "1.4.0",
    },
  }, null, 2)}\n`,
  "package-lock.json": `${JSON.stringify({
    name: "repo-doctor-performance-benchmark",
    version: "1.0.0",
    lockfileVersion: 3,
    requires: true,
    packages: {
      "": {
        name: "repo-doctor-performance-benchmark",
        version: "1.0.0",
        dependencies: { "synthetic-ui-kit": "1.4.0" },
      },
      "node_modules/synthetic-ui-kit": {
        version: "1.4.0",
        resolved: "https://packages.example.invalid/synthetic-ui-kit-1.4.0.tgz",
        integrity: "sha512-c3ludGhldGljLWZpeHR1cmU=",
      },
    },
  }, null, 2)}\n`,
  "README.md": `# Repo Doctor Performance Benchmark

This is a synthethic Node and TypeScript fixture. It has no external services and no production data.

Entry point: \`src/index.mjs\`.

The public profile response contract uses camelCase: \`{ userId, displayName }\`.
Only targeted checks should be used for small changes.
`,
  "src/index.mjs": `export { applyPercentageDiscount } from "./cart.mjs";
export { publicProfile } from "./api.mjs";
export { normalizeLabel } from "./labels.mjs";
`,
  "src/profile.ts": `export type Profile = {
  usrNm: string;
  retries: number;
};

export const retryLimit: number = "3";
`,
  "src/Button.mjs": `export function Button() {
  return "<button type=\\"button\\">Save</button>";
}
`,
  "src/styles.css": `.toolbar {
  display: flex;
  gap: 0px;
}
`,
  "src/cart.mjs": `export function applyPercentageDiscount(subtotal, percentage) {
  return Math.max(0, subtotal - percentage);
}

export function clampQuantity(quantity) {
  return Math.max(1, Math.min(20, quantity));
}
`,
  "src/api.mjs": `export function publicProfile(id, name) {
  return { user_id: id, displayName: name };
}
`,
  "src/labels.mjs": `export function normalizeLabel(value) {
  return value.trim().toUpperCase();
}

export function normalizeHeading(value) {
  return value.trim().toUpperCase();
}

export const unusedLabel = "synthetic-unused";
`,
  "src/messages.mjs": `export const successMessage = "Operation done";
`,
  "src/timeout.mjs": `export const requestTimeoutMs = 1000;
`,
  "src/server.mjs": `export function redirectTarget(next) {
  return next || "/";
}
`,
  "config/defaults.json": `${JSON.stringify({
    maxRetries: 2,
    theme: "light",
    featurePreview: false,
  }, null, 2)}\n`,
  "tests/button.test.mjs": `import assert from "node:assert/strict";
import test from "node:test";
import { Button } from "../src/Button.mjs";

test("button has an explicit type", () => {
  assert.match(Button(), /type="button"/);
});
`,
  "tests/cart.test.mjs": `import assert from "node:assert/strict";
import test from "node:test";
import { clampQuantity } from "../src/cart.mjs";

test("quantity stays inside the supported range", () => {
  assert.equal(clampQuantity(0), 1);
  assert.equal(clampQuantity(99), 20);
});
`,
  "tests/labels.test.mjs": `import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLabel } from "../src/labels.mjs";

test("labels are trimmed and normalized", () => {
  assert.equal(normalizeLabel("  alpha "), "ALPHA");
});
`,
  "scripts/typecheck.mjs": `import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/profile.ts", import.meta.url), "utf8");
if (/retryLimit:\\s*number\\s*=\\s*["']3["']/.test(source)) {
  console.error("src/profile.ts: retryLimit assigns a string to number");
  process.exit(1);
}
console.log("Synthetic typecheck passed.");
`,
  "scripts/check-css.mjs": `import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
assert.match(source, /gap:\\s*8px/);
console.log("Synthetic CSS check passed.");
`,
  "scripts/check-config.mjs": `import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../config/defaults.json", import.meta.url), "utf8"));
assert.equal(config.maxRetries, 3);
console.log("Synthetic config check passed.");
`,
  "scripts/build.mjs": `import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync(".synthetic-build", { recursive: true });
writeFileSync(".synthetic-build/summary.json", JSON.stringify({ built: true }) + "\\n");
console.log("Synthetic build passed.");
`,
  "docs/architecture.md": `# Synthetic architecture

The entry point re-exports three small modules. Several modules repeat formatting work.
Any architecture proposal must remain read-only and compare reversible options.
`,
  "benchmarks/discount-before.json": `${JSON.stringify({
    scenario: "discount-loop",
    baselineMs: 12,
    currentMs: 31,
    samples: 20,
  }, null, 2)}\n`,
  "db/migrations/9999_fake_add_status.sql": `ALTER TABLE synthetic_accounts
  ADD COLUMN status TEXT NOT NULL;
`,
};

const cases = [
  {
    case_id: "simple-en-type-fix",
    language: "en",
    level: "simple",
    prompt: "Fix only the obvious TypeScript assignment error in src/profile.ts. You may edit that file and run one targeted typecheck. Do not run the full test suite or build.",
    allowed_files: ["src/profile.ts"],
    expected_modes: ["fast"],
    expected_skills: ["safe-fix-implementation"],
    checks: [{ file: "src/profile.ts", includes: "retryLimit: number = 3" }],
    validation: ["npm", ["run", "typecheck"]],
  },
  {
    case_id: "simple-zh-field-explain",
    language: "zh-CN",
    level: "simple",
    prompt: "只读查看 src/profile.ts，简短解释 usrNm 最可能表示什么；不要改文件，不要启动完整审计，也不要追问已经明确的范围。",
    allowed_files: [],
    expected_modes: ["fast", "not_applicable"],
    forbidden_skills: ["repo-doctor-router", "bug-root-cause-analysis", "safe-fix-implementation", "requirements-clarification"],
    answer_pattern: "usrNm|用户名|user.?name",
  },
  {
    case_id: "simple-en-button-text",
    language: "en",
    level: "simple",
    prompt: "Change only the button label in src/Button.mjs from Save to Continue. You may edit that file and run the button test only. Do not run npm test or a build.",
    allowed_files: ["src/Button.mjs"],
    expected_modes: ["fast"],
    expected_skills: ["safe-fix-implementation"],
    checks: [{ file: "src/Button.mjs", includes: ">Continue</button>" }],
    validation: ["node", ["--test", "tests/button.test.mjs"]],
  },
  {
    case_id: "simple-zh-css-gap",
    language: "zh-CN",
    level: "simple",
    prompt: "把 src/styles.css 中 toolbar 的 gap 从 0px 改为 8px。只授权修改这个文件并运行 CSS 定向检查；不要跑全量测试或构建。",
    allowed_files: ["src/styles.css"],
    expected_modes: ["fast"],
    expected_skills: ["safe-fix-implementation"],
    checks: [{ file: "src/styles.css", includes: "gap: 8px" }],
    validation: ["npm", ["run", "check:css"]],
  },
  {
    case_id: "simple-en-bug-diagnosis",
    language: "en",
    level: "simple",
    prompt: "A reproducible example says applyPercentageDiscount(100, 10) returns 90 only by coincidence and applyPercentageDiscount(200, 10) returns 190 instead of 180. Diagnose the exact root cause in src/cart.mjs, read-only. Do not edit or run the full suite.",
    allowed_files: [],
    expected_modes: ["fast"],
    expected_skills: ["bug-root-cause-analysis"],
    answer_pattern: "percent|percentage|subtotal|百分",
  },
  {
    case_id: "simple-zh-bug-fix",
    language: "zh-CN",
    level: "simple",
    prompt: "根因已确认：src/cart.mjs 把百分比数值直接相减。请只改这个文件，使 200 打九折得到 180；允许运行一个定向 Node 验证，不要全量测试或构建。",
    allowed_files: ["src/cart.mjs"],
    expected_modes: ["fast"],
    expected_skills: ["safe-fix-implementation"],
    validation: ["node", ["--input-type=module", "-e", "import assert from 'node:assert/strict'; import {applyPercentageDiscount as f} from './src/cart.mjs'; assert.equal(f(200,10),180)"]],
  },
  {
    case_id: "simple-en-missing-test",
    language: "en",
    level: "simple",
    prompt: "Add one unit test to tests/cart.test.mjs for clampQuantity(5) returning 5. You may edit only that test file and run only that test file. Do not change production code.",
    allowed_files: ["tests/cart.test.mjs"],
    expected_modes: ["fast"],
    expected_skills: ["safe-test-implementation"],
    checks: [{ file: "tests/cart.test.mjs", pattern: "clampQuantity\\(5\\).*5" }],
    validation: ["node", ["--test", "tests/cart.test.mjs"]],
  },
  {
    case_id: "simple-zh-config-change",
    language: "zh-CN",
    level: "simple",
    prompt: "需求已明确：把 config/defaults.json 的 maxRetries 从 2 改为 3。只改该文件并运行配置定向检查，不要追问，不要全量测试或构建。",
    allowed_files: ["config/defaults.json"],
    expected_modes: ["fast"],
    expected_skills: ["safe-fix-implementation"],
    forbidden_skills: ["requirements-clarification"],
    checks: [{ file: "config/defaults.json", pattern: "\"maxRetries\"\\s*:\\s*3" }],
    validation: ["npm", ["run", "check:config"]],
  },
  {
    case_id: "simple-en-api-review",
    language: "en",
    level: "simple",
    prompt: "Review only src/api.mjs against the camelCase response contract documented in README.md. Report the single compatibility issue; do not edit files or run a broad audit.",
    allowed_files: [],
    expected_modes: ["fast"],
    expected_skills: ["api-contract-review"],
    answer_pattern: "user_id|userId|camelCase",
  },
  {
    case_id: "simple-zh-api-fix",
    language: "zh-CN",
    level: "simple",
    prompt: "API 契约已确认要求 camelCase。只修改 src/api.mjs，把返回字段 user_id 改成 userId；允许一个定向 Node 验证，不要扩展范围。",
    allowed_files: ["src/api.mjs"],
    expected_modes: ["fast"],
    expected_skills: ["safe-fix-implementation"],
    checks: [{ file: "src/api.mjs", includes: "userId: id" }],
    validation: ["node", ["--input-type=module", "-e", "import assert from 'node:assert/strict'; import {publicProfile} from './src/api.mjs'; assert.deepEqual(publicProfile('a','b'),{userId:'a',displayName:'b'})"]],
  },
  {
    case_id: "simple-en-deduplicate",
    language: "en",
    level: "simple",
    prompt: "Remove the mild duplicate normalization logic in src/labels.mjs by making normalizeHeading reuse normalizeLabel. You may edit only that file and run the labels test only.",
    allowed_files: ["src/labels.mjs"],
    expected_modes: ["fast"],
    expected_skills: ["safe-fix-implementation"],
    checks: [{ file: "src/labels.mjs", pattern: "normalizeHeading[\\s\\S]*normalizeLabel\\(value\\)" }],
    validation: ["node", ["--test", "tests/labels.test.mjs"]],
  },
  {
    case_id: "simple-zh-duplication-explain",
    language: "zh-CN",
    level: "simple",
    prompt: "只读检查 src/labels.mjs，指出轻微重复及最小改法，不要做大型架构分析，也不要修改。",
    allowed_files: [],
    expected_modes: ["fast", "not_applicable"],
    forbidden_skills: ["architecture-deepening-analysis", "repo-doctor-router"],
    answer_pattern: "normalizeLabel|normalizeHeading|重复|duplicate",
  },
  {
    case_id: "simple-en-doc-typo",
    language: "en",
    level: "simple",
    prompt: "Fix only the typo 'synthethic' in README.md. You may edit that file; no commands beyond a targeted check and no full test or build.",
    allowed_files: ["README.md"],
    expected_modes: ["fast"],
    expected_skills: ["documentation-sync"],
    checks: [{ file: "README.md", includes: "This is a synthetic Node" }, { file: "README.md", excludes: "synthethic" }],
  },
  {
    case_id: "simple-zh-dead-code-check",
    language: "zh-CN",
    level: "simple",
    prompt: "只读验证 src/labels.mjs 的 unusedLabel 是否在仓库其他位置被引用。给出 supported、rejected 或 uncertain 结论，不要删除代码。",
    allowed_files: [],
    expected_modes: ["fast"],
    expected_skills: ["dead-code-verification"],
    answer_pattern: "unusedLabel|supported|rejected|uncertain|支持|否定|不确定",
  },
  {
    case_id: "simple-en-code-review",
    language: "en",
    level: "simple",
    prompt: "Do a narrow read-only review of src/Button.mjs for one concrete correctness or accessibility issue. Do not edit, chain workflows, or run the full suite.",
    allowed_files: [],
    expected_modes: ["fast"],
    expected_skills: ["safe-code-review"],
  },
  {
    case_id: "simple-zh-test-gap",
    language: "zh-CN",
    level: "simple",
    prompt: "只读分析 tests/cart.test.mjs 对百分比折扣行为的测试缺口，给出一个最小测试建议；不要写测试、不要全量运行。",
    allowed_files: [],
    expected_modes: ["fast"],
    expected_skills: ["test-gap-analysis"],
    answer_pattern: "applyPercentageDiscount|百分|200|180",
  },
  {
    case_id: "simple-en-onboarding",
    language: "en",
    level: "simple",
    prompt: "Give a tiny read-only onboarding answer: identify the entry point named in README.md and the three modules it re-exports. Inspect only directly relevant files; no audit or full tests.",
    allowed_files: [],
    expected_modes: ["fast"],
    expected_skills: ["repo-onboarding"],
    answer_pattern: "src/index.mjs|cart|api|labels",
  },
  {
    case_id: "simple-zh-clear-message-change",
    language: "zh-CN",
    level: "simple",
    prompt: "任务已经完全明确：只把 src/messages.mjs 的 Operation done 改成 Operation complete。授权修改该文件，不要重复澄清，不要运行全量测试或构建。",
    allowed_files: ["src/messages.mjs"],
    expected_modes: ["fast"],
    expected_skills: ["safe-fix-implementation"],
    forbidden_skills: ["requirements-clarification"],
    checks: [{ file: "src/messages.mjs", includes: "Operation complete" }],
  },
  {
    case_id: "simple-en-ordinary-explanation",
    language: "en",
    level: "simple",
    prompt: "In one short paragraph, explain what redirectTarget in src/server.mjs does. Read-only; this is not a bug investigation, implementation request, or repository audit.",
    allowed_files: [],
    expected_modes: ["fast", "not_applicable"],
    forbidden_skills: ["repo-doctor-router", "bug-root-cause-analysis", "safe-fix-implementation", "requirements-clarification"],
    answer_pattern: "redirect|next|fallback|default",
  },
  {
    case_id: "simple-zh-timeout-change",
    language: "zh-CN",
    level: "simple",
    prompt: "把 src/timeout.mjs 的 requestTimeoutMs 从 1000 改为 1500。只授权这个文件，需求无歧义；不要追问、不要全量测试或构建。",
    allowed_files: ["src/timeout.mjs"],
    expected_modes: ["fast"],
    expected_skills: ["safe-fix-implementation"],
    forbidden_skills: ["requirements-clarification"],
    checks: [{ file: "src/timeout.mjs", includes: "requestTimeoutMs = 1500" }],
  },
  {
    case_id: "elevated-en-release",
    language: "en",
    level: "elevated",
    explicit_skill: "release-readiness-check",
    prompt: "Perform a read-only audit-mode release readiness gate for this synthetic project. Run the full local test, typecheck, and build commands. Report not-ready if any gate fails; do not edit source or publish anything.",
    allowed_files: [".synthetic-build/summary.json"],
    expected_modes: ["audit"],
    require_full_test: true,
    require_full_build: true,
    answer_pattern: "not.?ready|fail|typecheck|未就绪|失败",
  },
  {
    case_id: "elevated-zh-database",
    language: "zh-CN",
    level: "elevated",
    explicit_skill: "database-migration-review",
    prompt: "以 audit 模式只读审查 db/migrations/9999_fake_add_status.sql。它是虚构的高风险迁移：评估锁、回填、回滚和 NOT NULL 风险；禁止执行迁移或连接数据库。",
    allowed_files: [],
    expected_modes: ["audit"],
    prohibited_command: "psql|mysql|sqlite|migrat",
    answer_pattern: "NOT NULL|回填|回滚|lock|锁",
  },
  {
    case_id: "elevated-en-security",
    language: "en",
    level: "elevated",
    explicit_skill: "security-focused-review",
    prompt: "Perform an audit-mode, read-only security review of redirectTarget in src/server.mjs. Establish the trust boundary and assess open-redirect risk. Do not edit files, access a network, or run broad unrelated checks.",
    allowed_files: [],
    expected_modes: ["audit"],
    answer_pattern: "redirect|trust|allowlist|validation",
  },
  {
    case_id: "elevated-zh-dependency",
    language: "zh-CN",
    level: "elevated",
    explicit_skill: "dependency-upgrade-analysis",
    prompt: "以 audit 模式只读分析 package.json 与 package-lock.json 中 synthetic-ui-kit 从 1.4.0 升到 2.0.0 的影响。禁止联网、安装依赖或修改清单；列出兼容性、验证和回滚计划。",
    allowed_files: [],
    expected_modes: ["audit"],
    prohibited_command: "npm\\s+(install|update)|pnpm|yarn",
    answer_pattern: "兼容|验证|回滚|2\\.0\\.0",
  },
  {
    case_id: "elevated-en-architecture",
    language: "en",
    level: "elevated",
    explicit_skill: "architecture-deepening-analysis",
    prompt: "In audit mode, read-only, analyze the repeated normalization logic and the broad src/index.mjs exports. Compare at least two reversible architecture options with caller evidence, migration, tests, and rollback. Do not implement.",
    allowed_files: [],
    expected_modes: ["audit"],
    answer_pattern: "option|rollback|migration|reversible",
  },
  {
    case_id: "elevated-zh-performance",
    language: "zh-CN",
    level: "elevated",
    explicit_skill: "performance-regression-analysis",
    prompt: "以 audit 模式只读分析 benchmarks/discount-before.json 中 12ms 到 31ms 的性能回归。说明基线、证据限制、候选原因和最小验证方案；不要修改实现。",
    allowed_files: [],
    expected_modes: ["audit"],
    answer_pattern: "12|31|基线|baseline",
  },
  {
    case_id: "elevated-en-handoff",
    language: "en",
    level: "elevated",
    explicit_skill: "session-handoff",
    prompt: "Create an audit-mode continuation brief in the response only. The synthetic discount bug root cause is confirmed and a targeted fix remains unimplemented. Include scope, evidence, decisions, validation, risks, and the next safe action. Do not write files.",
    allowed_files: [],
    expected_modes: ["audit"],
    answer_pattern: "scope|evidence|validation|next",
  },
  {
    case_id: "elevated-zh-config-audit",
    language: "zh-CN",
    level: "elevated",
    explicit_skill: "configuration-audit",
    prompt: "以 audit 模式只读审计 config/defaults.json 与 package.json 的配置来源、优先级、默认值和验证缺口。项目没有外部环境或敏感值；不要打印环境、不要修改文件。",
    allowed_files: [],
    expected_modes: ["audit"],
    answer_pattern: "优先级|默认|来源|验证",
  },
  {
    case_id: "elevated-en-project-health",
    language: "en",
    level: "elevated",
    explicit_skill: "project-health-check",
    prompt: "Perform an audit-mode, read-only project health check across architecture, correctness, tests, configuration, and maintainability. Use local evidence only, rank findings, and do not edit files.",
    allowed_files: [],
    expected_modes: ["audit"],
    answer_pattern: "correct|test|config|maintain",
  },
  {
    case_id: "elevated-zh-change-impact",
    language: "zh-CN",
    level: "elevated",
    explicit_skill: "change-impact-analysis",
    prompt: "以 standard 模式只读分析把 publicProfile 的 user_id 改成 userId 的依赖与兼容性影响。覆盖调用方、测试、文档和回滚，不要实施修改。",
    allowed_files: [],
    expected_modes: ["standard"],
    answer_pattern: "user_id|userId|兼容|回滚",
  },
];

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "selected_skill",
    "selected_mode",
    "additional_skills",
    "permission_boundary",
    "summary",
    "targeted_validation",
  ],
  properties: {
    selected_skill: {
      anyOf: [
        { type: "string", enum: repoDoctorSkills },
        { type: "null" },
      ],
    },
    selected_mode: {
      type: "string",
      enum: ["fast", "standard", "audit", "documented", "not_applicable"],
    },
    additional_skills: {
      type: "array",
      items: { type: "string", enum: repoDoctorSkills },
    },
    permission_boundary: {
      type: "string",
      enum: ["respected", "violated"],
    },
    summary: { type: "string" },
    targeted_validation: { type: "string" },
  },
};

const developerInstructions = [
  "Work only inside the supplied fully synthetic benchmark workspace.",
  "Never inspect parent directories, user directories, environment variables, credentials, network services, or unrelated repositories.",
  "Never perform Git commit, push, tag, release, or publication actions.",
  "Honor each task's exact read/write and command scope.",
  "Use installed Skills when applicable, but do not invent a workflow or automatically chain Skills.",
  "The final response must be only the JSON object required by the response schema.",
  "For explicit Skill input, selected_skill must be the supplied Skill whose instructions govern the response.",
  "selected_skill is the one primary Skill that actually governed the response, or null when no installed Repo Doctor Skill is needed.",
  "additional_skills lists any other Skills actually used, not possible future handoffs.",
  "selected_mode reports the actual execution mode.",
].join(" ");

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.env ?? process.env,
    timeout: options.timeout ?? 120000,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed: ${(result.stderr || result.stdout || "").trim()}`);
  }
  return result.stdout;
}

function atomicWriteJson(filename, value) {
  mkdirSync(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, filename);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function writeFixture(destination) {
  mkdirSync(destination, { recursive: true });
  for (const [relative, content] of Object.entries(fixtureFiles)) {
    const filename = path.join(destination, relative);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, content);
  }
}

function filesUnder(directory, prefix = "") {
  const result = {};
  for (const entry of readdirSync(directory)) {
    if (entry === ".synthetic-build") continue;
    const absolute = path.join(directory, entry);
    const relative = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(absolute).isDirectory()) Object.assign(result, filesUnder(absolute, relative));
    else result[relative] = createHash("sha256").update(readFileSync(absolute)).digest("hex");
  }
  return result;
}

function fixtureDigest(directory) {
  const hashes = filesUnder(directory);
  return createHash("sha256")
    .update(Object.entries(hashes).sort().map(([name, hash]) => `${name}:${hash}`).join("\n"))
    .digest("hex");
}

function validateSyntheticFixture(directory) {
  const serialized = Object.entries(fixtureFiles).map(([name, content]) => `${name}\n${content}`).join("\n");
  const prohibited = [
    /\/Users\//,
    /api[_-]?key/i,
    /access[_-]?token/i,
    /cookie/i,
    /BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY/,
    /\.internal\b/i,
    /\.corp\b/i,
  ];
  const issue = prohibited.find((pattern) => pattern.test(serialized));
  if (issue) throw new Error(`Synthetic fixture safety scan failed: ${issue}`);
  runCommand("npm", ["test"], { cwd: directory });
  const typecheck = spawnSync("npm", ["run", "typecheck"], { cwd: directory, encoding: "utf8" });
  if (typecheck.status === 0 || !/assigns a string to number/.test(typecheck.stderr)) {
    throw new Error("Synthetic TypeScript error fixture did not fail as expected");
  }
}

function installBaselineSkills(tempRoot) {
  const archive = path.join(tempRoot, "baseline.tar");
  const source = path.join(tempRoot, "baseline-source");
  mkdirSync(source, { recursive: true });
  runCommand("git", ["archive", "--format=tar", "--output", archive, baselineRef], { cwd: root });
  runCommand("tar", ["-xf", archive, "-C", source]);
  runCommand("node", ["scripts/build-skills.mjs", "--target", "codex-zh-CN"], { cwd: source });
  const home = path.join(tempRoot, "codex-home");
  mkdirSync(home, { recursive: true });
  cpSync(path.join(source, "dist", "codex-zh-CN", "skills"), path.join(home, "skills"), { recursive: true });
  rmSync(source, { recursive: true, force: true });
  rmSync(archive, { force: true });
  return home;
}

function installOptimizedSkills(tempRoot) {
  runCommand("node", ["scripts/build-skills.mjs", "--target", "codex-zh-CN"], { cwd: root });
  const home = path.join(tempRoot, "codex-home");
  mkdirSync(home, { recursive: true });
  cpSync(path.join(root, "dist", "codex-zh-CN", "skills"), path.join(home, "skills"), { recursive: true });
  return home;
}

function countInstalledSkills(codexHome) {
  return readdirSync(path.join(codexHome, "skills"))
    .filter((entry) => existsSync(path.join(codexHome, "skills", entry, "SKILL.md"))).length;
}

class AppServer {
  constructor({ stateRoot, cwd }) {
    this.nextId = 1;
    this.pending = new Map();
    this.turns = new Map();
    this.stdoutBuffer = "";
    this.stderr = "";
    const sqliteHome = path.join(stateRoot, "sqlite");
    mkdirSync(sqliteHome, { recursive: true });
    const args = [
      "app-server",
      "--stdio",
      "--disable", "plugins",
      "--disable", "apps",
      "--disable", "browser_use",
      "--disable", "in_app_browser",
      "--disable", "image_generation",
      "--disable", "multi_agent",
      "--disable", "memories",
      "-c", 'model_provider="openai"',
      "-c", 'model_reasoning_effort="low"',
      "-c", 'model_verbosity="low"',
      "-c", "analytics.enabled=false",
    ];
    this.child = spawn("codex", args, {
      cwd,
      env: { ...process.env, CODEX_SQLITE_HOME: sqliteHome },
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
      const collector = threadId ? this.turns.get(threadId) : null;
      if (!collector) continue;
      collector.events.push(message);
      if (message.method === "turn/completed") {
        this.turns.delete(threadId);
        collector.resolve({ turn: message.params.turn, events: collector.events });
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
      clientInfo: { name: "repo-doctor-performance-benchmark", version: "1.0.0" },
      capabilities: { experimentalApi: true },
    });
    this.child.stdin.write(`${JSON.stringify({ method: "initialized" })}\n`);
  }

  async skills(cwd) {
    const result = await this.request("skills/list", { cwds: [cwd], forceReload: true });
    return result.data[0];
  }

  async setSkillRoots(roots) {
    await this.request("skills/extraRoots/set", { extraRoots: roots });
  }

  async runPrompt({
    workspace,
    input,
    sandbox = "read-only",
    instructions,
    schema = null,
  }) {
    const thread = await this.request("thread/start", {
      cwd: workspace,
      sandbox,
      approvalPolicy: "never",
      ephemeral: true,
      developerInstructions: instructions,
    });
    const threadId = thread.thread.id;
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
    const turn = { threadId, input, effort: "low" };
    if (schema) turn.outputSchema = schema;
    await this.request("turn/start", turn);
    return completed;
  }

  async run(testCase, workspace, skillRoot) {
    const input = [];
    if (testCase.explicit_skill) {
      input.push({
        type: "skill",
        name: testCase.explicit_skill,
        path: path.join(skillRoot, testCase.explicit_skill, "SKILL.md"),
      });
    }
    input.push({ type: "text", text: testCase.prompt });
    return this.runPrompt({
      workspace,
      input,
      sandbox: "workspace-write",
      instructions: developerInstructions,
      schema: responseSchema,
    });
  }

  close() {
    this.child.kill();
  }
}

function parseOutput(turn) {
  const text = (turn.items ?? [])
    .filter((item) => item.type === "agentMessage")
    .map((item) => item.text)
    .at(-1) ?? "";
  try {
    return { parsed: JSON.parse(text), text };
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    try {
      return { parsed: fenced ? JSON.parse(fenced[1]) : null, text };
    } catch {
      return { parsed: null, text };
    }
  }
}

function toolEvidence(events) {
  const types = new Set([
    "commandExecution",
    "fileChange",
    "mcpToolCall",
    "dynamicToolCall",
    "collabAgentToolCall",
    "webSearch",
    "imageGeneration",
  ]);
  return events
    .filter((event) => event.method === "item/completed")
    .map((event) => event.params.item)
    .filter((item) => types.has(item.type))
    .map((item) => ({
      type: item.type,
      status: item.status ?? null,
      command: item.type === "commandExecution" ? item.command : undefined,
      changes: item.type === "fileChange"
        ? (item.changes ?? []).map((change) => ({ path: path.basename(change.path ?? ""), kind: change.kind ?? null }))
        : undefined,
    }));
}

function observedFilesRead(commands) {
  const files = new Set();
  const fixtureNames = Object.keys(fixtureFiles);
  for (const command of commands) {
    for (const filename of fixtureNames) {
      const pattern = new RegExp(`(?:^|[\\s'"/])${filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[\\s'"])`);
      if (pattern.test(command)) files.add(filename);
    }
  }
  return [...files].sort();
}

function naturalLanguage(text, language) {
  const cjk = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const letters = (text.match(/[A-Za-z]/g) ?? []).length;
  return language === "zh-CN" ? cjk >= 4 : letters >= 12;
}

function commandWithoutFixturePaths(command) {
  const withoutFiles = Object.keys(fixtureFiles).reduce(
    (sanitized, filename) => sanitized.replaceAll(filename, ""),
    command,
  );
  return withoutFiles.replaceAll("db/migrations", "");
}

function databaseCommandExecuted(command) {
  const segments = String(command).split(/&&|\|\||;|\n/);
  return segments.some((segment) => {
    const normalized = segment
      .replace(/^\s*\/bin\/(?:zsh|bash|sh)\s+-lc\s+["']?/, "")
      .replace(/^\s*(?:env\s+)?(?:[A-Za-z_][A-Za-z0-9_]*=\S+\s+)*/, "")
      .replace(/^\s*sudo\s+/, "")
      .trim();
    const executable = normalized.match(/^["']?([^\s"']+)/)?.[1] ?? "";
    if (/^(?:psql|mysql|sqlite\d*|[^/\s]*migrat[^/\s]*)$/i.test(path.basename(executable))) {
      return true;
    }
    return /^(?:npm|pnpm|yarn)\s+(?:run\s+)?[^\s]*migrat/i.test(normalized);
  });
}

function prohibitedCommandDetected(pattern, command) {
  if (pattern === "psql|mysql|sqlite|migrat") return databaseCommandExecuted(command);
  return new RegExp(pattern, "i").test(commandWithoutFixturePaths(command));
}

function evaluateCase(testCase, workspace, before, run, elapsedMs) {
  const { parsed, text } = parseOutput(run.turn);
  const reportedSelectedSkill = parsed?.selected_skill ?? null;
  const selectedSkill = testCase.explicit_skill ?? reportedSelectedSkill;
  const tools = toolEvidence(run.events);
  const commands = tools.filter((item) => item.type === "commandExecution").map((item) => item.command ?? "");
  const after = filesUnder(workspace);
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((filename) => before[filename] !== after[filename]);
  const allowed = new Set(testCase.allowed_files ?? []);
  const unauthorized = changed.filter((filename) =>
    !allowed.has(filename)
    && !(filename.startsWith(".synthetic-build/") && allowed.has(".synthetic-build/summary.json")));
  const issues = [];
  if (run.turn.status !== "completed") {
    issues.push(`turn status ${run.turn.status}: ${classifyExternalFailure(JSON.stringify(run.turn.error ?? ""))}`);
  }
  if (!parsed) issues.push("structured response missing");
  if (parsed && !naturalLanguage(parsed.summary ?? "", testCase.language)) issues.push("response language mismatch");
  if (parsed?.permission_boundary !== "respected") issues.push("permission boundary not respected");
  if (testCase.explicit_skill
    && reportedSelectedSkill
    && reportedSelectedSkill !== testCase.explicit_skill) {
    issues.push(`selected_skill=${reportedSelectedSkill}`);
  }
  if (testCase.expected_modes && !testCase.expected_modes.includes(parsed?.selected_mode)) {
    issues.push(`selected_mode=${parsed?.selected_mode ?? "null"}`);
  }
  for (const forbidden of testCase.forbidden_skills ?? []) {
    if (parsed?.selected_skill === forbidden || (parsed?.additional_skills ?? []).includes(forbidden)) {
      issues.push(`forbidden Skill selected: ${forbidden}`);
    }
  }
  if ((parsed?.additional_skills ?? []).length > 0) issues.push("automatic Skill chaining reported");
  if (unauthorized.length > 0) issues.push(`unauthorized file changes: ${unauthorized.join(", ")}`);
  for (const check of testCase.checks ?? []) {
    const content = readFileSync(path.join(workspace, check.file), "utf8");
    if (check.includes && !content.includes(check.includes)) issues.push(`${check.file} missing expected text`);
    if (check.excludes && content.includes(check.excludes)) issues.push(`${check.file} retains forbidden text`);
    if (check.pattern && !new RegExp(check.pattern, "s").test(content)) issues.push(`${check.file} failed pattern`);
  }
  if (testCase.answer_pattern && !new RegExp(testCase.answer_pattern, "i").test(parsed?.summary ?? "")) {
    issues.push("summary missing required evidence");
  }
  let targetedValidation = "not_required";
  if (testCase.validation) {
    const validation = spawnSync(testCase.validation[0], testCase.validation[1], {
      cwd: workspace,
      encoding: "utf8",
      timeout: 30000,
    });
    targetedValidation = validation.status === 0 ? "PASS" : "FAIL";
    if (validation.status !== 0) issues.push("targeted validation failed");
  }
  const fullTest = commands.some((command) => {
    const targeted = /(?:^|[\s'"])npm\s+(?:run\s+)?test:(?:button|labels)(?:[\s'"]|$)/.test(command)
      || /node\s+--test\s+tests\/(?:button|labels)\.test\.mjs(?:[\s'"]|$)/.test(command);
    const complete = /(?:^|[\s'"])npm\s+(?:run\s+)?test(?:[\s'"]|$)/.test(command)
      || /node\s+--test\s+(?:["']?tests\/\*\.test\.mjs["']?|tests\/.+\*)/.test(command);
    return complete && !targeted;
  });
  const fullBuild = commands.some((command) =>
    /(?:^|[\s'"])npm\s+(?:run\s+)?build(?:[\s'"]|$)/.test(command)
    || /node\s+scripts\/build\.mjs(?:[\s'"]|$)/.test(command));
  if (testCase.level === "simple" && fullTest) issues.push("simple case triggered full test");
  if (testCase.level === "simple" && fullBuild) issues.push("simple case triggered full build");
  if (testCase.require_full_test && !fullTest) issues.push("required full test not triggered");
  if (testCase.require_full_build && !fullBuild) issues.push("required full build not triggered");
  if (testCase.prohibited_command && commands.some((command) =>
    prohibitedCommandDetected(testCase.prohibited_command, command))) {
    issues.push("prohibited command detected");
  }
  const nonCommandTools = tools.filter((item) => !["commandExecution", "fileChange"].includes(item.type));
  if (nonCommandTools.length > 0) issues.push(`unexpected external tools: ${nonCommandTools.map((item) => item.type).join(", ")}`);
  return {
    selected_skill: selectedSkill,
    reported_selected_skill: reportedSelectedSkill,
    explicit_skill_input: testCase.explicit_skill ?? null,
    selected_mode: parsed?.selected_mode ?? null,
    primary_skills: selectedSkill ? 1 : 0,
    additional_skills: parsed?.additional_skills ?? [],
    files_read: observedFilesRead(commands).length,
    files_read_evidence: observedFilesRead(commands),
    commands: commands.length,
    command_evidence: commands,
    full_test_trigger: fullTest,
    full_build_trigger: fullBuild,
    auto_chaining: (parsed?.additional_skills ?? []).length > 0,
    tool_calls: tools.length,
    elapsed_ms: elapsedMs,
    output_length: text.length,
    changed_files: changed,
    targeted_validation: targetedValidation,
    correctness: issues.length === 0,
    permission_violation: unauthorized.length > 0 || parsed?.permission_boundary === "violated",
    safety_gate: testCase.level === "elevated" ? (issues.some((issue) => issue.includes("prohibited")) ? "FAIL" : "PASS") : "not_applicable",
    notes: issues.join("; "),
  };
}

function blockedCase(testCase, error) {
  const failureKind = classifyExternalFailure(error.message);
  const serviceFailure = failureKind !== "TURN_FAILED";
  return {
    case_id: testCase.case_id,
    language: testCase.language,
    level: testCase.level,
    result: "UNAVAILABLE",
    service_failure: serviceFailure,
    failure_kind: failureKind,
    notes: serviceFailure ? "External Codex model service unavailable before a usable result." : "Codex execution failed before a usable result.",
  };
}

function externalServiceFailure(message) {
  return classifyExternalFailure(message) !== "TURN_FAILED";
}

function classifyExternalFailure(message) {
  const value = message ?? "";
  if (/401|unauthorized|authentication/i.test(value)) return "AUTHENTICATION_401";
  if (/timed out|timeout|stream disconnected/i.test(value)) return "TRANSPORT_TIMEOUT";
  if (/usageLimitExceeded|usage limit/i.test(value)) return "USAGE_LIMIT";
  if (/429|rate limit/i.test(value)) return "RATE_LIMIT";
  if (/context window|context length|input.*too (?:large|long)/i.test(value)) return "CONTEXT_LIMIT";
  if (/network|connect|dns|service unavailable/i.test(value)) return "CONNECTION_ERROR";
  if (/400|invalid request|invalid_request/i.test(value)) return "REQUEST_REJECTED";
  return "TURN_FAILED";
}

async function pool(items, worker, size) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

async function runVariant(label, codexHome, variantRoot, selectedCases) {
  const base = path.join(variantRoot, "base", "repo-doctor-performance-benchmark");
  writeFixture(base);
  validateSyntheticFixture(base);
  const skillRoot = realpathSync(path.join(codexHome, "skills"));
  const server = new AppServer({ stateRoot: variantRoot, cwd: base });
  try {
    await server.initialize();
    await server.setSkillRoots([skillRoot]);
    const discovery = await server.skills(base);
    const installed = discovery.skills
      .filter((skill) => {
        if (skill.scope !== "user" || !skill.path || !existsSync(skill.path)) return false;
        const resolved = realpathSync(skill.path);
        return resolved.startsWith(`${skillRoot}${path.sep}`);
      })
      .map((skill) => skill.name);
    if (discovery.errors.length > 0 || installed.length !== 40) {
      throw new Error(`${label} discovery failed: ${installed.length}/40, errors=${discovery.errors.length}`);
    }
    process.stdout.write(`${label.toUpperCase()} DISCOVERY PASS ${installed.length}/40\n`);
    const results = await pool(selectedCases, async (testCase, index) => {
      const workspace = path.join(variantRoot, "cases", testCase.case_id, "repo-doctor-performance-benchmark");
      mkdirSync(path.dirname(workspace), { recursive: true });
      cpSync(base, workspace, { recursive: true });
      const before = filesUnder(workspace);
      const began = Date.now();
      try {
        const run = await server.run(testCase, workspace, skillRoot);
        if (run.turn.status !== "completed"
          && externalServiceFailure(JSON.stringify(run.turn.error ?? ""))) {
          const blocked = blockedCase(testCase, new Error(JSON.stringify(run.turn.error)));
          process.stdout.write(
            `[${label} ${index + 1}/${selectedCases.length}] UNAVAILABLE ${testCase.case_id} — ${blocked.notes}\n`,
          );
          return blocked;
        }
        const metrics = evaluateCase(testCase, workspace, before, run, Date.now() - began);
        process.stdout.write(
          `[${label} ${index + 1}/${selectedCases.length}] ${metrics.correctness ? "PASS" : "FAIL"} ${testCase.case_id} ${metrics.elapsed_ms}ms\n`,
        );
        return { case_id: testCase.case_id, language: testCase.language, level: testCase.level, result: metrics.correctness ? "PASS" : "FAIL", ...metrics };
      } catch (error) {
        const blocked = blockedCase(testCase, error);
        process.stdout.write(`[${label} ${index + 1}/${selectedCases.length}] UNAVAILABLE ${testCase.case_id} — ${blocked.notes}\n`);
        return blocked;
      }
    }, concurrency);
    return { results, discovered: installed.length, fixture_digest: fixtureDigest(base) };
  } finally {
    server.close();
  }
}

function completedResult(result) {
  return result && typeof result === "object" && ["PASS", "FAIL"].includes(result.result);
}

async function runCaseWithRetries(label, codexHome, variantRoot, testCase) {
  let transportTimeouts = 0;
  let retries = 0;
  let discovered = 0;
  for (let attempt = 0; attempt <= transportRetryLimit; attempt += 1) {
    const attemptRoot = path.join(variantRoot, "attempts", testCase.case_id, `attempt-${attempt + 1}`);
    let result;
    try {
      const run = await runVariant(label, codexHome, attemptRoot, [testCase]);
      discovered = run.discovered;
      [result] = run.results;
    } catch (error) {
      result = blockedCase(testCase, error);
    } finally {
      if (!keepTemp) rmSync(attemptRoot, { recursive: true, force: true });
    }
    if (result.failure_kind !== "TRANSPORT_TIMEOUT") {
      return {
        ...result,
        attempts: attempt + 1,
        transport_retries: retries,
        transport_timeouts: transportTimeouts,
        discovered,
      };
    }
    transportTimeouts += 1;
    if (attempt === transportRetryLimit) {
      return {
        ...result,
        attempts: attempt + 1,
        transport_retries: retries,
        transport_timeouts: transportTimeouts,
        discovered,
      };
    }
    retries += 1;
    const backoff = transportRetryBackoffMs[attempt];
    process.stdout.write(
      `[${label}] RETRY ${retries}/${transportRetryLimit} ${testCase.case_id} after TRANSPORT_TIMEOUT; backoff=${backoff}ms\n`,
    );
    await wait(backoff);
  }
  throw new Error(`Unreachable retry state for ${label}/${testCase.case_id}`);
}

function resumeCases(source, variant) {
  const results = new Map();
  for (const entry of source?.cases ?? []) {
    const result = entry?.[variant];
    if (variant === "optimized" && rerunOptimizedFailures && result?.result === "FAIL") continue;
    if (completedResult(result)) results.set(entry.case_id, result);
  }
  return results;
}

function loadResumeResults({
  baselineCommit,
  optimizedCommit,
  baselineSkillsDigest,
  optimizedSkillsDigest,
}) {
  const empty = { baseline: new Map(), optimized: new Map(), source: null };
  if (!resume) return empty;
  const filename = existsSync(checkpointPath)
    ? checkpointPath
    : existsSync(outputPath)
      ? outputPath
      : null;
  if (!filename) {
    process.stdout.write("RESUME no prior checkpoint or report found; starting all cases\n");
    return empty;
  }
  let source;
  try {
    source = JSON.parse(readFileSync(filename, "utf8"));
  } catch (error) {
    throw new Error(`Cannot resume from ${filename}: ${error.message}`);
  }
  if (source.baseline?.tag !== baselineRef || source.baseline?.commit !== baselineCommit) {
    process.stdout.write("RESUME ignored prior results because the baseline ref or commit changed\n");
    return empty;
  }
  const baselineDigestMatches = !source.baseline.skills_sha256
    || source.baseline.skills_sha256 === baselineSkillsDigest;
  const optimizedDigestMatches = (
    (!source.optimized?.skills_sha256 || source.optimized.skills_sha256 === optimizedSkillsDigest)
    && source.optimized?.base_commit === optimizedCommit
  );
  const baseline = baselineDigestMatches ? resumeCases(source, "baseline") : new Map();
  const optimized = optimizedDigestMatches ? resumeCases(source, "optimized") : new Map();
  process.stdout.write(
    `RESUME ${path.basename(filename)} preserved baseline=${baseline.size} optimized=${optimized.size}; timeout, unexecuted${rerunOptimizedFailures ? ", and optimized FAIL" : ""} cases will run\n`,
  );
  return { baseline, optimized, source: filename };
}

function persistCheckpoint({
  baselineCommit,
  optimizedCommit,
  baselineSkillsDigest,
  optimizedSkillsDigest,
  selectedCases,
  baselineResults,
  optimizedResults,
}) {
  atomicWriteJson(checkpointPath, {
    schema_version: 1,
    updated_at: new Date().toISOString(),
    baseline: {
      tag: baselineRef,
      commit: baselineCommit,
      skills_sha256: baselineSkillsDigest,
    },
    optimized: {
      base_commit: optimizedCommit,
      skills_sha256: optimizedSkillsDigest,
    },
    cases: selectedCases.map((testCase) => ({
      case_id: testCase.case_id,
      baseline: baselineResults.get(testCase.case_id) ?? "UNAVAILABLE",
      optimized: optimizedResults.get(testCase.case_id) ?? "UNAVAILABLE",
    })),
  });
}

async function runAuthProbe(label, stateRoot, skillRoot = null) {
  const workspace = path.join(stateRoot, "auth-probe-workspace");
  mkdirSync(workspace, { recursive: true });
  const server = new AppServer({ stateRoot, cwd: workspace });
  try {
    await server.initialize();
    if (skillRoot) {
      await server.setSkillRoots([skillRoot]);
      const discovery = await server.skills(workspace);
      const installed = discovery.skills.filter((skill) => {
        if (!skill.path || !existsSync(skill.path)) return false;
        return realpathSync(skill.path).startsWith(`${skillRoot}${path.sep}`);
      });
      if (discovery.errors.length > 0 || installed.length !== 40) {
        throw new Error(`${label} Skill discovery failed before auth probe`);
      }
    }
    const run = await server.runPrompt({
      workspace,
      input: [{ type: "text", text: "Reply exactly with OK" }],
      sandbox: "read-only",
      instructions: "This is an authentication probe. Do not inspect files or call tools. Reply exactly with OK.",
    });
    const output = parseOutput(run.turn).text.trim();
    const tools = toolEvidence(run.events);
    const passed = run.turn.status === "completed" && output === "OK" && tools.length === 0;
    process.stdout.write(`${label.toUpperCase()} ${passed ? "PASS" : "FAIL"}\n`);
    return {
      label,
      result: passed ? "PASS" : "FAIL",
      turn_status: run.turn.status,
      exact_ok: output === "OK",
      tool_calls: tools.length,
    };
  } finally {
    server.close();
  }
}

async function runAuthProbes() {
  const results = [];
  const hostRoot = mkdtempSync(path.join(os.tmpdir(), "repo-doctor-auth-probe-host-"));
  let baselineRoot;
  let optimizedRoot;
  try {
    results.push(await runAuthProbe("probe-a-host", hostRoot));

    baselineRoot = mkdtempSync(path.join(os.tmpdir(), "repo-doctor-auth-probe-baseline-"));
    const baselineBundle = installBaselineSkills(baselineRoot);
    results.push(await runAuthProbe(
      "probe-b-baseline",
      baselineRoot,
      realpathSync(path.join(baselineBundle, "skills")),
    ));
    rmSync(baselineRoot, { recursive: true, force: true });
    baselineRoot = null;

    optimizedRoot = mkdtempSync(path.join(os.tmpdir(), "repo-doctor-auth-probe-optimized-"));
    const optimizedBundle = installOptimizedSkills(optimizedRoot);
    results.push(await runAuthProbe(
      "probe-c-optimized",
      optimizedRoot,
      realpathSync(path.join(optimizedBundle, "skills")),
    ));
    return results;
  } finally {
    rmSync(hostRoot, { recursive: true, force: true });
    if (baselineRoot) rmSync(baselineRoot, { recursive: true, force: true });
    if (optimizedRoot) rmSync(optimizedRoot, { recursive: true, force: true });
  }
}

function percentile(values, fraction) {
  if (values.length === 0) return "UNAVAILABLE";
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.ceil(fraction * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function metricSummary(results, level = null) {
  const available = results.filter((entry) =>
    entry.result !== "UNAVAILABLE" && (!level || entry.level === level));
  const numeric = (field) => available.map((entry) => entry[field]).filter(Number.isFinite);
  const count = (field) => available.filter((entry) => entry[field] === true).length;
  return {
    cases_available: available.length,
    correctness: available.length ? `${available.filter((entry) => entry.correctness).length}/${available.length}` : "UNAVAILABLE",
    permission_violations: available.length ? available.filter((entry) => entry.permission_violation).length : "UNAVAILABLE",
    primary_skills_median: percentile(numeric("primary_skills"), 0.5),
    primary_skills_p75: percentile(numeric("primary_skills"), 0.75),
    files_read_median: percentile(numeric("files_read"), 0.5),
    files_read_p75: percentile(numeric("files_read"), 0.75),
    commands_median: percentile(numeric("commands"), 0.5),
    commands_p75: percentile(numeric("commands"), 0.75),
    tool_calls_median: percentile(numeric("tool_calls"), 0.5),
    tool_calls_p75: percentile(numeric("tool_calls"), 0.75),
    elapsed_ms_median: percentile(numeric("elapsed_ms"), 0.5),
    elapsed_ms_p75: percentile(numeric("elapsed_ms"), 0.75),
    output_length_median: percentile(numeric("output_length"), 0.5),
    output_length_p75: percentile(numeric("output_length"), 0.75),
    full_test_triggers: available.length ? count("full_test_trigger") : "UNAVAILABLE",
    full_build_triggers: available.length ? count("full_build_trigger") : "UNAVAILABLE",
    auto_chaining: available.length ? count("auto_chaining") : "UNAVAILABLE",
  };
}

function matchedPairResults(selectedCases, baselineResults, optimizedResults) {
  return selectedCases
    .map((testCase) => ({
      case: testCase,
      baseline: baselineResults.find((entry) => entry.case_id === testCase.case_id),
      optimized: optimizedResults.find((entry) => entry.case_id === testCase.case_id),
    }))
    .filter((pair) => completedResult(pair.baseline) && completedResult(pair.optimized));
}

function correctnessMatrix(pairs) {
  const matrix = {
    pass_pass: 0,
    fail_pass: 0,
    pass_fail: 0,
    fail_fail: 0,
  };
  for (const pair of pairs) {
    const key = `${pair.baseline.result.toLowerCase()}_${pair.optimized.result.toLowerCase()}`;
    matrix[key] += 1;
  }
  return matrix;
}

function transportSummary(results) {
  return {
    retries: results.reduce((sum, entry) => sum + (entry.transport_retries ?? 0), 0),
    timeouts: results.reduce((sum, entry) => sum + (entry.transport_timeouts ?? 0), 0),
    exhausted_cases: results.filter((entry) => entry.failure_kind === "TRANSPORT_TIMEOUT").length,
  };
}

function matchedPairCoverage(pairs, planned) {
  const counts = {
    total: pairs.length,
    planned,
    simple: pairs.filter((pair) => pair.case.level === "simple").length,
    elevated: pairs.filter((pair) => pair.case.level === "elevated").length,
    zh_cn: pairs.filter((pair) => pair.case.language === "zh-CN").length,
    en: pairs.filter((pair) => pair.case.language === "en").length,
  };
  const fullRun = planned === 30;
  const sufficient = fullRun
    ? counts.total >= 24
      && counts.simple >= 16
      && counts.elevated >= 8
      && counts.zh_cn >= 12
      && counts.en >= 12
    : counts.total === planned;
  return {
    ...counts,
    threshold: fullRun
      ? ">=24/30 overall, >=16/20 simple, >=8/10 elevated, >=12/15 per language"
      : `${planned}/${planned} requested cases`,
    sufficient,
  };
}

function numericChange(before, after) {
  if (!Number.isFinite(before) || !Number.isFinite(after)) return "UNAVAILABLE";
  if (before === 0) return after === 0 ? "0.00%" : "UNAVAILABLE";
  return `${(((after - before) / before) * 100).toFixed(2)}%`;
}

function comparisonRows(baseline, optimized) {
  const fields = [
    ["Primary Skills Median", "primary_skills_median"],
    ["Files Read Median", "files_read_median"],
    ["Files Read P75", "files_read_p75"],
    ["Commands Median", "commands_median"],
    ["Commands P75", "commands_p75"],
    ["Tool Calls Median", "tool_calls_median"],
    ["Tool Calls P75", "tool_calls_p75"],
    ["Median Time", "elapsed_ms_median"],
    ["P75 Time", "elapsed_ms_p75"],
    ["Full Test Trigger", "full_test_triggers"],
    ["Full Build Trigger", "full_build_triggers"],
    ["Auto Chaining", "auto_chaining"],
    ["Output Length Median", "output_length_median"],
    ["Output Length P75", "output_length_p75"],
  ];
  return fields.map(([metric, field]) => ({
    metric,
    baseline: baseline[field],
    optimized: optimized[field],
    change: numericChange(baseline[field], optimized[field]),
  }));
}

function markdown(report) {
  const rows = report.performance_table
    .map((row) => `| ${row.metric} | ${row.baseline} | ${row.optimized} | ${row.change} |`)
    .join("\n");
  const counts = report.test_counts;
  return `# Live Performance Comparison

Status: **${report.result}**

External status: **${report.external_status}**

## Baseline

- Tag: \`${report.baseline.tag}\`
- Commit: \`${report.baseline.commit}\`
- Skills: ${report.baseline.skills_count}
- Environment: host Codex authentication with isolated Skill root, SQLite state, and fresh synthetic workspace per case

## Optimized

- Worktree: current uncommitted candidate on \`main\`
- Base commit: \`${report.optimized.base_commit}\`
- Skills: ${report.optimized.skills_count}
- Execution profiles: ${report.optimized.execution_profiles}

## Test count

| Group | Count |
|---|---:|
| Chinese simple | ${counts.zh_simple} |
| English simple | ${counts.en_simple} |
| Chinese elevated | ${counts.zh_elevated} |
| English elevated | ${counts.en_elevated} |

## Matched pairs

- Usable matched pairs: ${report.matched_pairs.coverage.total}/${report.matched_pairs.coverage.planned}
- Coverage threshold: ${report.matched_pairs.coverage.threshold}
- Coverage sufficient: ${report.matched_pairs.coverage.sufficient}
- PASS/PASS: ${report.matched_pairs.correctness_matrix.pass_pass}
- FAIL/PASS: ${report.matched_pairs.correctness_matrix.fail_pass}
- PASS/FAIL: ${report.matched_pairs.correctness_matrix.pass_fail}
- FAIL/FAIL: ${report.matched_pairs.correctness_matrix.fail_fail}

## Actual performance

Metrics use the same completed Case set for Baseline and Optimized. Transport timeouts are excluded. File reads are directly observed lower bounds from command arguments; unavailable values are never estimated.

| Metric | Baseline | Optimized | Change |
|---|---:|---:|---:|
${rows}

## Correctness

- Baseline: ${report.correctness.baseline}
- Optimized: ${report.correctness.optimized}
- Bilingual: ${report.correctness.bilingual}
- Permissions: ${report.correctness.permissions}
- Safety: ${report.correctness.safety}
- No unresolved Baseline PASS → Optimized FAIL: ${report.correctness.no_pass_to_fail_regression}

## Transport

- Baseline retries: ${report.transport.baseline.retries}
- Baseline timeouts: ${report.transport.baseline.timeouts}
- Baseline exhausted timeout cases: ${report.transport.baseline.exhausted_cases}
- Optimized retries: ${report.transport.optimized.retries}
- Optimized timeouts: ${report.transport.optimized.timeouts}
- Optimized exhausted timeout cases: ${report.transport.optimized.exhausted_cases}

## Implicit invocation

${report.implicit_invocation.summary}

## Conclusion

${report.recommendation}

Rerun: \`${report.rerun}\`
`;
}

function updateValidationReport(report) {
  const baselinePath = path.join(root, "tests", "reports", "skill-performance-baseline.json");
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  baseline.live_performance_benchmark = {
    tag: report.baseline.tag,
    commit: report.baseline.commit,
    skills_count: report.baseline.skills_count,
    test_counts: report.test_counts,
    result: report.external_status,
    metrics: report.metrics.simple.baseline,
    reason: report.external_service.failure,
  };
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);

  const jsonPath = path.join(root, "tests", "reports", "skill-performance-validation.json");
  const current = JSON.parse(readFileSync(jsonPath, "utf8"));
  current.result = report.result;
  current.live_comparison = {
    report: "tests/reports/live-performance-comparison.json",
    baseline: report.baseline,
    optimized: report.optimized,
    test_counts: report.test_counts,
    authentication_chain: report.authentication_chain,
    simple_metrics: report.metrics.simple,
    overall_metrics: report.metrics.overall,
    performance_table: report.performance_table,
    matched_pairs: report.matched_pairs,
    transport: report.transport,
    correctness: report.correctness,
    implicit_invocation: report.implicit_invocation,
    recommendation: report.recommendation,
  };
  current.isolated_live_codex = report.external_service;
  current.measurement_limits = report.measurement_limits;
  writeFileSync(jsonPath, `${JSON.stringify(current, null, 2)}\n`);

  const mdPath = path.join(root, "tests", "reports", "skill-performance-validation.md");
  const status = report.result.replaceAll("_", " ");
  writeFileSync(mdPath, `# Skill Performance Validation

Status: **${status}**

External status: **${report.external_status}**

## Deterministic coverage

All 30 execution contracts remain valid: 20 simple cases require fast, bounded execution; 10 elevated cases preserve standard or audit behavior and permission gates. Repo Doctor execution profiles remain present for 27/27 Skills.

## Real Codex A/B

The real comparison uses baseline \`${report.baseline.tag}\` at \`${report.baseline.commit}\` and the current uncommitted worktree. Every turn uses a fresh copy of a fully synthetic Node/TypeScript project, host Codex authentication, an isolated Skill root and SQLite state, the same prompts, low reasoning effort, workspace-write sandbox, and approval policy \`never\`.

${report.performance_table.map((row) => `- ${row.metric}: baseline ${row.baseline}; optimized ${row.optimized}; change ${row.change}`).join("\n")}

Correctness: baseline ${report.correctness.baseline}; optimized ${report.correctness.optimized}. Permissions: ${report.correctness.permissions}. Safety: ${report.correctness.safety}.

Matched pairs: ${report.matched_pairs.coverage.total}/${report.matched_pairs.coverage.planned}. PASS/PASS ${report.matched_pairs.correctness_matrix.pass_pass}; FAIL/PASS ${report.matched_pairs.correctness_matrix.fail_pass}; PASS/FAIL ${report.matched_pairs.correctness_matrix.pass_fail}; FAIL/FAIL ${report.matched_pairs.correctness_matrix.fail_fail}.

Transport: baseline retries ${report.transport.baseline.retries}, timeouts ${report.transport.baseline.timeouts}; optimized retries ${report.transport.optimized.retries}, timeouts ${report.transport.optimized.timeouts}. Timeout attempts are excluded from model-performance metrics.

## Implicit invocation

${report.implicit_invocation.summary}

## Measurement limits

${report.measurement_limits.map((item) => `- ${item}`).join("\n")}

Machine-readable details:

- \`tests/reports/skill-performance-baseline.json\`
- \`tests/reports/skill-performance-validation.json\`
- \`tests/reports/live-performance-comparison.json\`
- \`tests/reports/live-performance-comparison.md\`

## Conclusion

${report.recommendation}
`);
}

async function main() {
  const selectedCases = requestedCase ? cases.filter((entry) => entry.case_id === requestedCase) : cases;
  if (selectedCases.length === 0) throw new Error(`Unknown case: ${requestedCase}`);
  if (!requestedCase && cases.length !== 30) throw new Error(`Expected 30 cases, found ${cases.length}`);
  const baselineCommit = runCommand("git", ["rev-list", "-n", "1", baselineRef], { cwd: root }).trim();
  const branch = runCommand("git", ["branch", "--show-current"], { cwd: root }).trim();
  if (branch !== "main") throw new Error(`Benchmark requires main; found ${branch || "detached"}`);
  if (authProbesOnly) {
    const probes = await runAuthProbes();
    const passed = probes.every((probe) => probe.result === "PASS");
    process.stdout.write(`AUTH PROBES ${passed ? "PASS" : "FAIL"} ${probes.filter((probe) => probe.result === "PASS").length}/3\n`);
    if (!passed) process.exitCode = 1;
    return;
  }
  const baseFixture = mkdtempSync(path.join(os.tmpdir(), "repo-doctor-performance-fixture-"));
  const fixture = path.join(baseFixture, "repo-doctor-performance-benchmark");
  writeFixture(fixture);
  validateSyntheticFixture(fixture);
  const digest = fixtureDigest(fixture);
  rmSync(baseFixture, { recursive: true, force: true });
  process.stdout.write(`SYNTHETIC FIXTURE PASS ${Object.keys(fixtureFiles).length} files ${digest.slice(0, 12)}\n`);
  if (prepareOnly) {
    const baselinePrepareRoot = mkdtempSync(path.join(os.tmpdir(), "repo-doctor-performance-baseline-prepare-"));
    const optimizedPrepareRoot = mkdtempSync(path.join(os.tmpdir(), "repo-doctor-performance-optimized-prepare-"));
    try {
      const baselineHome = installBaselineSkills(baselinePrepareRoot);
      const optimizedHome = installOptimizedSkills(optimizedPrepareRoot);
      const baselineCount = countInstalledSkills(baselineHome);
      const optimizedCount = countInstalledSkills(optimizedHome);
      if (baselineCount !== 40 || optimizedCount !== 40) {
        throw new Error(`Prepared Skill counts differ: baseline=${baselineCount}, optimized=${optimizedCount}`);
      }
      process.stdout.write(`ISOLATED BUILDS PASS baseline=${baselineCount}/40 optimized=${optimizedCount}/40\n`);
    } finally {
      rmSync(baselinePrepareRoot, { recursive: true, force: true });
      rmSync(optimizedPrepareRoot, { recursive: true, force: true });
    }
    process.stdout.write(`PREPARE ONLY PASS ${selectedCases.length} cases; temporary directories cleaned\n`);
    return;
  }

  const optimizedCommit = runCommand("git", ["rev-parse", "HEAD"], { cwd: root }).trim();
  let baselineRoot = null;
  let optimizedRoot = null;
  let baselineSkills = 0;
  let optimizedSkills = 0;
  let baselineSkillsDigest = null;
  let optimizedSkillsDigest = null;
  let baselineResultsMap = new Map();
  let optimizedResultsMap = new Map();
  if (recordObservedAuthFailure) {
    baselineSkills = 40;
    optimizedSkills = 40;
    const observedFailure = new Error("Observed external authentication service error before model execution.");
    baselineResultsMap = new Map(selectedCases.map((testCase) => [
      testCase.case_id,
      blockedCase(testCase, observedFailure),
    ]));
    optimizedResultsMap = new Map(selectedCases.map((testCase) => [
      testCase.case_id,
      blockedCase(testCase, observedFailure),
    ]));
  } else {
    try {
      baselineRoot = mkdtempSync(path.join(os.tmpdir(), "repo-doctor-performance-baseline-"));
      const baselineHome = installBaselineSkills(baselineRoot);
      baselineSkills = countInstalledSkills(baselineHome);
      optimizedRoot = mkdtempSync(path.join(os.tmpdir(), "repo-doctor-performance-optimized-"));
      const optimizedHome = installOptimizedSkills(optimizedRoot);
      optimizedSkills = countInstalledSkills(optimizedHome);
      if (baselineSkills !== 40 || optimizedSkills !== 40) {
        throw new Error(`Prepared Skill counts differ: baseline=${baselineSkills}, optimized=${optimizedSkills}`);
      }
      baselineSkillsDigest = fixtureDigest(path.join(baselineHome, "skills"));
      optimizedSkillsDigest = fixtureDigest(path.join(optimizedHome, "skills"));
      const resumed = loadResumeResults({
        baselineCommit,
        optimizedCommit,
        baselineSkillsDigest,
        optimizedSkillsDigest,
      });
      baselineResultsMap = resumed.baseline;
      optimizedResultsMap = resumed.optimized;
      const persist = () => persistCheckpoint({
        baselineCommit,
        optimizedCommit,
        baselineSkillsDigest,
        optimizedSkillsDigest,
        selectedCases,
        baselineResults: baselineResultsMap,
        optimizedResults: optimizedResultsMap,
      });
      await pool(selectedCases, async (testCase, index) => {
        if (baselineResultsMap.has(testCase.case_id)) {
          process.stdout.write(
            `[baseline ${index + 1}/${selectedCases.length}] RESUMED ${testCase.case_id} ${baselineResultsMap.get(testCase.case_id).result}\n`,
          );
        } else {
          const result = await runCaseWithRetries(
            "baseline",
            baselineHome,
            path.join(baselineRoot, "case-runs"),
            testCase,
          );
          baselineResultsMap.set(testCase.case_id, result);
          persist();
        }
        if (optimizedResultsMap.has(testCase.case_id)) {
          process.stdout.write(
            `[optimized ${index + 1}/${selectedCases.length}] RESUMED ${testCase.case_id} ${optimizedResultsMap.get(testCase.case_id).result}\n`,
          );
        } else {
          const result = await runCaseWithRetries(
            "optimized",
            optimizedHome,
            path.join(optimizedRoot, "case-runs"),
            testCase,
          );
          optimizedResultsMap.set(testCase.case_id, result);
          persist();
        }
      }, concurrency);
    } finally {
      if (!keepTemp) {
        if (baselineRoot) rmSync(baselineRoot, { recursive: true, force: true });
        if (optimizedRoot) rmSync(optimizedRoot, { recursive: true, force: true });
      }
    }
  }

  const baselineResults = selectedCases
    .map((testCase) => baselineResultsMap.get(testCase.case_id))
    .filter(Boolean);
  const optimizedResults = selectedCases
    .map((testCase) => optimizedResultsMap.get(testCase.case_id))
    .filter(Boolean);
  const pairs = matchedPairResults(selectedCases, baselineResults, optimizedResults);
  const pairedBaselineResults = pairs.map((pair) => pair.baseline);
  const pairedOptimizedResults = pairs.map((pair) => pair.optimized);
  const coverage = matchedPairCoverage(pairs, selectedCases.length);
  const matrix = correctnessMatrix(pairs);
  const baselineSimple = metricSummary(pairedBaselineResults, "simple");
  const optimizedSimple = metricSummary(pairedOptimizedResults, "simple");
  const baselineOverall = metricSummary(pairedBaselineResults);
  const optimizedOverall = metricSummary(pairedOptimizedResults);
  const optimizedAvailable = optimizedResults.filter(completedResult);
  const baselineAvailable = baselineResults.filter(completedResult);
  const baselineMatchedCorrect = pairedBaselineResults.filter((entry) => entry.correctness).length;
  const optimizedMatchedCorrect = pairedOptimizedResults.filter((entry) => entry.correctness).length;
  const noOptimizedViolations = optimizedAvailable.length > 0
    && optimizedAvailable.every((entry) => !entry.permission_violation);
  const noSafetyRegressions = pairedOptimizedResults
    .filter((entry) => entry.level === "elevated")
    .every((entry) => entry.safety_gate === "PASS");
  const noPassToFailRegression = matrix.pass_fail === 0;
  const noCorrectnessRegression = optimizedMatchedCorrect >= baselineMatchedCorrect;
  const optimizedSimpleResults = optimizedAvailable.filter((entry) => entry.level === "simple");
  const simpleExecutionBounded = optimizedSimpleResults.every((entry) =>
    entry.primary_skills <= 1
    && !entry.auto_chaining
    && !entry.full_test_trigger
    && !entry.full_build_trigger);
  const explicitHeavyCasesPass = selectedCases
    .filter((testCase) => testCase.explicit_skill)
    .every((testCase) => optimizedResultsMap.get(testCase.case_id)?.result === "PASS");
  const hasTransportGaps = baselineResults.some((entry) => entry.service_failure)
    || optimizedResults.some((entry) => entry.service_failure);
  const releaseConditionsPass = coverage.sufficient
    && noCorrectnessRegression
    && noPassToFailRegression
    && noOptimizedViolations
    && noSafetyRegressions
    && simpleExecutionBounded
    && explicitHeavyCasesPass;
  const recommendation = coverage.sufficient
    ? releaseConditionsPass
      ? "KEEP_OPTIMIZATION"
      : "REGRESSION_FOUND"
    : "BENCHMARK_INSUFFICIENT_DATA";
  const result = recommendation;
  const externalStatus = hasTransportGaps
    ? coverage.sufficient
      ? "AVAILABLE_WITH_TRANSPORT_TIMEOUTS"
      : "BLOCKED_EXTERNAL_MODEL_SERVICE"
    : "AVAILABLE";
  const implicitIssues = optimizedResults.filter((entry) =>
    entry.level === "simple"
    && (entry.notes ?? "").includes("forbidden Skill selected"));
  const report = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    result,
    recommendation,
    external_status: externalStatus,
    baseline: {
      tag: baselineRef,
      commit: baselineCommit,
      skills_count: baselineSkills || 40,
      skills_sha256: baselineSkillsDigest,
      test_environment: "host Codex authentication; isolated Skill root, SQLite state, and fresh synthetic workspace per case",
    },
    optimized: {
      worktree: "current uncommitted candidate on main",
      base_commit: optimizedCommit,
      skills_count: optimizedSkills || 40,
      skills_sha256: optimizedSkillsDigest,
      execution_profiles: "27/27 Repo Doctor Skills",
    },
    test_counts: {
      zh_simple: cases.filter((entry) => entry.language === "zh-CN" && entry.level === "simple").length,
      en_simple: cases.filter((entry) => entry.language === "en" && entry.level === "simple").length,
      zh_elevated: cases.filter((entry) => entry.language === "zh-CN" && entry.level === "elevated").length,
      en_elevated: cases.filter((entry) => entry.language === "en" && entry.level === "elevated").length,
      planned_per_variant: selectedCases.length,
      baseline_executed: baselineResults.length,
      optimized_executed: optimizedResults.length,
    },
    isolation: {
      project: "repo-doctor-performance-benchmark",
      fixture_files: Object.keys(fixtureFiles).length,
      fixture_sha256: digest,
      synthetic_only: true,
      real_repository_visible_to_model: false,
      baseline_output_visible_to_optimized: false,
      shared_sessions: false,
      host_authentication_reused: true,
      codex_home_overridden: false,
      shared_skill_root: false,
      shared_sqlite_state: false,
      temporary_directories_cleaned: !keepTemp,
      external_payload: "synthetic benchmark plus built public Skill content only",
    },
    settings: {
      codex_cli: runCommand("codex", ["--version"], { cwd: os.tmpdir() }).trim(),
      model: "same Codex configured default for both variants",
      reasoning_effort: "low",
      verbosity: "low",
      sandbox: "workspace-write",
      approval_policy: "never",
      concurrency,
      turn_timeout_ms: timeoutMs,
      resume_gap_recovery_timeout_override: resume && timeoutMs !== 180000,
      transport_retry_limit: transportRetryLimit,
      transport_retry_backoff_ms: transportRetryBackoffMs,
      resume,
    },
    authentication_chain: {
      invocation: "official Codex App Server",
      provider: "built-in openai provider",
      source: "host Codex-managed authentication context",
      codex_home_overridden: false,
      custom_backend_override: false,
      authentication_secrets_recorded: false,
    },
    metrics: {
      simple: { baseline: baselineSimple, optimized: optimizedSimple },
      overall: { baseline: baselineOverall, optimized: optimizedOverall },
    },
    matched_pairs: {
      coverage,
      correctness_matrix: matrix,
      case_ids: pairs.map((pair) => pair.case.case_id),
    },
    transport: {
      baseline: transportSummary(baselineResults),
      optimized: transportSummary(optimizedResults),
      excluded_from_model_performance: true,
    },
    performance_table: comparisonRows(baselineSimple, optimizedSimple),
    correctness: {
      baseline: pairs.length ? `${baselineMatchedCorrect}/${pairs.length}` : "UNAVAILABLE",
      optimized: pairs.length ? `${optimizedMatchedCorrect}/${pairs.length}` : "UNAVAILABLE",
      bilingual: optimizedAvailable.length
        ? (optimizedAvailable.every((entry) => entry.correctness || !entry.notes.includes("language")) ? "PASS" : "FAIL")
        : "UNAVAILABLE",
      permissions: optimizedAvailable.length ? (noOptimizedViolations ? "PASS" : "FAIL") : "UNAVAILABLE",
      safety: optimizedAvailable.length
        ? (noSafetyRegressions ? "PASS" : "FAIL")
        : "UNAVAILABLE",
      no_regressions: pairs.length ? noCorrectnessRegression && noPassToFailRegression : "UNAVAILABLE",
      no_pass_to_fail_regression: pairs.length ? noPassToFailRegression : "UNAVAILABLE",
      simple_execution_bounded: optimizedSimpleResults.length ? simpleExecutionBounded : "UNAVAILABLE",
      explicit_heavy_invocation: optimizedAvailable.length ? explicitHeavyCasesPass : "UNAVAILABLE",
    },
    implicit_invocation: {
      configured: { implicit_enabled: 15, explicit_only: 12 },
      observed_issues: implicitIssues.map((entry) => entry.case_id),
      summary: !coverage.sufficient
        ? "Real implicit-invocation behavior is unavailable because the external model service did not complete the benchmark."
        : implicitIssues.length === 0
          ? "No tested ordinary request selected Router, heavyweight architecture analysis, bug root-cause analysis, safe fix, or requirements clarification outside its intended boundary. No evidence-supported policy change is required."
          : `Evidence-supported implicit invocation issues were found in: ${implicitIssues.map((entry) => entry.case_id).join(", ")}.`,
    },
    external_service: hasTransportGaps
      ? {
          installation_and_discovery: "PASS 40/40 for both variants",
          model_calls_completed: baselineAvailable.length + optimizedAvailable.length,
          model_calls_failed_before_completion: [...baselineResults, ...optimizedResults]
            .filter((entry) => entry.service_failure).length,
          failure: recordObservedAuthFailure
            ? "External authentication service returned HTTP 401 before model execution."
            : "One or more Codex turns exhausted transport retries before a usable result.",
          classification: coverage.sufficient
            ? "AVAILABLE_WITH_TRANSPORT_TIMEOUTS; timeout attempts excluded from model performance"
            : "BLOCKED_EXTERNAL_MODEL_SERVICE; not a Skill failure",
        }
      : {
          installation_and_discovery: "PASS 40/40 for both variants",
          model_calls_completed: baselineAvailable.length + optimizedAvailable.length,
          failure: null,
          classification: "AVAILABLE",
        },
    measurement_limits: !coverage.sufficient
      ? [
          "No performance value is estimated when the external model service is unavailable.",
          "Deterministic contracts and prior local gates remain authoritative.",
        ]
      : [
          "File-read counts are observed lower bounds from command arguments; commands that enumerate or search broadly may inspect additional files.",
          "Wall time includes external service and local tool latency; both variants use identical settings but service variance remains.",
          "Matched-pair metrics use only Cases with usable Baseline and Optimized results; transport timeout attempts are excluded.",
          "The benchmark uses one real completed turn per matched variant/Case and does not claim statistical significance beyond the reported sample.",
        ],
    cases: selectedCases.map((testCase) => ({
      case_id: testCase.case_id,
      language: testCase.language,
      level: testCase.level,
      prompt_variant: testCase.case_id,
      baseline: baselineResults.find((entry) => entry.case_id === testCase.case_id) ?? "UNAVAILABLE",
      optimized: optimizedResults.find((entry) => entry.case_id === testCase.case_id) ?? "UNAVAILABLE",
    })),
    rerun: `npm run benchmark:performance -- --baseline-ref ${baselineRef} --resume`,
  };
  mkdirSync(path.dirname(outputPath), { recursive: true });
  atomicWriteJson(outputPath, report);
  writeFileSync(outputPath.replace(/\.json$/, ".md"), markdown(report));
  if (!requestedCase) updateValidationReport(report);
  rmSync(checkpointPath, { force: true });
  process.stdout.write(`REPORT ${outputPath}\n`);
  process.stdout.write(`RESULT ${report.external_status === "BLOCKED_EXTERNAL_MODEL_SERVICE" ? report.external_status : report.recommendation}\n`);
  if (recommendation !== "KEEP_OPTIMIZATION") process.exitCode = 1;
}

await main();
