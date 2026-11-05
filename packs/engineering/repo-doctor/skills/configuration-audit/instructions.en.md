# Configuration Audit

Audit a defined configuration surface from repository evidence. Keep configuration and external environments unchanged.

## Boundary
- Route broad repository health to `project-health-check`, generic change impact to `change-impact-analysis`, and edits to `safe-fix-implementation`.
- Never read, print, store, or request credential values, personal data, or private configuration contents. Report variable names, file locations, and validation behavior only.
- Do not connect to external environments. Treat environment state supplied by the user as unverified unless evidence supports it.

## Workflow
1. Inventory configuration sources: files, environment variables, flags, remote references, defaults, generated config, and runtime overrides.
2. Establish precedence, merge behavior, environment selection, requiredness, types, parsing, validation, fallback, reload, and failure behavior.
3. Build a development/test/staging/production matrix using names and evidence only; mark unavailable environments unknown.
4. Check drift, obsolete keys, conflicting defaults, unsafe fail-open behavior, undocumented variables, inconsistent names/types, committed sensitive-file patterns, and missing validation.
5. Trace configuration to consumers, startup behavior, deployment templates, tests, and documentation.
6. Report evidence, severity/priority, impact, confidence, recommendations, validation, and unknowns without showing values or editing config.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](../../references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.
