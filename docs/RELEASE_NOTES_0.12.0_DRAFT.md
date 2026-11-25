# Repo Doctor 0.12.0 release draft

[简体中文](RELEASE_NOTES_0.12.0_DRAFT.zh-CN.md)

**Release decision: NO-GO.** Package metadata and stable installation instructions still point to 0.11.1.

## Changes

- Change Guard compares Git-visible changes to a private, worktree-bound baseline. It reports changes to preexisting edits, scope violations, protected paths and unknown coverage.
- Local verification corrected duplicate mode/type notices, partial coverage through symlinks, and scope or protection aliases on case-insensitive filesystems.
- Implementation, safe fix, safe test and documentation Skills share a bundled Guard entry point when the risk, authorization and host capabilities warrant it. Manual diff review remains available when execution is unavailable.
- Verification receipts are worktree-bound. Older receipts are readable and require refreshed observation before reuse.

## Compatibility and limits

The repo, npm package, command, plugins and Skill names keep their current identifiers. The source CLI, locally packed npm build, those individual Skills and the Codex plugin carry the Guard runtime. The report leaves ownership unknown and does not modify code or the Git index. Ignored paths, hidden index flags, submodule-internal changes and transient concurrent changes can be missed.

## Release gates

The revised frozen candidate passed Node 18 and LTS on Linux, macOS and Windows, plus the separate Linux quality job. The fixes cover Windows worktree roots and case aliases. The separate 0.12.0-beta.1 package passed packaging and macOS upgrade checks on Node 18 and 24. Public stable installation remains on 0.11.1. [Candidate-bound evidence](../tests/reports/change-guard-0.12.0-release-validation-2026-11-25.json)

## Trial scope

Local trials are GO. The three same-model repeats ran the natural-language checks, including the earlier public-module miss. A policy finding still needs to be reviewed against actual authorization. See the verification record for the Beta, RC and Stable decisions. Host hook execution remains unverified. [Observed behavior and limits](research/change-guard-integration.md#0120-local2-跨平台和模型实测)

Project and personal installs and direct runtime checks passed for all six target agents. Codex has candidate host and natural-language observations. Public Beta and RC remain **BLOCKED**. Stable remains **NO-GO**. [Beta verification](RELEASE_NOTES_0.12.0-beta.1.md)
