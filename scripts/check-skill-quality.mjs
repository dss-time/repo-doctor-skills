import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  interfaceFor as chatGptInterfaceFor,
  frontmatterFieldSource,
  renderInterface as renderChatGptInterface,
  renderSkill as renderChatGptSkill,
  splitSkillDocument,
} from "./build-chatgpt-skills.mjs";
import {
  compareNames,
  sortedDirectoryEntries,
  toPosixPath,
  walkFiles,
} from "./deterministic-files.mjs";
import { permissionRiskIssues } from "./skill-metadata.mjs";
import { discoverActivePackSkills } from "./sync-pack-plugin.mjs";
import { syncRepoDoctorPlugin } from "./sync-repo-doctor-plugin.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? "" : args[index + 1] ?? "";
};
const root = path.resolve(valueAfter("--root") || process.cwd());
const singlePluginSkill = valueAfter("--plugin-skill-dir");
const checkDist = args.includes("--check-dist");
const errors = [];
const warnings = [];
const requiredCanonicalFiles = [
  "skill.yaml",
  "instructions.en.md",
  "instructions.zh-CN.md",
  "output.en.md",
  "output.zh-CN.md",
  "examples.en.md",
  "examples.zh-CN.md",
  "tests/case-001.en.yaml",
  "tests/case-001.zh-CN.yaml",
];
const forbiddenSkillFiles = new Set([
  "README.md",
  "CHANGELOG.md",
  "INSTALLATION_GUIDE.md",
  "QUICK_REFERENCE.md",
]);
const resourcePattern = /(?:\.\.\/\.\.\/)?(?:references|assets|scripts)\/[A-Za-z0-9._/-]+/g;
const secretPatterns = [
  { label: "private key", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/ },
  { label: "OpenAI-style key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: "machine-specific Unix path", pattern: /\/(?:Users|home)\/[A-Za-z0-9._-]+\// },
  { label: "machine-specific Windows path", pattern: /\b[A-Za-z]:\\Users\\[^\\\s]+\\/ },
];
const scaffoldPlaceholders = [
  "Describe what this public-safe skill does.",
  "描述这个公开安全 Skill 的用途。",
  "/ 待本地化",
  "Describe the workflow this skill should follow.",
  "描述这个 Skill 应遵循的工作流程。",
];

function walk(dir, predicate = () => true, results = []) {
  return walkFiles(dir, predicate, results);
}

function relative(file) {
  return path.relative(root, file) || ".";
}

function treeEntries(dir, relativeRoot = "", entries = []) {
  if (!existsSync(dir)) return entries;
  for (const entry of sortedDirectoryEntries(dir)) {
    const relativePath = toPosixPath(path.join(relativeRoot, entry.name));
    const absolutePath = path.join(dir, entry.name);
    entries.push({ kind: entry.isDirectory() ? "directory" : "file", relativePath, absolutePath });
    if (entry.isDirectory()) treeEntries(absolutePath, relativePath, entries);
  }
  return entries;
}

function auditGeneratedTree(expectedRoot, actualRoot, label) {
  if (!existsSync(actualRoot)) {
    errors.push(`${relative(actualRoot)}: missing generated ${label} tree`);
    return;
  }
  const expectedEntries = treeEntries(expectedRoot);
  const actualEntries = treeEntries(actualRoot);
  const expected = new Map(expectedEntries.map((entry) => [`${entry.kind}:${entry.relativePath}`, entry]));
  const actual = new Map(actualEntries.map((entry) => [`${entry.kind}:${entry.relativePath}`, entry]));

  for (const key of expected.keys()) {
    if (!actual.has(key)) errors.push(`${relative(actualRoot)}: canonical/plugin drift, missing ${key}`);
  }
  for (const key of actual.keys()) {
    if (!expected.has(key)) errors.push(`${relative(actualRoot)}: canonical/plugin drift, unexpected ${key}`);
  }
  for (const [key, expectedEntry] of expected) {
    const actualEntry = actual.get(key);
    if (!actualEntry || expectedEntry.kind !== "file") continue;
    if (!readFileSync(expectedEntry.absolutePath).equals(readFileSync(actualEntry.absolutePath))) {
      errors.push(`${relative(actualEntry.absolutePath)}: canonical/plugin drift, generated content differs`);
    }
  }
}

function listBlock(text, key) {
  const block = text.match(new RegExp(`^${key}:\\n((?:\\s+-.*(?:\\n|$))*)`, "m"))?.[1] ?? "";
  return [...block.matchAll(/^\s*-\s*(.+)$/gm)].map((match) => match[1].trim());
}

function cleanResourceReference(reference) {
  return reference.replace(/[)`'",.;:]+$/g, "");
}

function referencedResources(text) {
  return [...text.matchAll(resourcePattern)].map((match) => cleanResourceReference(match[0]));
}

function checkSensitiveContent(file) {
  const text = readFileSync(file, "utf8");
  for (const { label, pattern } of secretPatterns) {
    if (pattern.test(text)) errors.push(`${relative(file)}: contains ${label}`);
  }
}

function checkResourceDepth(reference, owner) {
  const normalized = reference.replace(/^\.\.\/\.\.\//, "");
  const [, ...parts] = normalized.split("/");
  if (parts.length > 1) errors.push(`${owner}: resource references must stay one level deep: ${reference}`);
}

function resolveCanonicalReference(skillDir, reference) {
  return path.resolve(skillDir, reference);
}

function requireContractFragments(file, label, fragments) {
  if (!existsSync(file)) return;
  const content = readFileSync(file, "utf8");
  for (const fragment of fragments) {
    if (!content.includes(fragment)) {
      errors.push(`${relative(file)}: RCA contract missing ${label} fragment: ${fragment}`);
    }
  }
}

function auditBugRootCauseContract(skillDir, metadata) {
  const owner = relative(skillDir);
  const risk = permissionRiskIssues(metadata).risk;
  const metadataRequirements = [
    [metadata.tool_requirements?.filesystem, "read", "tool_requirements.filesystem"],
    [metadata.tool_requirements?.shell, "optional", "tool_requirements.shell"],
    [metadata.tool_requirements?.web, "none", "tool_requirements.web"],
    [metadata.permissions?.read_files, true, "permissions.read_files"],
    [metadata.permissions?.write_files, false, "permissions.write_files"],
    [metadata.permissions?.run_shell_commands, true, "permissions.run_shell_commands"],
    [metadata.permissions?.access_network, false, "permissions.access_network"],
    [
      metadata.permissions?.destructive_actions_allowed,
      false,
      "permissions.destructive_actions_allowed",
    ],
    [risk.value, "tool_execution", "risk_level.default"],
  ];
  for (const [actual, expected, field] of metadataRequirements) {
    if (actual !== expected) errors.push(`${owner}: RCA contract requires ${field}: ${expected}`);
  }

  requireContractFragments(path.join(skillDir, "instructions.en.md"), "English safety", [
    "## Safe Diagnostic Execution",
    "### Allowed diagnostics",
    "`rg` or equivalent code search",
    "`git status`, `git diff`, `git log`, and `git show`",
    "`package.json`, `Makefile`, CI workflow",
    "narrowest relevant existing test",
    "### Prohibited actions",
    "`rm` or `rmdir`",
    "`git reset`, `git checkout`, `git clean`, `git commit`, or `git push`",
    "`npm install`, `pnpm install`, `yarn add`, `pip install`, `go get`",
    "database migrate, seed, drop, or truncate",
    "deploy, publish, release, or tag",
    "`sudo`, `chmod`, or `chown`",
    "system proxy, VPN, TUN, network routes, system services",
    "production environment",
    "API keys, authentication credential values, or sensitive environment-variable values",
    "`curl | sh`",
    "`kill`, `pkill`, `service restart`",
    "unknown repository script",
    "shell redirection, `tee`, or editor commands",
    "production code",
    "### Test-command gate",
    "### Temporary artifacts and workspace integrity",
    "tracked-file diff",
    "### Evidence status",
    "`Observed`",
    "`Reproduced`",
    "`Inferred`",
    "`Unverified`",
    "`Blocked`",
  ]);
  requireContractFragments(path.join(skillDir, "instructions.zh-CN.md"), "Chinese safety", [
    "## 安全诊断执行",
    "### 允许的诊断",
    "`rg` 或等价代码搜索",
    "`git status`、`git diff`、`git log` 和 `git show`",
    "`package.json`、`Makefile`、CI workflow",
    "最小相关现有测试",
    "### 禁止的操作",
    "`rm` 或 `rmdir`",
    "`git reset`、`git checkout`、`git clean`、`git commit` 或 `git push`",
    "`npm install`、`pnpm install`、`yarn add`、`pip install`、`go get`",
    "数据库 migrate、seed、drop 或 truncate",
    "deploy、publish、release 或 tag",
    "`sudo`、`chmod` 或 `chown`",
    "系统代理、VPN、TUN、网络路由、系统服务",
    "生产环境",
    "密钥、令牌、凭据值或敏感环境变量",
    "`curl | sh`",
    "`kill`、`pkill`、`service restart`",
    "未知脚本",
    "shell 重定向、`tee` 或编辑器命令",
    "生产代码",
    "### 测试命令门禁",
    "### 临时产物与工作区完整性",
    "tracked file Diff",
    "### 证据状态",
    "`Observed`",
    "`Reproduced`",
    "`Inferred`",
    "`Unverified`",
    "`Blocked`",
  ]);
  requireContractFragments(path.join(skillDir, "output.en.md"), "English output", [
    "Executed diagnostic commands",
    "Command results",
    "`Observed` / `Reproduced` / `Inferred` / `Unverified` / `Blocked`",
    "Unverified and blocked items",
  ]);
  requireContractFragments(path.join(skillDir, "output.zh-CN.md"), "Chinese output", [
    "已执行的诊断命令",
    "命令结果",
    "`Observed` / `Reproduced` / `Inferred` / `Unverified` / `Blocked`",
    "未验证和阻塞项",
  ]);
}

function auditCanonicalSkill(skillDir, ids, slugs, canonicalNames, packReferences) {
  const owner = relative(skillDir);
  const slug = path.basename(skillDir);
  for (const required of requiredCanonicalFiles) {
    const requiredPath = path.join(skillDir, required);
    if (!existsSync(requiredPath)) errors.push(`${owner}: missing ${required}`);
    else if (!readFileSync(requiredPath, "utf8").trim()) errors.push(`${owner}: ${required} must not be empty`);
  }
  for (const file of walk(skillDir)) {
    if (forbiddenSkillFiles.has(path.basename(file))) errors.push(`${relative(file)}: redundant Skill documentation is forbidden`);
    checkSensitiveContent(file);
    const content = readFileSync(file, "utf8");
    if (scaffoldPlaceholders.some((placeholder) => content.includes(placeholder))) {
      errors.push(`${relative(file)}: unresolved scaffold placeholder`);
    }
  }

  const yamlPath = path.join(skillDir, "skill.yaml");
  if (!existsSync(yamlPath)) return;
  const yaml = readFileSync(yamlPath, "utf8");
  let metadata;
  try {
    metadata = parseYamlSubset(yaml);
  } catch (error) {
    errors.push(`${relative(yamlPath)}: YAML parse error: ${error.message}`);
    return;
  }
  const id = typeof metadata.id === "string" ? metadata.id : "";
  if (!/^[a-z0-9]+(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/.test(id)) errors.push(`${owner}: invalid skill id ${id}`);
  if (!id.endsWith(`.${slug}`)) errors.push(`${owner}: id must end with .${slug}`);
  if (ids.has(id)) errors.push(`${owner}: duplicate skill id ${id}`);
  else ids.set(id, skillDir);
  if (slugs.has(slug)) errors.push(`${owner}: duplicate skill slug ${slug}; flat adapters would collide`);
  else slugs.set(slug, skillDir);
  canonicalNames.set(slug, {
    en: metadata.name?.en ?? "",
    zh: metadata.name?.["zh-CN"] ?? "",
  });

  const permissionAudit = permissionRiskIssues(metadata);
  for (const issue of permissionAudit.issues) errors.push(`${owner}: ${issue.message}`);
  if (slug === "bug-root-cause-analysis") auditBugRootCauseContract(skillDir, metadata);

  const instructionFiles = ["instructions.en.md", "instructions.zh-CN.md"]
    .map((file) => path.join(skillDir, file))
    .filter(existsSync);
  const referenced = new Set();
  for (const file of instructionFiles) {
    const text = readFileSync(file, "utf8");
    for (const reference of referencedResources(text)) {
      checkResourceDepth(reference, relative(file));
      const resolved = resolveCanonicalReference(skillDir, reference);
      referenced.add(resolved);
      if (!existsSync(resolved)) errors.push(`${relative(file)}: broken resource reference ${reference}`);
      if (reference.startsWith("../../references/")) packReferences.add(resolved);
    }
  }
  for (const resourceDir of ["references", "assets", "scripts"]) {
    const resourceRoot = path.join(skillDir, resourceDir);
    const files = walk(resourceRoot);
    if (existsSync(resourceRoot) && files.length === 0) errors.push(`${relative(resourceRoot)}: empty resource directory is forbidden`);
    for (const file of files) {
      if (!referenced.has(path.resolve(file))) errors.push(`${relative(file)}: orphaned resource is not referenced by instructions`);
    }
  }
  const deterministicScripts = walk(path.join(skillDir, "scripts"));
  if (deterministicScripts.length > 0 && walk(path.join(skillDir, "tests")).length <= 2) {
    errors.push(`${owner}: deterministic scripts require additional success, failure, and boundary tests`);
  }
}

function frontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { raw: "", keys: [], name: "" };
  const keys = [...match[1].matchAll(/^([A-Za-z0-9_-]+):/gm)].map((item) => item[1]);
  return {
    raw: match[1],
    keys,
    name: match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? "",
  };
}

function auditPluginSkill(skillDir, expectedName = null) {
  const owner = relative(skillDir);
  const slug = path.basename(skillDir);
  const skillPath = path.join(skillDir, "SKILL.md");
  const uiPath = path.join(skillDir, "agents", "openai.yaml");
  if (!existsSync(skillPath)) {
    errors.push(`${owner}: missing SKILL.md`);
    return;
  }
  const content = readFileSync(skillPath, "utf8");
  const metadata = frontmatter(content);
  if (metadata.keys.join(",") !== "name,description") errors.push(`${relative(skillPath)}: frontmatter must contain only name and description`);
  if (metadata.name !== slug) errors.push(`${relative(skillPath)}: frontmatter name must match folder ${slug}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name)) errors.push(`${relative(skillPath)}: name must be lowercase hyphen-case`);
  if (content.split(/\r?\n/).length > 500) errors.push(`${relative(skillPath)}: exceeds 500 lines`);
  for (const file of walk(skillDir)) {
    if (forbiddenSkillFiles.has(path.basename(file))) errors.push(`${relative(file)}: redundant Skill documentation is forbidden`);
    checkSensitiveContent(file);
  }

  const referenced = new Set();
  for (const reference of referencedResources(content)) {
    checkResourceDepth(reference, relative(skillPath));
    const resolved = path.resolve(skillDir, reference);
    referenced.add(resolved);
    if (!existsSync(resolved)) errors.push(`${relative(skillPath)}: broken resource reference ${reference}`);
  }
  for (const resourceDir of ["references", "assets", "scripts"]) {
    const resourceRoot = path.join(skillDir, resourceDir);
    const files = walk(resourceRoot);
    if (existsSync(resourceRoot) && files.length === 0) errors.push(`${relative(resourceRoot)}: empty plugin resource directory is forbidden`);
    for (const file of files) {
      if (!referenced.has(path.resolve(file))) errors.push(`${relative(file)}: orphaned plugin resource`);
    }
  }

  if (!existsSync(uiPath)) errors.push(`${owner}: missing agents/openai.yaml`);
  else {
    const ui = readFileSync(uiPath, "utf8");
    const displayName = ui.match(/^\s*display_name:\s*(.+)$/m)?.[1] ?? "";
    const shortDescription = ui.match(/^\s*short_description:\s*(.+)$/m)?.[1] ?? "";
    if (!displayName) errors.push(`${relative(uiPath)}: missing display_name`);
    if (!shortDescription) errors.push(`${relative(uiPath)}: missing short_description`);
    else if (shortDescription.replace(/^['"]|['"]$/g, "").length > 80) errors.push(`${relative(uiPath)}: short_description exceeds 80 characters`);
    if (expectedName && (!displayName.includes(expectedName.en) || !/[\u3400-\u9FFF]/u.test(displayName))) {
      errors.push(`${relative(uiPath)}: display_name must include the canonical English name and a Chinese usage label`);
    }
    const prompt = ui.match(/^\s*default_prompt:\s*(.+)$/m)?.[1] ?? "";
    if (!prompt.includes(`$${slug}`)) errors.push(`${relative(uiPath)}: default_prompt must mention $${slug}`);
  }
}

function auditPublishedSkillContent(content, owner, sourceDocument, publishedSlug) {
  let document;
  try {
    document = splitSkillDocument(content);
  } catch (error) {
    errors.push(`${owner}: invalid generated SKILL.md (${error.message})`);
    return;
  }
  if (frontmatterFieldSource(document, "name").trim() !== `name: ${publishedSlug}`) {
    errors.push(`${owner}: generated name must be ${publishedSlug}`);
  }
  if (
    frontmatterFieldSource(document, "description")
    !== frontmatterFieldSource(sourceDocument, "description")
  ) {
    errors.push(`${owner}: generated description differs from synchronized plugin source`);
  }
  if (document.body !== sourceDocument.body) {
    errors.push(`${owner}: generated body differs from synchronized plugin source`);
  }
}

function auditPack(packDir, canonicalSlugs, packReferences) {
  const manifest = path.join(packDir, "pack.yaml");
  if (!existsSync(manifest)) return;
  const text = readFileSync(manifest, "utf8");
  const listed = listBlock(text, "skills");
  const actual = existsSync(path.join(packDir, "skills"))
    ? sortedDirectoryEntries(path.join(packDir, "skills"))
        .filter((entry) => entry.isDirectory() && existsSync(path.join(packDir, "skills", entry.name, "skill.yaml")))
        .map((entry) => entry.name)
    : [];
  for (const slug of listed) {
    if (!actual.includes(slug)) errors.push(`${relative(manifest)}: lists missing skill ${slug}`);
  }
  for (const slug of actual) {
    if (!listed.includes(slug)) errors.push(`${relative(manifest)}: does not list canonical skill ${slug}`);
    canonicalSlugs.add(slug);
  }
  for (const file of walk(path.join(packDir, "references"))) {
    if (!packReferences.has(path.resolve(file))) errors.push(`${relative(file)}: orphaned pack reference`);
  }
  const packResourceRoot = path.join(packDir, "references");
  if (existsSync(packResourceRoot) && walk(packResourceRoot).length === 0) errors.push(`${relative(packResourceRoot)}: empty pack reference directory is forbidden`);
}

function auditManifests() {
  const pluginsRoot = path.join(root, "plugins");
  const marketplacePath = path.join(root, ".agents", "plugins", "marketplace.json");
  if (!existsSync(pluginsRoot) || !existsSync(marketplacePath)) return;
  let marketplace;
  try {
    marketplace = JSON.parse(readFileSync(marketplacePath, "utf8"));
  } catch (error) {
    errors.push(`${relative(marketplacePath)}: invalid JSON (${error.message})`);
    return;
  }
  const entries = new Map((marketplace.plugins ?? []).map((entry) => [entry.name, entry]));
  for (const entry of sortedDirectoryEntries(pluginsRoot).filter((item) => item.isDirectory())) {
    const pluginRoot = path.join(pluginsRoot, entry.name);
    const manifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
    if (!existsSync(manifestPath)) continue;
    let manifest;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch (error) {
      errors.push(`${relative(manifestPath)}: invalid JSON (${error.message})`);
      continue;
    }
    if (manifest.name !== entry.name) errors.push(`${relative(manifestPath)}: name must match plugin folder`);
    if (!existsSync(path.resolve(pluginRoot, manifest.skills ?? "./skills/"))) errors.push(`${relative(manifestPath)}: skills path does not exist`);
    const marketplaceEntry = entries.get(entry.name);
    if (!marketplaceEntry) errors.push(`${relative(marketplacePath)}: missing plugin entry ${entry.name}`);
    else {
      const expectedPath = `./plugins/${entry.name}`;
      if (marketplaceEntry.source?.path !== expectedPath) errors.push(`${relative(marketplacePath)}: ${entry.name} source.path must be ${expectedPath}`);
      if (!marketplaceEntry.policy?.installation || !marketplaceEntry.policy?.authentication) errors.push(`${relative(marketplacePath)}: ${entry.name} must declare installation and authentication policy`);
    }
  }
}

function auditRepoDoctorPluginDrift() {
  const packRoot = path.join(root, "packs", "engineering", "repo-doctor");
  if (!existsSync(path.join(packRoot, "pack.yaml"))) return;
  const actualPluginRoot = path.join(root, "plugins", "repo-doctor");
  const tempRoot = mkdtempSync(path.join(tmpdir(), "repo-doctor-plugin-check-"));
  const expectedPluginRoot = path.join(tempRoot, "repo-doctor");
  try {
    syncRepoDoctorPlugin({ root, pluginRoot: expectedPluginRoot, log: false });
    auditGeneratedTree(
      path.join(expectedPluginRoot, "skills"),
      path.join(actualPluginRoot, "skills"),
      "Repo Doctor plugin",
    );
    const expectedWorkflow = path.join(expectedPluginRoot, "workflows.yaml");
    const actualWorkflow = path.join(actualPluginRoot, "workflows.yaml");
    if (!existsSync(actualWorkflow)) errors.push(relative(actualWorkflow) + ": missing generated workflow registry");
    else if (!readFileSync(expectedWorkflow).equals(readFileSync(actualWorkflow))) {
      errors.push(relative(actualWorkflow) + ": canonical/plugin drift, generated workflow registry differs");
    }
  } catch (error) {
    errors.push(`Repo Doctor canonical/plugin drift check failed: ${error.message}`);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function auditChatGptPackage({ plugin, prefix, displayPrefix, skillPath }) {
  const skillDir = path.dirname(skillPath);
  const slug = path.basename(skillDir);
  const publishedSlug = `${prefix}-${slug}`;
  const config = chatGptInterfaceFor(skillPath, slug);
  const sourceSkillContent = readFileSync(skillPath, "utf8");
  let sourceDocument;
  try {
    sourceDocument = splitSkillDocument(sourceSkillContent);
  } catch (error) {
    errors.push(`${relative(skillPath)}: invalid source SKILL.md (${error.message})`);
    return;
  }
  const expectedFiles = new Map([
    ["SKILL.md", Buffer.from(renderChatGptSkill(skillPath, publishedSlug))],
    ["agents/openai.yaml", Buffer.from(renderChatGptInterface(config, publishedSlug, displayPrefix))],
  ]);
  for (const resourceName of ["references", "assets", "scripts"]) {
    const resourceRoot = path.join(skillDir, resourceName);
    for (const file of walk(resourceRoot).sort(compareNames)) {
      const archivePath = toPosixPath(path.relative(skillDir, file));
      expectedFiles.set(archivePath, readFileSync(file));
    }
  }

  const expandedRoot = path.join(root, "dist", "chatgpt-skills", publishedSlug);
  const archive = path.join(root, "dist", "chatgpt-skills", `${publishedSlug}.zip`);
  if (!existsSync(expandedRoot)) {
    errors.push(`${relative(expandedRoot)}: missing expanded ChatGPT package`);
    return;
  }
  if (!existsSync(archive)) {
    errors.push(`${relative(archive)}: missing ChatGPT upload package`);
    return;
  }

  const actualExpanded = walk(expandedRoot)
    .map((file) => toPosixPath(path.relative(expandedRoot, file)))
    .sort(compareNames);
  const expectedPaths = [...expectedFiles.keys()].sort(compareNames);
  if (JSON.stringify(actualExpanded) !== JSON.stringify(expectedPaths)) {
    errors.push(`${relative(expandedRoot)}: ChatGPT expanded file list differs from plugin ${plugin}/${slug}`);
  }
  for (const [archivePath, expectedContent] of expectedFiles) {
    const expandedFile = path.join(expandedRoot, ...archivePath.split("/"));
    if (existsSync(expandedFile) && !expectedContent.equals(readFileSync(expandedFile))) {
      errors.push(`${relative(expandedFile)}: ChatGPT expanded content differs from synchronized plugin source`);
    }
    if (archivePath === "SKILL.md" && existsSync(expandedFile)) {
      auditPublishedSkillContent(
        readFileSync(expandedFile, "utf8"),
        relative(expandedFile),
        sourceDocument,
        publishedSlug,
      );
    }
    try {
      const archivedContent = execFileSync("unzip", ["-p", archive, archivePath]);
      if (!expectedContent.equals(archivedContent)) {
        errors.push(`${relative(archive)}: archived ${archivePath} differs from synchronized plugin source`);
      }
      if (archivePath === "SKILL.md") {
        auditPublishedSkillContent(
          archivedContent.toString("utf8"),
          `${relative(archive)}: archived SKILL.md`,
          sourceDocument,
          publishedSlug,
        );
      }
    } catch (error) {
      errors.push(`${relative(archive)}: cannot read archived ${archivePath} (${error.message})`);
    }
  }
  try {
    const archivePaths = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" })
      .split(/\r?\n/)
      .filter(Boolean);
    if (JSON.stringify(archivePaths) !== JSON.stringify(expectedPaths)) {
      errors.push(`${relative(archive)}: archive entry order or file list differs from synchronized plugin source`);
    }
  } catch (error) {
    errors.push(`${relative(archive)}: cannot list archive entries (${error.message})`);
  }
}

function auditRcaGeneratedContent() {
  const slug = "bug-root-cause-analysis";
  const canonicalRoot = path.join(root, "packs", "engineering", "repo-doctor", "skills", slug);
  if (!existsSync(canonicalRoot)) return;
  const sourceByLocale = Object.fromEntries(
    ["en", "zh-CN"].map((locale) => [
      locale,
      [
        readFileSync(path.join(canonicalRoot, `instructions.${locale}.md`), "utf8").trim(),
        readFileSync(path.join(canonicalRoot, `output.${locale}.md`), "utf8").trim(),
      ],
    ]),
  );
  const generated = [
    ["generic-en", path.join(root, "dist", "generic-en", `${slug}.md`), "en"],
    ["generic-zh-CN", path.join(root, "dist", "generic-zh-CN", `${slug}.md`), "zh-CN"],
    ["codex-zh-CN", path.join(root, "dist", "codex-zh-CN", "AGENTS.md"), "zh-CN"],
    [
      "claude-code-zh-CN",
      path.join(root, "dist", "claude-code-zh-CN", ".claude", "skills", slug, "SKILL.md"),
      "zh-CN",
    ],
    ["cursor-zh-CN", path.join(root, "dist", "cursor-zh-CN", ".cursor", "rules", `${slug}.mdc`), "zh-CN"],
    ["qwen-zh-CN", path.join(root, "dist", "qwen-zh-CN", `${slug}.md`), "zh-CN"],
    ["kimi-zh-CN", path.join(root, "dist", "kimi-zh-CN", `${slug}.md`), "zh-CN"],
  ];
  for (const [target, file, locale] of generated) {
    if (!existsSync(file)) continue;
    const content = readFileSync(file, "utf8");
    for (const source of sourceByLocale[locale]) {
      if (!content.includes(source)) errors.push(`${relative(file)}: RCA canonical/${target} generated content drift`);
    }
  }
}

function auditDist(canonicalSlugs) {
  if (!checkDist) return;
  const targets = ["generic-en", "generic-zh-CN", "claude-code-zh-CN", "cursor-zh-CN", "qwen-zh-CN", "kimi-zh-CN"];
  for (const target of targets) {
    const targetRoot = path.join(root, "dist", target);
    if (!existsSync(targetRoot)) {
      errors.push(`dist/${target}: missing generated target`);
      continue;
    }
    for (const slug of canonicalSlugs) {
      const candidates = target.startsWith("claude-code")
        ? [path.join(targetRoot, ".claude", "skills", slug, "SKILL.md")]
        : target.startsWith("cursor")
          ? [path.join(targetRoot, ".cursor", "rules", `${slug}.mdc`)]
          : [path.join(targetRoot, `${slug}.md`)];
      if (!candidates.some(existsSync)) errors.push(`dist/${target}: missing generated skill ${slug}`);
    }
  }
  const canonicalWorkflow = path.join(root, "packs", "engineering", "repo-doctor", "workflows.yaml");
  for (const target of targets) {
    const generatedWorkflow = path.join(root, "dist", target, "workflows.yaml");
    if (!existsSync(generatedWorkflow)) errors.push("dist/" + target + "/workflows.yaml: missing generated workflow registry");
    else if (!readFileSync(canonicalWorkflow).equals(readFileSync(generatedWorkflow))) {
      errors.push("dist/" + target + "/workflows.yaml: generated workflow registry differs from canonical");
    }
  }
  const codex = path.join(root, "dist", "codex-zh-CN", "AGENTS.md");
  if (!existsSync(codex)) errors.push("dist/codex-zh-CN/AGENTS.md: missing generated target");
  const chatGptBuilds = [
    {
      plugin: "repo-doctor",
      pack: ["engineering", "repo-doctor"],
      prefix: "rd",
      displayPrefix: "RD",
    },
    {
      plugin: "productivity-toolkit",
      pack: ["productivity", "productivity-toolkit"],
      prefix: "pt",
      displayPrefix: "PT",
    },
    {
      plugin: "skill-maintainer",
      pack: ["engineering", "skill-maintainer"],
      prefix: "sm",
      displayPrefix: "SM",
    },
  ];
  const expectedPackages = [];
  for (const { plugin, pack, prefix, displayPrefix } of chatGptBuilds) {
    const pluginSkills = path.join(root, "plugins", plugin, "skills");
    const packRoot = path.join(root, "packs", ...pack);
    for (const slug of discoverActivePackSkills(packRoot)) {
      const skillPath = path.join(pluginSkills, slug, "SKILL.md");
      expectedPackages.push(`${prefix}-${slug}`);
      auditChatGptPackage({ plugin, prefix, displayPrefix, skillPath });
    }
  }
  if (expectedPackages.length !== 35) {
    errors.push(`dist/chatgpt-skills: expected 35 plugin-backed packages, found ${expectedPackages.length}`);
  }
  const chatGptRoot = path.join(root, "dist", "chatgpt-skills");
  if (existsSync(chatGptRoot)) {
    const entries = sortedDirectoryEntries(chatGptRoot);
    const expanded = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    const archives = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".zip"))
      .map((entry) => entry.name.slice(0, -4));
    const expected = [...expectedPackages].sort(compareNames);
    if (JSON.stringify(expanded) !== JSON.stringify(expected)) {
      errors.push("dist/chatgpt-skills: expanded package set differs from active plugin Skills");
    }
    if (JSON.stringify(archives) !== JSON.stringify(expected)) {
      errors.push("dist/chatgpt-skills: ZIP package set differs from active plugin Skills");
    }
  }
  auditRcaGeneratedContent();
}

function auditRepository() {
  const packsRoot = path.join(root, "packs");
  const ids = new Map();
  const slugs = new Map();
  const canonicalNames = new Map();
  const packReferences = new Set();
  const canonicalSkillDirs = walk(packsRoot, (file) => path.basename(file) === "skill.yaml")
    .filter((file) => file.includes(`${path.sep}skills${path.sep}`) && !file.includes(`${path.sep}packs${path.sep}_template${path.sep}`))
    .map((file) => path.dirname(file));
  for (const skillDir of canonicalSkillDirs) auditCanonicalSkill(skillDir, ids, slugs, canonicalNames, packReferences);

  const packDirs = walk(packsRoot, (file) => path.basename(file) === "pack.yaml")
    .filter((file) => !file.includes(`${path.sep}packs${path.sep}_template${path.sep}`))
    .map((file) => path.dirname(file));
  const canonicalSlugs = new Set();
  for (const packDir of packDirs) auditPack(packDir, canonicalSlugs, packReferences);

  const pluginsRoot = path.join(root, "plugins");
  for (const skillPath of walk(pluginsRoot, (file) => path.basename(file) === "SKILL.md")) {
    const pluginSkillDir = path.dirname(skillPath);
    auditPluginSkill(pluginSkillDir, canonicalNames.get(path.basename(pluginSkillDir)) ?? null);
  }
  auditRepoDoctorPluginDrift();
  auditManifests();
  auditDist(canonicalSlugs);
}

if (singlePluginSkill) auditPluginSkill(path.resolve(singlePluginSkill));
else auditRepository();

for (const warning of warnings.sort(compareNames)) console.warn(`warning: ${warning}`);
if (errors.length) {
  console.error(`Skill quality checks failed with ${errors.length} error(s):`);
  for (const error of errors.sort(compareNames)) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Skill quality checks passed${checkDist ? " with generated-output coverage" : ""}.`);
