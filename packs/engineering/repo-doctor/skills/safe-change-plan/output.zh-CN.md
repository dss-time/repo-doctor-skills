# 输出契约

先给出 `granularity`、计划依据、输入充分性、目标行为、范围、前置条件、风险和未知项。

## 原子步骤输出

每步包含目标、文件或模块、修改内容、依赖、验证方法、失败信号和回滚动作。按依赖排序，并标记必须完成、建议完成或后续优化。

## 工作项输出

给出依赖概览、并行组、共享状态、冲突区域和集成检查点。每项包含以下字段。

- `id`
- `title`
- `goal`
- `user_visible_outcome`
- `scope`
- `out_of_scope`
- `affected_areas`
- `dependencies`
- `parallelizable_with`
- `acceptance_criteria`
- `verification`
- `risks`
- `rollback_notes`
- `recommended_skills`
- `status`

用户需要完整实施细节时，将必要原子步骤嵌入所属工作项。不要重复顶层的范围、风险和回滚信息。

最后给出测试策略、兼容与发布风险、停止条件、完成定义和必要的实施转交。明确未解决假设或被拒绝的低质量拆分，省略空栏目。计划只在响应中输出，不写本地文件、不使用 Shell，也不创建外部 Issue 或任务。

用户要求延期检查时，输出 `verification_status: verification_deferred`、指令来源及待验证验收项/检查映射，区分已实施改动与已验证交付。
