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

可复制的下一步：`$bug-root-cause-analysis 这个接口偶尔返回 500，请查明根因，不修改文件。报错信息：<请补充报错>。` 只推荐，不执行。

快速路由：给出一个已核验推荐和一个可复制下一步请求，不附完整工作流账本，也不并列重复平台调用与自然语言版本。

- “实施已批准功能规格和相关测试。” -> `feature-implementation`；局部修复仍使用 `safe-fix-implementation`。
