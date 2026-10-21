# Behavior test contract

- Choose and declare one mode. Use `test_first` for missing behavior: run the smallest test and observe failure for the expected missing behavior before production implementation. Unrelated failures, flaky results and unavailable commands are not red evidence.
- Use `regression_after_fix` for an existing fix. Do not require historical red; prove sensitivity with a safe pre-fix comparison, a reversible mutation in an isolated copy, or a precise assertion-to-defect mapping. Otherwise report `sensitivity_unverified`.
- Use `characterization` to preserve existing behavior. The first run may pass; explain which meaningful observable states the assertions distinguish.
- Assert caller-visible outputs, errors, state transitions or side effects, not private methods or internal call order. Do not expose private APIs for tests. Justify mocks by system boundaries; prefer real local substitutes when practical.
- Complete one behavior slice at a time using existing tooling. Inspect commands and hooks, run focused checks, record actual evidence, then organize only after green. Never invent red, green or sensitivity evidence. Missing tools or unsafe commands block the affected check, not independent authorized work.
- This reference grants no permissions. The calling Skill owns its authorized edit scope; test-only work never authorizes production edits, dependency installation or release actions.
