import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { discoverActivePackSkills } from "./sync-pack-plugin.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const root = process.cwd();
const packRoot = path.join(root, "packs", "engineering", "repo-doctor");
const casesPath = path.join(root, "tests", "performance-contracts", "cases.json");
const cases = JSON.parse(readFileSync(casesPath, "utf8"));
const slugs = discoverActivePackSkills(packRoot);
const active = new Set(slugs);
const metadata = new Map(slugs.map((slug) => [
  slug,
  parseYamlSubset(readFileSync(path.join(packRoot, "skills", slug, "skill.yaml"), "utf8")),
]));

assert.ok(Array.isArray(cases), "performance contracts must be an array");
assert.equal(new Set(cases.map((entry) => entry.case_id)).size, cases.length, "case_id values must be unique");

const simple = cases.filter((entry) => entry.risk_tier === "simple");
const elevated = cases.filter((entry) => entry.risk_tier === "elevated");
assert.ok(simple.length >= 20, "at least 20 simple performance contracts are required");
assert.ok(elevated.length >= 10, "at least 10 elevated performance contracts are required");

for (const entry of cases) {
  assert.ok(["simple", "elevated"].includes(entry.risk_tier), `${entry.case_id}: invalid risk_tier`);
  assert.ok(["fast", "standard", "audit"].includes(entry.expected_mode), `${entry.case_id}: invalid expected_mode`);
  assert.equal(entry.max_primary_skills, 1, `${entry.case_id}: one primary Skill is required`);
  assert.ok(entry.expected_primary_skill === null || active.has(entry.expected_primary_skill)
    || ["report-writer", "excel-data-quality-check-basic"].includes(entry.expected_primary_skill),
  `${entry.case_id}: expected_primary_skill must be active, an approved adjacent Skill, or null`);
  assert.equal(typeof entry.input_en, "string", `${entry.case_id}: input_en is required`);
  assert.equal(typeof entry.input_zh_CN, "string", `${entry.case_id}: input_zh_CN is required`);
  assert.equal(entry.automatic_skill_chaining_allowed, false, `${entry.case_id}: automatic chaining is forbidden`);
  assert.equal(entry.permission_gates_preserved, true, `${entry.case_id}: permission gates must be preserved`);

  if (entry.risk_tier === "simple") {
    assert.equal(entry.expected_mode, "fast", `${entry.case_id}: simple requests must use fast`);
    assert.ok(entry.recommended_max_files_read <= 3, `${entry.case_id}: fast file budget exceeds 3`);
    assert.ok(entry.recommended_max_commands <= 3, `${entry.case_id}: fast command budget exceeds 3`);
    assert.equal(entry.full_test_suite_allowed, false, `${entry.case_id}: fast cannot run the full test suite`);
    assert.equal(entry.full_build_allowed, false, `${entry.case_id}: fast cannot run the full build`);
    assert.equal(entry.persistent_report_allowed, false, `${entry.case_id}: fast cannot create a persistent report`);
  } else {
    assert.ok(["standard", "audit"].includes(entry.expected_mode), `${entry.case_id}: elevated work must escalate`);
  }
}

for (const [slug, skill] of metadata) {
  assert.ok(skill.execution, `${slug}: execution metadata is required`);
  assert.ok(["fast", "standard"].includes(skill.execution.default_mode), `${slug}: invalid default mode`);
  assert.equal(typeof skill.execution.allow_implicit_invocation, "boolean", `${slug}: implicit policy is required`);
  assert.equal(skill.permissions.destructive_actions_allowed, false, `${slug}: execution tiers cannot weaken destructive-action gates`);
}

const explicitOnly = [...metadata]
  .filter(([, skill]) => ["heavyweight", "explicit-only-candidate"].includes(skill.execution.classification))
  .map(([slug, skill]) => {
    assert.equal(skill.execution.allow_implicit_invocation, false, `${slug}: heavyweight policy must be explicit-only`);
    return slug;
  });
assert.ok(explicitOnly.length >= 8, "expected a meaningful explicit-only heavyweight set");

const router = metadata.get("repo-doctor-router");
assert.equal(router.execution.allow_implicit_invocation, false, "Router must not add an implicit intermediate step");

for (const locale of ["en", "zh-CN"]) {
  const reference = path.join(packRoot, "references", `execution-modes.${locale}.md`);
  assert.ok(existsSync(reference), `missing ${locale} execution-mode reference`);
  const content = readFileSync(reference, "utf8");
  for (const required of ["fast", "standard", "audit", "3"]) {
    assert.ok(content.includes(required), `${path.relative(root, reference)}: missing ${required}`);
  }
  assert.ok(
    locale === "en"
      ? content.includes("One primary Skill") && content.includes("Simple Request Bypass")
      : content.includes("单一主 Skill") && content.includes("简单请求快速通道"),
    `${path.relative(root, reference)}: missing bypass or one-Skill contract`,
  );
}

console.log(
  `Performance contracts passed for ${simple.length} simple and ${elevated.length} elevated scenarios across ${slugs.length} Repo Doctor Skills.`,
);
