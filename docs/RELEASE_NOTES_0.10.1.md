# Repo Doctor Skills 0.10.1

Stable release with documentation corrections, dated 2026-11-06. Tag `v0.10.1`.

## Changes

- Correct the bilingual README release status and identify final runtime evidence separately from historical development evaluations.
- Update coordination documentation to the shipped Task Context v2 implementation, Registry version 6, 13 workflows and 33 active Skills.
- Remove the obsolete Document Data Doctor Basic Skill distribution claim from the workflow cookbook.
- Clarify authorization gates. Reuse valid authorization within its scope and request additional authorization when the action is uncovered, the scope expands or a separate restriction applies.
- Publish the corrected README through the npm patch package and update stable installation examples.

## Validation

Live-model PASS evidence is reused from 0.10.0, whose 284/284 cases passed on gpt-6.1-terra. Actual single-edit, coordinated recovery and independent core-review evidence also comes from 0.10.0. The source reports retain their original versions.

The version-scoped record in tests/reports/release-promotion-0.10.1.json binds the source tag and commit, complete Skill source/runtime content, installer and CLI bytes, package manifest except version, and original report digests. Local documentation, release-metadata and packed-installation checks validate the patch.

Evaluation scope covers the recorded isolated fixtures and host adapter. Production systems and broader client/hardware integration require their own verification.

## Install

```sh
npx repo-doctor-skills@0.10.1 install --agent codex
npx repo-doctor-skills@0.10.1 install --preset full --agent codex
```

## Existing installations

Reinstallation replaces selected same-name Skills and skips identical content. For upgrades from versions before 0.10.0, use requirements-clarification for requirements-to-spec tasks and safe-change-plan for spec-to-work-items tasks. Review local customizations before manually removing old directories for the merged or removed PDF, Word and Excel Skills.
