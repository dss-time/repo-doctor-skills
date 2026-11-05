---
name: change-impact-analysis
description: "Analyze general dependency and compatibility impact before modifying, renaming, moving, or deleting shared code. Use dependency-upgrade-analysis, api-contract-review, database-migration-review, or dead-code-verification when the core question is that specialized risk; do not modify files. 在修改、重命名、移动或删除共享代码前分析一般依赖关系和兼容性影响。核心问题是依赖升级、API 契约、数据库迁移或死代码可删除性时使用对应专项 Skill；本 Skill 不修改文件。"
---

# English

## Permission Contract

These capability limits come from Skill metadata, not user authorization. Allowed capabilities remain subject to the user's authorized scope and stricter conditions in the instructions.
- Read files: only within authorized scope and this Skill's conditions.
- Write or modify files: prohibited.
- Run shell commands: prohibited.
- Access the network: prohibited.
- Perform destructive actions: prohibited.
An explicit exception for isolated temporary artifacts applies only under all of its stated conditions; it does not grant general write or deletion permission.

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Complete one primary task by default. Continue an authorized end-to-end workflow within each Skill's permissions; Router remains recommendation-only. Pause for new material decisions or scope, not authorization already given.
For authorized multi-stage work, evidence reuse or recovery, read `references/workflow-coordination.en.md`; optionally use `references/workflow-coordination.mjs` and `references/workflows.yaml`. Provide manual handoff when host execution is unavailable.
For a human-only blocker, give location, action, success signal and resume step; never request secret values or assume completion.
Validate according to actual risk; security, production, migrations, releases and other high-risk work use `audit`. Read `references/execution-modes.en.md` only when mode selection is unclear.

# Change Impact Analysis

For authorized workflow continuation, evidence reuse or recovery, read `references/workflow-coordination.en.md`; preserve this Skill's own scope and permissions.

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

Read [execution boundaries](references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.

For relevant changes, identify authorization/business invariants to preserve, existing-data omission/clear/replacement and concurrency semantics, actual validation targets/effects, and current file baselines or conflicting edits. State missing evidence before proposing affected writes or executable checks.

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

# 简体中文

## 权限契约

以下能力边界来自 Skill 元数据，不构成用户授权；允许的能力仍须遵守用户授权范围和正文中更严格的条件。
- 读取文件：仅限已授权范围及本 Skill 的条件内。
- 写入或修改文件：禁止。
- 执行 Shell 命令：禁止。
- 访问网络：禁止。
- 执行破坏性操作：禁止。
正文明确规定的隔离临时产物例外仅适用于该例外的全部条件，不扩大为一般写入或删除权限。

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
默认完成一个主任务。用户已授权完整流程时，在各 Skill 权限内连续完成；Router 仍只推荐。新重大决策或超出授权时暂停，不重复索取已有授权。
仅在已授权多阶段协作、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`；按需使用 `references/workflow-coordination.mjs` 和 `references/workflows.yaml`，宿主不支持执行时提供人工交接。
必须由用户完成的阻塞步骤：给出操作位置、具体动作、成功标志、恢复步骤；不要求粘贴秘密值，不代替用户确认完成。
按实际风险选择验证；安全、生产、迁移、发布等高风险工作使用 `audit`。模式不明确时才读取 `references/execution-modes.zh-CN.md`。

# 变更影响分析

仅在已授权流程续接、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`，保持本 Skill 自身范围和权限。

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

读取[执行边界](references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。

对相关改动识别必须保留的权限/业务不变量、已有数据省略/清空/替换及并发语义、实际验证目标/副作用，以及当前文件基线或编辑冲突。提出受影响写入或可执行检查前，明确缺失证据。

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
