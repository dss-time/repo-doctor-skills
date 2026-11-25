# Agent installation and compatibility

[简体中文](AGENT_COMPATIBILITY.zh-CN.md)

In your project, run `npx skills@latest add dss-time/repo-doctor-skills` and select your agent. Pick one install channel so you have one copy per agent. The command follows the public repository's default branch. Version **0.11.1** is the published npm release. The automatic Change Guard examples refer to the unreleased **0.12.0 candidate**.

## Targeted installation

| Agent | Add to your project | Project directory | Personal directory with `-g` |
| --- | --- | --- | --- |
| OpenAI Codex | `npx skills@latest add dss-time/repo-doctor-skills -a codex` | `.agents/skills` | `~/.agents/skills` |
| Claude Code | `npx skills@latest add dss-time/repo-doctor-skills -a claude-code` | `.claude/skills` | `~/.claude/skills` |
| Cursor | `npx skills@latest add dss-time/repo-doctor-skills -a cursor` | `.agents/skills` | `~/.agents/skills` |
| GitHub Copilot | `npx skills@latest add dss-time/repo-doctor-skills -a github-copilot` | `.agents/skills` | `~/.agents/skills` |
| Gemini CLI | `npx skills@latest add dss-time/repo-doctor-skills -a gemini-cli` | `.agents/skills` | `~/.agents/skills` |
| OpenCode | `npx skills@latest add dss-time/repo-doctor-skills -a opencode` | `.agents/skills` | `~/.agents/skills` |

These paths were observed with Vercel Skills CLI **1.9.0** on macOS and a fresh home directory. Skills CLI requires Node **22.20.0+** at that version. Repo Doctor's own CLI and candidate runtime support Node 18+. Git is required for the worktree comparison. Choose project installation to scope the Skills to one repository. Personal installations may be shared across clients using the same directory. Cursor remote sessions and GitHub Copilot cloud surfaces follow their own discovery and policy settings. [Agent Skills standard](https://agentskills.io/specification) · [Vercel Skills CLI](https://github.com/vercel-labs/skills)

Open a new agent session and describe the task in plain language. The host discovers the Skills and chooses when to load their instructions. It controls file access, local process execution and sandbox approvals. The candidate bundles the runtime with the four writing Skills that use it. They can call it directly when Node, Git and permission to write local task state are available. With restricted tools, continue with authorized inspection and focused verification, and leave unavailable observations unknown.

## What we verified

The public repository shorthand resolved to 34 Skills in a read-only `skills add --list` probe.

- All six CLI targets installed one candidate writing Skill in project and isolated personal scope. The installed body and supporting assets matched the frozen source. Each of the 12 installed copies ran the bundled Node entry against a separate test Git worktree and reported one deliberate out-of-scope change. The test invoked the installed files directly.
- Codex CLI 0.171.0-alpha.13.2 was the host for the candidate's observed Skill discovery, body loading, automatic calls and report handling. The public-module example missed once and triggered on retry. The final response for one existing-edit case omitted a warning and unknown coverage.
- Claude Code 1.0.70 was present for a version probe. Claude Code, Cursor, GitHub Copilot, Gemini CLI and OpenCode have installer and independent runtime evidence. Host discovery, body loading, automatic calls and report handling remain unverified for those five in this run.

[Installation receipts](../tests/reports/change-guard-0.12.0-six-agent-install-2026-11-25.json) · [Codex observations](research/change-guard-integration.md)

## Upgrade or try the candidate locally

Use `npx skills@latest check` and `npx skills@latest update` in the matching scope, adding `-g` for a personal installation. Re-run `add` to select more Skills. For the Repo Doctor npm installer, re-run the same install command to replace the selected copies. Review local edits before replacing them. See the [user manual](USER_MANUAL.md) for single, Recommended, Full and native plugin options.

For an isolated trial, check out the [stable validation branch](https://github.com/dss-time/repo-doctor-skills/tree/codex/0.12.0-stable-validation) at the exact commit named in the validation results. In a disposable project, supply the absolute path to that checkout's `skills` directory to `npx skills@1.9.0 add`. For a verified local npm tarball, run `npx --yes --package /absolute/path/repo-doctor-skills-0.12.0.tgz -- repo-doctor-skills --version`. Expect `0.12.0`. Replace `--version` with `install --target-dir /absolute/path/to/disposable-skills` for an isolated installation.

### Host documentation

[Codex](https://developers.openai.com/codex/skills/) · [Claude Code](https://code.claude.com/docs/en/skills) · [Cursor](https://cursor.com/docs/skills) · [GitHub Copilot](https://docs.github.com/en/copilot/concepts/customizations/agent-skills) · [Gemini CLI](https://geminicli.com/docs/cli/skills/) · [OpenCode](https://opencode.ai/docs/skills/)

For the isolated local marketplace, see [Local Codex Beta](LOCAL_CODEX_BETA.md).
