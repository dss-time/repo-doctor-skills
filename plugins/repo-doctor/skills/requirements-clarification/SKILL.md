---
name: requirements-clarification
description: "Clarify material product, behavior, data, permission, compatibility, migration, and acceptance decisions or turn settled requirements into a testable specification. Select clarification or specification phase from evidence and the requested outcome, skipping interviews for settled decisions. Use fast, standard, or documented output. Specification stays read-only and optional documented clarification edits require path-scoped authorization. Do not implement code or rework a complete specification without a requested change. 澄清产品、行为、数据、权限、兼容、迁移和验收的重要决策，或把已确认需求整理成可测试规格。依据证据和目标选择 clarification 或 specification 阶段，已确认决策跳过访谈。可选 fast、standard、documented 输出。规格阶段保持只读，documented 澄清阶段可选文档修改需要路径级授权。不实施代码，也不在没有修订需求时重做完整规格。"
---

# Requirements Clarification and Specification（需求澄清与规格化）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Permission Contract

These capability limits come from Skill metadata, not user authorization. Allowed capabilities remain subject to the user's authorized scope and stricter conditions in the instructions.
- Read files: only within authorized scope and this Skill's conditions.
- Write or modify files: only within authorized scope and this Skill's conditions.
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

# Requirements Clarification and Specification

Every question must close a named decision. Discover repository facts, let the user decide product choices, and reuse confirmed decisions directly in the specification.

## Phase selection

- `clarification`: use an evidence-first decision-tree interview when material product, behavior, data, security, permission, compatibility, migration, or acceptance decisions remain open.
- `specification`: produce an implementable, testable specification directly when material decisions are already closed and the user needs settled discussion or clarification results organized.
- Declare `phase`. Skip the interview when material decisions are closed. A clarification-only request ends with a decision summary. Continue to specification only when the user requests complete requirements preparation or a specification.
- When a complete specification already exists and needs no clarification or revision, route to `change-impact-analysis`, `safe-change-plan`, or an already authorized implementation workflow.

## Output modes

- `fast` (default): show only facts, conclusions, and unknowns needed for the current decision or specification, without a minimum question count.
- `standard`: cover goal, non-goals, users, current/expected behavior, business rules, data boundary, exceptional paths, compatibility, migration, and acceptance.
- `documented`: add terminology and ADR checks to standard. Optional domain-document synchronization is permitted only during clarification with explicit path-scoped write authorization. The specification phase stays read-only in every mode and returns its specification only in the response.

Do not silently change output mode. Phase selection and output mode are independent dimensions.

## Permission and scope boundary

- Read user material, related repository files, and confirmed decisions before asking. Do not ask the user to repeat answers established by repository evidence.
- Never edit code, tests, configuration, external tasks, or production data. Do not invoke Shell or access the network.
- Keep fast, standard, and the specification phase read-only. Before a documented-mode edit, inspect repository rules and the target file, preserve structure, and record reason and evidence.
- Route new durable architecture decisions to `architecture-decision-record` and general documentation drift to `documentation-sync`.
- Separate facts, inferences, open decisions, deferred decisions, and out-of-scope items. Existing code does not prove the user approved a requirement.
- Route settled feature delivery to `feature-implementation` and diagnosed local repairs to `safe-fix-implementation`. This Skill never implements.

## Clarification phase

1. Read the request, linked specifications, repository instructions, terminology, interfaces, configuration, tests, and relevant available history.
2. Build a ledger of `confirmed`, `inferred`, `open`, `deferred`, and `out_of_scope`, citing fact sources and inference basis and confidence.
3. Build a question tree only for actual unresolved decisions, recording decision, impact, dependencies, answer source, and applicable branches.
4. Verify repository facts first, then rank user choices by impact, risk, reversibility, and dependency. In fast, select at most five highest-gain branches.
5. Handle one branch at a time. Ask one concrete question with a recommendation and trade-offs, wait for the answer, then update the ledger. Do not enter a dependent branch until the current branch is resolved or explicitly deferred.
6. In standard and documented, cover the complete decision surface. In documented, record terminology and ADR conflicts separately without silently renaming concepts.
7. Complete clarification when material decisions are closed, marking lesser unknowns deferred with revisit conditions. If the user already requested a specification, reuse the ledger and enter specification.

## Specification phase

1. Cite settled discussion, a clarification ledger, or authoritative source and verify material decisions are already closed, including when entering this phase directly.
2. Reuse confirmed goals, users, business rules, and constraints. Use repository evidence for current behavior, desired behavior, and measurable success criteria.
3. Define scope, exclusions, dependencies, non-blocking assumptions, deferred items, and unknown evidence. Give each assumption confidence and a verification method.
4. Describe normal, exceptional, boundary, permission, compatibility, and migration requirements. Write acceptance criteria using Given/When/Then or equally observable conditions.
5. Recheck open decisions. If a material unknown changes the contract, stop specification work and return to clarification for that decision rather than presenting it as a non-blocking assumption.
6. Return the specification only in the response. Do not append a file-by-file implementation plan. Route delivery slices or code steps to `safe-change-plan`, and unknown impact to `change-impact-analysis`.

## Completion and stop conditions

Clarification completes when material decisions are closed and the ledger has evidence. Specification completes when desired behavior, scope, constraints, and testable acceptance are complete with no material open decisions.
Block affected work when essential evidence is missing, the user declines a required choice, authoritative sources conflict, or an optional documentation edit lacks authorization. State the minimum input needed. Do not interview a complete specification or a simple explicit request, and never ask questions to meet a quota.

Read [execution boundaries](references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.

# Output Contract

Lead with `status`, `phase`, output mode, current conclusion, and remaining decisions. Return the requested phase, recording shared facts and the ledger once.

## Clarification output

- `fast` returns relevant facts, inferences, evidence, and current unresolved nodes, omitting resolved branches.
- `standard` returns goal, non-goals, users, current/expected behavior, rules, data boundary, exceptional paths, compatibility, migration, acceptance, question tree, and a ledger of `confirmed`, `inferred`, `open`, `deferred`, and `out_of_scope`.
- `documented` adds terminology/ADR evidence, conflicts, authorization state, and the reason and evidence for authorized documentation edits.

Ask one question with a recommendation and trade-offs only while a material decision remains open. If specification was not requested, finish clarification with a compact decision summary. If specification was requested, reuse the ledger and continue without repeating the interview.

## Specification output

1. Settled source and evidence.
2. Target users, goals, current behavior, and desired behavior.
3. Scope, exclusions, constraints, and dependencies.
4. Normal, exceptional, boundary, permission, compatibility, and migration requirements.
5. Non-blocking assumptions, confidence, verification methods, deferred items, and unknown evidence.
6. Testable acceptance criteria using Given/When/Then or equally observable conditions.
7. Risks, completion status, and necessary next action.

Fast still covers applicable essential requirements, combining fields concisely. Standard and documented expand evidence. Specification returns only in the response, without file writes or a file-by-file implementation plan. Reopened material decisions mean specification is incomplete and returns to clarification.

---

## 权限契约

以下能力边界来自 Skill 元数据，不构成用户授权；允许的能力仍须遵守用户授权范围和正文中更严格的条件。
- 读取文件：仅限已授权范围及本 Skill 的条件内。
- 写入或修改文件：仅限已授权范围及本 Skill 的条件内。
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

# 需求澄清与规格化

每个问题必须关闭一个明确决策。仓库事实由探索获得，产品选择由用户决定，已确认决策在规格中直接复用。

## 阶段选择

- `clarification`：存在会改变产品、行为、数据、安全、权限、兼容、迁移或验收的重要未决选择时，进行证据优先的问题树访谈。
- `specification`：重大决策已经闭合，用户需要将讨论或澄清结果整理为可实施、可测试的规格时，直接输出规格。
- 声明所选 `phase`。重大决策已闭合时跳过访谈，不重新提问。只请求澄清时完成决策摘要即可。只有用户请求完整需求整理或规格时才继续规格化。
- 已有完整规格且没有澄清或修订需求时，交给 `change-impact-analysis`、`safe-change-plan` 或已有授权的实施流程。

## 输出模式

- `fast`（默认）：只展示本次决策或规格所需的事实、结论和未知项，不设最低问题数量。
- `standard`：完整覆盖目标、非目标、用户、当前/期望行为、业务规则、数据边界、异常路径、兼容、迁移和验收。
- `documented`：在 `standard` 基础上核对术语与 ADR。只有 clarification 阶段获得精确到路径的写授权后，才可选择性同步领域文档。specification 阶段在所有模式下保持只读，规格只在当前响应中输出。

不得静默切换输出模式。阶段选择与输出模式是独立维度。

## 权限与职责边界

- 提问前先阅读用户材料、相关仓库文件和已确认决策，仓库证据能回答的问题不再要求用户重复。
- 不修改代码、测试、配置、外部任务或生产数据，不调用 Shell，不联网。
- `fast`、`standard` 和 specification 阶段保持只读。documented 模式的文档写入先检查仓库规范和目标文件，保留结构，记录原因和证据。
- 新增长期架构决策交给 `architecture-decision-record`，一般文档漂移交给 `documentation-sync`。
- 事实、推断、开放决策、延期决策和范围外事项分别记录。不得从现有代码反推用户已经批准的需求。
- 已确认功能交给 `feature-implementation`，已诊断局部修复交给 `safe-fix-implementation`。本 Skill 不执行实施。

## 澄清阶段

1. 阅读需求、关联规格、仓库指令、术语、接口、配置、测试和范围内可用历史。
2. 建立 `confirmed`、`inferred`、`open`、`deferred`、`out_of_scope` 五态台账，事实注明来源，推断注明依据与置信度。
3. 只为真实未决决策建立问题树，记录决策、影响、依赖、答案来源和适用分支。
4. 先验证仓库事实，再按影响、风险、可逆性和依赖排列用户选择。fast 最多选择五个最高信息增益分支。
5. 一次处理一个分支，问一个具体问题并给推荐和取舍，等待答案后更新台账。当前分支未解决或未明确延期前，不进入依赖分支。
6. standard 与 documented 覆盖完整决策面。documented 单独记录术语和 ADR 冲突，不擅自重命名概念。
7. 重大决策全部闭合时完成澄清，较小未知标为 deferred 并附重新讨论条件。用户已请求规格时，复用台账进入 specification 阶段。

## 规格阶段

1. 引用已定稿讨论、澄清台账或正式来源，确认重大决策已经闭合。直接从本阶段进入时也执行该检查。
2. 复用已确认目标、用户、业务规则和约束，结合仓库证据说明当前行为、目标行为及可衡量成功标准。
3. 明确范围内、范围外、依赖、非阻塞假设、延期事项和未知证据。每个假设包含置信度和验证方式。
4. 描述正常、异常、边界、权限、兼容和迁移要求，以 Given/When/Then 或等价可观察结构编写验收标准。
5. 再检查开放决策。出现会改变契约的重要未知时停止规格化，返回 clarification 阶段处理该决策，不把它包装为非阻塞假设。
6. 完整规格只在当前响应输出。不要附逐文件实施计划。需要交付切片或代码步骤时转给 `safe-change-plan`，影响未知时转给 `change-impact-analysis`。

## 完成与停止条件

clarification 在重大决策闭合且台账有证据时完成。specification 在目标行为、范围、约束及可测试验收齐全且没有重大开放决策时完成。
关键证据缺失、用户拒绝必要选择、权威来源冲突或可选文档改动缺少授权时，阻塞相关工作并说明最小所需输入。已有完整规格或简单明确请求不启动访谈，不为凑问题而提问。

读取[执行边界](references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。

# 输出契约

先给出 `status`、`phase`、输出模式、当前结论和仍需解决的决策。按用户本次请求输出对应阶段，共享事实和台账只记录一次。

## 澄清输出

- `fast` 输出相关事实、推断、证据和当前未决节点，省略已解决分支。
- `standard` 输出目标、非目标、用户、当前/期望行为、规则、数据边界、异常路径、兼容、迁移、验收和问题树，以及 `confirmed`、`inferred`、`open`、`deferred`、`out_of_scope` 台账。
- `documented` 增加术语/ADR 证据、冲突、写权限状态和已授权文档改动的原因与证据。

重大决策未闭合时只问一个有推荐和取舍的问题。澄清完成且用户未请求规格时，以简短决策摘要结束。已请求规格时复用台账继续，不重新访谈。

## 规格输出

1. 已定稿来源和证据。
2. 目标用户、目标、当前行为和目标行为。
3. 范围、排除项、约束和依赖。
4. 正常、异常、边界、权限、兼容和迁移要求。
5. 非阻塞假设、置信度、验证方式、延期项和未知证据。
6. 可测试验收标准，使用 Given/When/Then 或等价可观察条件。
7. 风险、完成状态和必要下一步。

fast 仍须涵盖适用的必要要求，可合并表达。standard 和 documented 展开证据。规格阶段只在响应中输出，不写文件、不附逐文件实施计划。重大决策重新开放时标记未完成并返回澄清，不声称规格完成。
