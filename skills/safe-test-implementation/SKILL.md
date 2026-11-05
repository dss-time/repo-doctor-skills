---
name: safe-test-implementation
description: "Protect one externally observable behavior through a gated red–green–organize cycle in test_first, regression_after_fix, or characterization mode. Use only for explicitly authorized test, fixture, and necessary test-helper edits; inspect real commands and public test boundaries first. Do not auto-invoke for production fixes, modify production code, install dependencies, or write coverage-only assertions. 通过有门禁的红—绿—整理循环，一次保护一个外部可观察行为，可选 test_first、regression_after_fix 或 characterization。仅用于已明确授权的测试、fixture 和必要测试辅助代码修改；先检查真实命令与公共测试边界。生产修复不得自动调用，也不得修改生产代码、安装依赖或只为覆盖率补断言。"
---

# English

## Permission Contract

These capability limits come from Skill metadata, not user authorization. Allowed capabilities remain subject to the user's authorized scope and stricter conditions in the instructions.
- Read files: only within authorized scope and this Skill's conditions.
- Write or modify files: only within authorized scope and this Skill's conditions.
- Run shell commands: only within authorized scope and this Skill's conditions.
- Access the network: prohibited.
- Perform destructive actions: prohibited.
An explicit exception for isolated temporary artifacts applies only under all of its stated conditions; it does not grant general write or deletion permission.

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Complete one primary task by default. Continue an authorized end-to-end workflow within each Skill's permissions; Router remains recommendation-only. Pause for new material decisions or scope, not authorization already given.
For authorized multi-stage work, evidence reuse or recovery, read `references/workflow-coordination.en.md`; optionally use `references/workflow-coordination.mjs` and `references/workflows.yaml`. Provide manual handoff when host execution is unavailable.
For a human-only blocker, give location, action, success signal and resume step; never request secret values or assume completion.
Validate according to actual risk; security, production, migrations, releases and other high-risk work use `audit`. Read `references/execution-modes.en.md` only when mode selection is unclear.

# Safe Test Implementation

For authorized workflow continuation, evidence reuse or recovery, read `references/workflow-coordination.en.md`; preserve this Skill's own scope and permissions.

Complete one behavior slice with evidence appropriate to its test mode; organize only after green.

Output mode and test_mode are independent. Never switch either silently.

Default output is `fast`; use `standard` or `audit` for detailed evidence, following the output contract.

## Permission and command boundary

- Cleanup is allowed only for disposable artifacts created by this run in an isolated temporary directory, with ownership and resolved paths verified and no symlink escape. Preserve pre-existing files, user data and unknown paths; otherwise block cleanup. This exception does not authorize general deletion.

- Require explicit write authorization before changing tests, fixtures, snapshots, or helpers. Modify only the authorized test-side scope.
- Production code is outside this Skill. When green requires production changes, hand the smallest behavior slice to `feature-implementation` for settled feature delivery or `safe-fix-implementation` for a local repair; resume verification after the authorized production work completes. Existing end-to-end authorization need not be requested again.
- Do not perform general fixes, production refactors, dependency changes, broad cleanup, or permission expansion.
- Read the repository's command definitions and transitive scripts before execution. Block install, migration, deployment, publication, unsafe deletion, production access, credential use, service control, or any uncertain side effect.
- Record every command, working directory, exit code, concise result, and `Observed`, `Unverified`, or `Blocked` evidence state. Never invent a command, result, or red state.
- Do not expose private production APIs for tests, bind assertions to private implementation, or use a fragile snapshot instead of observable behavior.
- Do not install a test framework without explicit authorization.

## Select One Mode

Read `references/testing-contract.en.md` for mode selection, evidence and public-behavior rules. Only `test_first` requires an observed expected failure before implementation. If ambiguity changes evidence or authorization, stop; otherwise choose the narrowest mode and state the inference.

## Behavior-driven red–green–organize cycle

1. Define the single behavior to protect in project domain language and cite its requirement, gap, root cause, verified fix, or observed legacy behavior.
2. Confirm the public test boundary: the caller-visible interface, state transition, output, error, or side effect where the behavior is observable. Do not test private methods or internal call order.
3. Inspect the existing test location, framework, fixtures, helpers, setup, CI conventions, and exact focused and regression commands.
4. Run command preflight, confirm test-side write authorization, and declare `test_mode`, output mode, mock rationale if any, and the production-code stop boundary.
5. Add one minimum credible test that can reliably fail for the target behavior. Do not draft all future tests as a horizontal slice.
6. Establish and record the evidence required by the selected mode in the shared test contract; an executed command with an unrelated failure never proves the target behavior.
7. Implement only the smallest test-side change. If behavior requires production code, stop test-side work after the evidence required by the selected mode and hand off to the production owner selected above; production writes must be covered by user authorization.
8. Verify green by rerunning the same focused command after the authorized implementation state exists. Process no second behavior until this slice is resolved.
9. Only after all focused checks are green, organize test code without changing behavior. Remove duplication only when it improves the current test; do not refactor production code.
10. Run the smallest evidence-backed regression scope, then report commands, files, evidence states, limitations, and the next Skill.

## Test quality and stop conditions

- Prefer externally observable behavior and domain-language test names.
- Do not write low-value coverage assertions. A mock requires a stated system-boundary reason; prefer real local substitutes when practical.
- In a project without tests, first identify the smallest safe seam and existing runnable toolchain. Do not install a framework or expose a private API.
- Return `Blocked` for missing write authorization, unsafe/unknown commands, unavailable tooling, production-only changes, or a red signal unrelated to the target behavior.
- Use `not_run`, `unexpected_failure`, `flaky`, or `sensitivity_unverified` rather than turning missing evidence into a pass.

Complete work already authorized within this Skill without asking again. In an authorized end-to-end workflow, hand other responsibilities to the appropriate Skill; this Skill's own permissions do not expand.

Read [execution boundaries](references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Explicit user-directed deferred verification is an exception to the per-slice test schedule and test-first execution timing above. Apply the execution-boundary deferral protocol, record changes as implemented with verification deferred, and do not claim verified completion.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.

Before test-side edits, recheck file baselines and preserve concurrent changes. Never remove rejection cases or weaken permission/business assertions to get green. Before executing checks, establish actual resource isolation and setup/teardown effects; unknown isolation blocks the command.

# Output Contract

Default `fast`: protected behavior, selected test_mode and actual test command/result. Explain limits when production changes, failures or unverified evidence matter.
`standard` adds observable_behavior, test_boundary, red/green or sensitivity evidence, regression results and, when applicable, production_change_required and next_recommended_skill.
`audit` adds command preflight, permissions, mock rationale and the full command ledger.
Only test_first requires an observed expected failure; never invent red, green or sensitivity. Omit empty fields.

If the user deferred checks, include `verification_status: verification_deferred`, the instruction source and pending acceptance/check mapping. Distinguish implemented changes from verified delivery.

When relevant, briefly state preserved authorization/business behavior, existing-data update evidence, validation target/isolation or unrun reason, and preexisting/concurrent edit protection. Unresolved safety gaps or edit conflicts keep affected work blocked/partial. Omit inapplicable fields and retain deferred-verification status.

# 简体中文

## 权限契约

以下能力边界来自 Skill 元数据，不构成用户授权；允许的能力仍须遵守用户授权范围和正文中更严格的条件。
- 读取文件：仅限已授权范围及本 Skill 的条件内。
- 写入或修改文件：仅限已授权范围及本 Skill 的条件内。
- 执行 Shell 命令：仅限已授权范围及本 Skill 的条件内。
- 访问网络：禁止。
- 执行破坏性操作：禁止。
正文明确规定的隔离临时产物例外仅适用于该例外的全部条件，不扩大为一般写入或删除权限。

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
默认完成一个主任务。用户已授权完整流程时，在各 Skill 权限内连续完成；Router 仍只推荐。新重大决策或超出授权时暂停，不重复索取已有授权。
仅在已授权多阶段协作、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`；按需使用 `references/workflow-coordination.mjs` 和 `references/workflows.yaml`，宿主不支持执行时提供人工交接。
必须由用户完成的阻塞步骤：给出操作位置、具体动作、成功标志、恢复步骤；不要求粘贴秘密值，不代替用户确认完成。
按实际风险选择验证；安全、生产、迁移、发布等高风险工作使用 `audit`。模式不明确时才读取 `references/execution-modes.zh-CN.md`。

# Safe Test Implementation（安全补充测试）

仅在已授权流程续接、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`，保持本 Skill 自身范围和权限。

每个行为切片按所选测试模式取得可信证据，绿灯后才能整理。

输出模式与 test_mode 独立，二者都不得静默切换。

输出默认 `fast`；需要详细证据时使用 `standard` 或 `audit`，字段以输出契约为准。

## 权限与命令边界

- 仅允许清理本次运行在隔离临时目录创建、归属和解析后路径均已核验且不存在符号链接越界的可丢弃产物。保留已有文件、用户数据和不明路径；无法确认时阻塞清理。本例外不授权一般删除。

- 修改测试、fixture、snapshot 或辅助代码前必须获得明确写权限，只能在已授权的测试侧范围内编辑。
- 生产代码不属于本 Skill。绿灯需要生产修改时，把最小行为切片交给 `feature-implementation`（已确认功能交付）或 `safe-fix-implementation`（局部修复）；生产修改必须由相应承接者完成，已有完整流程授权不必重复索取。
- 不做通用修复、生产重构、依赖变更、大范围清理或权限扩张。
- 执行前读取仓库命令定义及传递脚本；发现安装、迁移、部署、发布、不安全删除、生产访问、凭据、服务控制或不确定副作用时阻塞。
- 记录每条命令、工作目录、退出码、简洁结果及 `Observed`、`Unverified` 或 `Blocked` 证据状态，不得编造命令、结果或红灯。
- 不得只为测试暴露生产私有 API，不绑定私有实现细节，不用脆弱快照替代外部行为断言。
- 未经明确授权不安装测试框架。

## 选择一种模式

读取 `references/testing-contract.zh-CN.md`，遵守模式选择、证据和公共行为规则。只有 `test_first` 要求实施前实际观察预期失败。歧义会改变证据或授权时停止；否则选择最窄模式并声明推断。

## 行为驱动红—绿—整理循环

1. 用项目领域语言定义本次唯一受保护行为，并引用需求、测试缺口、根因、已验证修复或观察到的旧行为。
2. 确认公共测试边界：调用者可见接口、状态转换、输出、错误或副作用；不测试私有方法和内部调用顺序。
3. 检查现有测试位置、框架、fixture、辅助代码、setup、CI 约定，以及准确的定向与回归命令。
4. 完成命令、实际资源及 setup/teardown 副作用预检；隔离未知时不运行。确认当前文件基线和测试侧写权限，并声明 `test_mode`、输出模式、适用时的 Mock 理由和生产代码停止边界。
5. 新增一个能针对目标行为可靠失败的最小可信测试；不得先写完全部未来测试形成水平切片。
6. 按共享测试契约建立并记录所选模式要求的证据；执行命令但出现无关失败，不能证明目标行为。
7. 写入前复核待改区块并保护已有/并发修改，只实施最小测试侧改动；不删除拒绝场景或削弱权限/业务断言以取得绿灯。行为需要生产代码时，在取得所选模式要求的证据后停止测试侧工作，交给上文选定的生产实施承接者；生产编辑必须已有用户授权。
8. 授权实施状态存在后，重跑同一定向命令验证绿灯；当前切片未解决前不处理第二个行为。
9. 所有定向检查变绿后才整理测试代码；只消除当前测试中有价值的重复，不重构生产代码。
10. 运行有证据支持的最小回归范围，报告命令、文件、证据状态、限制和下一 Skill。

## 测试质量与停止条件

- 优先验证外部可观察行为，测试名称使用项目领域语言。
- 不写低价值覆盖率断言。Mock 必须说明系统边界理由；可行时优先使用真实本地替代。
- 现有项目没有测试时，先识别最小安全接缝和已有可运行工具链；不安装框架，也不暴露私有 API。
- 缺少写权限、命令不安全或未知、工具不可用、只能修改生产代码，或红灯与目标行为无关时返回 `Blocked`。
- 适时使用 `not_run`、`unexpected_failure`、`flaky` 或 `sensitivity_unverified`，不得把缺失证据包装成通过。

用户请求已明确授权本 Skill 范围时直接完成，不重复索取授权。完整流程需要其他职责时，仅在已有流程授权下交给对应 Skill；本 Skill 自身权限不扩大。

读取[执行边界](references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

用户明确要求延期验证时，作为上述逐切片测试及 test-first 执行时序的例外，遵循执行边界中的延期协议。将改动记录为已实施、验证延期，不声明验证完成。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。

# 输出契约

默认 `fast`：受保护行为、选择的 test_mode 和实际测试命令/结果。只在需要生产修改或存在失败、未验证项时解释限制。
`standard` 增加 observable_behavior、test_boundary、红/绿或敏感性证据、回归结果，以及适用时的 production_change_required、next_recommended_skill。
`audit` 增加命令预检、权限、Mock 理由和完整命令账本。
只有 test_first 要求实际预期失败；不得编造 red、green 或敏感性。无需输出空字段。

用户要求延期检查时，输出 `verification_status: verification_deferred`、指令来源及待验证验收项/检查映射，区分已实施改动与已验证交付。

仅在相关时简述保留的权限/业务行为、已有数据更新依据、验证目标/隔离或未运行原因，以及已有/并发改动保护情况。未解决安全缺口或编辑冲突使受影响工作保持阻塞/部分完成。省略不适用字段，保留延期验证状态。
