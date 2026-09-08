import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  lstatSync,
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
    `Usage: ${command} [--preset recommended|full | --skill SLUG] [--language en|zh-CN|bilingual] [--agent codex|shared] [--target-dir PATH] [--force]`,
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

function validateArguments(args) {
  const values = new Set(["--preset", "--skill", "--language", "--agent", "--target-dir"]);
  const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const flag = args[i];
    if ((!values.has(flag) && flag !== "--force") || seen.has(flag)) throw new InstallerUsageError(`Unknown or repeated option ${JSON.stringify(flag)}.`);
    seen.add(flag);
    if (values.has(flag) && (!args[++i] || args[i].startsWith("--"))) throw new InstallerUsageError(`Missing value for ${flag}.`);
  }
  if (seen.has("--skill") && seen.has("--preset")) throw new InstallerUsageError("Choose --skill or --preset, not both.");
}

function sameTree(left, right) {
  const a = lstatSync(left), b = lstatSync(right);
  if (a.isSymbolicLink() || b.isSymbolicLink()) return false;
  if (a.isFile() && b.isFile()) return readFileSync(left).equals(readFileSync(right)) && (a.mode & 0o111) === (b.mode & 0o111);
  if (!a.isDirectory() || !b.isDirectory()) return false;
  const names = readdirSync(left).sort();
  return JSON.stringify(names) === JSON.stringify(readdirSync(right).sort())
    && names.every((name) => sameTree(path.join(left, name), path.join(right, name)));
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

export async function install({ preset = "recommended", skill = null, language = "bilingual", target, force = false } = {}) {
  if (!target) throw new Error("target is required");
  if (!new Set(["recommended", "full"]).has(preset)) throw new Error(`unsupported preset ${JSON.stringify(preset)}`);
  if (!["en", "zh-CN", "bilingual"].includes(language)) throw new InstallerUsageError(`Unsupported language ${JSON.stringify(language)}.`);

  const resolvedTarget = path.resolve(target);
  if (resolvedTarget === path.parse(resolvedTarget).root || resolvedTarget === path.resolve(homedir())) {
    throw new Error("refusing to install into a filesystem root or home directory");
  }

  const sources = await skillSources();
  const bySlug = new Map(sources.directories.map((directory) => [path.basename(directory), directory]));
  const slugs = skill ? [skill] : preset === "recommended" ? [...recommendedSkills] : [...bySlug.keys()].sort();
  const missing = slugs.filter((slug) => !bySlug.has(slug));
  if (missing.length) throw new Error(`preset references missing active Skills: ${missing.join(", ")}`);

  const parent = path.dirname(resolvedTarget);
  mkdirSync(parent, { recursive: true });
  const staging = mkdtempSync(path.join(parent, ".repo-doctor-install-"));
  try {
    for (const slug of slugs) {
      const destination = path.join(staging, slug);
      sources.write(bySlug.get(slug), destination);
      if (language !== "bilingual") {
        const filename = path.join(destination, "SKILL.md");
        const content = readFileSync(filename, "utf8");
        const en = content.indexOf("\n# English\n");
        const zh = content.indexOf("\n# 简体中文\n", en + 1);
        if (en < 0 || zh < en) throw new Error(`Missing language sections for ${slug}`);
        writeFileSync(filename, content.slice(0, en) + (language === "en" ? content.slice(en, zh) : content.slice(zh)));
      }
    }
    verifyInstalled(staging, slugs);
    const unchanged = slugs.filter((slug) => {
      const destination = path.join(resolvedTarget, slug);
      return existsSync(destination) && sameTree(path.join(staging, slug), destination);
    });
    const pending = slugs.filter((slug) => !unchanged.includes(slug));
    const conflicts = pending.filter((slug) => {
      try { lstatSync(path.join(resolvedTarget, slug)); return true; } catch (error) { if (error.code === "ENOENT") return false; throw error; }
    });
    if (conflicts.length && !force) throw new Error(`Different existing Skills: ${conflicts.join(", ")}. Use --force to replace selected Skills.`);
    mkdirSync(resolvedTarget, { recursive: true });
    for (const slug of pending) {
      const destination = path.join(resolvedTarget, slug);
      if (force) rmSync(destination, { recursive: true, force: true });
      renameSync(path.join(staging, slug), destination);
    }
    verifyInstalled(resolvedTarget, slugs);
    return { preset: skill ? "individual" : preset, target: resolvedTarget, skills: slugs, installed: pending.length, unchanged: unchanged.length, language };
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

export async function runInstallerCli(args = process.argv.slice(2), { env = process.env, home = homedir(), stdout = process.stdout, stderr = process.stderr } = {}) {
  if (args.includes("--help")) {
    stdout.write(`${installerUsage()}\n`);
    return 0;
  }
  try {
    validateArguments(args);
    const preset = option(args, "--preset") ?? "recommended";
    const target = resolveTarget(args, env, home);
    const result = await install({ preset, skill: option(args, "--skill"), language: option(args, "--language") ?? "bilingual", target, force: args.includes("--force") });
    const label = { recommended: "Recommended", full: "Full", individual: "Individual" }[result.preset];
    stdout.write([
      "Repo Doctor Skills installed.",
      `Installed: ${result.installed} Skills; unchanged: ${result.unchanged}`,
      `Preset: ${label}`,
      `Target: ${result.target}`,
      `Try: $${option(args, "--skill") ?? "repo-doctor-router"}`,
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
