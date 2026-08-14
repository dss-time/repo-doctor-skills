# Repo Doctor Skills 用户手册

这份手册先给新用户一条最短可用路径。平台打包与维护者细节统一放在[高级用法](ADVANCED_USAGE.zh-CN.md)。

> 平台入口核验日期为 2026-07-15。产品界面、订阅方案和工作区策略可能变化，请以当前宿主实际提供的控件为准。

## 1. 安装

### 推荐安装：7 个入门 Skill

运行：

```bash
npx repo-doctor-skills install
```

这个无交互安装器只把 7 个 Recommended Skill 写入 Codex Skills 目录，逐个验证 `SKILL.md`，并把 `$repo-doctor-router` 作为第一条调用提示。preset 包含 `repo-doctor-router`、`requirements-clarification`、`bug-root-cause-analysis`、`safe-fix-implementation`、`safe-test-implementation`、`safe-code-review` 和 `decision-prototype`。

`--agent codex` 会显式选择 Codex。安装器不会仅因为某个目录存在就认定用户正在使用对应 Agent；没有显式参数时，唯一一个已配置的 `CODEX_HOME` 或 `AGENTS_HOME` 会被视为可靠信号。两者同时存在时，安装器在写入前安全退出；两者都不存在时，安全安装到共享 `~/.agents/skills`，并打印准确目标。

### 完整安装：全部 40 个 active Skill

```bash
npx repo-doctor-skills install --preset full
```

源码仓库共有 40 个 active Skill。Repo Doctor 插件显示 27，是因为它只包含工程能力；当前三个插件合计包含 37 个 Skill；剩余 3 个 Document Data Doctor Skill 会进入常规平台构建和 Full 源码安装器，但没有独立插件。源码清单中没有 Skill 丢失。

### Individual

单 Skill 安装属于高级用法，因为正确产物和资源目录取决于宿主。详见[高级用法](ADVANCED_USAGE.zh-CN.md#6-individual-单-skill-安装)。它不会成为新用户第一次使用时的额外选择题。

## 2. 先试这一条

在目标仓库的新任务中输入：

```text
$repo-doctor-router

这个接口偶尔返回 500，我不知道该先排查还是直接修改。
```

默认简短输出遵循这个契约：

```text
推荐：$bug-root-cause-analysis
原因：这是非 CI 的运行时故障，应先核验根因再决定是否修复。
模式：fast
需要：报错信息和最小复现。
```

Router 到这里就会停止。如果要继续，请在后续一轮调用推荐的 Skill。

## 3. Router

不知道该用哪个 Skill？直接运行 `$repo-doctor-router`。

Router 会：

- 推荐一个 active Repo Doctor Skill；
- 推荐 `fast`、`standard` 或 `audit`；
- 保持只读，不运行命令、不修改文件；
- 绝不递归调用推荐结果；
- 默认只返回简短的四行答案。

它是兜底入口，不是必经步骤。如果已经知道要用 `$safe-code-review`、`$requirements-clarification` 或其他 Skill，直接调用即可。

## 4. 常见任务

| 目标 | 从这里开始 | 最短请求 |
|---|---|---|
| 排查运行时 Bug | `$bug-root-cause-analysis` | `查明这个偶发 500 的原因，不要修改文件。` |
| 完成一个小范围修复 | `$safe-fix-implementation` | `修复这个已确认问题；只授权修改 <文件>。` |
| 审查代码 | `$safe-code-review` | `只审查当前 diff，不要修复。` |
| 澄清需求 | `$requirements-clarification` | `只追问会实质改变这项工作的关键问题。` |
| 形成可测试规格 | `$requirements-to-spec` | `把这些已确定的需求转成验收标准。` |
| 比较不确定方案 | `$decision-prototype` | `用一次性原型比较这两个方案。` |
| 分析架构摩擦 | `$architecture-deepening-analysis` | `分析这些重复耦合，不要重构。` |
| 检查候选发布 | `$release-readiness-check` | `检查这个版本能否发布，但不要执行发布。` |

一个容易成功的请求会说明目标、证据、范围、写权限和期望输出。即使授权清晰，也不能越过 Skill 自身的安全边界。

## 5. 问题 → Skill

知道问题、想直接复制最短请求时，使用[问题 → Skill 指南](guides/problem-to-skill.zh-CN.md)。需要完整清单和详细边界时，查看 [Skill 目录](SKILL_CATALOG.zh-CN.md)。

默认每一步只使用一个主 Skill。Repo Doctor 不假设宿主会自动串联多个 Skill；把上一步结果作为证据传入，并在从分析转向写入时重新确认权限。

## 6. Fast / Standard / Audit

| 模式 | 用户能感知到的含义 |
|---|---|
| **Fast** | 简单任务：少量文件、定向验证、快速结束。 |
| **Standard** | 普通开发：相关模块、相关测试、必要证据。 |
| **Audit** | 数据库、安全、迁移、发布：完整证据和权限门禁。 |

Fast 不代表跳过安全，Audit 也不会用于每一个小问题。只有任务的真实风险、权限边界或证据要求需要时，Skill 才会升级模式。

## 7. 更新

### 先理解两个版本层级

- **Project Release Version（项目发布版本）**标识一个经过测试的仓库发布快照，例如 GitHub Release `v0.6.1`。
- **Plugin / Pack Component Version（插件 / Pack 组件版本）**标识单独分发的组件，例如 Repo Doctor `0.8.0`。

两者描述不同层级，因此不要求相同。一次项目发布可以包含自身契约没有变化的组件。

### 更新 Codex 插件安装

本项目不宣传或保证自动更新能力。

1. 阅读发布说明，选择你信任的准确 release tag。
2. 刷新或替换已配置的 marketplace source，使它指向该 tag。当前稳定版经过核验的命令是：

   ```bash
   codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.6.1
   ```

3. 使用当前宿主提供的控件重新安装或刷新 **Repo Doctor**。
4. 新建任务，并用 `/skills` 确认发现结果。

只有明确测试未发布内容时才使用开发版 source：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

远程 `main` 会变化，也不包含本地 checkout 中未提交的文件。对于下载的 ChatGPT ZIP 或复制的平台产物，应下载或构建新产物、完成校验、通过宿主替换旧安装，再新建任务。详见[版本与生命周期策略](VERSIONING.zh-CN.md)。

## 8. 高级用法

以下内容见[高级用法](ADVANCED_USAGE.zh-CN.md)：

- ChatGPT 单 Skill ZIP，以及 `rd-*`、`pt-*`、`sm-*` 命名；
- ChatGPT 插件、Codex 项目指令、Claude Code、Cursor、Qwen、Kimi 和 generic prompts；
- 源码 checkout、校验、构建目标、平台差异和单 Skill 分发；
- 开发者与维护者入口。

明确需要多步骤协作时，再从[工作流实战手册](WORKFLOW_COOKBOOK.zh-CN.md)继续。需要源码五分钟流程时，查看[快速开始](QUICK_START.zh-CN.md)。

## 9. 安全与排障

Skill 是可复用的工作契约，不是独立模型，也不会自动获得权限。宿主沙箱、管理员策略和用户明确授权始终有效。

`risk_level`、`write_files` 等元数据只描述 Skill 的设计能力上限，不会授予访问权。所有 active Skill 都禁止破坏性动作；可写 Skill 也不会自动获得 commit、push、tag、部署、发布、生产访问或大规模重构权限。

从只读分析转向修改时，使用这个顺序：

```text
证据和范围 → 计划 → 明确写授权 → 最小修改 → 验证 → 审查或发布门禁
```

安装后找不到 Skill 时：

1. 确认已经安装 **Repo Doctor**，而不只是添加了 marketplace source。
2. 新建任务，并检查 `/plugins` 与 `/skills`。
3. 按稳定的小写 Skill 名搜索。
4. 确认工作区策略允许插件。
5. 记录宿主版本和准确错误，再判断是否是 Skill 内容问题。

`$skill-name` 是 Codex 调用方式，不保证在所有 ChatGPT 网页界面中可用。个人上传的 ChatGPT Skill 应通过当前界面选择或用自然语言描述。缺少文件系统、shell、网络、OCR 或文档工具时，Skill 必须说明限制，不能假装检查过不可用证据。

## 10. 官方平台参考

以下来源用于核验平台说明，访问日期均为 2026-07-15：

- [OpenAI：Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI：Plugins](https://learn.chatgpt.com/docs/plugins)
- [OpenAI：Build plugins](https://learn.chatgpt.com/docs/build-plugins)
- [OpenAI Help：Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt)

仓库保证的是已提交元数据和生成结构，不保证所有宿主版本都有相同按钮或调用符号。
