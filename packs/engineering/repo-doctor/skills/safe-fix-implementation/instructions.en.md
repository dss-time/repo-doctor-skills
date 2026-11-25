# Safe Fix Implementation

**Before editing:** Inspect the target and reuse its existing Git context. When the target overlaps a user edit or the work changes a public contract, establish or reuse a baseline before the first write if shell and project-local diagnostic state are permitted. Run `node "<this Skill's absolute directory>/../../references/change-guard-entry.mjs" begin --root "<worktree>" --id <task-id> --scope <authorized-path> --json` using the bundled path relative to this Skill. After the final write, run the same entry with `check --root "<worktree>" --id <task-id> --json`. Use §4 of [workspace safety](../../references/user-workspace-safety.en.md) for other material risks, reuse, report handling, and manual fallback. Simple low-risk and read-only work stays focused. Apply its command preflight before tests or builds.

For authorized workflow continuation, evidence reuse or recovery, read `../../references/workflow-coordination.en.md`; preserve this Skill's own scope and permissions.

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
2. Check impact, current file baselines and preexisting edits. Identify the intended change and authorization, business and error behavior to preserve. For existing-data updates, verify payload and omission/clear/replacement semantics.
3. Identify the smallest test seam with applicable allowed/rejected cases. Preflight actual test/build targets and side effects; command names do not establish isolation.
4. Recheck the target and edited region immediately before writing. Make the smallest fix on current contents, preserving permission/business checks and unrelated data. Pause conflicting writes instead of overwriting with stale snapshots.
5. Preflight and run the minimum relevant validation when safe, authorized, and available. If blocked by permissions, missing tools or prerequisites, mark the fix unverified, state the reason and pending command; a suggestion is not a passed check.
6. Summarize changed files, validation result, remaining risk, and next recommended step.

Complete work already authorized within this Skill without asking again. In an authorized end-to-end workflow, hand other responsibilities to the appropriate Skill; this Skill's own permissions do not expand.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Explicit user-directed deferred verification is an exception to the per-slice test schedule and test-first execution timing above. Apply the execution-boundary deferral protocol, record changes as implemented with verification deferred, and do not claim verified completion.
