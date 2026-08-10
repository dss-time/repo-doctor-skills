# Repo Doctor Skills v0.5.1 Stable Release

> Release date: 2026-08-10. This stable non-prerelease uses tag `v0.5.1` and is the first published release of the Repo Doctor execution-efficiency work.

## Release lineage

The immutable `v0.5.0` tag contains the intended Skill behavior, but its clean-checkout CI failed because the build-integrity test read ignored `dist/` output before the build step. No GitHub Release was created for v0.5.0. That historical tag is neither deleted nor rewritten. v0.5.1 contains the same Skill behavior plus a test-only clean-build isolation fix: the integrity test now generates and inspects canonical Codex output in a temporary directory.

The project version is 0.5.1. Repo Doctor Pack/plugin remains 0.8.0 and `safe-fix-implementation` remains 0.2.0; all other component versions are unchanged. All 4 active Packs and all 40 active Skills remain `beta`.

## Included capabilities

- canonical `fast`, `standard`, and `audit` execution profiles across all 27 Repo Doctor Skills;
- Simple Request Bypass and compact fast-mode responses;
- generated implicit-invocation policy;
- single-primary-Skill behavior and no automatic Skill chaining;
- progressive reference loading;
- concise Router selection and handoff behavior;
- 30 performance contracts covering 20 simple and 10 elevated scenarios;
- a resumable matched-pair Benchmark harness with bounded transport retries and truthful evidence capture;
- clean-checkout CI isolation for Codex build-integrity checks.

## Benchmark evidence

The final comparison completed **30/30** matched baseline/optimized pairs: 20 simple, 10 elevated, 15 English, and 15 Simplified Chinese. Baseline correctness was **27/30** and optimized correctness was **30/30**:

- 27 PASS/PASS;
- 3 FAIL/PASS;
- 0 PASS/FAIL regressions;
- 0 FAIL/FAIL.

Safety, permission, database, bilingual, no-regression, simple-execution-bounded, and explicit-heavy-invocation gates passed.

Live-model validation status is **PASS** for the 30-case comparison and the bounded current-candidate smoke suite.

In the versioned candidate smoke, the English release-readiness and Chinese database-safety turns first reached the 180-second transport ceiling without a usable result; rerunning only those two gaps with the disclosed 300-second recovery ceiling produced PASS at 208,272 ms and 191,700 ms. No prompt, Skill, model, reasoning effort, or assertion changed.

v0.5.1 prioritizes task correctness, invocation boundaries, and execution reliability. This Benchmark did **not** demonstrate lower latency or fewer tool calls: simple median latency changed by **+2.89%**, simple P75 latency by **+4.13%**, and median tool calls by **+33.33%**. It would be inaccurate to describe this release as “30% faster” or as significantly reducing runtime.

The final report records 2 baseline and 8 optimized transport retries/timeouts, with zero exhausted cases. Timeout attempts are excluded from latency aggregates. Two long optimized cases used a disclosed 300-second recovery timeout ceiling; prompts, model, reasoning effort, concurrency, retry count, and assertions were unchanged. See `tests/reports/live-performance-comparison.json` and its Markdown companion.

The earlier 317/317-call report remains historical v0.4.0 evidence and is not represented as a newly executed v0.5.1 corpus.

## Install or upgrade

For stable Codex marketplace use:

```text
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.5.1
```

Use `--ref main` only for deliberate development testing. Refresh or replace the marketplace source, reinstall or refresh the selected plugin as required by the host, and start a new task for fresh Skill discovery.

Standalone ChatGPT Skill users should download the matching `*-v0.5.1.zip`, verify it against `SHA256SUMS-v0.5.1.txt`, and then replace the prior upload. See the [Release Asset Selection Guide](guides/release-asset-selection.md).

## Release assets and verification

The release publishes 37 versioned standalone Skill ZIPs plus:

- `Repo-Doctor-Skills-v0.5.1-RELEASE_NOTES.md`;
- `Repo-Doctor-Skills-v0.5.1-RELEASE_MANIFEST.txt`;
- `SHA256SUMS-v0.5.1.txt`.

After publication, verify the actual remote GitHub Release assets with:

```text
npm run release:verify-remote -- --tag v0.5.1
```

The formal gate includes schema, Skill, workflow, activation, performance-contract, full-test, deterministic-build, clean-checkout, documentation, quality, release-metadata, Doctor, generated-drift, sensitive-content, ZIP-integrity, remote-asset, and isolated Codex smoke checks.
