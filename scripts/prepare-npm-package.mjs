import { mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync, cpSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverCanonicalSkillDirs, writeInstallableCodexSkill } from "./build-skills.mjs";
import { parseYamlSubset } from "./validate-yaml-schemas.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "package-assets");
const skillsRoot = path.join(outputRoot, "skills");

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(skillsRoot, { recursive: true });

const skillDirs = discoverCanonicalSkillDirs(path.join(root, "packs"));
for (const skillDir of skillDirs) {
  writeInstallableCodexSkill(skillDir, path.join(skillsRoot, path.basename(skillDir)));
}

const runtimeRoot = path.join(outputRoot, "project-runtime");
mkdirSync(runtimeRoot);
const coordinationRoot = path.join(root, "packs", "engineering", "repo-doctor");
copyFileSync(path.join(coordinationRoot, "references", "workflow-coordination.mjs"), path.join(runtimeRoot, "workflow-coordination.mjs"));
writeFileSync(path.join(runtimeRoot, "registry.json"), JSON.stringify(parseYamlSubset(readFileSync(path.join(coordinationRoot, "workflows.yaml"), "utf8"))));
writeFileSync(path.join(runtimeRoot, "inventory.json"), JSON.stringify(skillDirs.map(directory => [
  path.basename(directory), parseYamlSubset(readFileSync(path.join(directory, "skill.yaml"), "utf8")),
])));

// Ship the locked parser's Node runtime so packed CLI installs and lint runs
// work offline. Include its license without shipping a node_modules tree.
const require = createRequire(import.meta.url);
const yamlManifest = require.resolve("yaml/package.json");
const yamlRoot = path.dirname(yamlManifest);
const yamlOutput = path.join(outputRoot, "skill-lint-yaml");
cpSync(path.join(yamlRoot, "dist"), yamlOutput, {
  recursive: true,
  filter: source => !source.endsWith(".d.ts"),
});
copyFileSync(path.join(yamlRoot, "LICENSE"), path.join(yamlOutput, "LICENSE"));
writeFileSync(path.join(yamlOutput, "package.json"), JSON.stringify({
  name: "yaml", version: require(yamlManifest).version, type: "commonjs",
}) + "\n");

console.log(`Prepared npm runtime assets for ${skillDirs.length} Skills.`);
