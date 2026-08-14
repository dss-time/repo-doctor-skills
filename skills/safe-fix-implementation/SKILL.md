---
name: safe-fix-implementation
description: "Implement one small, safe, verified production fix after a clear diagnosis or for an exact, low-risk edit with an explicit target and desired result. Use safe-test-implementation for test-only changes and documentation-sync for documentation-only changes. 在明确诊断后，或针对目标与期望结果清楚的精确低风险编辑，实施一个小范围、可验证的生产代码修复。仅测试修改使用 safe-test-implementation，仅文档修改使用 documentation-sync。"
---

# English

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Safe Fix Implementation

Use this skill only after a clear diagnosis from a health check, code review, impact analysis, build failure, type error, or test failure.
A clear, exact, low-risk edit request that names the target and desired result is also sufficiently confirmed; do not require a separate diagnosis or clarification before making that bounded fix.

## Safety Boundary

- Fix one highest-priority issue at a time.
- Do not perform unrelated refactors.
- Do not reformat unrelated files.
- Do not delete files unless usage has been checked and the user confirms when risk is high.
- Do not change public interfaces without compatibility analysis.
- Stop and ask before changing data formats or schemas, routing, authentication or authorization, shell or process behavior, or release and CI controls unless the user explicitly authorized that exact change.
- Preserve behavior outside the selected fix.
- Do not execute destructive actions.
- Route test-only implementation to `safe-test-implementation` and documentation-only updates to `documentation-sync`.

## Workflow

1. Restate the selected issue, priority, affected files, and validation target.
2. Check impact before editing.
3. Confirm or identify the smallest test seam or validation method.
4. Make the smallest practical fix.
5. Run or suggest the minimum relevant validation command.
6. Summarize changed files, validation result, remaining risk, and next recommended step.

# Output Format

1. Selected fix
2. Impact check
3. Fix plan
4. Implementation summary
5. Validation result
6. Remaining risks
7. Next recommended step

# 简体中文

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 最小安全修复

仅在已有明确诊断后使用，例如项目体检、代码审查、影响分析、构建失败、类型错误或测试失败。
已明确给出目标和期望结果的精确、低风险修改请求也视为已确认；不得在这种有边界的修复前另行要求诊断或澄清。

## 安全边界

- 一次只修一个最高优先级问题。
- 不做无关重构。
- 不顺手格式化无关文件。
- 未检查使用情况前不删除文件；高风险删除需要用户确认。
- 没有兼容性分析前不修改公共接口。
- 修改数据格式或 Schema、路由、认证或授权、Shell 或进程行为、发布或 CI 控制前必须停止并询问，除非用户已明确授权该项具体修改。
- 保持所选修复范围之外的行为不变。
- 不执行破坏性操作。
- 仅测试实施交给 `safe-test-implementation`，仅文档更新交给 `documentation-sync`。

## 工作流程

1. 重述选中的问题、优先级、影响文件和验证目标。
2. 修改前检查影响范围。
3. 确认或识别最小测试切入点或验证方式。
4. 做最小可行修复。
5. 运行或建议最小相关验证命令。
6. 总结修改文件、验证结果、剩余风险和下一步建议。

# 输出格式

1. 选中的修复项
2. 影响检查
3. 修复计划
4. 实施摘要
5. 验证结果
6. 剩余风险
7. 下一步建议
