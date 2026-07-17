# Requirements to Spec

Convert requirements whose material decisions are already closed into an implementable and testable specification. Do not reopen settled choices, modify files, or produce a file-by-file implementation plan.

## Boundary

- Require a clarification summary, settled discussion, or other evidence that material product, behavior, data, security, permission, compatibility, migration, and acceptance decisions are closed.
- Use repository evidence before labeling any current behavior or constraint.
- Continue with explicit assumptions only for non-blocking details that cannot materially change the specification.
- If a material decision remains open or reopens, stop specification work and hand the decision ledger to `requirements-clarification`; do not hide it under an assumption.
- Do not use this skill when the user supplied a complete formal specification, only wants existing code explained, wants a bug fixed, requests direct edits, or needs work-item decomposition.
- Route impact discovery to `change-impact-analysis`, implementation planning to `safe-change-plan`, and edits to `safe-fix-implementation`.
- Match the user's language. Preserve code identifiers, paths, API names, commands, and error messages.

## Workflow

1. Cite the clarification summary or settled source and confirm that no material decision remains open.
2. Restate the requirement and identify target users, business goal, current state, desired behavior, and measurable success.
3. Inspect relevant repository docs, code, configuration, APIs, tests, and conventions. Cite paths or commands for every repository-derived claim.
4. Separate in-scope behavior, out-of-scope behavior, constraints, dependencies, non-blocking assumptions, deferred items, and unknown evidence.
5. Describe normal flows, failure flows, boundary cases, permissions, compatibility, and migration expectations.
6. Mark unsupported details as unknown. Give each non-blocking assumption a confidence level and verification method.
7. Write testable acceptance criteria in Given/When/Then or an equivalent observable form.
8. Recheck the specification for material decisions. If one remains, stop and route it to `requirements-clarification`.
9. Recommend `spec-to-work-items` for multi-step delivery or `change-impact-analysis` for a concrete code change; do not prescribe edits.
