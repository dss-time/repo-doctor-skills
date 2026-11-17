# Project setup, task checkpoints and installation diagnosis

[简体中文](PROJECT_STATE.zh-CN.md)

These commands are included in the 0.11.0 CLI and can also run from a checkout. Version 0.10.1 predates these additions. The existing Skills remain usable individually; setup is optional. All commands return JSON. A successful command exit means the state operation completed, while the returned status describes whether evidence is current, stale or unverified.

## Project setup and reuse

```sh
node bin/repo-doctor-skills.mjs project init --root .
node bin/repo-doctor-skills.mjs project init --root . --apply
node bin/repo-doctor-skills.mjs project check --root .
```

The first command previews without writing. `--apply` writes `.repo-doctor/project.json` and a local `.repo-doctor/.gitignore` that ignores state by default. Existing user ignore rules and existing project configuration are preserved. JSON files are created with private permissions where supported by the OS.

The profile stores package script references, existing document pointers and fingerprints of relevant manifests, lockfiles and repository instructions. It does not copy script bodies, environment variables or credentials. Non-Node manifests such as CMake, Make, Cargo, Go and Python are fingerprinted without inventing execution commands. `environment_safety` stays `unverified`; a matching fingerprint does not establish safe command execution.

When a source changes, `project check` returns `STALE` and relative changed paths. Inspect the current definitions before explicitly refreshing the profile. Use the actual revision from the preceding output:

```sh
node bin/repo-doctor-skills.mjs project refresh --root . --revision 1
node bin/repo-doctor-skills.mjs project refresh --root . --revision 1 --apply
```

Refresh previews by default and checks the revision again under a lock before writing. Filesystem roots, escaping paths and symlinks inside managed state are rejected. The project binding is tied to the resolved root; copied or moved state requires an explicit new setup/migration. No stored field grants host authority.

## Durable tasks and safe continuation

```sh
node bin/repo-doctor-skills.mjs task create --root . --id export-fix --goal "Fix the approved export behavior" --acceptance export-correct --skill safe-fix-implementation
node bin/repo-doctor-skills.mjs task list --root .
node bin/repo-doctor-skills.mjs task resume --root . --id export-fix
```

A registered workflow may be selected with `--workflow bug-repair` instead of `--skill`. Each task lives in `.repo-doctor/tasks/<id>.json`. IDs use lowercase letters, digits and hyphens. Creating or listing a task does not execute it.

A host can save a real Task Context v2 after an authorized stage. Supply the raw `context` object as a JSON file and the current saved revision:

```sh
node bin/repo-doctor-skills.mjs task save --root . --id export-fix --input checkpoint.json --revision 1
```

Saving validates identity, context structure, registry compatibility and revision, preserves history, and records dependency fingerprints from scope files and evidence. Incomplete dependency coverage remains unknown. Existing records survive rejected updates and failed atomic writes. Concurrent cooperating writers use a project lock; revision checks also reject stale updates.

`task resume` reuses the existing coordination core. Running stages become interrupted, old next-action suggestions are cleared and host authorization/trusted evidence are never restored. It returns `requires_host_revalidation: true`, with `UNKNOWN` or `STALE`; it does not certify completion. Changed registry definitions return migration information with no restored context. The host must recheck actual effects before retrying an interrupted operation, and verify live user authorization and receipts before continuing. The CLI supplies discovery and validated checkpoints, not an automatic session wakeup.

## Installation origin and upgrade diagnosis

The bundled installer now records selected installed Skills in a sibling receipt file such as `.repo-doctor-skills.json` beside a target named `skills`. The target itself still contains only Skill directories. Receipts record source, package version, language and content fingerprints, while preserving unselected entries. Selected same-name replacement, identical-content skips and whole-batch rollback remain supported. Receipt commit failure rolls back that batch too.

```sh
node bin/repo-doctor-skills.mjs installations check --target-dir .agents/skills
```

Repeat `--target-dir` to inspect several explicitly chosen locations. Without it, diagnosis checks the conventional project/user `.agents/skills` and `.codex/skills` locations, with no writes or network access. For plugin caches or custom layouts, supply the actual Skill directory explicitly. It reports:

- Tracked current, locally modified or missing installations.
- Unknown origins for files without a valid receipt, including third-party installer copies.
- Duplicate slugs across inspected locations and same/different/unverified content.
- Migration hints for the two merged names and six removed office Skills.
- Invalid receipts, unsafe links and unverified content without trusting ownership claims.

Receipts are local records, not cryptographic provenance. Diagnosis never deletes, adopts or overwrites unknown installations. Review customization and installation method before acting on a migration hint. External installers and plugin updaters do not automatically write this CLI's receipts.

## Failures and validation

Busy locks are reported, never automatically deleted. After interruption, inspect the original process and state before manually removing an abandoned lock. Filesystem writes use temporary regular files and atomic rename, plus cooperating-process locks and revisions; external tools that ignore those locks still require host conflict checks.

Run `npm run test:state` for state/CLI regressions and `npm run test:ux` for installer rollback. The packed CLI test covers the same public entry points with self-contained runtime data. No command runs stored validation scripts, installs project dependencies, migrates data or accesses production.
