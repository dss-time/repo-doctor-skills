# Execution Modes

Repo Doctor scales effort to task risk. A professional Skill does not automatically imply a full audit.

## Choose a mode

| Mode | Use when | Scope and validation | Default output |
|---|---|---|---|
| `fast` | The request is clear, local, low-risk, reversible, and unrelated to production data, security, migrations, releases, public-contract breakage, dependency upgrades, or broad architecture. | One primary Skill; user-named files first; soft budget of 3 files and 3 commands; one focused check; no full suite/build or persistent audit report. | Conclusion, completed/found items, minimum validation, and at most one next recommendation. |
| `standard` | Several related files, an ordinary feature or bug, module-level validation, or a few non-material unknowns are involved. | Relevant module only; affected tests plus necessary typecheck/lint; enough evidence for the conclusion; no repository-wide release gates by default. | Conclusion, affected scope, relevant evidence, validation, residual risk, and one optional next recommendation. |
| `audit` | Security or permissions, production data, database migration, release, public-contract breakage, dependency upgrade, large architecture change, or an explicitly requested full audit is involved. | Full evidence and command/permission ledgers; comprehensive risk and stop conditions; full tests/builds only when authorized and relevant. | Complete evidence, risk, permission, command, unknown, and stop-condition record. |

`fast` is the default for eligible requests. The file and command counts are soft budgets: when correct work needs more, the Skill explains why and switches to `standard` before exceeding them.

## Simple Request Bypass

A field explanation, exact error, display-text or CSS adjustment, local type fix, settled configuration edit, or code-reading question does not need the full clarification → specification → plan → implementation → test → review chain. The primary Skill reads the directly relevant content, answers or makes the smallest authorized edit, runs the nearest focused check, reports briefly, and stops.

Every request activates one primary Skill by default. A Skill can recommend a next Skill but cannot execute it unless the user explicitly requests an end-to-end flow or automatic continuation. The Router is an explicit recommendation tool, not a mandatory intermediate stage.

## Requesting a mode

Use the platform's real explicit Skill syntax and state the mode in natural language:

```text
Use $bug-root-cause-analysis in fast mode to diagnose this exact local error.
Use $architecture-deepening-analysis in audit mode for this cross-module redesign.
```

The repository does not claim a `mode=fast` invocation parameter or a cross-platform alias.

## Explicit-only Skills

Codex installable Skills, plugin Skills, and ChatGPT packages set `policy.allow_implicit_invocation: false` for heavyweight or easy-to-trigger specialist Skills, including release, migration, dependency-upgrade, security, performance, architecture-deepening, configuration-audit, session-handoff, broad project-health, ADR, prototype, and Router entrypoints. Invoke them with `$<skill-name>`.

Other build targets do not have a repository-verified equivalent policy field. Their generated instructions retain precise explicit-only descriptions and canonical execution metadata instead of inventing aliases or wrapper Skills.

## Safety is unchanged

Execution modes never change declared filesystem, shell, network, or destructive-action permissions. `fast` cannot bypass write authorization, command preflight, production-data boundaries, evidence honesty, or dangerous-operation stops. Unsafe or unauthorized work stops.

Detailed canonical rules live in:

- `packs/engineering/repo-doctor/references/execution-modes.en.md`
- each Skill's canonical `skill.yaml` `execution` block
- `tests/performance-contracts/cases.json`
