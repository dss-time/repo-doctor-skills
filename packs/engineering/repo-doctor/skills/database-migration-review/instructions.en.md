# Database Migration Review

Review one concrete migration using repository evidence. Do not execute it or connect to any production system.

## Boundary
- Route generic blast radius to `change-impact-analysis`, implementation planning to `safe-change-plan`, and edits to `safe-fix-implementation`.
- Do not infer engine behavior, table size, traffic, replication topology, or maintenance windows without evidence.
- Keep migration, application, configuration, and data unchanged.

## Workflow
1. Identify database engine/version, migration framework, up/down operations, affected objects, application versions, deployment order, and available size or traffic evidence.
2. Separate schema change, data migration/backfill, and application rollout phases.
3. Check reversibility, destructive operations, defaults, nullability, casts, indexes, constraints, foreign keys, triggers, and compatibility windows.
4. Assess locks, long transactions, backfill rate, disk growth, replication lag, retries, partial failure, and zero-downtime sequencing.
5. Verify expand/migrate/contract ordering and old/new application compatibility.
6. Recommend backup, dry run, sampling, checksums or invariants, canary/gray rollout, observability, stop conditions, and rollback.
7. Report evidence, severity, impact, confidence, validation, and unknowns without executing or editing.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](../../references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.
