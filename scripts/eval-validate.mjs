import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateSchema } from "./validate-yaml-schemas.mjs";

export function loadSuite(root = process.cwd()) {
  const filename = path.join(root, "evals", "live-model", "cases.json");
  const raw = readFileSync(filename, "utf8");
  const suite = JSON.parse(raw);
  const errors = [];
  if (suite.version !== 1 || suite.mode !== "offline_contract_only" || !Array.isArray(suite.cases)) errors.push("invalid case suite header");
  const ids = new Set();
  for (const item of suite.cases ?? []) {
    if (!item.id || ids.has(item.id)) errors.push(`duplicate or missing case id: ${item.id}`);
    ids.add(item.id);
    for (const field of ["pair_id", "locale", "prompt", "expected_workflow_id", "expected_skill", "expected_permission", "expected_stop_condition"]) if (!item[field]) errors.push(`${item.id}: missing ${field}`);
    for (const field of ["acceptable_alternatives", "forbidden_skills", "expected_workflow"]) if (!Array.isArray(item[field])) errors.push(`${item.id}: ${field} must be an array`);
  }
  return { suite, errors, digest: createHash("sha256").update(raw).digest("hex") };
}

export function validateObservedResult(result, root = process.cwd()) {
  const { suite, errors, digest } = loadSuite(root);
  const schema = JSON.parse(readFileSync(path.join(root, "schemas", "live-eval.schema.json"), "utf8"));
  errors.push(...validateSchema(result, schema));
  if (result.suite_digest !== digest) errors.push("result suite_digest does not match current cases");
  const byId = new Map(suite.cases.map((item) => [item.id, item]));
  const seen = new Set();
  for (const record of result.records ?? []) {
    const expected = byId.get(record.case_id);
    if (!expected) errors.push(`unknown case_id: ${record.case_id}`);
    if (seen.has(record.case_id)) errors.push(`duplicate result case_id: ${record.case_id}`);
    seen.add(record.case_id);
    if (expected) {
      if (record.locale !== expected.locale) errors.push(`${record.case_id}: locale differs from suite`);
      if (record.user_request !== expected.prompt) errors.push(`${record.case_id}: user_request differs from suite`);
      for (const field of ["expected_skill", "acceptable_alternatives", "forbidden_skills", "expected_workflow", "expected_permission", "expected_stop_condition"]) {
        if (JSON.stringify(record[field]) !== JSON.stringify(expected[field])) errors.push(`${record.case_id}: ${field} differs from suite`);
      }
    }
  }
  return [...new Set(errors)].sort();
}

function main() {
  const index = process.argv.indexOf("--input");
  if (index < 0) {
    const { suite, errors } = loadSuite();
    if (errors.length) {
      console.error(errors.join("\n"));
      process.exit(1);
    }
    console.log(`Live-model offline contract validation passed for ${suite.cases.length} cases; no model was called and accuracy remains UNKNOWN.`);
    return;
  }
  const filename = process.argv[index + 1];
  if (!filename) throw new Error("--input requires a path");
  const result = JSON.parse(readFileSync(path.resolve(filename), "utf8"));
  const errors = validateObservedResult(result);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log(`Observed live-model result validated for ${result.records.length} record(s).`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
