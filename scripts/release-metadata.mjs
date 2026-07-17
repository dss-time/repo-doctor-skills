import {
  existsSync,
  readFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  compareNames,
  sortedDirectoryEntries,
} from "./deterministic-files.mjs";
import { discoverPackRoots } from "./sync-pack-plugin.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*))*))?$/;
const knownStatuses = new Set(["draft", "beta", "stable", "deprecated"]);
const buildActiveStatuses = new Set(["draft", "beta", "stable"]);
const releaseEligibleStatuses = new Set(["beta", "stable"]);
const maturityRank = new Map([
  ["draft", 0],
  ["beta", 1],
  ["stable", 2],
]);

// This is the confirmed two-layer Release Candidate contract: one project
// release version plus independently evolving Pack/plugin/Skill component
// versions. Skill versions are protected against invalid values and known
// regressions without being forced to match their Pack.
export const releaseContract = Object.freeze({
  projectVersion: "0.3.0-rc.1",
  releaseDate: "2026-07-17",
  historicalProjectVersion: "0.1.0",
  historicalReleaseDate: "2026-07-09",
  historicalTag: "v0.0.1",
  packs: Object.freeze([
    Object.freeze({
      id: "engineering.repo-doctor",
      path: "engineering/repo-doctor",
      version: "0.6.0",
      activeSkillCount: 25,
      plugin: Object.freeze({ name: "repo-doctor", version: "0.6.0" }),
    }),
    Object.freeze({
      id: "productivity.productivity-toolkit",
      path: "productivity/productivity-toolkit",
      version: "0.1.0",
      activeSkillCount: 8,
      plugin: Object.freeze({ name: "productivity-toolkit", version: "0.1.0" }),
    }),
    Object.freeze({
      id: "engineering.skill-maintainer",
      path: "engineering/skill-maintainer",
      version: "0.2.0",
      activeSkillCount: 2,
      plugin: Object.freeze({ name: "skill-maintainer", version: "0.2.0" }),
    }),
    Object.freeze({
      id: "office.document-data-doctor",
      path: "office/document-data-doctor",
      version: "0.1.0",
      activeSkillCount: 3,
      plugin: null,
    }),
  ]),
  skillVersionFloor: "0.1.0",
  skillVersionFloorOverrides: Object.freeze({
    "productivity.report-writer": "0.2.0",
    "repo.bug-root-cause-analysis": "0.2.0",
    "repo.safe-code-review": "0.2.0",
    "repo.safe-test-implementation": "0.2.0",
    "maintainer.skill-authoring": "0.2.0",
    "maintainer.skill-quality-audit": "0.2.0",
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

function posixRelative(root, filename) {
  return path.relative(root, filename).split(path.sep).join("/") || ".";
}

function isSemver(value) {
  return typeof value === "string" && semverPattern.test(value);
}

function compareSemver(left, right) {
  const leftMatch = left.match(semverPattern);
  const rightMatch = right.match(semverPattern);
  if (!leftMatch || !rightMatch) return 0;
  const leftParts = leftMatch.slice(1, 4).map(Number);
  const rightParts = rightMatch.slice(1, 4).map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
  }
  const leftPrerelease = leftMatch[4];
  const rightPrerelease = rightMatch[4];
  if (!leftPrerelease && !rightPrerelease) return 0;
  if (!leftPrerelease) return 1;
  if (!rightPrerelease) return -1;
  const leftIdentifiers = leftPrerelease.split(".");
  const rightIdentifiers = rightPrerelease.split(".");
  const length = Math.max(leftIdentifiers.length, rightIdentifiers.length);
  for (let index = 0; index < length; index += 1) {
    const leftIdentifier = leftIdentifiers[index];
    const rightIdentifier = rightIdentifiers[index];
    if (leftIdentifier === undefined) return -1;
    if (rightIdentifier === undefined) return 1;
    if (leftIdentifier === rightIdentifier) continue;
    const leftNumeric = /^\d+$/.test(leftIdentifier);
    const rightNumeric = /^\d+$/.test(rightIdentifier);
    if (leftNumeric && rightNumeric) return Number(leftIdentifier) - Number(rightIdentifier);
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
    return leftIdentifier.localeCompare(rightIdentifier, "en");
  }
  return 0;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readJson(root, filename, errors) {
  const absolute = path.join(root, filename);
  if (!existsSync(absolute)) {
    errors.push(`${filename}: missing`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(absolute, "utf8"));
  } catch (error) {
    errors.push(`${filename}: invalid JSON (${error.message})`);
    return null;
  }
}

function readYaml(root, filename, errors) {
  const absolute = path.join(root, filename);
  if (!existsSync(absolute)) {
    errors.push(`${filename}: missing`);
    return null;
  }
  try {
    return parseYamlSubset(readFileSync(absolute, "utf8"));
  } catch (error) {
    errors.push(`${filename}: invalid YAML (${error.message})`);
    return null;
  }
}

function checkExactVersion(errors, label, actual, expected, kind = "version") {
  if (!isSemver(actual)) {
    errors.push(`${label}: ${kind} must be strict SemVer x.y.z[-prerelease], found ${JSON.stringify(actual)}`);
    return;
  }
  if (!isSemver(expected)) {
    errors.push(`release contract: invalid expected ${kind} ${JSON.stringify(expected)} for ${label}`);
    return;
  }
  if (actual === expected) return;
  if (compareSemver(actual, expected) < 0) {
    errors.push(`${label}: ${kind} ${actual} regresses below release contract ${expected}`);
  } else {
    errors.push(`${label}: ${kind} mismatch; release contract is ${expected}, found ${actual}`);
  }
}

function skillDirectories(packRoot) {
  const skillsRoot = path.join(packRoot, "skills");
  if (!existsSync(skillsRoot)) return [];
  return sortedDirectoryEntries(skillsRoot)
    .filter((entry) => entry.isDirectory() && existsSync(path.join(skillsRoot, entry.name, "skill.yaml")))
    .map((entry) => entry.name);
}

function pluginSkillDirectories(pluginRoot) {
  const skillsRoot = path.join(pluginRoot, "skills");
  if (!existsSync(skillsRoot)) return [];
  return sortedDirectoryEntries(skillsRoot)
    .filter((entry) => entry.isDirectory() && existsSync(path.join(skillsRoot, entry.name, "SKILL.md")))
    .map((entry) => entry.name);
}

function sameNames(left, right) {
  return JSON.stringify([...left].sort(compareNames)) === JSON.stringify([...right].sort(compareNames));
}

function auditPackage(root, contract, errors) {
  const packageJson = readJson(root, "package.json", errors);
  if (!packageJson) return;
  if (!isSemver(packageJson.version)) {
    errors.push(`package.json: project version must be strict SemVer x.y.z[-prerelease], found ${JSON.stringify(packageJson.version)}`);
  } else if (packageJson.version !== contract.projectVersion) {
    const relation = compareSemver(packageJson.version, contract.projectVersion) < 0
      ? "regresses below"
      : "differs from";
    errors.push(`package.json: project version mismatch; ${packageJson.version} ${relation} Release Candidate ${contract.projectVersion}`);
  }

  const lockPath = path.join(root, "package-lock.json");
  if (!existsSync(lockPath)) return;
  const lock = readJson(root, "package-lock.json", errors);
  if (!lock) return;
  checkExactVersion(errors, "package-lock.json", lock.version, contract.projectVersion, "project version");
  if (lock.packages && Object.hasOwn(lock.packages, "")) {
    checkExactVersion(
      errors,
      'package-lock.json packages[""]',
      lock.packages[""].version,
      contract.projectVersion,
      "project version",
    );
  }
}

function auditPacks(root, contract, errors) {
  const packsRoot = path.join(root, "packs");
  const actualPackRoots = discoverPackRoots(packsRoot);
  const actualById = new Map();
  for (const packRoot of actualPackRoots) {
    const relative = posixRelative(root, path.join(packRoot, "pack.yaml"));
    const metadata = readYaml(root, relative, errors);
    if (!metadata || typeof metadata.id !== "string") continue;
    if (actualById.has(metadata.id)) errors.push(`${relative}: duplicate active Pack id ${metadata.id}`);
    else actualById.set(metadata.id, { root: packRoot, relative, metadata });
  }

  const expectedIds = new Set(contract.packs.map((pack) => pack.id));
  for (const id of actualById.keys()) {
    if (!expectedIds.has(id)) errors.push(`packs: unexpected active Pack ${id}`);
  }

  const results = new Map();
  const globalActiveSlugs = new Map();
  for (const expected of contract.packs) {
    const actual = actualById.get(expected.id);
    const expectedRoot = path.resolve(packsRoot, ...expected.path.split("/"));
    if (!actual) {
      errors.push(`packs/${expected.path}/pack.yaml: missing active Pack ${expected.id}`);
      continue;
    }
    if (path.resolve(actual.root) !== expectedRoot) {
      errors.push(`${actual.relative}: Pack ${expected.id} must be located at packs/${expected.path}`);
    }
    checkExactVersion(errors, actual.relative, actual.metadata.version, expected.version, "Pack version");
    if (!knownStatuses.has(actual.metadata.status)) {
      errors.push(`${actual.relative}: unknown Pack status ${JSON.stringify(actual.metadata.status)}`);
    } else if (!releaseEligibleStatuses.has(actual.metadata.status)) {
      errors.push(`${actual.relative}: active Release Candidate Pack must be beta or stable, found ${actual.metadata.status}`);
    }

    if (!Array.isArray(actual.metadata.skills)) {
      errors.push(`${actual.relative}: skills must be a sequence`);
      continue;
    }
    if (new Set(actual.metadata.skills).size !== actual.metadata.skills.length) {
      errors.push(`${actual.relative}: skills must not contain duplicates`);
    }

    const actualSlugs = skillDirectories(actual.root);
    const metadataBySlug = new Map();
    for (const slug of actualSlugs) {
      const relative = posixRelative(root, path.join(actual.root, "skills", slug, "skill.yaml"));
      const metadata = readYaml(root, relative, errors);
      if (!metadata) continue;
      metadataBySlug.set(slug, metadata);
      if (!isSemver(metadata.version)) {
        errors.push(`${relative}: Skill version must be strict SemVer x.y.z[-prerelease], found ${JSON.stringify(metadata.version)}`);
      } else {
        const floor = contract.skillVersionFloorOverrides[metadata.id] ?? contract.skillVersionFloor;
        if (!isSemver(floor)) {
          errors.push(`release contract: invalid Skill version floor ${JSON.stringify(floor)} for ${metadata.id}`);
        } else if (compareSemver(metadata.version, floor) < 0) {
          errors.push(`${relative}: Skill version ${metadata.version} regresses below independent floor ${floor}`);
        }
      }
      if (!knownStatuses.has(metadata.status)) {
        errors.push(`${relative}: unknown Skill status ${JSON.stringify(metadata.status)}`);
      } else if (metadata.status === "draft") {
        errors.push(`${relative}: active Release Candidate Skill must not remain draft`);
      }
    }

    for (const slug of actual.metadata.skills) {
      if (!metadataBySlug.has(slug)) errors.push(`${actual.relative}: lists missing canonical Skill ${slug}`);
    }
    const listed = new Set(actual.metadata.skills);
    const buildActiveSlugs = actualSlugs.filter((slug) => buildActiveStatuses.has(metadataBySlug.get(slug)?.status));
    const releaseEligibleSlugs = actualSlugs.filter((slug) => releaseEligibleStatuses.has(metadataBySlug.get(slug)?.status));
    for (const slug of buildActiveSlugs) {
      if (!listed.has(slug)) errors.push(`${actual.relative}: does not list active canonical Skill ${slug}`);
      const previous = globalActiveSlugs.get(slug);
      if (previous) errors.push(`${actual.relative}: active Skill slug ${slug} is already used by ${previous}`);
      else globalActiveSlugs.set(slug, actual.relative);
    }
    if (releaseEligibleSlugs.length !== expected.activeSkillCount) {
      errors.push(`${actual.relative}: expected ${expected.activeSkillCount} beta/stable Skills, found ${releaseEligibleSlugs.length}`);
    }
    if (releaseEligibleSlugs.length === 0) {
      errors.push(`${actual.relative}: active Release Candidate Pack has no beta/stable Skills`);
    } else if (maturityRank.has(actual.metadata.status)) {
      const lowestSkillRank = Math.min(
        ...releaseEligibleSlugs.map((slug) => maturityRank.get(metadataBySlug.get(slug).status)),
      );
      if (maturityRank.get(actual.metadata.status) > lowestSkillRank) {
        errors.push(`${actual.relative}: Pack status ${actual.metadata.status} is higher than its least-mature active Skill`);
      }
    }

    results.set(expected.id, {
      expected,
      root: actual.root,
      metadata: actual.metadata,
      buildActiveSlugs,
      releaseEligibleSlugs,
      deprecatedSlugs: actualSlugs.filter((slug) => metadataBySlug.get(slug)?.status === "deprecated"),
    });
  }
  return results;
}

function auditTemplate(root, contract, errors) {
  const templateRoot = path.join(root, "packs", ...contract.template.path.split("/"));
  const relativePack = posixRelative(root, path.join(templateRoot, "pack.yaml"));
  const pack = readYaml(root, relativePack, errors);
  if (!pack) return;
  checkExactVersion(errors, relativePack, pack.version, contract.template.packVersion, "template Pack version");
  if (pack.status !== "draft") errors.push(`${relativePack}: template Pack must remain draft, found ${pack.status}`);
  const slugs = skillDirectories(templateRoot);
  if (slugs.length !== contract.template.skillCount) {
    errors.push(`${relativePack}: expected ${contract.template.skillCount} template Skills, found ${slugs.length}`);
  }
  for (const slug of slugs) {
    const relative = posixRelative(root, path.join(templateRoot, "skills", slug, "skill.yaml"));
    const metadata = readYaml(root, relative, errors);
    if (!metadata) continue;
    checkExactVersion(errors, relative, metadata.version, contract.template.skillVersion, "template Skill version");
    if (metadata.status !== "draft") errors.push(`${relative}: template Skill must remain draft, found ${metadata.status}`);
  }
}

function auditPluginsAndMarketplace(root, contract, packResults, errors) {
  const expectedPlugins = new Map(
    contract.packs
      .filter((pack) => pack.plugin)
      .map((pack) => [pack.plugin.name, pack]),
  );
  const pluginsRoot = path.join(root, "plugins");
  const actualPluginNames = existsSync(pluginsRoot)
    ? sortedDirectoryEntries(pluginsRoot)
        .filter((entry) => entry.isDirectory() && existsSync(path.join(pluginsRoot, entry.name, ".codex-plugin", "plugin.json")))
        .map((entry) => entry.name)
    : [];
  for (const name of actualPluginNames) {
    if (!expectedPlugins.has(name)) errors.push(`plugins/${name}: unexpected Release Candidate plugin manifest`);
  }

  for (const [name, packContract] of expectedPlugins) {
    const manifestPath = `plugins/${name}/.codex-plugin/plugin.json`;
    const manifest = readJson(root, manifestPath, errors);
    if (!manifest) continue;
    if (manifest.name !== name) errors.push(`${manifestPath}: plugin name must be ${name}`);
    checkExactVersion(errors, manifestPath, manifest.version, packContract.plugin.version, "plugin version");
    if (packContract.plugin.version !== packContract.version) {
      errors.push(`release contract: plugin ${name} and Pack ${packContract.id} must share a release-channel version`);
    }
    const result = packResults.get(packContract.id);
    if (!result) continue;
    const actualSkills = pluginSkillDirectories(path.join(root, "plugins", name));
    if (!sameNames(actualSkills, result.buildActiveSlugs)) {
      errors.push(`${manifestPath}: plugin Skill set must exactly match active canonical Skills; deprecated Skills must stay excluded`);
    }
  }

  const marketplace = readJson(root, contract.marketplacePath, errors);
  if (!marketplace) return;
  const entries = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
  if (!Array.isArray(marketplace.plugins)) errors.push(`${contract.marketplacePath}: plugins must be an array`);
  const names = entries.map((entry) => entry?.name).filter((name) => typeof name === "string");
  if (new Set(names).size !== names.length) errors.push(`${contract.marketplacePath}: duplicate plugin entries`);
  if (!sameNames(names, expectedPlugins.keys())) {
    errors.push(`${contract.marketplacePath}: plugin entries must exactly match Release Candidate plugins`);
  }
  for (const entry of entries) {
    if (!entry || typeof entry.name !== "string") continue;
    if (Object.hasOwn(entry, "version") || Object.hasOwn(entry.source ?? {}, "version")) {
      errors.push(`${contract.marketplacePath}: ${entry.name} must inherit version from its plugin manifest, not declare a marketplace version`);
    }
    const expectedPath = `./plugins/${entry.name}`;
    if (entry.source?.path !== expectedPath) {
      errors.push(`${contract.marketplacePath}: ${entry.name} source.path must be ${expectedPath}`);
    }
  }
}

function auditChangelog(root, contract, errors) {
  const absolute = path.join(root, contract.changelogPath);
  if (!existsSync(absolute)) {
    errors.push(`${contract.changelogPath}: missing`);
    return;
  }
  const content = readFileSync(absolute, "utf8");
  const unreleased = content.match(/^## \[?Unreleased\]?\s*$/m);
  if (!unreleased) errors.push(`${contract.changelogPath}: must retain an Unreleased section`);

  const version = escapeRegExp(contract.projectVersion);
  const date = escapeRegExp(contract.releaseDate);
  const releasePattern = new RegExp(`^## \\[?${version}\\]? - ${date}\\s*$`, "m");
  const release = content.match(releasePattern);
  if (!release) {
    errors.push(`${contract.changelogPath}: missing formal ${contract.projectVersion} section dated ${contract.releaseDate}`);
    return;
  }
  if (unreleased && unreleased.index > release.index) {
    errors.push(`${contract.changelogPath}: Unreleased must appear before ${contract.projectVersion}`);
  }
  const sectionStart = release.index + release[0].length;
  const nextSection = content.slice(sectionStart).search(/\n## /);
  const section = nextSection === -1
    ? content.slice(sectionStart)
    : content.slice(sectionStart, sectionStart + nextSection);
  for (const heading of ["Added", "Changed", "Fixed", "Security", "Documentation"]) {
    if (!new RegExp(`^### ${heading}\\s*$`, "m").test(section)) {
      errors.push(`${contract.changelogPath}: ${contract.projectVersion} section is missing ### ${heading}`);
    }
  }

  const historicalVersion = escapeRegExp(contract.historicalProjectVersion);
  const historicalDate = escapeRegExp(contract.historicalReleaseDate);
  const historicalPattern = new RegExp(`^## \\[?${historicalVersion}\\]? - ${historicalDate}\\s*$`, "m");
  const historical = content.match(historicalPattern);
  if (!historical) {
    errors.push(
      `${contract.changelogPath}: missing historical ${contract.historicalProjectVersion} section dated ${contract.historicalReleaseDate}`,
    );
  } else {
    const historicalStart = historical.index + historical[0].length;
    const historicalNext = content.slice(historicalStart).search(/\n## /);
    const historicalSection = historicalNext === -1
      ? content.slice(historicalStart)
      : content.slice(historicalStart, historicalStart + historicalNext);
    const historicalTagNote = historicalSection
      .split(/\r?\n/)
      .some((line) => (
        line.includes(contract.historicalTag)
        && /historical/i.test(line)
        && /(?:error|mismatch)/i.test(line)
      ));
    if (!historicalTagNote) {
      errors.push(
        `${contract.changelogPath}: historical section must explicitly record tag ${contract.historicalTag} as an error/mismatch`,
      );
    }
  }

  for (const label of ["Unreleased", contract.projectVersion, contract.historicalProjectVersion]) {
    if (!new RegExp(`^\\[${escapeRegExp(label)}\\]:\\s+https?://`, "m").test(content)) {
      errors.push(`${contract.changelogPath}: missing comparison/release link for ${label}`);
    }
  }
}

function auditReleaseCandidateDocument(root, contract, errors) {
  const absolute = path.join(root, contract.releaseCandidateDocument);
  if (!existsSync(absolute)) {
    errors.push(`${contract.releaseCandidateDocument}: missing`);
    return;
  }
  const content = readFileSync(absolute, "utf8");
  const version = escapeRegExp(contract.projectVersion);
  if (!new RegExp(`^# .*\\bv?${version}\\b.*$`, "mi").test(content)) {
    errors.push(`${contract.releaseCandidateDocument}: title must identify project version ${contract.projectVersion}`);
  }
  if (!/(?:release candidate|候选版本|发布候选)/i.test(content)) {
    errors.push(`${contract.releaseCandidateDocument}: must describe the artifact as a Release Candidate`);
  }
  if (!/Live-model/i.test(content) || !/UNKNOWN/.test(content)) {
    errors.push(`${contract.releaseCandidateDocument}: must keep Live-model routing accuracy UNKNOWN`);
  }
  if (!content.includes(`v${contract.projectVersion}`)) {
    errors.push(`${contract.releaseCandidateDocument}: must record expected future tag v${contract.projectVersion}`);
  }
}

export function inspectReleaseMetadata(root = scriptRoot, contract = releaseContract) {
  const resolvedRoot = path.resolve(root);
  const errors = [];
  auditPackage(resolvedRoot, contract, errors);
  const packResults = auditPacks(resolvedRoot, contract, errors);
  auditTemplate(resolvedRoot, contract, errors);
  auditPluginsAndMarketplace(resolvedRoot, contract, packResults, errors);
  auditChangelog(resolvedRoot, contract, errors);
  auditReleaseCandidateDocument(resolvedRoot, contract, errors);
  return {
    errors: errors.sort(compareNames),
    summary: {
      projectVersion: contract.projectVersion,
      packs: packResults.size,
      activeSkills: [...packResults.values()]
        .reduce((total, pack) => total + pack.releaseEligibleSlugs.length, 0),
      plugins: contract.packs.filter((pack) => pack.plugin).length,
    },
  };
}

function parseArguments(argv) {
  const options = { check: false, root: scriptRoot };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--check") options.check = true;
    else if (argument === "--root") {
      const value = argv[index + 1];
      if (!value) throw new Error("--root requires a path");
      options.root = path.resolve(value);
      index += 1;
    } else throw new Error(`unknown argument: ${argument}`);
  }
  if (!options.check) {
    throw new Error("release metadata is read-only; pass --check (no apply mode is provided)");
  }
  return options;
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(`Release metadata check failed:\n- ${error.message}`);
    process.exit(1);
  }
  const result = inspectReleaseMetadata(options.root);
  if (result.errors.length > 0) {
    console.error(`Release metadata check failed with ${result.errors.length} issue(s):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(
    `Release metadata check passed for project ${result.summary.projectVersion} `
      + `(${result.summary.packs} Packs, ${result.summary.activeSkills} active Skills, ${result.summary.plugins} plugins).`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
