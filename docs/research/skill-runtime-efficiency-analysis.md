# Skill Runtime Efficiency Analysis

## Scope and baseline

This audit covers all 27 active Repo Doctor Skills, canonical descriptions and instructions, Skill and Pack references, the 13-workflow registry, 300 activation contracts, plugin `agents/openai.yaml`, all build adapters, and the existing 317-call live Codex report. Before modification, `npm run validate` and the complete `npm test` chain passed.

The live report proves routing, bilingual behavior, modes, workflows, and permission boundaries. It does not record reliable per-case file-read counts, command counts, wall time, or tool-call totals, so those baseline metrics remain unavailable rather than inferred.

## Baseline performance problems

1. Mode vocabulary existed in only some Skills and mixed disclosure modes with workflow variants such as `documented` or `test_first`.
2. Several ordinary Skills defaulted to `standard`, even when the request was a bounded local task.
3. The live Codex harness generated implicit-invocation expectations for every Skill, including release, migration, security, architecture, performance, and handoff specialists.
4. The plugin and ChatGPT builders did not emit the platform-supported `policy.allow_implicit_invocation` field.
5. Multi-stage workflow records and “next Skill” handoffs could encourage users or agents to treat a recommendation as automatic continuation.
6. Router use could add an unnecessary routing step before an already obvious primary Skill.
7. `bug-root-cause-analysis`, test implementation, review, prototypes, architecture analysis, and handoff have intentionally detailed evidence/safety contracts; without a common fast path, their compact modes were not consistently budgeted.
8. A few Skill-specific references already used progressive loading, but there was no Pack-wide rule preventing all-reference preload.
9. Output contracts varied; some compact modes still requested many fields.
10. English and Chinese files were structurally parallel, but execution cost was not represented in machine-readable bilingual-neutral metadata.

No Skill requires an unconditional full repository test or build in its core instructions. The main risk was escalation through ambiguous routing, specialist implicit activation, broad workflow interpretation, and inconsistent defaults—not a literal `npm test` command in every Skill.

## Active Skill classification and runtime contract

All `fast` profiles use the same soft budget: one primary Skill, up to 3 directly relevant files and 3 necessary commands, no full suite/build, no persistent audit report, no automatic Skill chaining, and the nearest focused validation. `standard` reads and validates the relevant module. `audit` retains full evidence, permission, command, risk, and stop-condition records.

| Skill | Classification | Default | Implicit | Minimum validation and boundary |
|---|---|---|---|---|
| repo-doctor-router | Router | fast | no | Verify one recommendation; never execute it or recurse. |
| repo-onboarding | Standard | fast | yes | Confirm entrypoints/commands from directly relevant repository files. |
| requirements-clarification | Lightweight | fast | yes | Close only material unresolved decisions; no implementation. |
| requirements-to-spec | Lightweight | fast | yes | Check acceptance criteria against settled evidence; no edits. |
| spec-to-work-items | Standard | fast | yes | Check observable slices and dependencies; no external task writes. |
| decision-prototype | Standard | standard | no | Run only an authorized isolated prototype; never use production data. |
| bug-root-cause-analysis | Standard | fast | yes | One qualified signal or focused reproduction; read-only diagnostics. |
| project-health-check | Heavyweight | standard | no | Broad evidence-backed survey only when explicitly requested. |
| safe-code-review | Standard | fast | yes | Review bounded diff/files; no fixes. |
| change-impact-analysis | Standard | fast | yes | Direct references/compatibility evidence for the named change. |
| safe-change-plan | Lightweight | fast | yes | Validate atomic steps and rollback; do not execute. |
| test-gap-analysis | Lightweight | fast | yes | Map one behavior to existing tests and the smallest gap. |
| safe-test-implementation | Standard | fast | yes | One focused red/green or characterization check; test-side writes only. |
| ci-failure-diagnosis | Standard | fast | yes | First credible CI error and narrow reproduction; no fix. |
| documentation-sync | Lightweight | fast | yes | Nearest docs check for authorized doc-only scope. |
| release-readiness-check | Explicit-only candidate | standard | no | Complete candidate release gate; read-only, no release action. |
| dependency-upgrade-analysis | Explicit-only candidate | standard | no | Defined dependency/version evidence; no manifest edits. |
| api-contract-review | Standard | fast | yes | Named contract compatibility check; no interface edits. |
| database-migration-review | Explicit-only candidate | standard | no | Migration safety/rollback evidence; never execute or access production. |
| dead-code-verification | Standard | fast | yes | Static/dynamic usage evidence; never delete. |
| security-focused-review | Explicit-only candidate | standard | no | Scoped threat/evidence review; no attacks or fixes. |
| performance-regression-analysis | Explicit-only candidate | standard | no | Controlled baseline/workload evidence; no optimization. |
| architecture-deepening-analysis | Explicit-only candidate | standard | no | Concrete caller/change evidence; no refactor or write. |
| architecture-decision-record | Standard | standard | no | Authorized ADR-only write and repository convention check. |
| configuration-audit | Explicit-only candidate | standard | no | Configuration provenance without reading secret values or editing. |
| session-handoff | Explicit-only candidate | standard | no | Sanitized, explicit continuation brief; no automatic continuation. |
| safe-fix-implementation | Standard | fast | yes | Smallest authorized edit plus nearest focused check. |

## Progressive references

The Pack now carries one bilingual execution-mode reference. Generated plugin Skills link to only the matching language reference and instruct the host to read it only when mode selection or escalation is unclear. Prototype and architecture checklists remain conditional. Audit, database, migration, and release material is loaded only for the corresponding risk or artifact.

## Platform capability matrix

| Target | Implicit policy | Implementation |
|---|---|---|
| Codex installable Skills | verified | `dist/codex-zh-CN/skills/*/agents/openai.yaml` emits `policy.allow_implicit_invocation` from canonical metadata. |
| Codex/ChatGPT plugin Skills | verified | Plugin `agents/openai.yaml` emits the same policy. |
| ChatGPT ZIP Skills | verified | Policy is preserved by deterministic ZIP generation. |
| Generic Markdown, Claude Code, Cursor, Qwen, Kimi, and the aggregate Codex `AGENTS.md` view | no repository-verified per-Skill policy field | Precise descriptions, canonical `execution` metadata, and common execution instructions; no alias or wrapper fabrication. The Codex target's sibling installable Skill packages still carry the policy. |

## Expected impact

The deterministic contracts reduce the maximum default simple-task scope to one primary Skill, three files, three commands, one focused check, and compact output. They eliminate full-suite/build permission for all 20 simple scenarios and require explicit invocation for heavyweight specialists. Exact tool-call and wall-time reduction must be measured in repeated real sessions; the repository does not fabricate a 30% claim from static contracts.
