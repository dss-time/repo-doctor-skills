import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const recommendedSkills = Object.freeze([
  "repo-doctor-router",
  "requirements-clarification",
  "bug-root-cause-analysis",
  "safe-fix-implementation",
  "safe-test-implementation",
  "safe-code-review",
  "decision-prototype",
]);

function option(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}

export function installerUsage(command = "repo-doctor-skills install") {
  return [
    `Usage: ${command} [--preset recommended|full] [--agent codex|shared] [--target-dir PATH] [--force]`,
    "",
    "Defaults to the Recommended preset. Use --target-dir for an explicit isolated destination.",
    "Without a reliable Agent signal, the target defaults to the shared ~/.agents/skills directory.",
  ].join("\n");
}

class InstallerUsageError extends Error {
  constructor(message) {
    super(message);
    this.exitCode = 2;
  }
}

function targetFromAgent(agent, env, home) {
  if (agent === "codex") return path.join(path.resolve(env.CODEX_HOME || path.join(home, ".codex")), "skills");
  if (agent === "shared") return path.join(path.resolve(env.AGENTS_HOME || path.join(home, ".agents")), "skills");
  return null;
}

function resolveTarget(args, env, home) {
  const explicitTarget = option(args, "--target-dir");
  if (explicitTarget) return path.resolve(explicitTarget);

  const explicitAgent = option(args, "--agent");
  if (explicitAgent) {
    const target = targetFromAgent(explicitAgent, env, home);
    if (!target) throw new InstallerUsageError(`Unsupported agent ${JSON.stringify(explicitAgent)}.`);
    return target;
  }

  const signals = [
    env.CODEX_HOME ? ["codex", env.CODEX_HOME] : null,
    env.AGENTS_HOME ? ["shared", env.AGENTS_HOME] : null,
  ].filter(Boolean);
  if (signals.length > 1) throw new InstallerUsageError("Multiple Agent homes were detected. Choose --agent codex, --agent shared, or --target-dir explicitly.");
  if (signals.length === 1) return path.join(path.resolve(signals[0][1]), "skills");
  return path.join(path.resolve(home, ".agents"), "skills");
}

function verifyInstalled(directory, slugs) {
  const actual = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && slugs.includes(entry.name))
    .map((entry) => entry.name)
    .sort();
  const expected = [...slugs].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`installation verification failed: ${actual.length}/${expected.length} Skills`);
  for (const slug of expected) {
    if (!existsSync(path.join(directory, slug, "SKILL.md"))) throw new Error(`installation verification failed: ${slug}/SKILL.md is missing`);
  }
}

async function skillSources() {
  const packagedRoot = path.join(root, "package-assets", "skills");
  if (existsSync(packagedRoot)) {
    const directories = readdirSync(packagedRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(path.join(packagedRoot, entry.name, "SKILL.md")))
      .map((entry) => path.join(packagedRoot, entry.name));
    return { packaged: true, directories, write: (source, destination) => cpSync(source, destination, { recursive: true }) };
  }

  const { discoverCanonicalSkillDirs, writeInstallableCodexSkill } = await import("./build-skills.mjs");
  return {
    packaged: false,
    directories: discoverCanonicalSkillDirs(path.join(root, "packs")),
    write: writeInstallableCodexSkill,
  };
}

export async function install({ preset = "recommended", target, force = false } = {}) {
  if (!target) throw new Error("target is required");
  if (!new Set(["recommended", "full"]).has(preset)) throw new Error(`unsupported preset ${JSON.stringify(preset)}`);

  const resolvedTarget = path.resolve(target);
  if (resolvedTarget === path.parse(resolvedTarget).root || resolvedTarget === path.resolve(homedir())) {
    throw new Error("refusing to install into a filesystem root or home directory");
  }

  const sources = await skillSources();
  const bySlug = new Map(sources.directories.map((directory) => [path.basename(directory), directory]));
  const slugs = preset === "recommended" ? [...recommendedSkills] : [...bySlug.keys()];
  const missing = slugs.filter((slug) => !bySlug.has(slug));
  if (missing.length) throw new Error(`preset references missing active Skills: ${missing.join(", ")}`);

  const existing = slugs.filter((slug) => existsSync(path.join(resolvedTarget, slug)));
  if (existing.length && !force) {
    throw new Error(`target already contains ${existing.length} selected Skill(s); rerun with --force to replace only those Skill directories`);
  }

  const parent = path.dirname(resolvedTarget);
  mkdirSync(parent, { recursive: true });
  const staging = mkdtempSync(path.join(parent, ".repo-doctor-install-"));
  try {
    for (const slug of slugs) sources.write(bySlug.get(slug), path.join(staging, slug));
    verifyInstalled(staging, slugs);
    mkdirSync(resolvedTarget, { recursive: true });
    for (const slug of slugs) {
      const destination = path.join(resolvedTarget, slug);
      if (force) rmSync(destination, { recursive: true, force: true });
      renameSync(path.join(staging, slug), destination);
    }
    verifyInstalled(resolvedTarget, slugs);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
  return { preset, target: resolvedTarget, skills: slugs };
}

export async function runInstallerCli(args = process.argv.slice(2), { env = process.env, home = homedir(), stdout = process.stdout, stderr = process.stderr } = {}) {
  if (args.includes("--help")) {
    stdout.write(`${installerUsage()}\n`);
    return 0;
  }
  try {
    const preset = option(args, "--preset") ?? "recommended";
    const target = resolveTarget(args, env, home);
    const result = await install({ preset, target, force: args.includes("--force") });
    const label = result.preset === "recommended" ? "Recommended" : "Full";
    stdout.write([
      "Repo Doctor Skills installed.",
      "",
      `Installed: ${result.skills.length} Skills`,
      `Preset: ${label}`,
      `Target: ${result.target}`,
      "",
      "Try:",
      "",
      "$repo-doctor-router",
      "I don't know which Skill to use.",
      "",
    ].join("\n"));
    return 0;
  } catch (error) {
    stderr.write(`Installation failed: ${error.message}\n`);
    if (error instanceof InstallerUsageError) stderr.write(`\n${installerUsage()}\n`);
    return error.exitCode ?? 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runInstallerCli();
}
