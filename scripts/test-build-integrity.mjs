import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  frontmatterFieldSource,
  orderedArchiveEntries,
  renderSkill,
  renderSkillContent,
  splitSkillDocument,
} from "./build-chatgpt-skills.mjs";
import { discoverCanonicalSkillDirs } from "./build-skills.mjs";
import { compareNames } from "./deterministic-files.mjs";
import { discoverActivePackSkills } from "./sync-pack-plugin.mjs";

const root = process.cwd();
const buildScript = path.join(root, "scripts", "build-skills.mjs");
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

const descriptionFixtures = [
  "description: English-only description - preserve exactly.",
  "description: English and 中文（双语用途） - preserve exactly.",
  "description: 仅中文描述（只保留一份）- 不重复。",
  'description: "Quoted: \\"value\\"（中文） - preserve punctuation"',
  "description: 'Owner''s note: value（中文） - preserve punctuation'",
  "description: >-\n  Folded line: value - English.\n  中文折叠说明（保留）。",
  'description: |-\n  Literal line: "value" - English.\n  中文多行说明（保留）。',
];

for (const [index, description] of descriptionFixtures.entries()) {
  const source = [
    "---",
    "name: fixture-skill",
    description,
    "---",
    "",
    "# 原始标题（必须保留）",
    "",
    "正文中的 name: fixture-skill 与 description: body 不能被重写。",
    "",
  ].join("\n");
  const rendered = renderSkillContent(source, "rd-fixture-skill");
  const sourceDocument = splitSkillDocument(source);
  const renderedDocument = splitSkillDocument(rendered);
  expect(
    frontmatterFieldSource(renderedDocument, "name").trim() === "name: rd-fixture-skill",
    `description fixture ${index + 1} should rewrite only the published name`,
  );
  expect(
    frontmatterFieldSource(renderedDocument, "description")
      === frontmatterFieldSource(sourceDocument, "description"),
    `description fixture ${index + 1} should preserve the raw YAML description node`,
  );
  expect(
    renderedDocument.body === sourceDocument.body,
    `description fixture ${index + 1} should preserve the full body byte-for-byte`,
  );
  expect(
    renderSkillContent(rendered, "rd-fixture-skill") === rendered,
    `description fixture ${index + 1} should be idempotent`,
  );
}

const pluginBuilds = [
  {
    packRoot: path.join(root, "packs", "engineering", "repo-doctor"),
    pluginRoot: path.join(root, "plugins", "repo-doctor"),
    prefix: "rd",
  },
  {
    packRoot: path.join(root, "packs", "productivity", "productivity-toolkit"),
    pluginRoot: path.join(root, "plugins", "productivity-toolkit"),
    prefix: "pt",
  },
  {
    packRoot: path.join(root, "packs", "engineering", "skill-maintainer"),
    pluginRoot: path.join(root, "plugins", "skill-maintainer"),
    prefix: "sm",
  },
];
let pluginSkillCount = 0;
for (const { packRoot, pluginRoot, prefix } of pluginBuilds) {
  for (const slug of discoverActivePackSkills(packRoot)) {
    const source = path.join(pluginRoot, "skills", slug, "SKILL.md");
    expect(existsSync(source), `${path.relative(root, source)} should exist`);
    if (!existsSync(source)) continue;
    pluginSkillCount += 1;
    const sourceContent = readFileSync(source, "utf8");
    const rendered = renderSkill(source, `${prefix}-${slug}`);
    const sourceDocument = splitSkillDocument(sourceContent);
    const renderedDocument = splitSkillDocument(rendered);
    expect(
      frontmatterFieldSource(renderedDocument, "description")
        === frontmatterFieldSource(sourceDocument, "description"),
      `${prefix}-${slug} should preserve the plugin description`,
    );
    expect(renderedDocument.body === sourceDocument.body, `${prefix}-${slug} should preserve the plugin body`);
  }
}
expect(pluginSkillCount === 35, `ChatGPT source coverage should include 35 plugin Skills, received ${pluginSkillCount}`);

const names = ["Z", "a", "ä", "中", "_"];
const expectedNameOrder = [...names].sort(compareNames);
for (const permutation of [names, [...names].reverse(), ["ä", "_", "中", "Z", "a"]]) {
  expect(
    JSON.stringify([...permutation].sort(compareNames)) === JSON.stringify(expectedNameOrder),
    "portable name ordering must not depend on input or creation order",
  );
}

function writeBuildSkill(skillRoot, slug) {
  mkdirSync(skillRoot, { recursive: true });
  writeFileSync(
    path.join(skillRoot, "skill.yaml"),
    [
      `id: fixture.${slug}`,
      "name:",
      `  en: ${slug}`,
      `  zh-CN: ${slug}`,
      "visibility: public",
      "status: stable",
      "description:",
      `  en: ${slug} description`,
      `  zh-CN: ${slug} 描述`,
      "",
    ].join("\n"),
  );
  for (const locale of ["en", "zh-CN"]) {
    writeFileSync(path.join(skillRoot, `instructions.${locale}.md`), `# ${slug} instructions ${locale}\n`);
    writeFileSync(path.join(skillRoot, `output.${locale}.md`), `# ${slug} output ${locale}\n`);
  }
}

function writeBuildFixture(fixtureRoot, reverseCreation) {
  const packs = [
    { relative: ["a-category", "a-pack"], skills: ["beta"] },
    { relative: ["z-category", "z-pack"], skills: ["zeta", "alpha", "middle"] },
  ];
  const packCreation = reverseCreation ? [...packs].reverse() : packs;
  for (const pack of packCreation) {
    const packRoot = path.join(fixtureRoot, "packs", ...pack.relative);
    mkdirSync(path.join(packRoot, "skills"), { recursive: true });
    writeFileSync(
      path.join(packRoot, "pack.yaml"),
      `skills:\n${pack.skills.map((slug) => `  - ${slug}`).join("\n")}\n`,
    );
    const skillCreation = reverseCreation ? [...pack.skills].reverse() : pack.skills;
    for (const slug of skillCreation) writeBuildSkill(path.join(packRoot, "skills", slug), slug);
  }
}

function runIsolatedBuild(fixtureRoot) {
  return spawnSync(process.execPath, [buildScript, "--target", "codex-zh-CN"], {
    cwd: fixtureRoot,
    encoding: "utf8",
  });
}

const tempRoot = mkdtempSync(path.join(tmpdir(), "skill-build-integrity-"));
try {
  const firstBuildRoot = path.join(tempRoot, "first");
  const secondBuildRoot = path.join(tempRoot, "second");
  writeBuildFixture(firstBuildRoot, false);
  writeBuildFixture(secondBuildRoot, true);

  const expectedSkillOrder = ["beta", "zeta", "alpha", "middle"];
  for (const fixtureRoot of [firstBuildRoot, secondBuildRoot]) {
    expect(
      JSON.stringify(
        discoverCanonicalSkillDirs(path.join(fixtureRoot, "packs")).map((skillDir) => path.basename(skillDir)),
      ) === JSON.stringify(expectedSkillOrder),
      "canonical discovery should sort Pack paths and preserve each pack.yaml Skill order",
    );
    const build = runIsolatedBuild(fixtureRoot);
    expect(build.status === 0, `isolated build should pass: ${build.stderr}`);
  }

  const firstAgents = readFileSync(path.join(firstBuildRoot, "dist", "codex-zh-CN", "AGENTS.md"), "utf8");
  const secondAgents = readFileSync(path.join(secondBuildRoot, "dist", "codex-zh-CN", "AGENTS.md"), "utf8");
  expect(firstAgents === secondAgents, "filesystem creation order must not change the Codex aggregate output");
  let previousIndex = -1;
  for (const slug of expectedSkillOrder) {
    const currentIndex = firstAgents.indexOf(`ID: fixture.${slug}`);
    expect(currentIndex > previousIndex, `Codex output should preserve declared order for ${slug}`);
    previousIndex = currentIndex;
  }
  const firstFingerprint = digest(firstAgents);
  const repeatedBuild = runIsolatedBuild(firstBuildRoot);
  expect(repeatedBuild.status === 0, `repeated isolated build should pass: ${repeatedBuild.stderr}`);
  expect(
    digest(readFileSync(path.join(firstBuildRoot, "dist", "codex-zh-CN", "AGENTS.md"))) === firstFingerprint,
    "repeated isolated builds should be byte-for-byte stable",
  );

  const archiveFiles = [
    "scripts/z-tool.js",
    "SKILL.md",
    "references/ä-note.md",
    "agents/openai.yaml",
    "assets/a-template.md",
    "references/nested/b-note.md",
  ];
  const timestamp = new Date("2000-01-01T00:00:00Z");
  function buildArchiveFixture(name, creationOrder) {
    const skillRoot = path.join(tempRoot, name);
    for (const relative of creationOrder) {
      const target = path.join(skillRoot, ...relative.split("/"));
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, `${relative}\n`);
      utimesSync(target, timestamp, timestamp);
    }
    const entries = orderedArchiveEntries(skillRoot);
    const archive = path.join(tempRoot, `${name}.zip`);
    execFileSync("zip", ["-q", "-X", archive, ...entries], { cwd: skillRoot });
    const rawEntries = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" })
      .split(/\r?\n/)
      .filter(Boolean);
    return { archive, entries, rawEntries };
  }
  const firstArchive = buildArchiveFixture("archive-first", archiveFiles);
  const secondArchive = buildArchiveFixture("archive-second", [...archiveFiles].reverse());
  const expectedArchiveEntries = [...archiveFiles].sort(compareNames);
  expect(
    JSON.stringify(firstArchive.entries) === JSON.stringify(expectedArchiveEntries),
    "ZIP entries should use portable sorted POSIX paths",
  );
  expect(
    JSON.stringify(firstArchive.rawEntries) === JSON.stringify(expectedArchiveEntries),
    "ZIP raw entry order should match the deterministic entry list",
  );
  expect(
    JSON.stringify(secondArchive.rawEntries) === JSON.stringify(expectedArchiveEntries),
    "ZIP entry order should ignore filesystem creation order",
  );
  expect(
    digest(readFileSync(firstArchive.archive)) === digest(readFileSync(secondArchive.archive)),
    "ZIP bytes should be stable across filesystem creation orders",
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error("Build integrity tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Build integrity tests passed for descriptions, 35 plugin Skills, manifest ordering, filesystem perturbation, and ZIP determinism.");
