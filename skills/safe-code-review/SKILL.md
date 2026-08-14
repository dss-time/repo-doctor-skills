---
name: safe-code-review
description: "Review a concrete diff or PR through three independent axes: repository conformance, change-intent fidelity, and operational safety, then deduplicate evidence-backed findings. Use automatically for broad change review, not specialist-only security, performance, API, or migration assessment. Read-only: never implement fixes without a separate explicit request and write authorization. 通过仓库符合度、变更意图忠实度和运行安全三个独立轴审查具体 Diff 或 PR，再对有证据的问题去重。适合自动承接广泛变更审查，不吸收单一安全、性能、API 或迁移专项。本 Skill 只读；没有独立明确请求和写权限时绝不实施修复。"
---

# English

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Safe Code Review

Independent review axes prevent a clean result in one concern from hiding a failure in another.

## Output modes

- `fast` (default): conclusion and only evidence-backed P0/P1/P2 findings, plus blockers and the next action.
- `standard`: all actionable findings, explicit no-finding axes, evidence gaps, and residual risks.
- `audit`: `standard` plus complete scope, source ledger, commands, skipped checks, axis-local evidence, and permission record.

## Boundary and Evidence

- Read repository instructions, the original request, relevant specification and acceptance criteria, diff, surrounding code, interfaces, and tests before judging.
- Do not modify files or implement fixes. Do not invent behavior, requirements, or passing validation.
- Prioritize correctness and material risk over style. Search references before recommending deletion and require compatibility evidence before public-interface changes.
- Use P0/P1/P2/P3. Every finding requires file, tight location, evidence, severity, impact, recommendation, and validation method.
- Do not create findings to fill a list. When an axis has no evidence-backed finding, explicitly say so. When evidence is missing, report the gap rather than guessing.

## Axis A: Repository Conformance

Evaluate only compliance with repository instructions, documented architecture constraints, naming, test conventions, relevant ADRs, and language/framework conventions. Distinguish documented violations from judgment calls. Do not use the requested feature as evidence on this axis.

## Axis B: Change Intent Fidelity

Evaluate only whether the change implements the original request, specification, and acceptance criteria. Check missing behavior, partial criteria, scope drift, unauthorized behavior, and implementation that looks reasonable but solves a different problem. If intent evidence is unavailable, mark this axis `insufficient evidence`; do not infer the requirement from the code.

## Axis C: Operational Safety

Evaluate only operational consequences: data migration and integrity, compatibility, authorization and security, rollback capability, runtime behavior, resource use, observability, release sequencing, and release blockers. Do not turn style or unmet product scope into an operational finding unless it independently creates runtime risk.

## Synthesis

1. Pin the reviewed diff or file set and record the evidence sources available to each axis.
2. Run all three axes separately, even without subagents. Do not pass conclusions, assumptions, or severity rankings from one axis into another.
3. Finish each axis with its own findings, no-finding statement, and evidence gaps.
4. Aggregate only after all axes finish. Merge duplicates by root problem while retaining every contributing axis and the strongest direct evidence.
5. Rank by user impact and likelihood. Do not inflate severity because multiple axes observed the same root problem.
6. Report commands/tests actually run, skipped validation, residual risks, and a bounded next action. Review-only authority never permits a fix.

# Output Contract

Lead with the overall conclusion, review scope, and highest-priority next action.

- `fast`: only evidence-backed P0/P1/P2 findings, blockers, and a bounded recommendation.
- `standard`: separate results for `Repository Conformance`, `Change Intent Fidelity`, and `Operational Safety`; explicitly state `no findings` or `insufficient evidence` per axis.
- `audit`: add evidence sources, commands/tests, skipped checks, permission record, and residual-risk ledger.

Every deduplicated finding must include: severity, contributing axis or axes, file, tight location, direct evidence, problem, impact, recommendation, and validation method. Never output a finding without evidence or implement the recommendation.

# 简体中文

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 安全代码审查

独立审查轴可以防止一个维度的干净结论掩盖另一个维度的失败。

## 输出模式

- `fast`（默认）：结论、仅有证据的 P0/P1/P2 问题、阻塞和下一动作。
- `standard`：全部可操作问题、明确的无发现轴、证据缺口和剩余风险。
- `audit`：在 `standard` 基础上增加完整范围、来源账本、命令、跳过检查、各轴独立证据和权限记录。

## 边界与证据

- 判断前读取仓库指令、用户原始需求、相关规格与验收标准、diff、周边代码、接口和测试。
- 不修改文件或实施修复，不编造行为、需求或验证通过结果。
- 正确性和实质风险优先于风格；建议删除前搜索引用，建议修改公共接口前需要兼容性证据。
- 使用 P0/P1/P2/P3。每个问题都需要文件、精确位置、证据、严重度、影响、建议和验证方式。
- 不为了凑数输出问题。某轴没有有证据的问题时明确写“无发现”；证据缺失时报告缺口，不猜测。

## 轴 A：Repository Conformance（仓库符合度）

只检查仓库指令、已记录架构约束、命名、测试约定、相关 ADR，以及语言/框架惯例。区分文档明确违规与判断性建议；不得用功能需求作为本轴证据。

## 轴 B：Change Intent Fidelity（变更意图忠实度）

只检查改动是否实现用户原始需求、规格和验收条件；查找遗漏行为、不完整验收、范围漂移、未授权行为，以及“代码看似合理但解决了另一个问题”的实现。意图证据不可用时，本轴标为“证据不足（`insufficient evidence`）”，不得从代码反推需求。

## 轴 C：Operational Safety（运行安全）

只检查运行后果：数据迁移与完整性、兼容性、权限与安全、回滚能力、运行时行为、资源使用、可观察性、发布顺序和发布阻塞。风格问题或未满足产品范围只有在独立造成运行风险时才属于本轴。

## 汇总

1. 固定被审查的 Diff 或文件集合，并记录各轴可用的证据来源。
2. 即使平台没有子代理，也分别运行三个轴；一个轴的结论、假设和严重度不得污染另一个轴。
3. 每个轴独立输出问题、无发现声明和证据缺口。
4. 三轴完成后再聚合；按根问题合并重复项，同时保留所有贡献轴和最强直接证据。
5. 按用户影响和发生可能性排序；同一根问题被多轴发现不得自动抬高严重度。
6. 报告实际运行的命令/测试、跳过验证、剩余风险和有边界的下一动作。只审查权限永远不包含修复权限。

# 输出契约

先给整体结论、审查范围和最高优先级下一动作。

- `fast`：仅输出有证据的 P0/P1/P2 问题、阻塞和有边界建议。
- `standard`：分别输出 `Repository Conformance`、`Change Intent Fidelity` 和 `Operational Safety` 结果；每个轴明确写“无发现”或“证据不足”。
- `audit`：增加证据来源、命令/测试、跳过检查、权限记录和剩余风险账本。

每项去重问题必须包含：严重度、贡献轴、文件、精确位置、直接证据、问题、影响、建议和验证方式。不得输出无证据问题，也不得实施建议。
