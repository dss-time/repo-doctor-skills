#!/usr/bin/env node

import { createRequire } from "node:module";
import { runInstallerCli } from "../scripts/install.mjs";
import { runWorkspaceCli, workspaceUsage } from "../scripts/workspace-cli.mjs";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help")) {
  process.stdout.write([
    "Repo Doctor (repo-doctor-skills)",
    "",
    "Usage:",
    "  repo-doctor-skills install [options]",
    workspaceUsage,
    "  repo-doctor-skills --help",
    "  repo-doctor-skills --version",
    "",
    "Install options:",
    "  --preset recommended|full",
    "  --skill <slug>",
    "  --language en|zh-CN|bilingual",
    "  --agent codex|shared",
    "  --target-dir <path>",
    "  --force (compatibility option)",
    "",
    "Reinstalling replaces selected same-name Skills, including local edits. Identical content is skipped.",
    "Change Guard reports only. --scope accepts slash-separated repository-relative files or directories.",
    "Change Guard findings and unknown coverage exit 0; command or state errors exit 1. Use --json for a compact report.",
    "",
  ].join("\n"));
  process.exitCode = 0;
} else if (args.includes("--version")) {
  process.stdout.write(`${version}\n`);
  process.exitCode = 0;
} else if (args[0] === "install") {
  process.exitCode = await runInstallerCli(args.slice(1));
} else if (["project", "task", "change", "installations"].includes(args[0])) {
  process.exitCode = await runWorkspaceCli(args);
} else {
  process.stderr.write(`Unknown command ${JSON.stringify(args[0])}. Run repo-doctor-skills --help.\n`);
  process.exitCode = 2;
}
