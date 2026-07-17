import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseYamlSubset, validateSchema } from "./validate-yaml-schemas.mjs";
import { sortedDirectoryEntries } from "./deterministic-files.mjs";

const root = process.cwd();
const schema = JSON.parse(readFileSync(path.join(root, "schemas", "golden-workflow.schema.json"), "utf8"));
const registry = parseYamlSubset(readFileSync(path.join(root, "packs", "engineering", "repo-doctor", "workflows.yaml"), "utf8"));
const directory = path.join(root, "tests", "golden-workflows");
const files = sortedDirectoryEntries(directory).filter((entry) => entry.isFile() && entry.name.endsWith(".json"));
assert.equal(files.length, 3, "exactly three Golden Workflow fixtures are required");

for (const entry of files) {
  const fixture = JSON.parse(readFileSync(path.join(directory, entry.name), "utf8"));
  assert.deepEqual(validateSchema(fixture, schema), [], entry.name);
  const workflow = registry.workflows[fixture.workflow_id];
  assert.ok(workflow, `${entry.name}: unknown workflow`);
  const skillStages = workflow.stages.filter((stage) => stage.type === "skill").map((stage) => stage.skill);
  let cursor = -1;
  for (const skill of fixture.expected.ordered_skills) {
    const index = skillStages.indexOf(skill, cursor + 1);
    assert.ok(index > cursor, `${entry.name}: expected ordered Skill ${skill}`);
    cursor = index;
  }
  const gates = new Set(workflow.stages.filter((stage) => stage.type === "gate").map((stage) => stage.id));
  for (const gate of fixture.expected.required_gates) assert.ok(gates.has(gate), `${entry.name}: missing gate ${gate}`);
  const terminals = workflow.stages.filter((stage) => stage.next.length === 0).map((stage) => stage.skill);
  assert.ok(terminals.includes(fixture.expected.terminal_skill), `${entry.name}: terminal Skill mismatch`);
  for (const skip of fixture.expected.forbidden_skips) assert.ok(workflow.forbidden_transitions.includes(skip), `${entry.name}: missing forbidden transition ${skip}`);
  assert.ok(fixture.expected.contract_assertions.length >= 7, `${entry.name}: expected end-to-end contract assertions`);
  assert.ok(fixture.prompts.en.length > 20 && fixture.prompts["zh-CN"].length > 10, `${entry.name}: bilingual prompts required`);
}
console.log("Golden Workflow tests passed for feature delivery, bug repair, and session handoff.");
