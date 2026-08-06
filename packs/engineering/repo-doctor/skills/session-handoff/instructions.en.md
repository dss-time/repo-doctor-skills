# Session Handoff

A good handoff transfers verified state and the smallest next action, not the conversation's bulk.

## Output modes

- `fast`: current goal, status, confirmed facts, blockers, critical paths, next Skill, and one copyable start instruction.
- `standard` (default): the complete continuation brief described below.
- `audit`: `standard` plus source provenance, command/exit ledger, sanitization categories, permission decisions, and evidence gaps.

Tailor every mode to a user-provided next-session goal. If none is provided, optimize for resuming the current unfinished objective.

## Boundary

- Stay read-only by default. Do not modify business code, tests, configuration, documentation, Git state, commits, branches, external tasks, or releases.
- Do not claim the next session will automatically discover or read the brief.
- Reference long specifications, ADRs, work-item plans, diffs, logs, and documentation by path or identifier rather than copying them.
- Redact authentication material, password values, identity numbers, private addresses, and other sensitive personal or customer data. Preserve only the minimum non-sensitive context needed to continue.
- Automatically remove credentials, passwords, private keys, connection strings, identifying personal values, and other sensitive values. Use non-reversible category markers such as `[REDACTED_CREDENTIAL]`.
- Save the brief to a unique file in the operating system temporary directory by default. Confirm the path is outside the project and do not overwrite an existing file. Writing inside the repository or another user directory requires explicit path-scoped authorization.
- Also summarize the saved path and key next action in the response. If no safe temporary location is writable, return the complete brief in the response and mark file creation `Blocked`.

## Workflow

1. Determine the next-session goal and current objective. Reconstruct original intent from the conversation and repository artifacts; mark unavailable source context `Unverified`.
2. Separate current status, confirmed facts, explicit decisions, unverified information, reasonable inferences, unresolved questions, risks, and blockers.
3. Record completed changes, unfinished tasks, current repository state, key files, actual commands, exit results, tests, and validation. Never claim a command ran when it did not.
4. Reference existing specifications, ADRs, issues, commits, diffs, logs, and documentation by path, identifier, commit, issue, or URL. Do not duplicate their full content.
5. Identify permission constraints, generated files, user-owned changes, conflict zones, and actions that must not be repeated.
6. Order the next steps for the stated next-session goal. Recommend the narrowest existing Repo Doctor Skill and state the minimum required input and stop condition.
7. Sanitize the entire brief before saving. Report categories removed, never original values.
8. Save to a unique OS temporary path by default, then provide that path and a minimum copyable start instruction that tells the new session to read the brief and verify current state.

## Completion and Failure Conditions

Complete when the brief is sufficient to choose and verify the next action without repeating completed work. Mark unavailable repository state, command results, or intent `Unverified`. Return `Blocked` only for required missing context, an unsafe target path, or unavailable temporary storage; never fall back to the project directory without authorization.
