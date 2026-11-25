[English](./README.md) | **简体中文**

# Repo Doctor

**Make AI coding safer, not slower.**

面向 AI 编程助手的代码变更安全与工程验证工具。

Repo Doctor 帮助编程助手核对任务是否触及你已有的修改、改变暂存状态或越过约定的范围。当前源码候选中的相关工程 Skills 共享 **Change Guard**，可以结合定向测试和已有工程证据，核对本地 Git 工作区。

## 快速开始

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

在编程助手里开始新任务，用自己的话描述需求。也可以直接调用熟悉的 Skill，或用 `$repo-doctor-router` 获取推荐。

## 最小示例

```text
修复 src/labels.mjs 的标签格式问题。保留我在文件里尚未提交的无障碍说明，也请保留无关文件。
```

隔离 Codex 复测中，修复标签并保留用户修改的自然语言请求触发了基线和交付前检查。报告提示该路径原有修改被触及，用户说明仍在，夹具检查通过。候选四个适用任务中有三个完成两次调用，公共模块任务遗漏了检查，低风险修改保持轻量。实际调用取决于 Skill 选择、宿主权限和运行时可用性。[真实观测与成本](docs/research/change-guard-integration.md)

在 macOS、251 个跟踪文件的本地夹具中，基线中位耗时为 170–255 ms，检查为 142–229 ms，含 Node 启动。数值随工作区内容和环境变化。当前候选已在 macOS 的 Node 18 和 24 验证安装升级，Linux 和 Windows 实跑待补。 [候选验证记录](docs/research/change-guard-integration.md#候选冻结和本轮补验)

## 显式核对工作区，供诊断使用

下列命令在 Repo Doctor 源码目录执行，`--root` 指向你要检查的 Git 工作树。已发布的 0.11.1 CLI 早于此流程。

```bash
node bin/repo-doctor-skills.mjs change begin --root ../my-project --id export-fix --scope src/export --json
node bin/repo-doctor-skills.mjs change check --root ../my-project --id export-fix --json
```

基线可以区分文件原本就有的修改，以及同一文件在任务中又发生的变化。例如，任务触碰了用户已经编辑过的文件，同时在范围外更新了锁文件，JSON 报告会分别标出这两处。报告将改动来源保留为未知，由开发者核对和处理。Git 忽略的改动和瞬时并发变化可能不可见，业务正确性仍需用定向测试验证。[报告字段、项目策略和覆盖限制](docs/PROJECT_STATE.zh-CN.md#change-guard)。

[运行已经实测的临时 Git 示例](docs/guides/change-guard-demo.zh-CN.md)。

## 工作机制

- **变更安全**。已有 Skills 检查用户修改、业务行为和权限边界。需要跨步骤保存基线时，Change Guard 补充 Git 可见范围内的比较。
- **自适应验证**。按影响与证据选择检查。小任务做定向验证，涉及契约、数据更新、权限边界时可安排隔离集成测试。[执行模式](docs/MULTI_AGENT_WORKFLOW.zh-CN.md)。
- **工程证据**。可选任务检查点保留历史。复用之前，由宿主核验执行凭据、工作树身份、相关输入和环境。[工作流协同](docs/WORKFLOW_COORDINATION.zh-CN.md)。
- **与现有工具共存**。可以直接使用单个 Skill，也可以在授权内协调有依赖的阶段。宿主决定参考资料何时加载、能否隔离并行执行。

## 宿主与安装

建议使用当前 Node.js LTS。自带 CLI 支持 Node 18 及以上，外部 Skills 安装器有自己的 Node 版本要求。在目标项目运行快速开始命令并选择宿主和 Skills。自动触发和工具权限取决于宿主。

| 宿主 | 命令或导入方式 |
|---|---|
| Codex | `npx skills@latest add dss-time/repo-doctor-skills -a codex` |
| Claude Code | `npx skills@latest add dss-time/repo-doctor-skills -a claude-code` |
| Cursor | `npx skills@latest add dss-time/repo-doctor-skills -a cursor` |
| WorkBuddy | 用宿主的本地 Skill 导入功能导入 `skills/` 中的目录 |

更多宿主与内置安装方式见[高级用法](docs/ADVANCED_USAGE.zh-CN.md)。兼容性矩阵覆盖 Linux、macOS 和 Windows。

## Codex 插件

安装当前源码工程能力（27 个 Skill）：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills
codex plugin add repo-doctor@repo-doctor-marketplace
```

同一 Agent 选择插件或复制 Skills 其中一种，避免重复。其他两个插件参见[高级用法](docs/ADVANCED_USAGE.zh-CN.md)。

## 推荐安装

建议先选择这 7 个高频 Skill：

| 任务 | Skill |
|---|---|
| 选择能力 | `$repo-doctor-router` |
| 澄清需求 | `$requirements-clarification` |
| 排查 Bug | `$bug-root-cause-analysis` |
| 实施修复 | `$safe-fix-implementation` |
| 编写测试 | `$safe-test-implementation` |
| 审查代码 | `$safe-code-review` |
| 验证方案 | `$decision-prototype` |

直接为 Codex 安装这组选项：

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill repo-doctor-router requirements-clarification bug-root-cause-analysis safe-fix-implementation safe-test-implementation safe-code-review decision-prototype -a codex
```

## 完整安装

为 Codex 安装源码中的全部 34 个 Skill：

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill '*' -a codex
```

## 单个 Skill 与更新

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill safe-code-review
npx skills@latest check
npx skills@latest update
```

正文双语，包含配套资源。新增 Skill 可再次运行 `add` 选择安装。调用语法以 Agent 为准，上方示例使用 Codex 语法。

WorkBuddy 用户可使用通用 Skill 导入格式，参见 [WorkBuddy 使用说明](docs/ADVANCED_USAGE.zh-CN.md#workbuddy)。尚未在 WorkBuddy 中实机验证安装和执行。

## 可选的 preset 与语言安装器

```bash
npx repo-doctor-skills install
npx repo-doctor-skills install --preset full
npx repo-doctor-skills install --language zh-CN
```

这个替代入口默认安装 7 个常用 Skill，支持 `en`、`zh-CN`、`bilingual` 正文。重复安装会替换目标目录中选中的同名 Skill，包括本地修改和旧资源；内容相同则跳过。自带安装器支持 Node.js 18 及以上版本。CI 使用 Node 18 和当前 LTS 检查 Linux、macOS、Windows 安装，完整仓库检查运行于 Linux。外部 skills CLI 的 Node 要求由其自身版本决定。


## v0.11.1 正式版

v0.11.1 包含 34 个 Skill（Repo Doctor 27 个）和 34 个 ChatGPT ZIP。保留 0.11.0 运行内容，并新增 Codex、Claude Code、Cursor 和 WorkBuddy 的统一多平台安装说明。[发布说明](docs/RELEASE_NOTES_0.11.1.zh-CN.md) · [完整交付样例](docs/guides/delivery-examples.zh-CN.md)。

升级时，原 `requirements-to-spec` 的任务改用 `requirements-clarification`，原 `spec-to-work-items` 的任务改用 `safe-change-plan`。已删除或合并的 Skill 如曾安装，其旧目录需要检查本地自定义内容后手动清理。详见[升级说明](docs/RELEASE_NOTES_0.11.1.zh-CN.md#安装与升级)。

将 GitHub 插件固定到 `v0.11.1`：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.11.1
codex plugin add repo-doctor@repo-doctor-marketplace
```
安装指定 npm 版本（默认 7 个常用 Skill，也可安装全部 34 个）：

```bash
npx repo-doctor-skills@0.11.1 install --agent codex
npx repo-doctor-skills@0.11.1 install --preset full --agent codex
```

同一 Agent 选择一种安装方式。官方 skills CLI 从公开 GitHub 源码安装。

## 自适应执行模式

0.11.0 在原 33 个 Skill 上新增 `multi-agent-workflow`，可通过 CLI 安装：

```bash
npx repo-doctor-skills@0.11.1 install --skill multi-agent-workflow --agent codex
```

请同时安装任务所需的现有 Skills。可明确要求自动选模式，也可由 Agent 在独立工作需要协调时选择该入口。小修复和普通直接 Skill 调用由原能力处理。并行执行需要宿主子 Agent，并发写入需要隔离工作区。默认推荐安装仍为原 7 个 Skill。

```text
$multi-agent-workflow 根据实际任务选择 single 或 multi，完成已授权工作。复用现有 Skills，保护我的已有修改，并验证集成结果。
```

详见[模式选择与示例](docs/MULTI_AGENT_WORKFLOW.zh-CN.md)。原生并行执行是否可用取决于宿主能力。

## 本地项目与安装状态

0.11.0 新增可选项目初始化、修订号保护的任务存档，以及只读安装诊断。初始化先预览再应用，任务续接前重新核对证据。

```sh
npx repo-doctor-skills@0.11.1 project init
npx repo-doctor-skills@0.11.1 task list
npx repo-doctor-skills@0.11.1 installations check
```

详见[初始化、任务及迁移命令](docs/PROJECT_STATE.zh-CN.md)。相同命令也可在本地检出目录运行。

## 文档

- [问题 → Skill](docs/guides/problem-to-skill.zh-CN.md)
- [用户手册](docs/USER_MANUAL.zh-CN.md)
- [Skill 目录](docs/SKILL_CATALOG.zh-CN.md)
- [高级用法：插件、平台、版本与源码构建](docs/ADVANCED_USAGE.zh-CN.md)
- [贡献指南](CONTRIBUTING.md)

[MIT](LICENSE)

## 按语言选择安全规则

工程 Skill 按实际语言、运行时和组件选择检查。纯 JS/TS 不套用 C/C++ 内存管理限制，原生边界单独评估；共享的不可信输入规则约束执行范围。详见[安全评测及局限](evals/security/README.md)。

工作流在既有授权范围内复用授权及有效验收证据，语言与运行时规则按相关组件加载。用户明确要求最后统一测试时，记录 `verification_deferred` 和待验证清单，到约定节点统一验证。

用户项目安全规则涵盖保留原有权限与业务行为、核对已有数据更新语义、确认测试/构建实际环境隔离，以及保护已有和并发修改。相关实施与审查 Skill 按任务加载规则，未确认的风险只阻塞受影响操作。详见[用户项目修改与验证安全](packs/engineering/repo-doctor/references/user-workspace-safety.zh-CN.md)。

当前源码绑定评测与本地检查见 [0.11.0 验证记录](docs/RELEASE_VALIDATION_0.11.0.md)。[0.10.1 证据复用记录](tests/reports/release-promotion-0.10.1.json)及此前[开发阶段评测](tests/reports/unified-validation-2026-11-05/README.md)保留为历史记录。
