---
name: feature-implementation
description: "Implement an explicitly authorized feature from a settled specification or dependency-ordered work items, delivering and validating one observable behavior slice at a time. Use for new feature delivery across related production code, tests and docs; not vague requirements, a diagnosed local fix, test-only or docs-only edits, broad refactoring, or release actions. 根据已确认规格或有依赖顺序的工作项，在明确授权范围内逐个交付并验证可观察行为切片。用于涉及相关生产代码、测试和文档的新功能实施；不用于模糊需求、已诊断局部修复、仅测试或仅文档修改、大规模重构及发布动作。"
---

# Feature Implementation（功能实施）

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

Default to `standard`; bounded natural-language invocation is allowed.
Complete one primary task by default. Continue an authorized end-to-end workflow within each Skill's permissions; Router remains recommendation-only. Pause for new material decisions or scope, not authorization already given.
For authorized multi-stage work, evidence reuse or recovery, read `references/workflow-coordination.en.md`; optionally use `references/workflow-coordination.mjs` and `references/workflows.yaml`. Provide manual handoff when host execution is unavailable.
For a human-only blocker, give location, action, success signal and resume step; never request secret values or assume completion.
Validate according to actual risk; security, production, migrations, releases and other high-risk work use `audit`. Read `references/execution-modes.en.md` only when mode selection is unclear.

# Feature Implementation

For authorized workflow continuation, evidence reuse or recovery, read `references/workflow-coordination.en.md`; preserve this Skill's own scope and permissions.

Deliver a settled feature within the user's authorized scope, one verifiable behavior slice at a time.

## Boundary

- Require a settled specification or work items, known impact, acceptance criteria and write scope. Reuse reliable evidence and existing authorization; do not demand separate documents or repeated approval. Route material open decisions to `requirements-clarification`, unknown impact to `change-impact-analysis`, and missing sequencing to `safe-change-plan`.
- A diagnosed local defect belongs to `safe-fix-implementation`; test-only and docs-only edits belong to `safe-test-implementation` and `documentation-sync`.
- Preserve existing changes. Edit production code and supporting tests/docs only within authorization. Do not install dependencies, access the network, run migrations, change production data, commit, push, publish, or perform unrelated refactors.
- Inspect command definitions and transitive hooks before running local validation. Block commands with prohibited or unknown side effects; never substitute script inspection for execution evidence.

## Workflow

1. Map acceptance criteria to dependency-ordered behavior slices, affected files and focused checks. Reuse an adequate existing plan; do not expand a small feature into a mandatory planning pipeline.
2. For the next slice, inspect code, tests, current file baselines and preexisting edits. Identify permission/business behavior to preserve and verify applicable existing-data update semantics. When authoring tests, read `references/testing-contract.en.md` bundled with this Skill; no separate Skill installation is required. This Skill owns authorized production and supporting test changes in the cycle.
3. Recheck targets and edited regions and protect preexisting/concurrent changes before writing. Implement the smallest complete behavior and its authorized supporting tests/docs. Honor the selected test mode; do not create all future tests or speculative abstractions first.
4. Establish actual resource isolation and command side effects before running the focused check and recording its result. Unknown isolation blocks that command. Resolve in-scope failures before the next dependent slice. Mark missing tools, unsafe commands and unrun checks as unverified or blocked, not passed; continue independent authorized work when useful.
5. Repeat until all in-scope acceptance criteria are implemented and verified, or a named blocker prevents completion. Pause for new material decisions, scope expansion or human-only prerequisites; preserve completed slices for resumption.
6. Inspect the final diff against acceptance criteria and use `safe-code-review` when the user authorized the full delivery/review flow. State whether review was performed; passing tests do not prove a clean review. Run only the necessary regression scope; existing valid evidence need not be rerun without a relevant change.
7. Return the acceptance-to-evidence map. Completion requires all in-scope behavior delivered, relevant checks passed and no blocking review finding; otherwise state partial/blocked status and the exact remaining work. Passing local checks is not release approval.

Read [execution boundaries](references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Explicit user-directed deferred verification is an exception to the per-slice test schedule and test-first execution timing above. Apply the execution-boundary deferral protocol, record changes as implemented with verification deferred, and do not claim verified completion.

Before a separate test-gap pass, map acceptance criteria to current tests and valid execution evidence. Reuse sufficient coverage evidence; request a separate analysis or test change only for missing, stale or unknown coverage. When verification is deferred, retain the pending coverage check instead of reporting coverage as proven.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.

# Output Contract

State complete, partial or blocked, then list delivered behavior with changed paths and acceptance/check evidence. Include remaining failures, unverified criteria and the smallest resume action only when present. Distinguish observed results from proposed checks. Keep routine output compact; expand per-slice commands, risks and evidence on request or in audit mode.

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

默认使用 `standard`；允许边界明确的自然语言隐式调用。
默认完成一个主任务。用户已授权完整流程时，在各 Skill 权限内连续完成；Router 仍只推荐。新重大决策或超出授权时暂停，不重复索取已有授权。
仅在已授权多阶段协作、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`；按需使用 `references/workflow-coordination.mjs` 和 `references/workflows.yaml`，宿主不支持执行时提供人工交接。
必须由用户完成的阻塞步骤：给出操作位置、具体动作、成功标志、恢复步骤；不要求粘贴秘密值，不代替用户确认完成。
按实际风险选择验证；安全、生产、迁移、发布等高风险工作使用 `audit`。模式不明确时才读取 `references/execution-modes.zh-CN.md`。

# 功能实施

仅在已授权流程续接、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`，保持本 Skill 自身范围和权限。

在用户授权范围内实施已确认功能，一次交付一个可验证的行为切片。

## 职责边界

- 需要已确认规格或工作项、已知影响、验收条件和写入范围。复用可靠证据及已有授权，不强制另建文档或重复审批。重大未决项交给 `requirements-clarification`，未知影响交给 `change-impact-analysis`，缺少实施顺序交给 `safe-change-plan`。
- 已诊断的局部缺陷使用 `safe-fix-implementation`；仅测试或仅文档修改使用 `safe-test-implementation`、`documentation-sync`。
- 保护已有改动，仅在授权范围内修改生产代码及配套测试/文档。不安装依赖、不联网、不执行迁移、不修改生产数据、不 commit/push/发布，也不做无关重构。
- 执行本地验证前检查命令定义及间接钩子。禁止或副作用未知的命令标记阻塞，读取脚本不能替代执行证据。

## 工作流程

1. 将验收条件映射为按依赖排序的行为切片、影响文件和定向检查。已有计划足够时直接复用，不把小功能扩展成强制规划流水线。
2. 检查下一切片的代码、测试、当前文件基线及已有改动，明确必须保留的权限/业务行为，核对适用的数据更新语义。编写测试时读取随本 Skill 分发的 `references/testing-contract.zh-CN.md`，无需另行安装其他 Skill。本 Skill 负责循环内已授权的生产代码与配套测试修改。
3. 写入前复核目标和待改区块，保护已有/并发修改；实施最小完整行为及已授权的配套测试/文档，遵守所选测试模式，不先批量编写未来测试或推测性抽象。
4. 先确认实际资源隔离及命令副作用，再运行定向检查，记录真实结果。隔离未知时阻塞该命令。下一依赖切片开始前先处理范围内失败。工具缺失、不安全命令或未运行检查标记未验证或阻塞，不写成通过；有用时继续独立且已授权的工作。
5. 重复至范围内全部验收条件完成验证，或被明确阻塞项挡住。出现新重大决策、范围扩张或必须人工完成的前置步骤时暂停相关工作，保留已完成切片便于续接。
6. 核对最终 diff 与验收条件；用户已授权完整交付/审查流程时使用 `safe-code-review`。注明是否实际完成审查，测试通过不代表审查无问题。只运行必要回归，相关内容未变时不重复已有有效验证。
7. 输出验收—证据映射。仅当范围内行为全部交付、相关检查通过且无阻塞审查问题时标记完成；否则明确部分完成/阻塞和剩余工作。本地检查通过不等于批准发布。

读取[执行边界](references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

用户明确要求延期验证时，作为上述逐切片测试及 test-first 执行时序的例外，遵循执行边界中的延期协议。将改动记录为已实施、验证延期，不声明验证完成。

进入独立测试缺口阶段前，将验收项映射到当前测试和有效执行证据。已有充分覆盖证据直接复用，仅对缺失、过期或未知覆盖进行独立分析或测试修改。延期验证时保留待检查项，不将覆盖声明为已证实。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。

# 输出契约

先给完成、部分完成或阻塞状态，再列交付行为、修改路径及验收/检查证据。有剩余失败、未验证条件或恢复动作时才补充，区分实际结果与建议检查。日常输出简洁；用户要求或 audit 模式再展开逐切片命令、风险和证据。

用户要求延期检查时，输出 `verification_status: verification_deferred`、指令来源及待验证验收项/检查映射，区分已实施改动与已验证交付。

仅在相关时简述保留的权限/业务行为、已有数据更新依据、验证目标/隔离或未运行原因，以及已有/并发改动保护情况。未解决安全缺口或编辑冲突使受影响工作保持阻塞/部分完成。省略不适用字段，保留延期验证状态。
