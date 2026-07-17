# 示例

- “功能需求仍有兼容性选择，我该走哪个流程？” -> `feature-delivery`，下一步 `requirements-clarification`。
- “行为和验收标准已经确定，请形成规格。” -> `feature-delivery`，下一步 `requirements-to-spec`。
- “实现这个范围明确的单文件修复，已授权写入。” -> 保留注册的写权限门禁，再推荐 `safe-fix-implementation`。
- “认证流程你看着改。” -> 行为和权限仍有重大选择，先澄清。
- “修复已经合并，请补回归测试。” -> `post-fix-regression-test`，模式为 `regression_after_fix`。
- 反例：“Semantic Versioning 是什么？”应直接回答。
