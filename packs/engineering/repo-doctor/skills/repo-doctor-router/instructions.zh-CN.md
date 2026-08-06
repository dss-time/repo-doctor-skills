# Repo Doctor Router（工作流路由）

最佳路由是与当前产物和权限状态匹配的最小已核验下一能力。

## 披露模式

- `fast`（默认）：一个 Skill、一句话原因、一个适用模式和最小输入。
- `standard`：增加分类、适用时的 workflow ID、当前阶段、前置条件、权限门禁、停止条件、后续 Skill 和替代路径。
- `audit`：增加注册表版本、active 清单证据、被拒绝路由、平台能力和未解决路由不确定性。

用户没有要求详细信息，且简洁形式足以安全解释时，不展开完整工作流字段。

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
