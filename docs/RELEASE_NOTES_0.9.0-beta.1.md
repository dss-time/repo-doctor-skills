# Repo Doctor Skills v0.9.0-beta.1 — Beta Release Candidate

Prepared: 2026-11-02. Intended tag: `v0.9.0-beta.1`. This Release Candidate has not been published.

Live-model full-corpus routing status: **UNKNOWN** for this candidate. Historical 328-case PASS reports do not certify this source. No waiver is used. The separate, fresh coordination trial is a mandatory candidate gate and is reported with its exact source/runtime binding; it is not relabeled as a full-corpus evaluation.

## Capability and scope

- Opt-in serial collaboration using the existing Registry and existing Skill owners; single Skills still install and run independently.
- Task Context v2, source references, scoped evidence invalidation, independent review bindings, conditional progression and explicit recovery checks.
- Current host grants, Skill capability metadata, narrower body/mode rules and host capabilities remain separate required checks.
- Failed or interrupted writes require specific-attempt reconciliation; every checkpoint import needs fresh host verification, including pending checkpoints.
- A changed requested operation cannot inherit an old completion; unknown evidence remains unknown and old failures become stale when inputs change.

Repo Doctor Pack/plugin is 0.11.0. The project retains 41 active Skills, 13 workflows and 38 plugin-backed ChatGPT packages. Only changed Skill contracts receive independent patch increments.

## Validation and limits

The release gate requires current local tests, build/resource and installation checks, the six audited regressions and a fresh isolated Codex trial including an independent read-only core review. See the machine report `tests/reports/coordination-release-0.9.0-beta.1.json` and [candidate validation](WORKFLOW_COORDINATION_BETA_VALIDATION.md) for actual results; a missing or stale report blocks the candidate gate.

The live host driver loads the installed Skill before model execution, disables native Shell tools where prohibited, checks recorded tool events, and never accepts a reassurance string as an independent review verdict. It uses serial CLI sessions and synthetic fixtures. This does not certify arbitrary external MCP tools, same-agent automatic orchestration, Claude Code/Cursor native execution, multi-agent scheduling, production systems, or cross-session automatic wakeups.

Task Context v1 was an unpublished prototype. It is not automatically trusted or migrated: use explicit reinspection to create a v2 context. The helper still does not execute commands, access the network or persist state itself. Old checkpoints, attempts and reports remain historical evidence.

No matched old/new Token or tool-call savings are claimed. Tests passing do not authorize publication or production operations.

## Publication

No Git tag, GitHub Release or npm publication has been performed for this candidate. Any eventual prerelease should use the Beta channel and npm `beta` dist-tag, retaining the existing stable distribution.
