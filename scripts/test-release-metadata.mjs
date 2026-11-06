import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  cpSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  inspectReleaseMetadata,
  releaseContract,
  promotionEvidenceVersion,
} from "./release-metadata.mjs";
import { liveEvidenceBinding, assertLiveEvidenceBinding } from "./live-evidence-binding.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checker = path.join(repositoryRoot, "scripts", "release-metadata.mjs");
const fixtureContract = Object.freeze({
  projectVersion: "0.2.0",
  releaseDate: "2026-07-15",
  releaseChannel: "candidate",
  liveModelStatus: "UNKNOWN",
  historicalProjectVersion: "0.1.0",
  historicalReleaseDate: "2026-07-09",
  historicalTag: "v0.0.1",
  packs: Object.freeze([
    Object.freeze({
      id: "engineering.demo",
      path: "engineering/demo",
      version: "0.5.0",
      activeSkillCount: 2,
      plugin: Object.freeze({ name: "demo-plugin", version: "0.5.0" }),
    }),
    Object.freeze({
      id: "office.basic",
      path: "office/basic",
      version: "0.1.0",
      activeSkillCount: 1,
      plugin: null,
    }),
  ]),
  skillVersionFloor: "0.1.0",
  skillVersionFloorOverrides: Object.freeze({
    "demo.migrated": "0.2.0",
  }),
  template: Object.freeze({
    path: "_template",
    packVersion: "0.1.0",
    skillVersion: "0.1.0",
    skillCount: 1,
  }),
  changelogPath: "CHANGELOG.md",
  releaseCandidateDocument: "docs/RELEASE_NOTES_DRAFT.md",
  marketplacePath: ".agents/plugins/marketplace.json",
});

function write(root, relative, content) {
  const filename = path.join(root, ...relative.split("/"));
  mkdirSync(path.dirname(filename), { recursive: true });
  writeFileSync(filename, content);
}

function replace(root, relative, search, replacement) {
  const filename = path.join(root, ...relative.split("/"));
  const source = readFileSync(filename, "utf8");
  assert.ok(source.includes(search), `${relative} fixture must contain ${search}`);
  writeFileSync(filename, source.replace(search, replacement));
}

function skillYaml({ id, version = "0.1.0", status = "beta" }) {
  return [
    `id: ${id}`,
    `version: ${version}`,
    `status: ${status}`,
    "",
  ].join("\n");
}

function createFixture(label) {
  const root = mkdtempSync(path.join(tmpdir(), `release-metadata-${label}-`));
  write(root, "package.json", `${JSON.stringify({ name: "fixture", version: "0.2.0", private: true }, null, 2)}\n`);
  write(
    root,
    "packs/engineering/demo/pack.yaml",
    [
      "id: engineering.demo",
      "version: 0.5.0",
      "status: beta",
      "skills:",
      "  - active",
      "  - migrated",
      "  - legacy",
      "",
    ].join("\n"),
  );
  write(root, "packs/engineering/demo/skills/active/skill.yaml", skillYaml({ id: "demo.active" }));
  write(
    root,
    "packs/engineering/demo/skills/migrated/skill.yaml",
    skillYaml({ id: "demo.migrated", version: "0.2.0", status: "stable" }),
  );
  write(
    root,
    "packs/engineering/demo/skills/legacy/skill.yaml",
    skillYaml({ id: "demo.legacy", status: "deprecated" }),
  );
  write(
    root,
    "packs/office/basic/pack.yaml",
    [
      "id: office.basic",
      "version: 0.1.0",
      "status: beta",
      "skills:",
      "  - basic",
      "",
    ].join("\n"),
  );
  write(root, "packs/office/basic/skills/basic/skill.yaml", skillYaml({ id: "office.basic" }));

  write(
    root,
    "packs/_template/pack.yaml",
    [
      "id: template.example",
      "version: 0.1.0",
      "status: draft",
      "skills:",
      "  - example-skill",
      "",
    ].join("\n"),
  );
  write(
    root,
    "packs/_template/skills/example-skill/skill.yaml",
    skillYaml({ id: "template.example-skill", status: "draft" }),
  );

  write(
    root,
    "plugins/demo-plugin/.codex-plugin/plugin.json",
    `${JSON.stringify({ name: "demo-plugin", version: "0.5.0", skills: "./skills/" }, null, 2)}\n`,
  );
  for (const slug of ["active", "migrated"]) {
    write(root, `plugins/demo-plugin/skills/${slug}/SKILL.md`, `---\nname: ${slug}\ndescription: fixture\n---\n`);
  }
  write(
    root,
    ".agents/plugins/marketplace.json",
    `${JSON.stringify({
      name: "fixture-marketplace",
      plugins: [
        {
          name: "demo-plugin",
          source: { source: "local", path: "./plugins/demo-plugin" },
          policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        },
      ],
    }, null, 2)}\n`,
  );

  write(
    root,
    "CHANGELOG.md",
    [
      "# Changelog",
      "",
      "## Unreleased",
      "",
      "## [0.2.0] - 2026-07-15",
      "",
      "### Added",
      "",
      "- Fixture capability.",
      "",
      "### Changed",
      "",
      "- Fixture behavior.",
      "",
      "### Fixed",
      "",
      "- Fixture defect.",
      "",
      "### Security",
      "",
      "- Fixture boundary.",
      "",
      "### Documentation",
      "",
      "- Fixture documentation.",
      "",
      "## [0.1.0] - 2026-07-09",
      "",
      "- Historical project release; its preserved tag is `v0.0.1`, a known label mismatch error.",
      "",
      "[Unreleased]: https://example.test/compare/v0.2.0...HEAD",
      "[0.2.0]: https://example.test/compare/v0.0.1...v0.2.0",
      "[0.1.0]: https://example.test/releases/tag/v0.0.1",
      "",
    ].join("\n"),
  );
  write(
    root,
    "docs/RELEASE_NOTES_DRAFT.md",
    "# v0.2.0 Release Candidate\n\nThis is a Release Candidate, not a completed release. Live-model routing remains UNKNOWN.\n",
  );
  return root;
}

function expectPass(label, mutate = () => {}) {
  const root = createFixture(label);
  try {
    mutate(root);
    const result = inspectReleaseMetadata(root, fixtureContract);
    assert.deepEqual(result.errors, [], `${label} should pass:\n${result.errors.join("\n")}`);
    return result;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function expectFailure(label, mutate, fragments) {
  const root = createFixture(label);
  try {
    mutate(root);
    const result = inspectReleaseMetadata(root, fixtureContract);
    assert.ok(result.errors.length > 0, `${label} should fail`);
    for (const fragment of fragments) {
      assert.ok(
        result.errors.some((error) => error.includes(fragment)),
        `${label} should report ${fragment}:\n${result.errors.join("\n")}`,
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const packSchema = JSON.parse(readFileSync(path.join(repositoryRoot, "schemas", "pack.schema.json"), "utf8"));
assert.ok(packSchema.required.includes("status"), "Pack Schema must require status");
assert.deepEqual(
  packSchema.properties.status.enum,
  ["draft", "beta", "stable", "deprecated"],
  "Pack Schema must use the lifecycle status vocabulary",
);
assert.equal(releaseContract.projectVersion, "0.10.1");
assert.equal(releaseContract.releaseChannel, "stable");
assert.equal(releaseContract.liveModelStatus, "PASS");
assert.equal(releaseContract.liveModelWaiver, null);
assert.equal(releaseContract.expectedLiveModelCases, 284);
assert.equal(releaseContract.liveModelEvidenceVersion, "0.10.0");

const promotionContract = { ...releaseContract, projectVersion: "0.9.0", liveModelEvidenceVersion: "0.9.0-beta.2", promotionRecord: "tests/reports/release-promotion-0.9.0.json", liveModelReport: "tests/reports/live-codex-skill-validation-0.9.0-beta.2.json", coordinationReport: "tests/reports/coordination-release-0.9.0-beta.2.json" };
const promotionRoot = mkdtempSync(path.join(tmpdir(), "release-promotion-"));
try {
  for (const name of ["packs", "skills", "package.json", "bin/repo-doctor-skills.mjs", "scripts/install.mjs",
    promotionContract.promotionRecord, promotionContract.liveModelReport, promotionContract.coordinationReport]) {
    const destination = path.join(promotionRoot, name);
    mkdirSync(path.dirname(destination), { recursive: true });
    cpSync(path.join(repositoryRoot, name), destination, { recursive: true });
  }
  const checkPromotion = () => {
    const errors = [];
    promotionEvidenceVersion(promotionRoot, promotionContract, errors);
    return errors;
  };
  assert.ok(checkPromotion().length > 0, "changed source cannot reuse the published promotion evidence");
  // Bind only this isolated synthetic fixture, preserving the historical record on disk.
  const fixtureRecordPath = path.join(promotionRoot, promotionContract.promotionRecord);
  const fixtureRecord = JSON.parse(readFileSync(fixtureRecordPath, "utf8"));
  fixtureRecord.content_binding = liveEvidenceBinding(promotionRoot);
  const { version: fixtureVersion, ...fixtureManifest } = JSON.parse(readFileSync(path.join(promotionRoot, "package.json"), "utf8"));
  fixtureRecord.package_manifest_without_version = fixtureManifest;
  writeFileSync(fixtureRecordPath, JSON.stringify(fixtureRecord));
  assert.deepEqual(checkPromotion(), [], "equivalent fixture accepts matching evidence");
  for (const filename of ["scripts/install.mjs", "bin/repo-doctor-skills.mjs", promotionContract.liveModelReport,
    "packs/engineering/repo-doctor/skills/repo-onboarding/instructions.en.md", "skills/repo-onboarding/SKILL.md"]) {
    const absolute = path.join(promotionRoot, filename);
    const original = readFileSync(absolute);
    writeFileSync(absolute, Buffer.concat([original, Buffer.from("\nchanged\n")]));
    assert.ok(checkPromotion().length > 0, `${filename} changes must block promotion`);
    writeFileSync(absolute, original);
  }
  const packagePath = path.join(promotionRoot, "package.json");
  const originalPackage = readFileSync(packagePath);
  const changedPackage = JSON.parse(originalPackage);
  changedPackage.engines.node = ">=24";
  writeFileSync(packagePath, JSON.stringify(changedPackage));
  assert.ok(checkPromotion().some(error => error.includes("manifest changed")));
  writeFileSync(packagePath, originalPackage);
  const recordPath = path.join(promotionRoot, promotionContract.promotionRecord);
  const originalRecord = readFileSync(recordPath);
  const invalidRecord = JSON.parse(originalRecord);
  invalidRecord.target_version = "1.0.0";
  writeFileSync(recordPath, JSON.stringify(invalidRecord));
  assert.ok(checkPromotion().some(error => error.includes("invalid version-scoped")));
  writeFileSync(recordPath, originalRecord);

  const patchContract = { ...promotionContract, projectVersion: "0.10.1", liveModelEvidenceVersion: "0.10.0" };
  const patchRecord = {
    ...JSON.parse(originalRecord), target_version: "0.10.1", source_version: "0.10.0",
    source_tag: "v0.10.0", scope: "equivalent-documentation-patch",
  };
  writeFileSync(recordPath, JSON.stringify(patchRecord));
  const checkPatch = (contract = patchContract) => {
    const errors = [];
    promotionEvidenceVersion(promotionRoot, contract, errors);
    return errors;
  };
  assert.deepEqual(checkPatch(), [], "documentation patch reuses equivalent source evidence");
  for (const target of ["0.10.0", "0.10.2", "0.11.0", "0.10.1-beta.1"]) {
    writeFileSync(recordPath, JSON.stringify({ ...patchRecord, target_version: target }));
    assert.ok(checkPatch({ ...patchContract, projectVersion: target }).length > 0,
      `${target} cannot use the adjacent stable documentation-patch path`);
  }
  writeFileSync(recordPath, JSON.stringify(patchRecord));
  for (const filename of ["scripts/install.mjs", "bin/repo-doctor-skills.mjs", patchContract.liveModelReport,
    patchContract.coordinationReport, "packs/engineering/repo-doctor/skills/repo-onboarding/instructions.en.md",
    "skills/repo-onboarding/SKILL.md"]) {
    const absolute = path.join(promotionRoot, filename);
    const original = readFileSync(absolute);
    writeFileSync(absolute, Buffer.concat([original, Buffer.from("\nchanged\n")]));
    assert.ok(checkPatch().length > 0, `${filename} changes must block documentation-patch evidence reuse`);
    writeFileSync(absolute, original);
  }
  writeFileSync(packagePath, JSON.stringify(changedPackage));
  assert.ok(checkPatch().some(error => error.includes("manifest changed")));
  writeFileSync(packagePath, originalPackage);
  rmSync(recordPath);
  assert.ok(checkPromotion().length > 0, "promotion requires its explicit record");
} finally {
  rmSync(promotionRoot, { recursive: true, force: true });
}
assert.deepEqual(
  Object.fromEntries(releaseContract.packs.map((pack) => [pack.id, pack.version])),
  {
    "engineering.repo-doctor": "0.12.0",
    "productivity.productivity-toolkit": "0.2.0",
    "engineering.skill-maintainer": "0.2.1",
  },
  "default contract must preserve the confirmed two-layer Pack versions",
);

const noMode = spawnSync(process.execPath, [checker], { encoding: "utf8" });
assert.equal(noMode.status, 1, "release metadata checker must not provide an implicit write mode");
assert.match(noMode.stderr, /read-only/);

const valid = expectPass("valid");
assert.deepEqual(valid.summary, { projectVersion: "0.2.0", packs: 2, activeSkills: 3, plugins: 1 });

expectFailure(
  "project-mismatch",
  (root) => replace(root, "package.json", '"version": "0.2.0"', '"version": "0.1.0"'),
  ["project version mismatch", "regresses below release contract 0.2.0"],
);
expectFailure(
  "pack-regression",
  (root) => replace(root, "packs/engineering/demo/pack.yaml", "version: 0.5.0", "version: 0.4.0"),
  ["Pack version 0.4.0 regresses below release contract 0.5.0"],
);
expectFailure(
  "plugin-regression",
  (root) => replace(root, "plugins/demo-plugin/.codex-plugin/plugin.json", '"version": "0.5.0"', '"version": "0.4.0"'),
  ["plugin version 0.4.0 regresses below release contract 0.5.0"],
);
expectFailure(
  "illegal-skill-version",
  (root) => replace(root, "packs/engineering/demo/skills/active/skill.yaml", "version: 0.1.0", "version: 1.0"),
  ["Skill version must be strict SemVer x.y.z"],
);
expectFailure(
  "independent-skill-regression",
  (root) => replace(root, "packs/engineering/demo/skills/migrated/skill.yaml", "version: 0.2.0", "version: 0.1.0"),
  ["Skill version 0.1.0 regresses below independent floor 0.2.0"],
);
expectFailure(
  "active-draft",
  (root) => replace(root, "packs/engineering/demo/skills/active/skill.yaml", "status: beta", "status: draft"),
  ["active release Skill must not remain draft"],
);
expectFailure(
  "unknown-skill-status",
  (root) => replace(root, "packs/engineering/demo/skills/active/skill.yaml", "status: beta", "status: candidate"),
  ["unknown Skill status"],
);
expectFailure(
  "unknown-pack-status",
  (root) => replace(root, "packs/engineering/demo/pack.yaml", "status: beta", "status: candidate"),
  ["unknown Pack status"],
);
expectFailure(
  "deprecated-pack",
  (root) => replace(root, "packs/engineering/demo/pack.yaml", "status: beta", "status: deprecated"),
  ["active release Pack must be beta or stable"],
);
expectFailure(
  "pack-maturity",
  (root) => replace(root, "packs/engineering/demo/pack.yaml", "status: beta", "status: stable"),
  ["Pack status stable is higher than its least-mature active Skill"],
);
expectFailure(
  "template-activated",
  (root) => replace(root, "packs/_template/pack.yaml", "status: draft", "status: beta"),
  ["template Pack must remain draft"],
);
expectFailure(
  "template-skill-activated",
  (root) => replace(root, "packs/_template/skills/example-skill/skill.yaml", "status: draft", "status: beta"),
  ["template Skill must remain draft"],
);
expectFailure(
  "deprecated-distributed",
  (root) => write(root, "plugins/demo-plugin/skills/legacy/SKILL.md", "---\nname: legacy\ndescription: stale\n---\n"),
  ["deprecated Skills must stay excluded"],
);
expectFailure(
  "marketplace-version",
  (root) => replace(root, ".agents/plugins/marketplace.json", '"name": "demo-plugin",', '"name": "demo-plugin",\n      "version": "0.5.0",'),
  ["must inherit version from its plugin manifest"],
);
expectFailure(
  "lock-mismatch",
  (root) => write(
    root,
    "package-lock.json",
    `${JSON.stringify({ name: "fixture", version: "0.1.0", lockfileVersion: 3, packages: { "": { version: "0.1.0" } } }, null, 2)}\n`,
  ),
  ["package-lock.json: project version 0.1.0 regresses", 'package-lock.json packages[""]: project version 0.1.0 regresses'],
);
expectFailure(
  "changelog-unreleased",
  (root) => replace(root, "CHANGELOG.md", "## Unreleased", "## Pending"),
  ["must retain an Unreleased section"],
);
expectPass(
  "changelog-unreleased-development",
  (root) => replace(root, "CHANGELOG.md", "## Unreleased\n\n", "## Unreleased\n\n- Pending change.\n\n"),
);
expectFailure(
  "changelog-release",
  (root) => replace(root, "CHANGELOG.md", "### Fixed", "### Repairs"),
  ["0.2.0 section is missing ### Fixed"],
);
expectFailure(
  "changelog-history",
  (root) => replace(root, "CHANGELOG.md", "## [0.1.0] - 2026-07-09", "## [0.1.1] - 2026-07-09"),
  ["missing historical 0.1.0 section"],
);
expectFailure(
  "changelog-history-tag",
  (root) => replace(
    root,
    "CHANGELOG.md",
    "Historical project release; its preserved tag is `v0.0.1`, a known label mismatch error.",
    "Historical project release.",
  ),
  ["historical section must explicitly record tag v0.0.1 as an error/mismatch"],
);
expectFailure(
  "rc-document",
  (root) => write(root, "docs/RELEASE_NOTES_DRAFT.md", "# v0.1.0 Draft\n\nWork in progress.\n"),
  [
    "title must identify project version 0.2.0",
    "must describe the artifact as a Release Candidate",
    "must disclose Live-model routing accuracy as UNKNOWN",
    "must record release tag v0.2.0",
  ],
);

const historicalWaiver = {
  authorized: true,
  version: releaseContract.projectVersion,
  scope: "live-model-status-only",
  record: "docs/RELEASE_PREPARATION_0.3.0.md",
};
const missingWaiver = inspectReleaseMetadata(repositoryRoot, {
  ...releaseContract,
  releaseChannel: "stable",
  liveModelStatus: "UNKNOWN",
  liveModelWaiver: null,
});
assert.ok(
  missingWaiver.errors.some((error) => error.includes("requires an explicit maintainer waiver")),
  "stable UNKNOWN Live-model status must require explicit authorization",
);
const broadWaiver = inspectReleaseMetadata(repositoryRoot, {
  ...releaseContract,
  releaseChannel: "stable",
  liveModelStatus: "UNKNOWN",
  liveModelWaiver: { ...historicalWaiver, scope: "all-release-gates" },
});
assert.ok(
  broadWaiver.errors.some((error) => error.includes("scope must be live-model-status-only")),
  "Live-model waiver must not suppress other release gates",
);

const development = inspectReleaseMetadata(repositoryRoot, releaseContract, { development: true });
assert.deepEqual(development.errors, [], "development must remain consistent without reusing historical release evidence");
const developmentCli = spawnSync(process.execPath, [checker, "--check", "--development"], { encoding: "utf8" });
assert.equal(developmentCli.status, 0, developmentCli.stderr);
assert.match(developmentCli.stdout, /formal release readiness is not checked/);

const evolution = createFixture("development");
try {
  replace(evolution, "packs/engineering/demo/pack.yaml", "version: 0.5.0", "version: 0.5.1");
  replace(evolution, "plugins/demo-plugin/.codex-plugin/plugin.json", '"version": "0.5.0"', '"version": "0.5.1"');
  assert.deepEqual(inspectReleaseMetadata(evolution, fixtureContract, { development: true }).errors, []);
  assert.ok(inspectReleaseMetadata(evolution, fixtureContract).errors.some((error) => error.includes("version mismatch")));
  replace(evolution, "plugins/demo-plugin/.codex-plugin/plugin.json", '"version": "0.5.1"', '"version": "0.5.0"');
  assert.ok(inspectReleaseMetadata(evolution, fixtureContract, { development: true }).errors.some((error) => error.includes("plugin version")), "daily checks still catch Pack/plugin drift");
  replace(evolution, "packs/engineering/demo/pack.yaml", "version: 0.5.1", "version: 0.4.0");
  assert.ok(inspectReleaseMetadata(evolution, fixtureContract, { development: true }).errors.some((error) => error.includes("regresses below")));
} finally {
  rmSync(evolution, { recursive: true, force: true });
}

const evidenceRoot = createFixture("content-binding");
try {
  const contract = { ...fixtureContract, releaseChannel: "stable", liveModelStatus: "PASS", liveModelReport: "report.json", expectedLiveModelCases: 3 };
  write(evidenceRoot, "docs/RELEASE_NOTES_DRAFT.md", "# v0.2.0 stable release\nLive-model PASS\n");
  const inputs = ["packs/engineering/demo/skills/active/instructions.en.md", "packs/engineering/demo/references/rules.md", "packs/engineering/demo/workflows.yaml", "skills/active/SKILL.md", "skills/active/references/rules.md"];
  for (const filename of inputs) write(evidenceRoot, filename, "original\n");
  const binding = liveEvidenceBinding(evidenceRoot);
  const report = { project_version: "0.2.0", result: "PASS", summary: { total: 3, passed: 3, failed: 0, blocked: 0 }, content_binding: binding };
  write(evidenceRoot, "report.json", JSON.stringify(report));
  assert.deepEqual(inspectReleaseMetadata(evidenceRoot, contract).errors, [], "matching complete evidence passes the formal gate");
  write(evidenceRoot, "docs/RELEASE_NOTES_DRAFT.md", "# v0.2.0 Release Candidate\nLive-model PASS\n");
  const candidateContract = { ...contract, releaseChannel: "candidate" };
  assert.deepEqual(inspectReleaseMetadata(evidenceRoot, candidateContract).errors, []);
  write(evidenceRoot, "report.json", JSON.stringify({ ...report, result: "FAIL" }));
  assert.ok(inspectReleaseMetadata(evidenceRoot, candidateContract).errors.some((error) => error.includes("final result must be PASS")), "candidate PASS claims require valid model evidence");
  write(evidenceRoot, "report.json", JSON.stringify(report));
  write(evidenceRoot, "docs/RELEASE_NOTES_DRAFT.md", "# v0.2.0 stable release\nLive-model PASS\n");
  assert.ok(inspectReleaseMetadata(evidenceRoot, { ...contract, projectVersion: "0.3.0", liveModelEvidenceVersion: "0.2.0" }).errors.some((error) => error.includes("must belong to the current project version")), "a historical evidence version cannot certify a new release");
  for (const filename of [...inputs, "skills/active/references/added.md"]) {
    write(evidenceRoot, filename, "changed\n");
    assert.ok(inspectReleaseMetadata(evidenceRoot, contract).errors.some((error) => error.includes("missing or stale")), `${filename} must invalidate old PASS evidence`);
    assert.throws(() => assertLiveEvidenceBinding(binding, liveEvidenceBinding(evidenceRoot)), /missing or stale/, "resume must also reject changed content");
    if (inputs.includes(filename)) write(evidenceRoot, filename, "original\n");
    else rmSync(path.join(evidenceRoot, filename));
  }
  const resource = "skills/active/references/rules.md";
  rmSync(path.join(evidenceRoot, resource));
  assert.ok(inspectReleaseMetadata(evidenceRoot, contract).errors.some((error) => error.includes("missing or stale")), "removed resources invalidate evidence");
  write(evidenceRoot, resource, "original\n");
  delete report.content_binding;
  write(evidenceRoot, "report.json", JSON.stringify(report));
  assert.ok(inspectReleaseMetadata(evidenceRoot, contract).errors.some((error) => error.includes("missing or stale")), "legacy PASS without binding stays historical");
  assert.deepEqual(inspectReleaseMetadata(evidenceRoot, contract, { development: true }).errors, [], "daily checks do not require model calls");
} finally {
  rmSync(evidenceRoot, { recursive: true, force: true });
}
for (const waiver of [
  { ...historicalWaiver, authorized: false },
  { ...historicalWaiver, version: "0.7.2" },
  { ...historicalWaiver, record: "docs/missing-waiver.md" },
  { ...historicalWaiver, scope: "all-release-gates" },
]) {
  const result = inspectReleaseMetadata(repositoryRoot, { ...releaseContract, releaseChannel: "stable", liveModelStatus: "UNKNOWN", liveModelWaiver: waiver });
  assert.ok(result.errors.some((error) => error.includes("not release-eligible")), "invalid waiver cannot bypass model evidence");
}
const futureRelease = inspectReleaseMetadata(repositoryRoot, {
  ...releaseContract, releaseChannel: "stable", projectVersion: "0.7.4", liveModelStatus: "UNKNOWN",
  liveModelWaiver: { ...historicalWaiver, version: "0.7.4" },
});
assert.ok(futureRelease.errors.some((error) => error.includes("not release-eligible")), "future stable releases must still require PASS");

console.log("Release metadata tests passed for version contracts, lifecycle rules, stable authorization, templates, deprecations, CHANGELOG, and release documentation.");
