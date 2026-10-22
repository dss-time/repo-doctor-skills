import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { install, recommendedSkills } from "./install.mjs";

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
  assert.match(result.stdout, /unchanged: 0/);

  const fullTarget = path.join(tempRoot, "full-skills");
  const full = spawnSync(process.execPath, [
    path.join(root, "scripts", "install.mjs"),
    "--preset",
    "full",
    "--target-dir",
    fullTarget,
  ], { cwd: root, encoding: "utf8", env: { ...process.env, HOME: path.join(tempRoot, "isolated-home") }, timeout: 15000 });
  assert.equal(full.status, 0, full.stderr || full.stdout);
  assert.equal(readdirSync(fullTarget, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length, 41);
  assert.match(full.stdout, /Installed: 41 Skills/);
  assert.match(full.stdout, /Preset: Full/);

  const cli = (args) => spawnSync(process.execPath, [path.join(root, "scripts/install.mjs"), ...args], {
    cwd: root, encoding: "utf8", env: { ...process.env, CODEX_HOME: "", AGENTS_HOME: "" }, timeout: 15000,
  });
  const repeated = cli(["--target-dir", target]);
  assert.equal(repeated.status, 0, repeated.stderr);
  assert.match(repeated.stdout, /Installed: 0 Skills; unchanged: 7/);
  const expansion = cli(["--preset", "full", "--target-dir", target]);
  assert.equal(expansion.status, 0, expansion.stderr);
  assert.match(expansion.stdout, /Installed: 34 Skills; unchanged: 7/);
  assert.equal(readdirSync(target).length, 41);

  const featureTarget = path.join(tempRoot, "feature-only");
  const featureInstall = cli(["--skill", "feature-implementation", "--language", "zh-CN", "--target-dir", featureTarget]);
  assert.equal(featureInstall.status, 0, featureInstall.stderr);
  assert.deepEqual(readdirSync(featureTarget), ["feature-implementation"]);
  const featureBody = readFileSync(path.join(featureTarget, "feature-implementation", "SKILL.md"), "utf8");
  assert.ok(featureBody.includes("# 功能实施"));
  assert.ok(!featureBody.includes("# Feature Implementation"));
  assert.ok(!featureBody.includes("report test authoring blocked"));
  assert.match(featureBody, /references\/testing-contract.zh-CN.md/);
  assert.deepEqual(
    readFileSync(path.join(featureTarget, "feature-implementation/references/testing-contract.zh-CN.md")),
    readFileSync(path.join(root, "packs/engineering/repo-doctor/references/testing-contract.zh-CN.md")),
    "individual feature installation must include its canonical test discipline",
  );
  assert.ok(!existsSync(path.join(featureTarget, "safe-test-implementation")), "feature installation needs no second Skill");

  const routerTarget = path.join(tempRoot, "router-only");
  const routerInstall = cli(["--skill", "repo-doctor-router", "--target-dir", routerTarget]);
  assert.equal(routerInstall.status, 0, routerInstall.stderr);
  assert.deepEqual(readdirSync(routerTarget), ["repo-doctor-router"]);
  assert.deepEqual(
    readFileSync(path.join(routerTarget, "repo-doctor-router/references/workflows.yaml")),
    readFileSync(path.join(root, "packs/engineering/repo-doctor/workflows.yaml")),
    "standalone Router must carry the canonical registry without needing the source repository",
  );
  assert.match(readFileSync(path.join(routerTarget, "repo-doctor-router/SKILL.md"), "utf8"), /references\/workflows.yaml/);
  assert.ok(!existsSync(path.join(routerTarget, "repo-doctor-router/references/testing-contract.en.md")));
  assert.ok(!existsSync(path.join(fullTarget, "safe-code-review/references/workflows.yaml")));
  assert.ok(!existsSync(path.join(fullTarget, "safe-code-review/references/testing-contract.en.md")));

  for (const language of ["en", "zh-CN", "bilingual"]) {
    const individual = path.join(tempRoot, `individual-${language}`);
    const selected = cli(["--skill", "safe-code-review", "--language", language, "--target-dir", individual]);
    assert.equal(selected.status, 0, selected.stderr);
    assert.deepEqual(readdirSync(individual), ["safe-code-review"]);
    const body = readFileSync(path.join(individual, "safe-code-review/SKILL.md"), "utf8");
    assert.equal(body.includes("# English\n"), language !== "zh-CN");
    assert.equal(body.includes("# 简体中文\n"), language !== "en");
    assert.ok(existsSync(path.join(individual, "safe-code-review/agents/openai.yaml")));
    assert.ok(existsSync(path.join(individual, "safe-code-review/references/execution-modes.en.md")));
    assert.ok(existsSync(path.join(individual, "safe-code-review/references/execution-modes.zh-CN.md")));
    assert.match(selected.stdout, /Try: \$safe-code-review/);
  }

  const changedFile = path.join(target, "safe-code-review/SKILL.md");
  writeFileSync(changedFile, "user-owned edit\n");
  const conflict = cli(["--target-dir", target]);
  assert.equal(conflict.status, 1);
  assert.match(conflict.stderr, /Different existing Skills: safe-code-review/);
  assert.equal(readFileSync(changedFile, "utf8"), "user-owned edit\n");
  const replace = cli(["--skill", "safe-code-review", "--target-dir", target, "--force"]);
  assert.equal(replace.status, 0, replace.stderr);
  assert.notEqual(readFileSync(changedFile, "utf8"), "user-owned edit\n");

  const linked = path.join(target, "safe-code-review/user-link");
  symlinkSync(changedFile, linked);
  const linkConflict = cli(["--skill", "safe-code-review", "--target-dir", target]);
  assert.equal(linkConflict.status, 1);
  assert.ok(existsSync(linked));

  for (const args of [["--skill", "../escape"], ["--skill", "missing"], ["--language", "xx"], ["--force", "--force"], ["--skill"], ["--unknown"], ["--preset", "full", "--skill", "safe-code-review"]]) {
    const absent = path.join(tempRoot, "must-stay-absent");
    const invalid = cli(["--target-dir", absent, ...args]);
    assert.notEqual(invalid.status, 0, JSON.stringify(args));
    assert.ok(!existsSync(absent), "invalid request wrote its destination");
  }

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

  // Exercise a partial batch: replace one customized Skill, add one new Skill,
  // then fail the next replacement. Everything must return to its prior state.
  for (const failRestore of [false, true]) {
    const rollbackTarget = path.join(tempRoot, `rollback-${failRestore}`);
    const [first, added, failing] = recommendedSkills;
    for (const skill of [first, failing]) {
      await install({ skill, target: rollbackTarget });
      writeFileSync(path.join(rollbackTarget, skill, "custom.txt"), `original ${skill}`);
    }
    const originalRename = fs.renameSync;
    let backup;
    fs.renameSync = (from, to) => {
      if (to === path.join(rollbackTarget, failing) && !from.includes(`${path.sep}.backup${path.sep}`)) {
        throw Object.assign(new Error("injected install EIO"), { code: "EIO" });
      }
      if (failRestore && from.includes(`${path.sep}.backup${path.sep}`) && to === path.join(rollbackTarget, failing)) {
        backup = from;
        throw Object.assign(new Error("injected restore EIO"), { code: "EIO" });
      }
      return originalRename(from, to);
    };
    syncBuiltinESMExports();
    try {
      await assert.rejects(install({ target: rollbackTarget, force: true }), failRestore ? /Recovery files preserved at/ : /previous Skills restored/);
    } finally {
      fs.renameSync = originalRename;
      syncBuiltinESMExports();
    }
    assert.equal(readFileSync(path.join(rollbackTarget, first, "custom.txt"), "utf8"), `original ${first}`);
    assert.ok(!existsSync(path.join(rollbackTarget, added)), "newly installed Skill must also roll back");
    const restored = failRestore ? backup : path.join(rollbackTarget, failing);
    assert.equal(readFileSync(path.join(restored, "custom.txt"), "utf8"), `original ${failing}`);
    const stagingDirs = readdirSync(tempRoot).filter((name) => name.startsWith(".repo-doctor-install-"));
    assert.equal(stagingDirs.length, failRestore ? 1 : 0, "retain backup only when restoration needs recovery");
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

assert.ok(!existsSync(tempRoot), "installer test temp directory was not cleaned");
console.log("Installer tests passed: Recommended 7/7, Full 41/41, explicit Codex target, ambiguous-target safety, and cleanup.");
