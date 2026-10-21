# Repo Doctor Router

The best route is the smallest verified next capability that matches the current artifact and permission state.

Default to one `fast` recommendation; expand to `standard` or `audit` only for requested routing detail. Fields belong to the output contract.

Use [execution modes](../../references/execution-modes.en.md) when detailed mode selection is needed.

## Boundary

- Stay read-only. Do not edit files, run commands, access the network, or perform release actions.
- Read `../../workflows.yaml` relative to this Skill document. In a distribution this is a bundled read-only projection of the unique canonical registry; no source-repository checkout is required. Do not invent or silently extend workflows.
- Do not claim the host recursively invokes Skills. A recommendation is guidance for the user or a later turn.
- Codex and the supported build targets have no repository-verified cross-platform Skill alias field. Do not emit alias frontmatter, duplicate a Skill, or claim `$doctor` exists. Use the stable canonical Skill name.
- Do not route ordinary factual questions with no repository workflow decision.
- Recommend only active verified Skill IDs. Mark unavailable inventory or registry evidence `unverified` and provide a bounded natural-language fallback.
- Never collapse clarification, specification, planning, permission gates, implementation, verification, and release.

## Routing Workflow

1. Identify the current artifact and state: vague request, clarified decisions, settled specification, work items, impact evidence, plan, diff, failure evidence, candidate release, or session state.
2. Classify outcome, evidence maturity, material decisions, permission request, risk, and whether one next Skill or an end-to-end workflow is needed.
3. Verify the selected Skill from available inventory; load registry version, stages, gates and stop conditions only for a requested full workflow.
4. Apply these ownership boundaries:
   - Material product, compatibility, security, data, or rollout decisions remain open -> `requirements-clarification`.
   - Material decisions are closed and testable specification is missing -> `requirements-to-spec`.
   - A settled large specification needs vertical delivery slices -> `spec-to-work-items`.
   - Impact is unknown -> `change-impact-analysis`; impact is known and atomic implementation steps are needed -> `safe-change-plan`.
   - A direct code-change request with a material unresolved permission, behavior, compatibility, or destructive choice -> clarify first.
   - A clear, scoped direct code-change request with explicit write authority -> recommend the matching registered workflow gate and implementation owner below; never treat clarity as permission.
   - Settled new-feature specification/work items with write authority -> `feature-implementation`; a diagnosed local defect remains `safe-fix-implementation`.
   - Testing intent -> `test-gap-analysis` for analysis, or `safe-test-implementation` with explicit `test_first`, `regression_after_fix`, or `characterization` mode for authorized test edits.
   - A single design, interaction, state, or business-logic question that needs runnable evidence -> `decision-prototype`; production implementation is a separate later step.
   - Broad diff review -> `safe-code-review`; pre-change blast-radius analysis -> `change-impact-analysis`.
   - CI-specific failure -> `ci-failure-diagnosis`; complex non-CI runtime failure -> `bug-root-cause-analysis`.
   - Evidence-backed architecture friction and migration options -> `architecture-deepening-analysis`; a request to directly perform a large refactor requires clarification, impact analysis, planning, and explicit write authorization instead.
   - Documentation drift -> `documentation-sync`; candidate release -> `release-readiness-check`; long-session transfer -> `session-handoff`.
   - Other onboarding, health, or specialist review -> the narrowest active owner represented by the registry or active inventory.
5. If a registered workflow fits, return its exact `workflow_id` and ordered applicable stages. Preserve approval gates, forbidden transitions, alternatives, and stop conditions. Do not create a bespoke duplicate.
6. If no workflow fits, recommend one verified Skill and say why registry routing is not applicable.
7. Choose the output mode: prefer `fast` for routing and bounded requests, `standard` for a complete workflow handoff, and `audit` when the user needs evidence and permission ledgers.
8. Return the recommendation using the output contract. Invocation syntax is an adapter example, not canonical workflow data.

## Completion

Return one verified recommendation and never execute it. If inventory or registry evidence is unavailable, mark the route `Unverified` and provide a bounded natural-language fallback.
