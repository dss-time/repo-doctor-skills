[English](./README.md) | **简体中文**

# Repo Doctor Skills

Repo Doctor Skills 是一个双语、跨平台的 AI Skills 工程化框架，用于仓库诊断、代码审查、文档审查和安全 Agent 工作流。

这是一个早期的开源框架，用于把专家工作流整理成结构化 Skill packs。它包含 canonical `packs/` 源结构、校验脚本、构建适配器，以及面向已有 Repo Doctor 用户的同步插件兼容产物。

本项目最初以 `repo-doctor-codex-plugin` 发布，当前公开仓库名为 `repo-doctor-skills`；历史 Codex 插件路径继续作为生成的兼容产物保留。

## 这个项目能做什么

- 用元数据、权限、本地化说明、示例和测试定义 Skill。
- 在发布前校验 public skills。
- 为通用 Markdown、Codex / CodeX、Claude Code、Cursor、Qwen 和 Kimi 构建 7 个跨平台目标。
- 把公开安全的 skills 和私有内部实现分开。
- 从同一 canonical 源同步 Repo Doctor、Productivity Toolkit 和 Skill Maintainer 插件分发。

## 它不是什么

- 不是零散 prompt 仓库。
- 不是公司内部流程仓库。
- 不是财务、股票或投资策略库。
- 不包含公司模板、客户案例、secret 或私有数据源接入逻辑。

## 适合谁

- 想构建可复用 Agent 工作流的开发者。
- 希望维护公开安全 skill packs 的开源维护者。
- 需要区分公开 skills 和私有内部包的团队。
- 希望从同一 canonical 源使用 Codex 兼容插件和跨平台输出的用户。

## 快速开始

请按目标选择最短入口：

- [5 分钟快速开始](docs/QUICK_START.zh-CN.md)：克隆、校验和构建。
- [完整用户手册](docs/USER_MANUAL.zh-CN.md)：安装、调用语法、权限和故障排查。
- [Skill 完整目录](docs/SKILL_CATALOG.zh-CN.md)：从全部 active Skill 中选择正确能力。
- [工作流实战手册](docs/WORKFLOW_COOKBOOK.zh-CN.md)：把多个 Skill 串成真实任务流程。
- [版本与生命周期策略](docs/VERSIONING.zh-CN.md)：了解项目发布版本、组件版本和成熟度状态。
- [新增 Skills 指南](docs/ADDING_SKILLS.zh-CN.md)：维护者从 canonical 源开始工作。

克隆仓库并运行校验：

```bash
git clone https://github.com/dss-time/repo-doctor-skills.git
cd repo-doctor-skills
npm run validate
npm test
```

构建所有支持的输出：

```bash
npm run build
```

只构建一个目标：

```bash
node scripts/build-skills.mjs --target generic-zh-CN
node scripts/build-skills.mjs --target generic-en
node scripts/build-skills.mjs --target codex-zh-CN
node scripts/build-skills.mjs --target claude-code-zh-CN
node scripts/build-skills.mjs --target cursor-zh-CN
node scripts/build-skills.mjs --target qwen-zh-CN
node scripts/build-skills.mjs --target kimi-zh-CN
```

生成文件会写入 `dist/`。生成内容被 Git 忽略，只保留 `dist/.gitkeep`。

更详细的新手步骤见 [docs/QUICK_START.zh-CN.md](docs/QUICK_START.zh-CN.md)。

## 四种使用方式

### 1. 使用 Repo Doctor Codex / CodeX 兼容插件

如果你要使用 Repo Doctor 的 Codex 兼容分发，看这里：

```text
plugins/repo-doctor/
```

这个生成的兼容分发由 `packs/engineering/repo-doctor/` 同步而来，共包含 25 个边界明确的工作流与专项工程 Skill：

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

安装和 marketplace 配置见 [docs/LEGACY_CODEX_PLUGIN.zh-CN.md](docs/LEGACY_CODEX_PLUGIN.zh-CN.md)。

### 2. 使用 Productivity Toolkit 插件

生成的 `plugins/productivity-toolkit/` 分发提供 8 个跨行业办公与研究工作流：

- `report-writer`
- `research-brief`
- `spreadsheet-data-cleaning`
- `document-review`
- `pdf-review`
- `meeting-notes-to-actions`
- `presentation-outline`
- `content-consistency-check`

canonical 源位于 `packs/productivity/productivity-toolkit/`。该插件不包含投资策略、财务估值、选股、交易建议、私有模板或组织专属规则。

### 3. 使用 Skill Maintainer 插件

生成的 `plugins/skill-maintainer/` 分发提供 2 个仅面向维护者的工作流：

- `skill-authoring`：复用现有脚手架、activation 契约和构建系统，工程化创建一个符合仓库规范的双语 Skill。
- `skill-quality-audit`：对 Skill、Pack、插件或 Skills 仓库执行严格只读的发布前质量审计。

canonical 源位于 `packs/engineering/skill-maintainer/`。适合确定性判断的规则由仓库脚本负责，语义触发和工作流合理性由审计 Skill 判断。

### 4. 作为跨平台 Skills 源码仓库使用

如果你想为多个平台构建 skills，应该修改 canonical 源文件：

```text
packs/
```

然后运行：

```bash
npm run validate
npm run build
```

从 `dist/` 使用适配输出：

- `dist/generic-zh-CN/`：中文通用 Markdown Prompt
- `dist/generic-en/`：英文通用 Markdown Prompt
- `dist/codex-zh-CN/AGENTS.md`：Codex / CodeX 风格使用
- `dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md`：Claude Code 使用
- `dist/cursor-zh-CN/.cursor/rules/<skill-name>.mdc`：Cursor 使用
- `dist/qwen-zh-CN/` 和 `dist/kimi-zh-CN/`：中文 Prompt Pack
- `dist/chatgpt-skills/rd-*.zip`：ChatGPT Repo Doctor Skill 上传包
- `dist/chatgpt-skills/pt-*.zip`：ChatGPT 生产力技能上传包
- `dist/chatgpt-skills/sm-*.zip`：ChatGPT Skill 维护技能上传包

## ChatGPT ZIP 上传包

`npm run build` 会在 `dist/chatgpt-skills/` 中为每个插件支持的 Skill 同时生成可检查的展开目录和同名 ZIP 上传包。例如，`rd-api-contract-review.zip` 与 `rd-api-contract-review/` 都对应 canonical `api-contract-review` Skill。

| 前缀 | 插件 | 当前数量 | 用途 |
|---|---|---:|---|
| `rd-*` | Repo Doctor | 25 | 软件工程路由、澄清、诊断、计划、安全修改、验证和会话交接。 |
| `pt-*` | Productivity Toolkit | 8 | 报告、研究、表格清洗、PDF/Word 审查、会议和演示生产力。 |
| `sm-*` | Skill Maintainer | 2 | Skill 工程化创建和只读质量审计。 |

Document Data Doctor 的 3 个 Basic Skill 会参与 canonical Pack 和全部 7 个常规跨平台目标，但当前没有独立插件或 ChatGPT ZIP。经过核验的 ChatGPT 与 Codex 安装、调用差异见[完整用户手册](docs/USER_MANUAL.zh-CN.md)。

## Canonical 源与生成产物

| 路径 | 用途 | 是否优先修改 |
|---|---|---|
| `packs/` | Skill 业务逻辑、双语内容、权限、风险、测试、资源和输出契约的唯一 canonical 来源。 | 是。 |
| `plugins/` | Repo Doctor、Productivity Toolkit 和 Skill Maintainer 的生成兼容与分发产物。 | 否，应从 canonical Pack 同步。 |
| `adapters/` | 各平台适配说明。 | 只有适配行为变化时修改。 |
| `dist/` | 构建流水线生成的跨平台产物和 ChatGPT 上传包。 | 永远不要直接修改。 |

当前 canonical 清单为 4 个 active Pack、38 个 active Skill，另有 1 个 template Pack 和其中的 1 个 template Skill。3 个插件分发共含 35 个 Skill；构建会生成 35 个对应 ChatGPT ZIP 和 7 个常规跨平台目标。校验器从 manifest 自动发现 Pack 和 Skill 集合，不依赖这些文档数字。

## 支持平台

7 个常规构建目标为 `generic-zh-CN`、`generic-en`、`codex-zh-CN`、`claude-code-zh-CN`、`cursor-zh-CN`、`qwen-zh-CN` 和 `kimi-zh-CN`。ChatGPT ZIP 是 `npm run build` 中额外执行的插件分发打包步骤。

## 支持语言

公开核心支持：

- `en`
- `zh-CN`

`skill.yaml` 是元数据唯一来源。英文和中文说明必须保持相同的权限、风险边界和工作流行为。

## 目录结构

```text
docs/       标准、新手文档、安全模型、本地化和适配文档
schemas/    Skill 和 Pack 的 JSON Schema
adapters/   平台适配说明
packs/      canonical public skill packs 和模板
examples/   公开安全示例和样例输出
tests/      校验 fixtures
scripts/    校验和构建脚本
dist/       生成的跨平台产物，除 .gitkeep 外被忽略
plugins/    生成的插件兼容和分发产物
```

## 运行校验

```bash
npm run validate
```

校验器会检查必需文件和元数据、语言覆盖、权限、canonical/plugin 集成、一级资源引用、UI 元数据、行数限制，以及明显的密钥或机器路径模式。触发语义和工作流合理性仍需要模型审计和 activation 评测。

## 构建不同平台版本

```bash
npm run build
```

或者只构建单个目标：

```bash
node scripts/build-skills.mjs --target generic-zh-CN
node scripts/build-skills.mjs --target generic-en
node scripts/build-skills.mjs --target codex-zh-CN
node scripts/build-skills.mjs --target claude-code-zh-CN
node scripts/build-skills.mjs --target cursor-zh-CN
node scripts/build-skills.mjs --target qwen-zh-CN
node scripts/build-skills.mjs --target kimi-zh-CN
```

## 新增 Skill

新 skill 应该先放到 `packs/`，不要先改 `plugins/` 或 `dist/`。

请使用下文的 `npm run create:skill`；`packs/_template/` 只作为参考模板，不是另一套创建流程。

每个 skill 应包含：

```text
skill.yaml
instructions.en.md
instructions.zh-CN.md
output.en.md
output.zh-CN.md
examples.en.md
examples.zh-CN.md
tests/case-001.en.yaml
tests/case-001.zh-CN.yaml
```

新增或修改后运行：

```bash
npm run validate
npm test
npm run build
```

## 创建新的 Skill

使用脚手架脚本：

```bash
npm run create:skill -- --pack engineering/repo-doctor --name bug-diagnosis --id repo.bug-diagnosis --category engineering
```

新 Skill 会创建在 `packs/` 下。请在 canonical 源中完成文件和必要的 Pack/集成元数据；不要直接修改同步后的 `plugins/` 或生成的 `dist/` 副本。然后运行：

```bash
npm run validate
npm test
npm run build
```

详细说明见 [docs/ADDING_SKILLS.zh-CN.md](docs/ADDING_SKILLS.zh-CN.md)。

## 公开 / 私有内容边界

本公开仓库可以包含：

- Skill 标准
- 通用工作流
- 平台适配器
- Repo Doctor 基础版
- PDF、Word、Excel、报告基础 skills
- 公开安全示例和测试
- 财务类接口规范和安全边界

本公开仓库禁止包含：

- 公司内部模板或流程
- 客户案例
- 私有数据源
- API key、token、secret
- 股票筛选规则
- 买入、卖出、持有逻辑
- 技术指标组合策略
- 估值模型权重
- 投资组合策略
- 付费数据源接入逻辑

详见 [docs/PUBLIC_PRIVATE_BOUNDARY.md](docs/PUBLIC_PRIVATE_BOUNDARY.md)。

## 候选版本状态

当前 checkout 正在准备 **0.2.0 Release Candidate**；仓库中的改动本身不代表已经创建 tag 或正式发布。项目发布版本、组件版本和成熟度状态是彼此独立的层次。4 个 active Pack 和 38 个 active Skill 在本候选版本中都标记为 `beta`：它们已经通过仓库验证，可以用于真实任务，但仍缺少足够的广泛公开使用和 Live-model 路由证据。Beta 不等于不可用，未来的 `stable` 也不等于绝对无 Bug。

Live-model 路由准确率仍为 **UNKNOWN**。组件版本基线和历史 `v0.0.1` tag 标签例外见[版本与生命周期策略](docs/VERSIONING.zh-CN.md)，候选变更记录见 [CHANGELOG.md](CHANGELOG.md)。

## 相关文档

- [新手快速开始](docs/QUICK_START.zh-CN.md)
- [完整用户手册](docs/USER_MANUAL.zh-CN.md)
- [Skill 完整目录](docs/SKILL_CATALOG.zh-CN.md)
- [工作流实战手册](docs/WORKFLOW_COOKBOOK.zh-CN.md)
- [版本与生命周期策略](docs/VERSIONING.zh-CN.md)
- [新增 Skills 指南](docs/ADDING_SKILLS.zh-CN.md)
- [旧版 Codex 插件](docs/LEGACY_CODEX_PLUGIN.zh-CN.md)
- [Skill 规范](docs/SKILL_SPEC.md)
- [平台适配](docs/PLATFORM_ADAPTERS.md)
- [安全模型](docs/SECURITY_MODEL.md)
- [本地化策略](docs/LOCALIZATION_POLICY.md)
- [公开 / 私有边界](docs/PUBLIC_PRIVATE_BOUNDARY.md)
- [术语表](docs/GLOSSARY.md)

## License

MIT。详见 [LICENSE](LICENSE)。
