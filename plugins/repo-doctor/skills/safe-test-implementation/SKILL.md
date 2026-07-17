---
name: safe-test-implementation
description: Add the smallest high-value tests in one explicit mode: test_first before behavior exists, regression_after_fix after a verified fix, or characterization for legacy behavior. Use for authorized test, fixture, and necessary test-helper edits only; do not fabricate a red state, modify production code, perform a general bug fix, or add coverage-only assertions. 以一种明确模式最小化补充高价值测试：行为实现前的 test_first、已验证修复后的 regression_after_fix，或旧行为的 characterization。仅用于已授权的测试、fixture 和必要测试辅助代码修改；不得伪造红灯、修改生产代码、执行通用 Bug 修复或只为覆盖率补断言。
---

# Safe Test Implementation（安全补充测试）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

# Safe Test Implementation

Add the smallest high-value verification for one observable behavior. Select and report exactly one test mode before editing.

## Boundary

- Modify only tests, fixtures, and necessary test helpers. Stop when production-code changes are required and route them to `safe-fix-implementation`.
- Do not perform general fixes, production refactors, dependency changes, broad cleanup, or permission expansion.
- Never invent commands or results, expose private production APIs only for tests, use fragile snapshots instead of behavioral assertions, or claim an unobserved red state.
- Do not install a test framework without explicit authorization.

## Select One Mode

1. Use `test_first` when behavior is not implemented and the test will drive it. Require the narrow test to fail for the expected behavioral reason before production implementation.
2. Use `regression_after_fix` when the fix already exists or is verified. Do not require or claim a historical red run. Prove sensitivity with a pre-fix commit, a safely reversible mutation in an isolated copy, or a precise assertion-to-defect mapping. Otherwise report `sensitivity_unverified`.
3. Use `characterization` to preserve observable legacy behavior before refactoring. The initial run may pass. Record the behavior being frozen and show that assertions distinguish meaningful states.

If ambiguity changes required evidence or authorization, stop and ask. Otherwise infer the narrowest mode and state that inference.

## Workflow

1. Cite the requirement, test gap, verified fix, root cause, diff, or legacy behavior.
2. Inspect the real test framework, commands, fixtures, helpers, setup, and CI conventions. Never invent them.
3. Declare `test_mode`, `observable_behavior`, `test_boundary`, expected evidence, and the production-code boundary.
4. Add the minimum credible verification at the smallest useful layer without excessive mocking.
5. Collect mode-specific initial evidence:
   - `test_first`: require an expected behavioral failure; unrelated failure, unexpected pass, flaky result, or unavailable command is not a valid red state. After valid red evidence, stop and hand production work to `safe-fix-implementation`; when that separate implementation completes, rerun the same test before regression scope.
   - `regression_after_fix`: run on the fixed state and collect safe sensitivity evidence without changing working production source; otherwise mark sensitivity `sensitivity_unverified`.
   - `characterization`: run on the current state and document observed behavior and assertion discrimination.
6. Run the new verification and the smallest evidence-backed regression scope. Record exact commands and outcomes.
7. Stop if passing requires production changes or evidence contradicts the mode. Never switch modes silently.
8. Report changed test-side files, limitations, and the next recommended Skill.

## Completion

Use `not_run`, `unexpected_failure`, `flaky`, or `sensitivity_unverified` when appropriate. Never turn missing evidence into a pass.

# Output Contract

1. `test_mode`: `test_first`, `regression_after_fix`, or `characterization`
2. `test_basis`
3. `observable_behavior`
4. `test_boundary`
5. `changed_test_files`
6. `initial_result`
7. `expected_failure_reason` or `not_applicable`
8. `sensitivity_evidence`
9. `sensitivity_status`: `verified`, `sensitivity_unverified`, or `not_applicable`
10. `production_change_required`
11. `verification_commands`
12. `regression_result`
13. `limitations`
14. `next_recommended_skill`

Only `test_first` requires an observed expected failure. Do not claim a result without its command or evidence.

---

# Safe Test Implementation（安全补充测试）

一次只为一个外部可观察行为补充最小高价值验证。编辑前必须选择并报告且仅报告一种测试模式。

## 职责边界

- 只修改测试、fixture 和必要测试辅助代码。需要修改生产代码时停止并转给 `safe-fix-implementation`。
- 不做通用修复、生产重构、依赖变更、大范围清理或权限扩张。
- 不得编造命令或结果，不得只为测试暴露生产私有 API，不得用脆弱快照替代行为断言，也不得声称未观察到的红灯。
- 未经明确授权不安装测试框架。

## 选择一种模式

1. 行为尚未实现且测试用于驱动实现时，使用 `test_first`。生产实现前必须让最小测试因预期行为缺失而真实失败。
2. 修复已存在或已验证时，使用 `regression_after_fix`。不得要求或声称历史红灯；用修复前提交、隔离副本中的安全可逆变异，或精确的断言—缺陷映射证明敏感性。否则标为 `sensitivity_unverified`。
3. 在重构前冻结可观察旧行为时，使用 `characterization`。初次运行可以通过；记录被固定的行为，并说明断言如何区分有意义的状态。

如果歧义会改变证据要求或授权，停止并询问；否则选择最窄模式并声明推断。

## 工作流程

1. 引用需求、测试缺口、已验证修复、根因、diff 或旧行为。
2. 检查真实测试框架、命令、fixture、辅助代码、setup 和 CI 约定，不得编造。
3. 声明 `test_mode`、`observable_behavior`、`test_boundary`、预期证据和生产代码边界。
4. 在最小可信层级增加最小验证，避免过度 mock。
5. 收集模式专属初始证据：
   - `test_first`：要求预期行为失败；无关失败、意外通过、flaky 或命令不可用都不是有效红灯。取得有效红灯后停止并把生产实现交给 `safe-fix-implementation`；该独立实现完成后，先重跑同一测试再跑回归范围。
   - `regression_after_fix`：在修复后状态运行，并在不改工作区生产源码的前提下收集安全敏感性证据；否则标为 `sensitivity_unverified`。
   - `characterization`：在当前状态运行，记录观察行为和断言区分能力。
6. 运行新增验证及有证据支持的最小回归范围，记录准确命令和结果。
7. 需要生产修改或证据与模式矛盾时停止，不得静默切换模式。
8. 报告测试侧变更文件、限制和推荐下一 Skill。

## 完成条件

适时使用 `not_run`、`unexpected_failure`、`flaky` 或 `sensitivity_unverified`；不得把缺失证据包装成通过。

# 输出契约

1. `test_mode`：`test_first`、`regression_after_fix` 或 `characterization`
2. `test_basis`
3. `observable_behavior`
4. `test_boundary`
5. `changed_test_files`
6. `initial_result`
7. `expected_failure_reason` 或 `not_applicable`
8. `sensitivity_evidence`
9. `sensitivity_status`：`verified`、`sensitivity_unverified` 或 `not_applicable`
10. `production_change_required`
11. `verification_commands`
12. `regression_result`
13. `limitations`
14. `next_recommended_skill`

只有 `test_first` 要求观察到预期失败。没有命令或证据时不得声称结果。
