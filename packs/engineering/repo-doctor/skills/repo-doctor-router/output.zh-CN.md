# 输出契约

1. `task_classification`
2. `recommended_next_skill`，包括清单核验状态
3. `recommended_workflow`，按执行顺序排列
4. `reason`
5. `required_inputs`
6. `safety_notes`
7. `alternatives`
8. `stop_conditions`
9. 调用示例：Codex `$skill-name`、平台无关自然语言，以及不支持显式 Skill 调用时的可复制 Prompt

不得执行推荐，也不得命名不在已验证 active 清单中的 Skill。
