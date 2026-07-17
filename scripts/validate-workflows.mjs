import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compareNames, sortedDirectoryEntries } from "./deterministic-files.mjs";
import { discoverPackRoots } from "./sync-pack-plugin.mjs";
import { parseYamlSubset, validateSchema } from "./validate-yaml-schemas.mjs";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const activeStatuses = new Set(["draft", "beta", "stable"]);

export function discoverSkillInventory(root) {
  const inventory = new Map();
  for (const packRoot of discoverPackRoots(path.join(root, "packs"))) {
    const skillsRoot = path.join(packRoot, "skills");
    for (const entry of sortedDirectoryEntries(skillsRoot)) {
      const metadataPath = path.join(skillsRoot, entry.name, "skill.yaml");
      if (!entry.isDirectory() || !existsSync(metadataPath)) continue;
      const metadata = parseYamlSubset(readFileSync(metadataPath, "utf8"));
      inventory.set(entry.name, metadata);
    }
  }
  return inventory;
}

function collectCanonicalRegistries(root) {
  const registries = [];
  for (const packRoot of discoverPackRoots(path.join(root, "packs"))) {
    const candidate = path.join(packRoot, "workflows.yaml");
    if (existsSync(candidate)) registries.push(candidate);
  }
  return registries.sort(compareNames);
}

function collectBacktickSlugs(content) {
  return new Set(
    [...content.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`/g)].map((match) => match[1]),
  );
}

function documentedWorkflowIds(content) {
  return new Set(
    [...content.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`/g)].map((match) => match[1]),
  );
}

function canReachTerminal(stageId, stageMap, visiting = new Set(), memo = new Map()) {
  if (memo.has(stageId)) return memo.get(stageId);
  if (visiting.has(stageId)) return false;
  const stage = stageMap.get(stageId);
  if (!stage) return false;
  if (stage.next.length === 0) {
    memo.set(stageId, true);
    return true;
  }
  const nextVisiting = new Set(visiting);
  nextVisiting.add(stageId);
  const result = stage.next.some((next) => canReachTerminal(next, stageMap, nextVisiting, memo));
  memo.set(stageId, result);
  return result;
}

function ancestorsOf(stageId, stageMap, seen = new Set()) {
  const stage = stageMap.get(stageId);
  if (!stage) return seen;
  for (const prerequisite of stage.prerequisites) {
    if (seen.has(prerequisite)) continue;
    seen.add(prerequisite);
    ancestorsOf(prerequisite, stageMap, seen);
  }
  return seen;
}

export function validateRegistryDocument(registry, {
  schema,
  skillInventory,
  documentedEn = null,
  documentedZh = null,
  routerReferences = null,
} = {}) {
  const errors = [...validateSchema(registry, schema, "$")];
  if (errors.length > 0) return errors;
  const activeSkills = new Set(
    [...skillInventory.entries()]
      .filter(([, metadata]) => activeStatuses.has(metadata.status))
      .map(([slug]) => slug),
  );
  const workflowIds = Object.keys(registry.workflows).sort(compareNames);

  for (const [workflowId, workflow] of Object.entries(registry.workflows)) {
    const stageMap = new Map();
    for (const stage of workflow.stages) {
      if (stageMap.has(stage.id)) errors.push(`${workflowId}: duplicate stage id ${stage.id}`);
      stageMap.set(stage.id, stage);
    }
    if (!stageMap.has(workflow.entry_stage)) {
      errors.push(`${workflowId}: entry_stage does not exist: ${workflow.entry_stage}`);
    }
    const terminalStages = workflow.stages.filter((stage) => stage.next.length === 0);
    if (terminalStages.length === 0) errors.push(`${workflowId}: workflow has no terminal stage`);

    for (const platform of workflow.supported_platforms) {
      if (!registry.supported_platforms.includes(platform)) {
        errors.push(`${workflowId}: unsupported platform ${platform}`);
      }
    }

    for (const stage of workflow.stages) {
      for (const reference of [...stage.prerequisites, ...stage.next]) {
        if (!stageMap.has(reference)) errors.push(`${workflowId}/${stage.id}: unknown stage reference ${reference}`);
      }
      for (const prerequisite of stage.prerequisites) {
        const source = stageMap.get(prerequisite);
        if (source && !source.next.includes(stage.id)) {
          errors.push(`${workflowId}/${stage.id}: prerequisite ${prerequisite} does not point to this stage`);
        }
      }
      for (const alternative of stage.alternatives) {
        const metadata = skillInventory.get(alternative);
        if (!metadata) errors.push(`${workflowId}/${stage.id}: alternative Skill does not exist: ${alternative}`);
        else if (!activeSkills.has(alternative)) {
          errors.push(`${workflowId}/${stage.id}: alternative Skill is not active (${metadata.status}): ${alternative}`);
        }
      }

      if (stage.type === "gate") {
        if (stage.skill !== "none") errors.push(`${workflowId}/${stage.id}: gate must use skill: none`);
        if (stage.permission !== "none") errors.push(`${workflowId}/${stage.id}: gate must use permission: none`);
        if (stage.approval_gate !== "explicit_write_authorization") {
          errors.push(`${workflowId}/${stage.id}: write gate must require explicit_write_authorization`);
        }
        continue;
      }

      const metadata = skillInventory.get(stage.skill);
      if (!metadata) {
        errors.push(`${workflowId}/${stage.id}: Skill does not exist: ${stage.skill}`);
        continue;
      }
      if (!activeSkills.has(stage.skill)) {
        errors.push(`${workflowId}/${stage.id}: Skill is not active (${metadata.status}): ${stage.skill}`);
      }
      if (stage.permission === "none") {
        errors.push(`${workflowId}/${stage.id}: Skill stage cannot use permission: none`);
      }
      if (stage.permission === "write_scoped") {
        if (metadata.permissions?.write_files !== true) {
          errors.push(`${workflowId}/${stage.id}: write_scoped conflicts with read-only Skill metadata`);
        }
        const gate = stageMap.get(stage.approval_gate);
        if (!gate || gate.type !== "gate" || gate.approval_gate !== "explicit_write_authorization") {
          errors.push(`${workflowId}/${stage.id}: write stage lacks a valid explicit approval gate`);
        } else if (!ancestorsOf(stage.id, stageMap).has(gate.id)) {
          errors.push(`${workflowId}/${stage.id}: approval gate is not a prerequisite ancestor`);
        }
      } else if (stage.approval_gate !== "none") {
        errors.push(`${workflowId}/${stage.id}: read-only stage cannot claim a write approval gate`);
      }
    }

    for (const transition of workflow.forbidden_transitions) {
      const [from, to] = transition.split("->");
      if (!stageMap.has(from) || !stageMap.has(to)) {
        errors.push(`${workflowId}: forbidden transition references an unknown stage: ${transition}`);
      }
    }

    if (stageMap.has(workflow.entry_stage) && !canReachTerminal(workflow.entry_stage, stageMap)) {
      errors.push(`${workflowId}: entry stage cannot reach a terminal stage or contains a non-terminating cycle`);
    }
    for (const stage of workflow.stages) {
      if (!canReachTerminal(stage.id, stageMap)) {
        errors.push(`${workflowId}/${stage.id}: stage cannot terminate`);
      }
    }
  }

  const serialized = JSON.stringify(registry);
  if (serialized.includes("$")) errors.push("workflow registry must not hard-code platform invocation syntax");

  if (documentedEn && documentedZh) {
    for (const workflowId of workflowIds) {
      if (!documentedEn.has(workflowId)) errors.push(`English workflow documentation missing ${workflowId}`);
      if (!documentedZh.has(workflowId)) errors.push(`Chinese workflow documentation missing ${workflowId}`);
    }
    for (const workflowId of workflowIds) {
      if (documentedEn.has(workflowId) !== documentedZh.has(workflowId)) {
        errors.push(`bilingual workflow documentation drift for ${workflowId}`);
      }
    }
  }

  if (routerReferences) {
    for (const reference of routerReferences) {
      if (!activeSkills.has(reference)) errors.push(`Router recommends a missing or inactive Skill: ${reference}`);
    }
  }
  return [...new Set(errors)].sort(compareNames);
}

export function validateWorkflowRegistry({ root = process.cwd(), checkDocs = true } = {}) {
  const registries = collectCanonicalRegistries(root);
  const errors = [];
  if (registries.length !== 1) {
    errors.push(`expected exactly one canonical workflows.yaml, found ${registries.length}`);
    return { errors, registry: null, registryPath: registries[0] ?? null };
  }
  const registryPath = registries[0];
  const schema = JSON.parse(readFileSync(path.join(root, "schemas", "workflow.schema.json"), "utf8"));
  const registry = parseYamlSubset(readFileSync(registryPath, "utf8"));
  const inventory = discoverSkillInventory(root);
  let documentedEn = null;
  let documentedZh = null;
  if (checkDocs) {
    documentedEn = documentedWorkflowIds(readFileSync(path.join(root, "docs", "WORKFLOW_COOKBOOK.md"), "utf8"));
    documentedZh = documentedWorkflowIds(readFileSync(path.join(root, "docs", "WORKFLOW_COOKBOOK.zh-CN.md"), "utf8"));
  }
  const routerRoot = path.join(root, "packs", "engineering", "repo-doctor", "skills", "repo-doctor-router");
  const routerReferences = new Set([
    ...collectBacktickSlugs(readFileSync(path.join(routerRoot, "instructions.en.md"), "utf8")),
    ...collectBacktickSlugs(readFileSync(path.join(routerRoot, "instructions.zh-CN.md"), "utf8")),
  ]);
  errors.push(...validateRegistryDocument(registry, {
    schema,
    skillInventory: inventory,
    documentedEn,
    documentedZh,
    routerReferences,
  }));
  return { errors, registry, registryPath };
}

function main() {
  const rootIndex = process.argv.indexOf("--root");
  const root = rootIndex >= 0 ? path.resolve(process.argv[rootIndex + 1]) : process.cwd();
  const { errors, registry } = validateWorkflowRegistry({ root });
  if (errors.length > 0) {
    console.error("Workflow registry validation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(`Workflow registry validation passed for ${Object.keys(registry.workflows).length} workflows.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
