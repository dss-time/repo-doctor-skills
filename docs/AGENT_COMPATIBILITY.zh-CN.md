# Agent 安装与兼容性

[English](AGENT_COMPATIBILITY.md)

在项目中运行 `npx skills@latest add dss-time/repo-doctor-skills`，选择你的 Agent。每个 Agent 选择一种安装方式即可。该命令跟随公开仓库默认分支。已发布 npm 版本为 **0.11.1**，自动运行 Change Guard 的示例属于尚未发布的 **0.12.0 候选**。

## 定向安装

| Agent | 安装到项目 | 项目目录 | 加 `-g` 后的个人目录 |
| --- | --- | --- | --- |
| OpenAI Codex | `npx skills@latest add dss-time/repo-doctor-skills -a codex` | `.agents/skills` | `~/.agents/skills` |
| Claude Code | `npx skills@latest add dss-time/repo-doctor-skills -a claude-code` | `.claude/skills` | `~/.claude/skills` |
| Cursor | `npx skills@latest add dss-time/repo-doctor-skills -a cursor` | `.agents/skills` | `~/.agents/skills` |
| GitHub Copilot | `npx skills@latest add dss-time/repo-doctor-skills -a github-copilot` | `.agents/skills` | `~/.agents/skills` |
| Gemini CLI | `npx skills@latest add dss-time/repo-doctor-skills -a gemini-cli` | `.agents/skills` | `~/.agents/skills` |
| OpenCode | `npx skills@latest add dss-time/repo-doctor-skills -a opencode` | `.agents/skills` | `~/.agents/skills` |

这些目录在 macOS 上使用 Vercel Skills CLI **1.9.0** 及隔离用户目录实测。该版本的安装器需要 Node **22.20.0+**，Repo Doctor 自带 CLI 和候选运行时支持 Node 18+。工作区比较需要本地 Git。项目安装只用于当前仓库，个人目录可能被多个客户端共享。Cursor 远程会话和 GitHub Copilot 云端按各自入口的发现规则与策略加载。 [Agent Skills 开放标准](https://agentskills.io/specification) · [Vercel Skills CLI](https://github.com/vercel-labs/skills)

安装后打开新会话，用自然语言描述任务。由宿主发现 Skills、决定何时加载正文，并管理文件访问、进程执行及沙箱授权。候选版的四个可写 Skills 各自携带所需的运行时资源。Node、Git 和项目本地状态权限可用时可直接调用。工具受限时，继续进行已授权的检查和业务验证，无法获知的观察结果保持未知。

## 已验证的范围

公开仓库简写也通过 `skills add --list` 核验，发现 34 个 Skills。

- 六个 CLI 定向目标均在项目和隔离个人范围安装了一个候选可写 Skill。安装的正文和依赖资源与冻结源码匹配。直接执行 12 份安装结果的内置 Node 入口，均在各自的临时 Git 仓库发现预置的范围外改动。
- Codex CLI 0.171.0-alpha.13.2 已观测候选的发现、正文读取、自动调用与部分报告处理。公共模块曾漏触发，后续复测成功。一次已有修改任务的答复未报告 warning 与 unknown。
- 本机 Claude Code 1.0.70 只查询了版本。Claude Code、Cursor、GitHub Copilot、Gemini CLI 和 OpenCode 已验证安装与独立运行时。本轮未验证这五个宿主的发现、正文加载、自动调用和报告处理。

[安装实测记录](../tests/reports/change-guard-0.12.0-six-agent-install-2026-11-25.json) · [Codex 使用记录](research/change-guard-integration.md)

## 更新或在本地试用候选

使用 `npx skills@latest check` 与 `npx skills@latest update` 检查和更新，个人范围附加 `-g`。新增选项时重新运行 `add`。Repo Doctor npm 安装器通过重跑同一命令替换所选副本，替换前先核对本地改动。单项、推荐、全量及原生插件选项见[使用手册](USER_MANUAL.zh-CN.md)。

隔离试用时，在独立克隆检出[正式候选验证分支](https://github.com/dss-time/repo-doctor-skills/tree/codex/0.12.0-stable-validation)上验收记录所指的提交。进入临时目标项目，将该检出的 `skills` 绝对路径作为 `npx skills@1.9.0 add` 的来源。验证已核对指纹的本地 npm tarball 时，运行 `npx --yes --package /absolute/path/repo-doctor-skills-0.12.0.tgz -- repo-doctor-skills --version`，应输出 `0.12.0`。将 `--version` 换成 `install --target-dir /absolute/path/to/disposable-skills` 可安装到隔离目录。

### 宿主官方文档

[Codex](https://developers.openai.com/codex/skills/) · [Claude Code](https://code.claude.com/docs/en/skills) · [Cursor](https://cursor.com/docs/skills) · [GitHub Copilot](https://docs.github.com/en/copilot/concepts/customizations/agent-skills) · [Gemini CLI](https://geminicli.com/docs/cli/skills/) · [OpenCode](https://opencode.ai/docs/skills/)

Codex 的独立本地市场试用见[本地 Codex Beta](LOCAL_CODEX_BETA.zh-CN.md)。
