---
name: dead-code-verification
description: "Verify whether a specific symbol, file, route, configuration path, or feature is safely removable by checking static and dynamic usage, registries, build entries, templates, plugins, scripts, and external contracts. Use for evidence of unused code; do not perform general impact analysis, assume absence from text search proves safety, or delete code. 通过检查静态与动态使用、注册器、构建入口、模板、插件、脚本和外部契约，验证具体符号、文件、路由、配置路径或功能是否可安全删除。用于无用代码证据；不替代通用影响分析，不把文本搜索无结果当安全证明，也不删除代码。"
---

# Dead Code Verification（死代码验证）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Dead Code Verification

Verify one defined removal candidate. Default to “not safe to remove” when safety cannot be demonstrated.

## Boundary
- Use `change-impact-analysis` for a broader proposed deletion with known consumers; use this skill when the question is whether usage exists at all.
- Do not delete, rename, move, or rewrite code. Route confirmed removal implementation to `safe-fix-implementation`.
- Do not treat static search, coverage, or one build as proof by itself.

## Workflow
1. Define the candidate, exports, aliases, generated names, public surface, and intended removal scope.
2. Search static imports/calls/re-exports plus dynamic imports, reflection, registries, dependency injection, configuration, routes, scripts, templates, plugins, build entries, package exports, serialization, and external APIs.
3. Inspect tests, docs, examples, feature flags, release artifacts, telemetry evidence when supplied, and version-control context.
4. Classify the candidate as confirmed unused, probably unused, still used, or unproven.
5. Explain deletion impact, false-negative risks, compatibility concerns, validation tests, staged disablement, and restoration method.
6. Report evidence, severity/priority, impact, confidence, recommendation, validation, and unknowns without deletion.

# Output Contract
1. Scope and candidate
2. Evidence and search surfaces
3. Classification
4. Findings with priority, impact, and confidence
5. False-negative and compatibility risks
6. Recommendation, validation, staged removal, and restoration
7. Unknowns

---

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 死代码验证

验证一个明确的删除候选；无法证明安全时默认“不建议删除”。

## 职责边界
- 已知调用方的广泛删除影响使用 `change-impact-analysis`；本 Skill 用于判断是否存在使用。
- 不删除、重命名、移动或改写代码；确认后的删除实施交给 `safe-fix-implementation`。
- 不把静态搜索、覆盖率或一次构建单独视为证明。

## 工作流程
1. 明确候选、导出、别名、生成名称、公共表面和拟删除范围。
2. 搜索静态 import/call/re-export，以及动态导入、反射、注册器、依赖注入、配置、路由、脚本、模板、插件、构建入口、包导出、序列化和外部 API。
3. 检查测试、文档、示例、功能开关、发布产物、用户提供的遥测证据和版本历史。
4. 分类为确认无用、疑似无用、仍在使用或无法证明。
5. 说明删除影响、假阴性风险、兼容问题、验证测试、分阶段禁用和恢复方法。
6. 不删除代码，报告证据、严重度/优先级、影响、置信度、建议、验证和未知项。

# 输出契约
1. 范围与候选
2. 证据与搜索表面
3. 分类
4. 发现、优先级、影响和置信度
5. 假阴性与兼容风险
6. 建议、验证、分阶段删除和恢复
7. 未知项
