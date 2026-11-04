# Repo Doctor Skills v0.9.0 — Stable release

Stable release on 2026-11-04 for tag `v0.9.0`. This promotes 0.9.0-beta.2 with equivalent Skill and published runtime content.

The source Beta Live-model validation is **PASS, 328/328** on GPT-6.1 Sol with low reasoning. Coverage includes 205 core cases, 44 workflow steps, 65 mode/verdict cases and 14 permission cases. The quota-interrupted advanced attempt is preserved. Recovery verified unchanged version, model, evaluator and complete Skill content before reusing passed cases.

## Changes

- Reinstalling with the bundled npm CLI replaces selected same-name Skill directories, including local edits and obsolete resources. Identical content is skipped and the batch rolls back on failure.
- Derive performance benchmark routing choices and current installation counts from canonical inventories. Historical baseline installation counts are observed separately.
- Align Shell tool requirements with prohibited Shell permissions in 17 Skills and make repository onboarding use native read-only file APIs.
- Add a regression gate for Shell requirements that contradict permissions.
- Keep Node.js >=18 support and add Linux, macOS and Windows installation CI on Node 18 and current LTS. Linux Node 18 also verifies the npm tarball.

- Preserve unresolved attested failures when environment information becomes unknown. A new regression detects the original delivery bypass.

- Bind completion receipts to the current execution attempt, preserve unresolved failures across task intent changes and prioritize demonstrated input changes over unknown environment fields.
- Keep checked-out text files in LF format for Windows frontmatter compatibility.

## Components

41 active Skills, 28 Repo Doctor Skills, 13 workflows and 38 ChatGPT ZIPs. Repo Doctor Pack/plugin is 0.11.1. Document Data Doctor Pack is 0.1.1.

## Validation

Current validation evidence is recorded in [the validation record](RELEASE_VALIDATION_0.9.0.md). Full-corpus and scoped workflow trial reports must bind the current canonical source and complete installed runtime.

## Known limitation

Independent core review passed the existing Beta gate with one non-blocking P2 finding. When dependency coverage is incomplete, evidence classification can remain unknown even after a recorded input demonstrably changes. Recovery can therefore be conservatively blocked. The original review is preserved in tests/reports/coordination-live-5S4dph/report.json.

## Installation

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

Install the stable npm CLI with `npx repo-doctor-skills@0.9.0 install`. The promotion record binds the unchanged source/runtime and original evidence at tests/reports/release-promotion-0.9.0.json.
