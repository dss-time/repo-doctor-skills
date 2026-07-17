# 输出契约

1. `test_mode`：`test_first`、`regression_after_fix` 或 `characterization`
2. `test_basis`
3. `observable_behavior`
4. `test_boundary`
5. `changed_test_files`
6. `initial_result`
7. `expected_failure_reason` 或 `not_applicable`
8. `sensitivity_evidence`
9. `sensitivity_status`：`verified`、`sensitivity_unverified` 或 `not_applicable`
10. `production_change_required`
11. `verification_commands`
12. `regression_result`
13. `limitations`
14. `next_recommended_skill`

只有 `test_first` 要求观察到预期失败。没有命令或证据时不得声称结果。
