# Examples

User: "The save request returns 500 only for empty optional tags. Reproduce it and find the root cause, but do not fix it."

Expected: capture conditions, start at the first trustworthy failure, trace the causal chain, test alternatives, and report confidence plus a repair direction.

High-confidence output also requires a repeatable feedback mechanism and a falsification method for each hypothesis. Without one, keep the cause inferred or unverified.

Non-trigger: "Review this PR for bugs." Use `safe-code-review`.
