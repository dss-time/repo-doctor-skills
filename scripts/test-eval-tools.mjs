import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadSuite, validateObservedResult } from "./eval-validate.mjs";

const root = process.cwd();
const prepared = spawnSync(process.execPath, ["scripts/eval-prepare.mjs"], { cwd: root, encoding: "utf8" });
assert.equal(prepared.status, 0);
const payload = JSON.parse(prepared.stdout);
assert.equal(payload.network_called, false);
assert.equal(payload.api_keys_read, false);
assert.equal(payload.live_model_status, "UNKNOWN");
const { suite, errors, digest } = loadSuite(root);
assert.deepEqual(errors, []);
const item = suite.cases[0];
const record = {
  case_id: item.id,
  locale: item.locale,
  platform: "codex",
  model: "manual-fixture",
  model_version: "fixture",
  repository_commit: "fixture",
  skill_pack_version: "fixture",
  user_request: item.prompt,
  expected_skill: item.expected_skill,
  acceptable_alternatives: item.acceptable_alternatives,
  forbidden_skills: item.forbidden_skills,
  expected_workflow: item.expected_workflow,
  expected_permission: item.expected_permission,
  expected_stop_condition: item.expected_stop_condition,
  actual_skill: item.expected_skill,
  actual_workflow: item.expected_workflow,
  actual_stop_condition: item.expected_stop_condition,
  files_modified: [],
  commands_executed: [],
  permission_violation: false,
  forbidden_action: false,
  pass: true,
  evaluator: "deterministic test fixture",
  notes: "Not a real model run.",
  timestamp: "2026-07-17T00:00:00Z",
  handoff_recovery_success: false
};
const result = { version: 1, suite_digest: digest, run_status: "partial", records: [record] };
assert.deepEqual(validateObservedResult(result, root), []);
const bad = structuredClone(result);
bad.records[0].case_id = "unknown";
assert.ok(validateObservedResult(bad, root).some((error) => error.includes("unknown case_id")));
const temp = mkdtempSync(path.join(tmpdir(), "live-eval-test-"));
try {
  const filename = path.join(temp, "result.json");
  writeFileSync(filename, JSON.stringify(result));
  const report = spawnSync(process.execPath, ["scripts/eval-report.mjs", "--input", filename], { cwd: root, encoding: "utf8" });
  assert.equal(report.status, 0, report.stderr);
  const metrics = JSON.parse(report.stdout).metrics;
  assert.equal(metrics.top_1_routing_accuracy, 1);
  assert.equal(metrics.permission_violation_rate, 0);
  assert.equal(metrics.workflow_stage_completeness_rate, 1);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log("Offline live-model evaluation tools passed without network, API keys, uploads, or fabricated model results.");
