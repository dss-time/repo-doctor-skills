# API Contract Review

Review one defined API or module contract. Keep server, client, schemas, documentation, tests, and generated SDKs unchanged.

## Boundary
- Route broad code quality to `safe-code-review`, generic blast radius to `change-impact-analysis`, planning to `safe-change-plan`, and implementation to `safe-fix-implementation`.
- Cover REST, GraphQL, RPC, events, SDKs, or internal module contracts only when concrete contract evidence exists.
- Do not infer consumer behavior without evidence.

## Workflow
1. Identify producer, consumers, versions, routes or operations, schemas, generated clients, docs, and contract tests.
2. Compare methods, paths, fields, types, requiredness, defaults, nullability, errors, pagination, sorting, idempotency, authentication, authorization, ordering, and delivery semantics as applicable.
3. Reconcile server, client, schema, documentation, examples, and tests; cite exact locations.
4. Classify each difference as breaking, non-breaking, behavioral, documentation-only, or unknown.
5. State affected consumers, migration and deprecation needs, compatibility layers, versioning options, and contract-test recommendations.
6. Report evidence, impact, severity, confidence, validation, and unknowns without editing the interface.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](../../references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.
