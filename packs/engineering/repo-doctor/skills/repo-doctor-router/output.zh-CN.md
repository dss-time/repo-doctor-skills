# 输出契约

1. `task_classification`
2. `registry`：ID、版本和核验状态
3. `workflow_id` 或 `not_applicable`
4. `recommended_next_skill`，包括清单核验状态
5. `applicable_stages`，按注册表顺序
6. `reason`
7. `required_inputs`
8. `permission_gates`
9. `alternatives`
10. `stop_conditions`
11. Codex 调用示例和平台无关可复制 Prompt

不得执行推荐，也不得把未核验 Skill 声称为可用。
