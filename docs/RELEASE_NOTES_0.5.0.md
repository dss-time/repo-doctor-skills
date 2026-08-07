# Repo Doctor Skills v0.5.0 Stable Release

> Release date: 2026-08-07. This stable non-prerelease uses tag `v0.5.0` and introduces a backward-compatible execution-efficiency contract for Repo Doctor Skills.

## What changed

- Added canonical `fast`, `standard`, and `audit` execution modes for all 27 Repo Doctor Skills.
- Added Simple Request Bypass, progressive reference loading, one-primary-Skill routing, focused validation, compact fast output, and a default prohibition on automatic Skill chaining.
- Generated `policy.allow_implicit_invocation` from canonical metadata. Heavyweight, specialist, Router, prototype, ADR, and handoff entrypoints require explicit invocation.
- Added 30 performance contracts covering 20 simple and 10 elevated requests, evenly split across English and Simplified Chinese.
- Improved explicit low-risk edit activation for `safe-fix-implementation` while preserving the separate test-only and documentation-only boundaries.

The project version advances to 0.5.0. The Repo Doctor Pack/plugin advances to 0.8.0 because its execution and activation contract changed. `safe-fix-implementation` advances to 0.2.0 because its public activation description changed. Other Pack, plugin, and Skill versions remain unchanged. All 4 active Packs and all 40 active Skills remain `beta`.

## Live performance validation

The final comparison completed **30/30** matched baseline/optimized cases: 20 simple, 10 elevated, 15 English, and 15 Simplified Chinese. Correctness improved from **27/30** at baseline to **30/30** optimized, producing this matrix:

- 27 PASS/PASS;
- 3 FAIL/PASS;
- 0 PASS/FAIL;
- 0 FAIL/FAIL.

Bilingual, permission, safety, no-regression, simple-execution-bounded, and explicit-heavy-invocation gates all passed. The optimized contracts corrected the baseline failures for database migration review, release readiness, and a clear low-risk edit request.

Live-model validation status is **PASS** for this 30-case comparison.

The measurements do **not** support a claim that simple requests became 30% faster. For simple cases, median latency changed by +2.89%, P75 latency by +4.13%, median tool calls by +33.33%, P75 tool calls by +25.00%, median output size by +2.33%, and P75 output size by -6.00%. Full-test, full-build, and automatic-chaining counts remained zero. The release is justified by correctness and bounded execution behavior, not measured speedup.

The final machine-readable report records 2 baseline and 8 optimized transport retries/timeouts, with zero exhausted cases. Timeout attempts are excluded from latency aggregates. Two long optimized cases were resumed with a disclosed 300-second recovery timeout ceiling; prompt, model, reasoning, concurrency, retry count, and assertions were unchanged. See `tests/reports/live-performance-comparison.json` and its Markdown companion for the complete evidence.

The earlier 317/317-call report remains historical v0.4.0 evidence and is not represented as a newly executed v0.5.0 corpus.

## Install or upgrade

For stable Codex marketplace use:

```text
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.5.0
```

Use `--ref main` only for deliberate development testing. After refreshing or replacing the marketplace source, reinstall or refresh the selected plugin as required by the host and start a new task for fresh Skill discovery.

Users of standalone ChatGPT Skills should download the matching `*-v0.5.0.zip`, verify it against `SHA256SUMS-v0.5.0.txt`, and then replace the prior upload. See the [Release Asset Selection Guide](guides/release-asset-selection.md).

## Release assets and verification

The release publishes 37 versioned standalone Skill ZIPs plus:

- `Repo-Doctor-Skills-v0.5.0-RELEASE_NOTES.md`;
- `Repo-Doctor-Skills-v0.5.0-RELEASE_MANIFEST.txt`;
- `SHA256SUMS-v0.5.0.txt`.

The manifest and checksum file are generated from the final tagged content. After publication, the remote verifier downloads and checks the real GitHub Release assets:

```text
npm run release:verify-remote -- --tag v0.5.0
```

The formal release gate includes schema, Skill, workflow, activation, performance-contract, full-test, deterministic-build, documentation, quality, release-metadata, Doctor, generated-drift, sensitive-content, ZIP-integrity, and remote-asset checks.
