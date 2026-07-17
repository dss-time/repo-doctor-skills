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

assert.equal(model.projectVersion, "0.2.0", "expected project Release Candidate 0.2.0");
assert.equal(model.counts.packs, 4, "expected four active Packs");
assert.equal(model.counts.skills, 38, "expected 38 active Skills");
assert.equal(model.counts.pluginSkills, 35, "expected 35 plugin/ChatGPT-distributed Skills");
assert.equal(model.counts.regularOnlySkills, 3, "expected three regular-build-only Skills");

const expectedPackCounts = new Map([
  ["engineering.repo-doctor", 25],
  ["productivity.productivity-toolkit", 8],
  ["engineering.skill-maintainer", 2],
  ["office.document-data-doctor", 3],
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
assert.deepEqual(Object.fromEntries(prefixCounts), { rd: 25, pt: 8, sm: 2 });

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

console.log("User documentation catalog tests passed (4 Packs, 38 Skills, 35 plugin/ZIP distributions).");
