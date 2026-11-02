# Workflow coordination and incremental execution

Unpublished 0.9.0-beta.1 candidate with Task Context v2. See [the detailed architecture, API and A–G examples](WORKFLOW_COORDINATION.zh-CN.md) and the [English execution protocol](../packs/engineering/repo-doctor/references/workflow-coordination.en.md).

The existing Registry remains the only workflow authority. Its conditions, prerequisites, gates and existing Skill owners are interpreted by an optional, dependency-free Node ESM module. No new Router, Skill, background orchestrator or command executor is introduced. Single-Skill requests can remain in memory without a workflow file.

The module provides `createTask`, `taskBinding`, `operationBinding`, `captureEvidence`, `evidenceValidity`, `validationPlan`, `reviewBinding`, `nextAction`, `advance`, `finishStep`, `reopen`, `reconciliationBinding`, `recoveryBinding`, `encodeTask` and `restoreTask`. The host loads and executes existing Skills with the intersection of user authorization, Skill constraints and host capabilities. Context is an untrusted portable summary, never an authorization token.

Valid evidence can be reused; changed related inputs invalidate it; unknown coverage stays unknown. File hashes include directory membership and executable bits. Environment, task intent and review basis are checked separately. A completed or interrupted write is never automatically replayed when its outcome is uncertain. Resume re-attests sources and rechecks grants; a Registry change requires explicit migration/reselection.

Registry v4 adds security, database and public-interface evidence obligations referencing existing specialist Skills. Release checks are conditional on a release candidate. Regression test authoring can be inapplicable when sufficient tests already exist; actual behavior validation remains required. No numerical file/tool/test/Token budget controls quality.

The local integration suite exercises A–G with real temporary files and focused Node commands, plus adversarial cases. Semantic specialist assessments are host fixtures: these tests do not establish real-model quality or live-client automatic orchestration. Build adapters distribute the same helper and protocol to Codex, Claude Code, Cursor and existing targets. Native cross-Skill scheduling, subagents and automatic session wakeups are not implemented or claimed.

Old/new quality and efficiency have no matched live-model measurement for this change. Do not reuse historical benchmark numbers or invent savings. The detailed comparison distinguishes implemented reuse behavior from unmeasured tool calls, repeated context and Token usage.

Run `npm run test:coordination` for the focused suite; it is also part of `npm run test:workflow`. See [local validation results](WORKFLOW_COORDINATION_VALIDATION.md) for the exact checks and limitations.

Current candidate results are tracked in [Beta validation](WORKFLOW_COORDINATION_BETA_VALIDATION.md); the earlier audit and local-validation documents remain historical.
