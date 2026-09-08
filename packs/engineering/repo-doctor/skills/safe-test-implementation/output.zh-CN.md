# 输出契约

默认 `fast`：受保护行为、选择的 test_mode 和实际测试命令/结果。只在需要生产修改或存在失败、未验证项时解释限制。
`standard` 增加 observable_behavior、test_boundary、红/绿或敏感性证据、回归结果，以及适用时的 production_change_required、next_recommended_skill。
`audit` 增加命令预检、权限、Mock 理由和完整命令账本。
只有 test_first 要求实际预期失败；不得编造 red、green 或敏感性。无需输出空字段。
