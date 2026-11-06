import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  catalogDistributionRegistry,
  checkCatalogs,
  collectCatalogModel,
  generatedCatalogs,
  renderCatalog,
} from "./generate-skill-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const model = collectCatalogModel(root);

for (const filename of ["README.md", "README.zh-CN.md"]) {
  const content = readFileSync(path.join(root, filename), "utf8");
  assert.doesNotMatch(content, /prepared stable release|publication is pending|准备发布的稳定版本|尚待最终发布门禁/,
    `${filename} must describe the completed stable publication`);
}
for (const filename of ["docs/WORKFLOW_COORDINATION.md", "docs/WORKFLOW_COORDINATION.zh-CN.md"]) {
  const content = readFileSync(path.join(root, filename), "utf8");
  assert.doesNotMatch(content, /Unpublished 0\.9\.0-beta\.1|0\.9\.0-beta\.1 候选，尚未发布/,
    `${filename} must identify the shipped coordination implementation`);
}
for (const filename of ["docs/WORKFLOW_COOKBOOK.md", "docs/WORKFLOW_COOKBOOK.zh-CN.md"]) {
  const content = readFileSync(path.join(root, filename), "utf8");
  assert.doesNotMatch(content, /Document Data Doctor.*(?:Basic Skills|Basic Skill)/,
    `${filename} must not advertise removed Basic Skills`);
  assert.doesNotMatch(content, /every write or high-risk gate still requires its own authorization|每个写入或高风险门禁仍需独立授权|always need separate authorization|始终需要独立授权/,
    `${filename} must allow reuse of valid scoped authorization`);
}

assert.equal(model.projectVersion, "0.10.1", "expected prepared project version 0.10.1");
assert.equal(model.counts.packs, 3, "expected three active Packs");
assert.equal(model.counts.skills, 33, "expected 33 active Skills");
assert.equal(model.counts.pluginSkills, 33, "expected 33 plugin/ChatGPT-distributed Skills");
assert.equal(model.counts.regularOnlySkills, 0, "expected zero regular-build-only Skills");

const expectedPackCounts = new Map([
  ["engineering.repo-doctor", 26],
  ["productivity.productivity-toolkit", 5],
  ["engineering.skill-maintainer", 2],
]);
for (const pack of model.packs) {
  assert.equal(
    pack.skills.length,
    expectedPackCounts.get(pack.metadata.id),
    `unexpected active Skill count for ${pack.metadata.id}`,
  );
  assert.equal(pack.metadata.status, "beta", `${pack.metadata.id} should be beta`);
  if (pack.distribution) {
    assert.equal(
      pack.skills[0].interface.pluginVersion,
      pack.metadata.version,
      `${pack.metadata.id} Pack/plugin versions should match`,
    );
  }
}

const prefixCounts = new Map();
const publishedSlugs = new Set();
for (const pack of model.packs) {
  const distribution = catalogDistributionRegistry[pack.metadata.id] ?? null;
  for (const skill of pack.skills) {
    assert.equal(Boolean(skill.interface), Boolean(distribution), `unexpected distribution for ${skill.slug}`);
    assert.equal(skill.metadata.status, "beta", `${skill.slug} should be beta`);
    assert.match(skill.metadata.version, /^\d+\.\d+\.\d+$/, `${skill.slug} should use SemVer`);
    assert.ok(skill.examples.en, `missing English example for ${skill.slug}`);
    assert.ok(skill.examples["zh-CN"], `missing Chinese example for ${skill.slug}`);
    assert.ok(skill.examples.notUse.en.input, `missing English not-use example for ${skill.slug}`);
    assert.ok(skill.examples.notUse["zh-CN"].input, `missing Chinese not-use example for ${skill.slug}`);
    for (const neighbor of skill.neighbors) {
      assert.ok(model.skills.some((candidate) => candidate.slug === neighbor), `unknown neighbor ${neighbor}`);
    }
    if (!distribution) continue;
    prefixCounts.set(distribution.publishPrefix, (prefixCounts.get(distribution.publishPrefix) ?? 0) + 1);
    assert.ok(!publishedSlugs.has(skill.interface.publishedSlug), `duplicate published slug ${skill.interface.publishedSlug}`);
    publishedSlugs.add(skill.interface.publishedSlug);
  }
}
assert.deepEqual(Object.fromEntries(prefixCounts), { rd: 26, pt: 5, sm: 2 });

for (const locale of ["en", "zh-CN"]) {
  const first = renderCatalog(model, locale);
  const second = renderCatalog(collectCatalogModel(root), locale);
  assert.equal(first, second, `${locale} rendering is not deterministic`);
  for (const skill of model.skills) {
    const heading = `### \`${skill.slug}\` —`;
    assert.equal(first.split(heading).length - 1, 1, `${skill.slug} must occur once as a ${locale} heading`);
  }
}

for (const [filename, expected] of Object.entries(generatedCatalogs(model))) {
  assert.equal(readFileSync(path.join(root, filename), "utf8"), expected, `${filename} is stale`);
}
assert.deepEqual(checkCatalogs(root), [], "generated catalogs must be current");

console.log("User documentation catalog tests passed (3 Packs, 33 Skills, 33 plugin/ZIP distributions).");
