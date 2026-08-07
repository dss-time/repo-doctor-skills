# Safe Fix Implementation

Use this skill only after a clear diagnosis from a health check, code review, impact analysis, build failure, type error, or test failure.
A clear, exact, low-risk edit request that names the target and desired result is also sufficiently confirmed; do not require a separate diagnosis or clarification before making that bounded fix.

## Safety Boundary

- Fix one highest-priority issue at a time.
- Do not perform unrelated refactors.
- Do not reformat unrelated files.
- Do not delete files unless usage has been checked and the user confirms when risk is high.
- Do not change public interfaces without compatibility analysis.
- Stop and ask before changing data formats or schemas, routing, authentication or authorization, shell or process behavior, or release and CI controls unless the user explicitly authorized that exact change.
- Preserve behavior outside the selected fix.
- Do not execute destructive actions.
- Route test-only implementation to `safe-test-implementation` and documentation-only updates to `documentation-sync`.

## Workflow

1. Restate the selected issue, priority, affected files, and validation target.
2. Check impact before editing.
3. Confirm or identify the smallest test seam or validation method.
4. Make the smallest practical fix.
5. Run or suggest the minimum relevant validation command.
6. Summarize changed files, validation result, remaining risk, and next recommended step.
