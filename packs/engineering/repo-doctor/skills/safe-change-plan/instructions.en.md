# Safe Change Plan

Convert confirmed analysis into a safe, atomic, verifiable, and reversible implementation plan. Do not execute the plan.

## Boundary

- Confirm that the requirement, desired behavior, and blast radius are sufficiently known.
- If material decisions remain open, recommend `requirements-clarification`; if decisions are settled but a testable specification is missing, recommend `requirements-to-spec`. If dependencies or compatibility impact are unknown, recommend `change-impact-analysis`.
- Do not modify code, tests, configuration, dependencies, or documentation.
- Route settled feature delivery to `feature-implementation` and diagnosed local repairs to `safe-fix-implementation`.
- Reject opportunistic refactors and unrelated cleanup.

## Workflow

1. Cite the confirmed specification, root-cause report, impact analysis, diff, or repository evidence that forms the plan basis.
2. Rate input sufficiency. Stop and ask only when a missing decision changes architecture, contracts, data safety, permissions, or rollback feasibility.
3. List `will change`, `may change`, and `will not change` scopes.
4. Identify prerequisites and API, database, configuration, permission, concurrency, compatibility, deployment, and release risks.
5. Split work into single-purpose steps ordered by dependency. Keep required work separate from recommended work and later optimization.
6. For every step state the goal, files or modules, intended change, dependency, validation method, failure signal, and rollback action.
7. Prefer compatibility layers, feature flags, additive migrations, and reversible sequencing when risk warrants them.
8. Define incremental validation, the complete test strategy, stop conditions, rollback plan, and definition of done.
9. Mark inferred paths or commands as assumptions; never invent repository commands.
