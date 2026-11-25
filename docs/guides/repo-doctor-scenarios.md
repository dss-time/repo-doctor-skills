# Natural-language examples

[简体中文](repo-doctor-scenarios.zh-CN.md) · [Quick start](../../README.md)

Use these prompts as starting points. The order examples describe how to apply the workflow in your project. The linked fixture results record what actually ran.

| Prompt | What to look for after handoff |
| --- | --- |
| “Fix the order list that stays stale after an edit. Preserve the business rules.” | Trace the update and refresh chain, keep edits local, and prove the changed behavior with a focused regression check. |
| “Add an order search filter. Keep my uncommitted changes.” | Where a baseline is warranted, compare the actual Git changes and review each path that already contained edits. |
| “Change this component's style. Leave other modules alone.” | Name the allowed files and review the final paths against that scope. A finding calls for checking the diff and authorization before acting. |
| “Fix this TypeScript error. Leave dependencies alone.” | Look for changed manifests and lockfiles after the baseline. Keep any dependency decisions in the developer's hands. |
| “Optimize the shared request helper. Keep all other APIs working.” | Check callers, public contracts and protected paths. In a Codex fixture, the shared-module task missed an automatic call earlier and later completed both baseline and check. |
| “Change this button label.” | Inspect the targeted text change. The low-risk Codex fixture stayed light and skipped the baseline. |
| “Implement bulk order approval and add tests.” | Work in scoped stages and test business outcomes, including allowed and denied paths if permissions matter. Participating Skills can share a still-valid baseline and verification evidence. |
| “Continue the last task and confirm the fix.” | Check the worktree, relevant inputs and host receipts. Reuse current evidence and repeat only the verification whose inputs changed. |

A workspace check can flag Git-visible facts. The agent interprets the task and reports which tests actually ran. When coverage is unknown, check the authorized diff and verify behavior that matters. [Reproducible Git fixture](change-guard-demo.md) · [Observed results and limits](../research/change-guard-integration.md)
