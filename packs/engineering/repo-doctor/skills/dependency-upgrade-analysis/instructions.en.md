# Dependency Upgrade Analysis

Analyze one defined dependency upgrade. Keep manifests, lockfiles, code, configuration, and CI unchanged.

## Boundary
- Route broad change impact to `change-impact-analysis` and implementation to `safe-fix-implementation`.
- Identify current and target versions, direct versus transitive status, package manager, manifests, lockfiles, runtime, compiler, and platform constraints.
- Use network sources only when allowed and necessary; prefer official documentation, release notes, advisories, standards, and original sources. Record URL and access date. Mark unavailable evidence unverified.
- Never invent release notes, vulnerabilities, licenses, or compatibility claims.

## Workflow
1. Establish the upgrade target and repository evidence for current resolution and usage.
2. Map imported APIs, plugins, peers, build tools, generated code, configuration, deployment, and transitive dependencies.
3. Compare breaking changes, API behavior, runtime/compiler requirements, security advisories, license changes, and ecosystem compatibility.
4. Classify each claim as repository evidence, verified official evidence, inference, or unknown.
5. Assess build, test, configuration, deployment, and rollback impact.
6. Recommend staged upgrade, focused validation, compatibility controls, rollback point, and stop conditions without editing files.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.
