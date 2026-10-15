import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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

  // Reusing compact evidence must retain the original response digest and case links.
  mkdirSync(path.join(temp, "skills"));
  const savedArgv = [...process.argv];
  try {
    process.argv.push("--skill-home", temp);
    const { compactEvidenceReport } = await import("./live-codex-validation.mjs");
    const output = { answer: "Synthetic fixture answer", handoff: "none" };
    const evidence = {
      cases: [{ case_id: "fixture", output, evaluation_metadata: { observed_model: "fixture", token_usage: { inputTokens: 100, outputTokens: 10 } } }],
      advanced: {
        workflow_runs: [{ workflow_id: "fixture", steps: [{ case_id: "fixture" }] }],
        mode_cases: [{ case_id: "fixture-mode" }],
        permission_cases: [{ case_id: "fixture-permission" }],
      },
    };
    const once = compactEvidenceReport(evidence);
    const twice = compactEvidenceReport(once);
    assert.equal(twice.cases[0].output_evidence.sha256, createHash("sha256").update(JSON.stringify(output)).digest("hex"));
    assert.deepEqual(twice, once, "recompaction must preserve digests and all case links");
    assert.deepEqual(once.cases[0].evaluation_metadata, evidence.cases[0].evaluation_metadata, "model and token evidence must survive compaction");
  } finally {
    process.argv = savedArgv;
  }
  // Resume refusal must happen before launching a model or touching authentication.
  const resume = path.join(temp, "resume.json");
  const projectVersion = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
  writeFileSync(resume, JSON.stringify({ project_version: projectVersion, requested_model: "different-model", cases: [] }));
  for (const [args, message] of [
    [[], "Core resume requires an explicit model"],
    [["--model", "fixture-model"], "Core resume requires a complete same-version, same-model case inventory"],
  ]) {
    const rejected = spawnSync(process.execPath, ["scripts/live-codex-validation.mjs", "--skill-home", temp,
      "--workspace", temp, "--resume-report", resume, ...args], { cwd: root, encoding: "utf8", timeout: 10000 });
    assert.notEqual(rejected.status, 0);
    assert.ok(rejected.stderr.includes(message), rejected.stderr);
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log("Offline live-model evaluation tools passed without network, API keys, uploads, or fabricated model results.");
