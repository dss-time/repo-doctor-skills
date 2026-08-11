import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverCanonicalSkillDirs, writeInstallableCodexSkill } from "./build-skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "package-assets");
const skillsRoot = path.join(outputRoot, "skills");

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(skillsRoot, { recursive: true });

const skillDirs = discoverCanonicalSkillDirs(path.join(root, "packs"));
for (const skillDir of skillDirs) {
  writeInstallableCodexSkill(skillDir, path.join(skillsRoot, path.basename(skillDir)));
}

console.log(`Prepared npm runtime assets for ${skillDirs.length} Skills.`);
