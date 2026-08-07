---
name: release-readiness-check
description: Explicit-invocation, evidence-backed, read-only release gate for a specific candidate version, returning GO, GO WITH CONDITIONS, or NO-GO after full release checks. Do not trigger for ordinary validation or project health, and never execute release, commit, tag, push, or version changes. 仅显式调用：针对具体候选版本执行有证据的只读发布门禁，完成发布检查后给出 GO、GO WITH CONDITIONS 或 NO-GO。不得因普通验证或项目体检而触发，也不执行发布、提交、tag、push 或版本修改。
---

# Release Readiness Check（发布就绪检查）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `standard`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Release Readiness Check

Evaluate a specific release candidate and return an evidence-backed `GO`, `GO WITH CONDITIONS`, or `NO-GO`. Keep the check read-only.
When the request explicitly names local gates to run, resolve their repository commands from the nearest manifest, execute that finite gate list before broader audit work, capture every status, and then continue the read-only assessment.
If the request says to run the full local test, typecheck, or build gates, executing the corresponding full package-manager scripts is mandatory. Run those scripts before inspecting their implementations; reading a script, running a narrower command, or predicting its result never satisfies the gate.

## Boundary

- Require a release object such as a version, branch, commit, tag candidate, build artifact, or explicit change range. Route broad repository diagnosis to `project-health-check`.
- Do not publish, deploy, commit, tag, push, change versions, edit files, or approve despite unresolved blockers.
- Read-only prohibits source and configuration edits; it does not prohibit user-authorized local validation commands or their disposable generated outputs.
- Use only repository-provided validation commands and actual results. Mark checks not run and explain why.
- When the user authorizes a finite list of independent local gates, run every listed gate even if an earlier gate fails; stop only when a later gate depends on the failed one or would be unsafe.
- Do not expose credential values or private data when scanning evidence.
- A checklist without reproducible evidence is insufficient.

## Workflow

1. Define the release object, target environment, change range, included artifacts, and comparison baseline.
2. Inspect workspace status, version consistency, change scope, dependency lockfiles, generated outputs, and untracked or temporary files.
3. Identify repository-provided test, build, lint, typecheck, schema, package, and release verification commands. Execute every gate the user explicitly requested and authorized; inspecting its script is not a substitute. Record actual results or `not run`.
4. Check API, database, configuration, permission, runtime, and platform compatibility; migration ordering; rollback feasibility; and forward/backward compatibility where applicable.
5. Check documentation, CHANGELOG, release notes, deprecations, migration guidance, and operator/user communication against the actual change.
6. Scan for credential-like material, private data, debug code, disabled checks, temporary files, absolute machine paths, and unexpected generated artifacts without revealing sensitive values.
7. Classify findings as blockers, pre-release conditions, recommendations, or post-release observations. Attach evidence and an owner/action when available.
8. Evaluate rollback readiness, observability, monitoring signals, and stop or rollback thresholds.
9. Return exactly one decision: `GO`, `GO WITH CONDITIONS`, or `NO-GO`, with conditions and next steps tied to evidence.

# Output Contract

1. Release object and baseline
2. Check scope and evidence sources
3. Passed checks with commands or file evidence
4. Blocking items
5. Conditional items and pre-release actions
6. Risks and post-release observations
7. Rollback readiness and thresholds
8. Final decision: GO, GO WITH CONDITIONS, or NO-GO
9. Next steps

List unrun checks explicitly. Do not perform release actions.

---

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 发布就绪检查

评估具体候选版本，并给出有证据的 `GO`、`GO WITH CONDITIONS` 或 `NO-GO`。保持只读。
请求明确列出要运行的本地门禁时，先从最近的清单解析仓库命令，在扩展审计前执行这组有限门禁并记录每项状态，然后继续只读评估。
请求要求运行完整本地测试、类型检查或构建门禁时，必须执行清单中对应的完整包管理器脚本。先执行这些脚本，再检查脚本实现；只读取脚本、运行更窄命令或推测结果都不算完成门禁。

## 职责边界

- 需要版本、分支、commit、候选 tag、构建产物或明确变更范围等发布对象；广泛仓库诊断交给 `project-health-check`。
- 不发布、不部署、不提交、不打 tag、不 push、不修改版本或文件，也不得在阻塞项未解决时批准发布。
- 只读禁止修改源文件和配置，但不禁止执行用户已授权的本地验证命令及其可丢弃生成物。
- 只使用仓库提供的验证命令和真实结果；未运行项必须标明并解释原因。
- 用户明确授权一组有限且相互独立的本地门禁时，即使前一项失败，也要执行全部列明门禁；只有后续门禁依赖失败项或继续执行不安全时才停止。
- 扫描证据时不得暴露密钥或私有数据。
- 没有可复现证据的笼统 checklist 不足以支持结论。

## 工作流程

1. 明确发布对象、目标环境、变更范围、包含产物和比较基线。
2. 检查工作区状态、版本一致性、变更范围、依赖锁文件、生成物、未跟踪或临时文件。
3. 识别仓库提供的测试、构建、lint、typecheck、schema、打包和发布验证命令；执行用户明确要求并授权的每一项门禁，读取脚本不能替代执行；记录真实结果或“未运行”。
4. 检查 API、数据库、配置、权限、运行时和平台兼容性，以及迁移顺序、回滚可行性和适用的前后向兼容。
5. 根据实际变更检查文档、CHANGELOG、发布说明、弃用、迁移指南和用户/运维通知。
6. 扫描疑似密钥、私有数据、调试代码、禁用检查、临时文件、机器绝对路径和异常生成物，但不展示敏感值。
7. 将发现分类为阻塞项、发布前条件、建议或发布后观察项；附证据及可用的负责人/动作。
8. 评估回滚准备、可观察性、监控信号以及停止或回滚阈值。
9. 只给一个结论：`GO`、`GO WITH CONDITIONS` 或 `NO-GO`，条件和下一步必须关联证据。

# 输出契约

1. 发布对象与基线
2. 检查范围与证据来源
3. 通过项及命令或文件证据
4. 阻塞项
5. 条件项与发布前动作
6. 风险与发布后观察项
7. 回滚准备与阈值
8. 最终结论：GO、GO WITH CONDITIONS 或 NO-GO
9. 下一步

明确列出未运行检查，不执行发布动作。
