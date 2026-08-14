---
name: dependency-upgrade-analysis
description: "Explicit-invocation analysis of one defined dependency upgrade using manifests, lockfiles, repository usage, and verified official release evidence, covering compatibility, security, licensing, validation, and rollback. Do not trigger for ordinary code changes or modify manifests or lockfiles. 仅显式调用：基于 manifest、锁文件、仓库用法和已验证官方发布资料分析一个已定义的依赖升级，覆盖兼容、安全、许可证、验证和回滚。不得因普通代码变更而触发，也不修改 manifest 或锁文件。"
---

# Dependency Upgrade Analysis（依赖升级分析）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `standard`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Dependency Upgrade Analysis

Analyze one defined dependency upgrade. Keep manifests, lockfiles, code, configuration, and CI unchanged.

## Boundary
- Route broad change impact to `change-impact-analysis` and implementation to `safe-fix-implementation`.
- Identify current and target versions, direct versus transitive status, package manager, manifests, lockfiles, runtime, compiler, and platform constraints.
- Use network sources only when allowed and necessary; prefer official documentation, release notes, advisories, standards, and original sources. Record URL and access date. Mark unavailable evidence unverified.
- Never invent release notes, vulnerabilities, licenses, or compatibility claims.

## Workflow
1. Establish the upgrade target and repository evidence for current resolution and usage.
2. Map imported APIs, plugins, peers, build tools, generated code, configuration, deployment, and transitive dependencies.
3. Compare breaking changes, API behavior, runtime/compiler requirements, security advisories, license changes, and ecosystem compatibility.
4. Classify each claim as repository evidence, verified official evidence, inference, or unknown.
5. Assess build, test, configuration, deployment, and rollback impact.
6. Recommend staged upgrade, focused validation, compatibility controls, rollback point, and stop conditions without editing files.

# Output Contract
1. Scope and versions
2. Evidence and sources with access dates
3. Direct, transitive, and usage map
4. Findings with severity, impact, confidence, and change class
5. Runtime, API, security, license, and ecosystem risks
6. Staged recommendation, validation, and rollback
7. Unknowns

---

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 依赖升级分析

分析一个明确的依赖升级，保持 manifest、锁文件、代码、配置和 CI 不变。

## 职责边界
- 广泛影响交给 `change-impact-analysis`，实施交给 `safe-fix-implementation`。
- 识别当前与目标版本、直接/间接依赖、包管理器、manifest、锁文件、运行时、编译器和平台约束。
- 仅在允许且必要时联网；优先官方文档、发布说明、安全公告、标准和原始资料，记录 URL 与访问日期。无法访问时标为未验证。
- 不得编造发布说明、漏洞、许可证或兼容性结论。

## 工作流程
1. 明确升级目标及当前解析版本和用法的仓库证据。
2. 映射导入 API、插件、peer、构建工具、生成代码、配置、部署和间接依赖。
3. 比较破坏性变更、API 行为、运行时/编译器要求、安全公告、许可证变化和生态兼容性。
4. 将主张分类为仓库证据、已验证官方证据、推断或未知。
5. 评估构建、测试、配置、部署和回滚影响。
6. 不修改文件，给出分阶段升级、聚焦验证、兼容控制、回滚点和停止条件。

# 输出契约
1. 范围与版本
2. 证据及来源和访问日期
3. 直接、间接依赖与用法映射
4. 发现、严重度、影响、置信度和变更类型
5. 运行时、API、安全、许可证和生态风险
6. 分阶段建议、验证和回滚
7. 未知项
