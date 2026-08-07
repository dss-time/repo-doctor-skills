---
name: api-contract-review
description: Review a specific REST, GraphQL, RPC, event, SDK, or internal-module contract across server, client, schema, documentation, and tests, classifying breaking, non-breaking, and behavioral changes. Use for API contract compatibility; do not perform a general code review, generic impact analysis, or modify the interface. 审查具体 REST、GraphQL、RPC、事件、SDK 或内部模块契约在服务端、客户端、Schema、文档和测试间的一致性，并分类破坏性、非破坏性和行为变化。用于 API 契约兼容性；不替代普通代码审查或通用影响分析，也不修改接口。
---

# API Contract Review（API 契约审查）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# API Contract Review

Review one defined API or module contract. Keep server, client, schemas, documentation, tests, and generated SDKs unchanged.

## Boundary
- Route broad code quality to `safe-code-review`, generic blast radius to `change-impact-analysis`, planning to `safe-change-plan`, and implementation to `safe-fix-implementation`.
- Cover REST, GraphQL, RPC, events, SDKs, or internal module contracts only when concrete contract evidence exists.
- Do not infer consumer behavior without evidence.

## Workflow
1. Identify producer, consumers, versions, routes or operations, schemas, generated clients, docs, and contract tests.
2. Compare methods, paths, fields, types, requiredness, defaults, nullability, errors, pagination, sorting, idempotency, authentication, authorization, ordering, and delivery semantics as applicable.
3. Reconcile server, client, schema, documentation, examples, and tests; cite exact locations.
4. Classify each difference as breaking, non-breaking, behavioral, documentation-only, or unknown.
5. State affected consumers, migration and deprecation needs, compatibility layers, versioning options, and contract-test recommendations.
6. Report evidence, impact, severity, confidence, validation, and unknowns without editing the interface.

# Output Contract
1. Scope and contract map
2. Evidence
3. Differences and change classification
4. Findings with severity, impact, consumers, and confidence
5. Versioning, compatibility, and deprecation recommendations
6. Contract-test validation
7. Unknowns

---

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

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

# 输出契约
1. 范围与契约映射
2. 证据
3. 差异与变更分类
4. 发现、严重度、影响、消费者和置信度
5. 版本化、兼容与弃用建议
6. 契约测试验证
7. 未知项
