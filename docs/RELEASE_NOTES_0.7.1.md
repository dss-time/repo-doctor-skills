# Repo Doctor Skills v0.7.1 Stable Release

Release date: 2026-10-12. Tag: `v0.7.1`.

## Easier installation

Start with `npx skills@latest add dss-time/repo-doctor-skills`. Follow the installer to select Skills and agents; use `--skill safe-code-review` for one Skill, `--skill '*' -a codex` for all 40, and `-g` for user-wide installation. Node 24 and skills CLI 1.7.2 were tested.

Codex users can also run `codex plugin marketplace add dss-time/repo-doctor-skills` followed by `codex plugin add repo-doctor@repo-doctor-marketplace` for the 27 engineering Skills. Choose the plugin or copied Skills for the same agent to avoid duplicates. Preset and language options remain available through the original installer.

## Validation and release status

The real external installer successfully installed one Skill and all 40 Skills in a temporary project. All 149 installed files matched the candidate distribution, including resources and invocation policies. Repository tests now check complete resource parity and the advertised installation entry points.

Skill instructions, slugs, permission policies, component versions, and the 37-ZIP / 40-asset contract are unchanged from v0.7.0. This patch introduces no new model-performance claim.

Live-model status: **PASS, 317/317** from the fresh v0.7.1 report: 200 core cases, 44 bilingual workflow steps, 61 execution-mode/verdict cases, and 12 permission-boundary cases. Historical v0.4.0 results were not used to satisfy this gate. A first advanced attempt was blocked by service limits; a later attempt encountered nine capacity errors. These reports are retained, and targeted retries completed every case with unchanged Skill hashes and unchanged assertions. No reset coupon or release waiver was used.

The validator reuses host authentication. The tested Skill files are in a temporary installation; host capability metadata can also be visible during discovery. The corpus checks structured routing, workflow artifacts, modes, and stated permission boundaries; it does not measure production task outcomes, token savings, or latency improvement.
