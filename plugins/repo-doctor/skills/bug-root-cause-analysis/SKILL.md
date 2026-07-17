---
name: bug-root-cause-analysis
description: Reproduce and locate a specific runtime bug by tracing the first trustworthy failure through code, logs, configuration, existing tests, and minimal experiments into an evidence-backed causal chain. Use for non-CI symptom-to-root-cause diagnosis; do not absorb CI pipeline failures, general code review, broad health checks, requests to add or modify tests, or requests to implement a fix. 针对具体运行时 Bug，从第一个可信错误出发，结合代码、日志、配置、现有测试和最小实验复现并建立有证据的因果链。用于非 CI 的症状到根因分析；不要吸收 CI 流水线失败、普通代码审查、项目体检、新增或修改测试请求或直接修复请求。
---

# Bug Root Cause Analysis（Bug 根因分析）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

# Bug Root Cause Analysis

Reproduce and locate the root cause of a specific defect. Build an evidence chain; do not implement the fix.

## Boundary

- Do not turn a general code review or broad repository diagnosis into root-cause analysis without a concrete symptom.
- Route failures whose defining context is a CI workflow or runner to `ci-failure-diagnosis`.
- Do not modify business code, tests, configuration, dependencies, documentation, or other user files.
- Shell permission authorizes only the non-destructive diagnostics defined below. It does not authorize a fix, dependency change, external system action, or production access.
- Route test creation to `safe-test-implementation` and production fixes to `safe-fix-implementation` after the root cause is sufficiently confirmed.
- Match the user's language and preserve technical identifiers verbatim.

## Safe Diagnostic Execution

### Allowed diagnostics

- Use `rg` or equivalent code search; read files, configuration, logs, existing tests, and diagnostic output.
- Use read-only Git commands such as `git status`, `git diff`, `git log`, and `git show`. Do not change branches, the index, or the working tree.
- Read the actual command source in `package.json`, `Makefile`, CI workflow files, or equivalent build and test configuration before running it.
- Query existing tool and runtime versions and inspect already configured build or test settings.
- After the test-command gate passes, run the narrowest relevant existing test or a non-destructive minimum reproduction using non-production inputs.
- Compare pre-fix behavior and read test, build, or diagnostic output. Do not implement the repair.
- Stop and request confirmation when a diagnostic has uncertain, privileged, destructive, external, or production side effects.

### Prohibited actions

- Do not run `rm` or `rmdir`, or perform any unconfirmed deletion.
- Do not run `git reset`, `git checkout`, `git clean`, `git commit`, or `git push`.
- Do not install or upgrade dependencies with `npm install`, `pnpm install`, `yarn add`, `pip install`, `go get`, or equivalent commands.
- Do not run database migrate, seed, drop, or truncate operations.
- Do not deploy, publish, release, or tag anything.
- Do not run `sudo`, `chmod`, or `chown`.
- Do not modify a system proxy, VPN, TUN, network routes, system services, or host configuration.
- Do not send requests to a production environment or use production data to reproduce a defect.
- Do not print API keys, authentication credential values, or sensitive environment-variable values.
- Do not execute `curl | sh`, another remote-script pipeline, or downloaded code.
- Do not run `kill`, `pkill`, `service restart`, or other process or service controls.
- Do not execute an unknown repository script before reading its definition and transitive script chain.
- Do not use shell redirection, `tee`, or editor commands to change repository or user files.
- Do not change production code, tests, configuration, documentation, or dependencies to make reproduction easier.

### Test-command gate

Before running `npm test`, a repository script, or a language-specific test command:

1. Read the command and every referenced script definition.
2. Check for install, migration, deployment, publication, deletion, network, credential, service-control, or other external side effects.
3. Prefer the smallest targeted test and non-production fixture that can answer the diagnostic question.
4. Stop and request confirmation if any high-risk or uncertain side effect remains.
5. Never assume a command is safe only because its name contains `test`.

### Temporary artifacts and workspace integrity

- Capture read-only workspace state, including `git status --short` when Git is present, before and after diagnostics.
- Prefer an isolated system temporary directory for unavoidable caches or minimum-reproduction artifacts; never overwrite user files.
- Do not run `rm` or `rmdir` for cleanup. Allow only automatic cleanup by an isolated tool or runtime for artifacts created in this run and proven to belong to it.
- If ownership cannot be proven, leave the artifact in place and report it rather than deleting it.
- If a diagnostic produces a tracked-file diff, stop immediately and report the command and changed paths. Do not revert, clean, or continue.

### Evidence status

- `Observed`: directly read from repository evidence, logs, or an executed command.
- `Reproduced`: an executed command recreated the reported symptom under recorded conditions.
- `Inferred`: supported by evidence but not directly reproduced or observed.
- `Unverified`: could not be checked or no command was run.
- `Blocked`: intentionally not executed because permission, safety, capability, or required input was missing.

Record every executed diagnostic with its exact command, working directory, exit status, and relevant result. Redact sensitive values. Never claim `Reproduced` or a passing test when the corresponding command did not run successfully.

### Repeatable feedback mechanism

- Establish a repeatable feedback mechanism before assigning high confidence to a root cause. It may be an existing test, static check, log query, minimum script in an isolated temporary location, non-production interface request, or precise user action sequence.
- Record the mechanism, inputs, environment, expected symptom, observed result, and repeatability limits. Keep symptom reproduction separate from causal confirmation.
- When commands cannot run, provide the smallest user-runnable reproduction and evidence-collection steps. Mark their result `Unverified` until output is returned.
- For every hypothesis, record supporting evidence, a concrete falsification method or contradictory observation, confidence, and remaining unknowns.
- Without a reliable feedback mechanism, a causal conclusion may be only `Inferred` or `Unverified`; never label it a confirmed high-confidence root cause.
- A repair direction must remove the causal mechanism, not merely suppress the visible symptom. Always propose a regression test or repeatable regression check.

## Workflow

1. Record the symptom, user impact, affected scope, environment, version, inputs, state, and reproduction conditions.
2. Inspect repository instructions, command definitions, existing tests, configuration, and current workspace state before selecting a command.
3. Apply the safe diagnostic and test-command gates; record skipped commands as `Blocked` or `Unverified` with the reason.
4. Select and record a repeatable feedback mechanism. If none can run, provide minimum user-runnable steps and cap the conclusion at `Inferred` or `Unverified`.
5. Reproduce the symptom when safely possible. If not reproduced, state why; symptom reproduction alone is not root-cause confirmation.
6. Start from the first trustworthy error or invariant violation. Treat later failures as possible cascades until proven otherwise.
7. Trace `input/state -> execution path -> failure point -> user-visible symptom` using file locations, logs, stack frames, configuration, tests, or minimum experiments.
8. Compare working and failing paths, versions, inputs, or environments when evidence permits.
9. For primary and alternative hypotheses, record support, falsification method, contradictory evidence, confidence, and unknowns. Run the safest discriminator available.
10. Confirm the root cause only when the feedback mechanism and causal evidence distinguish it from plausible alternatives.
11. State the smallest causal repair direction and regression test or check without editing files. Reject symptom-only workarounds as root-cause fixes.
12. Assign confidence and list the exact evidence needed to raise it.

# Output Contract

1. Problem summary and reported symptom
2. Environment, exact reproduction conditions, and repeatable feedback mechanism or user-runnable fallback
3. Executed diagnostic commands, working directories, and exit status
4. Command results, including commands that failed, were not run, or were blocked
5. Evidence table with source, observation, and `Observed` / `Reproduced` / `Inferred` / `Unverified` / `Blocked` status
6. Symptom reproduction result, kept separate from root-cause confirmation
7. Execution path and causal chain
8. Hypothesis table with support, falsification method, contradictory evidence, confidence, and unknowns
9. Root cause, labeled confirmed, inferred, or unverified
10. Impact scope
11. Minimum causal repair direction without implementation; identify symptom-only workarounds
12. Regression test or repeatable regression-check recommendation without creating tests
13. Confidence cap and evidence needed next
14. Unverified and blocked items with reasons

Without a reliable feedback mechanism, the root-cause status must remain `Inferred` or `Unverified`. Never claim `Reproduced` or a passing test unless the corresponding command actually ran successfully under the reported conditions.

---

# Bug 根因分析

复现并定位具体缺陷的根因，建立完整证据链；不要实施修复。

## 职责边界

- 没有具体症状时，不要把普通代码审查或全仓诊断转成根因分析。
- 失败的关键上下文是 CI workflow 或 Runner 时，交给 `ci-failure-diagnosis`。
- 不得修改业务代码、测试、配置、依赖、文档或其他用户文件。
- Shell 权限只允许执行下述非破坏性诊断，不授权修复、依赖变更、外部系统操作或生产环境访问。
- 根因充分确认后，新增测试交给 `safe-test-implementation`，生产代码修复交给 `safe-fix-implementation`。
- 输出语言跟随用户输入，技术标识符保持原样。

## 安全诊断执行

### 允许的诊断

- 使用 `rg` 或等价代码搜索；读取文件、配置、日志、现有测试和诊断输出。
- 使用 `git status`、`git diff`、`git log` 和 `git show` 等 Git 只读命令；不得改变分支、索引或工作区。
- 运行命令前，先读取 `package.json`、`Makefile`、CI workflow 或等价构建与测试配置中的真实定义。
- 查询已有工具和运行时版本，检查已经配置的构建或测试设置。
- 通过测试命令门禁后，使用非生产输入运行最小相关现有测试或非破坏性的最小复现。
- 比较修复前行为，读取测试、构建或诊断输出，但不实施修复。
- 诊断存在不确定、特权、破坏性、外部或生产环境副作用时，停止并请求确认。

### 禁止的操作

- 不得运行 `rm` 或 `rmdir`，也不得执行任何未经确认的删除。
- 不得运行 `git reset`、`git checkout`、`git clean`、`git commit` 或 `git push`。
- 不得使用 `npm install`、`pnpm install`、`yarn add`、`pip install`、`go get` 或等价命令安装或升级依赖。
- 不得执行数据库 migrate、seed、drop 或 truncate 操作。
- 不得执行 deploy、publish、release 或 tag。
- 不得运行 `sudo`、`chmod` 或 `chown`。
- 不得修改系统代理、VPN、TUN、网络路由、系统服务或主机配置。
- 不得向生产环境发送请求，也不得使用生产数据复现缺陷。
- 不得输出密钥、令牌、凭据值或敏感环境变量。
- 不得执行 `curl | sh`、其他远程脚本管道或下载的代码。
- 不得运行 `kill`、`pkill`、`service restart` 或其他进程、服务控制命令。
- 未读取定义及其传递脚本链前，不得执行仓库中的未知脚本。
- 不得使用 shell 重定向、`tee` 或编辑器命令修改仓库或用户文件。
- 不得为了方便复现而修改生产代码、测试、配置、文档或依赖。

### 测试命令门禁

运行 `npm test`、仓库脚本或语言测试命令前：

1. 读取命令及其引用的每一层脚本定义。
2. 检查是否包含安装、迁移、部署、发布、删除、网络、凭据、服务控制或其他外部副作用。
3. 优先使用能回答诊断问题的最小定向测试和非生产 fixture。
4. 仍存在高风险或不确定副作用时，停止并请求确认。
5. 不得仅因为命令名称包含 `test` 就假设安全。

### 临时产物与工作区完整性

- 诊断前后记录只读工作区状态；存在 Git 时包括 `git status --short`。
- 不可避免的缓存或最小复现产物优先放在隔离的系统临时目录，不得覆盖用户文件。
- 不得使用 `rm` 或 `rmdir` 清理；只允许隔离工具或运行时自动清理本次运行创建且能够证明归属的产物。
- 无法证明归属时，保留产物并报告，不得删除。
- 诊断产生 tracked file Diff 时立即停止，报告命令和变更路径；不得回滚、清理或继续执行。

### 证据状态

- `Observed`：直接来自仓库证据、日志或已执行命令的观察事实。
- `Reproduced`：已执行命令在记录条件下真实重现了用户报告的症状。
- `Inferred`：有证据支持，但未被直接观察或复现的推断。
- `Unverified`：无法检查或未运行命令。
- `Blocked`：由于权限、安全、能力或必要输入缺失而有意不执行。

记录每条已执行诊断的准确命令、工作目录、退出状态和相关结果，并对敏感值脱敏。对应命令未成功运行时，不得声称 `Reproduced` 或测试通过。

### 可重复反馈方式

- 在给出高置信根因前先建立可重复反馈方式，可以是现有测试、静态检查、日志查询、隔离临时目录中的最小脚本、非生产接口请求或准确的用户操作步骤。
- 记录反馈方式、输入、环境、预期现象、观察结果和重复性限制；严格区分“现象复现”和“因果确认”。
- 无法运行命令时，给出用户可运行的最小复现与证据收集步骤；用户未返回结果前保持 `Unverified`。
- 每个假设都记录支持证据、具体反证方法或矛盾观察、置信度和剩余未知。
- 没有可靠反馈方式时，因果结论最高只能是 `Inferred` 或 `Unverified`，不得标成已确认的高置信根因。
- 修复方向必须消除因果机制，而不是只隐藏表面症状；始终给出回归测试或可重复回归验证建议。

## 工作流程

1. 记录症状、用户影响、影响范围、环境、版本、输入、状态和复现条件。
2. 选择命令前，检查仓库指令、命令定义、现有测试、配置和当前工作区状态。
3. 应用安全诊断与测试命令门禁；跳过的命令按原因标记为 `Blocked` 或 `Unverified`。
4. 选择并记录可重复反馈方式；无法执行时给出最小用户操作步骤，并把结论上限设为 `Inferred` 或 `Unverified`。
5. 在安全可行时复现现象；无法复现时说明原因。现象复现本身不等于根因确认。
6. 从第一个可信错误或不变量破坏开始；后续错误在证实前视为可能的级联结果。
7. 使用文件位置、日志、堆栈、配置、测试或最小实验建立“输入/状态 → 执行路径 → 失效点 → 用户可见症状”链条。
8. 有证据时比较正常与异常路径、版本、输入或环境。
9. 对主要和替代假设记录支持证据、反证方式、矛盾证据、置信度和未知项，并运行最安全的区分实验。
10. 只有反馈方式和因果证据能够排除合理替代解释时，才确认根因。
11. 给出消除因果机制的最小修复方向，以及回归测试或检查，但不修改文件；症状绕过不得写成根因修复。
12. 标注置信度，并列出提高置信度所需的确切证据。

# 输出契约

1. 问题摘要与用户报告现象
2. 环境、准确复现条件、可重复反馈方式或用户可运行的替代步骤
3. 已执行的诊断命令、工作目录和退出状态
4. 命令结果，包括失败、未运行或被阻止的命令
5. 证据表，包含来源、观察结果和 `Observed` / `Reproduced` / `Inferred` / `Unverified` / `Blocked` 状态
6. 现象复现结果，与根因确认分开
7. 执行路径与因果链
8. 假设表，包含支持证据、反证方法、矛盾证据、置信度和未知项
9. 根因，标明已确认、推断或未验证
10. 影响范围
11. 不实施修改的最小因果修复方向，并标识只绕过症状的方案
12. 不创建测试的回归测试或可重复回归检查建议
13. 置信度上限与下一步所需证据
14. 未验证和阻塞项及其原因

没有可靠反馈方式时，根因状态必须保持 `Inferred` 或 `Unverified`。对应命令未在所报告条件下成功运行时，不得声称 `Reproduced` 或测试通过。
