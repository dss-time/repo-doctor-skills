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

The local candidate is frozen by content digest. Stable npm metadata remains at 0.11.1. macOS builds under Node 18 and 24 produced identical artifact trees, and upgrade from the published 0.11.1 npm package passed. Development metadata validation passed. The formal gate rejected legacy evidence bindings. Linux and Windows runs remain pending. [Freeze and build evidence](research/change-guard-integration.md#候选冻结和本轮补验)

## Trial scope

Local macOS **GO**. Three of four eligible final-candidate turns produced an automatic baseline and check. The public-module case missed invocation and the low-risk edit stayed light. Three targeted retries hit the model usage limit, leaving report handling unverified in those turns. Public Beta is **BLOCKED** pending dedicated prerelease metadata and validation of its artifacts and safety scope. RC is **BLOCKED** pending Linux and Windows execution and release-bound evidence for the candidate. Stable is **NO-GO** under the existing formal gate. Host hook execution remains unverified. [Observed behavior and limits](research/change-guard-integration.md)
