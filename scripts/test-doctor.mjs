import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { inspectDoctor } from "./doctor.mjs";

const root = process.cwd();
const fingerprintPaths = ["package.json", "packs/engineering/repo-doctor/workflows.yaml", "plugins/repo-doctor/workflows.yaml"];
function fingerprint() {
  const hash = createHash("sha256");
  for (const filename of fingerprintPaths) { const absolute = path.join(root, filename); hash.update(existsSync(absolute) ? readFileSync(absolute) : "missing"); }
  return hash.digest("hex");
}
const before = fingerprint();
const result = inspectDoctor(root);
assert.equal(result.read_only, true);
assert.equal(result.network_called, false);
assert.equal(result.inventory.packs, 4);
assert.equal(result.inventory.active_skills, 40);
assert.equal(result.inventory.repo_doctor_skills, 27);
assert.equal(result.inventory.plugin_skills, 37);
assert.equal(result.inventory.expected_chatgpt_zips, 37);
assert.equal(result.workflow.count, 13);
assert.equal(result.release.current_project_version, "0.4.1");
assert.equal(result.release.release_channel, "stable");
assert.equal(result.release.live_model_status, "PASS");
assert.equal(result.release.maintainer_waiver, null);
assert.ok(["PASS", "PASS_WITH_CONDITIONS"].includes(result.status));
assert.ok(!result.errors.some((error) => error.includes("Live-model status")));
assert.equal(fingerprint(), before, "doctor must not modify inspected files");
const cli = spawnSync(process.execPath, ["scripts/doctor.mjs", "--json"], { cwd: root, encoding: "utf8" });
assert.equal(cli.status, 0, cli.stderr);
assert.equal(JSON.parse(cli.stdout).read_only, true);
console.log("Doctor tests passed for read-only inspection and JSON output.");
