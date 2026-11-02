# Workflow coordination — local validation record

Date: 2026-10-30 (Asia/Shanghai). Working-tree implementation; no commit, publication or deployment performed. Existing P1 permission-distribution and documentation-command preflight fixes were preserved.

## Executed checks

| Command | Observed result |
|---|---|
| `npm run test:workflow` | PASS: original workflow contracts, Registry mutation tests, three Golden Workflow fixtures and 24 coordination integration tests |
| `npm run test:activation` | PASS: 306 activation contract cases across 41 active Skills; not 306 live model calls |
| `npm run test:performance` | PASS: 20 simple and 10 elevated scenario contracts; numerical file/command quotas removed |
| `npm run validate` | PASS: 42 Skill schema objects (41 active + template), 5 Packs and 13 workflows |
| `npm run quality:check` | PASS including generated-output coverage |
| `npm run test:build-integrity` | PASS: descriptions, 38 plugin Skills, ordering, filesystem perturbation and ZIP determinism |
| `npm run test:skills-sh` | PASS: 41 distributable Skills, zero missing/extra/duplicate/parse-error entries |
| `npm run test:plugin-sync` | PASS: 28 engineering Skills, permission/safety contracts, drift detection, pruning and idempotence |
| `npm run test:maintainer` | PASS: quality/scaffold/YAML/Schema/risk-permission tests, rerun after nullable Schema support |
| `npm run test:docs` | PASS: catalog checks for 4 published Packs, 41 Skills and 38 plugin/ZIP distributions |
| `git diff --check` | PASS |

Generated outputs were refreshed with the existing `build-skills`, plugin sync, `build-chatgpt-skills` and `prepare-npm-package` scripts. Generation is distinct from tests or client installation validation.

## What the 24 coordination tests establish

- A: one real temporary documentation edit with no forced interview, Router, work-item split or full regression.
- B: diagnosed local Bug, actual failing/passing Node checks, unrelated changes preserved and lockfile changes detected.
- C: unknown-root-cause diagnosis cannot complete without a reliable observed failure signal; a real temporary code fix and regression follow.
- D: real two-module fixture implementation, valid Spec reuse, complete applicable stages and review basis invalidation after a test change.
- E: security, database and public-interface obligations; current authorization and regression evidence cannot be bypassed.
- F: interrupted writes require reconciliation, restored summaries do not restore authority, stale write results do not automatically replay.
- G: review failure reopens implementation and descendants while retaining unaffected test evidence and requiring review again.
- Additional tests cover unknown applicability, required false conditions, directory additions/deletions, environment changes, tampered evidence, Registry drift, exact path scope, symlink escapes, failed test receipts, reopened decisions, manual handoff, revoked grants, changed task intent, Schema validity, current review bindings, mandatory verification, distribution parity and the explicit release-preparation gate.

Failures discovered during implementation were fixed rather than counted as successes: fixture receipts reused IDs after a rejected completion, fixture grants shared mutable request arrays, single-Skill contexts lacked Registry binding, nullable JSON Schema types were unsupported, and the quality checker compared canonical resource paths without adapter normalization. Subsequent independent inspection also tightened stale-write retry, task-intent binding, successful implementation verification and explicit release-gate handling. The final focused run passed 24/24 with zero skips or cancellations.

## Limits and old/new comparison

The original workflow/quality checks and new integration checks pass locally. This is not evidence of identical or improved live-model task quality, automatic cross-client orchestration, or a release-ready candidate.

No matched old/new live Agent execution was run. Token usage, repeated prompt/context size and tool-call savings are therefore **not measured**; no percentages are reported. Historical live-model reports were not reused to certify this working tree. The architecture document compares concrete capabilities and clearly separates fixture observations from unmeasured efficiency.

The test host explicitly attests semantic decisions and specialist findings. Those fixtures validate protocol enforcement, not a real security audit or database migration. Permission checks do not replace the host sandbox, current user authorization or narrower Skill instructions. Dependency completeness still needs host investigation; hashes alone do not prove relevance or coverage.

Not run: complete `npm test`, formal release gates, paid/remote live-model benchmarks, actual Codex/Claude Code/Cursor client installation and multi-Skill execution, deployment or publication. No persistent task file is required for the tested simple task, and the coordinator itself performs no command execution, network request or state-file write.
