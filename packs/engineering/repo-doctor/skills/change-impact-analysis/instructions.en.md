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
