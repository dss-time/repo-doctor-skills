import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const manuals = [
  "docs/USER_MANUAL.md",
  "docs/USER_MANUAL.zh-CN.md",
  "docs/SKILL_CATALOG.md",
  "docs/SKILL_CATALOG.zh-CN.md",
  "docs/WORKFLOW_COOKBOOK.md",
  "docs/WORKFLOW_COOKBOOK.zh-CN.md",
];

const entryDocuments = [
  "README.md",
  "README.zh-CN.md",
  "docs/QUICK_START.md",
  "docs/QUICK_START.zh-CN.md",
];

const releaseDocuments = [
  "docs/VERSIONING.md",
  "docs/VERSIONING.zh-CN.md",
  "docs/RELEASE_NOTES_DRAFT.md",
  "CHANGELOG.md",
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    fail(`${relativePath}: required user document is missing`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function checkCatalogDrift() {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", "generate-skill-catalog.mjs"), "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    fail(`generated Skill catalogs are stale${detail ? `:\n${detail}` : ""}`);
  }
}

function checkLinks(relativePath, content) {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of content.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    target = target.split(/\s+['\"]/)[0];
    if (!target || target.startsWith("#") || /^(?:https?:|mailto:)/i.test(target)) continue;
    const filePart = target.split("#", 1)[0].split("?", 1)[0];
    if (!filePart) continue;
    let decoded;
    try {
      decoded = decodeURIComponent(filePart);
    } catch {
      fail(`${relativePath}: invalid percent-encoding in link ${target}`);
      continue;
    }
    const resolved = path.resolve(path.dirname(path.join(root, relativePath)), decoded);
    if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== root) {
      fail(`${relativePath}: repository-relative link escapes the repository: ${target}`);
    } else if (!existsSync(resolved)) {
      fail(`${relativePath}: broken local link ${target}`);
    }
  }
}

function checkEntryLinks(relativePath, content) {
  const suffix = relativePath.endsWith("zh-CN.md") ? ".zh-CN.md" : ".md";
  const prefix = relativePath.startsWith("docs/") ? "" : "docs/";
  for (const basename of ["USER_MANUAL", "SKILL_CATALOG", "WORKFLOW_COOKBOOK"]) {
    const expected = `${prefix}${basename}${suffix}`;
    if (!content.includes(expected)) fail(`${relativePath}: missing user-facing entry link to ${expected}`);
  }
}

function checkVersionPolicyEntry(relativePath, content) {
  const suffix = relativePath.endsWith("zh-CN.md") ? ".zh-CN.md" : ".md";
  const prefix = relativePath.startsWith("docs/") ? "" : "docs/";
  const expected = `${prefix}VERSIONING${suffix}`;
  if (!content.includes(expected)) fail(`${relativePath}: missing version-policy entry link to ${expected}`);
}

function checkManualCoverage(relativePath, content) {
  const requiredTerms = [
    "ChatGPT",
    "Codex",
    "Claude Code",
    "Cursor",
    "Qwen",
    "Kimi",
    "generic",
    "rd-*",
    "pt-*",
    "sm-*",
    "risk_level",
    "write_files",
    "2026-07-15",
  ];
  for (const term of requiredTerms) {
    if (!content.toLowerCase().includes(term.toLowerCase())) {
      fail(`${relativePath}: required platform or safety term is missing: ${term}`);
    }
  }

  const officialSources = [
    "https://learn.chatgpt.com/docs/build-skills",
    "https://learn.chatgpt.com/docs/plugins",
    "https://help.openai.com/en/articles/20001066-skills-in-chatgpt",
  ];
  for (const source of officialSources) {
    if (!content.includes(source)) fail(`${relativePath}: missing official OpenAI source ${source}`);
  }
}

function checkMachineSpecificContent(relativePath, content) {
  const forbiddenPatterns = [
    { pattern: /\/Users\/[A-Za-z0-9._-]+\//, label: "macOS user path" },
    { pattern: /\/home\/[A-Za-z0-9._-]+\//, label: "Linux user path" },
    { pattern: /[A-Za-z]:\\Users\\[^\\\s]+\\/, label: "Windows user path" },
  ];
  for (const { pattern, label } of forbiddenPatterns) {
    if (pattern.test(content)) fail(`${relativePath}: contains a machine-specific ${label}`);
  }
}

for (const relativePath of manuals) {
  const content = read(relativePath);
  checkLinks(relativePath, content);
  checkMachineSpecificContent(relativePath, content);
  if (relativePath.includes("USER_MANUAL")) checkManualCoverage(relativePath, content);
}

for (const relativePath of entryDocuments) {
  const content = read(relativePath);
  checkLinks(relativePath, content);
  checkEntryLinks(relativePath, content);
  checkVersionPolicyEntry(relativePath, content);
}

for (const relativePath of [
  "docs/USER_MANUAL.md",
  "docs/USER_MANUAL.zh-CN.md",
  "docs/MAINTAINER_CHECKLIST.md",
  "docs/MAINTAINER_CHECKLIST.zh-CN.md",
]) {
  const content = read(relativePath);
  checkVersionPolicyEntry(relativePath, content);
}

for (const relativePath of releaseDocuments) {
  const content = read(relativePath);
  checkLinks(relativePath, content);
  checkMachineSpecificContent(relativePath, content);
}

const releaseNotes = read("docs/RELEASE_NOTES_DRAFT.md");
for (const term of ["0.3.0-rc.1", "Release Candidate", "Live-model", "UNKNOWN"]) {
  if (!releaseNotes.includes(term)) fail(`docs/RELEASE_NOTES_DRAFT.md: missing Release Candidate term ${term}`);
}

const changelog = read("CHANGELOG.md");
for (const heading of ["## [Unreleased]", "## [0.3.0-rc.1] - 2026-07-17", "## [0.2.0] - 2026-07-15", "## [0.1.0] - 2026-07-09"]) {
  if (!changelog.includes(heading)) fail(`CHANGELOG.md: missing heading ${heading}`);
}

for (const relativePath of ["docs/VERSIONING.md", "docs/VERSIONING.zh-CN.md"]) {
  const content = read(relativePath);
  for (const term of ["0.1.0", "0.2.0", "0.3.0-rc.1", "v0.0.1", "beta", "stable", "deprecated", "draft"]) {
    if (!content.includes(term)) fail(`${relativePath}: missing version-policy term ${term}`);
  }
}

if (existsSync(path.join(root, "scripts", "generate-skill-catalog.mjs"))) checkCatalogDrift();
else fail("scripts/generate-skill-catalog.mjs: catalog generator is missing");

if (failures.length > 0) {
  console.error(`User documentation check failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`User documentation check passed (${manuals.length} manuals/catalogs, ${entryDocuments.length} entry documents, ${releaseDocuments.length} release documents).`);
