---
name: safe-change-plan
description: "Plan a confirmed change, repair, or multi-behavior delivery as atomic-steps or independently verifiable vertical work-items with dependencies, safe parallelism, conflict areas, acceptance, tests, risks, and rollback. Nest necessary code steps within work items for a complete plan. Use settled requirements and sufficient impact evidence; route unknown decisions or missing specifications to requirements-clarification and unknown impact to change-impact-analysis. Return Markdown only without file writes, Shell, external tasks, or implementation. 将已确认变更、修复或多行为交付规划为 atomic-steps 原子步骤或可独立验证的 work-items 垂直工作项，覆盖依赖、安全并行、冲突区域、验收、测试、风险和回滚。完整计划将必要代码步骤嵌入工作项。需要已闭合需求和充分影响证据。未决需求或缺少规格交给 requirements-clarification，未知影响交给 change-impact-analysis。只返回 Markdown，不写文件、不调用 Shell、不创建外部任务或执行实施。"
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

# Safe Change Plan

Convert confirmed scope into a dependency-ordered, verifiable, reversible plan, selecting delivery work items or code-level steps as needed.

## Planning granularity

- `atomic-steps`: plan single-purpose code steps for a diagnosed repair or a defined change.
- `work-items`: plan vertical slices for multiple deliverable behaviors. Each item spans necessary technical layers and delivers an independently observable, verifiable result.
- Declare `granularity`, following the user's request first and otherwise selecting by scope. Do not turn one small repair into a large work-item table.
- When a complete plan is requested, nest necessary atomic steps inside each work item and share scope, dependency, verification, and rollback records instead of producing a second duplicate plan.

## Scope and permission boundary

- Require a confirmed specification, root-cause report, impact analysis, or sufficiently settled conversation. Route open decisions or missing testable requirements to `requirements-clarification`, and unknown dependency or compatibility impact to `change-impact-analysis`.
- Atomic steps require sufficiently known impact. Work items may mark concrete file locations unknown. Resolve unknowns that could change delivery scope, dependencies, or safety first.
- Return copyable Markdown only in the response, even when the user asks for authorized persistence. Never write local files, invoke Shell, or create external issues or tasks. Never use Shell to write indirectly.
- Do not modify code, tests, configuration, dependencies, or documentation, and do not execute any planned step.
- Route architecture rationale or decision records to `architecture-decision-record`, settled features to `feature-implementation`, and diagnosed local repairs to `safe-fix-implementation`.
- Reject unrelated refactors, cleanup, and speculative features.

## Workflow

1. Cite confirmed specification, root cause, impact analysis, diff, or repository evidence and identify desired behavior, acceptance criteria, and exclusions.
2. Check input sufficiency. Block affected planning only when a missing choice changes architecture, contracts, data safety, permissions, delivery dependencies, or rollback feasibility.
3. Identify required changes, conditional changes, and excluded scope, plus API, database, configuration, permission, concurrency, compatibility, deployment, and release risks.
4. Select granularity and split single-purpose steps or deliverable behaviors in dependency order. Label required work, recommendations, and later optimization.
5. For each step or item, record goal, affected areas, dependencies, acceptance or verification, failure signals, risks, and rollback. Mark inferred paths and commands as assumptions and never invent repository commands.
6. For work items, also map dependencies, parallel groups, shared state, and conflict areas. Declare parallelism only when dependencies, shared files, and integration order permit it.
7. Keep tests, documentation, compatibility controls, and migration within the behavior slice they support. Do not defer all testing until the end. Reserve integration checkpoints for genuinely cross-slice verification.
8. Use compatibility layers, feature flags, additive migration, and reversible sequencing where risks warrant them. Define stop conditions and completion criteria.
9. Verify that each item is independently testable, dependencies are acyclic, parallelism has evidence, and conflicts are visible, then provide a bounded implementation handoff.

## Rejection and stop conditions

Reject mechanical database/backend/frontend/test-layer splits, acceptance criteria of only “development complete,” unverifiable work items, missing dependencies, shared core files without coordination, all testing deferred to the end, or unrelated goals mixed into one item.
When inputs are insufficient, report missing evidence. Block affected steps while safety or compatibility decisions remain open. Complete the plan when scope, dependencies, acceptance, verification, risks, rollback, and completion criteria are present, without implementing it.

Read [execution boundaries](references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Explicit user-directed deferred verification is an exception to the per-slice test schedule and test-first execution timing above. Apply the execution-boundary deferral protocol, record changes as implemented with verification deferred, and do not claim verified completion.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.

# Output Contract

Lead with `granularity`, plan basis, input sufficiency, desired behavior, scope, prerequisites, risks, and unknowns.

## Atomic steps output

Each step includes goal, files or modules, intended change, dependencies, verification method, failure signal, and rollback action. Order by dependency and label required work, recommendations, and later optimization.

## Work items output

Provide dependency overview, parallel groups, shared state, conflict areas, and integration checkpoints. Each item includes the following fields.

- `id`
- `title`
- `goal`
- `user_visible_outcome`
- `scope`
- `out_of_scope`
- `affected_areas`
- `dependencies`
- `parallelizable_with`
- `acceptance_criteria`
- `verification`
- `risks`
- `rollback_notes`
- `recommended_skills`
- `status`

When complete implementation detail is requested, nest necessary atomic steps inside their work item. Do not duplicate top-level scope, risk, or rollback information.

Finish with test strategy, compatibility and release risks, stop conditions, completion criteria, and a necessary implementation handoff. Report unresolved assumptions or rejected low-quality decomposition when relevant, omitting empty sections. Return the plan only in the response, without writing files, using Shell, or creating external issues or tasks.

If the user deferred checks, include `verification_status: verification_deferred`, the instruction source and pending acceptance/check mapping. Distinguish implemented changes from verified delivery.

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

# 安全变更计划

把已确认范围转成有依赖顺序、可验证、可回滚的计划，并按需要选择交付工作项或代码级步骤。

## 计划粒度

- `atomic-steps`：用于已诊断修复或明确变更，按单一目的的代码步骤规划。
- `work-items`：用于多个可交付行为，按垂直切片规划。每项跨越必要技术层，交付一个可独立观察和验证的结果。
- 声明 `granularity`，优先遵循用户要求。否则按范围选择。单个小修复不扩展成大型工作项表。
- 用户需要完整计划时，在每个工作项内嵌必要原子步骤，共用范围、依赖、验证和回滚记录，不再生成一套重复计划。

## 职责与权限边界

- 需要已确认规格、根因报告、影响分析或足够闭合的对话。未决需求或缺少可测试规格交给 `requirements-clarification`，未知依赖和兼容性影响交给 `change-impact-analysis`。
- atomic-steps 需要足够已知的影响。work-items 可将尚未知的具体文件标为未知。会改变交付范围、依赖或安全性的未知必须先解决。
- 只在当前响应中输出 Markdown。即使用户明确授权，也不写本地文件、不调用 Shell、不创建外部 Issue 或任务，不得用 Shell 间接写入。
- 不修改代码、测试、配置、依赖或文档，不执行任何计划步骤。
- 架构理由或决策文档交给 `architecture-decision-record`，已确认功能交给 `feature-implementation`，已诊断局部修复交给 `safe-fix-implementation`。
- 拒绝无关重构、清理或推测性功能。

## 工作流程

1. 引用已确认规格、根因、影响分析、diff 或仓库证据，明确目标行为、验收标准和排除项。
2. 检查输入充分性。只有缺失选择会改变架构、契约、数据安全、权限、交付依赖或回滚可行性时才阻塞相关规划。
3. 标明必需变更、条件变更和排除范围，识别 API、数据库、配置、权限、并发、兼容、部署和发布风险。
4. 选择粒度，按依赖顺序拆成单一目的的步骤或可交付行为。区分必须完成、建议完成和后续优化。
5. 每步或每项写明目标、影响区域、依赖、验收或验证、失败信号、风险和回滚。推断路径和命令标为假设，不编造仓库命令。
6. work-items 另外建立依赖图、并行组、共享状态和冲突区域。只有依赖、共享文件及集成顺序允许时，才能声明并行。
7. 将测试、文档、兼容控制和迁移放入对应行为切片，不把全部测试推迟到最后。真正跨切片的验证才单列集成检查点。
8. 风险需要时选择兼容层、功能开关、增量迁移和可逆顺序，明确停止条件和完成定义。
9. 核对每项独立可验证、依赖无环、并行有据、冲突可见，最后给出有边界的实施转交。

## 低质量拒绝与停止条件

拒绝只按数据库/后端/前端/测试机械分层、验收只有“完成开发”、工作项无法独立验证、缺少依赖、共享核心文件却未说明协调方式、测试全部留到最后或混入无关目标的拆分。
输入不足时报告缺失证据，安全或兼容性决策未闭合时阻塞相关步骤。计划在范围、依赖、验收、验证、风险、回滚和完成定义齐全时完成，不执行实施。

读取[执行边界](references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

用户明确要求延期验证时，作为上述逐切片测试及 test-first 执行时序的例外，遵循执行边界中的延期协议。将改动记录为已实施、验证延期，不声明验证完成。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。

# 输出契约

先给出 `granularity`、计划依据、输入充分性、目标行为、范围、前置条件、风险和未知项。

## 原子步骤输出

每步包含目标、文件或模块、修改内容、依赖、验证方法、失败信号和回滚动作。按依赖排序，并标记必须完成、建议完成或后续优化。

## 工作项输出

给出依赖概览、并行组、共享状态、冲突区域和集成检查点。每项包含以下字段。

- `id`
- `title`
- `goal`
- `user_visible_outcome`
- `scope`
- `out_of_scope`
- `affected_areas`
- `dependencies`
- `parallelizable_with`
- `acceptance_criteria`
- `verification`
- `risks`
- `rollback_notes`
- `recommended_skills`
- `status`

用户需要完整实施细节时，将必要原子步骤嵌入所属工作项。不要重复顶层的范围、风险和回滚信息。

最后给出测试策略、兼容与发布风险、停止条件、完成定义和必要的实施转交。明确未解决假设或被拒绝的低质量拆分，省略空栏目。计划只在响应中输出，不写本地文件、不使用 Shell，也不创建外部 Issue 或任务。

用户要求延期检查时，输出 `verification_status: verification_deferred`、指令来源及待验证验收项/检查映射，区分已实施改动与已验证交付。
