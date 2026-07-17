# Repo Doctor Skills v0.3.0-rc.1 Release Candidate

> Candidate date: 2026-07-17. This candidate is intended for the `v0.3.0-rc.1` GitHub prerelease because all deterministic gates pass while live-model routing accuracy remains **UNKNOWN**.

## Highlights

- Adds `repo-doctor-router` for read-only Skill and workflow selection.
- Adds `requirements-clarification` for material product and behavior decisions.
- Adds `spec-to-work-items` for response-only, permission-safe work-item decomposition.
- Adds `session-handoff` for sanitized, evidence-separated continuation packages.
- Adds one canonical machine-readable workflow registry with Schema and mutation validation.
- Adds three bilingual Golden Workflows for feature delivery, bug repair, and session handoff.
- Adds offline live-model evaluation preparation, validation, and reporting without network calls or API-key access.
- Adds a read-only Doctor command with stable JSON output.
- Expands CI and release gates to cover scripts, schemas, workflows, tests, generated artifacts, documentation, and drift.
- Defines test-first, post-fix regression, and characterization modes for safe test implementation.
- Tightens permission, stop-condition, and workflow handoff boundaries.

## Current scale

- 4 active Packs and 1 draft template Pack.
- 38 active Skills and 1 draft template Skill.
- 25 Repo Doctor Skills.
- 8 Productivity Toolkit Skills.
- 2 Skill Maintainer Skills.
- 3 Document Data Doctor Basic Skills in regular platform outputs only.
- 7 regular cross-platform build targets.
- 35 plugin-backed ChatGPT ZIP packages: 25 `rd-*`, 8 `pt-*`, and 2 `sm-*`.
- 281 activation contract cases covering 38 of 38 required Skills.
- 3 Golden Workflows.
- 11 canonical workflows.

## Validation

The release candidate is gated by:

- all `scripts/**/*.mjs` passing `node --check`;
- `npm run validate`;
- `npm test`;
- `npm run build`;
- `npm run docs:check`;
- `npm run quality:check`;
- `npm run release:check`;
- `npm run eval:validate`;
- `npm run eval:report`;
- `npm run doctor` and `node scripts/doctor.mjs --json`;
- two consecutive builds with identical generated-content fingerprints;
- ZIP integrity, sensitive-content, machine-path, generated-drift, and `git diff --check` verification.

## Compatibility

Canonical Skill logic remains under `packs/`. Generated outputs support generic English and Chinese prompts, Codex, Claude Code, Cursor, Qwen, and Kimi. Repo Doctor, Productivity Toolkit, and Skill Maintainer also produce standalone ChatGPT Skill ZIPs.

Existing public Skill slugs remain available. Refresh generated outputs or reinstall the updated plugin or individual ZIP after upgrading from `v0.2.0`.

## Permission and safety

- Routing and analysis Skills remain read-only.
- `spec-to-work-items` returns Markdown in the response and does not create files or external tasks.
- Writable Skills remain limited to their declared scope and still depend on host and user authorization.
- Public artifacts exclude credentials, customer data, organization-specific workflows, and private investment strategy implementations.

## Known limitations

- Live-model evaluation has not been executed with a real hosted model; routing accuracy and bilingual behavior metrics remain **UNKNOWN**.
- Offline activation contracts and Golden Workflows validate deterministic contracts, not real-model effectiveness.
- All active Packs and Skills remain `beta`; this prerelease does not promote them to `stable`.
- Document Data Doctor Basic Skills do not have standalone plugin or ChatGPT ZIP distributions.

## Upgrade notes

1. Fetch or download `v0.3.0-rc.1`.
2. Run `npm run build` when using generated platform outputs.
3. Reinstall the relevant plugin or upload the new versioned ChatGPT ZIP.
4. Start uncertain repository work with `repo-doctor-router`.
5. Review requirements, testing, and response-only work-item boundary changes before reusing automated workflows.

Pack, plugin, and individual Skill versions remain independently managed according to [Versioning and Lifecycle Policy](VERSIONING.md). Historical tags and the `v0.2.0` prerelease remain unchanged.
