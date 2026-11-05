import { randomUUID } from "node:crypto";
import { readFileSync, renameSync, writeFileSync, rmSync } from "node:fs";
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

export function writeAtomicReport(filename, value) {
  const temporary = `${filename}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx", mode: 0o600 });
    renameSync(temporary, filename);
  } finally {
    rmSync(temporary, { force: true });
  }
}

export function saveCheckpoint(filename, value) {
  writeAtomicReport(filename, { ...value, result: "INCOMPLETE" });
}
