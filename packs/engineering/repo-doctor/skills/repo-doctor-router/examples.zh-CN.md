# 示例

- “功能需求仍有兼容性选择，我该走哪个流程？” -> `feature-delivery`，下一步 `requirements-clarification`。
- “行为和验收标准已经确定，请形成规格。” -> `feature-delivery`，下一步 `requirements-to-spec`。
- “只想先比较两个 UI 方向，不进入正式实施。” -> `decision-prototype`，模式 `standard`。
- “调用方负担和重复适配越来越多，只分析方案不要重构。” -> `architecture-deepening-analysis`，模式 `standard`。
- “实现这个范围明确的单文件修复，已授权写入。” -> 保留注册的写权限门禁，再推荐 `safe-fix-implementation`。
- “现在直接完成这次大规模架构重写。” -> 不把架构分析当作执行器；先澄清范围并保留写门禁。
- “对话很长，需要切换下一会话。” -> `session-handoff`，模式 `standard`。
- “只审查，不修复。” -> `safe-code-review`，保持只读。
- “认证流程你看着改。” -> 行为和权限仍有重大选择，先澄清。
- “修复已经合并，请补回归测试。” -> `post-fix-regression-test`，模式为 `regression_after_fix`。
- 反例：“Semantic Versioning 是什么？”应直接回答。
