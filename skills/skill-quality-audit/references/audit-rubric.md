# Skill Quality Audit Rubric

## Severity

- **P0 — Release blocker:** a credible path to destructive behavior, credential/private-data disclosure, public/private boundary breach, invalid package that cannot be installed, or a core workflow that necessarily fabricates results. Do not use P0 for style, missing polish, or uncertain semantic overlap.
- **P1 — Material defect:** likely misrouting, missing required artifact, broken resource, permission mismatch, unverifiable core output, missing safety stop, unsupported platform claim, or publishing inconsistency that materially affects normal use.
- **P2 — Improvement:** bounded clarity, maintainability, coverage, localization, progressive-loading, documentation, or test weakness that does not invalidate the core workflow.

## Scorecard

Score each dimension as Pass, Conditional, Fail, or Not Verified. Do not invent numeric precision.

1. Structure and deterministic format
2. Trigger quality and conflict coverage
3. Workflow executability and output acceptance
4. Progressive loading and reusable resources
5. Canonical, bilingual, and cross-platform integrity
6. Safety, privacy, and release integration

## Evidence standard

Every finding must include:

- exact file or generated artifact location;
- observed evidence, not a generic checklist item;
- realistic user or release impact;
- confidence and unknowns;
- minimal repair direction;
- a reproducible validation suggestion.

If no actionable finding is supported, say so. Do not manufacture issues to populate every severity.

## Release recommendation

- **READY:** no P0/P1 finding and required checks passed.
- **READY WITH CONDITIONS:** no P0; bounded P1 or unverified checks have explicit owners/conditions.
- **NOT READY:** any unresolved P0, or P1 defects that invalidate core use, packaging, safety, or routing.
