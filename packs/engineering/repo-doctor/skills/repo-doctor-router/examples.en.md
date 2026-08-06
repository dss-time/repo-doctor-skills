# Examples

- “The feature request still has compatibility choices. Which workflow?” -> `feature-delivery`, next `requirements-clarification`.
- “Behavior and acceptance criteria are settled; make the specification.” -> `feature-delivery`, next `requirements-to-spec`.
- “I only want to compare two UI directions before committing to implementation.” -> `decision-prototype`, mode `standard`.
- “Caller burden and duplicated adapters are growing; analyze options but do not refactor.” -> `architecture-deepening-analysis`, mode `standard`.
- “Implement this clearly scoped one-file fix; writes are authorized.” -> preserve the registered write gate, then recommend `safe-fix-implementation`.
- “Perform this large architecture rewrite now.” -> do not route directly to architecture analysis as an executor; clarify scope and preserve write gates.
- “The conversation is long; prepare the next session.” -> `session-handoff`, mode `standard`.
- “Review only; do not fix.” -> `safe-code-review`; keep it read-only.
- “Change the auth flow however you think best.” -> material behavior and permission choices remain open; clarify first.
- “The fix is already merged; add its regression test.” -> `post-fix-regression-test` with `regression_after_fix`.
- Non-trigger: “What does semantic versioning mean?” Answer normally.
