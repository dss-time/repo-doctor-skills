# Historical development validation — 2026-11-05

This retained development snapshot predates the final 0.10.0 recovery fixes. It must not be used as final release approval. Final release evidence is selected by scripts/release-metadata.mjs.

Validation used the actual authenticated Codex model `gpt-6.1-sol` and the current canonical/runtime content binding recorded in each JSON report. All active Skills are installed in an isolated Skill home. Model fixture workspaces use synthetic data. The original interrupted attempts are retained under `attempts/`.

## Completed coverage

- The core section of `advanced.json` covers all 33 active Skills with 165 bilingual explicit/implicit/negative cases and two-session installation discovery. All 165 pass. Of these, 140 valid results were reused after a service quota interruption; the remaining 25 were completed on resume with matching source/model/fixture bindings.
- `security-contextual.json` and `security-baseline.json` each cover eight vulnerable/safe source cases, language selection, output disclosure, tool attempts and per-attempt workspace integrity. Both have zero automated errors. Saved explanations were inspected by the primary agent against dataset semantic requirements and are attributed accordingly.
- `user-safety.json` covers four real model-action fixtures. Local edit preserves role/tenant/state checks and user content; existing-data title update preserves unrelated fields; shared-database test is blocked without executing its destructive setup; a concurrent user change from timeout 30 to 45 survives a later typo correction. The host runs protected behavioral checks under Node permissions after model edits. All four pass.
- `change-regression.json` covers eight supplied-content model cases. Pure browser JS excludes native memory requirements; Electron/native checks remain component-specific; C bounds checks exclude unsupported embedded mechanisms; settled decisions enter specification directly; a small plan remains atomic; unknown update semantics block unsafe implementation; zero/false values are preserved; exact edits do not request repeat authorization. Primary-agent semantic inspection accepts all eight.

`advanced.json` completes 10 bilingual workflow runs (40 scored steps), 65 output-mode cases and 14 permission cases. All 119 advanced cases pass, with 284/284 including the core set. Across core, advanced, security, targeted changes and actual-action fixtures, 312/312 scored cases pass. See `summary.json` for machine-readable coverage and current source/runtime bindings.

## Local checks

The complete local npm test suite, metadata/schema/workflow validation, generated-output quality checks, documentation checks and development release consistency pass. All 65 scripts pass Node syntax checking. Development consistency does not assert formal release readiness.

## Attempt history and limitations

Initial runs encountered `usageLimitExceeded`. `attempts/core-quota-blocked.json` and `attempts/security-quota-blocked.json` retain those results. Initial actual-edit checks also had a host verifier error: Node's filesystem permissions rejected `/tmp` symlink traversal. The verifier was corrected with `--preserve-symlinks-main --preserve-symlinks`, the original outputs were rechecked successfully, and all four cases were rerun with a fresh model workspace. Original and correction records remain under `attempts/`.

The semantic reviewer is the primary agent, not an independently commissioned second reviewer. Routing and advanced supplied-content cases are behavioral instruction checks. Actual edits are tested in four synthetic fixtures, not production systems. C fixtures receive static model assessment rather than unsafe native execution. Contextual injection is supplied repository text, not a native malicious tool-response pipeline. Backend integration, hardware, every language/framework and cross-client runtime behavior are outside this run's evidence.
