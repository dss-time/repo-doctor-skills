# Repo Doctor Skills 0.11.1

Stable non-prerelease documentation patch dated 2026-11-21. Tag `v0.11.1`.

## Changes

- Keep the 0.11.0 runtime, Skill source, installer and CLI behavior unchanged.
- Document the unified `npx skills` installation entry for Codex, Claude Code, Gemini CLI, Kimi Code CLI, Qwen Code and Cursor.
- Document WorkBuddy's official local Skill import boundary without inventing a WorkBuddy-specific installer flag.
- Clarify that installation-format compatibility does not guarantee host runtime, permission, automatic activation or multi-agent behavior.

## Validation

The reused 0.11.0 Live-model validation is PASS at 289/289 cases, with the source binding recorded in `tests/reports/release-promotion-0.11.1.json`. Local release metadata, documentation, package and packed-install checks are run for 0.11.1. No new large live-model evaluation is claimed for this documentation-only patch.

## Install and upgrade

```sh
npx repo-doctor-skills@0.11.1 install --agent codex
npx repo-doctor-skills@0.11.1 install --preset full --agent codex
npx skills@latest add dss-time/repo-doctor-skills -a claude-code
npx skills@latest add dss-time/repo-doctor-skills -a cursor
```

Selected same-name Skills replace the previous copy. Unselected Skills remain installed. WorkBuddy users should import the complete local `skills/` directory through WorkBuddy's documented Skill import.
