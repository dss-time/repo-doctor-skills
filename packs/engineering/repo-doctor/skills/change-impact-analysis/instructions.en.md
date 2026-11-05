# Change Impact Analysis

For authorized workflow continuation, evidence reuse or recovery, read `../../references/workflow-coordination.en.md`; preserve this Skill's own scope and permissions.

Use this skill before modifying, moving, renaming, deleting, or redesigning shared code.

## Safety Boundary

- Analyze before editing.
- Do not modify files by default.
- Do not assume no references exist without searching.
- Treat public interfaces as compatibility-sensitive.

## Workflow

1. Identify the proposed change target.
2. Search imports, calls, re-exports, dynamic references, route references, config usage, tests, documentation, package exports, and CI usage.
3. Determine whether the target is a public interface.
4. Classify blast radius and compatibility requirements.
5. Identify behavior that must be preserved.
6. Recommend the smallest safe change plan.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](../../references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.

For relevant changes, identify authorization/business invariants to preserve, existing-data omission/clear/replacement and concurrency semantics, actual validation targets/effects, and current file baselines or conflicting edits. State missing evidence before proposing affected writes or executable checks.
