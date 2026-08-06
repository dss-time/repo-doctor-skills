# Architecture Deepening Analysis

Architecture friction is credible when callers, changes, or tests repeatedly pay for knowledge a module should contain.

## Output modes

- `fast`: top candidate, evidence, risk, recommendation, and next Skill.
- `standard` (default): all qualified candidates with two or more options, migration, testing, and rollback.
- `audit`: `standard` plus complete scope, command ledger, rejected candidates, ADR evidence, uncertainty, and option scoring rationale.

Read `references/architecture-friction-checklist.en.md` only when evaluating candidates or producing audit evidence.

## Boundary and evidence

- This Skill analyzes and plans. It never performs a broad refactor, edits files, creates an ADR, or changes tests.
- Read repository instructions, domain terminology, relevant ADRs, callers, implementations, tests, and change history available within scope.
- Shell access permits only preflighted, non-destructive read-only discovery such as search, status, diff, log, and existing analysis commands with known side effects. Never install, migrate, deploy, publish, delete, switch branches, or mutate the working tree.
- Do not infer architecture quality from file size, directory shape, naming preference, or aesthetic neatness.
- Require concrete caller, change, duplication, defect, or test evidence. Do not create an abstraction for a hypothetical future caller.
- Treat personal style as a preference, not a defect. Existing ADRs constrain options until evidence justifies reopening them.
- If the user asks to directly rewrite a large area, stop and route through `requirements-clarification`, `change-impact-analysis`, `safe-change-plan`, and an explicitly authorized implementation workflow.

## Analysis dimensions

Examine interface size and required caller knowledge; how much complexity the implementation actually hides; responsibility leakage; domain-boundary clarity; repeated adaptation; scattered change; test-seam stability; whether deleting the module removes or merely transfers complexity; unnecessary abstractions; real use-case support; and relevant ADR constraints.

## Workflow

1. Define the architecture scope, decision need, and evidence threshold. Identify the callers or change history that motivated the analysis.
2. Read the minimum repository and domain context needed to understand responsibilities and constraints.
3. Map each candidate's interface, callers, implementation responsibility, adapters, test seams, recent change paths, and ADR constraints.
4. Record observed friction with file/line or commit evidence. Reject candidates supported only by size, taste, or one hypothetical use case.
5. Test the causal explanation: determine whether the interface exports knowledge that belongs behind it, whether repeated adaptations express the same rule, and whether deleting the abstraction removes or redistributes complexity.
6. Estimate impact across callers, compatibility, data, runtime, operations, tests, and ownership.
7. Develop at least two materially different design directions, including a conservative option when plausible. For each, describe what knowledge moves, what remains public, migration cost, testing approach, rollback, and risk.
8. Recommend one direction and explain why the alternatives are not selected. Do not conceal uncertainty or ADR conflict.
9. Provide an ordered migration that preserves runnable checkpoints, a test strategy at stable observable seams, and a rollback point for each material step.
10. Decide whether an ADR is required and recommend the next Skill. Do not write the ADR or execute the migration.

## Candidate completeness and stop conditions

Each reported candidate must include observed friction, code evidence, root cause, impact scope, at least two options, recommendation, rejection reasons, migration order, test strategy, rollback strategy, risk, ADR need, and next Skill.

Return `Blocked` when scope is undefined, callers cannot be inspected, essential ADRs are unavailable, or command safety is uncertain. Return `no qualified candidates` when evidence does not support a recommendation; do not manufacture one.
