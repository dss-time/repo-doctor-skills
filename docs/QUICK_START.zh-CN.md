# 快速开始

## 1. 安装

使用当前 Node.js LTS（已测试 Node 24）；最新外部 skills CLI 无法在本仓库最低支持的 Node 18 环境运行。

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

在项目目录运行，选择 Agent 和 Skill。可以先选择 `safe-code-review`，或 README 列出的 7 个常用 Skill。加 `-g` 可安装到用户目录供所有项目使用。

也可以选择 Codex 工程插件：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills
codex plugin add repo-doctor@repo-doctor-marketplace
```

同一 Agent 的同一组 Skill 选择一种安装方式，安装后新建任务。

## 2. 提出请求

```text
$safe-code-review 审查当前修改。
```

直接描述任务即可，无需指定执行模式。不知道选哪个时使用 `$repo-doctor-router`。

## 3. 查看结果

审查会报告有证据的问题和相关限制；修复请求会报告实际修改与验证结果。需要完整证据时再要求详细输出。

## 需要更多

- [按问题选 Skill](guides/problem-to-skill.zh-CN.md)
- [用户手册](USER_MANUAL.zh-CN.md)
- [全部能力](SKILL_CATALOG.zh-CN.md)
- [明确需要多步骤时](WORKFLOW_COOKBOOK.zh-CN.md)
- [源码构建与其他平台](ADVANCED_USAGE.zh-CN.md)
- [版本与生命周期](VERSIONING.zh-CN.md)

复制安装的 Skills 使用 `npx skills@latest update` 更新；新增 Skill 再运行 `add` 选择。需要 preset 或单语言正文时，仍可使用 `npx repo-doctor-skills install`。用户无需克隆或构建仓库。
