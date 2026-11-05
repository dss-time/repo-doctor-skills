# Documentation Sync

Synchronize affected documentation with confirmed implementation, configuration, API, or behavior changes. Modify documentation only.

## Boundary

- Require confirmed implementation evidence, configuration, specification, or diff. Do not document planned behavior as shipped behavior.
- For a user-identified typo in one named document, the visible text and exact correction are sufficient evidence: edit only that file, run at most one targeted check, and stop without a broader documentation inventory.
- Modify only documentation and documentation-owned examples by default. Do not change production code, tests, configuration, dependencies, or behavior.
- If implementation appears wrong or contradicts the confirmed specification, report a blocker instead of changing business code.
- Preserve each document's language, structure, terminology, links, formatting, and local style.
- Do not rewrite unrelated sections or invent commands, parameters, return values, versions, compatibility claims, or migration steps.
- Before any validation command, inspect its definition, package-manager lifecycle hooks and transitive scripts. Do not run commands that access the network, install dependencies, change files outside the authorized documentation scope, migrate data, deploy, publish, access production, perform unsafe deletion, or have unknown side effects. Mark the affected check `Blocked`, explain why, and continue independent authorized work. A command's name does not establish safety.

## Workflow

1. Establish the documentation basis from the confirmed diff, code, configuration, API contracts, tests, and release scope.
2. Search references to changed names, commands, parameters, outputs, configuration keys, versions, deprecations, and examples.
3. Classify affected README, API docs, configuration guides, examples, migration guides, CHANGELOG entries, and release notes as update, verify-only, or not affected.
4. For every update, map the statement to repository evidence and preserve the surrounding document's language and style.
5. Synchronize commands, parameters, return values, compatibility, deprecation, migration sequence, and examples only when evidence confirms them.
6. Make the smallest documentation-only edits. Keep unrelated prose and formatting unchanged.
7. Run available repository-provided documentation, link, formatting, or example checks only after the command preflight above and within user authorization. Prefer read-only checks; write-mode formatters require authorization for every affected path. Do not invent missing commands or report blocked/unrun checks as passed.
8. Check links, code fences, versions, terminology, and cross-document consistency manually when no tool exists.
9. Report updated files, evidence, validation, intentionally unchanged files, blockers, and documentation that may still be stale.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](../../references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.
