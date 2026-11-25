import { runChangeGuardCli } from "./change-guard-runtime/change-guard-cli.mjs";

process.exitCode = await runChangeGuardCli(process.argv.slice(2));
