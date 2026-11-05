---
name: security-focused-review
description: "Explicit-invocation scoped security review that establishes assets, trust boundaries, attacker prerequisites, and evidence-backed findings across the named security surface. Do not trigger for general code review, run attacks, access production, reveal credentials, or implement fixes. 仅显式调用：针对指定安全边界建立资产、信任边界和攻击前提，并输出有证据的专项发现。不得因普通代码审查而触发，不执行攻击、不访问生产、不显示凭据，也不实施修复。"
---

# English

## Permission Contract

These capability limits come from Skill metadata, not user authorization. Allowed capabilities remain subject to the user's authorized scope and stricter conditions in the instructions.
- Read files: only within authorized scope and this Skill's conditions.
- Write or modify files: prohibited.
- Run shell commands: prohibited.
- Access the network: prohibited.
- Perform destructive actions: prohibited.
An explicit exception for isolated temporary artifacts applies only under all of its stated conditions; it does not grant general write or deletion permission.

## Execution Contract

Default to `standard`; explicit invocation is required.
Complete one primary task by default. Continue an authorized end-to-end workflow within each Skill's permissions; Router remains recommendation-only. Pause for new material decisions or scope, not authorization already given.
For authorized multi-stage work, evidence reuse or recovery, read `references/workflow-coordination.en.md`; optionally use `references/workflow-coordination.mjs` and `references/workflows.yaml`. Provide manual handoff when host execution is unavailable.
For a human-only blocker, give location, action, success signal and resume step; never request secret values or assume completion.
Validate according to actual risk; security, production, migrations, releases and other high-risk work use `audit`. Read `references/execution-modes.en.md` only when mode selection is unclear.

# Security Focused Review

Perform a defensive, scoped security review. Do not attack systems, access production, or implement fixes.

## Boundary
- Route broad correctness review to `safe-code-review`, repository-wide health to `project-health-check`, and implementation to `safe-fix-implementation`.
- Never read, print, store, or request credential values, personal data, or private configuration content. Report names and locations only.
- Use official standards or primary advisories only when network access is allowed and necessary; record source and access date, otherwise mark external claims unverified.
- Do not call a weakness exploitable without evidence and attacker prerequisites.

## Workflow
1. Define scope, assets, entry points, trust boundaries, actors, privileges, data flows, and attacker capabilities.
2. Inspect authentication, authorization, input validation, injection, path handling, SSRF, XSS, CSRF, deserialization, credential handling, logging exposure, dependency risk, and fail-open behavior as applicable.
3. Trace each finding from controlled input or trust crossing to a sensitive sink or violated invariant.
4. Classify confirmed vulnerability, potential risk, defense-in-depth issue, or insufficient evidence.
5. For every finding report location, evidence, attack prerequisites, exploitability, impact, severity, confidence, repair direction, and safe validation.
6. Avoid active exploitation; propose non-destructive tests or review evidence only.

Read [execution boundaries](references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

## Evidence-driven checks
- Separate authentication from server-side object and tenant authorization. Trace actor, resource lookup, policy check and effect; client UI restrictions alone are not enforcement.
- For each relevant input, trace validation/canonicalization to the database, filesystem, network, template, process or deserializer sink. Check ordering before effects, fail-closed errors and actual framework safeguards before reporting a vulnerability.
- For uploads and paths, inspect resolved containment, platform separators, symlink handling and check/use races when relevant. For outbound requests, inspect destination/redirect controls and internal-network exposure.
- Inspect credential handling through configuration references and redacted evidence only. Dependency findings require affected version and reachable conditions; unavailable advisory lookup remains unknown.
- Compare negative cases with positive controls: an unauthorized actor must fail while an authorized actor still succeeds. Identify the exact violated invariant, source location and minimum safe regression test. Never infer exploitability from a dangerous API name alone.
- Report selected language/runtime profiles and exclusions. Distinguish confirmed, potential, defense-in-depth and unknown results; do not label the whole project secure from bounded coverage.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.

# Output Contract
1. Scope, assets, and trust boundaries
2. Evidence and sources
3. Findings with classification, severity, prerequisites, exploitability, impact, and confidence
4. Repair direction and safe validation
5. Positive controls observed
6. Unknowns and excluded attack surfaces

7. Selected language/runtime profiles, excluded checks and regression expectations

# 简体中文

## 权限契约

以下能力边界来自 Skill 元数据，不构成用户授权；允许的能力仍须遵守用户授权范围和正文中更严格的条件。
- 读取文件：仅限已授权范围及本 Skill 的条件内。
- 写入或修改文件：禁止。
- 执行 Shell 命令：禁止。
- 访问网络：禁止。
- 执行破坏性操作：禁止。
正文明确规定的隔离临时产物例外仅适用于该例外的全部条件，不扩大为一般写入或删除权限。

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
默认完成一个主任务。用户已授权完整流程时，在各 Skill 权限内连续完成；Router 仍只推荐。新重大决策或超出授权时暂停，不重复索取已有授权。
仅在已授权多阶段协作、证据复用或恢复时读取 `references/workflow-coordination.zh-CN.md`；按需使用 `references/workflow-coordination.mjs` 和 `references/workflows.yaml`，宿主不支持执行时提供人工交接。
必须由用户完成的阻塞步骤：给出操作位置、具体动作、成功标志、恢复步骤；不要求粘贴秘密值，不代替用户确认完成。
按实际风险选择验证；安全、生产、迁移、发布等高风险工作使用 `audit`。模式不明确时才读取 `references/execution-modes.zh-CN.md`。

# 安全专项审查

执行防御性、范围明确的安全审查，不攻击系统、不访问生产、不实施修复。

## 职责边界
- 广泛正确性审查交给 `safe-code-review`，全仓健康交给 `project-health-check`，实施交给 `safe-fix-implementation`。
- 不读取、输出、记录或索取凭证值、个人数据和私有配置内容，只报告名称和位置。
- 仅在允许且必要时使用官方标准或原始公告，记录来源和访问日期；否则外部主张标为未验证。
- 没有证据和攻击前提时，不得声称问题可利用。

## 工作流程
1. 明确范围、资产、入口、信任边界、参与者、权限、数据流和攻击者能力。
2. 按适用情况检查认证、授权、输入校验、注入、路径处理、SSRF、XSS、CSRF、反序列化、凭证处理、日志泄漏、依赖风险和 fail-open 行为。
3. 将每个发现从受控输入或信任边界跨越追踪到敏感 sink 或不变量破坏。
4. 分类为已证实漏洞、潜在风险、纵深防御问题或证据不足。
5. 每项报告位置、证据、攻击前提、可利用性、影响、严重度、置信度、修复方向和安全验证。
6. 避免主动利用，只建议非破坏测试或审查证据。

读取[执行边界](references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

## 基于证据的检查
- 区分认证与服务端对象/租户授权。追踪操作者、资源查询、策略判断和副作用；客户端 UI 限制不等于权限执行。
- 对相关输入追踪验证/规范化到数据库、文件、网络、模板、进程或反序列化操作。报告前检查副作用前的执行顺序、错误时失败关闭及框架实际防护。
- 对上传和路径检查解析后的包含关系、平台分隔符、相关符号链接处理及检查/使用竞态。对外发请求检查目标/重定向限制和内网暴露。
- 仅通过配置引用及脱敏证据检查秘密处理。依赖漏洞需要受影响版本和可达条件，无法查询公告时保留未知。
- 对照拒绝案例和正向控制：未授权者应失败，已授权者仍应成功。指出违反的不变量、源码位置及最小安全回归测试。不能仅凭危险 API 名称推断可利用性。
- 报告选择的语言/运行时规则和排除项。区分已确认、潜在、纵深防御和未知结果，不将有限检查表述为整个项目安全。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。

# 输出契约
1. 范围、资产与信任边界
2. 证据与来源
3. 发现、分类、严重度、攻击前提、可利用性、影响和置信度
4. 修复方向与安全验证
5. 已观察到的正向控制
6. 未知项与排除攻击面

7. 已选语言/运行时规则、排除检查及回归预期
