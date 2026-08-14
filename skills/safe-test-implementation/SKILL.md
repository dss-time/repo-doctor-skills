---
name: safe-test-implementation
description: "Protect one externally observable behavior through a gated red–green–organize cycle in test_first, regression_after_fix, or characterization mode. Use only for explicitly authorized test, fixture, and necessary test-helper edits; inspect real commands and public test boundaries first. Do not auto-invoke for production fixes, modify production code, install dependencies, or write coverage-only assertions. 通过有门禁的红—绿—整理循环，一次保护一个外部可观察行为，可选 test_first、regression_after_fix 或 characterization。仅用于已明确授权的测试、fixture 和必要测试辅助代码修改；先检查真实命令与公共测试边界。生产修复不得自动调用，也不得修改生产代码、安装依赖或只为覆盖率补断言。"
---

# English

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Safe Test Implementation

One behavior slice earns one trustworthy red signal, one green result, and only then any organization.

## Output modes

- `fast` (default): status, protected behavior, test mode, changed test files, focused command, result, and next step.
- `standard`: full behavior-cycle record and bounded regression result.
- `audit`: `standard` plus permission decisions, command preflight, exact working directories, exit codes, evidence status, mock rationale, and skipped/blocked checks.

Output mode is independent from `test_mode`. Never switch either silently.

## Permission and command boundary

- Require explicit write authorization before changing tests, fixtures, snapshots, or helpers. Modify only the authorized test-side scope.
- Production code is outside this Skill. When green requires production changes, stop and route the smallest behavior slice to `safe-fix-implementation`; resume verification only after that separately authorized work completes.
- Do not perform general fixes, production refactors, dependency changes, broad cleanup, or permission expansion.
- Read the repository's command definitions and transitive scripts before execution. Block install, migration, deployment, publication, deletion, production access, credential use, service control, or any uncertain side effect.
- Record every command, working directory, exit code, concise result, and `Observed`, `Unverified`, or `Blocked` evidence state. Never invent a command, result, or red state.
- Do not expose private production APIs for tests, bind assertions to private implementation, or use a fragile snapshot instead of observable behavior.
- Do not install a test framework without explicit authorization.

## Select One Mode

1. Use `test_first` when behavior is not implemented and the test will drive it. Require the narrow test to fail for the expected behavioral reason before production implementation.
2. Use `regression_after_fix` when the fix already exists or is verified. Do not require or claim a historical red run. Prove sensitivity with a pre-fix commit, a safely reversible mutation in an isolated copy, or a precise assertion-to-defect mapping. Otherwise report `sensitivity_unverified`.
3. Use `characterization` to preserve observable legacy behavior before refactoring. The initial run may pass. Record the behavior being frozen and show that assertions distinguish meaningful states.

If ambiguity changes evidence or authorization, stop. Otherwise infer the narrowest mode and report the inference.

## Behavior-driven red–green–organize cycle

1. Define the single behavior to protect in project domain language and cite its requirement, gap, root cause, verified fix, or observed legacy behavior.
2. Confirm the public test boundary: the caller-visible interface, state transition, output, error, or side effect where the behavior is observable. Do not test private methods or internal call order.
3. Inspect the existing test location, framework, fixtures, helpers, setup, CI conventions, and exact focused and regression commands.
4. Run command preflight, confirm test-side write authorization, and declare `test_mode`, output mode, mock rationale if any, and the production-code stop boundary.
5. Add one minimum credible test that can reliably fail for the target behavior. Do not draft all future tests as a horizontal slice.
6. Establish red evidence:
   - `test_first`: run the focused test and require failure for the expected missing behavior. An unrelated failure, unexpected pass, flaky result, or unavailable command is not red.
   - `regression_after_fix`: do not manufacture historical red. Use a safe pre-fix comparison or precise assertion-to-defect mapping; otherwise record `sensitivity_unverified`.
   - `characterization`: the initial test may pass; prove the assertion distinguishes meaningful observable states.
7. Implement only the smallest test-side change. If behavior requires production code, stop after valid red and hand off to `safe-fix-implementation`; production edits require separate authorization.
8. Verify green by rerunning the same focused command after the authorized implementation state exists. Process no second behavior until this slice is resolved.
9. Only after all focused checks are green, organize test code without changing behavior. Remove duplication only when it improves the current test; do not refactor production code.
10. Run the smallest evidence-backed regression scope, then report commands, files, evidence states, limitations, and the next Skill.

## Test quality and stop conditions

- Prefer externally observable behavior and domain-language test names.
- Do not write low-value coverage assertions. A mock requires a stated system-boundary reason; prefer real local substitutes when practical.
- In a project without tests, first identify the smallest safe seam and existing runnable toolchain. Do not install a framework or expose a private API.
- Return `Blocked` for missing write authorization, unsafe/unknown commands, unavailable tooling, production-only changes, or a red signal unrelated to the target behavior.
- Use `not_run`, `unexpected_failure`, `flaky`, or `sensitivity_unverified` rather than turning missing evidence into a pass.

# Output Contract

Lead with `status`, protected behavior, current cycle state, and next action.

- `fast`: `output_mode`, `test_mode`, `observable_behavior`, `test_boundary`, `changed_test_files`, focused command/result, `production_change_required`, and `next_recommended_skill`.
- `standard`: add test basis, red evidence, expected failure reason or sensitivity evidence, green evidence, organization result, regression result, limitations, and evidence status.
- `audit`: add write-authorization scope, command preflight, mock rationale, and a command ledger with exact command, working directory, exit code, result, and evidence state.

Only `test_first` requires an observed expected failure. Do not claim red, green, regression, or sensitivity without the corresponding evidence. Use `Blocked` when the permission or command gate fails.

# 简体中文

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# Safe Test Implementation（安全补充测试）

一个行为切片只对应一个可信红灯、一个绿灯结果，全部通过后才能整理。

## 输出模式

- `fast`（默认）：状态、受保护行为、测试模式、测试侧改动、定向命令、结果和下一步。
- `standard`：完整行为循环记录及有边界的回归结果。
- `audit`：在 `standard` 基础上增加权限判断、命令预检、准确工作目录、退出码、证据状态、Mock 理由和跳过/阻塞项。

输出模式与 `test_mode` 相互独立，二者都不得静默切换。

## 权限与命令边界

- 修改测试、fixture、snapshot 或辅助代码前必须获得明确写权限，只能在已授权的测试侧范围内编辑。
- 生产代码不属于本 Skill。绿灯需要生产修改时停止，把最小行为切片交给 `safe-fix-implementation`；该独立授权工作完成后再继续验证。
- 不做通用修复、生产重构、依赖变更、大范围清理或权限扩张。
- 执行前读取仓库命令定义及传递脚本；发现安装、迁移、部署、发布、删除、生产访问、凭据、服务控制或不确定副作用时阻塞。
- 记录每条命令、工作目录、退出码、简洁结果及 `Observed`、`Unverified` 或 `Blocked` 证据状态，不得编造命令、结果或红灯。
- 不得只为测试暴露生产私有 API，不绑定私有实现细节，不用脆弱快照替代外部行为断言。
- 未经明确授权不安装测试框架。

## 选择一种模式

1. 行为尚未实现且测试用于驱动实现时，使用 `test_first`。生产实现前必须让最小测试因预期行为缺失而真实失败。
2. 修复已存在或已验证时，使用 `regression_after_fix`。不得要求或声称历史红灯；用修复前提交、隔离副本中的安全可逆变异，或精确的断言—缺陷映射证明敏感性。否则标为 `sensitivity_unverified`。
3. 在重构前冻结可观察旧行为时，使用 `characterization`。初次运行可以通过；记录被固定的行为，并说明断言如何区分有意义的状态。

歧义会改变证据或授权时停止；否则选择最窄模式并声明该推断。

## 行为驱动红—绿—整理循环

1. 用项目领域语言定义本次唯一受保护行为，并引用需求、测试缺口、根因、已验证修复或观察到的旧行为。
2. 确认公共测试边界：调用者可见接口、状态转换、输出、错误或副作用；不测试私有方法和内部调用顺序。
3. 检查现有测试位置、框架、fixture、辅助代码、setup、CI 约定，以及准确的定向与回归命令。
4. 完成命令预检，确认测试侧写权限，并声明 `test_mode`、输出模式、适用时的 Mock 理由和生产代码停止边界。
5. 新增一个能针对目标行为可靠失败的最小可信测试；不得先写完全部未来测试形成水平切片。
6. 建立红灯证据：
   - `test_first`：运行定向测试，必须因目标行为缺失而失败；无关失败、意外通过、flaky 或命令不可用都不是红灯。
   - `regression_after_fix`：不得伪造历史红灯；使用安全的修复前对照或精确断言—缺陷映射，否则记录 `sensitivity_unverified`。
   - `characterization`：初次可以通过，但要证明断言能区分有意义的外部状态。
7. 只实施最小测试侧改动。行为需要生产代码时，在有效红灯后停止并交给 `safe-fix-implementation`；生产编辑需要独立授权。
8. 授权实施状态存在后，重跑同一定向命令验证绿灯；当前切片未解决前不处理第二个行为。
9. 所有定向检查变绿后才整理测试代码；只消除当前测试中有价值的重复，不重构生产代码。
10. 运行有证据支持的最小回归范围，报告命令、文件、证据状态、限制和下一 Skill。

## 测试质量与停止条件

- 优先验证外部可观察行为，测试名称使用项目领域语言。
- 不写低价值覆盖率断言。Mock 必须说明系统边界理由；可行时优先使用真实本地替代。
- 现有项目没有测试时，先识别最小安全接缝和已有可运行工具链；不安装框架，也不暴露私有 API。
- 缺少写权限、命令不安全或未知、工具不可用、只能修改生产代码，或红灯与目标行为无关时返回 `Blocked`。
- 适时使用 `not_run`、`unexpected_failure`、`flaky` 或 `sensitivity_unverified`，不得把缺失证据包装成通过。

# 输出契约

先给 `status`、受保护行为、当前循环状态和下一动作。

- `fast`：`output_mode`、`test_mode`、`observable_behavior`、`test_boundary`、`changed_test_files`、定向命令/结果、`production_change_required` 和 `next_recommended_skill`。
- `standard`：增加测试依据、红灯证据、预期失败原因或敏感性证据、绿灯证据、整理结果、回归结果、限制和证据状态。
- `audit`：增加写权限范围、命令预检、Mock 理由，以及包含准确命令、工作目录、退出码、结果和证据状态的命令账本。

只有 `test_first` 要求观察到预期失败。没有相应证据时不得声称红灯、绿灯、回归或敏感性。权限或命令门禁失败时使用 `Blocked`。
