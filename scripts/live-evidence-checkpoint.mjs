import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { assertLiveEvidenceBinding } from "./live-evidence-binding.mjs";

export function loadCheckpoint(filename, identity) {
  const saved = JSON.parse(readFileSync(filename, "utf8"));
  assertLiveEvidenceBinding(saved.content_binding, identity.content_binding);
  for (const key of ["project_version", "requested_model", "evaluator_sha256"]) {
    if (saved[key] !== identity[key]) throw new Error(`Advanced checkpoint ${key} changed; results cannot be reused`);
  }
  if (!Array.isArray(saved.cases) || !Array.isArray(saved.workflows)) throw new Error("Invalid advanced checkpoint");
  if (saved.cases.some((item) => item.result === "FAIL")) throw new Error("Semantic failures require review, not automatic checkpoint resume");
  return saved;
}

export function saveCheckpoint(filename, value) {
  const temporary = `${filename}.tmp`;
  writeFileSync(temporary, `${JSON.stringify({ ...value, result: "INCOMPLETE" }, null, 2)}\n`);
  renameSync(temporary, filename);
}
