# 旧版 Codex 插件

本文档保留 Repo Doctor Codex 插件的历史安装路径，并说明它在当前 Repo Doctor Skills 中作为生成兼容产物的定位。

## `plugins/` 与 `packs/`

```text
plugins/repo-doctor/
```

这是历史 Codex 插件路径。当前内容由 `packs/engineering/repo-doctor/` 同步生成，用于兼容和分发。已有用户可以继续安装或检查它，但不应把它作为主要编辑入口。

```text
packs/
```

这是唯一的 canonical 源结构。Skill 业务逻辑、双语内容、权限、风险、测试、资源和输出契约都应在这里维护。

## 生成的插件结构

保留历史路径是为了兼容已有 Codex 插件用户。本项目最初以 `repo-doctor-codex-plugin` 发布，当前公开仓库名为 `repo-doctor-skills`。不得把生成的插件副本当作第二份真实来源。

```text
.agents/plugins/marketplace.json
plugins/repo-doctor/.codex-plugin/plugin.json
plugins/repo-doctor/skills/
```

`plugins/repo-doctor/.codex-plugin/plugin.json` 仍然指向：

```json
{
  "skills": "./skills/"
}
```

生成的 Repo Doctor 分发包含 25 个边界明确的工作流与专项工程 Skill：

- `repo-doctor-router`
- `repo-onboarding`
- `requirements-clarification`
- `requirements-to-spec`
- `spec-to-work-items`
- `project-health-check`
- `safe-code-review`
- `change-impact-analysis`
- `safe-fix-implementation`
- `bug-root-cause-analysis`
- `safe-change-plan`
- `test-gap-analysis`
- `safe-test-implementation`
- `ci-failure-diagnosis`
- `documentation-sync`
- `release-readiness-check`
- `dependency-upgrade-analysis`
- `api-contract-review`
- `database-migration-review`
- `dead-code-verification`
- `security-focused-review`
- `performance-regression-analysis`
- `architecture-decision-record`
- `configuration-audit`
- `session-handoff`

## 维护与重新生成插件

请在 canonical Pack 中创建或更新 Repo Doctor Skill，再运行仓库提供的真实命令：

```bash
npm run sync:plugin
npm run validate
npm test
npm run build
node scripts/check-skill-quality.mjs --check-dist
```

`npm run sync:plugin` 只刷新 Repo Doctor 兼容分发。完整构建会生成 7 个常规跨平台目标，通过构建流水线同步 3 个插件分发，创建 `rd-*`、`pt-*` 和 `sm-*` ChatGPT 包，并检查生成物漂移。

## Marketplace 来源

使用：

```text
plugins/repo-doctor/
```

如果 Codex 宿主支持 plugin marketplace source，可以添加本仓库。宿主界面字段和安装行为可能随版本变化，请以所用宿主版本为准。

```text
Source: dss-time/repo-doctor-skills
Git ref: main
Sparse path: leave empty
```

也可以使用完整 Git URL：

```text
Source: https://github.com/dss-time/repo-doctor-skills.git
Git ref: main
Sparse path: leave empty
```

安装 `Repo Doctor` 插件后，请按宿主要求刷新或开启新会话。

## 本地 Marketplace 配置

仓库包含：

```text
.agents/plugins/marketplace.json
```

其中 Repo Doctor 条目指向本地生成插件路径：

```json
{
  "source": {
    "source": "local",
    "path": "./plugins/repo-doctor"
  }
}
```

## 如何验证

如果宿主支持 `$` Skill 发现，可输入：

```text
$
```

并搜索例如：

```text
repo-onboarding
project-health-check
safe-code-review
change-impact-analysis
safe-fix-implementation
```

## 如果想跨平台构建

使用：

```text
packs/
```

然后运行：

```bash
npm run validate
npm test
npm run build
```

构建脚本会从 `packs/` 生成不同平台输出，例如：

```text
dist/codex-zh-CN/AGENTS.md
dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md
dist/generic-zh-CN/
```

## 快速开始

```text
$repo-onboarding

请帮我理解当前项目。
先不要修改任何代码。
```

```text
$project-health-check

请对当前项目做一次项目体检。
先不要修改代码。
请按照 P0/P1/P2/P3 给出优先级。
```

```text
$safe-code-review

请审查当前改动。
重点检查正确性、可维护性、安全、性能、类型、测试和冗余代码。
```

```text
$change-impact-analysis

我想重构一个共享请求工具。
修改前请分析依赖方、可能的破坏和所需测试。
```

```text
$safe-fix-implementation

请修复上一份 project-health-check 报告中优先级最高的问题。
不要一次修复所有问题；先做影响范围最小的安全 P0/P1 修复。
修改后请运行或建议验证命令。
```
