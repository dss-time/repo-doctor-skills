# Repo Doctor Skills 0.11.0

Stable release target dated 2026-11-17. Tag `v0.11.0`.

## Changes

- Add `multi-agent-workflow`: choose single or multi according to actual task independence, authorization and native host capabilities. Existing Skills remain usable individually; Recommended 7 stays unchanged. Concurrent writers require isolated workspaces and lead integration.
- Add optional `project init/check/refresh` and `task create/list/save/resume` commands. Preview initialization before applying it; revision checks and source fingerprints protect local state. Recovery requires host revalidation and does not restore authority.
- Add read-only `installations check` with managed-content, duplicate and migration diagnosis. Installer records selected Skills transactionally, preserves unselected entries and rolls back replacements if recording fails.
- Apply project conventions before direct implementation, fixes, tests and documentation writes: inspect applicable directory instructions, relevant configuration inheritance and local style. Do not execute configuration for discovery, format unrelated files or silently persist preferences.
- Distribute 34 Skills, including 27 Repo Doctor Skills, and 34 ChatGPT ZIPs. The npm package bundles its project runtime without development dependencies.

## Validation

Live-model validation: PASS, 289/289 current-source cases on gpt-6.1-terra. Fresh single-edit, serial recovery and independent core-review trials passed. All six workspace safety cases and eleven lead-reviewed semantic cases passed. Full local npm tests, packed CLI, bilingual builds and documentation checks passed. Remote CI is checked before tagging. See [validation record](RELEASE_VALIDATION_0.11.0.md).

Historical 0.10.0/0.10.1 model reports are not reused to certify new content. Older native multi-agent development trials retain their original binding and limitations; they are not relabeled as current trials. No universal Token saving, hardware or cross-client runtime claim is made.

## Install and upgrade

```sh
npx repo-doctor-skills@0.11.0 install --agent codex
npx repo-doctor-skills@0.11.0 install --preset full --agent codex
npx repo-doctor-skills@0.11.0 install --skill multi-agent-workflow --agent codex
```

Reinstallation replaces selected same-name Skills, including local customizations; identical content is skipped and unselected Skills are preserved. Review customizations before upgrading. Older removed or merged Skill directories require manual review before cleanup: use requirements-clarification instead of requirements-to-spec and safe-change-plan instead of spec-to-work-items. No automatic deletion of unknown installations occurs.

Project setup and task checkpoints remain optional. Existing individual Skill calls require neither initialization nor multi-agent mode. The current host determines available tools, enforced sandbox controls and automatic activation.
