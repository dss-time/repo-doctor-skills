import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { discoverCanonicalSkillDirs, renderCodexSkill } from "./build-skills.mjs";
import { compareNames, walkFiles } from "./deterministic-files.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const compatibilityRoot = path.join(root, "skills");
const fixtureNames = new Set(["wrong-name", "valid-skill"]);

function frontmatter(filename) {
  const content = readFileSync(filename, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  assert.ok(match, `${path.relative(root, filename)}: missing YAML frontmatter`);
  const parsed = parse(match[1]);
  assert.ok(parsed && typeof parsed === "object" && !Array.isArray(parsed), `${path.relative(root, filename)}: frontmatter must be a mapping`);
  assert.equal(typeof parsed.name, "string", `${path.relative(root, filename)}: name must be a string`);
  assert.equal(typeof parsed.description, "string", `${path.relative(root, filename)}: description must be a string`);
  return parsed;
}

const canonicalDirs = discoverCanonicalSkillDirs(path.join(root, "packs"));
const expectedSlugs = canonicalDirs.map((directory) => path.basename(directory)).sort(compareNames);
assert.equal(new Set(expectedSlugs).size, expectedSlugs.length, "canonical active Skill slugs must be unique across Packs");

assert.ok(existsSync(compatibilityRoot), "skills/: generated skills.sh compatibility output is missing; run npm run build");
const distributableDirs = readdirSync(compatibilityRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(compatibilityRoot, entry.name, "SKILL.md")))
  .map((entry) => entry.name)
  .sort(compareNames);
assert.deepEqual(distributableDirs, expectedSlugs, "skills.sh compatibility output must exactly match canonical active Skill slugs");

const names = [];
for (const slug of distributableDirs) {
  assert.ok(!fixtureNames.has(slug), `fixture leaked into compatibility output: ${slug}`);
  const filename = path.join(compatibilityRoot, slug, "SKILL.md");
  const metadata = frontmatter(filename);
  assert.equal(metadata.name, slug, `${slug}: frontmatter name must match directory slug`);
  names.push(metadata.name);
  const canonicalDir = canonicalDirs.find((directory) => path.basename(directory) === slug);
  assert.equal(readFileSync(filename, "utf8"), renderCodexSkill(canonicalDir), `${slug}: generated SKILL.md drift`);
}
assert.equal(new Set(names).size, names.length, "skills.sh compatibility output contains duplicate Skill names");

const generatedFrontmatterFiles = [
  ...walkFiles(compatibilityRoot, (filename) => path.basename(filename) === "SKILL.md"),
  ...walkFiles(path.join(root, "plugins"), (filename) => path.basename(filename) === "SKILL.md"),
];
for (const filename of generatedFrontmatterFiles) frontmatter(filename);

console.log(`Expected active Skills = ${expectedSlugs.length}`);
console.log(`Distributable Skills = ${distributableDirs.length}`);
console.log("Missing = 0");
console.log("Extra = 0");
console.log("Duplicates = 0");
console.log("Fixtures = 0");
console.log("Parse errors = 0");
