import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTargets } from "./build-skills.mjs";
import { compareNames, walkFiles } from "./deterministic-files.mjs";
import { discoverActivePackSkills, discoverPackRoots } from "./sync-pack-plugin.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportsDir = path.join(root, "tests", "reports");
const generatedAt = new Date().toISOString();
const requiredSkillFiles = Object.freeze([
  "skill.yaml",
  "instructions.en.md",
  "instructions.zh-CN.md",
  "output.en.md",
  "output.zh-CN.md",
  "examples.en.md",
  "examples.zh-CN.md",
  "tests/case-001.en.yaml",
  "tests/case-001.zh-CN.yaml",
]);
const modeNames = Object.freeze([
  "fast",
  "standard",
  "audit",
  "documented",
  "logic-prototype",
  "ui-prototype",
  "test_first",
  "regression_after_fix",
  "characterization",
]);
const evidenceNames = Object.freeze(["Observed", "Reproduced", "Inferred", "Unverified", "Blocked"]);
const absoluteMachinePath = /(?:\/Users\/[^/\s]+|\/home\/[^/\s]+|[A-Za-z]:\\Users\\[^\\\s]+)/;
const forbiddenArtifactNames = new Set([".DS_Store", "node_modules"]);

function relative(filename) {
  return path.relative(root, filename).split(path.sep).join("/");
}

function readYaml(filename) {
  return parseYamlSubset(readFileSync(filename, "utf8"));
}

function writeJson(filename, value) {
  mkdirSync(reportsDir, { recursive: true });
  writeFileSync(path.join(reportsDir, filename), `${JSON.stringify(value, null, 2)}\n`);
}

function activeModel() {
  const project = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const activationCases = JSON.parse(
    readFileSync(path.join(root, "tests", "skill-quality", "activation-cases.json"), "utf8"),
  );
  const packRoots = discoverPackRoots(path.join(root, "packs"));
  const packs = packRoots.map((packRoot) => {
    const metadata = readYaml(path.join(packRoot, "pack.yaml"));
    const skills = discoverActivePackSkills(packRoot);
    return {
      id: metadata.id,
      name: metadata.name,
      version: metadata.version,
      status: metadata.status,
      path: relative(packRoot),
      skills,
    };
  }).sort((left, right) => compareNames(left.id, right.id));
  const activeSkills = packs.flatMap((pack) => pack.skills.map((slug) => {
    const skillRoot = path.join(root, pack.path, "skills", slug);
    const metadata = readYaml(path.join(skillRoot, "skill.yaml"));
    return {
      slug,
      id: metadata.id,
      pack: pack.id,
      path: relative(skillRoot),
      version: metadata.version,
      status: metadata.status,
      name: metadata.name,
      description: metadata.description,
      supported_locales: metadata.supported_locales,
      permissions: metadata.permissions,
      tool_requirements: metadata.tool_requirements,
    };
  }));
  const workflowRegistry = readYaml(path.join(root, "packs", "engineering", "repo-doctor", "workflows.yaml"));
  const marketplace = JSON.parse(readFileSync(path.join(root, ".agents", "plugins", "marketplace.json"), "utf8"));
  const zipRoot = path.join(root, "dist", "chatgpt-skills");
  const chatGptZips = existsSync(zipRoot)
    ? readdirSync(zipRoot).filter((entry) => entry.endsWith(".zip")).sort(compareNames)
    : [];
  return {
    generated_at: generatedAt,
    project_version: project.version,
    packs,
    active_skills: activeSkills,
    repo_doctor_skills: packs.find((pack) => pack.id === "engineering.repo-doctor")?.skills ?? [],
    workflows: Object.keys(workflowRegistry.workflows ?? {}).sort(compareNames),
    plugins: (marketplace.plugins ?? []).map((plugin) => ({
      name: plugin.name,
      source: plugin.source,
      category: plugin.category,
    })).sort((left, right) => compareNames(left.name, right.name)),
    build_targets: [...buildTargets],
    chatgpt_zips: chatGptZips,
    activation_contract_count: activationCases.length,
    activation_contracts: activationCases.map((testCase) => testCase.id),
  };
}

function localMarkdownLinks(filename, content) {
  const issues = [];
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(?:https?:|mailto:|#)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(filename), decodeURIComponent(target));
    if (!existsSync(resolved)) issues.push(`${relative(filename)} -> ${target}`);
  }
  return issues;
}

function resourceLinks(skillRoot, filename, content) {
  const issues = [];
  for (const match of content.matchAll(/(?:\.\.\/\.\.\/)?(?:references|assets|scripts)\/[A-Za-z0-9._/-]+/g)) {
    const cleaned = match[0].replace(/[)`'",.;:]+$/g, "");
    const resolved = path.resolve(skillRoot, cleaned);
    if (!existsSync(resolved)) issues.push(`${relative(filename)} -> ${cleaned}`);
  }
  return issues;
}

function headingShape(content) {
  return [...content.matchAll(/^(#{1,6})\s+/gm)].map((match) => match[1].length);
}

function backtickedSet(content, names) {
  return names.filter((name) => content.includes(`\`${name}\``)).sort(compareNames);
}

function referencedSkills(content, slugs) {
  return slugs.filter((slug) => new RegExp(`(?:\\$|\\x60)?${slug}(?:\\x60|\\b)`).test(content)).sort(compareNames);
}

function semanticParity(skill, skillRoot, allSlugs) {
  const enInstructions = readFileSync(path.join(skillRoot, "instructions.en.md"), "utf8");
  const zhInstructions = readFileSync(path.join(skillRoot, "instructions.zh-CN.md"), "utf8");
  const enOutput = readFileSync(path.join(skillRoot, "output.en.md"), "utf8");
  const zhOutput = readFileSync(path.join(skillRoot, "output.zh-CN.md"), "utf8");
  const enExamples = readFileSync(path.join(skillRoot, "examples.en.md"), "utf8");
  const zhExamples = readFileSync(path.join(skillRoot, "examples.zh-CN.md"), "utf8");
  const checks = [];
  const compare = (name, left, right) => {
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      checks.push(`${name} differs: en=${JSON.stringify(left)} zh-CN=${JSON.stringify(right)}`);
    }
  };
  compare("instruction heading structure", headingShape(enInstructions), headingShape(zhInstructions));
  compare("output heading structure", headingShape(enOutput), headingShape(zhOutput));
  compare("declared modes", backtickedSet(enInstructions, modeNames), backtickedSet(zhInstructions, modeNames));
  compare("evidence states", backtickedSet(`${enInstructions}\n${enOutput}`, evidenceNames), backtickedSet(`${zhInstructions}\n${zhOutput}`, evidenceNames));
  compare("Skill handoffs", referencedSkills(`${enInstructions}\n${enOutput}`, allSlugs), referencedSkills(`${zhInstructions}\n${zhOutput}`, allSlugs));
  const enExampleItems = (enExamples.match(/^\s*[-*]\s+/gm) ?? []).length;
  const zhExampleItems = (zhExamples.match(/^\s*[-*]\s+/gm) ?? []).length;
  if (enExampleItems !== zhExampleItems) checks.push(`example intent count differs: en=${enExampleItems} zh-CN=${zhExampleItems}`);
  return { passed: checks.length === 0, issues: checks };
}

function validateBilingual(inventory) {
  const allSlugs = inventory.active_skills.map((skill) => skill.slug);
  const slugCounts = new Map();
  for (const slug of allSlugs) slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
  const activationCases = JSON.parse(
    readFileSync(path.join(root, "tests", "skill-quality", "activation-cases.json"), "utf8"),
  );
  const results = inventory.active_skills.map((skill) => {
    const skillRoot = path.join(root, skill.path);
    const issues = [];
    const brokenLinks = [];
    for (const required of requiredSkillFiles) {
      if (!existsSync(path.join(skillRoot, required))) issues.push(`missing ${required}`);
    }
    const metadata = readYaml(path.join(skillRoot, "skill.yaml"));
    const descriptions = [metadata.description?.en, metadata.description?.["zh-CN"]];
    if (slugCounts.get(skill.slug) !== 1) issues.push("canonical slug is not unique");
    if (!metadata.name?.en || !metadata.name?.["zh-CN"]) issues.push("localized name is incomplete");
    if (descriptions.some((description) => !description?.trim())) issues.push("localized description is empty");
    if (descriptions.some((description) => /^\s*(?:TODO|TBD)\s*$/i.test(description))) issues.push("localized description is only a placeholder");
    const enPositive = activationCases.some((testCase) =>
      testCase.subject_skill === skill.slug && testCase.locale === "en" && testCase.expected_skill === skill.slug);
    const zhPositive = activationCases.some((testCase) =>
      testCase.subject_skill === skill.slug && testCase.locale === "zh-CN" && testCase.expected_skill === skill.slug);
    if (!enPositive || !zhPositive) issues.push("localized positive-use fixture is missing");
    const enBoundary = activationCases.some((testCase) =>
      testCase.locale === "en"
      && testCase.expected_skill !== skill.slug
      && (testCase.subject_skill === skill.slug || (testCase.must_not_trigger ?? []).includes(skill.slug)));
    const zhBoundary = activationCases.some((testCase) =>
      testCase.locale === "zh-CN"
      && testCase.expected_skill !== skill.slug
      && (testCase.subject_skill === skill.slug || (testCase.must_not_trigger ?? []).includes(skill.slug)));
    if (!enBoundary || !zhBoundary) issues.push("localized adjacent-Skill boundary fixture is missing");
    for (const filename of walkFiles(skillRoot, (candidate) => /\.(?:md|yaml|json)$/.test(candidate))) {
      const content = readFileSync(filename, "utf8");
      if (absoluteMachinePath.test(content)) issues.push(`${relative(filename)} contains an absolute machine path`);
      brokenLinks.push(...localMarkdownLinks(filename, content));
      if (path.basename(filename).startsWith("instructions.")) {
        brokenLinks.push(...resourceLinks(skillRoot, filename, content));
      }
    }
    const parity = semanticParity(skill, skillRoot, allSlugs);
    issues.push(...parity.issues);
    return {
      skill: skill.slug,
      files_complete: requiredSkillFiles.every((required) => existsSync(path.join(skillRoot, required))),
      metadata_complete: issues.every((issue) =>
        !/(?:slug|name|description|placeholder|positive-use fixture|boundary fixture)/.test(issue)),
      semantic_parity: parity.passed,
      broken_links: [...new Set(brokenLinks)].sort(compareNames),
      issues: [...new Set([...issues, ...brokenLinks])].sort(compareNames),
    };
  });
  const documentPairs = [
    ["README.md", "README.zh-CN.md"],
    ["docs/QUICK_START.md", "docs/QUICK_START.zh-CN.md"],
    ["docs/USER_MANUAL.md", "docs/USER_MANUAL.zh-CN.md"],
    ["docs/SKILL_CATALOG.md", "docs/SKILL_CATALOG.zh-CN.md"],
    ["docs/WORKFLOW_COOKBOOK.md", "docs/WORKFLOW_COOKBOOK.zh-CN.md"],
    ["docs/guides/quick-skill-entrypoints.md", "docs/guides/quick-skill-entrypoints.zh-CN.md"],
    ["docs/MAINTAINER_CHECKLIST.md", "docs/MAINTAINER_CHECKLIST.zh-CN.md"],
    ["docs/LEGACY_CODEX_PLUGIN.md", "docs/LEGACY_CODEX_PLUGIN.zh-CN.md"],
  ].map(([en, zh]) => {
    const issues = [];
    for (const filename of [en, zh]) {
      const absolute = path.join(root, filename);
      if (!existsSync(absolute)) issues.push(`${filename} is missing`);
      else issues.push(...localMarkdownLinks(absolute, readFileSync(absolute, "utf8")));
    }
    return { en, "zh-CN": zh, passed: issues.length === 0, issues };
  });
  const report = {
    generated_at: generatedAt,
    project_version: inventory.project_version,
    semantic_parity_method: "Deterministic comparison of localized heading structure, declared backticked modes, evidence states, active-Skill handoffs, and example intent counts. Live Codex semantic review is reported separately.",
    summary: {
      active_skills: results.length,
      files_complete: results.filter((result) => result.files_complete).length,
      metadata_complete: results.filter((result) => result.metadata_complete).length,
      semantic_parity: results.filter((result) => result.semantic_parity).length,
      passed: results.filter((result) => result.issues.length === 0).length,
    },
    skills: results,
    documentation: documentPairs,
  };
  writeJson("bilingual-skill-validation.json", report);
  const lines = [
    "# Bilingual Skill Validation",
    "",
    `Generated: ${generatedAt}`,
    "",
    `Result: ${report.summary.passed}/${report.summary.active_skills} Skills passed all deterministic bilingual checks.`,
    "",
    "| Skill | Files | Metadata | Semantic parity | Issues |",
    "|---|---:|---:|---:|---|",
    ...results.map((result) =>
      `| \`${result.skill}\` | ${result.files_complete ? "PASS" : "FAIL"} | ${result.metadata_complete ? "PASS" : "FAIL"} | ${result.semantic_parity ? "PASS" : "FAIL"} | ${result.issues.length ? result.issues.join("; ") : "none"} |`),
    "",
    "## Documentation pairs",
    "",
    ...documentPairs.map((pair) => `- ${pair.passed ? "PASS" : "FAIL"}: \`${pair.en}\` / \`${pair["zh-CN"]}\`${pair.issues.length ? ` — ${pair.issues.join("; ")}` : ""}`),
  ];
  writeFileSync(path.join(reportsDir, "bilingual-skill-validation.md"), `${lines.join("\n")}\n`);
  return report;
}

function artifactFiles(directory) {
  return walkFiles(directory, () => true);
}

function scanArtifactTree(directory) {
  const issues = [];
  for (const filename of artifactFiles(directory)) {
    const basename = path.basename(filename);
    if (forbiddenArtifactNames.has(basename)) issues.push(`${relative(filename)} contains forbidden ${basename}`);
    if (/\.(?:md|mdc|yaml|json|toml|txt)$/i.test(filename)) {
      const content = readFileSync(filename, "utf8");
      if (absoluteMachinePath.test(content)) issues.push(`${relative(filename)} contains an absolute machine path`);
      if (/matt-skills-reference|mattpocock\/skills/.test(content)) issues.push(`${relative(filename)} leaks temporary research provenance`);
    }
  }
  return issues;
}

function validateTarget(target, inventory) {
  const directory = path.join(root, "dist", target);
  const issues = [];
  const expectedSlugs = inventory.active_skills.map((skill) => skill.slug);
  if (!existsSync(directory)) issues.push("target directory is missing");
  let discovered = [];
  if (existsSync(directory)) {
    if (target.startsWith("claude-code")) {
      const skillsRoot = path.join(directory, ".claude", "skills");
      discovered = existsSync(skillsRoot)
        ? readdirSync(skillsRoot).filter((entry) => existsSync(path.join(skillsRoot, entry, "SKILL.md"))).sort(compareNames)
        : [];
      for (const slug of discovered) {
        const content = readFileSync(path.join(skillsRoot, slug, "SKILL.md"), "utf8");
        if (!/^---\n[\s\S]*?\n---/.test(content)) issues.push(`${slug}: unparseable SKILL.md frontmatter`);
      }
    } else if (target.startsWith("cursor")) {
      const rulesRoot = path.join(directory, ".cursor", "rules");
      discovered = existsSync(rulesRoot)
        ? readdirSync(rulesRoot).filter((entry) => entry.endsWith(".mdc")).map((entry) => entry.slice(0, -4)).sort(compareNames)
        : [];
      for (const slug of discovered) {
        const content = readFileSync(path.join(rulesRoot, `${slug}.mdc`), "utf8");
        if (!/^---\n[\s\S]*?\n---/.test(content)) issues.push(`${slug}: unparseable Cursor frontmatter`);
      }
    } else if (target.startsWith("codex")) {
      const agents = path.join(directory, "AGENTS.md");
      if (!existsSync(agents)) issues.push("AGENTS.md is missing");
      const skillsRoot = path.join(directory, "skills");
      if (!existsSync(skillsRoot)) issues.push("installable skills directory is missing");
      else {
        discovered = readdirSync(skillsRoot)
          .filter((entry) => existsSync(path.join(skillsRoot, entry, "SKILL.md")))
          .sort(compareNames);
        for (const slug of discovered) {
          const content = readFileSync(path.join(skillsRoot, slug, "SKILL.md"), "utf8");
          if (!/^---\n[\s\S]*?\n---/.test(content)) issues.push(`${slug}: unparseable Codex SKILL.md frontmatter`);
          if (!content.includes("# English") || !content.includes("# 简体中文")) {
            issues.push(`${slug}: Codex SKILL.md is not bilingual`);
          }
        }
      }
      if (existsSync(agents)) {
        const content = readFileSync(agents, "utf8");
        const agentsSlugs = [...content.matchAll(/^ID:\s+([a-z0-9.-]+)$/gm)]
          .map((match) => inventory.active_skills.find((skill) => skill.id === match[1])?.slug)
          .filter(Boolean)
          .sort(compareNames);
        if (JSON.stringify(agentsSlugs) !== JSON.stringify([...expectedSlugs].sort(compareNames))) {
          issues.push(`AGENTS.md Skill set differs: expected ${expectedSlugs.length}, found ${agentsSlugs.length}`);
        }
      }
    } else {
      discovered = readdirSync(directory)
        .filter((entry) => entry.endsWith(".md") && entry !== "README.md")
        .map((entry) => entry.slice(0, -3))
        .sort(compareNames);
    }
    if (JSON.stringify(discovered) !== JSON.stringify([...expectedSlugs].sort(compareNames))) {
      issues.push(`Skill set differs: expected ${expectedSlugs.length}, found ${discovered.length}`);
    }
    issues.push(...scanArtifactTree(directory));
    if (artifactFiles(directory).some((filename) => filename.endsWith("skill.yaml"))) {
      issues.push("canonical skill.yaml leaked into generated target");
    }
  }
  return {
    target,
    expected_skill_count: expectedSlugs.length,
    actual_skill_count: discovered.length,
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues: [...new Set(issues)].sort(compareNames),
  };
}

function validateZip(filename) {
  const issues = [];
  let entries = [];
  try {
    execFileSync("unzip", ["-tqq", filename], { stdio: "pipe" });
    entries = execFileSync("unzip", ["-Z1", filename], { encoding: "utf8" })
      .split(/\r?\n/).filter(Boolean);
  } catch (error) {
    issues.push(`ZIP integrity failed with exit ${error.status ?? "unknown"}`);
  }
  if (!entries.includes("SKILL.md")) issues.push("SKILL.md is missing");
  if (!entries.includes("agents/openai.yaml")) issues.push("agents/openai.yaml is missing");
  for (const entry of entries) {
    if (entry.split("/").some((part) => forbiddenArtifactNames.has(part))) issues.push(`forbidden entry ${entry}`);
    if (entry.startsWith("/") || entry.includes("../")) issues.push(`unsafe entry ${entry}`);
  }
  return {
    zip: path.basename(filename),
    entry_count: entries.length,
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues,
  };
}

function validateArtifacts(inventory) {
  const targets = buildTargets.map((target) => validateTarget(target, inventory));
  const zips = inventory.chatgpt_zips.map((zip) =>
    validateZip(path.join(root, "dist", "chatgpt-skills", zip)));
  const report = {
    generated_at: generatedAt,
    project_version: inventory.project_version,
    expected_active_skills: inventory.active_skills.length,
    targets,
    chatgpt_zips: zips,
    summary: {
      target_count: targets.length,
      targets_passed: targets.filter((target) => target.status === "PASS").length,
      zip_count: zips.length,
      zips_passed: zips.filter((zip) => zip.status === "PASS").length,
      status: targets.every((target) => target.status === "PASS")
        && zips.length > 0
        && zips.every((zip) => zip.status === "PASS")
        ? "PASS"
        : "FAIL",
    },
  };
  writeJson("build-artifact-validation.json", report);
  return report;
}

function main() {
  const mode = process.argv[2] ?? "all";
  if (!["inventory", "bilingual", "artifacts", "all"].includes(mode)) {
    throw new Error(`unsupported report mode: ${mode}`);
  }
  const inventory = activeModel();
  if (mode === "inventory" || mode === "all") {
    writeJson("active-skills-inventory.json", inventory);
    console.log(
      `Inventory: ${inventory.packs.length} Packs, ${inventory.active_skills.length} active Skills, `
      + `${inventory.workflows.length} workflows, ${inventory.plugins.length} plugins, `
      + `${inventory.build_targets.length} targets, ${inventory.chatgpt_zips.length} ZIPs, `
      + `${inventory.activation_contract_count} activation contracts.`,
    );
  }
  if (mode === "bilingual" || mode === "all") {
    const report = validateBilingual(inventory);
    console.log(`Bilingual validation: ${report.summary.passed}/${report.summary.active_skills} passed.`);
    if (report.summary.passed !== report.summary.active_skills) process.exitCode = 1;
  }
  if (mode === "artifacts" || mode === "all") {
    const report = validateArtifacts(inventory);
    console.log(
      `Artifact validation: ${report.summary.targets_passed}/${report.summary.target_count} targets, `
      + `${report.summary.zips_passed}/${report.summary.zip_count} ZIPs passed.`,
    );
    if (report.summary.status !== "PASS") process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
