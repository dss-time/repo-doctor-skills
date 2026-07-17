import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const suitePath = path.join(root, "evals", "live-model", "cases.json");
const raw = readFileSync(suitePath, "utf8");
const suite = JSON.parse(raw);
const payload = {
  version: 1,
  mode: "offline",
  network_called: false,
  api_keys_read: false,
  suite_digest: createHash("sha256").update(raw).digest("hex"),
  live_model_status: "UNKNOWN",
  manual_execution_required: true,
  cases: suite.cases.map((item) => ({ ...item, status: "pending_manual_execution" }))
};
const index = process.argv.indexOf("--output");
if (index >= 0) {
  const target = process.argv[index + 1];
  if (!target) throw new Error("--output requires a path");
  writeFileSync(path.resolve(target), `${JSON.stringify(payload, null, 2)}\n`);
} else process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
