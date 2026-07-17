---
name: safe-test-implementation
description: Add the smallest set of high-value tests from a test-gap analysis, confirmed behavior, or verified fix, following the repository's real framework and conventions. Use to edit tests, fixtures, and necessary test helpers only; do not use for general bug fixes, production refactors, or coverage-only assertions, and stop before production-code changes unless the user explicitly expands scope. 根据测试缺口分析、已确认行为或已验证修复，遵循仓库真实框架和约定最小化补充高价值测试。用于修改测试、fixture 和必要测试辅助代码；不用于通用 Bug 修复、生产代码重构或只为覆盖率添加断言，必须改生产代码时除非用户明确扩大范围否则停止。
---

# Safe Test Implementation（安全补充测试）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

# Safe Test Implementation

Add the smallest high-value verification for one observable behavior at a time, using a red/green/regression feedback loop.

## Boundary

- Modify only tests, fixtures, and necessary test helpers by default. Preserve user changes and existing conventions.
- Stop if passing requires production-code changes. Preserve the failing evidence and route the smallest production change to `safe-fix-implementation` unless the user explicitly authorizes another workflow.
- Do not perform general fixes, production refactors, unrelated cleanup, broad formatting, dependency changes, or permission expansion.
- Do not expose private production APIs only for tests, substitute snapshots for critical business assertions, add tests that cannot fail on regression, or create execution-order dependencies and excessive mocks.
- Do not install a new test framework without explicit authorization.

## Behavior Feedback Loop

1. Cite the test-gap report, confirmed behavior, root cause, fix, requirement, or diff that justifies the next behavior slice.
2. Inspect the real test framework, conventions, fixtures, helpers, setup, CI integration, and command definitions. Never invent commands.
3. Select one externally observable behavior and define its test boundary, inputs, outputs, failure mode, and risk.
4. Add one minimum verification at the smallest credible layer. Confirm the assertion can detect a real regression and does not require exposing a private API.
5. Before the behavior implementation, run the narrow verification and confirm it fails for the expected reason. If it passes unexpectedly, fails for another reason, or cannot run, stop and correct the test or report the blocker; never count that as a valid red state.
6. Make the smallest implementation permitted here: tests, fixtures, or necessary test helpers only. When a production implementation is required, stop at the boundary described above.
7. Run the new verification and require a pass. Then run the smallest evidence-backed related regression scope and confirm existing behavior has not regressed.
8. Perform only necessary test-structure cleanup while keeping behavior unchanged.
9. Record the red, green, and regression evidence before selecting the next observable behavior. Do not create a large batch of tests and implement them later.

## Completion and Failure Conditions

Complete a slice only when its expected pre-implementation failure, successful verification, and related regression result are recorded. If tests cannot run, report `not run` with the exact user-runnable command. Distinguish expected failure, unexpected failure, passed, flaky, and not run; never claim a pass without a successful command.

# Output Contract

1. Test basis and evidence
2. Observable behavior and test boundary
3. Behavior-risk-test mapping and why the assertion can detect a regression
4. Added or modified tests, fixtures, helpers, and files
5. Expected pre-implementation failure command, reason, and result
6. Minimal authorized implementation
7. Green verification and related regression commands
8. Results: expected failure, unexpected failure, passed, flaky, or not run
9. Production-code boundary or blockers
10. Cleanup and remaining uncovered risks

Do not claim a test passed unless its command completed successfully.

---

# 安全补充测试

一次只为一个外部可观察行为补充最小高价值验证，并使用红灯、绿灯和回归反馈循环。

## 职责边界

- 默认只修改测试、fixture 和必要测试辅助代码，保护用户已有改动和现有约定。
- 必须修改生产代码才能通过时停止，保留失败证据；除非用户明确授权另一工作流，否则把最小生产修改转给 `safe-fix-implementation`。
- 不做通用修复、生产重构、无关清理、大范围格式化、依赖变更或权限扩张。
- 不为测试暴露生产代码私有 API，不用快照替代关键业务断言，不编写行为回归时仍无法失败的测试，也不加入执行顺序依赖或过度 mock。
- 未经明确授权不安装新测试框架。

## 行为反馈循环

1. 引用支撑下一个行为切片的测试缺口报告、已确认行为、根因、修复、需求或 diff。
2. 检查真实测试框架、约定、fixture、辅助代码、setup、CI 集成和命令定义，不得编造命令。
3. 选择一个外部可观察行为，明确测试边界、输入、输出、失败方式和风险。
4. 在最小可信层级增加一个最小验证，确认真实行为回归时断言能够失败，且不依赖暴露私有 API。
5. 在行为实现前运行最小验证，确认它以预期原因失败。意外通过、因其他原因失败或无法运行时，停止并修正测试或报告阻塞，不得算作有效红灯。
6. 只编写本 Skill 允许的最小实现：测试、fixture 或必要测试辅助代码。需要生产实现时按上述边界停止。
7. 运行新验证并要求通过，再运行有证据支持的最小相关回归范围，确认旧行为未回归。
8. 只做必要的测试结构清理，保持行为不变。
9. 记录本切片的红灯、绿灯和回归证据后再进入下一个可观察行为，不得先批量创建大量测试再统一实现。

## 完成与失败条件

只有实现前预期失败、验证通过和相关回归结果全部记录后，一个切片才完成。无法运行测试时标为“未运行”，并给出用户可执行的准确命令。区分预期失败、意外失败、通过、flaky 和未运行；没有成功命令不得声称通过。

# 输出契约

1. 测试依据与证据
2. 外部可观察行为与测试边界
3. 行为—风险—测试映射，以及断言为何能够发现回归
4. 添加或修改的测试、fixture、辅助代码及文件
5. 实现前预期失败命令、原因与结果
6. 最小授权实现
7. 绿灯验证和相关回归命令
8. 结果：预期失败、意外失败、通过、flaky 或未运行
9. 生产代码边界或阻塞项
10. 清理与剩余未覆盖风险

测试命令未成功完成时，不得声称测试通过。
