[English](./README.md) | **简体中文**

# Repo Doctor Skills

用职责明确的 Skill 排查 Bug、审查代码、完成修复和测试。


当前稳定版本为 **0.10.1**，包含 33 个 Skill，已发布至 GitHub 和 npm。npm 的 `latest` 标签已指向 `0.10.1`。[GitHub Release](https://github.com/dss-time/repo-doctor-skills/releases/tag/v0.10.1) · [npm](https://www.npmjs.com/package/repo-doctor-skills/v/0.10.1) · [发布说明](docs/RELEASE_NOTES_0.10.1.zh-CN.md)。

0.10.1 为文档补丁，复用与源码绑定的 0.10.0 运行组件证据。0.10.0 发布评测使用 `gpt-6.1-terra`，基础、工作流、模式和权限案例 **284/284 全部通过**。实际单点修改和协调恢复试验也已通过。安装兼容性已通过 Linux、macOS、Windows 的 Node 18 与当前 LTS CI 检查。[最终模型报告](tests/reports/live-codex-skill-validation-0.10.0.json) · [协调试验报告](tests/reports/coordination-release-0.10.0.json)。

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

## Codex 插件

安装完整工程能力（26 个 Skill）：

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

为 Codex 安装源码中的全部 33 个 Skill：

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


## v0.10.1 正式版

v0.10.1 包含 33 个 Skill（Repo Doctor 26 个）和 33 个 ChatGPT ZIP。删除了 6 个 PDF、Word、Excel Skill，并合并两组需求/规划入口。正式 Live-model PASS 证据绑定发布源码。[发布说明](docs/RELEASE_NOTES_0.10.1.zh-CN.md) · [完整交付样例](docs/guides/delivery-examples.zh-CN.md)。

升级时，原 `requirements-to-spec` 的任务改用 `requirements-clarification`，原 `spec-to-work-items` 的任务改用 `safe-change-plan`。已删除或合并的 Skill 如曾安装，其旧目录需要检查本地自定义内容后手动清理。详见[升级说明](docs/RELEASE_NOTES_0.10.1.zh-CN.md#已有安装升级)。

将 GitHub 插件固定到 `v0.10.1`：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.10.1
codex plugin add repo-doctor@repo-doctor-marketplace
```
安装指定 npm 版本（默认 7 个常用 Skill，也可安装全部 33 个）：

```bash
npx repo-doctor-skills@0.10.1 install --agent codex
npx repo-doctor-skills@0.10.1 install --preset full --agent codex
```

同一 Agent 选择一种安装方式。官方 skills CLI 从公开 GitHub 源码安装。

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

[0.10.1 证据复用记录](tests/reports/release-promotion-0.10.1.json)绑定原报告、完整 Skill 内容和安装器运行文件。评测范围及局限见 [0.10.0 验证记录](docs/RELEASE_VALIDATION_0.10.0.md)。此前的安全与用户项目评测保留为[历史开发阶段记录](tests/reports/unified-validation-2026-11-05/README.md)。
