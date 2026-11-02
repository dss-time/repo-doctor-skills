# 0.9.0-beta.1 候选验证

日期：2026-11-02（Asia/Shanghai）。结论：**本地 Beta 候选门禁通过**。本记录生成时尚未对外发布；后续发布状态以 GitHub Releases 为准。不将这个结果解释为稳定版、生产系统或所有客户端均已验证。

机器证据：[候选汇总](../tests/reports/coordination-release-0.9.0-beta.1.json)、[本地检查](../tests/reports/coordination-local-0.9.0-beta.1.json)。原始当前版本试运行：[report.json](../tests/reports/coordination-live-caziQ0/report.json)。这些记录绑定当前 canonical 源与完整 Skill 运行时；内容变化将使门禁失效。此前失败、中断和旧源码试运行全部保留为历史，不计入当前通过结果。

## 完成的修复

- Task Context v2：拒绝直接执行原始 JSON；每次恢复都有新的内存标识，必须由当前宿主核对真实工作区和可信执行记录，包括旧 pending 检查点之后的操作。
- 写入、Shell 等潜在副作用独立于完成/失败/适用状态保护；失败、中断、过期或复用结果重开时，必须核对具体尝试与请求范围。可选条件变化不能抹掉已完成效果。
- 阶段结果绑定当前请求；验收和风险主张还绑定当前操作集合。范围变化后，旧主张不能直接证明新范围完成。
- 单 Skill 按本次实际操作判断是否写入；当前宿主必须核验正文中更严格的模式/目标约束，不再把 metadata 的最大能力当成必需写权限。
- 停止条件采用真/假/未知，false 也需当前证据；未知或过期不能默认放行。Shell-only 等潜在副作用请求同样执行专项风险门禁。
- 未知、过期、当前失败分开处理。未解决的当前测试失败阻止依赖执行与交付；宿主可明确允许特定修复阶段，但失败只能在调查并观察后续有效通过后解决。
- 独立审查记录自身必须匹配当前 Skill、阶段、请求和审查基线，不能由其他分析记录拼接满足。
- Codex 适配宿主先加载 Skill，禁止 Shell 的阶段移除原生 Shell 工具，核对实际工具事件；审查输出必须包含三个轴和结构化结论。

当前 API 的宿主接入以[中文协议](../packs/engineering/repo-doctor/references/workflow-coordination.zh-CN.md)和[英文协议](../packs/engineering/repo-doctor/references/workflow-coordination.en.md)为准。新字段包括 `skillChecks`、`recoveryChecks`、具体尝试的 `reconciled`、`operation_binding`、`failureRepairs` 和 `failureResolutions`；这些均由当前可信宿主建立，不能从共享上下文导入授权。

## 实际运行结果

| 检查 | 结果与实际范围 |
|---|---|
| `npm test` | 通过：完整原有工程套件及新增协调检查，含构建、安装、npm 包、工作流、权限、发布元数据和离线评估工具测试 |
| `npm run test:coordination` | 57/57：44 项核心、7 项事件观测、6 项候选门禁测试；另有六项原审查对抗回归全部通过 |
| `npm run validate` | 通过：41 active Skills + 1 模板、5 个 schema Pack、13 条工作流 |
| `npm run quality:check` | 通过：含生成物一致性 |
| `npm run docs:check` | 通过：用户文档和目录检查 |
| `npm run release:reports` | 双语 41/41；平台产物 7/7；插件 ZIP 38/38 |
| 独立安装与 npm 包 | Recommended 7/7、Full 41/41、单 Skill 及语言选择、隔离 CLI 和离线 tarball 测试通过 |
| `npm run release:check` | 当前 0.9.0-beta.1 候选正式检查通过；保留原 stable 全语料门禁，Beta 增加本轮真实协调试运行门禁 |
| 脚本语法与 `git diff --check` | 通过 |

## 当前源码的真实 Codex 验证

1. **简单修改**：只修改 README 指定拼写；宿主文件对比与工具事件证明范围正确。
2. **串行协作**：test-gap-analysis → 已有写授权门禁 → safe-test-implementation → 独立 safe-code-review；各阶段均使用本地安装的当前 Skill。
3. **真实验证**：3 个回归用例通过；独立副本的旧缺陷公式导致失败，证明目标敏感性。生产源码没有被测试实施阶段修改。
4. **检查点恢复**：恢复结构化上下文后，宿主重新核验执行状态和权限，不因换阶段重复请求相同用户授权。
5. **增量失效**：无关文件变化复用证据；相关代码变化要求重新验证。最终完成检查点在故意失效探针之前。
6. **独立审查**：新 Codex 会话检查整个核心及原始契约，三个轴均为 checked，最终 `clear`、无发现。该结论限于审查范围，不是无缺陷保证。
7. **权限**：缺口分析、测试审查和核心审查的 Shell 调用均为 0；所有当前试运行的权限违规列表为空，审查阶段没有文件变化。

当前证据是 5 个真实模型 turn，完成工具条目 18。CLI 报告 input_tokens 617,631，其中 cached_input_tokens 486,400；output_tokens 6,339。输入统计含每轮上下文与缓存，不能当作独立文本量或费用。没有同任务旧版匹配基准，不报告节省比例。实际服务端模型标识未由 CLI 事件报告，沿用用户已有配置、不据配置推断最终模型。

多轮独立审查曾发现额外边界问题，均先修复并补回归，再接受新源码审查；没有将失败报告改成通过。服务额度中断同样保留。旧的审查报告只描述当时版本，不继续认证当前源码。

## 候选产物与发布边界

准备版本：项目 `0.9.0-beta.1`，Repo Doctor Pack/插件 `0.11.0`（组件成熟度 beta），保留 41 个 active Skill、13 条工作流和 38 个插件 ZIP。

本地候选目录为 `dist/release-candidates/0.9.0-beta.1-XP71ma/`：包含 npm tarball、38 个带版本 ZIP、发布说明、清单和 SHA-256 文件。该目录属于本地构建产物，不是 GitHub Release 或 npm 发布记录。最终包会在证据完成后重新核对；更早目录属于旧源码候选，不用于本次发布。

完整 Live-model 语料路由评测仍为 **UNKNOWN**，未使用旧版 328 项报告或豁免。当前只验证了限定合成项目的 Codex 串行 CLI 宿主适配；没有验证同 Agent 原生自动调度、Claude Code/Cursor 实机、多 Agent 并行、生产操作或任意第三方 MCP 工具的权限隔离。

本地验证记录生成时尚未执行 Git commit、push、tag、GitHub 发布或 npm 发布；当时也未执行远端 CI 和发布后资产校验。若后续对外发布，应使用 prerelease／npm beta 通道，保留现有 0.8.1 稳定分发。当前门禁通过仅针对本地 Beta 候选。
