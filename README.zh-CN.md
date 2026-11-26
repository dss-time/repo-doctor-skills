[English](./README.md) | **简体中文**

# Repo Doctor

**Make AI coding safer, not slower.**

面向 AI 编程助手的代码变更安全与工程验证工具。

让 AI 改代码时少碰无关文件，留意你尚未提交的修改，并说清楚实际验证了什么。适合 OpenAI Codex、Claude Code、Cursor、GitHub Copilot、Gemini CLI 和 OpenCode，宿主实测范围见下表。

## 快速开始

在项目目录运行，选择你正在使用的 Agent。

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

安装后打开新会话，像往常一样描述需求、改动范围和要保留的行为。可选用 `$repo-doctor-router` 获取 Skill 推荐。公开稳定版 **0.12.0** 已包含 Change Guard。下方的证明包和 Skill 体检使用当前源码。

## 最小示例

| 你可以这样说 | Repo Doctor 能帮你做什么 |
| --- | --- |
| “修复订单编辑后列表没有刷新的问题，保留现有业务逻辑。” | 先复现并追踪刷新链路，做局部修复，核对受影响的行为和定向回归结果。 |
| “给订单页加个搜索条件，保留我没提交的修改。” | 候选版在适用时记录修改前的 Git 状态，检查任务是否又触及了你已经编辑过的文件，方便复核。 |
| “修一下这个 TypeScript 类型错误，依赖保持原样。” | 候选版可以报告基线之后发生的依赖清单和锁文件变化，并提示核对实际范围。 |
| “只改这个按钮的文案。” | 用定向检查确认改动即可。真实 Codex 的低风险样本未创建额外基线。 |

更多示例覆盖样式越界、公共请求方法、批量审核与续接任务。[自然语言使用案例](docs/guides/repo-doctor-scenarios.zh-CN.md)

## 30 秒快速体验

从当前源码目录运行。首次使用先执行 `npm ci`。两个示例都在临时目录里操作。

**生成 PR 证明包。** 记录基线、写入示例变更，再把输出的 Markdown 粘贴到 PR 描述。

```bash
demo=$(mktemp -d)
git -C "$demo" init -q
node bin/repo-doctor-skills.mjs change begin --root "$demo" --id receipt-demo --scope demo.txt
printf 'Example change\n' > "$demo/demo.txt"
node bin/repo-doctor-skills.mjs receipt export --root "$demo" --id receipt-demo
```

**离线体检 Skill。** 可以把示例目录换成任意包含 `SKILL.md` 的目录。

```bash
demo=$(mktemp -d)
mkdir "$demo/demo-skill"
printf '%s\n' '---' 'name: demo-skill' 'description: Summarize meeting notes.' '---' 'List the decisions.' > "$demo/demo-skill/SKILL.md"
node bin/repo-doctor-skills.mjs skills lint "$demo" --json
```

### 导出变更验证证明包

可以这样说：“修复订单列表不刷新的问题，保留我未提交的修改，跑相关测试，最后给我一份可以贴到 PR 的验证摘要。”

使用当前源码中的 CLI，传入修改前建立的 Change Guard 基线 ID。同 ID 的任务检查点可选。

```bash
node bin/repo-doctor-skills.mjs receipt export --id order-list-fix
node bin/repo-doctor-skills.mjs receipt export --id order-list-fix --format json
```

将 Markdown 粘贴到 PR 描述即可查看声明范围、实际观察到的变化和已记录的验证。文件指纹匹配只说明已记录的依赖一致。导出不会运行测试，也无法确认原执行来源及其环境，缺失的覆盖会保留为未知。加上 `--out receipt.md` 可以在仓库内创建新文件，已有文件不会被覆盖。

### 体检你自己的 Skills

使用当前源码中的 CLI，传入目录或单个 `SKILL.md`。省略路径时扫描当前目录，跳过扫描中发现的符号链接、版本控制元数据和 `node_modules`。

```bash
node bin/repo-doctor-skills.mjs skills lint ./my-skills --json
```

工具离线读取 YAML frontmatter 和 Markdown，无需 Repo Doctor 专用清单。JSON 诊断包含文件路径、严重级别、规则 ID 和修复建议。退出码 `0` 表示无错误（可有警告），`1` 表示发现错误，`2` 表示命令失败。体积估算、潜在路由重叠和权限边界提示需要人工复核。

## 工作机制与边界

- **按影响决定检查深度。** Skills 为问题定位、局部修复和测试提供工程步骤。测试结果取决于实际执行，已有证据也要在输入、工作树和环境仍匹配时才复用。
- **在适用场景比较工作区。** 候选版的四个可写 Skills 共享本地运行时。在宿主允许使用 Node、Git 和项目本地状态时，可在改动前建立基线，并在交付前比较。通过 Skills CLI 安装这四项中的任意一项即可取得对应运行时。
- **看清实际变化。** 报告区分检测结果、风险提示和未知覆盖，供人和 Agent 核对实际授权。Git 忽略项、短暂并发写入等情况可能看不到。业务正确性仍需实际测试。

Codex 实测中，用户原有说明得以保留，原模型三个定向复测均触发了检查。公共模块曾漏触发，本次复测成功。macOS 251 跟踪文件夹具的基线和检查中位耗时分别为 170–255 ms 和 142–229 ms，含 Node 启动。[实测记录](docs/research/change-guard-integration.md) · [可复现临时仓库示例](docs/guides/change-guard-demo.zh-CN.md)

## 宿主与安装

选择一条命令即可。项目级是默认方式，`-g` 安装到当前用户目录。表中的安装和独立运行时验证使用 Skills CLI **1.9.0** 和冻结候选。

| Agent | 定向安装 | 验证范围 |
| --- | --- | --- |
| OpenAI Codex | `npx skills@latest add dss-time/repo-doctor-skills -a codex` | 项目／全局安装，候选宿主发现、正文加载、自动调用及部分报告处理有观测 |
| Claude Code | `npx skills@latest add dss-time/repo-doctor-skills -a claude-code` | 项目／全局安装和独立运行时，宿主执行未验证 |
| Cursor | `npx skills@latest add dss-time/repo-doctor-skills -a cursor` | 项目／全局安装和独立运行时，宿主执行未验证 |
| GitHub Copilot | `npx skills@latest add dss-time/repo-doctor-skills -a github-copilot` | 项目／全局安装和独立运行时，宿主执行未验证 |
| Gemini CLI | `npx skills@latest add dss-time/repo-doctor-skills -a gemini-cli` | 项目／全局安装和独立运行时，宿主执行未验证 |
| OpenCode | `npx skills@latest add dss-time/repo-doctor-skills -a opencode` | 项目／全局安装和独立运行时，宿主执行未验证 |

Skills CLI 1.9.0 要求 Node **22.20.0+**，建议使用当前 LTS。项目自带 CLI 与候选运行时支持 Node 18+。工作区比较需要本地 Git。详细目录、权限、升级与本地 Beta 验证见 [Agent 安装与兼容性](docs/AGENT_COMPATIBILITY.zh-CN.md)。其他现有安装渠道见 [高级用法](docs/ADVANCED_USAGE.zh-CN.md)。

## Codex 插件

安装当前源码工程能力（27 个 Skill）：

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

为 Codex 安装源码中的全部 34 个 Skill：

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


## v0.11.1 正式版

v0.11.1 包含 34 个 Skill（Repo Doctor 27 个）和 34 个 ChatGPT ZIP。保留 0.11.0 运行内容，并新增 Codex、Claude Code、Cursor 和 WorkBuddy 的统一多平台安装说明。[发布说明](docs/RELEASE_NOTES_0.11.1.zh-CN.md) · [完整交付样例](docs/guides/delivery-examples.zh-CN.md)。

升级时，原 `requirements-to-spec` 的任务改用 `requirements-clarification`，原 `spec-to-work-items` 的任务改用 `safe-change-plan`。已删除或合并的 Skill 如曾安装，其旧目录需要检查本地自定义内容后手动清理。详见[升级说明](docs/RELEASE_NOTES_0.11.1.zh-CN.md#安装与升级)。

将 GitHub 插件固定到 `v0.11.1`：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.11.1
codex plugin add repo-doctor@repo-doctor-marketplace
```
安装指定 npm 版本（默认 7 个常用 Skill，也可安装全部 34 个）：

```bash
npx repo-doctor-skills@0.11.1 install --agent codex
npx repo-doctor-skills@0.11.1 install --preset full --agent codex
```

同一 Agent 选择一种安装方式。官方 skills CLI 从公开 GitHub 源码安装。

## 自适应执行模式

0.11.0 在原 33 个 Skill 上新增 `multi-agent-workflow`，可通过 CLI 安装：

```bash
npx repo-doctor-skills@0.11.1 install --skill multi-agent-workflow --agent codex
```

请同时安装任务所需的现有 Skills。可明确要求自动选模式，也可由 Agent 在独立工作需要协调时选择该入口。小修复和普通直接 Skill 调用由原能力处理。并行执行需要宿主子 Agent，并发写入需要隔离工作区。默认推荐安装仍为原 7 个 Skill。

```text
$multi-agent-workflow 根据实际任务选择 single 或 multi，完成已授权工作。复用现有 Skills，保护我的已有修改，并验证集成结果。
```

详见[模式选择与示例](docs/MULTI_AGENT_WORKFLOW.zh-CN.md)。原生并行执行是否可用取决于宿主能力。

## 本地项目与安装状态

0.11.0 新增可选项目初始化、修订号保护的任务存档，以及只读安装诊断。初始化先预览再应用，任务续接前重新核对证据。

```sh
npx repo-doctor-skills@0.11.1 project init
npx repo-doctor-skills@0.11.1 task list
npx repo-doctor-skills@0.11.1 installations check
```

详见[初始化、任务及迁移命令](docs/PROJECT_STATE.zh-CN.md)。相同命令也可在本地检出目录运行。

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

当前源码绑定评测与本地检查见 [0.11.0 验证记录](docs/RELEASE_VALIDATION_0.11.0.md)。[0.10.1 证据复用记录](tests/reports/release-promotion-0.10.1.json)及此前[开发阶段评测](tests/reports/unified-validation-2026-11-05/README.md)保留为历史记录。
