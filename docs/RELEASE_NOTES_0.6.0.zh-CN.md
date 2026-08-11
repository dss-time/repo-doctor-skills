# Repo Doctor Skills v0.6.0 正式稳定版

> 发布日期：2026-08-11。本次 stable non-prerelease 使用 `v0.6.0` tag，核心变化是公开的一键安装。

## 公开一键安装

安装 Recommended：

```bash
npx repo-doctor-skills install
```

默认安装 7 个高频 Skill，并立即提示 `$repo-doctor-router`。安装全部 40 个 active Skill：

```bash
npx repo-doctor-skills install --preset full
```

高级用户仍可继续使用现有 Codex 插件、ChatGPT 单 Skill ZIP、源码构建和平台专用产物。

## CLI 行为

- `install` 默认使用 Recommended，不要求用户理解 Pack、category、ID 或 Skill 清单。
- `--preset recommended` 安装 7 个，`--preset full` 安装 40 个。
- `--agent codex`、`--agent shared` 和 `--target-dir` 提供明确目标。
- 没有显式 `--force` 时，不替换已有同名 Skill。
- Codex/shared Home 信号冲突时零写入退出。
- 没有可靠的 Agent 专属信号时，使用共享 `.agents/skills` home，并打印准确目标。

## 版本与可靠性

npm package 是新的公开分发层。项目版本提升为 0.6.0，但 Pack、插件和单个 Skill 的组件版本保持独立。Repo Doctor Pack/插件仍为 0.8.0，Productivity Toolkit 为 0.1.0，Skill Maintainer 为 0.2.0，Document Data Doctor 为 0.1.0。

Skill 核心行为没有改变。canonical slug、权限、安全门禁、执行模式、execution profile、workflow、Schema、Pack、插件、adapter 和 build 契约均未弱化或重命名。破坏性动作继续禁用。

Live-model 验证状态继续为 **PASS**，沿用 stable release contract 中保存的 317/317 机器可读路由证据；v0.6.0 新增的是分发与 UX 能力，不冒充新的 Skill 路由结论。

GitHub Release 继续发布现有 37 个带版本单 Skill ZIP，以及 Release Notes、Release Manifest 和 `SHA256SUMS-v0.6.0.txt`。npm 分发不会删除或取代这些资产。
