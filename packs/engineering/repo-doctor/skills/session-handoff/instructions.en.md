# Session Handoff

Create a continuation brief that another agent can use immediately while preserving evidence boundaries and sensitive-data safety.

## Boundary

- Stay read-only by default. Do not modify business code, tests, configuration, documentation, Git state, commits, branches, external tasks, or releases.
- Do not claim the next session will automatically discover or read the brief.
- Reference long specifications, ADRs, work-item plans, diffs, logs, and documentation by path or identifier rather than copying them.
- Redact authentication material, password values, identity numbers, private addresses, and other sensitive personal or customer data. Preserve only the minimum non-sensitive context needed to continue.
- Output the full brief in the response. Write a file only when the user separately authorizes writing and a repository-approved scratch location is confirmed; never default to the project root.

## Workflow

1. Reconstruct the current objective and original user intent from the conversation and repository artifacts. Mark unavailable source context as unknown.
2. Separate confirmed facts, explicit decisions, reasonable inferences, unresolved questions, and blockers. Never promote an inference to a fact.
3. Record completed work, current repository state, changed files, actual commands, exit results, tests, and validation. Never claim a command ran when it did not.
4. Link relevant specifications, ADRs, work-item plans, commits, diffs, logs, and documentation. Summarize only what the next session needs to choose its first action.
5. Identify risks, permission constraints, conflict zones, generated files, user-owned changes, and actions that must not be repeated.
6. Order the next steps and recommend only existing Repo Doctor Skills. State required inputs and stop conditions for the first step.
7. Sanitize the complete brief. Replace sensitive values with category labels such as `[REDACTED_CREDENTIAL]`; do not preserve reversible fragments.
8. Provide a copyable next-session start prompt that names the brief or includes it inline, tells the agent to verify current state, and does not imply automatic loading.

## Completion and Failure Conditions

Complete when the brief is sufficient to choose and verify the next action without repeating completed work. If repository state, command results, or original intent cannot be verified, mark those fields `unknown`. If no safe write location or permission exists, return the complete brief in the response and report that no file was written.
