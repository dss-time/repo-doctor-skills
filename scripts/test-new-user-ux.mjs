import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverActivePackSkills, discoverPackRoots } from "./sync-pack-plugin.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pairs = [
  ["README.md", "README.zh-CN.md"],
  ["docs/USER_MANUAL.md", "docs/USER_MANUAL.zh-CN.md"],
  ["docs/ADVANCED_USAGE.md", "docs/ADVANCED_USAGE.zh-CN.md"],
  ["docs/guides/problem-to-skill.md", "docs/guides/problem-to-skill.zh-CN.md"],
];

const recommendedSkills = [
  "repo-doctor-router",
  "requirements-clarification",
  "bug-root-cause-analysis",
  "safe-fix-implementation",
  "safe-test-implementation",
  "safe-code-review",
  "decision-prototype",
];

function read(relative) {
  return readFileSync(path.join(root, relative), "utf8");
}

function headingLevels(content) {
  return [...content.matchAll(/^(#{1,3})\s+/gm)].map((match) => match[1].length);
}

function assertLocalLink(source, target) {
  const file = target.split("#", 1)[0];
  assert.ok(existsSync(path.resolve(path.dirname(path.join(root, source)), file)), `${source}: broken ${target}`);
}

for (const [english, chinese] of pairs) {
  assert.deepEqual(headingLevels(read(english)), headingLevels(read(chinese)), `${english}: bilingual heading structure drift`);
}

for (const relative of ["README.md", "README.zh-CN.md"]) {
  const content = read(relative);
  const firstThirty = content.split(/\r?\n/).slice(0, 30).join("\n");
  assert.match(firstThirty, /Repo Doctor Skills/);
  assert.match(firstThirty, /npx repo-doctor-skills install/);
  assert.match(firstThirty, /repo-doctor-router/);
  assert.match(firstThirty, /(?:Minimal example|最小示例)/);
  for (const forbidden of ["canonical", "adapters", "dist", "generated compatibility output", "plugin-backed distribution"]) {
    assert.ok(!firstThirty.toLowerCase().includes(forbidden), `${relative}: first 30 lines contain ${forbidden}`);
  }
  assert.match(content, /^npx repo-doctor-skills install$/m);
  assert.ok(!/(?:npx repo-doctor-skills install|codex plugin marketplace add)[^\n]*[<{][^\n]*[>}]/.test(content), `${relative}: install command contains a placeholder`);
}

const readme = read("README.md");
const readmeZh = read("README.zh-CN.md");
assert.match(readme, /## Recommended/);
assert.match(readme, /## Full/);
assert.match(readmeZh, /## 推荐安装/);
assert.match(readmeZh, /## 完整安装/);
for (const slug of recommendedSkills) {
  assert.ok(readme.includes(`\`$${slug}\``), `README.md: missing Recommended Skill ${slug}`);
  assert.ok(readmeZh.includes(`\`$${slug}\``), `README.zh-CN.md: missing Recommended Skill ${slug}`);
}

assert.ok(readme.includes("docs/ADVANCED_USAGE.md"));
assert.ok(readmeZh.includes("docs/ADVANCED_USAGE.zh-CN.md"));
assert.ok(readme.includes("docs/guides/problem-to-skill.md"));
assert.ok(readmeZh.includes("docs/guides/problem-to-skill.zh-CN.md"));
assertLocalLink("README.md", "docs/ADVANCED_USAGE.md");
assertLocalLink("README.zh-CN.md", "docs/ADVANCED_USAGE.zh-CN.md");
assertLocalLink("README.md", "docs/guides/problem-to-skill.md");
assertLocalLink("README.zh-CN.md", "docs/guides/problem-to-skill.zh-CN.md");

const packRoots = discoverPackRoots(path.join(root, "packs"));
const activeCount = packRoots.reduce((total, packRoot) => total + discoverActivePackSkills(packRoot).length, 0);
const pluginCount = ["repo-doctor", "productivity-toolkit", "skill-maintainer"].reduce((total, plugin) => {
  const skillsRoot = path.join(root, "plugins", plugin, "skills");
  return total + readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(path.join(skillsRoot, entry.name, "SKILL.md"))).length;
}, 0);
assert.equal(activeCount, 40);
assert.equal(pluginCount, 37);
for (const relative of ["docs/USER_MANUAL.md", "docs/USER_MANUAL.zh-CN.md", "docs/ADVANCED_USAGE.md", "docs/ADVANCED_USAGE.zh-CN.md"]) {
  const content = read(relative);
  for (const count of ["40", "37", "27"]) assert.ok(content.includes(count), `${relative}: missing distribution count ${count}`);
}

for (const relative of ["README.md", "README.zh-CN.md", "docs/USER_MANUAL.md", "docs/USER_MANUAL.zh-CN.md"]) {
  const content = read(relative);
  assert.match(content, /Project Release Version/i);
  assert.match(content, /Plugin \/ Pack Component Version/i);
}

for (const [english, chinese] of pairs) {
  for (const relative of [english, chinese]) {
    assert.doesNotMatch(read(relative), /\/Users\/[A-Za-z0-9._-]+\/|\/home\/[A-Za-z0-9._-]+\/|[A-Za-z]:\\Users\\/);
  }
}

console.log(`New-user UX tests passed: bilingual entry flow, ${recommendedSkills.length} Recommended Skills, ${activeCount} active Skills.`);
