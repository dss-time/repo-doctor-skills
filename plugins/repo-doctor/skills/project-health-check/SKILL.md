---
name: project-health-check
description: Explicit-invocation broad repository diagnosis across architecture, correctness, security, performance, dependencies, tests, and general release risk. Do not trigger for a bounded file, error, diff, or simple request. Use a specialized review for one dependency upgrade, API contract, migration, dead-code candidate, security surface, performance regression, configuration scope, or release candidate. 仅显式调用的全仓库诊断，覆盖架构、正确性、安全、性能、依赖、测试和一般发布风险。不得因单个文件、明确报错、Diff 或简单请求而触发。单一依赖升级、API 契约、迁移、死代码候选、安全边界、性能回归、配置范围或候选版本应使用对应专项 Skill。
---

# Project Health Check（项目体检）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `standard`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Project Health Check

Use this skill for a broad repository diagnosis. Do not start by rewriting code.

## Review Dimensions

- Architecture risk
- Type risk
- Test gaps
- Security risk
- Performance risk
- Dependency risk
- Maintainability issues
- Dead or redundant code
- Release risk

## Workflow

1. Inspect metadata, scripts, test config, CI, and source layout.
2. Identify core modules and shared utilities.
3. Search references before calling code unused.
4. Check test coverage signals and release commands when available.
5. Prioritize by real user or release risk.
6. Report P0/P1/P2/P3 issues with evidence.

# Output Format

1. Overall health conclusion
2. Health score table
3. P0/P1/P2/P3 issues with evidence
4. Architecture and module boundary risks
5. Redundant or possible dead code
6. Security and stability risks
7. Performance issues
8. Test gaps
9. Release readiness checks
10. Recommended roadmap
11. Final recommendation

---

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 项目体检

用于对仓库做整体诊断。不要一开始就重写代码。

## 检查维度

- 架构风险
- 类型风险
- 测试缺口
- 安全风险
- 性能风险
- 依赖风险
- 可维护性问题
- 死代码或冗余代码
- 发布风险

## 工作流程

1. 检查元数据、脚本、测试配置、CI 和源码结构。
2. 识别核心模块和共享工具。
3. 在判断代码未使用前先搜索引用。
4. 检查测试覆盖信号和发布命令。
5. 按真实用户风险或发布风险排序。
6. 按 P0/P1/P2/P3 输出问题和证据。

# 输出格式

1. 整体健康结论
2. 健康评分表
3. 带证据的 P0/P1/P2/P3 问题
4. 架构和模块边界风险
5. 冗余代码或疑似死代码
6. 安全和稳定性风险
7. 性能问题
8. 测试缺口
9. 发布准备度检查
10. 推荐路线图
11. 最终建议
