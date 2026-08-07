# Safe Test Implementation

One behavior slice earns one trustworthy red signal, one green result, and only then any organization.

## Output modes

- `fast` (default): status, protected behavior, test mode, changed test files, focused command, result, and next step.
- `standard`: full behavior-cycle record and bounded regression result.
- `audit`: `standard` plus permission decisions, command preflight, exact working directories, exit codes, evidence status, mock rationale, and skipped/blocked checks.

Output mode is independent from `test_mode`. Never switch either silently.

## Permission and command boundary

- Require explicit write authorization before changing tests, fixtures, snapshots, or helpers. Modify only the authorized test-side scope.
- Production code is outside this Skill. When green requires production changes, stop and route the smallest behavior slice to `safe-fix-implementation`; resume verification only after that separately authorized work completes.
- Do not perform general fixes, production refactors, dependency changes, broad cleanup, or permission expansion.
- Read the repository's command definitions and transitive scripts before execution. Block install, migration, deployment, publication, deletion, production access, credential use, service control, or any uncertain side effect.
- Record every command, working directory, exit code, concise result, and `Observed`, `Unverified`, or `Blocked` evidence state. Never invent a command, result, or red state.
- Do not expose private production APIs for tests, bind assertions to private implementation, or use a fragile snapshot instead of observable behavior.
- Do not install a test framework without explicit authorization.

## Select One Mode

1. Use `test_first` when behavior is not implemented and the test will drive it. Require the narrow test to fail for the expected behavioral reason before production implementation.
2. Use `regression_after_fix` when the fix already exists or is verified. Do not require or claim a historical red run. Prove sensitivity with a pre-fix commit, a safely reversible mutation in an isolated copy, or a precise assertion-to-defect mapping. Otherwise report `sensitivity_unverified`.
3. Use `characterization` to preserve observable legacy behavior before refactoring. The initial run may pass. Record the behavior being frozen and show that assertions distinguish meaningful states.

If ambiguity changes evidence or authorization, stop. Otherwise infer the narrowest mode and report the inference.

## Behavior-driven red–green–organize cycle

1. Define the single behavior to protect in project domain language and cite its requirement, gap, root cause, verified fix, or observed legacy behavior.
2. Confirm the public test boundary: the caller-visible interface, state transition, output, error, or side effect where the behavior is observable. Do not test private methods or internal call order.
3. Inspect the existing test location, framework, fixtures, helpers, setup, CI conventions, and exact focused and regression commands.
4. Run command preflight, confirm test-side write authorization, and declare `test_mode`, output mode, mock rationale if any, and the production-code stop boundary.
5. Add one minimum credible test that can reliably fail for the target behavior. Do not draft all future tests as a horizontal slice.
6. Establish red evidence:
   - `test_first`: run the focused test and require failure for the expected missing behavior. An unrelated failure, unexpected pass, flaky result, or unavailable command is not red.
   - `regression_after_fix`: do not manufacture historical red. Use a safe pre-fix comparison or precise assertion-to-defect mapping; otherwise record `sensitivity_unverified`.
   - `characterization`: the initial test may pass; prove the assertion distinguishes meaningful observable states.
7. Implement only the smallest test-side change. If behavior requires production code, stop after valid red and hand off to `safe-fix-implementation`; production edits require separate authorization.
8. Verify green by rerunning the same focused command after the authorized implementation state exists. Process no second behavior until this slice is resolved.
9. Only after all focused checks are green, organize test code without changing behavior. Remove duplication only when it improves the current test; do not refactor production code.
10. Run the smallest evidence-backed regression scope, then report commands, files, evidence states, limitations, and the next Skill.

## Test quality and stop conditions

- Prefer externally observable behavior and domain-language test names.
- Do not write low-value coverage assertions. A mock requires a stated system-boundary reason; prefer real local substitutes when practical.
- In a project without tests, first identify the smallest safe seam and existing runnable toolchain. Do not install a framework or expose a private API.
- Return `Blocked` for missing write authorization, unsafe/unknown commands, unavailable tooling, production-only changes, or a red signal unrelated to the target behavior.
- Use `not_run`, `unexpected_failure`, `flaky`, or `sensitivity_unverified` rather than turning missing evidence into a pass.
