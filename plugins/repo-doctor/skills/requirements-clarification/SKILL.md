---
name: requirements-clarification
description: "Close consequential product, behavior, data, permission, compatibility, and acceptance decisions through an evidence-first decision-tree interview. Use for a vague or disputed request before specification; choose fast, standard, or documented mode. Do not use when a testable specification already exists or to implement code. Automatic invocation is appropriate only when material ambiguity is evident; durable terminology or ADR edits require explicit write authorization. 通过证据优先的问题树访谈，关闭会影响产品、行为、数据、权限、兼容性和验收的重要决策。用于规格化前仍模糊或存在争议的需求，可选 fast、standard 或 documented 模式。已有可测试规格或需要实施代码时不使用；仅在明显存在重大歧义时适合自动调用，持久术语或 ADR 修改必须获得明确写权限。"
---

# Requirements Clarification（需求决策澄清）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Requirements Clarification

Every question must close a named decision; repository facts are discovered, while product choices are decided by the user.

## Modes

- `fast` (default): ask only the 3–5 unresolved questions with the highest information gain. Prefer choices that can change the solution direction. Keep the response short and never create or modify files.
- `standard`: close the full decision surface: goal, non-goals, users, current and expected behavior, business rules, data boundary, exceptional paths, compatibility, acceptance conditions, and open decisions.
- `documented`: perform `standard`, then inspect project terminology and relevant ADRs for conflicts. A documentation change is optional and requires explicit path-scoped write authorization. Record why each edit is necessary and which evidence supports it.

Do not silently change mode. Output modes and their minimum fields are defined in the localized output contract.

## Permission and scope boundary

- Read user-provided material and relevant repository files before asking. Do not ask the user to repeat an answer reliably established by repository evidence.
- Never edit code, tests, configuration, task systems, or production data.
- In `fast` and `standard`, stay read-only. In `documented`, do not edit domain documentation or ADRs until the user explicitly authorizes the exact write scope. A request to clarify requirements is not write authorization.
- Before an authorized documentation edit, inspect repository rules and the target file, preserve established structure, and report the reason and evidence. Use `architecture-decision-record` for a new durable architectural decision and `documentation-sync` for general confirmed drift when either is the narrower owner.
- Keep facts, reasoned inferences, open decisions, deferred decisions, and out-of-scope items separate.
- Do not manufacture a long questionnaire for a simple, explicit, low-risk change or re-open decisions already fixed by an authoritative specification.

## Decision-tree workflow

1. Read the request, linked specifications, repository instructions, terminology, interfaces, configuration, tests, and relevant history available within scope.
2. Create a decision ledger with `confirmed`, `inferred`, `open`, `deferred`, and `out_of_scope`. Cite sources for facts and the basis and confidence for inferences.
3. Build a question tree. Each node names the decision it resolves, why it matters, dependencies, answer source (`repository` or `user`), and child branches.
4. Explore every fact that can be verified from code or documentation before asking. Ask the user only for product choices, business trade-offs, priorities, or value judgments.
5. Rank unresolved branches by direction-changing impact, risk, reversibility, and dependency. In `fast`, select at most five highest-gain branches.
6. Work one branch at a time. Ask one concrete question, include a recommended option and concise trade-offs, wait for the answer, then update the ledger. Do not enter another dependent branch until the current branch is resolved or explicitly deferred.
7. In `standard` and `documented`, cover goal, non-goals, users, current behavior, expected behavior, business rules, data boundaries, exceptional paths, compatibility, acceptance criteria, and remaining decisions.
8. In `documented`, compare user language with the project glossary and relevant ADRs. Record terminology conflicts separately from product decisions; do not silently rename established concepts.
9. Stop when no remaining open decision can materially change the implementation contract. Mark lesser unknowns `deferred` with a revisit condition.
10. Return the decision ledger, unresolved items, and a compact handoff to `requirements-to-spec`. Do not implement.

## Stop conditions

Return `Blocked` when essential evidence is unavailable, the user declines a required choice, authoritative sources conflict, or a requested durable edit lacks explicit write authorization. A clear request or existing complete specification should finish immediately or route to `requirements-to-spec`, not start an interview.

# Output Contract

Lead with `status`, current conclusion, and the next decision.

- `fast`: mode, status, known repository facts, 3–5 highest-gain decision nodes, current question, and unresolved items. No file changes.
- `standard`: goal, non-goals, users, current/expected behavior, business rules, data boundary, exceptional paths, compatibility, acceptance criteria, decision tree, and ledger (`confirmed`, `inferred`, `open`, `deferred`, `out_of_scope`).
- `documented`: all `standard` fields plus terminology/ADR evidence, conflicts, write-authorization state, and each authorized document change with reason and evidence.

All modes finish with a compact handoff to `requirements-to-spec`. Keep the current question singular. Do not present an inference as fact or begin implementation.

---

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# Requirements Clarification（需求决策澄清）

每个问题都必须关闭一个明确决策：仓库事实由探索获得，产品选择由用户决定。

## 模式

- `fast`（默认）：只问信息增益最高的 3～5 个未决问题，优先处理会改变方案方向的选择；输出简短，绝不创建或修改文件。
- `standard`：完整关闭目标、非目标、用户、当前与期望行为、业务规则、数据边界、异常路径、兼容性、验收条件和未决决策。
- `documented`：在 `standard` 基础上检查项目术语和相关 ADR 的冲突。只有获得精确到路径的明确写权限后，才可选择性修改领域文档；每项改动必须记录原因和证据。

不得静默切换模式。各模式最小输出字段见本地化输出契约。

## 权限与职责边界

- 提问前先阅读用户材料和相关仓库文件；仓库证据能够可靠回答的问题，不再要求用户重复。
- 不修改代码、测试、配置、外部任务系统或生产数据。
- `fast` 和 `standard` 始终只读。`documented` 在用户明确授权具体写入范围前，不得修改领域文档或 ADR；“请澄清需求”本身不等于写权限。
- 获得文档写权限后，先检查仓库规范与目标文件，保持原有结构，并记录修改原因和支持证据。新增长期架构决策优先转给 `architecture-decision-record`，一般已确认文档漂移优先转给 `documentation-sync`。
- 明确区分事实、合理推断、开放决策、延期决策和范围外事项。
- 对简单、明确、低风险的小改动不制造长问卷，也不重新打开权威规格已经关闭的决策。

## 问题树流程

1. 阅读需求、关联规格、仓库指令、术语、接口、配置、测试，以及范围内可用历史。
2. 建立五态决策台账：`confirmed`、`inferred`、`open`、`deferred`、`out_of_scope`；事实注明来源，推断注明依据与置信度。
3. 建立问题树。每个节点写明要关闭的决策、重要性、依赖、答案来源（`repository` 或 `user`）及可能子分支。
4. 先从代码或文档验证所有可验证事实；只把产品选择、业务取舍、优先级和价值判断交给用户。
5. 按方案影响、风险、可逆性和依赖排列未决分支；`fast` 最多选择五个最高信息增益分支。
6. 一次只处理一个分支：提出一个具体问题，给出推荐项和简洁取舍，等待回答后更新台账；当前分支未解决或未明确延期前，不进入依赖分支。
7. `standard` 与 `documented` 必须覆盖目标、非目标、用户、当前行为、期望行为、业务规则、数据边界、异常路径、兼容性、验收条件和剩余决策。
8. `documented` 比对用户语言、项目词汇与相关 ADR；术语冲突与产品决策分别记录，不擅自重命名已有概念。
9. 剩余开放决策不会实质改变实现契约时停止；较小未知标为 `deferred` 并注明重新讨论条件。
10. 输出决策台账、未决项及交给 `requirements-to-spec` 的简洁摘要；不进入实施。

## 停止条件

关键证据缺失、用户拒绝必要选择、权威来源冲突，或请求持久文档改动但没有明确写权限时，返回 `Blocked`。需求已经清楚或已有完整规格时，应直接完成简短台账或转给 `requirements-to-spec`，不要重新访谈。

# 输出契约

先给 `status`、当前结论和下一项决策。

- `fast`：模式、状态、仓库已知事实、3～5 个最高信息增益决策节点、当前问题和未决项；不得修改文件。
- `standard`：目标、非目标、用户、当前/期望行为、业务规则、数据边界、异常路径、兼容性、验收条件、问题树，以及 `confirmed`、`inferred`、`open`、`deferred`、`out_of_scope` 台账。
- `documented`：包含全部 `standard` 字段，并增加术语/ADR 证据、冲突、写权限状态，以及每项获授权文档改动的原因和证据。

所有模式最后给出交给 `requirements-to-spec` 的简洁摘要。当前问题必须只有一个。不得把推断写成事实，也不得开始实施。
