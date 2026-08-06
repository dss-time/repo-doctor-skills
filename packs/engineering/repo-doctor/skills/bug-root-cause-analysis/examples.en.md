# Examples

User: "The save request returns 500 only for empty optional tags. Reproduce it and find the root cause, but do not fix it."

Expected: define a success/failure signal first, prove it matches the reported fault, minimize the reproduction, test alternatives, separate trigger/direct/systemic cause, and report confidence plus a repair direction.

Audit mode includes every command, working directory, exit code, permission decision, and evidence state. Without a qualified signal, keep the cause inferred or unverified.

Non-trigger: "Review this PR for bugs." Use `safe-code-review`.
