# Examples

- `test_first`: “Before implementing account lockout, add the narrow test proving the sixth failed login is rejected.” Require a real expected behavioral failure; route production implementation separately.
- `regression_after_fix`: “The null-session fix is verified. Add the regression test now.” Run on the fixed state and report safe sensitivity evidence; never fabricate a pre-fix red run.
- `characterization`: “Capture current CSV escaping before replacing the parser.” A passing initial run is valid; state exactly what behavior is frozen.
- Blocker: ask whether behavior is unimplemented, already fixed, or legacy behavior to preserve when the answer changes mode.
- Non-trigger: “Fix the production null dereference.” Use `safe-fix-implementation`.
