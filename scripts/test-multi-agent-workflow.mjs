import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { walkFiles } from "./deterministic-files.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";
import { recommendedSkills } from "./install.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => readFileSync(path.join(root, relative), "utf8");
const baseline = JSON.parse(read("tests/skill-quality/single-agent-compatibility.json"));

// Preserve the baseline outside explicitly pinned, additive shared-reference sections.
// Never refresh the historical hashes to conceal unrelated behavior changes.
function baselineBytes(filename) {
  const bytes = readFileSync(path.join(root, filename));
  const addition = baseline.reference_additions?.[path.basename(filename)];
  if (!addition || !filename.includes('/references/')) return bytes;
  const content = bytes.toString('utf8');
  const start = content.indexOf(addition.heading + '\n');
  assert.ok(start >= 0, `${filename}: missing pinned convention section`);
  const end = content.indexOf('\n## ', start + addition.heading.length);
  assert.ok(end > start, `${filename}: missing following section`);
  const section = content.slice(start, end + 1);
  assert.equal(createHash('sha256').update(section).digest('hex'), addition.sha256,
    `${filename}: convention addition changed; review it explicitly`);
  return Buffer.from(content.slice(0, start) + content.slice(end + 1));
}

for (const [group, expected] of Object.entries(baseline.trees)) {
  const absolute = path.join(root, group);
  const entries = statSync(absolute).isFile() ? [absolute] : walkFiles(absolute);
  const files = entries.map(file => path.relative(root, file).split(path.sep).join("/")).sort();
  const hash = createHash("sha256");
  for (const filename of files) {
    const digest = createHash("sha256").update(baselineBytes(filename)).digest("hex");
    hash.update(JSON.stringify([filename, digest]) + "\n");
  }
  assert.equal(files.length, expected.file_count, `${group}: existing file inventory changed`);
  assert.equal(hash.digest("hex"), expected.sha256, `${group}: single-agent compatibility baseline changed`);
}

assert.deepEqual(recommendedSkills, [
  "repo-doctor-router", "requirements-clarification", "bug-root-cause-analysis",
  "safe-fix-implementation", "safe-test-implementation", "safe-code-review", "decision-prototype",
]);

const skill = "packs/engineering/repo-doctor/skills/multi-agent-workflow";
const metadata = parseYamlSubset(read(`${skill}/skill.yaml`));
assert.equal(metadata.execution.allow_implicit_invocation, true);
assert.equal(metadata.permissions.access_network, false);
assert.equal(metadata.permissions.destructive_actions_allowed, false);

const cases = JSON.parse(read("tests/skill-quality/activation-cases.json"))
  .filter(item => item.subject_skill === "multi-agent-workflow");
for (const locale of ["en", "zh-CN"]) {
  assert.ok(cases.some(item => item.locale === locale && item.kind === "positive"
    && item.expected_skill === "multi-agent-workflow"));
  assert.ok(cases.some(item => item.locale === locale && ["adjacent", "negative"].includes(item.kind)
    && item.must_not_trigger.includes("multi-agent-workflow")));
}

for (const folder of ["skills", "plugins/repo-doctor/skills"]) {
  const rendered = read(`${folder}/multi-agent-workflow/SKILL.md`);
  assert.ok(rendered.includes("selected_mode"));
  assert.ok(rendered.includes("single") && rendered.includes("multi"));
  for (const locale of ["en", "zh-CN"]) {
    const protocol = read(`${folder}/multi-agent-workflow/references/worker-protocol.${locale}.md`);
    assert.ok(protocol.includes("task_id"));
  }
}

console.log(`Multi-agent integration contracts passed: ${Object.keys(baseline.trees).length} baseline groups preserved outside pinned convention additions, Recommended 7 unchanged, additive distribution and bilingual activation boundaries.`);
