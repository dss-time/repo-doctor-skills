[English](./README.md) | **简体中文**

# Repo Doctor Skills

简单任务快速处理，高风险修改严格验证。

用职责明确的 Skill 排查 Bug、审查代码、澄清需求、完成小范围修复、补充测试和检查发布状态，不让每个任务都变成重流程。

## 能解决的常见问题

- “这个接口偶尔返回 500，应该从哪里开始？”
- “只审查这次修改，不要改文件。”
- “完成这个小修复并验证。”
- “需求还很模糊，帮我只澄清关键选择。”

## 30 秒开始

用一条命令安装 Recommended preset：

```bash
npx repo-doctor-skills install
```

不知道该用哪个 Skill？直接运行 `$repo-doctor-router`。

如果已经知道要用哪个 Skill，例如 `$safe-code-review`，直接调用即可。Router 不是必经步骤；它只推荐，不会执行推荐的 Skill。

## 最小示例

**用户**

```text
$repo-doctor-router

这个接口偶尔返回 500，我不知道该先排查还是直接修改。
```

**Repo Doctor**

```text
推荐：$bug-root-cause-analysis
原因：这是非 CI 的运行时故障，应先核验根因再决定是否修复。
模式：fast
需要：报错信息和最小复现。
```

然后在新一轮中调用 `$bug-root-cause-analysis` 并提供这些证据。Repo Doctor 不会自动串联多个 Skill。

## 推荐安装

默认 preset 安装以下 7 个高频 Skill：

- `$repo-doctor-router`：不知道下一步选谁时的可选兜底入口；
- `$requirements-clarification`：实施前关闭会实质影响工作的歧义；
- `$bug-root-cause-analysis`：只读排查非 CI 运行时故障；
- `$safe-fix-implementation`：完成一个范围明确且已授权的生产代码修复；
- `$safe-test-implementation`：补充一个明确授权的测试或回归保护；
- `$safe-code-review`：审查一个具体 diff，但不直接修复；
- `$decision-prototype`：显式构建一次性证据，验证一个不确定决策。

这组能力覆盖从不确定、诊断到修改、测试和审查的常见路径，同时不把安全、数据库、迁移、发布和维护类专项 Skill 塞进默认安装。Recommended 只是安装 preset：每个 Skill 仍来自原有源文件，并保持原有权限、安全门禁和执行配置。

安装结束时会直接提示下一条输入：

```text
Repo Doctor Skills installed.

Installed: 7 Skills
Preset: Recommended
Target: <你的共享 Skills 目录>

Try:

$repo-doctor-router
I don't know which Skill to use.
```

没有可靠的 Agent 专属信号时，安装器使用共享的 `~/.agents/skills` 位置，并打印准确目标。它绝不会仅因为某个目录存在就猜测 Agent。

## 完整安装

把全部 40 个 active Skill 安装到同一个 Codex Skills 目录：

```bash
npx repo-doctor-skills install --preset full
```

数量不同的原因：仓库的四组源码共有 40 个 active Skill；**Repo Doctor** 单个插件包含 27 个工程 Skill；当前三个插件合计分发 37 个 Skill；剩余 3 个 Document Data Doctor Skill 会进入常规平台构建和 Full 源码安装器，但没有独立插件。因此 Full 在这种 Codex 目录安装中是真实的全部 40 个 Skill，同时不改变现有插件边界。

## 按问题选择

| 问题 | 从这里开始 |
|---|---|
| Bug 或偶发运行故障 | `$bug-root-cause-analysis` |
| 完成范围明确的代码修改 | `$safe-fix-implementation` |
| 审查 diff | `$safe-code-review` |
| 澄清模糊需求 | `$requirements-clarification` |
| 把已确定的需求转成规格 | `$requirements-to-spec` |
| 验证一个不确定的设计方向 | `$decision-prototype` |
| 分析越来越难改的架构 | `$architecture-deepening-analysis` |
| 检查候选版本能否发布 | `$release-readiness-check` |
| 仍然不知道选哪个 | `$repo-doctor-router` |

可复制的最短请求见 [问题 → Skill](docs/guides/problem-to-skill.zh-CN.md)。

## 执行模式

- **Fast** — 简单任务：少量文件、定向验证、快速结束。
- **Standard** — 普通开发：相关模块、相关测试、必要证据。
- **Audit** — 数据库、安全、迁移、发布：完整证据和权限门禁。

Fast 不代表跳过安全，Audit 也不会用于每一个小问题。具体 Skill 和实际风险始终可以要求更严格的模式。

## 版本

Project Release Version（项目发布版本）与 Plugin / Pack Component Version（插件 / Pack 组件版本）属于不同层级，因此不要求相同。前者标识整个仓库的发布快照，后者标识单独分发能力的版本。真实更新步骤见[用户手册](docs/USER_MANUAL.zh-CN.md#7-更新)。

## 文档

- [用户手册](docs/USER_MANUAL.zh-CN.md)
- [Skill 目录](docs/SKILL_CATALOG.zh-CN.md)
- [高级用法](docs/ADVANCED_USAGE.zh-CN.md)
- [贡献 / 维护者指南](CONTRIBUTING.md)

## License

[MIT](LICENSE)
