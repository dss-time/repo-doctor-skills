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
