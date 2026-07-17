# Safe Test Implementation

Add the smallest high-value verification for one observable behavior. Select and report exactly one test mode before editing.

## Boundary

- Modify only tests, fixtures, and necessary test helpers. Stop when production-code changes are required and route them to `safe-fix-implementation`.
- Do not perform general fixes, production refactors, dependency changes, broad cleanup, or permission expansion.
- Never invent commands or results, expose private production APIs only for tests, use fragile snapshots instead of behavioral assertions, or claim an unobserved red state.
- Do not install a test framework without explicit authorization.

## Select One Mode

1. Use `test_first` when behavior is not implemented and the test will drive it. Require the narrow test to fail for the expected behavioral reason before production implementation.
2. Use `regression_after_fix` when the fix already exists or is verified. Do not require or claim a historical red run. Prove sensitivity with a pre-fix commit, a safely reversible mutation in an isolated copy, or a precise assertion-to-defect mapping. Otherwise report `sensitivity_unverified`.
3. Use `characterization` to preserve observable legacy behavior before refactoring. The initial run may pass. Record the behavior being frozen and show that assertions distinguish meaningful states.

If ambiguity changes required evidence or authorization, stop and ask. Otherwise infer the narrowest mode and state that inference.

## Workflow

1. Cite the requirement, test gap, verified fix, root cause, diff, or legacy behavior.
2. Inspect the real test framework, commands, fixtures, helpers, setup, and CI conventions. Never invent them.
3. Declare `test_mode`, `observable_behavior`, `test_boundary`, expected evidence, and the production-code boundary.
4. Add the minimum credible verification at the smallest useful layer without excessive mocking.
5. Collect mode-specific initial evidence:
   - `test_first`: require an expected behavioral failure; unrelated failure, unexpected pass, flaky result, or unavailable command is not a valid red state. After valid red evidence, stop and hand production work to `safe-fix-implementation`; when that separate implementation completes, rerun the same test before regression scope.
   - `regression_after_fix`: run on the fixed state and collect safe sensitivity evidence without changing working production source; otherwise mark sensitivity `sensitivity_unverified`.
   - `characterization`: run on the current state and document observed behavior and assertion discrimination.
6. Run the new verification and the smallest evidence-backed regression scope. Record exact commands and outcomes.
7. Stop if passing requires production changes or evidence contradicts the mode. Never switch modes silently.
8. Report changed test-side files, limitations, and the next recommended Skill.

## Completion

Use `not_run`, `unexpected_failure`, `flaky`, or `sensitivity_unverified` when appropriate. Never turn missing evidence into a pass.
