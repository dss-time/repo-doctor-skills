---
name: change-impact-analysis
description: Analyze general dependency and compatibility impact before modifying, renaming, moving, or deleting shared code. Use dependency-upgrade-analysis, api-contract-review, database-migration-review, or dead-code-verification when the core question is that specialized risk; do not modify files. 在修改、重命名、移动或删除共享代码前分析一般依赖关系和兼容性影响。核心问题是依赖升级、API 契约、数据库迁移或死代码可删除性时使用对应专项 Skill；本 Skill 不修改文件。
---

# Change Impact Analysis（变更影响分析）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Change Impact Analysis

Use this skill before modifying, moving, renaming, deleting, or redesigning shared code.

## Safety Boundary

- Analyze before editing.
- Do not modify files by default.
- Do not assume no references exist without searching.
- Treat public interfaces as compatibility-sensitive.

## Workflow

1. Identify the proposed change target.
2. Search imports, calls, re-exports, dynamic references, route references, config usage, tests, documentation, package exports, and CI usage.
3. Determine whether the target is a public interface.
4. Classify blast radius and compatibility requirements.
5. Identify behavior that must be preserved.
6. Recommend the smallest safe change plan.

# Output Format

1. Change target
2. Current responsibility
3. References and dependencies
4. Risk level
5. Affected behavior
6. Tests needed before changing
7. Minimum safe change plan
8. Unsafe actions to avoid
9. Validation commands
10. Final decision

---

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 变更影响分析

用于在修改、移动、重命名、删除或重新设计共享代码前分析影响范围。

## 安全边界

- 先分析，再修改。
- 默认不修改文件。
- 没有搜索引用前，不要假设没有调用方。
- 将公共接口视为兼容性敏感区域。

## 工作流程

1. 识别拟变更目标。
2. 搜索 import、调用、re-export、动态引用、路由引用、配置使用、测试、文档、包导出和 CI 使用。
3. 判断目标是否属于公共接口。
4. 评估影响范围和兼容性要求。
5. 识别必须保持的行为。
6. 给出最小安全修改方案。

# 输出格式

1. 变更目标
2. 当前职责
3. 引用和依赖
4. 风险等级
5. 受影响行为
6. 修改前需要的测试
7. 最小安全修改方案
8. 应避免的不安全操作
9. 验证命令
10. 最终判断
