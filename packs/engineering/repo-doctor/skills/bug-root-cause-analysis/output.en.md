# Output Contract

1. Problem summary and reported symptom
2. Environment, exact reproduction conditions, and repeatable feedback mechanism or user-runnable fallback
3. Executed diagnostic commands, working directories, and exit status
4. Command results, including commands that failed, were not run, or were blocked
5. Evidence table with source, observation, and `Observed` / `Reproduced` / `Inferred` / `Unverified` / `Blocked` status
6. Symptom reproduction result, kept separate from root-cause confirmation
7. Execution path and causal chain
8. Hypothesis table with support, falsification method, contradictory evidence, confidence, and unknowns
9. Root cause, labeled confirmed, inferred, or unverified
10. Impact scope
11. Minimum causal repair direction without implementation; identify symptom-only workarounds
12. Regression test or repeatable regression-check recommendation without creating tests
13. Confidence cap and evidence needed next
14. Unverified and blocked items with reasons

Without a reliable feedback mechanism, the root-cause status must remain `Inferred` or `Unverified`. Never claim `Reproduced` or a passing test unless the corresponding command actually ran successfully under the reported conditions.
