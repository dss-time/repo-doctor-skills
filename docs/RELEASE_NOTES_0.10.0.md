# Repo Doctor Skills 0.10.0

Stable release, non-prerelease. Tag: `v0.10.0`. Date: 2026-11-06.

## Changes

- Distribute 33 active Skills across Repo Doctor (26), Productivity Toolkit (5), and Skill Maintainer (2).
- Remove six PDF, Word and Excel Skills. Merge requirements-to-spec into requirements-clarification, and spec-to-work-items into safe-change-plan. Existing users should replace the former workflow entries with the merged owners.
- Preserve same-name installation replacement, identical-content skips and transactional rollback.
- Select security checks by actual language, runtime and component. Add execution boundaries for untrusted input, scoped authorization reuse and explicit deferred verification.
- Protect permission/business invariants, existing-data update semantics, test/build environment isolation, and preexisting/concurrent edits.
- Harden credential detection, model-turn evidence, checkpoint resume and report integrity. Retain reproducible regression tests and remove a superseded checkpoint and duplicate report.

## Validation

Live-model validation: PASS, 284/284 cases against final source/runtime on gpt-6.1-terra, plus actual single-edit and coordinated recovery trials and an independent core safety review. An earlier gpt-6-sol first pass scored 161/165; its four semantic failures are preserved, and the complete stronger-model run passed without changing source or expectations. The preceding development run passed 312 scored cases on gpt-6.1-sol, including all 33 Skills, modes, permissions, security code pairs, targeted language/flow cases and actual synthetic-workspace edits. Final release results are recorded in tests/reports/live-codex-skill-validation-0.10.0.json and tests/reports/coordination-release-0.10.0.json.

Evidence covers isolated synthetic fixtures and model instruction behavior. It does not claim production/backend/hardware or every client/framework integration. Component maturity remains independent of this stable project release.

## Install

```sh
npx repo-doctor-skills@0.10.0 install --agent codex
npx repo-doctor-skills@0.10.0 install --preset full --agent codex
npx repo-doctor-skills@0.10.0 install --skill safe-fix-implementation --agent codex
```

Release assets include 33 standalone Skill ZIPs, release notes, a commit-bound manifest and SHA256 checksums. npm ships the CLI and self-contained runtime resources; repository tests and historical reports stay outside the published package.

## Existing installations

Reinstallation replaces selected same-name Skills. It does not automatically delete previously installed Skills whose names were removed in this release. Review those old directories and any local customization before removing them. Use requirements-clarification instead of requirements-to-spec, and safe-change-plan instead of spec-to-work-items. The removed PDF/Word/Excel entries are listed in the 0.9.0-to-0.10.0 source diff.
