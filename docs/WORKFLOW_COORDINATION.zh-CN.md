# 工作流协同与增量执行

串行协同、结构化交接和确定性证据检查已随稳定版 0.10.0 发布，采用 Task Context v2。Codex CLI 单点修改、协调恢复试验及独立核心审查已通过。当前文档补丁沿用这些运行组件，实际验证范围为 Codex CLI 串行宿主适配。

## 现状与增量设计

| 已有能力 | 原来的限制 | 本次增量 |
|---|---|---|
| 唯一 workflows.yaml：条件、依赖、审批门禁、禁止跳转 | 定义和静态契约校验为主，没有通用任务运行状态 | 直接解释原有阶段与前置依赖，不复制工作流定义 |
| 执行契约允许授权范围内连续工作 | 复用可靠证据主要依赖临场判断 | 明确有效、失效、未知及可解释下一动作 |
| feature-implementation 行为切片、三种测试模式 | 各阶段输出之间缺少统一引用 | Task Context 与来源证据、验收 claim 映射 |
| safe-code-review 三轴独立审查 | 已审查结果与新 diff 的关系没有统一绑定 | 当前文件、基线、验收和决策共同形成 reviewBinding |
| live-evidence-binding 与 live-evidence-checkpoint | 面向模型评估、整树绑定，不能替代开发任务局部验证 | 沿用内容绑定/不自动重试语义失败的原则，新增任务依赖范围绑定 |
| session-handoff | 摘要本身不能证明恢复时仍有效 | JSON 续接、当前来源/环境/授权重新核验 |

协调模块采用 Node.js ESM。当前 Registry 为版本 6，定义 13 条工作流，分发包含 33 个 active Skills。普通开发流程的发布阶段改成有条件适用，明确的 release-preparation 发布检查仍为必需；Bug 工作流的回归测试编写允许在已有充分测试时不适用，但目标行为验证仍必须提供。

## 模块与权威

- `packs/engineering/repo-doctor/references/workflow-coordination.mjs`：任务、证据、状态推进、恢复函数；不执行命令、不联网、不写状态文件。
- `packs/engineering/repo-doctor/workflows.yaml`：仍为唯一工作流与风险义务来源；安全/数据库/公共接口风险引用既有专项 Skill。
- `schemas/task-context.schema.json`：可移植摘要格式；不是授权凭证。
- 同目录双语 coordination references：按需加载的宿主执行协议。
- 原有构建/同步脚本：为各目标分发同一实现及 Registry，继续保留权限契约。
- `scripts/test-workflow-coordination.mjs`：使用临时目录、真实文件和 Node 测试命令验证 A—G 与反例。

宿主负责理解需求、检查影响和依赖完整性、判断实际风险、核验原始来源、检查 Skill 正文中比 metadata 更严格的边界、执行已授权工具。模块负责可机械判断的绑定、条件推进、证据状态与门禁交集。字段 `scopeReviewed` 是宿主完成这些检查后的声明，不是模块自动发现了全部风险。

## API 与接入

导入分发包中的 `references/workflow-coordination.mjs`，或仓库 canonical 模块。Registry 由宿主使用已有 YAML 解析器读取；Skill inventory 可复用 `discoverSkillInventory`，独立安装环境由宿主提供当前真实清单。Node 不可用或不允许执行时，按双语 reference 人工交接，不声称机器验证。

```js
const task = createTask({
  id: 'task-1', goal: '修复已确认的局部问题',
  acceptance: ['original-bug-fixed'],
  skill_id: 'safe-fix-implementation', // 或 workflow_id: 'bug-repair'
}, registry, inventory);

// host 必须来自当前可信宿主；绝不能由导入 JSON 展开生成。
const action = nextAction(task, host);
// execute/risk_check/permission_blocked 等只是决策，不会调用工具。
```

宿主适配输入包含：

| 字段 | 含义 |
|---|---|
| registry / inventory | 已校验的当前定义与 active Skill 权限 |
| root / environment | 仓库根与影响验证的非敏感环境版本 |
| trustedEvidence | 宿主核验过的完整证据摘要 Set；恢复后重新建立 |
| conditions | `value / reason / evidence_ids`；未知不默认为 false |
| grants | 来自当前用户授权的任务 ID、能力、Skill、精确路径/操作和来源 |
| capabilities / requests | 宿主能力与每阶段拟执行操作；Shell 还需预检 |
| scopeReviewed / risks / activeStops / openDecisions | 当前风险、停止谓词与决策评估；不得从旧摘要盲目信任 |
| reviewBinding / deliveryRequirements | 当前审查基线与任务实际需要的额外验证义务 |
| continuationAuthorized / execution | 连续流程授权；`same_agent` 或人工交接 |
| reuse / reconciled | 已核验的阶段结果候选，以及经实际检查的操作状态 |

记录证据：

```js
// 仅在工具实际执行/来源实际核验后创建；不得根据期望结果填 pass。
const receipt = captureEvidence(root, {
  id: 'test-1', task_binding: taskBinding(task), kind: 'test',
  source: 'tool-result:actual-run-id', summary: '目标回归检查通过',
  dependencies: ['src/affected-module', 'tests/affected', 'package-lock.json'],
  coverage_complete: true, // 宿主已检查隐式依赖；不明时 false
  result: 'pass', command: '真实运行命令', cwd: '.', exit_code: 0,
  claims: ['acceptance:original-bug-fixed', 'behavior-validation', 'regression-validation'],
}, environment);
task.evidence.push(receipt);
// 仅可信宿主核验后执行；文件内容不能自行添加此信任。
host.trustedEvidence.add(digest(receipt));
const plan = validationPlan(task.evidence, host);
```

阶段结果还需 `skill` 和 `stage:<stage-id>` claim。审查需 `kind: review`、`independent: true`、当前 `review_basis`；该标志代表宿主确实完成独立判断，不是凭字段产生第二审查者。诊断需引用有效的实际失败 signal。失败信号应绑定不可变基线，而当前回归绑定修改后的输入。

`advance` 只记录决定，`finishStep` 只接受真实完成后的有效证据；`reopen` 带来源重开阶段与后继，保留有效证据。`encodeTask`/`restoreTask` 不访问磁盘。持久化复用 session-handoff 的唯一临时文件与脱敏要求；导入摘要不恢复 grants、capabilities 或 trustedEvidence。

## 有效性与安全恢复

文件字节、执行位、目录成员、相关环境变化分别检测；新增/删除相关文件也能失效。符号链接与越界路径拒绝自动处理，授权采用精确路径匹配，不把目录字符串当递归授权。外部服务状态或依赖覆盖不可判定时保留 unknown，不能写成通过。

哈希一致只证明所记录输入一致，不能证明测试覆盖充分、因果成立、没有遗漏依赖或当前权限仍适用。任务目标/验收/决策变更也会使旧语义主张不再适用。必要时重新调查和完整回归，无固定文件/工具/测试/Token 配额。

运行中断会恢复为 interrupted。已完成写操作的证据失效不会自动重复写入；必须核对当前结果并明确允许安全重试，或重新核验已有结果。非幂等外部操作不由模块执行；未知结果绝不自动重放。规则版本变更要求明确迁移/重选，当前不提供自动旧检查点迁移器。

## A—G 场景与测试层次

| 场景 | 本地集成验证 |
|---|---|
| A 简单文案 | 单 Skill 编辑真实临时 README；不经过 Router/访谈/工作项 |
| B 已诊断 Bug | 单 Skill 修复临时函数，真实失败与通过命令，相关锁文件失效 |
| C 未知根因 | 缺少实际失败 signal 时拒绝完成诊断，补信号后正常推进 |
| D 跨模块流程 | 已有 Spec 复用，影响/计划/实施/审查/测试缺口保持，审查基线变化重审 |
| E 高风险 | 安全/数据库/公共接口专项义务，写权限门禁和交付回归证据 |
| F 中断恢复 | 不重放未知写入；授权不随 JSON 恢复；失效证据重新判断 |
| G 审查回修 | 回到实施及后继，未受影响测试复用，最终审查重新完成 |

D/E/G 中的专家语义判断使用明确的宿主 fixture，不声称真实模型已经完成复杂功能或真实数据库审查。B/C 的本地命令确实执行；所有场景验证的是协调协议的集成行为，不是客户端端到端模型评估。

## 跨平台实证范围

| 能力 | Codex / Claude Code / Cursor 等当前证据 |
|---|---|
| Skill 内容分发 | 已有构建器分别生成 SKILL.md / .claude Skills / .cursor rules；本次检查分发一致性 |
| 发现与推荐 | 原有描述、Router 和触发契约保留；不是重新实测客户端触发 |
| 内容加载 | 按需 reference 随包分发，实际加载受宿主限制 |
| 同 Agent 连续执行 | 已定义协议与可用辅助 API；需当前宿主支持并获得授权 |
| 子 Agent 调度 | 未实现，也没有跨平台统一 API 假设 |
| 跨会话恢复 | 序列化/重验证已测试；会话创建、自动唤醒未实现 |
| 外部工具执行 | 仍由宿主提供，协调模块不执行命令或网络访问 |

## 旧版与新版比较及测量限制

比较基线为本次修改前的 Registry v3 与既有执行契约，不把历史模型评估冒充本次结果。

| 指标 | 旧机制 | 新机制 | 当前证据 |
|---|---|---|---|
| 完成质量 | 各 Skill 契约、静态工作流校验 | 保留原契约，新增阶段/验收/风险证据门禁 | 本地集成与兼容性测试；模型任务质量尚未做匹配对照 |
| 冗余步骤 | 文本要求复用，缺少统一有效性状态 | A 单阶段、D 复用 Spec、G 复用未受影响测试 | fixture 行为已验证；不能推算真实任务节省比例 |
| 重复上下文 | 会话摘要和分散的来源引用 | 结构化摘要与证据引用，按需加载 | 设计能力；未测真实提示词字节或 Token |
| 工具调用 | 无当前同任务基线数据 | 协调模块不额外执行命令；宿主按影响执行 | 未做真实 Agent 调用数比较 |
| Token | 历史版本有独立评估，但不适用本改动 | 未测 | 不报告节省比例 |
| 验证覆盖 | 原有工作流/构建/权限契约 | 保留并增加 A—G、失效、篡改、重试、路径与审查反例 | 详见本次本地验证记录；不是业务代码覆盖率 |

如需比较两版效率，应固定任务、起始代码、模型、reasoning、工具和授权，对同一任务分别运行两版，保存命令、结果和 Token 原始记录，先比较质量与安全，再比较成本。

早期开发阶段的命令和结果见[历史本地验证记录](WORKFLOW_COORDINATION_VALIDATION.md)。当前运行组件的发布证据见 [0.10.0 协调报告](../tests/reports/coordination-release-0.10.0.json)和[发布验证记录](RELEASE_VALIDATION_0.10.0.md)。

Task Context v2 新增当前范围/正文检查、每次导入的恢复核验与具体尝试核验。完整接入以[中文协议](../packs/engineering/repo-doctor/references/workflow-coordination.zh-CN.md)为准；早期 Beta 验收保留在[历史验证记录](WORKFLOW_COORDINATION_BETA_VALIDATION.md)。
