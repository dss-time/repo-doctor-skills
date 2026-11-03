# Repo Doctor Skills v0.9.0-beta.2 — Beta Release Candidate

Prepared on 2026-11-03 for tag `v0.9.0-beta.2`.

Live-model validation is **UNKNOWN** while fresh current-source evaluation is running.

## Changes

- Reinstalling with the bundled npm CLI replaces selected same-name Skill directories, including local edits and obsolete resources. Identical content is skipped and the batch rolls back on failure.
- Derive performance benchmark routing choices and current installation counts from canonical inventories. Historical baseline installation counts are observed separately.
- Align Shell tool requirements with prohibited Shell permissions in 17 Skills and make repository onboarding use native read-only file APIs.
- Add a regression gate for Shell requirements that contradict permissions.
- Keep Node.js >=18 support and add Linux, macOS and Windows installation CI on Node 18 and current LTS. Linux Node 18 also verifies the npm tarball.

- Preserve unresolved attested failures when environment information becomes unknown. A new regression detects the original delivery bypass.

## Components

41 active Skills, 28 Repo Doctor Skills, 13 workflows and 38 ChatGPT ZIPs. Repo Doctor Pack/plugin is 0.11.1. Document Data Doctor Pack is 0.1.1.

## Validation

Current validation evidence is recorded in [the validation record](RELEASE_VALIDATION_0.9.0-beta.2.md). Full-corpus and scoped workflow trial reports must bind the current canonical source and complete installed runtime.

## Installation

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

The GitHub source includes the current candidate. The latest published stable npm version remains 0.8.1. This GitHub Release does not itself update npm distribution.
