---
name: decision-prototype
description: "Explicit-invocation Skill for building the smallest disposable logic or UI prototype that answers one design, interaction, state, or business-rule question and returns a supported, rejected, or uncertain verdict. Use when runnable evidence is needed before formal implementation; file writes and commands require explicit authorization. Never connect production systems or treat prototype code as production-ready. 仅显式调用：构建最小且可丢弃的逻辑或 UI 原型，回答一个设计、交互、状态或业务规则问题，并给出成立、否定或仍不确定的结论。用于正式实施前需要可运行证据的场景；写文件和运行命令必须明确授权。绝不连接生产系统，也不把原型代码视为生产完成。"
---

# English

## Execution Contract

Default to `standard`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Decision Prototype

A prototype is useful only when one declared question can change the next decision.

## Branches and output modes

- `logic-prototype`: exercise business rules, data shapes, or state transitions through a small runnable interface.
- `ui-prototype`: expose materially different information structures or interactions for visual comparison.
- `fast`: question, criterion, branch, run instruction, verdict, and disposition.
- `standard` (default): add authorized location, key states, evidence, limitations, and production handoff.
- `audit`: add permission record, command preflight/ledger, changed files, isolation evidence, and all uncertainties.

Read `references/prototype-checklist.en.md` only when designing states, deciding isolation, or preparing audit evidence.

## Permission and production boundary

- Require explicit authorization for the prototype file paths and every shell command. A request to explore an idea does not authorize writes.
- Inspect repository instructions, framework, existing task runner, routing, component system, and safe scratch conventions before choosing a location.
- Mark every artifact `NON-PRODUCTION PROTOTYPE`. Do not present it as tested, hardened, accessible, secure, maintainable, or complete production code.
- By default do not connect a production database, use real credentials, send real external requests, mutate production data, deploy, publish, commit, or delete files.
- Use in-memory state, synthetic public-safe data, and local stubs. If the question genuinely concerns persistence or an external dependency, stop for a separately approved non-production environment and data boundary.
- Never install a dependency without explicit authorization. Prefer the existing runtime and components.
- Do not automatically delete prototype files. Recommend deletion, retention as evidence, or formal reimplementation; execute deletion only on a separate explicit request.
- Production work must move to `requirements-to-spec`, `safe-change-plan`, or `safe-fix-implementation` with appropriate authorization.

## Workflow

1. State one validation question in a form the prototype can answer. Split or defer every second question.
2. Define observable success criteria and what would count as rejection or uncertainty.
3. Select `logic-prototype` or `ui-prototype` from the evidence, and state the choice.
4. Inspect repository rules and confirm the explicitly authorized file location, command scope, and non-production isolation.
5. Build the least code that is runnable and sufficient to exercise the criterion. Reuse existing tooling; avoid abstraction, polish, broad error handling, and unrelated cleanup.
6. Surface the key states and results. Logic prototypes show inputs, transitions, and outcomes; UI prototypes show the materially different states or directions needed to decide.
7. Run only preflighted commands and record observed results. Do not infer a successful run from compilation or appearance alone.
8. Compare evidence with the success criteria and record the decision.
9. Return exactly one verdict: `supported`, `rejected`, or `uncertain`, with the evidence and remaining unknowns.
10. Recommend `delete`, `retain_as_evidence`, or `reimplement_for_production`. Never equate keeping the prototype with production completion.

## Stop conditions

Return `Blocked` for missing write authorization, unsafe location, unavailable runtime, required production access, real credentials/data, unapproved dependency installation, destructive cleanup, or a validation question too broad to answer with a minimal prototype.

# Output Contract

Lead with `status`, validation question, verdict, and recommended disposition.

1. `prototype_type`: `logic-prototype` or `ui-prototype`
2. `output_mode`: `fast`, `standard`, or `audit`
3. Single validation question and success/rejection criteria
4. Authorized location and `NON-PRODUCTION PROTOTYPE` marker
5. Key states, inputs, directions, and runnable command or interaction
6. Changed files and observed result
7. Verdict: `supported`, `rejected`, or `uncertain`
8. Evidence, limitations, and unresolved uncertainty
9. Production isolation and credential/data status
10. Disposition: `delete`, `retain_as_evidence`, or `reimplement_for_production`
11. Recommended next Repo Doctor Skill

Audit mode also includes exact permission and command ledgers. Never describe the prototype as production-ready.

# 简体中文

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# Decision Prototype（决策原型验证）

只有一个明确问题能够改变下一决策时，原型才有价值。

## 分支与输出模式

- `logic-prototype`：通过小型可运行接口验证业务规则、数据形态或状态转换。
- `ui-prototype`：展示结构或交互上有实质差异的方向，以便比较。
- `fast`：问题、判据、分支、运行指令、结论和处置建议。
- `standard`（默认）：增加授权位置、关键状态、证据、限制和生产交接。
- `audit`：增加权限记录、命令预检/账本、改动文件、隔离证据和全部不确定项。

设计状态、判断隔离方式或准备 audit 证据时，才读取 `references/prototype-checklist.zh-CN.md`。

## 权限与生产边界

- 原型文件路径和每条 Shell 命令都需要明确授权；“探索这个想法”本身不等于写权限。
- 选择位置前检查仓库指令、框架、现有任务运行器、路由、组件体系和安全 scratch 约定。
- 每个产物都标记 `NON-PRODUCTION PROTOTYPE`。不得声称原型已经达到生产所需的测试、加固、无障碍、安全、可维护或完成状态。
- 默认不连接生产数据库、不使用真实凭证、不发送真实外部请求、不修改生产数据，也不部署、发布、commit 或删除文件。
- 使用内存状态、公开安全的合成数据和本地 stub。问题确实涉及持久化或外部依赖时，停止并要求单独批准非生产环境和数据边界。
- 未经明确授权不安装依赖，优先复用现有运行时与组件。
- 不自动删除原型文件。只建议删除、作为证据保留或正式重写；删除必须另行明确授权。
- 进入生产实施必须转给 `requirements-to-spec`、`safe-change-plan` 或 `safe-fix-implementation` 并重新确认权限。

## 工作流程

1. 写明一个可由原型回答的验证问题；第二个问题必须拆分或延期。
2. 定义外部可观察的成功判据，以及何时算否定或仍不确定。
3. 根据证据选择 `logic-prototype` 或 `ui-prototype`，并声明选择。
4. 检查仓库规则，确认明确授权的文件位置、命令范围和非生产隔离。
5. 使用最少代码构建可运行且足以检验判据的原型；复用现有工具，不做抽象、打磨、广泛异常处理或无关清理。
6. 展示关键状态和结果。逻辑原型展示输入、转换和输出；UI 原型展示决策所需的实质差异状态或方向。
7. 只运行经过预检的命令并记录观察结果；不得仅凭编译或外观推断运行成功。
8. 把证据与成功判据对照，记录验证结论。
9. 只返回一个结论：`supported`、`rejected` 或 `uncertain`，同时给出证据和剩余未知。
10. 建议 `delete`、`retain_as_evidence` 或 `reimplement_for_production`；保留原型绝不等于生产完成。

## 停止条件

缺少写权限、位置不安全、运行时不可用、需要生产访问、需要真实凭据/数据、需要未授权安装依赖、需要破坏性清理，或问题过宽无法由最小原型回答时，返回 `Blocked`。

# 输出契约

先给 `status`、验证问题、结论和建议处置。

1. `prototype_type`：`logic-prototype` 或 `ui-prototype`
2. `output_mode`：`fast`、`standard` 或 `audit`
3. 唯一验证问题及成立/否定判据
4. 已授权位置和 `NON-PRODUCTION PROTOTYPE` 标记
5. 关键状态、输入、方向，以及可运行命令或交互方式
6. 改动文件和观察结果
7. 结论：`supported`、`rejected` 或 `uncertain`
8. 证据、限制和剩余不确定性
9. 生产隔离及凭据/数据状态
10. 处置：`delete`、`retain_as_evidence` 或 `reimplement_for_production`
11. 推荐的下一 Repo Doctor Skill

audit 模式还要包含准确权限与命令账本。不得把原型描述为生产就绪。
