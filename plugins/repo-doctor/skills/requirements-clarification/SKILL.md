---
name: requirements-clarification
description: Resolve the material product, behavior, compatibility, data, permission, security, migration, and acceptance decisions that remain open before specification or implementation. Use when a request contains consequential ambiguity; inspect repository evidence before asking one focused question at a time, then produce a clarification summary for requirements-to-spec. Do not use for an already clear small change, write the final specification, edit long-term documentation, or implement code. 在规格化或实施前，关闭仍未确定且会实质影响产品、行为、兼容性、数据、权限、安全、迁移和验收的决策。用于存在关键歧义的需求；先检查仓库证据，再一次聚焦一个问题，最终生成交给 requirements-to-spec 的澄清摘要。已清楚的小改动不使用，也不生成最终规格、不修改长期文档或实施代码。
---

# Requirements Clarification（需求决策澄清）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

# Requirements Clarification

Close only the decisions whose answers can materially change scope, behavior, compatibility, security, data handling, migration, or acceptance. Stop before specification authoring or implementation.

## Boundary

- Read user-provided material and relevant repository files before asking. Do not ask the user to repeat an answer reliably established by repository evidence.
- Stay read-only. Do not edit code, tests, configuration, ADRs, documentation, or task systems.
- Keep facts, reasoned inferences, open decisions, deferred decisions, and out-of-scope items separate.
- Do not manufacture a long questionnaire for a simple, explicit, low-risk change.
- Recommend `architecture-decision-record` for a durable hard-to-reverse design decision and `documentation-sync` for confirmed documentation drift; never overwrite long-term documentation without explicit authorization.

## Workflow

1. Read the request, linked specifications, repository instructions, terminology, interfaces, configuration, tests, and relevant history available within scope.
2. Build a decision ledger with five states: `confirmed`, `inferred`, `open`, `deferred`, and `out_of_scope`. Cite the source of confirmed facts and the basis of each inference.
3. Check target users, core business behavior, inputs and outputs, failures and boundaries, permissions, data sources, compatibility, performance, security, migration, tests and acceptance, exclusions, and unresolved questions.
4. Normalize domain language: detect vague terms, synonyms, and overloaded words; prefer established repository terminology; define each necessary new term briefly. Do not silently rename project concepts.
5. Rank open decisions by impact, risk, reversibility, and dependency. Ask only the highest-value unresolved question in the current turn.
6. Make the question concrete. Offer a recommended option and concise trade-offs among viable alternatives. Do not ask a choice that repository evidence already resolves.
7. After each answer, update the ledger, state what changed, and select the next material decision.
8. Stop asking when remaining unknowns cannot materially change scope, external behavior, compatibility, security, data boundaries, migration, or acceptance. Mark non-blocking unknowns `deferred` rather than pretending they are resolved.
9. Produce a Requirements Clarification Summary for `requirements-to-spec`, including terminology, constraints, acceptance direction, and all five decision states. Do not enter implementation.

## Completion and Failure Conditions

Complete when no `open` decision can materially alter the implementation contract. Stop as blocked when essential evidence is unavailable, the user declines a required decision, or two authoritative sources conflict. A clear small request may complete immediately with a short ledger and no questions.

# Output Contract

1. Goal and target users
2. Repository evidence consulted
3. Domain terms and definitions
4. `confirmed`
5. `inferred`, with rationale and confidence
6. `open`, ranked by material impact
7. `deferred`, with revisit condition
8. `out_of_scope`
9. Behavior, input/output, failure, data, permission, compatibility, performance, security, migration, testing, and acceptance decisions
10. Current focused question, recommended option, and trade-offs, when a material decision remains
11. Completion status and a copyable handoff to `requirements-to-spec`

Do not present an inference as a fact or begin implementation.

---

# Requirements Clarification（需求决策澄清）

只关闭会实质改变范围、行为、兼容性、安全、数据处理、迁移或验收的决策；在规格编写或实施前停止。

## 职责边界

- 提问前先阅读用户材料和相关仓库文件；仓库证据能够可靠回答的问题，不再要求用户重复。
- 保持只读，不修改代码、测试、配置、ADR、文档或外部任务系统。
- 明确区分事实、合理推断、开放决策、延期决策和范围外事项。
- 对简单、明确、低风险的小改动，不制造冗长问卷。
- 难以逆转的长期设计决定推荐 `architecture-decision-record`，已确认的文档漂移推荐 `documentation-sync`；没有明确授权不得覆盖长期文档。

## 工作流程

1. 阅读需求、关联规格、仓库指令、术语、接口、配置、测试，以及范围内可用历史。
2. 建立五态决策台账：`confirmed`、`inferred`、`open`、`deferred`、`out_of_scope`；确认事实注明来源，推断注明依据。
3. 检查目标用户、核心业务行为、输入输出、异常边界、权限、数据来源、兼容性、性能、安全、迁移、测试验收、排除项和未决问题。
4. 规范领域语言：识别模糊词、同义词和同词多义；优先使用项目已有术语；必要的新术语给出简洁定义，不擅自重命名项目概念。
5. 按影响、风险、可逆性和依赖关系排列开放决策；当前轮次只询问价值最高的一个问题。
6. 问题必须具体，给出推荐选项和可行替代的简洁取舍；仓库证据已解决的选择不得再问。
7. 用户每次回答后更新台账，说明变化，再选择下一个关键决策。
8. 剩余未知不会实质改变范围、外部行为、兼容性、安全、数据边界、迁移或验收时停止提问；非阻塞未知标为 `deferred`，不得假装已解决。
9. 生成交给 `requirements-to-spec` 的需求澄清摘要，包含术语、约束、验收方向和全部五类状态；不进入实现。

## 完成与失败条件

没有任何 `open` 决策会实质改变实现契约时完成。关键证据缺失、用户拒绝必要决定或两个权威来源冲突时，标记阻塞并停止。清楚的小需求可以用简短台账直接完成，无需提问。

# 输出契约

1. 目标与目标用户
2. 已查阅仓库证据
3. 领域术语与定义
4. `confirmed`
5. `inferred`，附依据和置信度
6. `open`，按实质影响排序
7. `deferred`，附重新讨论条件
8. `out_of_scope`
9. 行为、输入输出、异常、数据、权限、兼容性、性能、安全、迁移、测试和验收决策
10. 仍有关键决策时，给出当前聚焦问题、推荐选项和取舍
11. 完成状态及可复制给 `requirements-to-spec` 的交接摘要

不得把推断写成事实，也不得开始实施。
