# Output Contract

1. `test_mode`: `test_first`, `regression_after_fix`, or `characterization`
2. `test_basis`
3. `observable_behavior`
4. `test_boundary`
5. `changed_test_files`
6. `initial_result`
7. `expected_failure_reason` or `not_applicable`
8. `sensitivity_evidence`
9. `sensitivity_status`: `verified`, `sensitivity_unverified`, or `not_applicable`
10. `production_change_required`
11. `verification_commands`
12. `regression_result`
13. `limitations`
14. `next_recommended_skill`

Only `test_first` requires an observed expected failure. Do not claim a result without its command or evidence.
