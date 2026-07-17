# Repo Doctor Router

Classify the current engineering state and recommend the next existing Repo Doctor Skill or one registered workflow. Recommend only; never execute a routed Skill.

## Boundary

- Stay read-only. Do not edit files, run commands, access the network, or perform release actions.
- Use the unique canonical registry at `packs/engineering/repo-doctor/workflows.yaml` when repository access is available; packaged copies are read-only projections. Do not invent or silently extend workflows.
- Do not claim the host recursively invokes Skills. A recommendation is guidance for the user or a later turn.
- Do not route ordinary factual questions with no repository workflow decision.
- Recommend only active verified Skill IDs. Mark unavailable inventory or registry evidence `unverified` and provide a bounded natural-language fallback.
- Never collapse clarification, specification, planning, permission gates, implementation, verification, and release.

## Routing Workflow

1. Identify the current artifact and state: vague request, clarified decisions, settled specification, work items, impact evidence, plan, diff, failure evidence, candidate release, or session state.
2. Classify outcome, evidence maturity, material decisions, permission request, risk, and whether one next Skill or an end-to-end workflow is needed.
3. Verify active Repo Doctor inventory and load registry version, workflow IDs, stages, gates, alternatives, and stop conditions.
4. Apply these ownership boundaries:
   - Material product, compatibility, security, data, or rollout decisions remain open -> `requirements-clarification`.
   - Material decisions are closed and testable specification is missing -> `requirements-to-spec`.
   - A settled large specification needs vertical delivery slices -> `spec-to-work-items`.
   - Impact is unknown -> `change-impact-analysis`; impact is known and atomic implementation steps are needed -> `safe-change-plan`.
   - A direct code-change request with a material unresolved permission, behavior, compatibility, or destructive choice -> clarify first.
   - A clear, scoped direct code-change request with explicit write authority -> recommend the matching registered workflow gate and `safe-fix-implementation`; never treat clarity as permission.
   - Testing intent -> `test-gap-analysis` for analysis, or `safe-test-implementation` with explicit `test_first`, `regression_after_fix`, or `characterization` mode for authorized test edits.
   - Broad diff review -> `safe-code-review`; pre-change blast-radius analysis -> `change-impact-analysis`.
   - CI-specific failure -> `ci-failure-diagnosis`; complex non-CI runtime failure -> `bug-root-cause-analysis`.
   - Documentation drift -> `documentation-sync`; candidate release -> `release-readiness-check`; long-session transfer -> `session-handoff`.
   - Other onboarding, health, or specialist review -> the narrowest active owner represented by the registry or active inventory.
5. If a registered workflow fits, return its exact `workflow_id` and ordered applicable stages. Preserve approval gates, forbidden transitions, alternatives, and stop conditions. Do not create a bespoke duplicate.
6. If no workflow fits, recommend one verified Skill and say why registry routing is not applicable.
7. Provide Codex invocation and a platform-neutral copyable prompt; platform syntax is an example, not canonical workflow data.

## Completion

Return classification, registry verification, `workflow_id` when applicable, next Skill, applicable stages, reason, inputs, permission gates, alternatives, and stop conditions. Do not execute the recommendation.
