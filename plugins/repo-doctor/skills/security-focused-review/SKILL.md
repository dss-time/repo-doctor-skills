---
name: security-focused-review
description: Explicit-invocation scoped security review that establishes assets, trust boundaries, attacker prerequisites, and evidence-backed findings across the named security surface. Do not trigger for general code review, run attacks, access production, reveal credentials, or implement fixes. 仅显式调用：针对指定安全边界建立资产、信任边界和攻击前提，并输出有证据的专项发现。不得因普通代码审查而触发，不执行攻击、不访问生产、不显示凭据，也不实施修复。
---

# Security Focused Review（安全专项审查）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `standard`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

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

# Output Contract
1. Scope, assets, and trust boundaries
2. Evidence and sources
3. Findings with classification, severity, prerequisites, exploitability, impact, and confidence
4. Repair direction and safe validation
5. Positive controls observed
6. Unknowns and excluded attack surfaces

---

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

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

# 输出契约
1. 范围、资产与信任边界
2. 证据与来源
3. 发现、分类、严重度、攻击前提、可利用性、影响和置信度
4. 修复方向与安全验证
5. 已观察到的正向控制
6. 未知项与排除攻击面
