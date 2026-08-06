import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeRiskLevel } from "./skill-metadata.mjs";
import {
  discoverActivePackSkills,
  discoverPackRoots,
} from "./sync-pack-plugin.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const activePackOrder = [
  "engineering.repo-doctor",
  "productivity.productivity-toolkit",
  "engineering.skill-maintainer",
  "office.document-data-doctor",
];

// Keep this registry aligned with pluginBuilds in build-chatgpt-skills.mjs. The
// canonical Pack metadata currently has no plugin or ChatGPT publication fields.
export const catalogDistributionRegistry = Object.freeze({
  "engineering.repo-doctor": Object.freeze({
    pluginName: "repo-doctor",
    publishPrefix: "rd",
    displayPrefix: "RD",
  }),
  "productivity.productivity-toolkit": Object.freeze({
    pluginName: "productivity-toolkit",
    publishPrefix: "pt",
    displayPrefix: "PT",
  }),
  "engineering.skill-maintainer": Object.freeze({
    pluginName: "skill-maintainer",
    publishPrefix: "sm",
    displayPrefix: "SM",
  }),
});

export const catalogOutputFiles = Object.freeze({
  en: "docs/SKILL_CATALOG.md",
  "zh-CN": "docs/SKILL_CATALOG.zh-CN.md",
});

function readYaml(filename) {
  return parseYamlSubset(readFileSync(filename, "utf8"));
}

function posixRelative(root, filename) {
  return path.relative(root, filename).split(path.sep).join("/");
}

function comparePack(left, right) {
  const leftIndex = activePackOrder.indexOf(left.metadata.id);
  const rightIndex = activePackOrder.indexOf(right.metadata.id);
  const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
  const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
  if (normalizedLeft !== normalizedRight) return normalizedLeft - normalizedRight;
  return left.metadata.id.localeCompare(right.metadata.id, "en");
}

function loadPluginInterface(root, distribution, slug) {
  if (!distribution) return null;
  const pluginRoot = path.join(root, "plugins", distribution.pluginName);
  const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  const interfacePath = path.join(pluginRoot, "skills", slug, "agents", "openai.yaml");
  if (!existsSync(manifestPath)) throw new Error(`missing plugin manifest: ${posixRelative(root, manifestPath)}`);
  if (!existsSync(interfacePath)) throw new Error(`missing plugin UI metadata: ${posixRelative(root, interfacePath)}`);

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.name !== distribution.pluginName) {
    throw new Error(`${posixRelative(root, manifestPath)}: plugin name does not match catalog registry`);
  }
  const interfaceMetadata = readYaml(interfacePath).interface;
  if (!interfaceMetadata?.display_name) {
    throw new Error(`${posixRelative(root, interfacePath)}: missing interface.display_name`);
  }
  return {
    pluginName: distribution.pluginName,
    pluginVersion: manifest.version,
    pluginDisplayName: interfaceMetadata.display_name,
    publishedSlug: `${distribution.publishPrefix}-${slug}`,
    chatGptDisplayName: `${distribution.displayPrefix} · ${interfaceMetadata.display_name}`,
  };
}

function localizedPositiveExample(activationCases, slug, locale) {
  const example = activationCases.find(
    (testCase) => testCase.subject_skill === slug
      && testCase.expected_skill === slug
      && testCase.kind === "positive"
      && testCase.locale === locale,
  );
  if (!example) throw new Error(`missing ${locale} positive activation example for ${slug}`);
  return example.input;
}

function localizedNotUseExample(activationCases, slug, locale) {
  const outgoing = activationCases.find(
    (testCase) => testCase.subject_skill === slug
      && testCase.locale === locale
      && testCase.expected_skill !== slug,
  );
  const incoming = activationCases.find(
    (testCase) => testCase.locale === locale
      && testCase.expected_skill !== slug
      && (testCase.must_not_trigger ?? []).includes(slug),
  );
  const example = outgoing ?? incoming;
  if (!example) throw new Error(`missing ${locale} not-use activation example for ${slug}`);
  return { input: example.input, expectedSkill: example.expected_skill };
}

function activationNeighbors(skill, activationCases, activeSlugs) {
  const neighbors = new Set();
  for (const testCase of activationCases) {
    if (testCase.subject_skill !== skill.slug) continue;
    if (activeSlugs.has(testCase.expected_skill) && testCase.expected_skill !== skill.slug) {
      neighbors.add(testCase.expected_skill);
    }
    for (const candidate of testCase.must_not_trigger ?? []) {
      if (activeSlugs.has(candidate) && candidate !== skill.slug) neighbors.add(candidate);
    }
  }

  const descriptions = `${skill.metadata.description.en}\n${skill.metadata.description["zh-CN"]}`;
  for (const candidate of activeSlugs) {
    if (candidate !== skill.slug && descriptions.includes(candidate)) neighbors.add(candidate);
  }
  return neighbors;
}

export function collectCatalogModel(root = repositoryRoot) {
  const project = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const packsRoot = path.join(root, "packs");
  const activationPath = path.join(root, "tests", "skill-quality", "activation-cases.json");
  const activationCases = JSON.parse(readFileSync(activationPath, "utf8"));
  const packs = discoverPackRoots(packsRoot).map((packRoot) => {
    const metadataPath = path.join(packRoot, "pack.yaml");
    const metadata = readYaml(metadataPath);
    const distribution = catalogDistributionRegistry[metadata.id] ?? null;
    const skills = discoverActivePackSkills(packRoot).map((slug) => {
      const metadataFile = path.join(packRoot, "skills", slug, "skill.yaml");
      const metadata = readYaml(metadataFile);
      const risk = normalizeRiskLevel(metadata.risk_level);
      if (risk.status !== "valid") {
        throw new Error(`${posixRelative(root, metadataFile)}: invalid risk_level (${risk.status})`);
      }
      return {
        slug,
        metadata,
        metadataPath: posixRelative(root, metadataFile),
        interface: loadPluginInterface(root, distribution, slug),
        examples: {
          en: localizedPositiveExample(activationCases, slug, "en"),
          "zh-CN": localizedPositiveExample(activationCases, slug, "zh-CN"),
          notUse: {
            en: localizedNotUseExample(activationCases, slug, "en"),
            "zh-CN": localizedNotUseExample(activationCases, slug, "zh-CN"),
          },
        },
        risk: risk.value,
        neighbors: [],
      };
    });
    return {
      metadata,
      metadataPath: posixRelative(root, metadataPath),
      distribution,
      skills,
    };
  }).sort(comparePack);

  const skills = packs.flatMap((pack) => pack.skills);
  const activeSlugs = new Set(skills.map((skill) => skill.slug));
  if (activeSlugs.size !== skills.length) throw new Error("active Skill slugs must be unique across Packs");
  const order = new Map(skills.map((skill, index) => [skill.slug, index]));
  for (const skill of skills) {
    skill.neighbors = [...activationNeighbors(skill, activationCases, activeSlugs)]
      .sort((left, right) => order.get(left) - order.get(right));
  }

  const distributedSkills = skills.filter((skill) => skill.interface !== null);
  return {
    projectVersion: project.version,
    packs,
    skills,
    counts: {
      packs: packs.length,
      skills: skills.length,
      pluginSkills: distributedSkills.length,
      regularOnlySkills: skills.length - distributedSkills.length,
      activationCases: activationCases.length,
    },
  };
}

function yesNo(value, locale) {
  if (locale === "zh-CN") return value ? "是" : "否";
  return value ? "yes" : "no";
}

function renderPermissions(skill, locale) {
  const permissions = skill.metadata.permissions;
  if (locale === "zh-CN") {
    return [
      `读取文件=${yesNo(permissions.read_files, locale)}`,
      `写入文件=${yesNo(permissions.write_files, locale)}`,
      `运行 shell=${yesNo(permissions.run_shell_commands, locale)}`,
      `访问网络=${yesNo(permissions.access_network, locale)}`,
      `允许破坏性操作=${yesNo(permissions.destructive_actions_allowed, locale)}`,
    ].join("；");
  }
  return [
    `read files=${yesNo(permissions.read_files, locale)}`,
    `write files=${yesNo(permissions.write_files, locale)}`,
    `run shell=${yesNo(permissions.run_shell_commands, locale)}`,
    `access network=${yesNo(permissions.access_network, locale)}`,
    `destructive actions=${yesNo(permissions.destructive_actions_allowed, locale)}`,
  ].join("; ");
}

function renderTools(skill) {
  return Object.entries(skill.metadata.tool_requirements)
    .map(([name, value]) => `${name}=${value}`)
    .join(", ");
}

function renderDistribution(skill, locale) {
  if (!skill.interface) {
    return locale === "zh-CN"
      ? "当前未配置独立插件 Skill 或 ChatGPT ZIP；它仍会进入常规跨平台构建产物。"
      : "No standalone plugin Skill or ChatGPT ZIP is currently configured; it is still included in the regular cross-platform build outputs.";
  }
  const plugin = `\`${skill.interface.pluginName}\` v${skill.interface.pluginVersion} / ${skill.interface.pluginDisplayName}`;
  const archive = `\`dist/chatgpt-skills/${skill.interface.publishedSlug}.zip\` / ${skill.interface.chatGptDisplayName}`;
  return locale === "zh-CN"
    ? `插件：${plugin}；ChatGPT ZIP：${archive}（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）`
    : `Plugin: ${plugin}; ChatGPT ZIP: ${archive} (the ZIP does not embed version/status; source and drift checks establish consistency)`;
}

function renderSkill(skill, locale) {
  const zh = locale === "zh-CN";
  const name = `${skill.metadata.name.en}（${skill.metadata.name["zh-CN"]}）`;
  const neighbors = skill.neighbors.length
    ? skill.neighbors.map((slug) => `\`${slug}\``).join(zh ? "、" : ", ")
    : (zh ? "无" : "none");
  const notUse = skill.examples.notUse[locale];
  const notUseRoute = notUse.expectedSkill
    ? `\`${notUse.expectedSkill}\``
    : (zh ? "当前没有匹配的仓库 Skill；停止并说明边界" : "no matching repository Skill; stop and state the boundary");
  const lines = [
    `### \`${skill.slug}\` — ${name}`,
    "",
    zh
      ? `- **Canonical 元数据：** \`${skill.metadataPath}\``
      : `- **Canonical metadata:** \`${skill.metadataPath}\``,
    zh
      ? `- **版本 / 状态 / 风险：** \`${skill.metadata.version}\` / \`${skill.metadata.status}\` / \`${skill.risk}\``
      : `- **Version / status / risk:** \`${skill.metadata.version}\` / \`${skill.metadata.status}\` / \`${skill.risk}\``,
    zh
      ? `- **调用标识：** \`${skill.slug}\``
      : `- **Invocation identifier:** \`${skill.slug}\``,
    zh
      ? `- **Canonical 用途与边界：** ${skill.metadata.description[locale]}`
      : `- **Canonical purpose and boundary:** ${skill.metadata.description[locale]}`,
    zh
      ? `- **适合使用的例子：** ${skill.examples[locale]}`
      : `- **Use example:** ${skill.examples[locale]}`,
    zh
      ? `- **不应使用的例子：** ${notUse.input} → 应转给 ${notUseRoute}`
      : `- **Do-not-use example:** ${notUse.input} → route to ${notUseRoute}`,
    zh
      ? `- **声明权限：** ${renderPermissions(skill, locale)}`
      : `- **Declared permissions:** ${renderPermissions(skill, locale)}`,
    zh
      ? `- **工具需求：** ${renderTools(skill)}`
      : `- **Tool requirements:** ${renderTools(skill)}`,
    zh
      ? `- **分发：** ${renderDistribution(skill, locale)}`
      : `- **Distribution:** ${renderDistribution(skill, locale)}`,
    zh
      ? `- **Activation contract 相邻 Skill：** ${neighbors}`
      : `- **Activation-contract neighbors:** ${neighbors}`,
    "",
  ];
  return lines.join("\n");
}

function renderPack(pack, index, locale) {
  const zh = locale === "zh-CN";
  const name = `${pack.metadata.name.en}（${pack.metadata.name["zh-CN"]}）`;
  const lines = [
    `## ${index + 1}. ${name}`,
    "",
    zh
      ? `- **Pack ID：** \`${pack.metadata.id}\``
      : `- **Pack ID:** \`${pack.metadata.id}\``,
    zh
      ? `- **Canonical：** \`${pack.metadataPath}\``
      : `- **Canonical:** \`${pack.metadataPath}\``,
    zh
      ? `- **Active Skill：** ${pack.skills.length}`
      : `- **Active Skills:** ${pack.skills.length}`,
    zh
      ? `- **Pack 版本 / 状态：** \`${pack.metadata.version}\` / \`${pack.metadata.status}\``
      : `- **Pack version / status:** \`${pack.metadata.version}\` / \`${pack.metadata.status}\``,
    zh
      ? `- **Canonical Pack 说明：** ${pack.metadata.description[locale]}`
      : `- **Canonical Pack description:** ${pack.metadata.description[locale]}`,
    zh
      ? `- **实际 active 清单：** ${pack.skills.map((skill) => `\`${skill.slug}\``).join("、")}`
      : `- **Actual active list:** ${pack.skills.map((skill) => `\`${skill.slug}\``).join(", ")}`,
    "",
    ...pack.skills.map((skill) => renderSkill(skill, locale)),
  ];
  return lines.join("\n");
}

export function renderCatalog(model, locale) {
  if (!Object.hasOwn(catalogOutputFiles, locale)) throw new Error(`unsupported catalog locale: ${locale}`);
  const zh = locale === "zh-CN";
  const title = zh ? "Repo Doctor Skills 完整目录" : "Repo Doctor Skills Complete Catalog";
  const generatedNotice = zh
    ? "> 此文件由 `scripts/generate-skill-catalog.mjs` 基于 `packs/`、activation contracts 和插件 UI 元数据确定性生成。请勿手工编辑；运行 `node scripts/generate-skill-catalog.mjs` 更新。"
    : "> This file is deterministically generated by `scripts/generate-skill-catalog.mjs` from `packs/`, activation contracts, and plugin UI metadata. Do not edit it by hand; run `node scripts/generate-skill-catalog.mjs` to update it.";
  const overview = zh
    ? [
        `本目录对应项目版本 \`${model.projectVersion}\` 的当前工作树，收录 ${model.counts.packs} 个 active Pack 中的 ${model.counts.skills} 个 active Skill。当前其中 ${model.counts.pluginSkills} 个配置了插件兼容产物和独立 ChatGPT ZIP，${model.counts.regularOnlySkills} 个仅进入常规跨平台构建产物。相邻 Skill 来自 ${model.counts.activationCases} 条 activation contract 以及 canonical description 中明确提到的 Skill。`,
        "",
        "这里的 **beta** 表示已经可以公开使用并通过当前仓库的 contract、构建和文档验证，但仍需要真实环境反馈。未变化的 Skill 集合具有 317/317 次真实 Codex 调用 PASS 证据，包括核心路由、双语工作流、模式、三态判定和权限边界。`stable` 也只表示成熟度更高，不代表绝对无 Bug。",
        "",
        "权限字段表达 canonical 作者声明的意图，并不保证宿主平台会自动强制执行。实际读写、shell、网络和破坏性操作仍受宿主能力、用户授权和运行时安全控制约束。",
        "",
        "调用示例使用不依赖平台符号的自然语言。Codex、ChatGPT 和其他平台的 `$`、`@` 或自然语言调用差异请见[用户操作手册](USER_MANUAL.zh-CN.md)。",
      ]
    : [
        `This catalog describes the current working tree at project version \`${model.projectVersion}\` and covers ${model.counts.skills} active Skills in ${model.counts.packs} active Packs. Of these, ${model.counts.pluginSkills} currently have plugin-compatible distributions and standalone ChatGPT ZIPs, while ${model.counts.regularOnlySkills} are included only in the regular cross-platform build outputs. Neighboring Skills are derived from ${model.counts.activationCases} activation-contract cases and explicit Skill references in canonical descriptions.`,
        "",
        "Here, **beta** means the content is ready for public use and has passed the repository's current contract, build, and documentation checks, while still requiring real-environment feedback. The unchanged Skill corpus has 317/317 PASS evidence from real Codex calls across core routing, bilingual workflows, modes, prototype verdicts, and permission boundaries. `stable` would indicate greater maturity, not an absolute absence of bugs.",
        "",
        "Permission fields express declared canonical intent; they do not guarantee enforcement by a host platform. Actual file, shell, network, and destructive-operation access remains subject to host capabilities, user authorization, and runtime safety controls.",
        "",
        "Examples use platform-neutral natural language. See the [User Manual](USER_MANUAL.md) for `$`, `@`, and natural-language invocation differences across Codex, ChatGPT, and other platforms.",
      ];
  const lines = [
    `# ${title}`,
    "",
    generatedNotice,
    "",
    ...overview,
    "",
    zh ? "## 字段说明" : "## How to read each entry",
    "",
    zh
      ? "- **Canonical 用途与边界** 原样复用 canonical 双语 description；**适合使用 / 不应使用的例子** 来自双语 activation contract，并明确显示应转交的 Skill。"
      : "- **Canonical purpose and boundary** reproduces the localized canonical description; **use / do-not-use examples** come from bilingual activation contracts and show the expected handoff.",
    zh
      ? "- **Activation contract 相邻 Skill** 是当前 Skill 的测试用例会转交、明确排除，或 description 明确引用的 Skill；它不是对所有可能路由关系的推测。"
      : "- **Activation-contract neighbors** are Skills to which the current Skill's cases route, explicitly exclude, or name in its description; this is not a guess at every possible routing relationship.",
    zh
      ? "- **分发** 列出实际插件 UI 元数据和 ChatGPT 发布前缀；没有独立插件/ZIP 不代表 canonical Skill 不存在。"
      : "- **Distribution** lists actual plugin UI metadata and ChatGPT publication prefixes; absence of a standalone plugin/ZIP does not mean the canonical Skill is missing.",
    zh
      ? "- 项目、Pack、插件和 Skill 使用分层 SemVer；项目版本不要求等于组件版本，Pack 与对应插件必须一致，Skill 可以独立演进。详见[版本政策](VERSIONING.zh-CN.md)。"
      : "- Project, Pack, plugin, and Skill SemVer are layered. The project version need not equal component versions; a Pack must match its plugin, while Skills may evolve independently. See the [versioning policy](VERSIONING.md).",
    "",
    ...model.packs.map((pack, index) => renderPack(pack, index, locale)),
  ];
  return `${lines.join("\n").trimEnd()}\n`;
}

export function generatedCatalogs(model = collectCatalogModel()) {
  return Object.fromEntries(
    Object.entries(catalogOutputFiles).map(([locale, filename]) => [
      filename,
      renderCatalog(model, locale),
    ]),
  );
}

export function checkCatalogs(root = repositoryRoot) {
  const mismatches = [];
  for (const [filename, expected] of Object.entries(generatedCatalogs(collectCatalogModel(root)))) {
    const target = path.join(root, filename);
    if (!existsSync(target)) mismatches.push(`${filename}: missing`);
    else if (readFileSync(target, "utf8") !== expected) mismatches.push(`${filename}: stale`);
  }
  return mismatches;
}

function parseArguments(argv) {
  if (argv.length === 0) return { check: false };
  if (argv.length === 1 && argv[0] === "--check") return { check: true };
  throw new Error(`unknown argument(s): ${argv.join(" ")}`);
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.check) {
    const mismatches = checkCatalogs();
    if (mismatches.length > 0) {
      for (const mismatch of mismatches) console.error(mismatch);
      process.exitCode = 1;
      return;
    }
    console.log("Skill catalogs are current.");
    return;
  }

  const catalogs = generatedCatalogs();
  for (const [filename, content] of Object.entries(catalogs)) {
    writeFileSync(path.join(repositoryRoot, filename), content);
    console.log(`Generated ${filename}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
