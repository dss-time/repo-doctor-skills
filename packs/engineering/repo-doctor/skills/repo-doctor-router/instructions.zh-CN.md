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
