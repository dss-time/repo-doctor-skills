---
name: configuration-audit
description: "Explicit-invocation audit of configuration sources, precedence, overrides, defaults, validation, drift, dangerous settings, undocumented variables, and credential-commit risk using repository evidence. Do not trigger for one settled config edit, read sensitive values, connect to external environments, or modify configuration. 仅显式调用：基于仓库证据审计配置来源、优先级、覆盖、默认值、校验、漂移、危险设置、未文档化变量和凭据误提交风险。不得因一个已确定配置修改而触发，不读取敏感值、不连接外部环境，也不修改配置。"
---

# Configuration Audit（配置审计）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `standard`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Configuration Audit

Audit a defined configuration surface from repository evidence. Keep configuration and external environments unchanged.

## Boundary
- Route broad repository health to `project-health-check`, generic change impact to `change-impact-analysis`, and edits to `safe-fix-implementation`.
- Never read, print, store, or request credential values, personal data, or private configuration contents. Report variable names, file locations, and validation behavior only.
- Do not connect to external environments. Treat environment state supplied by the user as unverified unless evidence supports it.

## Workflow
1. Inventory configuration sources: files, environment variables, flags, remote references, defaults, generated config, and runtime overrides.
2. Establish precedence, merge behavior, environment selection, requiredness, types, parsing, validation, fallback, reload, and failure behavior.
3. Build a development/test/staging/production matrix using names and evidence only; mark unavailable environments unknown.
4. Check drift, obsolete keys, conflicting defaults, unsafe fail-open behavior, undocumented variables, inconsistent names/types, committed sensitive-file patterns, and missing validation.
5. Trace configuration to consumers, startup behavior, deployment templates, tests, and documentation.
6. Report evidence, severity/priority, impact, confidence, recommendations, validation, and unknowns without showing values or editing config.

# Output Contract
1. Scope and configuration source/precedence map
2. Evidence
3. Environment matrix without sensitive values
4. Findings with severity, impact, confidence, and affected consumers
5. Recommendations and validation
6. Undocumented, obsolete, or dangerous settings
7. Unknowns

---

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 配置审计

基于仓库证据审计一个明确配置表面，保持配置和外部环境不变。

## 职责边界
- 广泛项目健康交给 `project-health-check`，通用影响交给 `change-impact-analysis`，修改交给 `safe-fix-implementation`。
- 不读取、输出、记录或索取凭证值、个人数据和私有配置内容，只报告变量名称、文件位置和校验行为。
- 不连接外部环境；用户提供的环境状态在没有证据时标为未验证。

## 工作流程
1. 盘点配置来源：文件、环境变量、flag、远程引用、默认值、生成配置和运行时覆盖。
2. 明确优先级、合并行为、环境选择、必填、类型、解析、校验、fallback、重载和失败行为。
3. 仅使用名称和证据建立开发/测试/预发/生产矩阵；不可用环境标为未知。
4. 检查漂移、过期键、冲突默认值、危险 fail-open、未文档化变量、名称/类型不一致、敏感文件误提交模式和缺失校验。
5. 将配置追踪到消费者、启动行为、部署模板、测试和文档。
6. 不显示值或修改配置，报告证据、严重度/优先级、影响、置信度、建议、验证和未知项。

# 输出契约
1. 范围与配置来源/优先级映射
2. 证据
3. 不含敏感值的环境矩阵
4. 发现、严重度、影响、置信度和受影响消费者
5. 建议与验证
6. 未文档化、过期或危险配置
7. 未知项
