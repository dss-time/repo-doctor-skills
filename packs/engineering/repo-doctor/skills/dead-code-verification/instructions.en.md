# Dead Code Verification

Verify one defined removal candidate. Default to “not safe to remove” when safety cannot be demonstrated.

## Boundary
- Use `change-impact-analysis` for a broader proposed deletion with known consumers; use this skill when the question is whether usage exists at all.
- Do not delete, rename, move, or rewrite code. Route confirmed removal implementation to `safe-fix-implementation`.
- Do not treat static search, coverage, or one build as proof by itself.

## Workflow
1. Define the candidate, exports, aliases, generated names, public surface, and intended removal scope.
2. Search static imports/calls/re-exports plus dynamic imports, reflection, registries, dependency injection, configuration, routes, scripts, templates, plugins, build entries, package exports, serialization, and external APIs.
3. Inspect tests, docs, examples, feature flags, release artifacts, telemetry evidence when supplied, and version-control context.
4. Classify the candidate as confirmed unused, probably unused, still used, or unproven.
5. Explain deletion impact, false-negative risks, compatibility concerns, validation tests, staged disablement, and restoration method.
6. Report evidence, severity/priority, impact, confidence, recommendation, validation, and unknowns without deletion.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.
