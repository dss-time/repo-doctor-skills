---
name: safe-code-review
description: Review a code change or PR broadly for correctness, compatibility, security, maintainability, and tests. Use security-focused-review, performance-regression-analysis, or api-contract-review when the user requests one bounded specialist assessment; do not implement fixes. 广泛审查代码改动或 PR 的正确性、兼容性、安全性、可维护性和测试。用户要求单一安全、性能回归或 API 契约专项时分别使用对应专项 Skill；本 Skill 不实施修复。
---

# Safe Code Review（安全代码审查）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

# Safe Code Review

Review a code change in two independent dimensions, then deduplicate findings without losing their dimension. Stay read-only.

## Boundary and Evidence

- Read repository instructions, the original request, relevant specification and acceptance criteria, diff, surrounding code, interfaces, and tests before judging.
- Do not modify files or implement fixes. Do not invent behavior, requirements, or passing validation.
- Prioritize correctness and material risk over style. Search references before recommending deletion and require compatibility evidence before public-interface changes.
- Use P0/P1/P2/P3. Every finding needs a tight location, evidence, impact, recommendation, and validation method.
- If no reliable requirement or specification exists, mark Intent Alignment evidence as insufficient. Do not infer compliance from the implementation itself.

## Phase A: Intent Alignment

Review the change against the original user request, specification, acceptance criteria, repository policy, and compatibility commitments. Check for missing required behavior, incomplete acceptance criteria, unauthorized behavior, scope expansion, compatibility regressions, and unhandled boundaries, failures, permissions, data rules, migration, or rollback requirements.

Record the intent evidence used and each gap. If intent evidence is unavailable, report the unknowns and limit the conclusion.

## Phase B: Implementation Quality

Independently review correctness, security, data integrity, concurrency, performance, maintainability, module boundaries, duplication, test quality, observability, and rollback capability. Inspect changed files and the minimum surrounding paths needed to prove or disprove a risk.

## Synthesis

1. Run the two phases separately even when the platform has no subagents; do not let a clean implementation-quality pass substitute for intent evidence.
2. Merge duplicate findings by root problem while retaining `Intent Alignment`, `Implementation Quality`, or both as the dimension.
3. Rank by user impact and likelihood, not by which phase found the issue.
4. Report no-finding areas, evidence gaps, tests not run, and residual risks.
5. Finish with a bounded recommendation. No findings does not prove full requirement compliance when intent evidence is insufficient.

# Output Contract

1. Overall conclusion and review scope
2. Intent evidence and Intent Alignment result, explicitly `insufficient evidence` when applicable
3. Implementation Quality result
4. Deduplicated findings: priority, dimension, location, evidence, problem, impact, recommendation, validation
5. Missing behavior, unauthorized scope, compatibility, boundary, and failure-path review
6. Correctness, security, data integrity, concurrency, performance, maintainability, module boundaries, duplication, tests, observability, and rollback review
7. Commands or tests actually run, evidence gaps, and residual risks
8. Final bounded recommendation

---

# 安全代码审查

从两个独立维度审查代码变更，最终去重但保留问题所属维度。全程只读。

## 边界与证据

- 判断前读取仓库指令、用户原始需求、相关规格与验收标准、diff、周边代码、接口和测试。
- 不修改文件或实施修复，不编造行为、需求或验证通过结果。
- 正确性和实质风险优先于风格；建议删除前搜索引用，建议修改公共接口前需要兼容性证据。
- 使用 P0/P1/P2/P3。每个问题都需要精确位置、证据、影响、建议和验证方式。
- 没有可靠需求或规格时，将 Intent Alignment 标为证据不足，不得从实现本身反推“符合需求”。

## 阶段 A：Intent Alignment（需求意图符合度）

根据用户原始需求、规格、验收标准、仓库政策和兼容承诺，检查是否遗漏要求行为、是否未完整满足验收标准、是否实现未授权范围、是否破坏兼容性，以及是否遗漏边界、失败路径、权限、数据规则、迁移或回滚要求。

记录使用的意图证据和每个缺口。意图证据不可用时，报告未知项并限制结论。

## 阶段 B：Implementation Quality（实现质量）

独立检查正确性、安全、数据完整性、并发、性能、可维护性、模块边界、重复、测试质量、可观察性和回滚能力。只扩展到能够证明或反驳风险的最少周边路径。

## 汇总

1. 即使平台不支持子代理，也按两个独立阶段执行；实现质量通过不能替代意图证据。
2. 按根问题合并重复发现，但保留 `Intent Alignment`、`Implementation Quality` 或两者兼有的维度标记。
3. 按用户影响与发生可能性排序，不按发现阶段排序。
4. 报告未发现问题的区域、证据缺口、未运行测试和剩余风险。
5. 给出有边界的最终建议；意图证据不足时，“未发现问题”不代表完全符合需求。

# 输出契约

1. 整体结论与审查范围
2. 意图证据和 Intent Alignment 结果；适用时明确标记“证据不足”
3. Implementation Quality 结果
4. 去重后问题：优先级、所属维度、位置、证据、问题、影响、建议、验证
5. 遗漏行为、未授权范围、兼容性、边界与失败路径审查
6. 正确性、安全、数据完整性、并发、性能、可维护性、模块边界、重复、测试、可观察性和回滚审查
7. 实际运行的命令或测试、证据缺口与剩余风险
8. 有边界的最终建议
