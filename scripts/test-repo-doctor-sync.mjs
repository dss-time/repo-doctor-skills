import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { compareNames, sortedDirectoryEntries } from "./deterministic-files.mjs";
import { discoverActivePackSkills } from "./sync-pack-plugin.mjs";
import { syncRepoDoctorPlugin } from "./sync-repo-doctor-plugin.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const root = process.cwd();
const canonicalPack = path.join(root, "packs", "engineering", "repo-doctor");
const checker = path.join(root, "scripts", "check-skill-quality.mjs");
const rcaSlug = "bug-root-cause-analysis";
const originalSkills = [
  "repo-onboarding",
  "project-health-check",
  "safe-code-review",
  "change-impact-analysis",
  "safe-fix-implementation",
];
const expectedDisplayNames = {
  "repo-onboarding": "Repo Onboarding（理解新项目）",
  "project-health-check": "Project Health Check（项目健康检查）",
  "safe-code-review": "Safe Code Review（安全审查代码）",
  "change-impact-analysis": "Change Impact Analysis（改代码看影响）",
  "safe-fix-implementation": "Safe Fix Implementation（只修一个问题）",
};
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function sortedDirectoryNames(directory) {
  return sortedDirectoryEntries(directory)
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(compareNames);
}

function snapshotTree(directory) {
  const entries = [];
  function visit(current, relativeRoot = "") {
    for (const entry of sortedDirectoryEntries(current)) {
      const relativePath = path.join(relativeRoot, entry.name).split(path.sep).join("/");
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        entries.push(`directory:${relativePath}`);
        visit(absolutePath, relativePath);
      } else {
        const digest = createHash("sha256").update(readFileSync(absolutePath)).digest("hex");
        entries.push(`file:${relativePath}:${digest}`);
      }
    }
  }
  visit(directory);
  return createHash("sha256").update(entries.join("\n")).digest("hex");
}

function runChecker(fixtureRoot) {
  return spawnSync(process.execPath, [checker, "--root", fixtureRoot], {
    cwd: root,
    encoding: "utf8",
  });
}

function runRcaContractMutation({ fixtureRoot, file, search, replacement, expectedError }) {
  const original = readFileSync(file, "utf8");
  if (!original.includes(search)) {
    failures.push(`RCA contract test setup is missing expected fragment: ${search}`);
    return;
  }
  writeFileSync(file, original.replace(search, replacement));
  syncRepoDoctorPlugin({ root: fixtureRoot, log: false });
  const result = runChecker(fixtureRoot);
  expect(result.status === 1, `RCA contract mutation should fail quality checks: ${search}`);
  expect(result.stderr.includes(expectedError), `RCA contract failure should report: ${expectedError}`);
  writeFileSync(file, original);
  syncRepoDoctorPlugin({ root: fixtureRoot, log: false });
}

const canonicalSkills = discoverActivePackSkills(canonicalPack);
expect(canonicalSkills.length === 25, `Repo Doctor pack should expose 25 active skills, received ${canonicalSkills.length}`);
for (const slug of originalSkills) expect(canonicalSkills.includes(slug), `Repo Doctor pack must include original skill ${slug}`);
const canonicalRca = parseYamlSubset(readFileSync(path.join(canonicalPack, "skills", rcaSlug, "skill.yaml"), "utf8"));
expect(canonicalRca.tool_requirements?.filesystem === "read", "RCA must keep filesystem access read-only");
expect(canonicalRca.tool_requirements?.shell === "optional", "RCA must declare optional shell capability");
expect(canonicalRca.permissions?.write_files === false, "RCA must not allow file writes");
expect(canonicalRca.permissions?.run_shell_commands === true, "RCA must allow safe diagnostic shell commands");
expect(canonicalRca.permissions?.access_network === false, "RCA must not allow network access");
expect(canonicalRca.permissions?.destructive_actions_allowed === false, "RCA must not allow destructive actions");
expect(canonicalRca.risk_level?.default === "tool_execution", "RCA shell execution must use tool_execution risk");

const tempRoot = mkdtempSync(path.join(tmpdir(), "repo-doctor-sync-test-"));
try {
  const fixturePack = path.join(tempRoot, "packs", "engineering", "repo-doctor");
  mkdirSync(path.dirname(fixturePack), { recursive: true });
  cpSync(canonicalPack, fixturePack, { recursive: true });

  const firstOrder = syncRepoDoctorPlugin({ root: tempRoot, log: false });
  const pluginSkills = path.join(tempRoot, "plugins", "repo-doctor", "skills");
  expect(JSON.stringify(firstOrder) === JSON.stringify(canonicalSkills), "sync order must match pack.yaml order");
  expect(
    JSON.stringify(sortedDirectoryNames(pluginSkills)) === JSON.stringify([...canonicalSkills].sort(compareNames)),
    "generated plugin must contain exactly the 25 canonical Repo Doctor skills",
  );

  for (const slug of originalSkills) {
    const metadata = parseYamlSubset(readFileSync(path.join(fixturePack, "skills", slug, "skill.yaml"), "utf8"));
    const pluginSkill = readFileSync(path.join(pluginSkills, slug, "SKILL.md"), "utf8");
    const pluginUi = readFileSync(path.join(pluginSkills, slug, "agents", "openai.yaml"), "utf8");
    expect(pluginSkill.includes(`name: ${slug}`), `${slug} plugin name must come from canonical slug`);
    expect(pluginSkill.includes(metadata.description.en), `${slug} plugin description must include canonical English text`);
    expect(pluginSkill.includes(metadata.description["zh-CN"]), `${slug} plugin description must include canonical Chinese text`);
    expect(pluginUi.includes(expectedDisplayNames[slug]), `${slug} must preserve its bilingual UI display name`);
  }
  const rcaPluginSkill = readFileSync(path.join(pluginSkills, rcaSlug, "SKILL.md"), "utf8");
  expect(rcaPluginSkill.includes("## Safe Diagnostic Execution"), "RCA plugin must include the English shell safety contract");
  expect(rcaPluginSkill.includes("## 安全诊断执行"), "RCA plugin must include the Chinese shell safety contract");
  expect(
    rcaPluginSkill.includes("`Observed` / `Reproduced` / `Inferred` / `Unverified` / `Blocked`"),
    "RCA plugin must include evidence status labels",
  );

  const firstSnapshot = snapshotTree(path.join(tempRoot, "plugins", "repo-doctor"));
  syncRepoDoctorPlugin({ root: tempRoot, log: false });
  expect(
    snapshotTree(path.join(tempRoot, "plugins", "repo-doctor")) === firstSnapshot,
    "a second Repo Doctor sync must be byte-for-byte idempotent",
  );

  const extraSkill = path.join(pluginSkills, "not-in-canonical");
  mkdirSync(extraSkill, { recursive: true });
  writeFileSync(path.join(extraSkill, "sentinel.txt"), "stale plugin skill\n");
  syncRepoDoctorPlugin({ root: tempRoot, log: false });
  expect(!existsSync(extraSkill), "sync must prune plugin skills not declared by canonical pack.yaml");
  expect(
    snapshotTree(path.join(tempRoot, "plugins", "repo-doctor")) === firstSnapshot,
    "pruning an undeclared plugin skill must restore the deterministic tree",
  );

  const valid = runChecker(tempRoot);
  expect(valid.status === 0, `freshly synchronized fixture should pass quality checks: ${valid.stderr}`);

  const rcaRoot = path.join(fixturePack, "skills", rcaSlug);
  const rcaYaml = path.join(rcaRoot, "skill.yaml");
  const rcaInstructionsEn = path.join(rcaRoot, "instructions.en.md");
  const rcaInstructionsZh = path.join(rcaRoot, "instructions.zh-CN.md");
  const rcaOutputEn = path.join(rcaRoot, "output.en.md");
  const originalRcaYaml = readFileSync(rcaYaml, "utf8");
  writeFileSync(
    rcaYaml,
    originalRcaYaml.replace("risk_level:\n  default: tool_execution", "risk_level: { default: tool_execution }"),
  );
  syncRepoDoctorPlugin({ root: tempRoot, log: false });
  const inlineRcaRisk = runChecker(tempRoot);
  expect(inlineRcaRisk.status === 0, `RCA inline risk mapping should preserve the valid contract: ${inlineRcaRisk.stderr}`);
  writeFileSync(rcaYaml, originalRcaYaml);
  syncRepoDoctorPlugin({ root: tempRoot, log: false });
  runRcaContractMutation({
    fixtureRoot: tempRoot,
    file: rcaYaml,
    search: "run_shell_commands: true",
    replacement: "run_shell_commands: false",
    expectedError: "RCA contract requires permissions.run_shell_commands: true",
  });
  runRcaContractMutation({
    fixtureRoot: tempRoot,
    file: rcaYaml,
    search: "write_files: false",
    replacement: "write_files: true",
    expectedError: "RCA contract requires permissions.write_files: false",
  });
  runRcaContractMutation({
    fixtureRoot: tempRoot,
    file: rcaYaml,
    search: "destructive_actions_allowed: false",
    replacement: "destructive_actions_allowed: true",
    expectedError: "RCA contract requires permissions.destructive_actions_allowed: false",
  });
  runRcaContractMutation({
    fixtureRoot: tempRoot,
    file: rcaYaml,
    search: "default: tool_execution",
    replacement: "default: read_only",
    expectedError: "RCA contract requires risk_level.default: tool_execution",
  });
  runRcaContractMutation({
    fixtureRoot: tempRoot,
    file: rcaInstructionsEn,
    search: "### Prohibited actions",
    replacement: "### Restricted actions",
    expectedError: "RCA contract missing English safety fragment: ### Prohibited actions",
  });
  runRcaContractMutation({
    fixtureRoot: tempRoot,
    file: rcaInstructionsZh,
    search: "### 禁止的操作",
    replacement: "### 受限操作",
    expectedError: "RCA contract missing Chinese safety fragment: ### 禁止的操作",
  });
  runRcaContractMutation({
    fixtureRoot: tempRoot,
    file: rcaOutputEn,
    search: "Unverified and blocked items",
    replacement: "Remaining items",
    expectedError: "RCA contract missing English output fragment: Unverified and blocked items",
  });
  expect(
    snapshotTree(path.join(tempRoot, "plugins", "repo-doctor")) === firstSnapshot,
    "restoring RCA contract mutations must restore the deterministic plugin tree",
  );

  const originalSkillPath = path.join(pluginSkills, "repo-onboarding", "SKILL.md");
  writeFileSync(originalSkillPath, `${readFileSync(originalSkillPath, "utf8")}\nmanual drift\n`);
  const contentDrift = runChecker(tempRoot);
  expect(contentDrift.status === 1, "manual original-Skill content drift must fail quality checks");
  expect(contentDrift.stderr.includes("canonical/plugin drift"), "content drift failure must identify canonical/plugin drift");
  syncRepoDoctorPlugin({ root: tempRoot, log: false });

  const resourcePath = path.join(pluginSkills, "architecture-decision-record", "assets", "adr-template.md");
  writeFileSync(resourcePath, `${readFileSync(resourcePath, "utf8")}\nresource drift\n`);
  const resourceDrift = runChecker(tempRoot);
  expect(resourceDrift.status === 1, "plugin resource drift must fail quality checks");
  syncRepoDoctorPlugin({ root: tempRoot, log: false });

  mkdirSync(extraSkill, { recursive: true });
  const extraDrift = runChecker(tempRoot);
  expect(extraDrift.status === 1, "an undeclared plugin Skill directory must fail quality checks");
  syncRepoDoctorPlugin({ root: tempRoot, log: false });

  const restored = runChecker(tempRoot);
  expect(restored.status === 0, `resynchronization should restore a clean fixture: ${restored.stderr}`);
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error("Repo Doctor sync tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Repo Doctor sync tests passed for 25 skills, RCA permission/safety and equivalent-risk contracts, original-Skill coverage, drift detection, pruning, and idempotence.");
