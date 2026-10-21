# Safe Test Implementation

Complete one behavior slice with evidence appropriate to its test mode; organize only after green.

Output mode and test_mode are independent. Never switch either silently.

Default output is `fast`; use `standard` or `audit` for detailed evidence, following the output contract.

## Permission and command boundary

- Cleanup is allowed only for disposable artifacts created by this run in an isolated temporary directory, with ownership and resolved paths verified and no symlink escape. Preserve pre-existing files, user data and unknown paths; otherwise block cleanup. This exception does not authorize general deletion.

- Require explicit write authorization before changing tests, fixtures, snapshots, or helpers. Modify only the authorized test-side scope.
- Production code is outside this Skill. When green requires production changes, hand the smallest behavior slice to `feature-implementation` for settled feature delivery or `safe-fix-implementation` for a local repair; resume verification after the authorized production work completes. Existing end-to-end authorization need not be requested again.
- Do not perform general fixes, production refactors, dependency changes, broad cleanup, or permission expansion.
- Read the repository's command definitions and transitive scripts before execution. Block install, migration, deployment, publication, unsafe deletion, production access, credential use, service control, or any uncertain side effect.
- Record every command, working directory, exit code, concise result, and `Observed`, `Unverified`, or `Blocked` evidence state. Never invent a command, result, or red state.
- Do not expose private production APIs for tests, bind assertions to private implementation, or use a fragile snapshot instead of observable behavior.
- Do not install a test framework without explicit authorization.

## Select One Mode

Read `../../references/testing-contract.en.md` for mode selection, evidence and public-behavior rules. Only `test_first` requires an observed expected failure before implementation. If ambiguity changes evidence or authorization, stop; otherwise choose the narrowest mode and state the inference.

## Behavior-driven red–green–organize cycle

1. Define the single behavior to protect in project domain language and cite its requirement, gap, root cause, verified fix, or observed legacy behavior.
2. Confirm the public test boundary: the caller-visible interface, state transition, output, error, or side effect where the behavior is observable. Do not test private methods or internal call order.
3. Inspect the existing test location, framework, fixtures, helpers, setup, CI conventions, and exact focused and regression commands.
4. Run command preflight, confirm test-side write authorization, and declare `test_mode`, output mode, mock rationale if any, and the production-code stop boundary.
5. Add one minimum credible test that can reliably fail for the target behavior. Do not draft all future tests as a horizontal slice.
6. Establish and record the evidence required by the selected mode in the shared test contract; an executed command with an unrelated failure never proves the target behavior.
7. Implement only the smallest test-side change. If behavior requires production code, stop test-side work after the evidence required by the selected mode and hand off to the production owner selected above; production writes must be covered by user authorization.
8. Verify green by rerunning the same focused command after the authorized implementation state exists. Process no second behavior until this slice is resolved.
9. Only after all focused checks are green, organize test code without changing behavior. Remove duplication only when it improves the current test; do not refactor production code.
10. Run the smallest evidence-backed regression scope, then report commands, files, evidence states, limitations, and the next Skill.

## Test quality and stop conditions

- Prefer externally observable behavior and domain-language test names.
- Do not write low-value coverage assertions. A mock requires a stated system-boundary reason; prefer real local substitutes when practical.
- In a project without tests, first identify the smallest safe seam and existing runnable toolchain. Do not install a framework or expose a private API.
- Return `Blocked` for missing write authorization, unsafe/unknown commands, unavailable tooling, production-only changes, or a red signal unrelated to the target behavior.
- Use `not_run`, `unexpected_failure`, `flaky`, or `sensitivity_unverified` rather than turning missing evidence into a pass.

Complete work already authorized within this Skill without asking again. In an authorized end-to-end workflow, hand other responsibilities to the appropriate Skill; this Skill's own permissions do not expand.
