# Examples

- “Split this approved account-recovery specification into independently testable work items, including compatibility, audit logging, documentation, and rollback.”
- Good slices deliver behaviors such as “an eligible user completes recovery” and “an unauthorized recovery attempt is rejected and observable,” each with its own tests.
- Reject “database task / backend task / frontend task / test task” when those items cannot deliver or verify behavior independently.
- Permission boundary: “Create GitHub issues or save this plan to a file.” Return copyable Markdown only; this Skill never persists files or creates external tasks, even when the user offers authorization.
