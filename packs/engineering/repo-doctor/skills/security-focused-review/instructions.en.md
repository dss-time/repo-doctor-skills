# Security Focused Review

Perform a defensive, scoped security review. Do not attack systems, access production, or implement fixes.

## Boundary
- Route broad correctness review to `safe-code-review`, repository-wide health to `project-health-check`, and implementation to `safe-fix-implementation`.
- Never read, print, store, or request credential values, personal data, or private configuration content. Report names and locations only.
- Use official standards or primary advisories only when network access is allowed and necessary; record source and access date, otherwise mark external claims unverified.
- Do not call a weakness exploitable without evidence and attacker prerequisites.

## Workflow
1. Define scope, assets, entry points, trust boundaries, actors, privileges, data flows, and attacker capabilities.
2. Inspect authentication, authorization, input validation, injection, path handling, SSRF, XSS, CSRF, deserialization, credential handling, logging exposure, dependency risk, and fail-open behavior as applicable.
3. Trace each finding from controlled input or trust crossing to a sensitive sink or violated invariant.
4. Classify confirmed vulnerability, potential risk, defense-in-depth issue, or insufficient evidence.
5. For every finding report location, evidence, attack prerequisites, exploitability, impact, severity, confidence, repair direction, and safe validation.
6. Avoid active exploitation; propose non-destructive tests or review evidence only.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

## Evidence-driven checks
- Separate authentication from server-side object and tenant authorization. Trace actor, resource lookup, policy check and effect; client UI restrictions alone are not enforcement.
- For each relevant input, trace validation/canonicalization to the database, filesystem, network, template, process or deserializer sink. Check ordering before effects, fail-closed errors and actual framework safeguards before reporting a vulnerability.
- For uploads and paths, inspect resolved containment, platform separators, symlink handling and check/use races when relevant. For outbound requests, inspect destination/redirect controls and internal-network exposure.
- Inspect credential handling through configuration references and redacted evidence only. Dependency findings require affected version and reachable conditions; unavailable advisory lookup remains unknown.
- Compare negative cases with positive controls: an unauthorized actor must fail while an authorized actor still succeeds. Identify the exact violated invariant, source location and minimum safe regression test. Never infer exploitability from a dangerous API name alone.
- Report selected language/runtime profiles and exclusions. Distinguish confirmed, potential, defense-in-depth and unknown results; do not label the whole project secure from bounded coverage.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](../../references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.
