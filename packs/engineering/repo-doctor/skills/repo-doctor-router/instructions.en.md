# Repo Doctor Router

Classify the current engineering state and recommend the next existing Repo Doctor Skill or an ordered workflow. Recommend only; do not execute a routed Skill.

## Boundary

- Stay read-only. Do not edit files, run commands, access the network, or perform release actions.
- Do not claim that the host can invoke Skills recursively. A recommendation is guidance for the user or next agent turn.
- Do not route ordinary factual questions, explanations, or casual conversation that require no repository workflow.
- Recommend only active Skill IDs verified from the current Pack or Skill catalog. If inventory cannot be checked, mark the recommendation `unverified` and provide a natural-language next instruction instead of inventing an ID.
- Do not collapse clarification, specification, planning, implementation, verification, and release into one implicit action.

## Routing Workflow

1. Read the user's request and supplied repository context. Identify the current artifact: question, vague request, clarified decisions, specification, work-item plan, diff, failure evidence, release candidate, or session state.
2. Classify the task by state, requested outcome, evidence maturity, permissions, risk, and whether the user needs one next step or a full workflow.
3. Check the active Repo Doctor inventory before naming a Skill. Reject stale, missing, deprecated, or out-of-Pack references.
4. Select the narrowest owner from this routing map:
   - unfamiliar repository -> `repo-onboarding`;
   - decisions still materially open -> `requirements-clarification`;
   - decisions closed and an implementable specification is needed -> `requirements-to-spec`;
   - large specification needs independently verifiable slices -> `spec-to-work-items`;
   - modification scope or compatibility impact is uncertain -> `change-impact-analysis`;
   - confirmed change needs an atomic implementation plan -> `safe-change-plan`;
   - one confirmed small production fix is authorized -> `safe-fix-implementation`;
   - testing needs assessment -> `test-gap-analysis`; authorized test-only edits -> `safe-test-implementation`;
   - broad diff or PR review -> `safe-code-review`;
   - CI-specific failure -> `ci-failure-diagnosis`; complex non-CI bug -> `bug-root-cause-analysis`;
   - dependency, database, API, security, performance, configuration, or dead-code concern -> the matching specialist Skill;
   - documentation drift -> `documentation-sync`; durable architecture decision -> `architecture-decision-record`;
   - concrete candidate release -> `release-readiness-check`;
   - long session or agent transition -> `session-handoff`;
   - broad repository condition with no narrower question -> `project-health-check`.
5. Build the shortest safe workflow. Insert clarification, impact analysis, tests, review, or release gates only when the task evidence and risk require them.
6. State required inputs, permission boundaries, alternatives, and conditions that should stop or reroute the workflow.
7. Provide both forms: a Codex example such as `$requirements-clarification` and a platform-neutral instruction such as “Clarify the unresolved product and compatibility decisions before writing a specification.” If explicit invocation is unsupported, provide one copyable natural-language next prompt.

## Completion Conditions

Finish only when the classification, verified next Skill, ordered workflow, reason, inputs, safety notes, alternatives, and stop conditions are all present. If no current Skill owns the task, say so and recommend a bounded natural-language next step; never fabricate a Skill.
