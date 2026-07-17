# Changelog

All notable changes to this project will be documented in this file.

Repo Doctor Skills is a pre-1.0 project. Project release versions, component versions, and maturity statuses follow the separate policies documented in [Versioning and Lifecycle Policy](docs/VERSIONING.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-07-15

> Release Candidate metadata. This version has not been tagged, pushed, or published by the repository changes alone.

### Added

- Twenty scoped Repo Doctor workflows covering workflow routing, requirements clarification and specification, vertical work-item planning, session handoff, bug root-cause analysis, safe change planning, test work, CI diagnosis, documentation synchronization, release readiness, dependency upgrades, API contracts, database migrations, dead-code verification, security, performance regressions, architecture decisions, and configuration.
- Deterministic workflow-contract coverage for routing references, requirements decision states, vertical work-item fields, sanitized session transfer, repeatable bug feedback, dual-dimension review, incremental test feedback, and Skill-maintenance quality.
- Independent Productivity Toolkit Pack and plugin with eight bilingual, cross-industry office and research Skills.
- Independent Skill Maintainer Pack and plugin with controlled Skill authoring and strictly read-only Skill quality auditing.
- Three Document Data Doctor Basic Skills for read-only PDF, Word, and spreadsheet inspection across the seven regular platform targets, without standalone plugin or ChatGPT ZIP distribution.
- Bilingual activation contracts for positive, negative, boundary, adjacent-Skill, assumption, blocking, capability-degradation, and safety scenarios.
- Deterministic quality fixtures for metadata, resources, UI integration, permissions, line limits, credentials, machine paths, YAML parsing, Schema validation, synchronization, and build integrity.
- Cursor, Qwen, and Kimi adapters alongside the existing generic Markdown, Codex, and Claude Code outputs.
- Thirty-five plugin-backed single-Skill ChatGPT ZIP packages using the `rd-*`, `pt-*`, and `sm-*` publication prefixes.
- First-level `references/`, `assets/`, and deterministic `scripts/` resource packaging for supported targets.

### Changed

- Upgraded Bug RCA, safe code review, safe test implementation, Skill authoring, and Skill quality audit while preserving their permission boundaries.
- Advanced Repo Doctor Pack/plugin to 0.6.0 and Skill Maintainer Pack/plugin to 0.2.0.
- Established `packs/` as the only canonical source for Skill logic, with `plugins/` and `dist/` treated as synchronized or generated outputs.
- Moved the single canonical `report-writer` implementation to Productivity Toolkit while preserving its public invocation slug.
- Made plugin synchronization, target traversal, resource copying, archive ordering, and repeated builds deterministic.
- Preserved complete ChatGPT descriptions and parsed structured `risk_level` metadata without lossy flattening.
- Replaced hard-coded activation `requiredSkills` inventories with canonical discovery.
- Clarified bilingual UI labels, trigger exclusions, adjacent-Skill handoffs, Basic/Full document routing, and analysis-versus-implementation boundaries.
- Limited Bug RCA shell use to explicit, minimal, non-destructive local reproduction supported by repository evidence.
- Strengthened the Skill scaffold with global slug/ID checks, exact ID suffix and Pack category checks, length limits, and atomic cleanup after failed creation.
- Promoted all 4 active Packs and 38 active Skills from `draft` to evidence-backed `beta`; the template Pack and template Skill remain `draft`, and no component is represented as `stable` without real-use evidence.

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

[Unreleased]: https://github.com/dss-time/repo-doctor-skills/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/dss-time/repo-doctor-skills/compare/v0.0.1...v0.2.0
[0.1.0]: https://github.com/dss-time/repo-doctor-skills/releases/tag/v0.0.1
