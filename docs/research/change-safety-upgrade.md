# Repo Doctor 变更安全升级审查

本次审查以 0.11.1 对应的 `112ab7d` 为起点，核对 canonical Skills、共享规则、平台适配、已同步产物、CLI、状态、测试、评估与发布。源代码级验证与已发布版本的历史证据分别记录。

## 实施前审查

| 判定 | 现状及证据 |
|---|---|
| 已实现，单 Skill 与路由 | `repo-doctor-router` 的 `skill.yaml` 关闭隐式调用，指令限制为只读推荐。`references/execution-modes.*.md` 已定义简单请求直达。`scripts/test-skill-activation.mjs` 和 `scripts/test-performance-contracts.mjs` 检查分发和激活契约。 |
| 已实现，自适应多 Agent | `multi-agent-workflow/instructions.*.md` 和 `docs/MULTI_AGENT_WORKFLOW*.md` 已规定任务独立、同一验收标准和并发写隔离。`scripts/test-multi-agent-workflow.mjs` 覆盖宿主不支持、串行回退及并发边界。真实支持仍随宿主变化。 |
| 已实现，工作流与授权 | `packs/engineering/repo-doctor/workflows.yaml` 定义唯一工作流注册表。`workflow-coordination.mjs` 的 `nextAction`、`advance`、`finishStep` 核对授权、停止条件、尝试凭据与复用。`scripts/test-workflow-coordination.mjs` 验证运行中恢复、失败、审批与回放。 |
| 已实现，初始化与检查点 | `scripts/project-state.mjs` 的 `initProject`、`refreshProject`、`saveProjectTask` 和 `resumeProjectTask` 已有项目身份、路径绑定、修订冲突、历史保护和宿主重新核验。旧授权不写回宿主。`scripts/local-state-files.mjs` 提供私有状态、JSON 上限、锁及原子写入。对应 `scripts/test-project-state.mjs` 和 `scripts/test-workspace-cli.mjs`。 |
| 已实现，工程证据基础 | `workflow-coordination.mjs` 的 `fingerprint`、`captureEvidence`、`evidenceValidity` 已利用相关文件、目录成员、配置、命令/退出码与环境，要求宿主核验证据摘要。`resumeProjectTask` 当线索一致时仍返回 `UNKNOWN`。 |
| 部分实现，用户修改与并发保护 | `references/user-workspace-safety.*.md` 第 4 节已有修改前内容检查、局部补丁及冲突处理。`scripts/live-user-safety-validation.mjs` 对隔离场景核对工作区差异。原项目锁只协调状态写入，工作区审查主要靠 Agent。 |
| 部分实现，影响范围和选测 | `change-impact-analysis` 已负责共享代码与调用关系，`test-gap-analysis` 已负责风险到覆盖的映射。执行模式、`testing-contract.*.md` 和工作流风险义务已有定向验证、升级条件与延期规则。原先没有可程序复用的路径分类和范围漂移报告。 |
| 尚未充分利用，渐进式加载 | `scripts/build-skills.mjs` 支持语言和平台投影，`scripts/install.mjs` 支持按语言安装。Router 默认推荐一个 Skill，但其顶层要求加载注册表，与按需加载指令重复。已消除这一冲突，保留注意事项和注册表门禁。双语 Skill 正文仍由宿主加载。 |
| 缺失，工作区观测 | 原 `bin/repo-doctor-skills.mjs` 和 `scripts/workspace-cli.mjs` 只暴露安装、项目、任务与安装诊断。项目指纹用于发现配置漂移，任务指纹用于依赖跟踪。两者都没有 Git 暂存、未暂存、未跟踪状态及已有修改的前后对比。 |
| 潜在缺陷，跨工作树证据与外部状态 | 旧 `evidenceValidity` 比较相对依赖与环境，证据本身缺少独立的工作树绑定。若宿主误在另一份内容相同的工作树采纳摘要，旧函数无法凭记录区分。数据库、服务或时间等未绑定变量仍需宿主识别。此次增加工作树绑定、已声明外部状态核验和有来源的延期状态。 |
| 潜在复杂度，开发入口与发布口径 | `scripts/prepare-npm-package.mjs` 从 canonical 源同步运行时，`package.json#files` 用显式列表限制产物。开发测试分列于 `scripts/test-*.mjs`、`tests/` 与 `evals/`。`scripts/release-metadata.mjs` 区分开发检查和正式发布证据，历史 0.11.1 是文档补丁。当前代码变化需要新的发布证据。 |
| 已实现，渠道和跨平台约束 | `skills/`、`plugins/` 为生成投影，`adapters/*/README.md` 记录宿主适配方式。`scripts/build-skills.mjs`、`sync-pack-plugin.mjs`、`build-chatgpt-skills.mjs` 和 `test-skills-sh-compatibility.mjs` 覆盖构建和分发。`.github/workflows/ci.yml` 有 Linux、macOS、Windows 与 Node 18/LTS 矩阵。 |

## 实施边界

Change Guard 复用本地状态边界，新增文件级 Git 观测，不扩展工作流注册表或 Skill 清单。对普通启用场景使用 Git 可见路径和有界指纹。对权限、数据、公共契约或复杂并发改动，结合既有影响分析、宿主写入前复核和隔离验证。配置通过现有项目文件的可选版本化字段表达。结果详见 [CLI 与状态说明](../PROJECT_STATE.zh-CN.md#change-guard)。

源码采用目录与文件名线索为依赖、契约、权限、数据、测试和配置分类。确认模块归属与调用关系仍由现有 Skill 结合真实 diff、项目布局、索引和测试完成。Git 报告不能从文件路径推断业务回归，也不能判定修改者。已观察到的越界和项目策略违规采用报告级别，不改变宿主权限。

订立基线只覆盖这次任务的观测窗口。工作树移动、历史提交切换、忽略文件、隐藏索引项、子模块内部变动、受限的文件类型与不可观测的外部状态都有相应覆盖边界。保留现有公开 CLI 名称；短别名会增加 npm bin 名称占用及支持成本，本次保留一个命令。缓存与工作流仍储存在原有本地状态目录体系，无新增运行时依赖和遥测。

## 可复现验证与后续对照

程序层从 `node --test scripts/test-change-guard.mjs` 起步。测试使用真实 Git 索引和临时工作树，覆盖已有暂存和未暂存编辑、同一 Git 状态下的内容变化、路径漂移、重命名、依赖变化、敏感路径、并发基线、非 Git 降级和权限/类型变化。用 `node --test scripts/test-workflow-coordination.mjs` 核对证据复用、变更失效、不同工作树、外部状态、失败和延期。用 `npm run test:npm` 检查打包后的 CLI 和既有安装路径。

模型对照可先用以下命令验证现有测试台的本地准备工作。它执行合成夹具检查并准备两个隔离的 Skill 集合。

```sh
npm run benchmark:performance -- --baseline-ref v0.11.1 --prepare-only
```

在相同宿主权限、模型、推理设置、语言、夹具提交和提示词下，使用原生 Codex、Codex + 0.11.1、Codex + 待测版本。可加入经实际安装验证的第三方 Skills 组。对每组固定安装方式，记录生成后的 Skill 摘要、CLI 摘要和工作树初始状态。将旧基准命令中的 `--prepare-only` 去掉后可运行匹配两组的旧案例。Change Guard 新案例和原生组需要在现有运行器上增加夹具和独立安装组，旧案例成绩不迁移为新能力证据。执行真实旧案例时使用单独的 `--output` 路径保留历史报告。使用 `scripts/live-user-safety-validation.mjs` 的工作区差异采集和 `scripts/live-performance-benchmark.mjs` 的匹配记录，复用 `evals/live-model/cases.json` 的权限、数据语义和跨模块相关场景。

至少加入局部改动过度执行、公共请求方法、权限修改、已有数据更新、意外更新锁文件、无关重构、跨任务并发未知来源、重复测试、跨会话复用、历史证据失效和虚假完成。每轮独立恢复夹具，随机化组顺序，多次运行。以事后独立执行的行为断言、原始工作区指纹、实际编辑集和命令凭据计分。报告成功率、业务回归、已有修改保留、无关修改、漏报/误报、验证完整性、Token、耗时、工具调用、人工介入以及阻塞和超时。按案例报告样本数与差异，保留环境和重复次数。本轮没有模型成绩、速度增益或 Token 降幅结论。

## 本轮验证结果

- macOS 上使用 Node 24.19.0 和 Git 2.54.0 运行完整 `npm test`。56 项状态与 CLI 测试通过。打包测试从本地 tarball 安装，运行新旧命令，并核验测试与开发资源未进入包。
- Change Guard 的 9 项真实 Git 夹具测试也在 Node 20.20.2 上通过。协调器单独运行的 63 项测试通过，覆盖已有证据与本次新增的工作树绑定、外部状态和延期判断。
- `npm run validate`、`npm run docs:check`、`npm run build`、`npm run quality:check` 与 `npm run release:check -- --development` 通过。兼容测试保留 70 组历史基线，为 29 组受本次规则及投影影响的产物另加审核过的固定值。新增的跨平台夹具已挂入三系统矩阵。
- 基准准备模式验证了 24 个夹具文件、两组各 34 个 Skill 的独立安装和 30 个案例的准备。真实模型调用、Linux、Windows、Node 18 和正式发布验证待执行。旧模型报告仅对应旧源码。

## 后续路线图

Graphify、Tree-sitter、跨仓库分析、MCP、企业 CI 与品牌迁移留在后续扩展评估。静态工具优先使用项目已有索引。有重复的跨模块误判或实测收益时，再考虑新增适配层。
