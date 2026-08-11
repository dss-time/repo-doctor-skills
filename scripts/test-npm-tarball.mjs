import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = mkdtempSync(path.join(tmpdir(), "repo-doctor-npm-tarball-"));

function runNpx(tarball, args, env = {}) {
  return spawnSync("npm", ["exec", "--yes", `--package=${tarball}`, "--", "repo-doctor-skills", ...args], {
    cwd: tempRoot,
    encoding: "utf8",
    timeout: 30000,
    env: {
      ...process.env,
      HOME: path.join(tempRoot, "home"),
      npm_config_cache: path.join(tempRoot, "npm-cache"),
      npm_config_update_notifier: "false",
      CODEX_HOME: "",
      AGENTS_HOME: "",
      ...env,
    },
  });
}

function installedCount(target) {
  return readdirSync(target, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length;
}

try {
  const packed = spawnSync("npm", ["pack", "--json", "--pack-destination", tempRoot], {
    cwd: root,
    encoding: "utf8",
    timeout: 30000,
    env: { ...process.env, npm_config_cache: path.join(tempRoot, "pack-cache"), npm_config_update_notifier: "false" },
  });
  assert.equal(packed.status, 0, packed.stderr || packed.stdout);
  const packReport = JSON.parse(packed.stdout);
  assert.equal(packReport.length, 1);
  assert.equal(packReport[0].name, "repo-doctor-skills");
  assert.equal(packReport[0].version, "0.6.0");
  const tarball = path.join(tempRoot, packReport[0].filename);
  assert.ok(existsSync(tarball));

  const entries = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" }).trim().split("\n");
  for (const required of [
    "package/bin/repo-doctor-skills.mjs",
    "package/scripts/install.mjs",
    "package/package.json",
    "package/README.md",
    "package/LICENSE",
  ]) assert.ok(entries.includes(required), `tarball missing ${required}`);
  assert.ok(entries.some((entry) => entry.startsWith("package/package-assets/skills/")), "tarball missing packaged Skill assets");
  for (const entry of entries) {
    assert.doesNotMatch(entry, /(?:^|\/)(?:\.git|\.github|tests?|benchmarks?|dist|node_modules|\.npmrc)(?:\/|$)/);
  }

  execFileSync("tar", ["-xzf", tarball, "-C", tempRoot]);
  const extracted = path.join(tempRoot, "package");
  assert.ok(existsSync(extracted));
  for (const relative of entries.filter((entry) => entry.startsWith("package/") && !entry.endsWith("/"))) {
    const filename = path.join(tempRoot, relative);
    if (!statSync(filename).isFile()) continue;
    const content = readFileSync(filename);
    const text = content.toString("utf8");
    assert.doesNotMatch(text, /\/Users\/[A-Za-z0-9._-]+\/|\/home\/[A-Za-z0-9._-]+\/|[A-Za-z]:\\Users\\/);
    assert.doesNotMatch(text, /(?:npm_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/);
  }

  const version = runNpx(tarball, ["--version"]);
  assert.equal(version.status, 0, version.stderr || version.stdout);
  assert.equal(version.stdout.trim(), "0.6.0");

  const help = runNpx(tarball, ["--help"]);
  assert.equal(help.status, 0, help.stderr || help.stdout);
  assert.match(help.stdout, /repo-doctor-skills install/);

  const recommendedTarget = path.join(tempRoot, "recommended");
  const recommended = runNpx(tarball, ["install", "--target-dir", recommendedTarget]);
  assert.equal(recommended.status, 0, recommended.stderr || recommended.stdout);
  assert.equal(installedCount(recommendedTarget), 7);
  assert.match(recommended.stdout, /Installed: 7 Skills/);
  assert.match(recommended.stdout, /Preset: Recommended/);
  assert.match(recommended.stdout, /\$repo-doctor-router/);

  const fullTarget = path.join(tempRoot, "full");
  const full = runNpx(tarball, ["install", "--preset", "full", "--target-dir", fullTarget]);
  assert.equal(full.status, 0, full.stderr || full.stdout);
  assert.equal(installedCount(fullTarget), 40);
  assert.match(full.stdout, /Installed: 40 Skills/);
  assert.match(full.stdout, /Preset: Full/);

  const collision = runNpx(tarball, ["install", "--target-dir", recommendedTarget]);
  assert.equal(collision.status, 1);
  assert.match(collision.stderr, /already contains 7 selected Skill/);
  const forced = runNpx(tarball, ["install", "--target-dir", recommendedTarget, "--force"]);
  assert.equal(forced.status, 0, forced.stderr || forced.stdout);

  const codexHome = path.join(tempRoot, "codex-home");
  const codex = runNpx(tarball, ["install", "--agent", "codex"], {
    CODEX_HOME: codexHome,
    AGENTS_HOME: path.join(tempRoot, "ignored-shared-home"),
  });
  assert.equal(codex.status, 0, codex.stderr || codex.stdout);
  assert.equal(installedCount(path.join(codexHome, "skills")), 7);

  const agentsHome = path.join(tempRoot, "agents-home");
  const shared = runNpx(tarball, ["install", "--agent", "shared"], { AGENTS_HOME: agentsHome });
  assert.equal(shared.status, 0, shared.stderr || shared.stdout);
  assert.equal(installedCount(path.join(agentsHome, "skills")), 7);

  const defaultHome = path.join(tempRoot, "default-home");
  const defaultInstall = runNpx(tarball, ["install"], { HOME: defaultHome });
  assert.equal(defaultInstall.status, 0, defaultInstall.stderr || defaultInstall.stdout);
  assert.equal(installedCount(path.join(defaultHome, ".agents", "skills")), 7);

  const ambiguousCodex = path.join(tempRoot, "ambiguous-codex");
  const ambiguousAgents = path.join(tempRoot, "ambiguous-agents");
  const ambiguous = runNpx(tarball, ["install"], { CODEX_HOME: ambiguousCodex, AGENTS_HOME: ambiguousAgents });
  assert.equal(ambiguous.status, 2);
  assert.match(ambiguous.stderr, /Multiple Agent homes were detected/);
  assert.ok(!existsSync(ambiguousCodex));
  assert.ok(!existsSync(ambiguousAgents));
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

assert.ok(!existsSync(tempRoot), "npm tarball test temp directory was not cleaned");
console.log("npm tarball tests passed: minimal contents, isolated CLI, Recommended 7/7, Full 40/40, options, safety, and cleanup.");
