# Release Preparation: v0.3.0-rc.1

## Decision

Publish project version `0.3.0-rc.1` as a GitHub prerelease. The next RC number was selected after confirming that no local or remote `v0.3.0*` Tag or GitHub Release existed before preparation.

A stable `v0.3.0` is not eligible because live-model evaluation remains **UNKNOWN**. Deterministic checks, activation contracts, Golden Workflows, and offline evaluation tooling must not be represented as hosted-model accuracy evidence.

## Evidence snapshot

- Previous published prerelease: `v0.2.0`, commit `ce03c3e4989ee1a5e41c71c8826b7c001fd00563`.
- Development base before release preparation: `28df8f0e771208a68eeba73cde32e91337ebd1d9`.
- Project candidate: `0.3.0-rc.1`.
- Candidate date: 2026-07-17.
- Active inventory: 4 Packs and 38 Skills.
- Distribution inventory: 7 regular platform targets and 35 ChatGPT ZIPs.
- Workflow evidence: 11 canonical workflows and 3 Golden Workflows.
- Activation evidence: 281 cases and 38/38 required Skills.
- Live-model status: `UNKNOWN`.

## Compatibility and migration

No public Skill slug is removed. This candidate adds four Repo Doctor workflows and tightens responsibilities:

- material choices use `requirements-clarification`;
- settled requirements use `requirements-to-spec`;
- work-item decomposition remains response-only;
- test implementation declares test-first, post-fix regression, or characterization mode.

Consumers upgrading from `v0.2.0` should rebuild platform outputs and reinstall the relevant plugin or standalone ChatGPT ZIP.

## Component versions

Project, Pack/plugin, and Skill versions remain independent. This project RC does not mechanically change component versions:

- Repo Doctor Pack/plugin: 0.6.0.
- Productivity Toolkit Pack/plugin: 0.1.0.
- Skill Maintainer Pack/plugin: 0.2.0.
- Document Data Doctor Pack: 0.1.0.

## Required release assets

- 25 versioned `rd-*.zip` files.
- 8 versioned `pt-*.zip` files.
- 2 versioned `sm-*.zip` files.
- SHA-256 checksum file.
- Release Notes.
- Release Manifest tied to the release commit.

## Gate conclusion

**GO FOR PRERELEASE** only after validation, tests, repeated deterministic builds, sensitive-content scans, remote `main` CI, immutable annotated Tag creation, GitHub prerelease creation, asset upload, and post-release download verification all succeed.
