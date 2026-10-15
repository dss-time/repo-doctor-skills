[English](./README.md) | **简体中文**

# Repo Doctor Skills

用职责明确的 Skill 排查 Bug、审查代码、完成修复和测试。

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

## Codex 插件

安装完整工程能力（27 个 Skill）：

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

为 Codex 安装全部 40 个 Skill：

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

## 可选的 preset 与语言安装器

```bash
npx repo-doctor-skills install
npx repo-doctor-skills install --preset full
npx repo-doctor-skills install --language zh-CN
```

这个替代入口默认安装 7 个常用 Skill，支持 `en`、`zh-CN`、`bilingual` 正文。它打印安装目标、跳过相同内容，替换不同内容需要 `--force`。外部 skills CLI 的 Node 要求由其自身版本决定。

## v0.7.3 正式版

使用 **GPT-6.1 Sol、low 推理强度**完成新的真实模型评测，结果 **317/317 通过**：200 项核心用例、44 个双语工作流步骤、61 项模式/判定和 12 项权限用例。本版不使用评测豁免；额度阻塞后核验模型、用例与 Skill 哈希再续跑，原始尝试保留。参见[评测报告](tests/reports/live-codex-skill-validation-0.7.3.md)。

在 Codex 中安装这个准确版本：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.7.3
codex plugin add repo-doctor@repo-doctor-marketplace
```

40 个 Skill 和组件版本与 v0.7.2 相同。也可以通过 npm 命令安装这个准确版本：

```bash
npx repo-doctor-skills@0.7.3 install --agent codex
npx repo-doctor-skills@0.7.3 install --preset full --agent codex
```

第一条安装推荐的 7 个 Skill，第二条安装全部 40 个，均写入用户级 Codex Skills 目录。同一 Agent 选择插件或复制 Skills 一种方式即可。参见[发布说明](docs/RELEASE_NOTES_0.7.3.zh-CN.md)。

## 文档

- [问题 → Skill](docs/guides/problem-to-skill.zh-CN.md)
- [用户手册](docs/USER_MANUAL.zh-CN.md)
- [Skill 目录](docs/SKILL_CATALOG.zh-CN.md)
- [高级用法：插件、平台、版本与源码构建](docs/ADVANCED_USAGE.zh-CN.md)
- [贡献指南](CONTRIBUTING.md)

[MIT](LICENSE)
