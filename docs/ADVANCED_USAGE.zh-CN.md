# 高级用法

本指南集中说明替代安装路径、平台差异、源码构建和维护者概念。第一次使用 Repo Doctor 时，请先看[用户手册](USER_MANUAL.zh-CN.md)。

## 1. Recommended / Full / Individual

用户层只保留三个安装概念：

| 概念 | 适用情况 | 源码命令 |
|---|---|---|
| **Recommended** | 大多数用户的默认选择，安装 7 个高频 Skill | `npx repo-doctor-skills install` |
| **Full** | 需要 Skills 目录格式支持的全部 active Skill | `npx repo-doctor-skills install --preset full` |
| **Individual** | 已经知道准确 Skill 和平台产物 | 见第 6 节 |

公开 npm CLI 是最短安装路径。高级用户仍可使用插件、源码构建、平台产物和单 Skill 资产。

## 2. 插件安装

添加稳定版 source：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.6.0
```

打开 `/plugins`，安装需要的插件，然后新建任务。本仓库分发三个插件：

- **Repo Doctor**：仓库工程任务；
- **Productivity Toolkit**：报告、研究、表格、文档、会议和演示；
- **Skill Maintainer**：创建或审计 Skill。

只有明确测试开发内容时才使用 `--ref main`：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

兼容路径和宿主差异见[历史 Codex 插件说明](LEGACY_CODEX_PLUGIN.zh-CN.md)。

插件数量遵循现有分发边界：Repo Doctor 包含 27 个 Skill；Repo Doctor、Productivity Toolkit 和 Skill Maintainer 合计 37 个；源码清单为 40，是因为还有 3 个 Document Data Doctor Skill 只进入常规构建。源码 Full 安装会安装全部 40 个，而不改变插件边界。

## 3. ChatGPT 单 Skill ZIP

只需要少量 Skill、不想安装整个插件时使用 ZIP。

1. 下载带版本的 Release 资产，或运行完整构建。
2. 选择 `.zip` 文件，不要选择同名的展开检查目录。
3. ChatGPT 当前界面可用时，通过 **Skills → Create → Upload** 上传。
4. 检查安全扫描。遇到 Needs Review 或 Blocked 时不要绕过工作区策略。
5. 新建任务，通过当前界面选择 Skill，或用自然语言描述任务。

前缀用于识别来源：

| 前缀 | 能力库 | 示例 |
|---|---|---|
| `rd-*` | Repo Doctor | `rd-safe-code-review.zip` |
| `pt-*` | Productivity Toolkit | `pt-report-writer.zip` |
| `sm-*` | Skill Maintainer | `sm-skill-quality-audit.zip` |

个人上传的 ChatGPT Skill 不保证支持 `$slug`。Document Data Doctor 的三个 Basic Skill 会进入常规构建，但没有独立 ChatGPT ZIP。

## 4. 其他平台产物

### Codex 合并项目指令

生成的 Codex 目标包含合并的 `AGENTS.md` 和同级资源。复制时保留完整目标目录，确保链接的 references、assets 和 scripts 仍然可用。这种方式提供持续项目指令，但不会安装可用 `$` 单独发现的 Skill。

### Claude Code

生成结构为：

```text
dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md
```

把 `.claude/skills/` 复制到宿主支持的位置。发现机制和显式命令取决于宿主版本；可靠后备方式是 Skill slug 加自然语言任务。

### Cursor

生成结构为：

```text
dist/cursor-zh-CN/.cursor/rules/<skill-name>.mdc
```

把 `.cursor/rules/` 复制到目标项目。自动加载和作用范围取决于 Cursor 配置。本项目不声称该目标同时提供逐 Skill 的 `$` 调用。

### Qwen、Kimi 与 portable prompts

`qwen-zh-CN`、`kimi-zh-CN`、`generic-zh-CN` 和 `generic-en` 是 Markdown Prompt，不是本项目能够核验的原生安装包。把完整目标放到宿主支持的指令位置，或粘贴自包含 Prompt。不要假设宿主支持 `$`、`@` 或 slash command。

## 5. 源码安装、校验与构建

要求：Node.js 18 或更高版本；生成 ChatGPT ZIP 时，`PATH` 中还需要 `zip`。

```bash
git clone https://github.com/dss-time/repo-doctor-skills.git
cd repo-doctor-skills
npm run install:skills -- --agent codex
npm run validate
npm test
npm run build
```

不需要完整分发时，可以只构建一个常规目标：

```bash
node scripts/build-skills.mjs --target generic-en
node scripts/build-skills.mjs --target generic-zh-CN
node scripts/build-skills.mjs --target codex-zh-CN
node scripts/build-skills.mjs --target claude-code-zh-CN
node scripts/build-skills.mjs --target cursor-zh-CN
node scripts/build-skills.mjs --target qwen-zh-CN
node scripts/build-skills.mjs --target kimi-zh-CN
```

生成的常规目标和 ChatGPT 包都写入 `dist/`。

安装目标判断刻意保持保守：

- `--agent codex` 使用 `CODEX_HOME/skills`；没有配置 `CODEX_HOME` 时使用标准 Codex home；
- `--agent shared` 使用 `AGENTS_HOME/skills`；没有配置时使用共享 `.agents/skills` home；
- `--target-dir` 用于隔离或自定义目标；
- 没有显式参数时，必须且只能存在一个已配置的 `CODEX_HOME` 或 `AGENTS_HOME`；
- 同时检测到多个 home 时，在写入前安全退出；绝不会只凭目录存在判断 Agent。

安装器默认使用 Recommended，完成后核验安装集合；除非显式传入 `--force`，否则不会替换目标中已有的同名 Skill。公开 CLI 的对应命令包括：

```bash
npx repo-doctor-skills install --agent codex
npx repo-doctor-skills install --agent shared
npx repo-doctor-skills install --target-dir ./my-skills
npx repo-doctor-skills install --force
```

## 6. Individual 单 Skill 安装

- **Codex 插件：** 直接调用已安装的稳定 slug，例如 `$safe-code-review`。
- **ChatGPT ZIP：** 安装对应前缀的 ZIP，再使用当前 Skills 界面或自然语言。
- **Portable prompt：** 复制 Skill 时一起复制所有直接链接的资源。

如果说明文件链接了同级 references、assets 或 scripts，不要只复制一个文件。不要在安装中重命名稳定 Skill slug。

## 7. 维护者模型

源码层和分发层承担不同职责：

| 层级 | 用途 | 编辑规则 |
|---|---|---|
| `packs/` | canonical Skill 逻辑、元数据、本地化、权限、风险、示例和测试 | 优先在这里修改 |
| `plugins/` | 同步的插件兼容与分发产物 | 重新生成，不在这里维护 Skill 逻辑 |
| `adapters/` | 平台渲染说明 | 仅在平台行为变化时修改 |
| `dist/` | 生成的跨平台和 ZIP 产物 | 绝不直接修改 |

仓库通过校验与生成保持 canonical slug、权限、安全门禁、execution profiles、workflows、Schema、Pack / Plugin / Adapter / Build 架构、双语同步和发布体系一致。

维护者入口：

- [新增 Skills](ADDING_SKILLS.zh-CN.md)
- [Skill 规范](SKILL_SPEC.md)
- [平台适配](PLATFORM_ADAPTERS.md)
- [维护者检查清单](MAINTAINER_CHECKLIST.zh-CN.md)
- [版本与生命周期](VERSIONING.zh-CN.md)
- [贡献指南](../CONTRIBUTING.md)

典型维护校验：

```bash
npm run docs:generate
npm run validate
npm test
npm run build
npm run docs:check
npm run quality:check
```

## 8. 继续阅读

- [快速开始](QUICK_START.zh-CN.md)：源码流程
- [执行模式](guides/execution-modes.zh-CN.md)：详细模式契约
- [工作流实战手册](WORKFLOW_COOKBOOK.zh-CN.md)：明确需要多步骤的任务
- [Release 资产选择](guides/release-asset-selection.zh-CN.md)：下载并核验发布产物
- [版本与生命周期](VERSIONING.zh-CN.md)：项目版本与组件版本
