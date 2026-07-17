---
name: repo-doctor-router
description: Classify the current repository task and recommend one existing Repo Doctor Skill or an ordered workflow without executing it. Use when the user is entering an unfamiliar repository, is unsure which Skill to choose, or needs the next safe step across clarification, specification, planning, implementation, testing, review, diagnosis, release readiness, or session transfer; do not use for ordinary questions with no repository workflow decision. 对当前仓库任务分类，并推荐一个现有 Repo Doctor Skill 或有序工作流，但不执行被推荐能力。用于初次进入陌生仓库、不知道选择哪个 Skill，或需要在澄清、规格、计划、实施、测试、审查、诊断、发布检查与会话交接之间选择安全下一步；普通问答不涉及仓库工作流决策时不要触发。
---

# Repo Doctor Router（Repo Doctor Router（工作流路由））

Use the section matching the user's language. 使用与用户输入语言一致的章节。

# Repo Doctor Router

Classify the current engineering state and recommend the next existing Repo Doctor Skill or an ordered workflow. Recommend only; do not execute a routed Skill.

## Boundary

- Stay read-only. Do not edit files, run commands, access the network, or perform release actions.
- Do not claim that the host can invoke Skills recursively. A recommendation is guidance for the user or next agent turn.
- Do not route ordinary factual questions, explanations, or casual conversation that require no repository workflow.
- Recommend only active Skill IDs verified from the current Pack or Skill catalog. If inventory cannot be checked, mark the recommendation `unverified` and provide a natural-language next instruction instead of inventing an ID.
- Do not collapse clarification, specification, planning, implementation, verification, and release into one implicit action.

## Routing Workflow

1. Read the user's request and supplied repository context. Identify the current artifact: question, vague request, clarified decisions, specification, work-item plan, diff, failure evidence, release candidate, or session state.
2. Classify the task by state, requested outcome, evidence maturity, permissions, risk, and whether the user needs one next step or a full workflow.
3. Check the active Repo Doctor inventory before naming a Skill. Reject stale, missing, deprecated, or out-of-Pack references.
4. Select the narrowest owner from this routing map:
   - unfamiliar repository -> `repo-onboarding`;
   - decisions still materially open -> `requirements-clarification`;
   - decisions closed and an implementable specification is needed -> `requirements-to-spec`;
   - large specification needs independently verifiable slices -> `spec-to-work-items`;
   - modification scope or compatibility impact is uncertain -> `change-impact-analysis`;
   - confirmed change needs an atomic implementation plan -> `safe-change-plan`;
   - one confirmed small production fix is authorized -> `safe-fix-implementation`;
   - testing needs assessment -> `test-gap-analysis`; authorized test-only edits -> `safe-test-implementation`;
   - broad diff or PR review -> `safe-code-review`;
   - CI-specific failure -> `ci-failure-diagnosis`; complex non-CI bug -> `bug-root-cause-analysis`;
   - dependency, database, API, security, performance, configuration, or dead-code concern -> the matching specialist Skill;
   - documentation drift -> `documentation-sync`; durable architecture decision -> `architecture-decision-record`;
   - concrete candidate release -> `release-readiness-check`;
   - long session or agent transition -> `session-handoff`;
   - broad repository condition with no narrower question -> `project-health-check`.
5. Build the shortest safe workflow. Insert clarification, impact analysis, tests, review, or release gates only when the task evidence and risk require them.
6. State required inputs, permission boundaries, alternatives, and conditions that should stop or reroute the workflow.
7. Provide both forms: a Codex example such as `$requirements-clarification` and a platform-neutral instruction such as “Clarify the unresolved product and compatibility decisions before writing a specification.” If explicit invocation is unsupported, provide one copyable natural-language next prompt.

## Completion Conditions

Finish only when the classification, verified next Skill, ordered workflow, reason, inputs, safety notes, alternatives, and stop conditions are all present. If no current Skill owns the task, say so and recommend a bounded natural-language next step; never fabricate a Skill.

# Output Contract

1. `task_classification`
2. `recommended_next_skill`, including inventory verification status
3. `recommended_workflow`, in execution order
4. `reason`
5. `required_inputs`
6. `safety_notes`
7. `alternatives`
8. `stop_conditions`
9. Invocation examples: Codex `$skill-name`, platform-neutral natural language, and a copyable fallback prompt when explicit Skill invocation is unavailable

Do not execute the recommendation. Do not name a Skill that is absent from the verified active inventory.

---

# Repo Doctor Router（工作流路由）

判断当前工程任务所处状态，推荐下一个现有 Repo Doctor Skill 或有序工作流。只推荐，不执行被路由的 Skill。

## 职责边界

- 保持只读，不修改文件、不运行命令、不联网，也不执行发布动作。
- 不声称宿主平台能够递归调用 Skill；推荐只是给用户或下一轮 Agent 的操作指引。
- 普通知识问答、解释或闲聊不需要仓库工作流时不要路由。
- 命名 Skill 前必须从当前 Pack 或 Skill 目录验证其为 active；无法核实时将推荐标为 `unverified`，改为给自然语言下一步，不得编造 ID。
- 不把澄清、规格、计划、实施、验证和发布隐式合并成一个动作。

## 路由流程

1. 阅读用户请求和已提供的仓库上下文，识别当前产物：问题、模糊需求、已确认决策、规格、工作项计划、diff、失败证据、候选版本或会话状态。
2. 按任务状态、目标、证据成熟度、权限、风险，以及用户需要单一步骤还是完整工作流进行分类。
3. 命名 Skill 前核对 active Repo Doctor 清单；拒绝过期、不存在、已弃用或不属于当前 Pack 的引用。
4. 从下列路由表选择职责最窄的承接者：
   - 初次进入陌生仓库 -> `repo-onboarding`；
   - 仍有会实质改变实现的决策 -> `requirements-clarification`；
   - 决策已闭合，需要可实施规格 -> `requirements-to-spec`；
   - 大规格需要拆成可独立验证切片 -> `spec-to-work-items`；
   - 修改范围或兼容影响不清楚 -> `change-impact-analysis`；
   - 已确认变更需要原子实施计划 -> `safe-change-plan`；
   - 已授权实施一个已确认的小型生产修复 -> `safe-fix-implementation`；
   - 需要评估测试 -> `test-gap-analysis`；已授权只改测试 -> `safe-test-implementation`；
   - 广泛 diff 或 PR 审查 -> `safe-code-review`；
   - CI 特有失败 -> `ci-failure-diagnosis`；复杂非 CI Bug -> `bug-root-cause-analysis`；
   - 依赖、数据库、API、安全、性能、配置或死代码问题 -> 对应专项 Skill；
   - 文档漂移 -> `documentation-sync`；长期架构决定 -> `architecture-decision-record`；
   - 具体候选版本 -> `release-readiness-check`；
   - 会话过长或更换 Agent -> `session-handoff`；
   - 没有更窄问题的全仓状态评估 -> `project-health-check`。
5. 组成最短安全工作流；只有证据和风险需要时才插入澄清、影响分析、测试、审查或发布门禁。
6. 说明必要输入、权限边界、替代路径，以及应该停止或改路由的条件。
7. 同时给出两种调用：Codex 示例（如 `$requirements-clarification`）和平台无关自然语言指令。平台不支持显式调用时，提供一条可复制的自然语言下一步 Prompt。

## 完成条件

只有 `task_classification`、已验证的下一 Skill、有序工作流、原因、必要输入、安全说明、替代方案和停止条件齐全才结束。没有现有 Skill 承接时应明确说明，并给出边界明确的自然语言下一步，绝不编造 Skill。

# 输出契约

1. `task_classification`
2. `recommended_next_skill`，包括清单核验状态
3. `recommended_workflow`，按执行顺序排列
4. `reason`
5. `required_inputs`
6. `safety_notes`
7. `alternatives`
8. `stop_conditions`
9. 调用示例：Codex `$skill-name`、平台无关自然语言，以及不支持显式 Skill 调用时的可复制 Prompt

不得执行推荐，也不得命名不在已验证 active 清单中的 Skill。
