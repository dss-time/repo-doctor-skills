import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverActivePackSkills, discoverPackRoots } from "./sync-pack-plugin.mjs";
import { sortedDirectoryEntries } from "./deterministic-files.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";
import { inspectReleaseMetadata } from "./release-metadata.mjs";
import { validateWorkflowRegistry } from "./validate-workflows.mjs";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["generic-zh-CN", "generic-en", "codex-zh-CN", "claude-code-zh-CN", "cursor-zh-CN", "qwen-zh-CN", "kimi-zh-CN"];

function sameFile(left, right) {
  return existsSync(left) && existsSync(right) && readFileSync(left).equals(readFileSync(right));
}
function directories(directory, marker) {
  if (!existsSync(directory)) return [];
  return sortedDirectoryEntries(directory).filter((entry) => entry.isDirectory() && (!marker || existsSync(path.join(directory, entry.name, marker)))).map((entry) => entry.name);
}
function runNode(root, script, args = []) {
  return spawnSync(process.execPath, [path.join(root, script), ...args], { cwd: root, encoding: "utf8" });
}
function git(root, args) {
  try { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); } catch { return null; }
}

export function inspectDoctor(root = scriptRoot) {
  const errors = [];
  const warnings = [];
  const info = [];
  const checks = [];
  function record(id, ok, detail, severity = "error") {
    const status = ok ? "PASS" : severity === "warning" ? "WARN" : severity === "info" ? "INFO" : "FAIL";
    checks.push({ id, status, detail });
    if (!ok) (severity === "warning" ? warnings : severity === "info" ? info : errors).push(`${id}: ${detail}`);
  }

  const packagePath = path.join(root, "package.json");
  const packageJson = existsSync(packagePath) ? JSON.parse(readFileSync(packagePath, "utf8")) : null;
  const branch = git(root, ["branch", "--show-current"]);
  const workspace = git(root, ["status", "--short", "--untracked-files=all"]);
  const head = git(root, ["rev-parse", "HEAD"]);
  const tagCommit = git(root, ["rev-list", "-n", "1", "v0.2.0"]);

  record("node-runtime", Number(process.versions.node.split(".")[0]) >= 18, `Node ${process.versions.node}; required >=18`);
  record("git-branch", Boolean(branch), branch ? `branch ${branch}` : "Git branch unavailable", "warning");
  record("git-workspace", !workspace, workspace ? "workspace has local changes" : "workspace clean", "warning");
  record("package-version", Boolean(packageJson?.version), packageJson ? `project ${packageJson.name}@${packageJson.version}` : "missing package.json");

  const packRoots = discoverPackRoots(path.join(root, "packs"));
  const packSkills = packRoots.map((packRoot) => ({ packRoot, skills: discoverActivePackSkills(packRoot) }));
  const activeSkills = packSkills.reduce((sum, item) => sum + item.skills.length, 0);
  const repoPackRoot = path.join(root, "packs", "engineering", "repo-doctor");
  const repoSkills = discoverActivePackSkills(repoPackRoot).length;
  const pluginRoots = ["repo-doctor", "productivity-toolkit", "skill-maintainer"];
  const pluginSkills = pluginRoots.reduce((sum, plugin) => sum + directories(path.join(root, "plugins", plugin, "skills"), "SKILL.md").length, 0);
  const zipRoot = path.join(root, "dist", "chatgpt-skills");
  const zipCount = existsSync(zipRoot) ? sortedDirectoryEntries(zipRoot).filter((entry) => entry.isFile() && entry.name.endsWith(".zip")).length : 0;
  record("canonical-inventory", packRoots.length === 4 && activeSkills === 38 && repoSkills === 25, `${packRoots.length} Packs, ${activeSkills} active Skills, ${repoSkills} Repo Doctor Skills`);
  record("plugin-inventory", pluginSkills === 35, `${pluginSkills} plugin Skills; expected 35`);
  record("chatgpt-packages", zipCount === 35, String(zipCount) + " ZIPs; expected 35 after build", "warning");

  let localeMissing = 0;
  for (const { packRoot, skills } of packSkills) for (const slug of skills) {
    const base = path.join(packRoot, "skills", slug);
    for (const file of ["instructions.en.md", "instructions.zh-CN.md", "examples.en.md", "examples.zh-CN.md", "output.en.md", "output.zh-CN.md"]) if (!existsSync(path.join(base, file))) localeMissing += 1;
  }
  record("locale-completeness", localeMissing === 0, localeMissing ? `${localeMissing} bilingual files missing` : "all active Skills have required bilingual files");

  const workflow = validateWorkflowRegistry({ root });
  record("workflow-registry", workflow.errors.length === 0, workflow.errors.length ? workflow.errors.join("; ") : `${Object.keys(workflow.registry.workflows).length} workflows valid with active references`);
  const canonicalRegistry = path.join(root, "packs", "engineering", "repo-doctor", "workflows.yaml");
  record("plugin-workflow-projection", sameFile(canonicalRegistry, path.join(root, "plugins", "repo-doctor", "workflows.yaml")), "plugin registry matches canonical");
  for (const target of targets) record("dist-workflow-" + target, sameFile(canonicalRegistry, path.join(root, "dist", target, "workflows.yaml")), "dist registry matches canonical after build", "warning");

  const activation = runNode(root, "scripts/test-skill-activation.mjs");
  record("activation-contracts", activation.status === 0, activation.status === 0 ? activation.stdout.trim() : (activation.stderr || activation.stdout).trim());
  const docs = runNode(root, "scripts/check-user-docs.mjs");
  record("documentation-generated-state", docs.status === 0, docs.status === 0 ? docs.stdout.trim() : (docs.stderr || docs.stdout).trim());
  const quality = runNode(root, "scripts/check-skill-quality.mjs");
  record("canonical-generated-sync", quality.status === 0, quality.status === 0 ? quality.stdout.trim() : (quality.stderr || quality.stdout).trim());

  const ciPath = path.join(root, ".github", "workflows", "ci.yml");
  const ci = existsSync(ciPath) ? readFileSync(ciPath, "utf8") : "";
  const ciCommands = ["npm run validate", "npm test", "npm run build", "npm run docs:check", "npm run quality:check", "npm run release:check", "git diff --exit-code"];
  record("ci-quality-gates", ciCommands.every((command) => ci.includes(command)), `required gates: ${ciCommands.join(", ")}`);

  const release = inspectReleaseMetadata(root);
  record("release-metadata", release.errors.length === 0, release.errors.length ? release.errors.join("; ") : `project ${release.summary.projectVersion} metadata consistent`);
  if (head && tagCommit && head !== tagCommit) record("release-lineage", false, "HEAD is after local v0.2.0; recommend project 0.3.0 in a separately authorized release task", "warning");
  else record("release-lineage", true, tagCommit ? "HEAD matches local v0.2.0" : "local v0.2.0 relation unavailable");
  record("remote-release-state", false, "not checked: doctor is offline and never calls GitHub", "info");

  const nextCommand = errors.some((item) => item.includes("generated") || item.includes("projection") || item.includes("ZIP"))
    ? "npm run build"
    : errors.length
      ? "npm run validate"
      : "npm test";
  const status = errors.length ? "FAIL" : warnings.length ? "PASS_WITH_CONDITIONS" : "PASS";
  return {
    schema_version: 1,
    status,
    release_conclusion: errors.length ? "NO_GO" : warnings.length ? "GO_WITH_CONDITIONS" : "GO",
    read_only: true,
    network_called: false,
    environment: { node: process.versions.node, branch, workspace_clean: workspace === "", head },
    inventory: { packs: packRoots.length, active_skills: activeSkills, repo_doctor_skills: repoSkills, plugin_skills: pluginSkills, expected_chatgpt_zips: 35, actual_chatgpt_zips: zipCount, platform_targets: targets.length },
    workflow: { registry_id: workflow.registry?.registry_id ?? null, version: workflow.registry?.version ?? null, count: workflow.registry ? Object.keys(workflow.registry.workflows).length : 0 },
    release: { current_project_version: packageJson?.version ?? null, local_release_tag: tagCommit ? "v0.2.0" : null, local_release_commit: tagCommit, current_commit: head, recommended_next_version: head && tagCommit && head !== tagCommit ? "0.3.0" : null, remote_release_status: "UNKNOWN_OFFLINE" },
    next_recommended_command: nextCommand,
    checks,
    errors,
    warnings,
    info
  };
}

function main() {
  const json = process.argv.includes("--json");
  const rootIndex = process.argv.indexOf("--root");
  const root = rootIndex >= 0 ? path.resolve(process.argv[rootIndex + 1]) : scriptRoot;
  const result = inspectDoctor(root);
  if (json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else {
    console.log(`Repo Doctor: ${result.status} / ${result.release_conclusion}`);
    for (const check of result.checks) console.log(`[${check.status}] ${check.id}: ${check.detail}`);
    console.log(`Next: ${result.next_recommended_command}`);
  }
  if (result.status === "FAIL") process.exit(1);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
