# 0.10.0 release preparation

The stable release candidate is prepared on main. Publication is BLOCKED until the final-source live-model and coordination gates pass and npm authentication is restored.

## Passed local checks

- Metadata/schema validation: 33 active Skills, three Packs, 13 workflows.
- Complete npm test suite, including exact-scope authorization, deferred verification, data/credential safety, installer replacement/rollback and packed CLI installation.
- Seven generated targets, 33 ChatGPT ZIPs, bilingual quality, documentation and development release consistency.
- Isolated npm tarball smoke tests: Recommended 7/7 and Full 33/33.

## Evidence and remaining gates

The earlier development evaluation passed 312 scored cases and remains intact under tests/reports/unified-validation-2026-11-05. Release component version changes require new full source bindings. Final-version runtime Skill bytes match the development runtime, but that does not override the formal canonical-source gate.

An earlier final-version core run passed 165 cases. Independent core review then identified two P1 execution-receipt replay defects and one P2 evidence-validity issue. All three were fixed with new regressions, and the complete local suite passes. The fixed-source model run is being resumed after a preserved usageLimitExceeded interruption. The report is tests/reports/live-codex-skill-validation-0.10.0.json. It is a failed/incomplete release report, not a PASS claim. The required 284-case full core/advanced corpus remains pending.

The coordination trial tests/reports/coordination-live-pjisCt/report.json passed the simple edit and observed the regression-test stage, then model quota blocked the read-only review. Core review and the final coordinated release report remain pending. Original events are retained for resumption and audit.

The maintainer completed official npm login; account verification subsequently succeeded. An earlier E401 and failed CLI web-login attempt were resolved. No npm package or GitHub stable Release has been published for 0.10.0.

## Cleanup

Removed the superseded 0.9.0-beta.2 resumable checkpoint, an exact duplicate core report already included in the advanced development report, one redundant short evaluation log, and stale ignored release-candidate build directories. Reproducible tests and immutable historical release evidence remain. Personal local Skill installations are ignored rather than published.
