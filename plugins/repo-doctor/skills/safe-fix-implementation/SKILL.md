---
name: safe-fix-implementation
description: "Implement one small, safe, verified production fix after a clear diagnosis or for an exact, low-risk edit with an explicit target and desired result. Use feature-implementation for settled multi-slice feature delivery, safe-test-implementation for test-only changes and documentation-sync for documentation-only changes. 在明确诊断后，或针对目标与期望结果清楚的精确低风险编辑，实施一个小范围、可验证的生产代码修复。已确认的多切片功能交付使用 feature-implementation，仅测试修改使用 safe-test-implementation，仅文档修改使用 documentation-sync。"
---

# Safe Fix Implementation（最小安全修复）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Permission Contract

These capability limits come from Skill metadata, not user authorization. Allowed capabilities remain subject to the user's authorized scope and stricter conditions in the instructions.
- Read files: only within authorized scope and this Skill's conditions.
- Write or modify files: only within authorized scope and this Skill's conditions.
- Run shell commands: only within authorized scope and this Skill's conditions.
- Access the network: prohibited.
- Perform destructive actions: prohibited.
An explicit exception for isolated temporary artifacts applies only under all of its stated conditions; it does not grant general write or deletion permission.

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Complete one primary task by default. Continue an authorized end-to-end workflow within each Skill's permissions; Router remains recommendation-only. Pause for new material decisions or scope, not authorization already given.
For authorized multi-stage work, evidence reuse or recovery, read `references/workflow-coordination.en.md`; optionally use `references/workflow-coordination.mjs` and `references/workflows.yaml`. Provide manual handoff when host execution is unavailable.
For a human-only blocker, give location, action, success signal and resume step; never request secret values or assume completion.
Validate according to actual risk; security, production, migrations, releases and other high-risk work use `audit`. Read `references/execution-modes.en.md` only when mode selection is unclear.

# Safe Fix Implementation

For authorized workflow continuation, evidence reuse or recovery, read `references/workflow-coordination.en.md`; preserve this Skill's own scope and permissions.

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
2. Check impact, current file baselines and preexisting edits. Identify the intended change and authorization, business and error behavior to preserve. For existing-data updates, verify payload and omission/clear/replacement semantics.
3. Identify the smallest test seam with applicable allowed/rejected cases. Preflight actual test/build targets and side effects; command names do not establish isolation.
4. Recheck the target and edited region immediately before writing. Make the smallest fix on current contents, preserving permission/business checks and unrelated data. Pause conflicting writes instead of overwriting with stale snapshots.
5. Preflight and run the minimum relevant validation when safe, authorized, and available. If blocked by permissions, missing tools or prerequisites, mark the fix unverified, state the reason and pending command; a suggestion is not a passed check.
6. Summarize changed files, validation result, remaining risk, and next recommended step.

Complete work already authorized within this Skill without asking again. In an authorized end-to-end workflow, hand other responsibilities to the appropriate Skill; this Skill's own permissions do not expand.

Read [execution boundaries](references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Explicit user-directed deferred verification is an exception to the per-slice test schedule and test-first execution timing above. Apply the execution-boundary deferral protocol, record changes as implemented with verification deferred, and do not claim verified completion.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.

# Output Format

Default `fast`: report the fix and the actual verification command/result, usually in one short paragraph.
Add material unverified scope, failures or residual risks only when present. Omit empty sections and unnecessary next-Skill recommendations.
`standard` adds relevant impact; `audit` adds scope, permissions and the full verification record.

If the user deferred checks, include `verification_status: verification_deferred`, the instruction source and pending acceptance/check mapping. Distinguish implemented changes from verified delivery.

When relevant, briefly state preserved authorization/business behavior, existing-data update evidence, validation target/isolation or unrun reason, and preexisting/concurrent edit protection. Unresolved safety gaps or edit conflicts keep affected work blocked/partial. Omit inapplicable fields and retain deferred-verification status.

---

## 权限契约

以下能力边界来自 Skill 元数据，不构成用户授权；允许的能力仍须遵守用户授权范围和正文中更严格的条件。
- 读取文件：仅限已授权范围及本 Skill 的条件内。
- 写入或修改文件：仅限已授权范围及本 Skill 的条件内。
- 执行 Shell 命令：仅限已授权范围及本 Skill 的条件内。
- 访问网络：禁止。
- 执行破坏性操作：禁止。
正文明确规定的隔离临时产物例外仅适用于该例外的全部条件，不扩大为一般写入或删除权限。

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
默认完成一个主任务。用户已授权完整流程时，在各 Skill 权限内连续完成；Router 仍只推荐。新重大决策或超出授权时暂停，不重复索取已有授权。
仅在已授权多阶段协作、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`；按需使用 `references/workflow-coordination.mjs` 和 `references/workflows.yaml`，宿主不支持执行时提供人工交接。
必须由用户完成的阻塞步骤：给出操作位置、具体动作、成功标志、恢复步骤；不要求粘贴秘密值，不代替用户确认完成。
按实际风险选择验证；安全、生产、迁移、发布等高风险工作使用 `audit`。模式不明确时才读取 `references/execution-modes.zh-CN.md`。

# 最小安全修复

仅在已授权流程续接、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`，保持本 Skill 自身范围和权限。

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
2. 修改前检查影响范围、当前文件基线和用户已有改动，明确目标变化及必须保留的权限、业务与错误行为；涉及已有数据更新时核对载荷和省略/清空/替换语义。
3. 确认最小测试切入点，按适用边界覆盖允许与拒绝场景；预检实际测试/构建目标及副作用，不能以命令名称认定隔离。
4. 写入前复核目标与待改区块，基于当前内容做最小修复，保留已有权限、业务检查及无关数据。并发冲突时暂停受影响写入，不用旧快照覆盖。
5. 预检最小相关验证；安全、已授权且具备执行条件时必须运行。权限、工具或前置条件阻塞时，明确标记修复尚未验证，说明原因和待运行命令；建议不等于验证通过。
6. 总结修改文件、验证结果、剩余风险和下一步建议。

用户请求已明确授权本 Skill 范围时直接完成，不重复索取授权。完整流程需要其他职责时，仅在已有流程授权下交给对应 Skill；本 Skill 自身权限不扩大。

读取[执行边界](references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

用户明确要求延期验证时，作为上述逐切片测试及 test-first 执行时序的例外，遵循执行边界中的延期协议。将改动记录为已实施、验证延期，不声明验证完成。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。

# 输出格式

默认 `fast`：报告修复结果和实际验证命令/结果，通常一小段即可。
有重要未验证范围、失败或剩余风险时才补充。不要输出空栏目或强行推荐下一 Skill。
`standard` 增加必要的影响说明；`audit` 增加范围、权限和完整验证记录。

用户要求延期检查时，输出 `verification_status: verification_deferred`、指令来源及待验证验收项/检查映射，区分已实施改动与已验证交付。

仅在相关时简述保留的权限/业务行为、已有数据更新依据、验证目标/隔离或未运行原因，以及已有/并发改动保护情况。未解决安全缺口或编辑冲突使受影响工作保持阻塞/部分完成。省略不适用字段，保留延期验证状态。
