---
name: repo-doctor-router
description: Classify the current repository task and recommend one existing Repo Doctor Skill or an ordered workflow without executing it. Use when the user is entering an unfamiliar repository, is unsure which Skill to choose, or needs the next safe step across clarification, specification, planning, implementation, testing, review, diagnosis, release readiness, or session transfer; do not use for ordinary questions with no repository workflow decision. 对当前仓库任务分类，并推荐一个现有 Repo Doctor Skill 或有序工作流，但不执行被推荐能力。用于初次进入陌生仓库、不知道选择哪个 Skill，或需要在澄清、规格、计划、实施、测试、审查、诊断、发布检查与会话交接之间选择安全下一步；普通问答不涉及仓库工作流决策时不要触发。
---

# Repo Doctor Router（工作流路由）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

# Repo Doctor Router

Classify the current engineering state and recommend the next existing Repo Doctor Skill or one registered workflow. Recommend only; never execute a routed Skill.

## Boundary

- Stay read-only. Do not edit files, run commands, access the network, or perform release actions.
- Use the unique canonical registry at `packs/engineering/repo-doctor/workflows.yaml` when repository access is available; packaged copies are read-only projections. Do not invent or silently extend workflows.
- Do not claim the host recursively invokes Skills. A recommendation is guidance for the user or a later turn.
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
   - Broad diff review -> `safe-code-review`; pre-change blast-radius analysis -> `change-impact-analysis`.
   - CI-specific failure -> `ci-failure-diagnosis`; complex non-CI runtime failure -> `bug-root-cause-analysis`.
   - Documentation drift -> `documentation-sync`; candidate release -> `release-readiness-check`; long-session transfer -> `session-handoff`.
   - Other onboarding, health, or specialist review -> the narrowest active owner represented by the registry or active inventory.
5. If a registered workflow fits, return its exact `workflow_id` and ordered applicable stages. Preserve approval gates, forbidden transitions, alternatives, and stop conditions. Do not create a bespoke duplicate.
6. If no workflow fits, recommend one verified Skill and say why registry routing is not applicable.
7. Provide Codex invocation and a platform-neutral copyable prompt; platform syntax is an example, not canonical workflow data.

## Completion

Return classification, registry verification, `workflow_id` when applicable, next Skill, applicable stages, reason, inputs, permission gates, alternatives, and stop conditions. Do not execute the recommendation.

# Output Contract

1. `task_classification`
2. `registry`: ID, version, and verification status
3. `workflow_id` or `not_applicable`
4. `recommended_next_skill`, including inventory verification
5. `applicable_stages`, in registry order
6. `reason`
7. `required_inputs`
8. `permission_gates`
9. `alternatives`
10. `stop_conditions`
11. Codex invocation and platform-neutral copyable prompt

Do not execute the recommendation or name an unverified Skill as available.

---

# Repo Doctor Router（工作流路由）

判断当前工程状态，推荐下一个现有 Repo Doctor Skill 或一个已注册工作流。只推荐，绝不执行被路由的 Skill。

## 职责边界

- 保持只读，不修改文件、不运行命令、不联网，也不执行发布动作。
- 仓库可读时使用唯一 canonical 注册表 `packs/engineering/repo-doctor/workflows.yaml`；打包副本只是只读投影。不得编造或静默扩展工作流。
- 不声称宿主会递归调用 Skill。推荐只是给用户或后续轮次的指引。
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
   - 广泛 diff 审查 -> `safe-code-review`；修改前影响范围分析 -> `change-impact-analysis`。
   - CI 特有失败 -> `ci-failure-diagnosis`；复杂非 CI 运行故障 -> `bug-root-cause-analysis`。
   - 文档漂移 -> `documentation-sync`；候选版本 -> `release-readiness-check`；长会话交接 -> `session-handoff`。
   - 其他上手、体检或专项审查 -> 选择注册表或 active 清单中职责最窄的承接者。
5. 若注册工作流匹配，返回准确 `workflow_id` 和适用阶段顺序；保留审批门禁、禁止跃迁、替代路径和停止条件，不另造重复流程。
6. 若没有工作流匹配，只推荐一个已核验 Skill，并说明为何不适用注册工作流。
7. 同时给出 Codex 调用示例和平台无关可复制 Prompt；平台语法只是示例，不是 canonical 工作流数据。

## 完成条件

输出分类、注册表核验、适用时的 `workflow_id`、下一 Skill、适用阶段、原因、输入、权限门禁、替代路径和停止条件。不得执行推荐。

# 输出契约

1. `task_classification`
2. `registry`：ID、版本和核验状态
3. `workflow_id` 或 `not_applicable`
4. `recommended_next_skill`，包括清单核验状态
5. `applicable_stages`，按注册表顺序
6. `reason`
7. `required_inputs`
8. `permission_gates`
9. `alternatives`
10. `stop_conditions`
11. Codex 调用示例和平台无关可复制 Prompt

不得执行推荐，也不得把未核验 Skill 声称为可用。
