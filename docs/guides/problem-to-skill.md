# Problem → Skill

Use one Skill directly when the problem is clear. The Router is only the fallback for uncertainty.

## Bug

- **Problem:** A runtime failure, incorrect behavior, timeout, or intermittent 500 needs a verified cause.
- **Skill:** `$bug-root-cause-analysis`
- **Why:** Reproduces and traces a non-CI failure before proposing a fix.
- **Shortest example:** `$bug-root-cause-analysis — This API sometimes returns 500. Find the root cause; do not edit files.`

## Change code

- **Problem:** One confirmed, scoped production-code issue is ready to fix.
- **Skill:** `$safe-fix-implementation`
- **Why:** Makes the smallest authorized change and runs proportional validation.
- **Shortest example:** `$safe-fix-implementation — Fix the confirmed null check in src/parser.ts; writes to that file are authorized.`

## Review code

- **Problem:** A diff or focused code area needs review without modification.
- **Skill:** `$safe-code-review`
- **Why:** Reports evidence-backed defects and risks while staying read-only.
- **Shortest example:** `$safe-code-review — Review the current diff only; do not fix it.`

## Requirements are unclear

- **Problem:** Material product, compatibility, security, data, or rollout choices remain open.
- **Skill:** `$requirements-clarification`
- **Why:** Asks only the questions that materially change the work.
- **Shortest example:** `$requirements-clarification — Clarify the decisions needed before we change the sign-in flow.`

## Turn requirements into a specification

- **Problem:** Decisions are settled, but a testable implementation specification is missing.
- **Skill:** `$requirements-to-spec`
- **Why:** Converts confirmed requirements into a bounded, verifiable specification.
- **Shortest example:** `$requirements-to-spec — Turn these settled requirements into acceptance criteria and constraints.`

## Validate an approach

- **Problem:** One design, interaction, state, or business-logic choice needs runnable evidence.
- **Skill:** `$decision-prototype`
- **Why:** Builds disposable evidence for the decision, not production implementation.
- **Shortest example:** `$decision-prototype — Compare these two retry strategies with a throwaway prototype.`

## The architecture keeps getting harder to change

- **Problem:** Repeated caller burden, coupling, or duplicated adaptation needs evidence-backed options.
- **Skill:** `$architecture-deepening-analysis`
- **Why:** Analyzes friction, options, and migration risk without performing a refactor.
- **Shortest example:** `$architecture-deepening-analysis — Analyze why adding a provider touches five modules; do not refactor.`

## Prepare a release

- **Problem:** A specific candidate version needs an evidence-backed release gate.
- **Skill:** `$release-readiness-check`
- **Why:** Returns a GO, conditional GO, or NO-GO decision; it does not publish.
- **Shortest example:** `$release-readiness-check — Check whether v1.4.0 at this commit is ready to release.`

## Not sure which one

- **Problem:** The next Skill or mode is unclear.
- **Skill:** `$repo-doctor-router`
- **Why:** Recommends one active Skill and `fast`, `standard`, or `audit` without executing it.
- **Shortest example:** `$repo-doctor-router — This API sometimes returns 500; should I investigate or edit first?`
