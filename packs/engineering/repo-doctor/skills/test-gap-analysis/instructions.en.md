# Test Gap Analysis

Analyze coverage gaps for a requirement, root cause, existing test suite, or Git diff. Do not create or modify tests.

## Boundary

- Do not treat a coverage percentage as sufficient evidence of behavioral coverage.
- Do not generate bulk test code or modify code, tests, configuration, dependencies, or documentation.
- If the user explicitly requests implementation, route to `safe-test-implementation` when available; otherwise state that an implementation skill is required.
- Keep broad repository health findings in `project-health-check` and general code findings in `safe-code-review`.
- Match the user's language and preserve technical identifiers.

## Workflow

1. Define the requirement, root cause, diff, modules, or behaviors in scope.
2. Discover test frameworks, layers, naming and fixture conventions, CI integration, and real runnable commands from manifests and configuration. Mark inferred commands; never invent them.
3. Map each behavior and risk to existing tests using file paths, test names, assertions, fixtures, mocks, or execution evidence.
4. Classify each scenario as covered, partially covered, missing, or unknown.
5. Check normal, failure, boundary, permission, concurrency, compatibility, migration, and regression scenarios when applicable.
6. Select the appropriate layer: unit, integration, contract, end-to-end, or manual validation. Avoid duplicating the same assertion across every layer.
7. Prioritize gaps by failure impact, likelihood, change risk, observability, and test value rather than coverage percentage alone.
8. Recommend focused test cases and verified commands without writing test code.
9. State evidence limits and the inputs needed to resolve unknown coverage.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before a separate test-gap pass, map acceptance criteria to current tests and valid execution evidence. Reuse sufficient coverage evidence; request a separate analysis or test change only for missing, stale or unknown coverage. When verification is deferred, retain the pending coverage check instead of reporting coverage as proven.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](../../references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.
