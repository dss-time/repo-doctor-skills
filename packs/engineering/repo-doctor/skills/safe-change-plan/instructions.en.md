# Safe Change Plan

Convert confirmed scope into a dependency-ordered, verifiable, reversible plan, selecting delivery work items or code-level steps as needed.

## Planning granularity

- `atomic-steps`: plan single-purpose code steps for a diagnosed repair or a defined change.
- `work-items`: plan vertical slices for multiple deliverable behaviors. Each item spans necessary technical layers and delivers an independently observable, verifiable result.
- Declare `granularity`, following the user's request first and otherwise selecting by scope. Do not turn one small repair into a large work-item table.
- When a complete plan is requested, nest necessary atomic steps inside each work item and share scope, dependency, verification, and rollback records instead of producing a second duplicate plan.

## Scope and permission boundary

- Require a confirmed specification, root-cause report, impact analysis, or sufficiently settled conversation. Route open decisions or missing testable requirements to `requirements-clarification`, and unknown dependency or compatibility impact to `change-impact-analysis`.
- Atomic steps require sufficiently known impact. Work items may mark concrete file locations unknown. Resolve unknowns that could change delivery scope, dependencies, or safety first.
- Return copyable Markdown only in the response, even when the user asks for authorized persistence. Never write local files, invoke Shell, or create external issues or tasks. Never use Shell to write indirectly.
- Do not modify code, tests, configuration, dependencies, or documentation, and do not execute any planned step.
- Route architecture rationale or decision records to `architecture-decision-record`, settled features to `feature-implementation`, and diagnosed local repairs to `safe-fix-implementation`.
- Reject unrelated refactors, cleanup, and speculative features.

## Workflow

1. Cite confirmed specification, root cause, impact analysis, diff, or repository evidence and identify desired behavior, acceptance criteria, and exclusions.
2. Check input sufficiency. Block affected planning only when a missing choice changes architecture, contracts, data safety, permissions, delivery dependencies, or rollback feasibility.
3. Identify required changes, conditional changes, and excluded scope, plus API, database, configuration, permission, concurrency, compatibility, deployment, and release risks.
4. Select granularity and split single-purpose steps or deliverable behaviors in dependency order. Label required work, recommendations, and later optimization.
5. For each step or item, record goal, affected areas, dependencies, acceptance or verification, failure signals, risks, and rollback. Mark inferred paths and commands as assumptions and never invent repository commands.
6. For work items, also map dependencies, parallel groups, shared state, and conflict areas. Declare parallelism only when dependencies, shared files, and integration order permit it.
7. Keep tests, documentation, compatibility controls, and migration within the behavior slice they support. Do not defer all testing until the end. Reserve integration checkpoints for genuinely cross-slice verification.
8. Use compatibility layers, feature flags, additive migration, and reversible sequencing where risks warrant them. Define stop conditions and completion criteria.
9. Verify that each item is independently testable, dependencies are acyclic, parallelism has evidence, and conflicts are visible, then provide a bounded implementation handoff.

## Rejection and stop conditions

Reject mechanical database/backend/frontend/test-layer splits, acceptance criteria of only “development complete,” unverifiable work items, missing dependencies, shared core files without coordination, all testing deferred to the end, or unrelated goals mixed into one item.
When inputs are insufficient, report missing evidence. Block affected steps while safety or compatibility decisions remain open. Complete the plan when scope, dependencies, acceptance, verification, risks, rollback, and completion criteria are present, without implementing it.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Explicit user-directed deferred verification is an exception to the per-slice test schedule and test-first execution timing above. Apply the execution-boundary deferral protocol, record changes as implemented with verification deferred, and do not claim verified completion.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](../../references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.
