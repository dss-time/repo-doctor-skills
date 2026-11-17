[English](./README.md) | **简体中文**

# Repo Doctor Skills

让 AI 按明确的安全边界排查 Bug、实施功能、审查代码和验证结果，适配项目实际使用的语言与运行时。

从一个局部修复到已授权的多阶段交付：小任务直接调用一个 Skill，复杂任务复用已有授权与有效证据，按依赖推进。

版本 **0.11.0** 包含 34 个 Skill，其中 Repo Doctor 工程能力为 27 个。[GitHub Release](https://github.com/dss-time/repo-doctor-skills/releases/tag/v0.11.0) · [npm](https://www.npmjs.com/package/repo-doctor-skills/v/0.11.0) · [发布说明](docs/RELEASE_NOTES_0.11.0.zh-CN.md)。

发布验证使用新的源码绑定模型案例及隔离协调试验，结果与局限见[验证记录](docs/RELEASE_VALIDATION_0.11.0.md)。此前 0.10.0/0.10.1 报告仅保留为对应原始内容的历史证据。

## 30 秒开始

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

使用当前 Node.js LTS（已测试 Node 24）。在你的项目目录运行，按安装器提示选择 Skill 和 Agent，然后新建任务即可使用。无需克隆或构建仓库。默认安装到当前项目；加 `-g` 可在所有项目使用。

## 最小示例

```text
$safe-code-review 审查当前修改。
```

不知道选哪个时，使用 `$repo-doctor-router`。它会推荐 Skill 并给出可复制的下一步请求；知道 Skill 名时直接调用。

已授权的连续任务可使用[串行工作流协同与证据复用](docs/WORKFLOW_COORDINATION.zh-CN.md)。简单任务仍直接调用一个 Skill；自动执行能力取决于宿主。

## 为什么选择 Repo Doctor Skills

| 优势 | 对实际开发的帮助 |
|---|---|
| **优先保护你的项目** | 修改前核对权限与业务行为、已有数据更新语义和用户已有修改；执行测试或构建前检查真实环境与副作用。未知风险只阻塞受影响操作。 |
| **渐进式上下文加载** | 在支持原生 Skills 的宿主中，先通过名称与描述发现能力，再加载选中 Skill 的正文，按任务读取参考规则，避免每次预先载入整套说明。 |
| **按语言与运行时选择规则** | 根据相关组件应用检查，纯 JS/TS 不套用 C/C++ 内存管理限制；涉及原生代码、嵌入式或混合技术栈时，核对对应边界与可用验证工具。 |
| **从单点任务衔接到工作流** | 职责明确的需求、诊断、实施、测试与审查能力可独立使用，也可在已有授权范围内串行协作，复用仍有效的验收证据，减少重复确认与检查。 |
| **用证据说明完成程度** | 区分已实施、已验证、延期验证和阻塞，不把读取脚本当作测试通过，也不把局部检查当作完整交付。已发布版本提供源码绑定的模型评测记录。 |
| **灵活安装，中文英文均可用** | 可安装推荐组合、部分或单个 Skill；提供双语内容及多平台适配，自带安装器支持按语言安装，并替换选中的同名旧 Skill。 |

安全约束由 Skill 指令指导执行，仍依赖宿主工具、沙箱和审批机制。跨语言支持不代表已在所有语言、框架或硬件上完成验证。

### 按需加载如何工作

```text
名称与描述 → 匹配任务 → 读取选中 Skill 的正文 → 按条件读取参考规则或使用脚本
```

例如，功能实施时按实际技术栈选择规则；编写测试时读取测试契约；需要多阶段续接或恢复时才读取工作流协议。安装全部 Skill 不等于每次加载全部正文。实际加载方式取决于宿主；普通提示词导入不保证自动按需加载，当前双语正文也会增加单个 Skill 激活后的上下文量。项目尚未提供统一的 Token 节省比例。

**0.11.0 已包含：**[自适应单 Agent / 多 Agent 模式](docs/MULTI_AGENT_WORKFLOW.zh-CN.md)，以及[项目初始化、任务存档与只读安装诊断](docs/PROJECT_STATE.zh-CN.md)。原有 Skill 保持可独立使用；项目初始化仍为可选。

当前源码还补强了**项目规范自适应**：直接调用实施、修复、测试或文档 Skill 时，在修改前按目标目录与技术栈核对适用的项目指令、配置和邻近风格，无需先初始化项目。仅调整任务相关内容，不执行配置代码来发现规则、不全仓格式化，也不静默记录个人偏好。规则见[用户项目安全参考](packs/engineering/repo-doctor/references/user-workspace-safety.zh-CN.md#5-按修改范围适配项目规范)，实际遵循情况取决于宿主与模型。

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


## v0.11.0 正式版

v0.11.0 包含 34 个 Skill（Repo Doctor 27 个）和 34 个 ChatGPT ZIP。新增自适应执行、项目与任务状态、安装诊断及局部项目规范适配；此前办公 Skill 删除及需求/规划入口合并继续生效。[发布说明](docs/RELEASE_NOTES_0.11.0.zh-CN.md) · [完整交付样例](docs/guides/delivery-examples.zh-CN.md)。

升级时，原 `requirements-to-spec` 的任务改用 `requirements-clarification`，原 `spec-to-work-items` 的任务改用 `safe-change-plan`。已删除或合并的 Skill 如曾安装，其旧目录需要检查本地自定义内容后手动清理。详见[升级说明](docs/RELEASE_NOTES_0.11.0.zh-CN.md#安装与升级)。

将 GitHub 插件固定到 `v0.11.0`：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.11.0
codex plugin add repo-doctor@repo-doctor-marketplace
```
安装指定 npm 版本（默认 7 个常用 Skill，也可安装全部 34 个）：

```bash
npx repo-doctor-skills@0.11.0 install --agent codex
npx repo-doctor-skills@0.11.0 install --preset full --agent codex
```

同一 Agent 选择一种安装方式。官方 skills CLI 从公开 GitHub 源码安装。

## 自适应执行模式

0.11.0 在原 33 个 Skill 上新增 `multi-agent-workflow`，可通过 CLI 安装：

```bash
npx repo-doctor-skills@0.11.0 install --skill multi-agent-workflow --agent codex
```

请同时安装任务所需的现有 Skills。可明确要求自动选模式，也可由 Agent 在独立工作需要协调时选择该入口。小修复和普通直接 Skill 调用由原能力处理。并行执行需要宿主子 Agent，并发写入需要隔离工作区。默认推荐安装仍为原 7 个 Skill。

```text
$multi-agent-workflow 根据实际任务选择 single 或 multi，完成已授权工作。复用现有 Skills，保护我的已有修改，并验证集成结果。
```

详见[模式选择与示例](docs/MULTI_AGENT_WORKFLOW.zh-CN.md)。原生并行执行是否可用取决于宿主能力。

## 本地项目与安装状态

0.11.0 新增可选项目初始化、修订号保护的任务存档，以及只读安装诊断。初始化先预览再应用，任务续接前重新核对证据。

```sh
npx repo-doctor-skills@0.11.0 project init
npx repo-doctor-skills@0.11.0 task list
npx repo-doctor-skills@0.11.0 installations check
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
