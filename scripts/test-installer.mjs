import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = mkdtempSync(path.join(tmpdir(), "repo-doctor-installer-"));

try {
  const target = path.join(tempRoot, "recommended-skills");
  const result = spawnSync(process.execPath, [
    path.join(root, "scripts", "install.mjs"),
    "--target-dir",
    target,
  ], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      HOME: path.join(tempRoot, "isolated-home"),
      CODEX_HOME: "",
      AGENTS_HOME: "",
    },
    timeout: 15000,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const installed = readdirSync(target, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(installed, [
    "bug-root-cause-analysis",
    "decision-prototype",
    "repo-doctor-router",
    "requirements-clarification",
    "safe-code-review",
    "safe-fix-implementation",
    "safe-test-implementation",
  ]);
  for (const slug of installed) assert.ok(existsSync(path.join(target, slug, "SKILL.md")), `${slug}: SKILL.md missing`);
  assert.match(result.stdout, /Repo Doctor Skills installed\./);
  assert.match(result.stdout, /Installed: 7 Skills/);
  assert.match(result.stdout, /Preset: Recommended/);
  assert.match(result.stdout, /\$repo-doctor-router/);
  assert.match(result.stdout, /I don't know which Skill to use\./);

  const fullTarget = path.join(tempRoot, "full-skills");
  const full = spawnSync(process.execPath, [
    path.join(root, "scripts", "install.mjs"),
    "--preset",
    "full",
    "--target-dir",
    fullTarget,
  ], { cwd: root, encoding: "utf8", env: { ...process.env, HOME: path.join(tempRoot, "isolated-home") }, timeout: 15000 });
  assert.equal(full.status, 0, full.stderr || full.stdout);
  assert.equal(readdirSync(fullTarget, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length, 40);
  assert.match(full.stdout, /Installed: 40 Skills/);
  assert.match(full.stdout, /Preset: Full/);

  const codexHome = path.join(tempRoot, "codex-home");
  const explicitCodex = spawnSync(process.execPath, [
    path.join(root, "scripts", "install.mjs"),
    "--agent",
    "codex",
  ], { cwd: root, encoding: "utf8", env: { ...process.env, HOME: path.join(tempRoot, "isolated-home"), CODEX_HOME: codexHome, AGENTS_HOME: "" }, timeout: 15000 });
  assert.equal(explicitCodex.status, 0, explicitCodex.stderr || explicitCodex.stdout);
  assert.equal(readdirSync(path.join(codexHome, "skills"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).length, 7);

  const ambiguous = spawnSync(process.execPath, [path.join(root, "scripts", "install.mjs")], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      HOME: path.join(tempRoot, "isolated-home"),
      CODEX_HOME: path.join(tempRoot, "ambiguous-codex"),
      AGENTS_HOME: path.join(tempRoot, "ambiguous-agents"),
    },
    timeout: 15000,
  });
  assert.equal(ambiguous.status, 2);
  assert.match(ambiguous.stderr, /Multiple Agent homes were detected/);
  assert.ok(!existsSync(path.join(tempRoot, "ambiguous-codex")));
  assert.ok(!existsSync(path.join(tempRoot, "ambiguous-agents")));
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

assert.ok(!existsSync(tempRoot), "installer test temp directory was not cleaned");
console.log("Installer tests passed: Recommended 7/7, Full 40/40, explicit Codex target, ambiguous-target safety, and cleanup.");
