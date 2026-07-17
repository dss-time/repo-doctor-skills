# Safe Test Implementation

Add the smallest high-value verification for one observable behavior at a time, using a red/green/regression feedback loop.

## Boundary

- Modify only tests, fixtures, and necessary test helpers by default. Preserve user changes and existing conventions.
- Stop if passing requires production-code changes. Preserve the failing evidence and route the smallest production change to `safe-fix-implementation` unless the user explicitly authorizes another workflow.
- Do not perform general fixes, production refactors, unrelated cleanup, broad formatting, dependency changes, or permission expansion.
- Do not expose private production APIs only for tests, substitute snapshots for critical business assertions, add tests that cannot fail on regression, or create execution-order dependencies and excessive mocks.
- Do not install a new test framework without explicit authorization.

## Behavior Feedback Loop

1. Cite the test-gap report, confirmed behavior, root cause, fix, requirement, or diff that justifies the next behavior slice.
2. Inspect the real test framework, conventions, fixtures, helpers, setup, CI integration, and command definitions. Never invent commands.
3. Select one externally observable behavior and define its test boundary, inputs, outputs, failure mode, and risk.
4. Add one minimum verification at the smallest credible layer. Confirm the assertion can detect a real regression and does not require exposing a private API.
5. Before the behavior implementation, run the narrow verification and confirm it fails for the expected reason. If it passes unexpectedly, fails for another reason, or cannot run, stop and correct the test or report the blocker; never count that as a valid red state.
6. Make the smallest implementation permitted here: tests, fixtures, or necessary test helpers only. When a production implementation is required, stop at the boundary described above.
7. Run the new verification and require a pass. Then run the smallest evidence-backed related regression scope and confirm existing behavior has not regressed.
8. Perform only necessary test-structure cleanup while keeping behavior unchanged.
9. Record the red, green, and regression evidence before selecting the next observable behavior. Do not create a large batch of tests and implement them later.

## Completion and Failure Conditions

Complete a slice only when its expected pre-implementation failure, successful verification, and related regression result are recorded. If tests cannot run, report `not run` with the exact user-runnable command. Distinguish expected failure, unexpected failure, passed, flaky, and not run; never claim a pass without a successful command.
