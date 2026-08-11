#!/usr/bin/env node

import { createRequire } from "node:module";
import { runInstallerCli } from "../scripts/install.mjs";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help")) {
  process.stdout.write([
    "Repo Doctor Skills",
    "",
    "Usage:",
    "  repo-doctor-skills install [options]",
    "  repo-doctor-skills --help",
    "  repo-doctor-skills --version",
    "",
    "Install options:",
    "  --preset recommended|full",
    "  --agent codex|shared",
    "  --target-dir <path>",
    "  --force",
    "",
  ].join("\n"));
  process.exitCode = 0;
} else if (args.includes("--version")) {
  process.stdout.write(`${version}\n`);
  process.exitCode = 0;
} else if (args[0] === "install") {
  process.exitCode = await runInstallerCli(args.slice(1));
} else {
  process.stderr.write(`Unknown command ${JSON.stringify(args[0])}. Run repo-doctor-skills --help.\n`);
  process.exitCode = 2;
}
