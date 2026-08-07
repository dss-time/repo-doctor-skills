# Skill 运行效率分析

## 范围与基线

本次审计覆盖 27 个 active Repo Doctor Skills、canonical descriptions 和 instructions、Skill/Pack references、13 个 workflow registry、300 条 activation contracts、插件 `agents/openai.yaml`、全部构建适配器，以及现有 317 次真实 Codex 调用报告。修改前 `npm run validate` 和完整 `npm test` 均通过。

现有真实报告能证明路由、双语行为、模式、workflow 和权限边界，但没有可靠记录每个场景的文件读取数、命令数、运行时间或工具调用总数，因此这些基线指标标为无法精确测量，不进行推算。

## 修改前主要慢点

1. 只有部分 Skill 定义 mode，且披露模式与 `documented`、`test_first` 等工作变体混在一起。
2. 若干普通 Skill 默认 `standard`，即使请求只是局部小任务。
3. 真实 Codex 测试对每个 Skill 都生成隐式调用预期，包括发布、迁移、安全、架构、性能和交接类重型 Skill。
4. 插件和 ChatGPT 构建器尚未生成平台真实支持的 `policy.allow_implicit_invocation`。
5. 多阶段 workflow 和“下一 Skill”交接容易被误解为自动继续。
6. 目标已经明确时，Router 可能增加不必要的中间步骤。
7. Bug 根因、测试实现、代码审查、原型、架构分析和交接保留了必要的详细证据/安全契约，但缺少统一 fast 预算。
8. 少数专项 reference 已按需读取，但没有 Pack 级禁止预读全部 reference 的规则。
9. 输出契约不统一，部分 compact 模式仍要求较多字段。
10. 中英文结构基本一致，但执行成本没有进入语言无关的机器可读元数据。

没有 Skill 在核心 instructions 中无条件要求执行全仓库测试或构建。主要风险来自模糊路由、重型 Skill 隐式触发、把 workflow 当自动流程，以及默认模式不一致，而不是每个 Skill 都直接写了 `npm test`。

## Active Skill 分类与运行契约

所有 `fast` profile 使用同一软预算：一个主 Skill、最多 3 个直接相关文件和 3 个必要命令、不运行全量测试/构建、不创建持久化审计报告、不自动串联 Skill，并执行最接近的定向验证。`standard` 只读取并验证相关模块；`audit` 保留完整证据、权限、命令、风险和停止条件。

| Skill | 分类 | 默认 | 隐式调用 | 最小验证与边界 |
|---|---|---|---|---|
| repo-doctor-router | Router | fast | 否 | 核验一个推荐；不执行、不递归。 |
| repo-onboarding | Standard | fast | 是 | 从直接相关仓库文件确认入口和命令。 |
| requirements-clarification | Lightweight | fast | 是 | 只关闭重大未决决策；不实施。 |
| requirements-to-spec | Lightweight | fast | 是 | 根据已确定证据检查验收标准；不修改。 |
| spec-to-work-items | Standard | fast | 是 | 检查可观察切片和依赖；不写外部任务。 |
| decision-prototype | Standard | standard | 否 | 只运行已授权隔离原型；不使用生产数据。 |
| bug-root-cause-analysis | Standard | fast | 是 | 一个合格信号或定向复现；只读诊断。 |
| project-health-check | Heavyweight | standard | 否 | 仅在显式要求时进行全仓库诊断。 |
| safe-code-review | Standard | fast | 是 | 审查有边界的 Diff/文件；不修复。 |
| change-impact-analysis | Standard | fast | 是 | 针对命名变更检查直接引用和兼容证据。 |
| safe-change-plan | Lightweight | fast | 是 | 核验原子步骤与回滚；不执行。 |
| test-gap-analysis | Lightweight | fast | 是 | 把一个行为映射到现有测试和最小缺口。 |
| safe-test-implementation | Standard | fast | 是 | 一个定向红/绿或特征测试；仅测试侧写入。 |
| ci-failure-diagnosis | Standard | fast | 是 | 第一个可信 CI 错误和最小复现；不修复。 |
| documentation-sync | Lightweight | fast | 是 | 对授权文档范围执行最接近的 docs 检查。 |
| release-readiness-check | Explicit-only candidate | standard | 否 | 完整候选版本门禁；只读，不发布。 |
| dependency-upgrade-analysis | Explicit-only candidate | standard | 否 | 核验依赖和目标版本；不改 manifest。 |
| api-contract-review | Standard | fast | 是 | 检查命名契约兼容性；不改接口。 |
| database-migration-review | Explicit-only candidate | standard | 否 | 核验迁移安全和回滚；不执行、不访问生产。 |
| dead-code-verification | Standard | fast | 是 | 静态/动态使用证据；不删除。 |
| security-focused-review | Explicit-only candidate | standard | 否 | 有范围的威胁与证据审查；不攻击、不修复。 |
| performance-regression-analysis | Explicit-only candidate | standard | 否 | 有控制的基线和负载证据；不优化。 |
| architecture-deepening-analysis | Explicit-only candidate | standard | 否 | 具体调用方/变更证据；不重构、不写入。 |
| architecture-decision-record | Standard | standard | 否 | 仅写已授权 ADR，并检查仓库约定。 |
| configuration-audit | Explicit-only candidate | standard | 否 | 核查配置来源，不读取敏感值、不修改。 |
| session-handoff | Explicit-only candidate | standard | 否 | 显式生成脱敏续接摘要；不自动继续。 |
| safe-fix-implementation | Standard | fast | 是 | 最小授权修改和最接近的定向检查。 |

## 渐进式读取 references

Pack 新增双语执行模式 reference。生成的插件 Skill 只链接对应语言 reference，并要求只有模式选择或升级边界不明确时才读取。原型和架构检查清单继续按条件读取；审计、数据库、迁移和发布材料只在对应风险或产物出现时加载。

## 平台能力矩阵

| 目标 | 隐式调用策略 | 实现 |
|---|---|---|
| Codex 可安装 Skills | 已核验 | `dist/codex-zh-CN/skills/*/agents/openai.yaml` 根据 canonical 元数据生成 `policy.allow_implicit_invocation`。 |
| Codex/ChatGPT 插件 Skills | 已核验 | 插件 `agents/openai.yaml` 生成相同策略。 |
| ChatGPT ZIP Skills | 已核验 | 确定性 ZIP 构建保留该策略。 |
| Generic Markdown、Claude Code、Cursor、Qwen、Kimi，以及 Codex 聚合 `AGENTS.md` 视图 | 没有仓库已核验的逐 Skill 策略字段 | 使用精确 description、canonical `execution` 元数据和统一执行说明；不编造 alias 或包装 Skill。Codex 目标同级的可安装 Skill 包仍保留策略。 |

## 预期效果

确定性契约把简单任务默认范围限制为一个主 Skill、三个文件、三个命令、一个定向检查和简洁输出；20 个简单场景全部禁止全量测试/构建，并要求重型专项 Skill 显式调用。工具调用和运行时间是否下降 30% 需要通过多次真实会话测量；本仓库不会用静态契约伪造该结论。
