import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  inspectReleaseMetadata,
  releaseContract,
} from "./release-metadata.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checker = path.join(repositoryRoot, "scripts", "release-metadata.mjs");
const fixtureContract = Object.freeze({
  projectVersion: "0.2.0",
  releaseDate: "2026-07-15",
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
assert.equal(releaseContract.projectVersion, "0.2.0");
assert.deepEqual(
  Object.fromEntries(releaseContract.packs.map((pack) => [pack.id, pack.version])),
  {
    "engineering.repo-doctor": "0.6.0",
    "productivity.productivity-toolkit": "0.1.0",
    "engineering.skill-maintainer": "0.2.0",
    "office.document-data-doctor": "0.1.0",
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
  ["project version mismatch", "regresses below Release Candidate 0.2.0"],
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
  ["active Release Candidate Skill must not remain draft"],
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
  ["active Release Candidate Pack must be beta or stable"],
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
expectFailure(
  "changelog-unreleased-not-empty",
  (root) => replace(root, "CHANGELOG.md", "## Unreleased\n\n", "## Unreleased\n\n- Pending change.\n\n"),
  ["Unreleased must be empty"],
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
    "must keep Live-model routing accuracy UNKNOWN",
    "must record expected future tag v0.2.0",
  ],
);

console.log("Release metadata tests passed for the two-layer version contract, lifecycle rules, templates, deprecations, CHANGELOG, and RC documentation.");
