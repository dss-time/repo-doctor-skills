---
name: ci-failure-diagnosis
description: Diagnose a CI-specific failure from workflow definitions and logs by locating the failed workflow, job, step, and first trustworthy error, then comparing CI and local environments. Use for CI pipeline context; do not use as a general local bug analysis or implement fixes, reveal credential values, or recommend weakening security controls. 根据 workflow 定义和日志定位失败的 workflow、job、step 与第一个可信错误，并对比 CI 和本地环境以诊断 CI 特定失败。用于 CI 流水线上下文；不作为普通本地 Bug 分析，不实施修复、不泄露密钥，也不建议降低安全控制。
---

# CI Failure Diagnosis（CI 失败诊断）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# CI Failure Diagnosis

Diagnose a CI-specific failure using workflow definitions, logs, repository configuration, and environment evidence. Do not implement the fix.

## Boundary

- Require a CI run, log excerpt, or identifiable failed workflow context. Route ordinary runtime bugs without CI context to `bug-root-cause-analysis`.
- Keep all files unchanged. Provide repair direction only.
- Never print credential values, request credential disclosure, or recommend disabling permissions, checks, branch protection, or other security controls.
- Redact credential-like values and distinguish a missing permission or credential reference from its value.
- Do not treat downstream cancellations or cascaded failures as root cause.

## Workflow

1. Identify the provider, workflow, run, job, matrix entry, step, command, and failure time from available evidence.
2. Locate the first trustworthy error before cascaded errors, retries, skipped steps, and cleanup failures.
3. Classify the failure as code, test, dependency, cache, permission/credential, runner environment, configuration, infrastructure, or flaky/unknown.
4. Compare CI and local runtime versions, operating system, architecture, environment variable presence, dependency lockfile, install mode, shell, working directory, services, caches, and commands.
5. Trace the evidence chain from CI input/state to the failing command, failure point, and job result.
6. Propose safe local reproduction steps only from repository and workflow evidence. Mark unverified commands as hypotheses.
7. Separate confirmed root cause, primary hypothesis, alternatives, and unknowns. Try to falsify flaky and cache explanations.
8. Give the minimum repair direction, validation path, confidence, and evidence needed next without editing files.

# Output Contract

1. Failure location: provider, workflow, run, job, matrix, step, and command
2. First trustworthy error
3. Evidence and causal sequence
4. Failure classification
5. Confirmed root cause or ranked hypotheses
6. CI-versus-local differences
7. Safe local reproduction
8. Minimum repair direction
9. Validation recommendations
10. Confidence and unknowns

Redact sensitive values. Do not include a patch or claim a cascade error is the root cause.

---

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# CI 失败诊断

使用 workflow 定义、日志、仓库配置和环境证据诊断 CI 特定失败。不要实施修复。

## 职责边界

- 需要 CI run、日志片段或可识别的失败 workflow 上下文；没有 CI 上下文的普通运行时 Bug 交给 `bug-root-cause-analysis`。
- 保持所有文件不变，只给修复方向。
- 不得输出密钥值、要求用户披露密钥，也不得建议关闭权限、检查、分支保护或其他安全控制。
- 对疑似凭证值脱敏，区分缺少权限或凭证引用与凭证值本身。
- 不把后续取消或级联错误当根因。

## 工作流程

1. 从可用证据识别 provider、workflow、run、job、matrix 项、step、命令和失败时间。
2. 在级联错误、重试、跳过步骤和清理失败之前定位第一个可信错误。
3. 分类为代码、测试、依赖、缓存、权限/密钥、Runner 环境、配置、基础设施或 flaky/未知。
4. 对比 CI 与本地的运行时版本、操作系统、架构、环境变量是否存在、依赖锁文件、安装模式、shell、工作目录、服务、缓存和命令。
5. 建立从 CI 输入/状态到失败命令、失效点和 job 结果的证据链。
6. 只依据仓库和 workflow 证据提出安全本地复现步骤；未验证命令标记为假设。
7. 分离已确认根因、主要假设、替代假设和未知项，并尝试证伪 flaky 与缓存解释。
8. 不修改文件，给出最小修复方向、验证路径、置信度和下一步所需证据。

# 输出契约

1. 失败位置：provider、workflow、run、job、matrix、step 和命令
2. 第一个可信错误
3. 证据与因果顺序
4. 失败分类
5. 已确认根因或排序假设
6. CI 与本地差异
7. 安全本地复现
8. 最小修复方向
9. 验证建议
10. 置信度与未知项

敏感值必须脱敏。不得包含补丁，也不得把级联错误声称为根因。
