# Changelog

All notable changes to this project will be documented in this file.

Repo Doctor Skills is a pre-1.0 project. Project release versions, component versions, and maturity statuses follow the separate policies documented in [Versioning and Lifecycle Policy](docs/VERSIONING.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.4.1] - 2026-08-06

> Stable documentation and release-verification patch. The public Skill inventory and behavior are unchanged from v0.4.0.

### Added

- Added bilingual Release Asset Selection guides for choosing individual ChatGPT Skill ZIPs, Codex plugins, and version-pinned installation paths.
- Added a dependency-free remote Release asset verifier with deterministic tests and a `release:verify-remote` command.

### Changed

- Pinned stable Codex marketplace installation examples to `v0.4.1` and clearly separated them from development installs using `main`.
- Advanced the project release version to 0.4.1 while preserving independent, unchanged Pack, plugin, and Skill component versions.

### Fixed

- Replaced stale blocked-candidate labels and proposed-version wording with published-release facts.
- Synchronized the documented Release asset count and validation evidence with the actual remote Release inventory.

### Security

- Added remote checks for Release digests, Manifest and SHA-256 consistency, ZIP integrity, path traversal, absolute paths, repository/build debris, credential patterns, slug identity, and bilingual content.

### Documentation

- Added bilingual v0.4.1 Release Notes, evidence entry points, stable upgrade guidance, and asset selection instructions without adding, removing, or renaming a Skill.

## [0.4.0] - 2026-08-06

> Stable project release with 317/317 final-version real Codex calls passing: 200 core routing calls, 44 bilingual workflow steps, 61 mode/verdict cases, and 12 permission-boundary cases.

### Added

- Added `decision-prototype` for explicitly disposable, non-production logic and UI decision validation.
- Added `architecture-deepening-analysis` for evidence-backed, read-only architecture friction and reversible option analysis.
- Added bilingual problem-oriented quick Skill entrypoint guides and a clean-room external-reference analysis.
- Added generated, standalone Codex `SKILL.md` packages for every active Skill and machine-readable release-validation reports.

### Changed

- Upgraded requirements clarification to fast, standard, and documented decision-tree interviewing with repository-fact discovery and explicit documentation write gates.
- Upgraded safe test implementation to one-behavior red–green–organize cycles with public-boundary, command, evidence, and production-code gates.
- Made qualified success/failure signals the first requirement of Bug root-cause analysis and separated trigger, direct cause, and systemic root cause.
- Made session handoffs next-goal-aware, reference-first, automatically sanitized, and OS-temporary by default.
- Reworked safe code review around independent Repository Conformance, Change Intent Fidelity, and Operational Safety axes.
- Made router output concise by default, added mode selection and the two new Skills, and rejected unverified alias frontmatter or wrapper Skills.
- Increased Repo Doctor Pack/plugin inventory to 27 Skills and the active repository inventory to 40 Skills.
- Expanded the canonical workflow registry to 13 workflows and the activation suite to 300 contracts.

### Fixed

- Corrected two ambiguous adjacent-routing fixtures to match their canonical Skill boundaries: confirmed-root-cause fixes route to `safe-fix-implementation`, and public API compatibility review routes to `api-contract-review`.
- Ensured Codex validation installs and discovers only the current checkout's freshly built Skills in an isolated temporary environment.

### Security

- Preserved explicit write gates, dangerous-command preflight, no-production defaults, evidence states, bilingual parity, canonical generation, and deterministic build-integrity checks.
- Added 12 live permission-boundary cases and sanitized, bounded validation evidence so reports contain neither local absolute paths nor bulk model transcripts.

### Documentation

- Synchronized English and Simplified Chinese entry guides, manuals, catalogs, workflow documentation, platform installation instructions, version policy, and release notes with the 40-Skill release.
- Added per-Skill bilingual parity, build-artifact, inventory, and 317-call live Codex validation reports.

## [0.3.0] - 2026-07-17

> Stable project release promoted from `v0.3.0-rc.1` with no functional code drift. Live-model routing accuracy remains UNKNOWN under the explicit, version-scoped maintainer waiver; all other release gates remain mandatory.

### Added

- Published the RC-validated 38-Skill, 11-workflow, and 3-Golden-Workflow inventory through the stable project channel.

### Changed

- Promoted only the project release channel from `0.3.0-rc.1` to `0.3.0`; Pack/plugin/Skill component versions remain independent and all active Pack/Skill maturity statuses remain `beta`.

### Fixed

- Replaced RC-only release metadata with stable-release validation and an auditable `v0.3.0`-only Live-model waiver contract.

### Security

- Preserved every Schema, test, permission, security, build, CI, artifact, and checksum gate; the waiver applies only to the disclosed UNKNOWN Live-model status.

### Documentation

- Added stable Release Notes, upgrade guidance, compatibility disclosure, and preserved the historical `v0.3.0-rc.1` notes unchanged.

## [0.3.0-rc.1] - 2026-07-17

> Release Candidate published because deterministic gates pass while live-model routing accuracy remains UNKNOWN.

### Added

- Added `repo-doctor-router`, `requirements-clarification`, `spec-to-work-items`, and `session-handoff` increasing the active Skill count from 34 to 38.
- Added the canonical workflow registry, Schema validation, bilingual Golden Workflows, offline live-model evaluation infrastructure, a read-only doctor command, and complete CI quality gates.

### Changed

- Upgraded Bug RCA, safe code review, safe test implementation, Skill authoring, and Skill quality audit while preserving their permission boundaries.
- Separated material requirements clarification from settled-requirement specification and introduced explicit test-first, post-fix regression, and characterization test modes.

### Fixed

- Enforced response-only work-item output and explicit write gates so read-only evidence cannot become file, shell, external-task, or implementation authorization.

### Security

- Preserved public-safe, least-privilege boundaries across routing, analysis, testing, work-item planning, and release workflows.
- Added deterministic checks for credentials, machine paths, generated drift, forbidden actions, and unauthorized writes.

### Documentation

- Added bilingual testing and evaluation guidance, workflow registry documentation, release preparation evidence, and current generated Skill catalogs.

## [0.2.0] - 2026-07-15

> This historical candidate was published as the `v0.2.0` prerelease. Later repository changes do not alter or move that tag or Release.

### Added

- Twenty-one Repo Doctor Skills covering onboarding, specification, bug root-cause analysis, safe planning and implementation, test work, CI diagnosis, documentation synchronization, release readiness, dependency upgrades, API contracts, database migrations, dead-code verification, security, performance regressions, architecture decisions, and configuration.
- Deterministic activation and workflow-contract coverage for the released Skills, permissions, generated outputs, and build invariants.
- Independent Productivity Toolkit Pack and plugin with eight bilingual, cross-industry office and research Skills.
- Independent Skill Maintainer Pack and plugin with controlled Skill authoring and strictly read-only Skill quality auditing.
- Three Document Data Doctor Basic Skills for read-only PDF, Word, and spreadsheet inspection across the seven regular platform targets, without standalone plugin or ChatGPT ZIP distribution.
- Bilingual activation contracts for positive, negative, boundary, adjacent-Skill, assumption, blocking, capability-degradation, and safety scenarios.
- Deterministic quality fixtures for metadata, resources, UI integration, permissions, line limits, credentials, machine paths, YAML parsing, Schema validation, synchronization, and build integrity.
- Cursor, Qwen, and Kimi adapters alongside the existing generic Markdown, Codex, and Claude Code outputs.
- Thirty-one plugin-backed single-Skill ChatGPT ZIP packages using the `rd-*`, `pt-*`, and `sm-*` publication prefixes.
- First-level `references/`, `assets/`, and deterministic `scripts/` resource packaging for supported targets.

### Changed

- Preserved analysis, controlled-edit, testing, and maintainer permission boundaries across the released Skills.
- Released Repo Doctor Pack/plugin 0.5.0 and Skill Maintainer Pack/plugin 0.1.0.
- Established `packs/` as the only canonical source for Skill logic, with `plugins/` and `dist/` treated as synchronized or generated outputs.
- Moved the single canonical `report-writer` implementation to Productivity Toolkit while preserving its public invocation slug.
- Made plugin synchronization, target traversal, resource copying, archive ordering, and repeated builds deterministic.
- Preserved complete ChatGPT descriptions and parsed structured `risk_level` metadata without lossy flattening.
- Replaced hard-coded activation `requiredSkills` inventories with canonical discovery.
- Clarified bilingual UI labels, trigger exclusions, adjacent-Skill handoffs, Basic/Full document routing, and analysis-versus-implementation boundaries.
- Limited Bug RCA shell use to explicit, minimal, non-destructive local reproduction supported by repository evidence.
- Strengthened the Skill scaffold with global slug/ID checks, exact ID suffix and Pack category checks, length limits, and atomic cleanup after failed creation.
- Promoted all 4 active Packs and 34 active Skills from `draft` to evidence-backed `beta`; the template Pack and template Skill remain `draft`, and no component is represented as `stable` without real-use evidence.

### Fixed

- Removed business-logic drift between the canonical definitions and generated copies of the original five Repo Doctor Skills.
- Removed duplicate descriptions from ChatGPT ZIP metadata.
- Corrected validation of inline structured `risk_level` mappings.
- Prevented Basic document Skills from taking Full review requests and vice versa.
- Removed nondeterministic filesystem traversal and ZIP member ordering.
- Corrected legacy documentation that treated generated plugin copies as a second source of truth.
- Documented all `rd-*`, `pt-*`, and `sm-*` ChatGPT ZIP families instead of only the original Repo Doctor packages.
- Excluded `.DS_Store`, empty optional directories, stale generated files, and other packaging noise.

### Security

- Enforced the public/private boundary for customer data, organization-specific workflows, secrets, and private investment strategies.
- Kept destructive actions disabled for every active Skill and constrained writable Skills to their documented scope.
- Added obvious credential, machine-path, and generated-artifact scans without displaying secret values.
- Documented that permission metadata expresses declared intent and does not replace host authorization or runtime enforcement.
- Required conservative tool degradation and evidence labels when shell, network, OCR, rendering, or file tools are unavailable.

### Documentation

- Added bilingual User Manuals, deterministic complete Skill Catalogs, and Workflow Cookbooks.
- Added deterministic catalog generation, documentation drift checks, and catalog tests.
- Unified README, Quick Start, legacy-plugin, platform-adapter, maintainer, and canonical/generated-architecture guidance.
- Added a two-layer project/component version policy, independent maturity-status definitions, and documentation of the historical `v0.0.1` tag-label error.

## [0.1.0] - 2026-07-09

### Added

- Initial bilingual, cross-platform Skills framework with canonical Pack metadata, validation, build adapters, templates, and public/private safety guidance.
- The original five Repo Doctor Skills and the initial Document Data Doctor basic workflows.
- Generic English and Chinese Markdown, Codex, and Claude Code build outputs plus the Repo Doctor compatibility plugin.

### Changed

- Renamed the project direction from a Codex-only plugin to Repo Doctor Skills while retaining the compatibility path for existing users.

### Security

- Added the initial public/private boundary and finance-interface safety documentation.

> Historical note: the GitHub Release used tag `v0.0.1`, while the release name/body and repository release metadata identified the content as 0.1.0. This version-label mismatch is a known historical error; the existing tag remains unchanged. See [Versioning and Lifecycle Policy](docs/VERSIONING.md).

[Unreleased]: https://github.com/dss-time/repo-doctor-skills/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/dss-time/repo-doctor-skills/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/dss-time/repo-doctor-skills/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/dss-time/repo-doctor-skills/compare/v0.3.0-rc.1...v0.3.0
[0.3.0-rc.1]: https://github.com/dss-time/repo-doctor-skills/compare/v0.2.0...v0.3.0-rc.1
[0.2.0]: https://github.com/dss-time/repo-doctor-skills/compare/v0.0.1...v0.2.0
[0.1.0]: https://github.com/dss-time/repo-doctor-skills/releases/tag/v0.0.1
