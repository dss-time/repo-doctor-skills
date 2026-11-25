import path from "node:path";
import { parseOptions, required } from "./state-cli-options.mjs";

export async function runChangeGuardCli(args, { stdout = process.stdout, stderr = process.stderr, cwd = process.cwd() } = {}) {
  const [action, ...rest] = args;
  try {
    if (!["begin", "check", "status"].includes(action)) throw new Error("Unknown Change Guard operation; see --help");
    const options = parseOptions(rest, { values: ["--root", "--id"], repeat: action === "begin" ? ["--scope"] : [] });
    const { runChangeGuard } = await import("./change-guard.mjs");
    const result = runChangeGuard(path.resolve(cwd, options["--root"] ?? "."), action, {
      id: required(options, "--id"), scope: options["--scope"],
    });
    if (options["--json"]) stdout.write(JSON.stringify(result) + "\n");
    else {
      const counts = result.changes === undefined ? "" : ` (${result.changes.length} changed paths)`;
      const findings = result.findings ?? [];
      const levels = ["violation", "warning", "unknown", "info"];
      const shown = levels.flatMap(level => findings.filter(item => item.level === level)).slice(0, 12);
      const baseline = result.preexisting_paths === undefined ? [] : [
        `Baseline: ${result.preexisting_paths} Git-visible dirty paths, ${result.scope.length} scope paths, HEAD ${result.head}`,
        ...(result.unverified_paths ? [`Dirty paths without fingerprints: ${result.unverified_paths}`] : []),
      ];
      stdout.write([
        `Change Guard ${action} ${result.id}: ${result.status}${counts}`,
        ...baseline,
        ...shown.map(item => `  ${item.level}: ${item.code}${item.path ? " " + JSON.stringify(item.path) : ""}${item.original_path ? " <- " + JSON.stringify(item.original_path) : ""}`),
        ...(findings.length > shown.length ? [`${findings.length - shown.length} more findings. Use --json for the full report.`] : []),
        ...(result.limitations ? [`Coverage limits: ${result.limitations.join(", ")}`] : []),
        ...(findings.some(item => item.level === "violation" || item.level === "warning") ? ["Review the affected paths and their diff before continuing. Change ownership is unknown."] : []),
      ].join("\n") + "\n");
    }
    return 0;
  } catch (error) {
    const message = error.code ? "Unable to access local Change Guard state or workspace" : error.message;
    if (args.includes("--json")) stderr.write(JSON.stringify({ schema_version: 1, status: "error", message }) + "\n");
    else stderr.write(`Change Guard failed: ${message}\n`);
    return 1;
  }
}
