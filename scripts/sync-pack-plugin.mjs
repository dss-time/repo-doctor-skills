import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  compareNames,
  copyDirectoryContents,
  sortedDirectoryEntries,
} from "./deterministic-files.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const activeSkillStatuses = new Set(["draft", "beta", "stable"]);
const knownSkillStatuses = new Set([...activeSkillStatuses, "deprecated"]);

function block(yaml, key) {
  return yaml.match(new RegExp(`^${key}:\\n([\\s\\S]*?)(?=^[a-zA-Z_][a-zA-Z0-9_]*:|\\Z)`, "m"))?.[1] ?? "";
}

function localized(yaml, key, locale) {
  return block(yaml, key).match(new RegExp(`^\\s{2}${locale}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
}

function yamlString(value) {
  return JSON.stringify(value);
}

export function executionContract(execution, locale) {
  if (!execution) return "";
  const defaultMode = execution.default_mode;
  const implicit = execution.allow_implicit_invocation;
  if (locale === "zh-CN") {
    return [
      "## 执行契约",
      "",
      `默认使用 \`${defaultMode}\`；${implicit ? "允许边界明确的自然语言隐式调用" : "仅允许用户显式调用"}。`,
      "默认完成一个主任务。用户已授权完整流程时，在各 Skill 权限内连续完成；Router 仍只推荐。新重大决策或超出授权时暂停，不重复索取已有授权。",
      "按实际风险选择验证；安全、生产、迁移、发布等高风险工作使用 `audit`。模式不明确时才读取 `references/execution-modes.zh-CN.md`。",
    ].join("\n");
  }
  return [
    "## Execution Contract",
    "",
    `Default to \`${defaultMode}\`; ${implicit ? "bounded natural-language invocation is allowed" : "explicit invocation is required"}.`,
    "Complete one primary task by default. Continue an authorized end-to-end workflow within each Skill's permissions; Router remains recommendation-only. Pause for new material decisions or scope, not authorization already given.",
    "Validate according to actual risk; security, production, migrations, releases and other high-risk work use `audit`. Read `references/execution-modes.en.md` only when mode selection is unclear.",
  ].join("\n");
}

export function discoverActivePackSkills(packRoot) {
  const packPath = path.join(packRoot, "pack.yaml");
  const pack = parseYamlSubset(readFileSync(packPath, "utf8"));
  if (!Array.isArray(pack.skills)) throw new Error(`${packPath}: skills must be a sequence`);
  if (new Set(pack.skills).size !== pack.skills.length) throw new Error(`${packPath}: skills must not contain duplicates`);

  const packSkills = path.join(packRoot, "skills");
  const actual = sortedDirectoryEntries(packSkills)
    .filter((entry) => entry.isDirectory() && existsSync(path.join(packSkills, entry.name, "skill.yaml")))
    .map((entry) => entry.name)
    .sort(compareNames);
  const metadata = new Map();

  for (const slug of actual) {
    const skillPath = path.join(packSkills, slug, "skill.yaml");
    const skill = parseYamlSubset(readFileSync(skillPath, "utf8"));
    if (!knownSkillStatuses.has(skill.status)) throw new Error(`${skillPath}: unsupported status ${skill.status}`);
    metadata.set(slug, skill);
  }
  for (const slug of pack.skills) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${packPath}: invalid skill slug ${slug}`);
    if (!metadata.has(slug)) throw new Error(`${packPath}: lists missing canonical skill ${slug}`);
  }

  const activeActual = actual.filter((slug) => activeSkillStatuses.has(metadata.get(slug).status));
  const activeListed = pack.skills.filter((slug) => activeSkillStatuses.has(metadata.get(slug).status));
  const unlistedActive = activeActual.filter((slug) => !activeListed.includes(slug));
  if (unlistedActive.length > 0) {
    throw new Error(`${packPath}: does not list active canonical skill(s): ${unlistedActive.join(", ")}`);
  }
  return activeListed;
}

export function discoverPackRoots(directory, roots = []) {
  if (!existsSync(directory)) return roots;
  for (const entry of sortedDirectoryEntries(directory)) {
    if (!entry.isDirectory() || entry.name === "_template") continue;
    const candidate = path.join(directory, entry.name);
    if (existsSync(path.join(candidate, "pack.yaml"))) roots.push(candidate);
    else discoverPackRoots(candidate, roots);
  }
  return roots;
}

export function syncPackPlugin({ packRoot, pluginRoot, skills, interfaces, prune = false, rebuild = false, log = true }) {
  mkdirSync(pluginRoot, { recursive: true });
  const packMetadata = parseYamlSubset(readFileSync(path.join(packRoot, "pack.yaml"), "utf8"));
  const pluginManifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  if (existsSync(pluginManifestPath)) {
    const pluginManifest = JSON.parse(readFileSync(pluginManifestPath, "utf8"));
    pluginManifest.version = packMetadata.version;
    writeFileSync(pluginManifestPath, `${JSON.stringify(pluginManifest, null, 2)}\n`);
  }
  const workflowSource = path.join(packRoot, "workflows.yaml");
  const workflowDestination = path.join(pluginRoot, "workflows.yaml");
  if (existsSync(workflowSource)) copyFileSync(workflowSource, workflowDestination);
  else rmSync(workflowDestination, { force: true });

  const packSkills = path.join(packRoot, "skills");
  const pluginSkills = path.join(pluginRoot, "skills");
  const orderedSkills = skills ?? discoverActivePackSkills(packRoot);
  const expected = new Set(orderedSkills);
  const plans = orderedSkills.map((slug) => {
    if (!interfaces[slug]) throw new Error(`Missing plugin interface metadata for ${slug}`);
    const source = path.join(packSkills, slug);
    const metadataSource = readFileSync(path.join(source, "skill.yaml"), "utf8");
    const metadata = parseYamlSubset(metadataSource);
    const normalizeReferences = (content) => content.replaceAll("../../references/", "references/");
    return {
      slug,
      source,
      interface: interfaces[slug],
      execution: metadata.execution,
      allowImplicitInvocation: metadata.execution?.allow_implicit_invocation,
      nameEn: localized(metadataSource, "name", "en"),
      nameZh: localized(metadataSource, "name", "zh-CN"),
      descriptionEn: localized(metadataSource, "description", "en"),
      descriptionZh: localized(metadataSource, "description", "zh-CN"),
      instructionsEn: normalizeReferences(readFileSync(path.join(source, "instructions.en.md"), "utf8").trim()),
      instructionsZh: normalizeReferences(readFileSync(path.join(source, "instructions.zh-CN.md"), "utf8").trim()),
      outputEn: readFileSync(path.join(source, "output.en.md"), "utf8").trim(),
      outputZh: readFileSync(path.join(source, "output.zh-CN.md"), "utf8").trim(),
    };
  });
  mkdirSync(pluginSkills, { recursive: true });
  if (prune) {
    for (const entry of sortedDirectoryEntries(pluginSkills)) {
      if (entry.isDirectory() && !expected.has(entry.name)) {
        rmSync(path.join(pluginSkills, entry.name), { recursive: true, force: true });
      }
    }
  }

  for (const plan of plans) {
    const {
      slug,
      source,
      interface: pluginInterface,
      execution,
      allowImplicitInvocation,
      nameEn,
      nameZh,
      descriptionEn,
      descriptionZh,
      instructionsEn,
      instructionsZh,
      outputEn,
      outputZh,
    } = plan;
    const destination = path.join(pluginSkills, slug);
    const agents = path.join(destination, "agents");
    if (rebuild) rmSync(destination, { recursive: true, force: true });
    mkdirSync(agents, { recursive: true });

    writeFileSync(
      path.join(destination, "SKILL.md"),
      `---\nname: ${slug}\ndescription: ${yamlString(`${descriptionEn} ${descriptionZh}`)}\n---\n\n# ${nameEn}（${nameZh}）\n\nUse the section matching the user's language. 使用与用户输入语言一致的章节。\n\n${execution ? `${executionContract(execution, "en")}\n\n` : ""}${instructionsEn}\n\n${outputEn}\n\n---\n\n${execution ? `${executionContract(execution, "zh-CN")}\n\n` : ""}${instructionsZh}\n\n${outputZh}\n`,
    );
    writeFileSync(
      path.join(agents, "openai.yaml"),
      [
        "interface:",
        `  display_name: ${yamlString(pluginInterface.displayName ?? `${nameEn}（${nameZh}）`)}`,
        `  short_description: ${yamlString(pluginInterface.shortDescription)}`,
        `  default_prompt: ${yamlString(pluginInterface.defaultPrompt)}`,
        ...(typeof allowImplicitInvocation === "boolean"
          ? [
              "policy:",
              `  allow_implicit_invocation: ${allowImplicitInvocation}`,
            ]
          : []),
        "",
      ].join("\n"),
    );

    for (const resourceName of ["references", "assets", "scripts"]) {
      const destinationResource = path.join(destination, resourceName);
      rmSync(destinationResource, { recursive: true, force: true });
      copyDirectoryContents(path.join(packRoot, resourceName), destinationResource);
      copyDirectoryContents(path.join(source, resourceName), destinationResource);
    }
    if (log) console.log(`Synced ${path.relative(process.cwd(), destination)}`);
  }
  return orderedSkills;
}
