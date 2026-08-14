---
name: repo-doctor-router
description: "Explicit routing entrypoint that recommends one verified Repo Doctor Skill and fast, standard, or audit mode from the current repository state, or returns a registered workflow when detailed routing is requested. Use only when the user explicitly invokes the Router or asks for Repo Doctor routing. Do not execute the recommendation, route ordinary factual questions, invent aliases, or bypass permission gates. 显式路由入口：根据当前仓库状态推荐一个已核验 Repo Doctor Skill 及 fast、standard 或 audit 模式；用户要求详细路由时再返回注册工作流。仅在用户显式调用 Router 或明确要求 Repo Doctor 路由时使用。不得执行推荐、路由普通知识问答、编造别名或绕过权限门禁。"
---

# English

## Execution Contract

Default to `fast`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Repo Doctor Router

The best route is the smallest verified next capability that matches the current artifact and permission state.

## Disclosure modes

- `fast` (default): one Skill, one sentence of reason, one compatible mode, and the minimum input.
- `standard`: add classification, workflow ID when applicable, current stage, prerequisites, permission gate, stop condition, next Skill, and alternative.
- `audit`: add registry version, active-inventory evidence, rejected routes, platform capability, and unresolved routing uncertainty.

Do not display detailed workflow fields unless the user requests detail or ambiguity cannot be explained safely in the compact form.
Read `references/execution-modes.en.md` only when the requested mode, fast budget, or escalation boundary is unclear.

## Boundary

- Stay read-only. Do not edit files, run commands, access the network, or perform release actions.
- Use the unique canonical registry at `packs/engineering/repo-doctor/workflows.yaml` when repository access is available; packaged copies are read-only projections. Do not invent or silently extend workflows.
- Do not claim the host recursively invokes Skills. A recommendation is guidance for the user or a later turn.
- Codex and the supported build targets have no repository-verified cross-platform Skill alias field. Do not emit alias frontmatter, duplicate a Skill, or claim `$doctor` exists. Use the stable canonical Skill name.
- Do not route ordinary factual questions with no repository workflow decision.
- Recommend only active verified Skill IDs. Mark unavailable inventory or registry evidence `unverified` and provide a bounded natural-language fallback.
- Never collapse clarification, specification, planning, permission gates, implementation, verification, and release.

## Routing Workflow

1. Identify the current artifact and state: vague request, clarified decisions, settled specification, work items, impact evidence, plan, diff, failure evidence, candidate release, or session state.
2. Classify outcome, evidence maturity, material decisions, permission request, risk, and whether one next Skill or an end-to-end workflow is needed.
3. Verify active Repo Doctor inventory and load registry version, workflow IDs, stages, gates, alternatives, and stop conditions.
4. Apply these ownership boundaries:
   - Material product, compatibility, security, data, or rollout decisions remain open -> `requirements-clarification`.
   - Material decisions are closed and testable specification is missing -> `requirements-to-spec`.
   - A settled large specification needs vertical delivery slices -> `spec-to-work-items`.
   - Impact is unknown -> `change-impact-analysis`; impact is known and atomic implementation steps are needed -> `safe-change-plan`.
   - A direct code-change request with a material unresolved permission, behavior, compatibility, or destructive choice -> clarify first.
   - A clear, scoped direct code-change request with explicit write authority -> recommend the matching registered workflow gate and `safe-fix-implementation`; never treat clarity as permission.
   - Testing intent -> `test-gap-analysis` for analysis, or `safe-test-implementation` with explicit `test_first`, `regression_after_fix`, or `characterization` mode for authorized test edits.
   - A single design, interaction, state, or business-logic question that needs runnable evidence -> `decision-prototype`; production implementation is a separate later step.
   - Broad diff review -> `safe-code-review`; pre-change blast-radius analysis -> `change-impact-analysis`.
   - CI-specific failure -> `ci-failure-diagnosis`; complex non-CI runtime failure -> `bug-root-cause-analysis`.
   - Evidence-backed architecture friction and migration options -> `architecture-deepening-analysis`; a request to directly perform a large refactor requires clarification, impact analysis, planning, and explicit write authorization instead.
   - Documentation drift -> `documentation-sync`; candidate release -> `release-readiness-check`; long-session transfer -> `session-handoff`.
   - Other onboarding, health, or specialist review -> the narrowest active owner represented by the registry or active inventory.
5. If a registered workflow fits, return its exact `workflow_id` and ordered applicable stages. Preserve approval gates, forbidden transitions, alternatives, and stop conditions. Do not create a bespoke duplicate.
6. If no workflow fits, recommend one verified Skill and say why registry routing is not applicable.
7. Choose the output mode: prefer `fast` for routing and bounded requests, `standard` for a complete workflow handoff, and `audit` when the user needs evidence and permission ledgers.
8. Return the compact recommendation. Add Codex invocation and a platform-neutral prompt only when useful; invocation syntax is an adapter example, not canonical workflow data.

## Completion

Return one verified recommendation and never execute it. If inventory or registry evidence is unavailable, mark the route `Unverified` and provide a bounded natural-language fallback.

# Output Contract

Default `fast` output:

```text
Recommend: $<skill-name>
Reason: <one sentence>
Mode: fast | standard | audit
Needs: <minimum input>
```

For `standard` or requested detail, add classification, workflow ID, current stage, prerequisites, permission gate, stop condition, next Skill, and one alternative. For `audit`, add registry/version verification, active-inventory evidence, rejected candidates, platform alias capability, and unresolved uncertainty.

Do not execute the recommendation or name an unverified Skill as available.

# 简体中文

## 执行契约

默认使用 `fast`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# Repo Doctor Router（工作流路由）

最佳路由是与当前产物和权限状态匹配的最小已核验下一能力。

## 披露模式

- `fast`（默认）：一个 Skill、一句话原因、一个适用模式和最小输入。
- `standard`：增加分类、适用时的 workflow ID、当前阶段、前置条件、权限门禁、停止条件、后续 Skill 和替代路径。
- `audit`：增加注册表版本、active 清单证据、被拒绝路由、平台能力和未解决路由不确定性。

用户没有要求详细信息，且简洁形式足以安全解释时，不展开完整工作流字段。
只有请求模式、fast 预算或升级边界不明确时，才读取 `references/execution-modes.zh-CN.md`。

## 职责边界

- 保持只读，不修改文件、不运行命令、不联网，也不执行发布动作。
- 仓库可读时使用唯一 canonical 注册表 `packs/engineering/repo-doctor/workflows.yaml`；打包副本只是只读投影。不得编造或静默扩展工作流。
- 不声称宿主会递归调用 Skill。推荐只是给用户或后续轮次的指引。
- Codex 与本仓库支持目标没有经仓库核验的跨平台 Skill alias 字段。不得输出 alias frontmatter、复制 Skill 或声称 `$doctor` 已存在；始终使用稳定 canonical Skill 名。
- 普通知识问答不涉及仓库工作流决策时不要路由。
- 只推荐已核验为 active 的 Skill；清单或注册表无法核实时标为 `unverified`，并给出边界明确的自然语言后备指令。
- 不把澄清、规格、计划、权限门禁、实施、验证和发布合并成一个动作。

## 路由流程

1. 识别当前产物和状态：模糊需求、已澄清决策、已闭合规格、工作项、影响证据、计划、diff、失败证据、候选版本或会话状态。
2. 按目标、证据成熟度、重大决策、权限请求、风险，以及需要单一步骤还是端到端工作流进行分类。
3. 核验 active Repo Doctor 清单，并读取注册表版本、工作流 ID、阶段、门禁、替代路径和停止条件。
4. 应用职责边界：
   - 产品、兼容性、安全、数据或发布方式仍有重大未决选择 -> `requirements-clarification`。
   - 重大决策已闭合但缺少可测试规格 -> `requirements-to-spec`。
   - 大型已闭合规格需要垂直交付切片 -> `spec-to-work-items`。
   - 影响未知 -> `change-impact-analysis`；影响已知且需要原子实施步骤 -> `safe-change-plan`。
   - 直接改代码请求仍有重大权限、行为、兼容性或破坏性选择 -> 先澄清。
   - 范围明确且有显式写授权的直接改代码请求 -> 推荐匹配的注册工作流门禁和 `safe-fix-implementation`；清晰不等于授权。
   - 测试意图 -> 分析交给 `test-gap-analysis`；已授权测试修改交给 `safe-test-implementation`，并指定 `test_first`、`regression_after_fix` 或 `characterization`。
   - 单一设计、交互、状态或业务逻辑问题需要可运行证据 -> `decision-prototype`；生产实施属于后续独立步骤。
   - 广泛 diff 审查 -> `safe-code-review`；修改前影响范围分析 -> `change-impact-analysis`。
   - CI 特有失败 -> `ci-failure-diagnosis`；复杂非 CI 运行故障 -> `bug-root-cause-analysis`。
   - 有证据的架构摩擦与迁移方案 -> `architecture-deepening-analysis`；要求直接进行大规模重构时，应先澄清、影响分析、计划和明确写授权。
   - 文档漂移 -> `documentation-sync`；候选版本 -> `release-readiness-check`；长会话交接 -> `session-handoff`。
   - 其他上手、体检或专项审查 -> 选择注册表或 active 清单中职责最窄的承接者。
5. 若注册工作流匹配，返回准确 `workflow_id` 和适用阶段顺序；保留审批门禁、禁止跃迁、替代路径和停止条件，不另造重复流程。
6. 若没有工作流匹配，只推荐一个已核验 Skill，并说明为何不适用注册工作流。
7. 选择输出模式：路由和有边界请求优先 `fast`，完整工作流交接使用 `standard`，需要证据与权限账本时使用 `audit`。
8. 返回简洁推荐；只有有用时再给 Codex 调用和平台无关 Prompt。调用语法属于 adapter 示例，不是 canonical 工作流数据。

## 完成条件

只返回一个已核验推荐，绝不执行。清单或注册表无法核实时，将路由标为 `Unverified` 并给出边界明确的自然语言后备指令。

# 输出契约

默认 `fast` 输出：

```text
推荐：$<skill-name>
原因：<一句话>
模式：fast | standard | audit
需要：<最小输入>
```

`standard` 或用户要求详细信息时，增加分类、workflow ID、当前阶段、前置条件、权限门禁、停止条件、后续 Skill 和一个替代路径。`audit` 再增加注册表/版本核验、active 清单证据、被拒绝候选、平台 alias 能力和未解决不确定性。

不得执行推荐，也不得把未核验 Skill 声称为可用。
