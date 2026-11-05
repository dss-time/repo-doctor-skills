import { credentialFindings } from "./credential-findings.mjs";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { compareNames, walkFiles } from "./deterministic-files.mjs";
import { permissionRiskIssues } from "./skill-metadata.mjs";
import { discoverActivePackSkills } from "./sync-pack-plugin.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const root = process.cwd();
const packsDir = path.join(root, "packs");

const requiredFiles = [
  "skill.yaml",
  "instructions.en.md",
  "instructions.zh-CN.md",
  "output.en.md",
  "output.zh-CN.md",
  "examples.en.md",
  "examples.zh-CN.md",
  "tests/case-001.en.yaml",
  "tests/case-001.zh-CN.yaml"
];

const requiredMetadata = [
  "id",
  "name",
  "category",
  "visibility",
  "version",
  "status",
  "default_locale",
  "supported_locales",
  "description",
  "triggers",
  "tool_requirements",
  "permissions",
  "risk_level",
  "output_schema",
  "localization"
];

const sensitiveTerms = [
  "买入",
  "卖出",
  "持有",
  "满仓",
  "清仓",
  "股票池",
  "选股",
  "投资策略",
  "技术指标组合",
  "买入信号",
  "卖出信号",
  "稳赚",
  "保证收益",
  "估值权重",
  "私有策略",
  "internal-only",
  "private strategy"
];

const pluginPacks = {
  "repo-doctor": ["engineering", "repo-doctor"],
  "productivity-toolkit": ["productivity", "productivity-toolkit"],
  "skill-maintainer": ["engineering", "skill-maintainer"],
};
const pluginSkills = Object.fromEntries(
  Object.entries(pluginPacks).map(([plugin, segments]) => [
    plugin,
    discoverActivePackSkills(path.join(packsDir, ...segments)),
  ]),
);
const conditionallyWritableReviewSkills = new Set();

function walk(dir, predicate, results = []) {
  return walkFiles(dir, predicate, results);
}

function validateSkill(skillDir) {
  const errors = [];
  const rel = path.relative(root, skillDir);

  for (const file of requiredFiles) {
    const target = path.join(skillDir, file);
    if (!existsSync(target)) errors.push(`${rel}: missing ${file}`);
  }

  const yamlPath = path.join(skillDir, "skill.yaml");
  if (!existsSync(yamlPath)) return errors;

  const yaml = readFileSync(yamlPath, "utf8");
  let metadata;
  try {
    metadata = parseYamlSubset(yaml);
  } catch (error) {
    errors.push(`${rel}: skill.yaml YAML parse error: ${error.message}`);
    return errors;
  }
  for (const field of requiredMetadata) {
    if (!Object.hasOwn(metadata, field)) {
      errors.push(`${rel}: skill.yaml missing ${field}`);
    }
  }

  const visibility = metadata.visibility;
  const id = metadata.id;
  const version = metadata.version;
  const status = metadata.status;
  if (!/^[a-z0-9]+(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/.test(id)) {
    errors.push(`${rel}: id must use a lowercase dot namespace`);
  }
  if (!/^\d+\.\d+\.\d+$/.test(version)) errors.push(`${rel}: version must be semantic x.y.z`);
  if (!["draft", "beta", "stable", "deprecated"].includes(status)) errors.push(`${rel}: invalid status ${status}`);
  if (!visibility) errors.push(`${rel}: skill.yaml must declare visibility`);
  if (visibility && visibility !== "public") {
    errors.push(`${rel}: visibility must be public in this repository`);
  }

  if (!Array.isArray(metadata.supported_locales) || !metadata.supported_locales.includes("en")) {
    errors.push(`${rel}: supported_locales must include en`);
  }
  if (!Array.isArray(metadata.supported_locales) || !metadata.supported_locales.includes("zh-CN")) {
    errors.push(`${rel}: supported_locales must include zh-CN`);
  }

  for (const permission of [
    "read_files",
    "write_files",
    "run_shell_commands",
    "access_network",
    "destructive_actions_allowed"
  ]) {
    if (typeof metadata.permissions?.[permission] !== "boolean") {
      errors.push(`${rel}: permissions.${permission} must be explicitly true or false`);
    }
  }

  const permissionAudit = permissionRiskIssues(metadata);
  for (const issue of permissionAudit.issues) errors.push(`${rel}: ${issue.message}`);

  const skillName = path.basename(skillDir);
  if (skillName.includes("review") && metadata.permissions?.write_files === true && !conditionallyWritableReviewSkills.has(skillName)) {
    errors.push(`${rel}: review skills must not modify files by default`);
  }

  if (visibility === "public") {
    const files = walk(skillDir, () => true);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const finding of credentialFindings(text)) {
        const message = `${path.relative(root, file)}:${finding.line}: ${finding.kind}; inspect locally without disclosing values`;
        if (finding.severity === "error") errors.push(message);
        else errors.push(`Unresolved credential finding: ${message}; replace examples with explicit synthetic placeholders or remove real credentials`);
      }
      for (const term of sensitiveTerms) {
        if (text.toLowerCase().includes(term.toLowerCase())) {
          errors.push(`${path.relative(root, file)}: public skill contains sensitive term "${term}"`);
        }
      }
    }
  }

  return errors;
}

function validatePluginSkill(pluginName, skillName) {
  const errors = [];
  const skillDir = path.join(root, "plugins", pluginName, "skills", skillName);
  const skillPath = path.join(skillDir, "SKILL.md");
  const uiPath = path.join(skillDir, "agents", "openai.yaml");
  if (!existsSync(skillPath)) return [`plugins/${pluginName}/skills/${skillName}: missing SKILL.md`];
  if (!existsSync(uiPath)) errors.push(`plugins/${pluginName}/skills/${skillName}: missing agents/openai.yaml`);
  const content = readFileSync(skillPath, "utf8");
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const keys = [...frontmatter.matchAll(/^([a-zA-Z0-9_-]+):/gm)].map((match) => match[1]);
  if (keys.join(",") !== "name,description") {
    errors.push(`plugins/${pluginName}/skills/${skillName}: frontmatter must contain only name and description`);
  }
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? "";
  if (name !== skillName) errors.push(`plugins/${pluginName}/skills/${skillName}: name must match folder`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    errors.push(`plugins/${pluginName}/skills/${skillName}: name must use lowercase hyphen-case`);
  }
  if (content.split("\n").length > 500) errors.push(`plugins/${pluginName}/skills/${skillName}: SKILL.md exceeds 500 lines`);
  return errors;
}

const skillYamlFiles = walk(packsDir, (file) => path.basename(file) === "skill.yaml");
const skillDirs = skillYamlFiles
  .filter((file) => file.includes(`${path.sep}skills${path.sep}`))
  .map((file) => path.dirname(file));
const errors = skillDirs.flatMap(validateSkill);
for (const [pluginName, skills] of Object.entries(pluginSkills)) {
  for (const skillName of skills) errors.push(...validatePluginSkill(pluginName, skillName));
}
const activeSkillCount = skillDirs.filter((dir) => !dir.includes(`${path.sep}packs${path.sep}_template${path.sep}`)).length;
const templateSkillCount = skillDirs.length - activeSkillCount;

if (skillDirs.length === 0) {
  errors.push("No skills found under packs/");
}

if (errors.length > 0) {
  console.error("Skill validation failed:");
  for (const error of errors.sort(compareNames)) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Skill validation passed for ${activeSkillCount} active skills and ${templateSkillCount} template skills.`);

// Strict YAML parsing and JSON Schema validation run first in validate-yaml-schemas.mjs.
// This file intentionally keeps repository-specific permission and public-boundary checks.
