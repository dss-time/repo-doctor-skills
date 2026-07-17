import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  discoverSkillInventory,
  validateRegistryDocument,
  validateWorkflowRegistry,
} from "./validate-workflows.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const root = process.cwd();
const schema = JSON.parse(readFileSync(path.join(root, "schemas", "workflow.schema.json"), "utf8"));
const registry = parseYamlSubset(
  readFileSync(path.join(root, "packs", "engineering", "repo-doctor", "workflows.yaml"), "utf8"),
);
const inventory = discoverSkillInventory(root);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectFailure(label, mutate, pattern, inventoryOverride = inventory) {
  const candidate = clone(registry);
  mutate(candidate);
  const errors = validateRegistryDocument(candidate, {
    schema,
    skillInventory: inventoryOverride,
  });
  assert.ok(errors.some((error) => pattern.test(error)), `${label}: expected ${pattern}, received ${errors.join("; ")}`);
}

const canonical = validateWorkflowRegistry({ root });
assert.deepEqual(canonical.errors, [], canonical.errors.join("\n"));

expectFailure(
  "unknown Skill",
  (candidate) => {
    candidate.workflows["review-only"].stages[0].skill = "missing-review-skill";
  },
  /Skill does not exist/,
);

const retiredInventory = new Map(inventory);
retiredInventory.set("retired-fixture", {
  status: "retired",
  permissions: { write_files: false },
});
expectFailure(
  "retired Skill",
  (candidate) => {
    candidate.workflows["review-only"].stages[0].skill = "retired-fixture";
  },
  /Skill is not active \(retired\)/,
  retiredInventory,
);

expectFailure(
  "cycle",
  (candidate) => {
    candidate.workflows["review-only"].stages[2].next = ["review"];
    candidate.workflows["review-only"].stages[0].prerequisites = ["release"];
  },
  /cannot terminate|non-terminating cycle/,
);

expectFailure(
  "missing write gate",
  (candidate) => {
    candidate.workflows["post-fix-regression-test"].stages[2].approval_gate = "none";
  },
  /lacks a valid explicit approval gate/,
);

expectFailure(
  "permission conflict",
  (candidate) => {
    candidate.workflows["review-only"].stages[0].permission = "write_scoped";
    candidate.workflows["review-only"].stages[0].approval_gate = "none";
  },
  /write_scoped conflicts with read-only Skill metadata/,
);

expectFailure(
  "no terminal",
  (candidate) => {
    const workflow = candidate.workflows["ci-diagnosis"];
    workflow.stages[2].next = ["route"];
  },
  /no terminal stage|cannot terminate/,
);

const workflowIds = new Set(Object.keys(registry.workflows));
const documentedEn = new Set(workflowIds);
const documentedZh = new Set(workflowIds);
documentedZh.delete("feature-delivery");
const driftErrors = validateRegistryDocument(registry, {
  schema,
  skillInventory: inventory,
  documentedEn,
  documentedZh,
});
assert.ok(driftErrors.some((error) => /Chinese workflow documentation missing feature-delivery/.test(error)));

console.log("Workflow registry mutation tests passed.");
