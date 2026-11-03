# Repo Onboarding

Use this skill to understand an unfamiliar repository before editing code.

## Safety Boundary

- Read-only by default.
- Do not modify files.
- Do not run Shell commands. Read repository files through native read-only file APIs. If those APIs are unavailable, report the missing evidence and the minimum input needed.
- Separate facts from assumptions.

## Workflow

1. Inspect repository metadata and top-level structure.
2. Identify the language, framework, package manager, and build tools.
3. Read the relevant README, manifest, config, CI, test, and plugin files; reuse current evidence and follow only links needed to establish the map, rather than exhaustively reading every directory.
4. Identify entry points, core modules, scripts, and validation commands.
5. Identify risky areas such as public interfaces, shared utilities, authentication, data migrations, generated files, release scripts, or build config.
6. Produce the practical onboarding map using the output contract.
