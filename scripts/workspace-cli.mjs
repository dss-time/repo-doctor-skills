import path from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { parseOptions, required } from "./state-cli-options.mjs";
import { readJson } from "./local-state-files.mjs";
import { targetFromAgent } from "./install.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const workspaceUsage = [
  "  repo-doctor-skills project init [--root PATH] [--apply]",
  "  repo-doctor-skills project check [--root PATH]",
  "  repo-doctor-skills project refresh --revision N [--root PATH] [--apply]",
  "  repo-doctor-skills task create --id ID --goal TEXT --acceptance TEXT [--acceptance TEXT ...] (--skill SLUG | --workflow ID) [--root PATH]",
  "  repo-doctor-skills task list [--root PATH]",
  "  repo-doctor-skills task save --id ID --input CONTEXT.json --revision N [--root PATH]",
  "  repo-doctor-skills task resume --id ID [--root PATH]",
  "  repo-doctor-skills change begin --id ID [--scope PATH ...] [--root PATH] [--json]",
  "  repo-doctor-skills change check --id ID [--root PATH] [--json]",
  "  repo-doctor-skills change status --id ID [--root PATH] [--json]",
  "  repo-doctor-skills receipt export --id ID [--root PATH] [--format json|markdown | --json] [--out FILE]",
  "  repo-doctor-skills installations check [--target-dir PATH ...]",
].join("\n");

export async function runWorkspaceCli(args, { stdout = process.stdout, stderr = process.stderr, cwd = process.cwd(), home = homedir(), env = process.env } = {}) {
  try {
    const [group, action, ...rest] = args;
    if (group === "change") {
      const { runChangeGuardCli } = await import("./change-guard-cli.mjs");
      return await runChangeGuardCli(args.slice(1), { stdout, stderr, cwd });
    }
    if (group === "receipt") {
      if (action !== "export") throw new Error("Unknown Receipt operation; see --help");
      const options = parseOptions(rest, { values: ["--root", "--id", "--format", "--out"] });
      const format = options["--format"] ?? (options["--json"] ? "json" : "markdown");
      if (!["json", "markdown"].includes(format) || (options["--json"] && format !== "json")) {
        throw new Error("Receipt format must be json or markdown; --json requires json");
      }
      const id = required(options, "--id");
      const { buildVerificationReceipt, renderVerificationReceipt, writeVerificationReceipt } = await import("./verification-receipt.mjs");
      const root = path.resolve(cwd, options["--root"] ?? ".");
      const output = renderVerificationReceipt(await buildVerificationReceipt(root, id), format);
      if (options["--out"]) writeVerificationReceipt(root, options["--out"], output);
      else stdout.write(output);
      return 0;
    }
    let result;
    if (group === "project" && ["init", "check", "refresh"].includes(action)) {
      const options = parseOptions(rest, { values: action === "refresh" ? ["--root", "--revision"] : ["--root"], flags: action !== "check" ? ["--apply"] : [] });
      const root = path.resolve(cwd, options["--root"] ?? ".");
      const project = await import("./project-state.mjs");
      if (action === "init") result = await project.initProject(root, { apply: options["--apply"] === true });
      else if (action === "check") result = await project.checkProject(root);
      else {
        const revision = required(options, "--revision");
        if (!/^[1-9]\d*$/.test(revision) || !Number.isSafeInteger(Number(revision))) throw new Error("Revision must be a positive safe integer");
        result = await project.refreshProject(root, { apply: options["--apply"] === true, expectedRevision: Number(revision) });
      }
    } else if (group === "task") {
      const operations = {
        create: { values: ["--root", "--id", "--goal", "--skill", "--workflow"], repeat: ["--acceptance"] },
        list: { values: ["--root"] },
        save: { values: ["--root", "--id", "--input", "--revision"] },
        resume: { values: ["--root", "--id"] },
      };
      if (!operations[action]) throw new Error("Unknown task operation; see --help");
      const options = parseOptions(rest, operations[action]);
      const root = path.resolve(cwd, options["--root"] ?? ".");
      const project = await import("./project-state.mjs");
      if (action === "create") {
        result = await project.createProjectTask(root, {
          id: required(options, "--id"), goal: required(options, "--goal"),
          acceptance: required(options, "--acceptance"),
          skill: options["--skill"] ?? null, workflow: options["--workflow"] ?? null,
        });
      } else if (action === "list") result = await project.listProjectTasks(root);
      else if (action === "resume") result = await project.resumeProjectTask(root, { id: required(options, "--id") });
      else {
        const revision = required(options, "--revision");
        if (!/^(0|[1-9]\d*)$/.test(revision) || !Number.isSafeInteger(Number(revision))) throw new Error("Revision must be a nonnegative safe integer");
        const input = path.resolve(cwd, required(options, "--input"));
        const context = readJson(path.dirname(input), path.basename(input));
        result = await project.saveProjectTask(root, { id: required(options, "--id"), context, expectedRevision: Number(revision) });
      }
    } else if (group === "installations" && action === "check") {
      const options = parseOptions(rest, { repeat: ["--target-dir"] });
      const { inspectInstallations } = await import("./installation-state.mjs");
      const { workspaceRuntime } = await import("./workspace-runtime.mjs");
      const runtime = await workspaceRuntime();
      const paths = options["--target-dir"] ?? [
        path.join(cwd, ".agents", "skills"), path.join(cwd, ".codex", "skills"),
        targetFromAgent("shared", env, home), targetFromAgent("codex", env, home),
      ];
      const unique = [...new Set(paths.map(item => path.resolve(cwd, item)))];
      result = inspectInstallations({
        targets: unique.map((directory, index) => ({ label: `target-${index + 1}`, path: directory })),
        activeSlugs: [...runtime.inventory.keys()], sourceRoot: path.join(packageRoot, "package-assets", "skills"),
      });
    } else throw new Error("Unknown command; see --help");
    stdout.write(JSON.stringify(result, null, 2) + "\n");
    return 0;
  } catch (error) {
    const message = args[0] === "receipt" && error.code
      ? (error.code === "EEXIST" ? "Receipt output file already exists" : "Unable to access the receipt root or output file")
      : error.message;
    stderr.write(`Repo Doctor state operation failed: ${message}\n`);
    return 1;
  }
}
