# Repo Doctor Skills v0.7.1 Stable Release Preparation

Prepared 2026-10-12 for tag `v0.7.1`. This document describes the intended stable release; publication has not occurred.

## Easier installation

Start with `npx skills@latest add dss-time/repo-doctor-skills`. Follow the installer to select Skills and agents; use `--skill safe-code-review` for one Skill, `--skill '*' -a codex` for all 40, and `-g` for user-wide installation. Node 24 and skills CLI 1.7.2 were tested.

Codex users can also run `codex plugin marketplace add dss-time/repo-doctor-skills` followed by `codex plugin add repo-doctor@repo-doctor-marketplace` for the 27 engineering Skills. Choose the plugin or copied Skills for the same agent to avoid duplicates. Preset and language options remain available through the original installer.

## Validation and release status

The real external installer successfully installed one Skill and all 40 Skills in a temporary project. All 149 installed files matched the candidate distribution, including resources and invocation policies. Repository tests now check complete resource parity and the advertised installation entry points.

Skill instructions, slugs, permission policies, component versions, and the 37-ZIP / 40-asset contract are unchanged from v0.7.0. This patch introduces no new model-performance claim.

Live-model status: **BLOCKED**. The complete behavioral report required for the unchanged v0.7.0 Skills is still absent; historical v0.4.0 results and partial attempts cannot satisfy the gate. The release metadata now reports that block honestly rather than declaring PASS. No waiver applies to v0.7.1. npm authentication returned E401 during release preparation. Formal publication requires resolving these blocks, passing final Main and Tag CI, and verifying public assets.
