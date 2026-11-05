# API 契约审查

审查一个明确的 API 或模块契约，保持服务端、客户端、Schema、文档、测试和生成 SDK 不变。

## 职责边界
- 广泛代码质量交给 `safe-code-review`，通用影响交给 `change-impact-analysis`，计划交给 `safe-change-plan`，实施交给 `safe-fix-implementation`。
- 仅在存在具体契约证据时审查 REST、GraphQL、RPC、事件、SDK 或内部模块契约。
- 不得无证据推断消费者行为。

## 工作流程
1. 识别生产方、消费者、版本、路由或操作、Schema、生成客户端、文档和契约测试。
2. 按适用情况比较方法、路径、字段、类型、必填、默认值、空值、错误、分页、排序、幂等、鉴权、授权、顺序和投递语义。
3. 对齐服务端、客户端、Schema、文档、示例和测试，并引用准确位置。
4. 将差异分类为 breaking、non-breaking、behavioral、仅文档或未知。
5. 说明受影响消费者、迁移与弃用、兼容层、版本化选项和契约测试建议。
6. 不修改接口，报告证据、影响、严重度、置信度、验证和未知项。

读取[执行边界](../../references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](../../references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](../../references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。
