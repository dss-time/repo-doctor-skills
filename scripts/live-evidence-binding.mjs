import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import path from "node:path";
import { walkFiles, toPosixPath } from "./deterministic-files.mjs";

// Paths and executable bits matter as well as bytes. Hash complete trees so
// references, scripts, assets, workflow registries, additions and removals count.
function treeHash(directory) {
  const files = walkFiles(directory);
  if (!files.length) throw new Error(`Missing evidence inputs: ${directory}`);
  const hash = createHash("sha256");
  for (const filename of files) {
    const stat = lstatSync(filename);
    if (!stat.isFile()) throw new Error(`Evidence inputs must be regular files: ${filename}`);
    const digest = createHash("sha256").update(readFileSync(filename)).digest("hex");
    hash.update(JSON.stringify([toPosixPath(path.relative(directory, filename)), stat.mode & 0o111, digest]) + "\n");
  }
  return hash.digest("hex");
}

export function liveEvidenceBinding(root, runtimeRoot = path.join(root, "skills")) {
  return { schema_version: 1, source_sha256: treeHash(path.join(root, "packs")), runtime_sha256: treeHash(runtimeRoot) };
}

export function assertLiveEvidenceBinding(expected, actual) {
  if (!expected || expected.schema_version !== 1
    || expected.source_sha256 !== actual.source_sha256
    || expected.runtime_sha256 !== actual.runtime_sha256) {
    throw new Error("Live-model evidence is missing or stale: Skill source/runtime content binding differs; run a fresh evaluation");
  }
}
