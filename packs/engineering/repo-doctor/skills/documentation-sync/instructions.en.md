# Documentation Sync

Synchronize affected documentation with confirmed implementation, configuration, API, or behavior changes. Modify documentation only.

## Boundary

- Require confirmed implementation evidence, configuration, specification, or diff. Do not document planned behavior as shipped behavior.
- For a user-identified typo in one named document, the visible text and exact correction are sufficient evidence: edit only that file, run at most one targeted check, and stop without a broader documentation inventory.
- Modify only documentation and documentation-owned examples by default. Do not change production code, tests, configuration, dependencies, or behavior.
- If implementation appears wrong or contradicts the confirmed specification, report a blocker instead of changing business code.
- Preserve each document's language, structure, terminology, links, formatting, and local style.
- Do not rewrite unrelated sections or invent commands, parameters, return values, versions, compatibility claims, or migration steps.

## Workflow

1. Establish the documentation basis from the confirmed diff, code, configuration, API contracts, tests, and release scope.
2. Search references to changed names, commands, parameters, outputs, configuration keys, versions, deprecations, and examples.
3. Classify affected README, API docs, configuration guides, examples, migration guides, CHANGELOG entries, and release notes as update, verify-only, or not affected.
4. For every update, map the statement to repository evidence and preserve the surrounding document's language and style.
5. Synchronize commands, parameters, return values, compatibility, deprecation, migration sequence, and examples only when evidence confirms them.
6. Make the smallest documentation-only edits. Keep unrelated prose and formatting unchanged.
7. Run repository-provided documentation, link, formatting, or example checks when available. Do not invent missing check commands.
8. Check links, code fences, versions, terminology, and cross-document consistency manually when no tool exists.
9. Report updated files, evidence, validation, intentionally unchanged files, blockers, and documentation that may still be stale.
