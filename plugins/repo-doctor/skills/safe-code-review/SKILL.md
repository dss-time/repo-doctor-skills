---
name: safe-code-review
description: "Review a concrete diff or PR through three independent axes: repository conformance, change-intent fidelity, and operational safety, then deduplicate evidence-backed findings. Use automatically for broad change review, not specialist-only security, performance, API, or migration assessment. Read-only: never implement fixes without a separate explicit request and write authorization. 通过仓库符合度、变更意图忠实度和运行安全三个独立轴审查具体 Diff 或 PR，再对有证据的问题去重。适合自动承接广泛变更审查，不吸收单一安全、性能、API 或迁移专项。本 Skill 只读；没有独立明确请求和写权限时绝不实施修复。"
---

# Safe Code Review（安全代码审查）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

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

# Safe Code Review

For authorized workflow continuation, evidence reuse or recovery, read `references/workflow-coordination.en.md`; preserve this Skill's own scope and permissions.

Independent review axes prevent a clean result in one concern from hiding a failure in another.

Default output is `fast`; use `standard` or `audit` for detailed evidence, following the output contract.

## Boundary and Evidence

- Read repository instructions, the original request, relevant specification and acceptance criteria, diff, surrounding code, interfaces, and tests before judging.
- Do not modify files or implement fixes. Do not invent behavior, requirements, or passing validation.
- Prioritize correctness and material risk over style. Search references before recommending deletion and require compatibility evidence before public-interface changes.
- Use P0/P1/P2/P3. Every finding requires file, tight location, evidence, severity, impact, recommendation, and validation method.
- Do not create findings to fill a list. Record findings and evidence gaps per axis; show the breakdown in detailed output rather than guessing.

## Axis A: Repository Conformance

Evaluate only compliance with repository instructions, documented architecture constraints, naming, test conventions, relevant ADRs, and language/framework conventions. Distinguish documented violations from judgment calls. Do not use the requested feature as evidence on this axis.

## Axis B: Change Intent Fidelity

Evaluate only whether the change implements the original request, specification, and acceptance criteria. Check missing behavior, partial criteria, scope drift, unauthorized behavior, and implementation that looks reasonable but solves a different problem. If intent evidence is unavailable, mark this axis `insufficient evidence`; do not infer the requirement from the code.

## Axis C: Operational Safety

Evaluate only operational consequences: data migration and integrity, compatibility, authorization and security, rollback capability, runtime behavior, resource use, observability, release sequencing, and release blockers. Do not turn style or unmet product scope into an operational finding unless it independently creates runtime risk.

## Synthesis

1. Pin the reviewed diff or file set and record the evidence sources available to each axis.
2. Run all three axes separately, even without subagents. Do not pass conclusions, assumptions, or severity rankings from one axis into another.
3. Complete each axis independently, then report at the requested output depth.
4. Aggregate only after all axes finish. Merge duplicates by root problem while retaining every contributing axis and the strongest direct evidence.
5. Rank by user impact and likelihood. Do not inflate severity because multiple axes observed the same root problem.
6. Report commands/tests actually run, skipped validation, residual risks, and a bounded next action. Review-only authority never permits a fix.

Read [execution boundaries](references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.

For applicable changes, Axis B checks preserved authorization/business behavior against original intent. Axis C checks omission/clear/replacement and concurrency semantics, actual test/build isolation, and whether edits/rollback overwrite preexisting or later user work. Evaluate evidence and the actual diff; missing relevant evidence remains unknown.

# Output Contract

Default `fast`: conclusion, scope and evidence-backed P0/P1/P2 findings. Each finding includes severity, file/location, problem and impact, decisive evidence and an actionable recommendation without duplicate fields.
State no findings briefly; add material evidence gaps only when present. Omit empty risks, blockers and forced next steps.
`standard` adds the three axis results, validation advice and useful P3 findings.
`audit` adds sources, commands, skipped checks and permissions.
Complete all three checks; never invent findings or implement fixes.

---

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

# 安全代码审查

仅在已授权流程续接、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`，保持本 Skill 自身范围和权限。

独立审查轴可以防止一个维度的干净结论掩盖另一个维度的失败。

输出默认 `fast`；需要详细证据时使用 `standard` 或 `audit`，字段以输出契约为准。

## 边界与证据

- 判断前读取仓库指令、用户原始需求、相关规格与验收标准、diff、周边代码、接口和测试。
- 不修改文件或实施修复，不编造行为、需求或验证通过结果。
- 正确性和实质风险优先于风格；建议删除前搜索引用，建议修改公共接口前需要兼容性证据。
- 使用 P0/P1/P2/P3。每个问题都需要文件、精确位置、证据、严重度、影响、建议和验证方式。
- 不为了凑数输出问题。各轴记录发现和证据缺口，详细输出时再展示；不猜测。

## 轴 A：Repository Conformance（仓库符合度）

只检查仓库指令、已记录架构约束、命名、测试约定、相关 ADR，以及语言/框架惯例。区分文档明确违规与判断性建议；不得用功能需求作为本轴证据。

## 轴 B：Change Intent Fidelity（变更意图忠实度）

只检查改动是否实现用户原始需求、规格和验收条件；查找遗漏行为、不完整验收、范围漂移、未授权行为，以及“代码看似合理但解决了另一个问题”的实现。意图证据不可用时，本轴标为“证据不足（`insufficient evidence`）”，不得从代码反推需求。

## 轴 C：Operational Safety（运行安全）

只检查运行后果：数据迁移与完整性、兼容性、权限与安全、回滚能力、运行时行为、资源使用、可观察性、发布顺序和发布阻塞。风格问题或未满足产品范围只有在独立造成运行风险时才属于本轴。

## 汇总

1. 固定被审查的 Diff 或文件集合，并记录各轴可用的证据来源。
2. 即使平台没有子代理，也分别运行三个轴；一个轴的结论、假设和严重度不得污染另一个轴。
3. 独立完成各轴检查，再按输出模式报告结果。
4. 三轴完成后再聚合；按根问题合并重复项，同时保留所有贡献轴和最强直接证据。
5. 按用户影响和发生可能性排序；同一根问题被多轴发现不得自动抬高严重度。
6. 报告实际运行的命令/测试、跳过验证、剩余风险和有边界的下一动作。只审查权限永远不包含修复权限。

读取[执行边界](references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。

对适用改动，轴 B 根据原始意图核对权限/业务行为是否保留；轴 C 核对省略/清空/替换及并发语义、测试/构建实际隔离，以及修改或回滚是否覆盖用户原有/后续改动。依据证据和实际 diff 判断，相关证据缺失保持未知。

# 输出契约

默认 `fast`：整体结论、范围和有证据的 P0/P1/P2 问题。每项包含严重度、文件位置、问题及影响、关键证据和可操作建议，避免重复字段。
没有发现时简短说明；有实质证据缺口时才补充。不输出空风险、空阻塞或强制下一步。
`standard` 增加三个审查轴的结果、验证建议以及有价值的 P3 项。
`audit` 增加来源、命令、跳过检查与权限记录。
三轴检查仍须完成；不得编造问题或实施修复。
