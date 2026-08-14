---
name: architecture-decision-record
description: "Explicit-invocation Skill to create or update an ADR from a real architectural problem, evidence, alternatives, tradeoffs, and an explicit decision state while respecting repository conventions. Requires authorized ADR scope; do not fabricate consensus, plan implementation, or modify business code. 仅显式调用：根据真实架构问题、证据、候选方案、权衡和明确决策状态创建或更新 ADR，并遵循仓库约定。必须获得 ADR 范围授权；不虚构共识、不生成实施计划，也不修改业务代码。"
---

# English

## Execution Contract

Default to `standard`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Architecture Decision Record

Create or update one ADR when the user explicitly authorizes architecture-document edits. Do not modify business code.

## Boundary
- Route requirements to `requirements-to-spec`, implementation sequencing to `safe-change-plan`, and technical risk reviews to the relevant specialized skill.
- Search for an existing ADR directory, index, numbering scheme, status vocabulary, template, and supersession rules before writing.
- Never present a proposal as accepted consensus. Use `Proposed` when approval evidence is absent.
- Use official standards only when allowed and necessary, recording source and access date; mark unavailable evidence unverified.

## Workflow
1. Identify the real problem, scope, stakeholders, constraints, decision drivers, evidence, and review deadline.
2. Find related ADRs and determine whether to create, amend, supersede, or leave unchanged.
3. Compare viable alternatives, including status quo, with benefits, costs, risks, reversibility, compatibility, operational impact, and evidence.
4. Record status, date, context, drivers, options, decision, rationale, positive/negative consequences, risks, validation, and review conditions.
5. Preserve repository naming, location, numbering, links, language, and template. If none exists, use `assets/adr-template.md`.
6. Modify only the ADR or architecture index explicitly in scope. Report assumptions, unresolved questions, confidence, and implementation handoff without executing it.

# Output Contract
1. Target ADR path and action
2. Evidence and related decisions
3. Status, date, context, and decision drivers
4. Options and tradeoffs
5. Decision and rationale, or Proposed recommendation
6. Consequences, risks, confidence, validation, and review conditions
7. Unknowns and implementation handoff

# 简体中文

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 架构决策记录

仅在用户明确授权架构文档修改时创建或更新一个 ADR，不修改业务代码。

## 职责边界
- 需求交给 `requirements-to-spec`，实施顺序交给 `safe-change-plan`，技术风险交给相应专项 Skill。
- 写入前搜索现有 ADR 目录、索引、编号、状态词、模板和替代规则。
- 不得把提案写成已接受共识；没有批准证据时使用 `Proposed`。
- 仅在允许且必要时使用官方标准，记录来源和访问日期；不可访问时标为未验证。

## 工作流程
1. 识别真实问题、范围、利益相关者、约束、决策驱动、证据和复审时间。
2. 查找相关 ADR，判断创建、修订、替代或保持不变。
3. 比较可行候选及维持现状，覆盖收益、成本、风险、可逆性、兼容性、运维影响和证据。
4. 记录状态、日期、背景、驱动、方案、决策、理由、正负后果、风险、验证和复审条件。
5. 保留仓库命名、目录、编号、链接、语言和模板；不存在时使用 `assets/adr-template.md`。
6. 只修改范围内 ADR 或架构索引，报告假设、未决问题、置信度和实施转交，不执行实施。

# 输出契约
1. 目标 ADR 路径与动作
2. 证据与相关决策
3. 状态、日期、背景与决策驱动
4. 候选方案与权衡
5. 决策与理由，或 Proposed 建议
6. 后果、风险、置信度、验证与复审条件
7. 未知项与实施转交
