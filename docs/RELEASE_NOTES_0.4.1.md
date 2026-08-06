# Repo Doctor Skills v0.4.1 Stable Release

> Release date: 2026-08-06. This stable non-prerelease uses tag `v0.4.1` and fixes documentation, reproducible installation, and remote Release verification without changing Skill behavior.

## What changed

- Corrected stale candidate-state labels and replaced proposed-version wording with published-release facts.
- Pinned stable Codex marketplace installation to `v0.4.1`; `main` is now documented only as the development version.
- Added a dependency-free verifier that downloads a real GitHub Release, validates its Manifest and SHA-256 file, compares all remote asset digests, and inspects every ZIP.
- Added bilingual Release Asset Selection guides and synchronized English and Simplified Chinese documentation.

No Skill was added, removed, renamed, or behaviorally changed. There are no breaking changes and no new runtime dependencies. The repository remains at 4 active Packs, 40 active Skills, 27 Repo Doctor Skills, 13 workflows, 300 activation contracts, 7 regular platform builds, 37 single-Skill ZIPs, and 40 total Release assets.

Component contracts are unchanged: Repo Doctor Pack/plugin remains 0.7.0, Productivity Toolkit Pack/plugin remains 0.1.0, Skill Maintainer Pack/plugin remains 0.2.0, and Document Data Doctor Pack remains 0.1.0. Individual Skill versions are unchanged.

## Validation

Live-model validation remains **PASS at 317/317** for the unchanged Skill corpus: 200 core routing calls, 44 bilingual workflow steps, 61 mode/verdict cases, and 12 permission-boundary cases. The v0.4.1 patch changes documentation and release verification only; it does not represent the prior v0.4.0 report as a newly executed 317-call run.

The release gate also runs Schema, Skill, workflow, activation, full test, build, documentation, quality, release metadata, Doctor, syntax, generated-drift, sensitive-content, ZIP, and remote v0.4.0 asset checks. The published v0.4.1 assets are verified again after release.

## Install and upgrade

Stable release:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.4.1
```

Development version:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

Users upgrading from v0.4.0 should refresh or replace the configured marketplace source so it is pinned to `v0.4.1`, reinstall or refresh the selected plugin as required by the host, and start a new task for fresh Skill discovery. Users of individual ChatGPT Skills should download the corresponding `*-v0.4.1.zip` and verify it before replacing the prior upload.

## Release evidence

- [Live Codex validation report](../tests/reports/live-codex-skill-validation.md)
- [Bilingual validation report](../tests/reports/bilingual-skill-validation.md)
- [Build artifact validation report](../tests/reports/build-artifact-validation.json)
- [Release Manifest verification](guides/release-asset-selection.md#verify-release-metadata)
- [SHA256SUMS verification](guides/release-asset-selection.md#verify-release-metadata)
- [Release Asset Selection Guide](guides/release-asset-selection.md)

The Release Manifest and `SHA256SUMS-v0.4.1.txt` are formal GitHub Release assets generated from the final tagged content. They are intentionally not represented by machine-local paths or pre-release placeholders in the repository.
