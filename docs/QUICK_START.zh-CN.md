# 新手快速开始

这份文档面向第一次看到这个项目的用户。

## 选择适合你的入口

- 想在 5 分钟内完成构建：继续阅读本页。
- 想了解安装、调用语法、权限和故障排查：看[完整用户手册](USER_MANUAL.zh-CN.md)。
- 知道任务但不知道 Skill 名：查[Skill 完整目录](SKILL_CATALOG.zh-CN.md)。
- 一个任务需要串联多个 Skill：看[工作流实战手册](WORKFLOW_COOKBOOK.zh-CN.md)。
- 需要核对发布、Pack/插件版本或 Skill 成熟度：看[版本与生命周期策略](VERSIONING.zh-CN.md)。
- 需要新增或维护 Skill：继续看[新增 Skills 指南](ADDING_SKILLS.zh-CN.md)。

## 候选版本说明

当前 checkout 是 **v0.3.0-rc.1 Release Candidate**。确定性门禁已通过，但真实模型路由准确率仍为 **UNKNOWN**，因此它按 prerelease 发布。项目版本、组件版本和成熟度状态彼此独立。4 个 active Pack 和 38 个 active Skill 当前均为 `beta`，表示已经通过仓库验证、可以用于真实任务，但仍缺少广泛公开使用和 Live-model 路由证据。当前 Live-model 路由准确率为 **UNKNOWN**。

## 你正在看的是什么

Repo Doctor Skills 有两条实际入口：

1. 使用 `plugins/` 下同步生成的 Repo Doctor、Productivity Toolkit 或 Skill Maintainer 兼容分发。
2. 把 `packs/` 作为跨平台 AI Skill 的唯一 canonical 来源，再生成 `plugins/` 和 `dist/` 产物。

如果你只是想试用已有 Codex 插件，请看 [LEGACY_CODEX_PLUGIN.zh-CN.md](LEGACY_CODEX_PLUGIN.zh-CN.md)。如果你想构建多平台输出，继续看本页。

## 克隆仓库

```bash
git clone https://github.com/dss-time/repo-doctor-skills.git
cd repo-doctor-skills
```

## 运行校验

```bash
npm run validate
npm test
```

这些命令会检查必需文件、元数据、语言覆盖、权限、公开安全边界、activation 契约、维护工具 fixture、同步和确定性构建。

## 构建所有输出

```bash
npm run build
```

该命令会同步插件分发，在 `dist/` 下生成 7 个常规平台目标，并在 `dist/chatgpt-skills/` 中生成插件支持的 ChatGPT 上传包。

## ChatGPT ZIP 上传包

每个包都有一个 ZIP 和一个用于检查的同名展开目录。文件名前缀表示来源插件，其余部分映射到 canonical Skill slug。

| 前缀 | 插件 | 当前数量 |
|---|---|---:|
| `rd-*` | Repo Doctor | 25 |
| `pt-*` | Productivity Toolkit | 8 |
| `sm-*` | Skill Maintainer | 2 |

Document Data Doctor 的 3 个 Basic Skill 会进入 7 个常规跨平台目标，但没有独立插件或 ChatGPT ZIP。经过核验的 ChatGPT 上传步骤、包名前缀，以及“单个上传 Skill”和“插件”的区别，见[完整用户手册](USER_MANUAL.zh-CN.md)。

## 生成中文通用 Prompt Pack

```bash
node scripts/build-skills.mjs --target generic-zh-CN
```

输出目录：

```text
dist/generic-zh-CN/
```

每个文件都是可复制使用的 Markdown prompt。若文件引用同级 `references/`、`assets/` 或 `scripts/`，请复制整个目标目录，避免资源丢失。

## 生成 Codex / CodeX 中文输出

```bash
node scripts/build-skills.mjs --target codex-zh-CN
```

输出文件：

```text
dist/codex-zh-CN/AGENTS.md
```

在支持 agent instruction 文件的 Codex / CodeX 风格项目中，可以复制或引用生成的整个目标目录；请让 `AGENTS.md` 与同级资源目录保持在一起。

## 生成 Claude Code 中文输出

```bash
node scripts/build-skills.mjs --target claude-code-zh-CN
```

输出结构：

```text
dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md
```

使用时，把生成的 `.claude/skills/` 目录复制到目标 Claude Code 环境。

## 查看 dist 输出

```bash
find dist -maxdepth 4 -type f | sort
```

生成文件会被 Git 忽略。不要直接修改 `dist/`。请修改 `packs/`，然后重新构建。

## 常见问题

### 我应该改 `plugins/` 还是 `packs/`？

修改 `packs/`。`plugins/` 是同步生成的兼容和分发产物，不应在其中维护第二份 Skill 业务逻辑。

### 需要提交 `dist/` 里的生成文件吗？

不需要。`dist/*` 被忽略，只保留 `dist/.gitkeep`。

### 需要安装依赖吗？

当前不需要安装 npm 依赖，脚本使用 Node 内置模块。完整 ChatGPT 打包步骤还要求 `PATH` 中存在可用的 `zip` 命令。

### 新增 skill 从哪里开始？

先看 [ADDING_SKILLS.zh-CN.md](ADDING_SKILLS.zh-CN.md)，再使用仓库的 `npm run create:skill -- ...` 脚手架。`packs/_template/` 只是参考模板，不是第二套创建流程。
