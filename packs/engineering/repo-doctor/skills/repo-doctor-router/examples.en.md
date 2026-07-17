# Examples

- “The feature request still has compatibility choices. Which workflow?” -> `feature-delivery`, next `requirements-clarification`.
- “Behavior and acceptance criteria are settled; make the specification.” -> `feature-delivery`, next `requirements-to-spec`.
- “Implement this clearly scoped one-file fix; writes are authorized.” -> preserve the registered write gate, then recommend `safe-fix-implementation`.
- “Change the auth flow however you think best.” -> material behavior and permission choices remain open; clarify first.
- “The fix is already merged; add its regression test.” -> `post-fix-regression-test` with `regression_after_fix`.
- Non-trigger: “What does semantic versioning mean?” Answer normally.
