# 输出契约

先给 `status`、受保护行为、当前循环状态和下一动作。

- `fast`：`output_mode`、`test_mode`、`observable_behavior`、`test_boundary`、`changed_test_files`、定向命令/结果、`production_change_required` 和 `next_recommended_skill`。
- `standard`：增加测试依据、红灯证据、预期失败原因或敏感性证据、绿灯证据、整理结果、回归结果、限制和证据状态。
- `audit`：增加写权限范围、命令预检、Mock 理由，以及包含准确命令、工作目录、退出码、结果和证据状态的命令账本。

只有 `test_first` 要求观察到预期失败。没有相应证据时不得声称红灯、绿灯、回归或敏感性。权限或命令门禁失败时使用 `Blocked`。
