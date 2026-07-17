import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyDirectoryContents } from "./deterministic-files.mjs";
import { discoverActivePackSkills, discoverPackRoots } from "./sync-pack-plugin.mjs";

const root = process.cwd();
const packsDir = path.join(root, "packs");
const distDir = path.join(root, "dist");
const requestedTarget = process.argv.includes("--target")
  ? process.argv[process.argv.indexOf("--target") + 1]
  : null;

const targets = requestedTarget
  ? [requestedTarget]
  : [
      "generic-zh-CN",
      "generic-en",
      "codex-zh-CN",
      "claude-code-zh-CN",
      "cursor-zh-CN",
      "qwen-zh-CN",
      "kimi-zh-CN",
    ];

function field(yaml, block, locale) {
  const pattern = new RegExp(`^${block}:\\n(?:.*\\n)*?\\s{2}${locale}:\\s*(.+)$`, "m");
  return yaml.match(pattern)?.[1]?.trim() ?? "";
}

function scalar(yaml, key) {
  return yaml.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
}

function copyFlatResources(skillDir, outDir) {
  const skillName = path.basename(skillDir);
  const packRoot = path.dirname(path.dirname(skillDir));
  copyDirectoryContents(path.join(packRoot, "references"), path.join(outDir, "references"));
  copyDirectoryContents(path.join(skillDir, "references"), path.join(outDir, "references", skillName));
  copyDirectoryContents(path.join(skillDir, "assets"), path.join(outDir, "assets", skillName));
  copyDirectoryContents(path.join(skillDir, "scripts"), path.join(outDir, "scripts", skillName));
}

function renderSkill(skillDir, locale, target) {
  const yaml = readFileSync(path.join(skillDir, "skill.yaml"), "utf8");
  const name = field(yaml, "name", locale) || path.basename(skillDir);
  const description = field(yaml, "description", locale);
  const descriptionEn = field(yaml, "description", "en");
  const descriptionZh = field(yaml, "description", "zh-CN");
  const id = scalar(yaml, "id");
  const visibility = scalar(yaml, "visibility");
  const skillName = path.basename(skillDir);
  let instructions = readFileSync(path.join(skillDir, `instructions.${locale}.md`), "utf8")
    .replaceAll("../../references/", "__PACK_REFERENCE__");
  if (target.startsWith("claude-code")) {
    instructions = instructions.replaceAll("__PACK_REFERENCE__", "references/");
  } else {
    instructions = instructions
      .replaceAll("references/", `references/${skillName}/`)
      .replaceAll("assets/", `assets/${skillName}/`)
      .replaceAll("scripts/", `scripts/${skillName}/`)
      .replaceAll("__PACK_REFERENCE__", "references/");
  }
  const output = readFileSync(path.join(skillDir, `output.${locale}.md`), "utf8");

  if (target.startsWith("cursor")) {
    return `---\ndescription: ${descriptionEn} ${descriptionZh}\nalwaysApply: false\n---\n\n${instructions}\n\n${output}\n`;
  }

  if (target.startsWith("claude-code")) {
    return `---\nname: ${path.basename(skillDir)}\ndescription: ${descriptionEn} ${descriptionZh}\n---\n\n${instructions}\n\n${output}\n`;
  }

  if (target.startsWith("codex")) {
    return `# ${name}\n\nID: ${id}\nVisibility: ${visibility}\n\n${description}\n\n${instructions}\n\n${output}\n`;
  }

  return `# ${name}\n\n- ID: ${id}\n- Visibility: ${visibility}\n\n${description}\n\n${instructions}\n\n${output}\n`;
}

export function discoverCanonicalSkillDirs(directory = packsDir) {
  return discoverPackRoots(directory).flatMap((packRoot) =>
    discoverActivePackSkills(packRoot).map((slug) => path.join(packRoot, "skills", slug)),
  );
}

function buildTarget(target) {
  const locale = target.endsWith("en") ? "en" : "zh-CN";
  const outDir = path.join(distDir, target);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const workflowRegistry = path.join(packsDir, "engineering", "repo-doctor", "workflows.yaml");
  if (existsSync(workflowRegistry)) copyFileSync(workflowRegistry, path.join(outDir, "workflows.yaml"));

  const skillDirs = discoverCanonicalSkillDirs(packsDir);

  if (target.startsWith("claude-code")) {
    for (const skillDir of skillDirs) {
      const skillName = path.basename(skillDir);
      const skillOutDir = path.join(outDir, ".claude", "skills", skillName);
      mkdirSync(skillOutDir, { recursive: true });
      writeFileSync(path.join(skillOutDir, "SKILL.md"), renderSkill(skillDir, locale, target));
      const packRoot = path.dirname(path.dirname(skillDir));
      copyDirectoryContents(path.join(packRoot, "references"), path.join(skillOutDir, "references"));
      copyDirectoryContents(path.join(skillDir, "references"), path.join(skillOutDir, "references"));
      copyDirectoryContents(path.join(skillDir, "assets"), path.join(skillOutDir, "assets"));
      copyDirectoryContents(path.join(skillDir, "scripts"), path.join(skillOutDir, "scripts"));
    }
  } else if (target.startsWith("cursor")) {
    const rulesDir = path.join(outDir, ".cursor", "rules");
    mkdirSync(rulesDir, { recursive: true });
    for (const skillDir of skillDirs) {
      const skillName = path.basename(skillDir);
      writeFileSync(path.join(rulesDir, `${skillName}.mdc`), renderSkill(skillDir, locale, target));
      copyFlatResources(skillDir, rulesDir);
    }
  } else if (target.startsWith("codex")) {
    const sections = skillDirs.map((skillDir) => renderSkill(skillDir, locale, target));
    writeFileSync(
      path.join(outDir, "AGENTS.md"),
      `# Generated Codex Skills\n\nThis file was generated from canonical skills under packs/.\n\n${sections.join("\n\n---\n\n")}`
    );
    for (const skillDir of skillDirs) copyFlatResources(skillDir, outDir);
  } else {
    for (const skillDir of skillDirs) {
      const outName = `${path.basename(skillDir)}.md`;
      writeFileSync(path.join(outDir, outName), renderSkill(skillDir, locale, target));
      copyFlatResources(skillDir, outDir);
    }
  }

  writeFileSync(
    path.join(outDir, "README.md"),
    `# ${target}\n\nGenerated from canonical skills under packs/.\n\n- Generic, Qwen, and Kimi targets contain copyable Markdown prompts.\n- Codex targets contain AGENTS.md.\n- Claude Code targets contain .claude/skills/<skill-name>/SKILL.md.\n- Cursor targets contain .cursor/rules/<skill-name>.mdc.\n\nGenerated resources are copied beside the platform prompts when applicable.\n`
  );
  console.log(`Built ${target} with ${skillDirs.length} skills.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  mkdirSync(distDir, { recursive: true });
  for (const target of targets) buildTarget(target);
}
