# 示例

- “功能需求还很模糊，可能影响兼容性，我该走哪个流程？” -> 推荐 `requirements-clarification`，但不执行。
- “行为和验收标准已经确定，请整理成可实施规格。” -> 推荐 `requirements-to-spec`。
- “这是一个较大的已批准规格，包含多个独立用户行为。” -> 推荐 `spec-to-work-items`。
- “运行时故障跨越多个模块，目前不知道根因。” -> 推荐 `bug-root-cause-analysis`。
- “当前会话太长，请整理给另一个 Agent 继续。” -> 推荐 `session-handoff`。
- 反例：“Semantic Versioning 是什么？”应直接回答，不触发仓库工作流路由。
