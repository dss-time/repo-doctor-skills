import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { tmpdir } from "node:os";
import { inspectDoctor, inspectSkillInventory } from "./doctor.mjs";

const root = process.cwd();
// A count-preserving substitution must still be detected; adding canonical Skills
// must update expectations without editing daily checks.
const fixture = mkdtempSync(path.join(tmpdir(), "repo-doctor-inventory-"));
try {
  const write = (name, content) => {
    const filename = path.join(fixture, name);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, content);
  };
  const pack = "packs/engineering/repo-doctor";
  write(`${pack}/pack.yaml`, "id: engineering.repo-doctor\nskills: [alpha]\n");
  write(`${pack}/skills/alpha/skill.yaml`, "status: beta\n");
  write("plugins/repo-doctor/.codex-plugin/plugin.json", "{}");
  write("plugins/repo-doctor/skills/wrong/SKILL.md", "wrong");
  write("dist/chatgpt-skills/rd-wrong.zip", "fixture");
  let inventory = inspectSkillInventory(fixture);
  assert.deepEqual(inventory.pluginDiff, { missing: ["repo-doctor/alpha"], unexpected: ["repo-doctor/wrong"] });
  assert.deepEqual(inventory.zipDiff, { missing: ["rd-alpha.zip"], unexpected: ["rd-wrong.zip"] });
  write(`${pack}/pack.yaml`, "id: engineering.repo-doctor\nskills: [alpha, beta]\n");
  write(`${pack}/skills/beta/skill.yaml`, "status: beta\n");
  inventory = inspectSkillInventory(fixture);
  assert.deepEqual(inventory.expectedPlugins, ["repo-doctor/alpha", "repo-doctor/beta"]);
  assert.deepEqual(inventory.expectedZips, ["rd-alpha.zip", "rd-beta.zip"]);
  rmSync(path.join(fixture, "plugins/repo-doctor/skills/wrong"), { recursive: true });
  rmSync(path.join(fixture, "dist/chatgpt-skills/rd-wrong.zip"));
  for (const slug of ["alpha", "beta"]) {
    write(`plugins/repo-doctor/skills/${slug}/SKILL.md`, slug);
    write(`dist/chatgpt-skills/rd-${slug}.zip`, "fixture");
  }
  inventory = inspectSkillInventory(fixture);
  assert.deepEqual(inventory.pluginDiff, { missing: [], unexpected: [] });
  assert.deepEqual(inventory.zipDiff, { missing: [], unexpected: [] });
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

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
const expectedInventory = inspectSkillInventory(root);
assert.equal(result.inventory.packs, expectedInventory.packs.length);
assert.equal(result.inventory.active_skills, expectedInventory.packs.reduce((sum, pack) => sum + pack.skills.length, 0));
assert.equal(result.inventory.repo_doctor_skills, expectedInventory.packs.find((pack) => pack.id === "engineering.repo-doctor").skills.length);
assert.equal(result.inventory.plugin_skills, expectedInventory.expectedPlugins.length);
assert.equal(result.inventory.expected_chatgpt_zips, expectedInventory.expectedZips.length);
assert.ok(result.workflow.count > 0);
assert.equal(result.release.current_project_version, JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version);
assert.equal(result.release.release_channel, "stable");
assert.equal(result.release.live_model_status, "UNKNOWN");
assert.equal(result.release.maintainer_waiver.version, "0.7.2");
assert.ok(["PASS", "PASS_WITH_CONDITIONS"].includes(result.status));
assert.equal(result.errors.length, 0, "Doctor must report no release errors after completed evidence");
assert.equal(fingerprint(), before, "doctor must not modify inspected files");
const cli = spawnSync(process.execPath, ["scripts/doctor.mjs", "--json"], { cwd: root, encoding: "utf8" });
assert.equal(cli.status, 0, cli.stderr);
assert.equal(JSON.parse(cli.stdout).read_only, true);
console.log("Doctor tests passed for read-only inspection and JSON output.");
