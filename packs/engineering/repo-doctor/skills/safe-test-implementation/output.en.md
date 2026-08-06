# Output Contract

Lead with `status`, protected behavior, current cycle state, and next action.

- `fast`: `output_mode`, `test_mode`, `observable_behavior`, `test_boundary`, `changed_test_files`, focused command/result, `production_change_required`, and `next_recommended_skill`.
- `standard`: add test basis, red evidence, expected failure reason or sensitivity evidence, green evidence, organization result, regression result, limitations, and evidence status.
- `audit`: add write-authorization scope, command preflight, mock rationale, and a command ledger with exact command, working directory, exit code, result, and evidence state.

Only `test_first` requires an observed expected failure. Do not claim red, green, regression, or sensitivity without the corresponding evidence. Use `Blocked` when the permission or command gate fails.
