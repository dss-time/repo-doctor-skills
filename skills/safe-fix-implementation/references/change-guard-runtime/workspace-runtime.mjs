import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function workspaceRuntime() {
  const packaged = path.join(root, "package-assets", "project-runtime");
  const canonical = path.join(root, "packs", "engineering", "repo-doctor");
  if (!existsSync(path.join(canonical, "pack.yaml"))) {
    if (!existsSync(path.join(packaged, "registry.json"))) throw new Error("Bundled workflow runtime is missing");
    return {
      ...await import(pathToFileURL(path.join(packaged, "workflow-coordination.mjs")).href),
      registry: JSON.parse(readFileSync(path.join(packaged, "registry.json"), "utf8")),
      inventory: new Map(JSON.parse(readFileSync(path.join(packaged, "inventory.json"), "utf8"))),
    };
  }
  const { parseYamlSubset } = await import("./validate-yaml-schemas.mjs");
  const { discoverCanonicalSkillDirs } = await import("./build-skills.mjs");
  const directory = canonical;
  return {
    ...await import(pathToFileURL(path.join(directory, "references", "workflow-coordination.mjs")).href),
    registry: parseYamlSubset(readFileSync(path.join(directory, "workflows.yaml"), "utf8")),
    inventory: new Map(discoverCanonicalSkillDirs(path.join(root, "packs")).map(skill => [
      path.basename(skill), parseYamlSubset(readFileSync(path.join(skill, "skill.yaml"), "utf8")),
    ])),
  };
}
