# Repo Doctor Skills v0.4.0 Stable Release

> Release date: 2026-08-06. This stable non-prerelease uses tag `v0.4.0`. Deterministic, bilingual, build, isolated-install, and final Live-model validation all pass.

## Highlights

- Adds `decision-prototype` for disposable, non-production logic and UI decision validation.
- Adds `architecture-deepening-analysis` for evidence-backed, read-only architecture friction analysis and reversible option comparison.
- Upgrades six existing Skills: `requirements-clarification`, `safe-test-implementation`, `bug-root-cause-analysis`, `session-handoff`, `safe-code-review`, and `repo-doctor-router`.
- Provides complete English and Simplified Chinese instructions, examples, outputs, metadata, workflows, and user documentation for all 40 active Skills.
- Adds installable standalone Codex `SKILL.md` packages generated from canonical sources.

## Current inventory

- 4 active Packs and 40 active Skills, including 27 Repo Doctor, 8 Productivity Toolkit, 2 Skill Maintainer, and 3 Document Data Doctor Skills.
- 13 canonical workflows.
- 300 activation contracts covering every active Skill.
- 7 regular platform targets.
- 3 plugins and 37 standalone ChatGPT Skill ZIPs.

## Validation

Completed validation includes:

- Schema, manifest, workflow-registry, activation-contract, documentation, generated-drift, syntax, quality, release-metadata, and Doctor checks;
- bilingual file, metadata, semantic-parity, internal-link, and documentation consistency checks for 40/40 Skills;
- clean-room installation and two-session discovery of 40/40 locally built Codex Skills;
- 317/317 final-version real Codex calls: 80 explicit, 80 natural-language routing, 40 adjacent negatives, 44 bilingual workflow steps, 61 mode/verdict cases, and 12 permission-boundary cases;
- all 7 platform builds and all 37 ChatGPT ZIPs passing structure, extraction, content, path, secret, and provenance checks.

Final Live-model validation is **PASS** at 100% with zero failed or blocked calls. The final report was regenerated from the release content, stores bounded excerpts and SHA-256 evidence rather than bulk transcripts, and contains no local absolute paths.

## Compatibility and versioning

The proposed version is a backward-compatible minor project release from `v0.3.0`: no canonical Skill slug is removed or renamed, and no public Pack format is broken. Project, Pack/plugin, and individual Skill versions remain independent.

Component baselines are:

- Repo Doctor Pack/plugin: 0.7.0.
- Productivity Toolkit Pack/plugin: 0.1.0.
- Skill Maintainer Pack/plugin: 0.2.0.
- Document Data Doctor Pack: 0.1.0.
- Individual Skills: 31 at 0.1.0, 6 at 0.2.0, 2 at 0.3.0, and 1 at 0.4.0.

All active Packs and Skills remain `beta`; the stable project channel does not automatically promote component maturity.

## Install and upgrade

1. Fetch or download `v0.4.0`.
2. Run `npm run build` when using generated platform outputs.
3. For Codex, install the desired generated directory from `dist/codex-zh-CN/skills/<slug>/`.
4. Reinstall a compatibility plugin or upload the relevant newly built ChatGPT ZIP when using those distributions.
5. Start a new host task or session so Skill discovery cannot reuse an earlier installation.

Users upgrading from `v0.3.0` do not need to rename existing invocations.

## Safety

- Routing and analysis Skills remain read-only.
- Prototypes are explicitly disposable and must not use production databases or real credentials.
- Writable Skills retain exact-scope authorization gates; `fast` mode never bypasses them.
- Release, commit, push, dependency installation, deletion, migration, and credential use remain separately gated.
- Public artifacts exclude credentials, local absolute paths, customer data, organization-specific workflows, and private strategy material.

## Known limitations

- All Pack and Skill maturity statuses remain `beta`; broader public-use evidence will continue to accumulate after release.
- Document Data Doctor Skills are included in regular platform builds but do not have standalone plugins or ChatGPT ZIPs.
- Live-model outcomes are evidence for the tested Codex CLI/runtime and recorded prompts, not a guarantee that every future model or host version will route identically.

## Clean-room adaptation

The convenience improvements were implemented from repository requirements and independently expressed behavioral ideas. The repository does not copy external Skill source files, private repositories, credentials, customer data, or large passages from external work.
