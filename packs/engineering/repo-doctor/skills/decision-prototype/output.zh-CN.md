# 输出契约

先给 `status`、验证问题、结论和建议处置。

1. `prototype_type`：`logic-prototype` 或 `ui-prototype`
2. `output_mode`：`fast`、`standard` 或 `audit`
3. 唯一验证问题及成立/否定判据
4. 已授权位置和 `NON-PRODUCTION PROTOTYPE` 标记
5. 关键状态、输入、方向，以及可运行命令或交互方式
6. 改动文件和观察结果
7. 结论：`supported`、`rejected` 或 `uncertain`
8. 证据、限制和剩余不确定性
9. 生产隔离及凭据/数据状态
10. 处置：`delete`、`retain_as_evidence` 或 `reimplement_for_production`
11. 推荐的下一 Repo Doctor Skill

audit 模式还要包含准确权限与命令账本。不得把原型描述为生产就绪。
