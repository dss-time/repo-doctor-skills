import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, existsSync, cpSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(repository, "bin", "repo-doctor-skills.mjs");
function run(root, args, expected = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: "utf8", timeout: 30000 });
  assert.equal(result.status, expected, result.stderr || result.stdout);
  return result;
}
function json(root, args) { return JSON.parse(run(root, args).stdout); }
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "repo-doctor-state-cli-"));
  writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: { test: "node --test" } }));
  writeFileSync(path.join(root, "module.mjs"), "export const value = 1;\n");
  return root;
}

test("normal CLI previews, initializes, detects drift and explicitly refreshes project state", () => {
  const root = fixture();
  try {
    assert.equal(json(root, ["project", "init"]).status, "PREVIEW");
    assert.equal(existsSync(path.join(root, ".repo-doctor")), false);
    const initialized = json(root, ["project", "init", "--apply"]);
    assert.equal(initialized.project.revision, 1);
    assert.equal(json(root, ["project", "check"]).status, "CURRENT");
    writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: { test: "node --test", build: "node build.mjs" } }));
    assert.equal(json(root, ["project", "check"]).status, "STALE");
    const refresh = ["project", "refresh", "--revision", "1"];
    assert.equal(json(root, refresh).applied, false);
    assert.equal(json(root, ["project", "check"]).project.revision, 1);
    assert.equal(json(root, [...refresh, "--apply"]).project.revision, 2);
    assert.equal(json(root, ["project", "check"]).status, "CURRENT");
    run(root, [...refresh, "--apply"], 1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("normal CLI persists and resumes task context with conflict and authority checks", () => {
  const root = fixture();
  try {
    json(root, ["project", "init", "--apply"]);
    const created = json(root, ["task", "create", "--id", "fix-one", "--goal", "Fix one approved behavior", "--acceptance", "behavior-fixed", "--skill", "safe-fix-implementation"]);
    assert.equal(created.revision, 1);
    assert.deepEqual(json(root, ["task", "list"]).tasks.map(task => task.id), ["fix-one"]);
    created.context.scope.files = ["module.mjs"];
    created.context.steps.task.status = "running";
    created.context.next_actions = ["old recommendation"];
    const input = path.join(root, "checkpoint.json");
    writeFileSync(input, JSON.stringify(created.context));
    const save = ["task", "save", "--id", "fix-one", "--input", input, "--revision", "1"];
    assert.equal(json(root, save).revision, 2);
    const current = json(root, ["task", "resume", "--id", "fix-one"]);
    assert.equal(current.status, "UNKNOWN");
    assert.equal(current.context.steps.task.status, "interrupted");
    assert.deepEqual(current.context.next_actions, []);
    assert.equal(current.requires_host_revalidation, true);
    run(root, save, 1);
    const stateFile = path.join(root, ".repo-doctor", "tasks", "fix-one.json");
    const original = readFileSync(stateFile);
    created.context.grants = { write_files: true };
    writeFileSync(input, JSON.stringify(created.context));
    run(root, [...save.slice(0, -1), "2"], 1);
    assert.deepEqual(readFileSync(stateFile), original);
    writeFileSync(path.join(root, "module.mjs"), "export const value = 2;\n");
    assert.equal(json(root, ["task", "resume", "--id", "fix-one"]).status, "STALE");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("installed content is tracked and duplicate/legacy diagnosis preserves user edits", () => {
  const root = fixture();
  try {
    const first = path.join(root, "first");
    const second = path.join(root, "second");
    run(root, ["install", "--skill", "safe-code-review", "--target-dir", first]);
    const filename = path.join(first, "safe-code-review", "SKILL.md");
    writeFileSync(filename, readFileSync(filename, "utf8") + "\nUser customization\n");
    mkdirSync(second);
    cpSync(path.join(first, "safe-code-review"), path.join(second, "safe-code-review"), { recursive: true });
    mkdirSync(path.join(second, "requirements-to-spec"));
    writeFileSync(path.join(second, "requirements-to-spec", "SKILL.md"), "Untracked older installation\n");
    const original = readFileSync(filename);
    const report = json(root, ["installations", "check", "--target-dir", first, "--target-dir", second]);
    assert.equal(report.targets[0].records.find(item => item.slug === "safe-code-review").content_state, "modified");
    const legacy = report.targets[1].records.find(item => item.slug === "requirements-to-spec");
    assert.equal(legacy.origin, "unknown");
    assert.equal(legacy.replacement, "requirements-clarification");
    assert.equal(report.duplicates[0].source_unknown, true);
    assert.deepEqual(readFileSync(filename), original);
    assert.equal(existsSync(path.join(second, "requirements-to-spec")), true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("invalid state CLI requests have no write effects and do not expose JSON input", () => {
  const root = fixture();
  try {
    for (const args of [["project", "init", "--unknown"], ["task", "create", "--id", "../escape"], ["task", "save", "--id", "one", "--input", "missing", "--revision", "1.5"]]) run(root, args, 1);
    assert.equal(existsSync(path.join(root, ".repo-doctor")), false);
    const input = path.join(root, "private-input.json");
    writeFileSync(input, '{"password":"not-for-output"');
    const result = run(root, ["task", "save", "--id", "one", "--input", input, "--revision", "1"], 1);
    assert.equal(result.stderr.includes("not-for-output"), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('default installation discovery honors the same custom Agent homes as install', async () => {
  const root = fixture();
  try {
    const { runWorkspaceCli } = await import('./workspace-cli.mjs');
    const homes = { CODEX_HOME: path.join(root, 'custom-codex'), AGENTS_HOME: path.join(root, 'custom-shared') };
    let output = '';
    let errors = '';
    const status = await runWorkspaceCli(['installations', 'check'], {
      cwd: root, home: path.join(root, 'unused-home'), env: homes,
      stdout: { write: value => { output += value; } }, stderr: { write: value => { errors += value; } },
    });
    assert.equal(status, 0, errors);
    const targets = JSON.parse(output).targets.map(target => target.path);
    assert.ok(targets.includes(path.join(homes.CODEX_HOME, 'skills')));
    assert.ok(targets.includes(path.join(homes.AGENTS_HOME, 'skills')));
    assert.equal(existsSync(homes.CODEX_HOME), false);
    assert.equal(existsSync(homes.AGENTS_HOME), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
