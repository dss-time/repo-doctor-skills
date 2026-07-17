# Repo Doctor Skills 用户操作手册

本手册面向第一次接触 AI Skill 的用户。先按任务找到能用的入口，再逐步解释平台差异、安全边界和维护方式。完整 Skill 清单见 [Skill 完整目录](SKILL_CATALOG.zh-CN.md)，多 Skill 串联示例见 [工作流实战手册](WORKFLOW_COOKBOOK.zh-CN.md)。

> 文档核验日期：2026-07-15。平台界面和宿主能力可能随版本、套餐或工作区策略变化；看不到本文提到的入口时，以当前宿主界面和管理员设置为准。

## 1. 这是什么

### 用普通话解释 Skill

Skill 是一份可复用的工作说明：它告诉 AI 什么时候接手某类任务、应该查看什么证据、按什么顺序工作、允许做什么、禁止做什么，以及最终如何汇报。它不是一个独立模型，也不是自动获得电脑权限的程序。

Repo Doctor Skills 把这类说明组织成可安装、可构建、可跨平台使用的 Pack。它主要解决四类问题：

- 理解、审查、诊断和安全修改软件仓库；
- 撰写报告、研究简报、清洗表格和审查文档；
- 对 PDF、Word 和 Excel 做边界明确的基础只读检查；
- 帮助维护者创建和审计 Skill。

### 适合谁

- 普通使用者：想直接复制一句中文请求，不想先学习仓库内部结构；
- 开发者：想让 Codex、Claude Code、Cursor 等宿主按安全流程分析或修改项目；
- Skill 维护者：想从唯一来源生成插件和多平台产物，并在发布前验证它们。

### 它不是什么

- 不是“一键全自动修复所有问题”的代理；
- 不是绕过宿主权限、管理员政策或人工审批的工具；
- 不是发布、部署、创建 tag、提交或推送的自动化服务；
- 不是事实来源本身，结论仍应由仓库文件、日志、测试或可靠资料支持；
- 不是私有业务知识库，也不包含股票筛选、估值权重、买卖建议或其他私有投资策略。

本公开仓库只收录跨行业、公开安全的工程和生产力能力。客户材料、公司内部流程、凭据、真实投资组合和私有分析规则应放在单独的私有系统中，不应加入本仓库或上传到不受信任的 Skill。

## 2. 30 秒快速体验

如果你已在支持 `$` Skill 调用的 Codex 环境中安装 Repo Doctor 插件，在目标仓库中开启一个新任务并输入：

```text
$repo-onboarding

请帮我理解当前仓库的技术栈、主要入口、构建命令、测试命令和建议阅读顺序。
先不要修改任何文件；找不到的内容请标记为未知。
```

如果当前平台不支持 `$`，直接使用自然语言也可以：

```text
请使用 repo-onboarding 帮我理解当前仓库的技术栈、主要入口、构建命令、测试命令和建议阅读顺序。
先不要修改任何文件；找不到的内容请标记为未知。
```

这一步只读，不应该修改代码。确认结果后，再决定是否进入影响分析、变更计划或实施 Skill。

## 3. 先选 Pack，再选 Skill

当前 canonical 中有 4 个 active Pack。最新数量、权限和逐项示例由 [Skill 完整目录](SKILL_CATALOG.zh-CN.md) 从 canonical metadata 生成。

| Pack | 适合的任务 | 不适合的任务 |
|---|---|---|
| Repo Doctor | 仓库理解、需求规格化、Bug/CI 诊断、审查、影响分析、计划、受控修复、测试、发布门禁和专项风险检查 | 通用办公写作、研究和文件内容整理 |
| Productivity Toolkit | 报告、研究简报、表格清洗、文档/PDF 审查、会议行动项、演示大纲和跨材料一致性 | 修改软件生产代码或执行发布 |
| Skill Maintainer | 在本仓库按规范创建一个 Skill，或发布前只读审计 Skill/Pack/插件/生成物 | 正常业务任务或一次性简单提示词 |
| Document Data Doctor | 明确限定为轻量、只读、纯文本的 PDF/Word 基础检查，以及只读 Excel 数据质量审计 | 通用 PDF/Word 审查、OCR/渲染/复杂版式，或任何清洗和改写 |

### 发布版本与成熟度

当前 checkout 是 **v0.3.0-rc.1 Release Candidate**。确定性门禁已通过，但真实模型路由准确率仍为 **UNKNOWN**，因此按 prerelease 发布。项目版本、Pack/插件组件版本、单个 Skill 版本和成熟度状态彼此独立。4 个 active Pack 和 38 个 active Skill 当前均为 `beta`：它们已经通过仓库契约验证，可以用于真实任务，但还没有足够的广泛公开使用或 Live-model 路由证据支持 `stable`。Beta 不等于不可用，Stable 也不等于绝对无 Bug。Live-model 路由准确率仍为 **UNKNOWN**。具体组件版本基线和历史 tag 标签例外见[版本与生命周期策略](VERSIONING.zh-CN.md)。

### 常见选择

| 你想做什么 | 先用哪个 Skill | 相邻 Skill 的区别 |
|---|---|---|
| 第一次看陌生仓库 | `repo-onboarding` | `project-health-check` 是广泛体检，不是入门导览 |
| 把模糊需求变成可验收规格 | `requirements-to-spec` | `safe-change-plan` 需要较明确的输入，才规划如何实施 |
| 查明 Bug 原因 | `bug-root-cause-analysis` | `safe-fix-implementation` 才会在授权后修改生产代码 |
| 看改动会影响谁 | `change-impact-analysis` | API、数据库、依赖等高风险对象可再转相应专项审查 |
| 只找测试缺口 | `test-gap-analysis` | `safe-test-implementation` 会修改测试文件，必须明确授权 |
| 诊断 CI 失败 | `ci-failure-diagnosis` | 没有 CI 上下文的一般运行时 Bug 使用根因分析 |
| 写一份正式报告 | `report-writer` | 主要工作是找资料和交叉验证时先用 `research-brief` |
| 清洗表格并输出新文件 | `spreadsheet-data-cleaning` | 只列问题、不改数据时用 `excel-data-quality-check-basic` |
| 审查普通 Word 或 PDF | `document-review` / `pdf-review` | 只有明确要求“轻量纯文本基础检查”才用 Basic Skill |
| 对照多份材料中的数字和术语 | `content-consistency-check` | 单份文档的整体质量使用 `document-review` |
| 创建或审计 Skill | `skill-authoring` / `skill-quality-audit` | 前者受控写入，后者严格只读 |

不确定时，直接说明任务目标、允许修改的范围、现有材料和期望输出；让宿主依据 description 选择。不要只说“处理一下”，这会增加误路由风险。

## 4. 五分钟安装和使用

### 准备构建产物

如果你拿到的是仓库源码，而不是已经发布的 ZIP 或插件，在仓库根目录运行：

```bash
npm run validate
npm test
npm run build
```

完整构建以 `packs/` 为唯一 canonical 来源，同步 `plugins/`，并生成 `dist/` 下的 7 类常规平台产物和插件支持的 ChatGPT ZIP。构建 ChatGPT ZIP 还要求系统 `PATH` 中有 `zip` 命令。不要手工修改 `plugins/` 或 `dist/` 中的 Skill 业务逻辑。

### 4.1 ChatGPT 网页端：上传单个 Skill ZIP

适合：只想安装少量 Skill，不想安装整个插件。

1. 运行完整构建，打开 `dist/chatgpt-skills/`。
2. 选择需要的 `.zip` 文件，不要上传同名展开目录。
3. 在 ChatGPT 中进入“个人资料/Profile → Skills → Create → Upload from your computer”。界面名称可能因版本或工作区策略略有不同。
4. 上传并检查安全扫描结果。若显示 `Needs Review` 或 `Blocked`，先审查内容和来源，不要绕过组织安全策略。
5. 开启一个新任务，用自然语言描述目标。ChatGPT 可能依据 description 自动选择已安装 Skill；是否提供显式 Skill 选择器取决于当前界面。

ZIP 名称用前缀帮助检索：

| 前缀 | 来源 | 示例 |
|---|---|---|
| `rd-*` | Repo Doctor | `rd-repo-onboarding.zip` |
| `pt-*` | Productivity Toolkit | `pt-report-writer.zip` |
| `sm-*` | Skill Maintainer | `sm-skill-quality-audit.zip` |

上传后的显示名称也带 `RD ·`、`PT ·` 或 `SM ·`，便于在 Skill 变多后检索。不要自行把 ZIP 内的 `name` 改回中文或改成空格名称；构建器已经把中文用途放入 display name 和双语 description。

Document Data Doctor 的 3 个 Basic Skill 当前没有独立 ChatGPT ZIP。不要把“7 类常规跨平台产物”误解成“所有 Skill 都有网页上传包”。

**调用语法注意：** 对个人上传的 ChatGPT Skill，本手册只保证自然语言触发和当前界面提供的选择方式；不要假定 `$skill-name` 或 `@skill-name` 在所有 ChatGPT 网页版本中都可用。

### 4.2 ChatGPT Work / Codex：安装插件

适合：希望一次安装一个完整 Pack，并使用插件内的 Skill 发现。

官方插件界面可在 ChatGPT 的 Work 区域或桌面端 Work/Codex 的 Plugins 页面出现；可见性取决于产品版本、套餐和工作区管理员设置。仓库提供 3 个同步生成的插件：`repo-doctor`、`productivity-toolkit`、`skill-maintainer`。

如果使用 Codex CLI，可添加本仓库 marketplace：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

该命令读取远程已发布的 `main`，不会包含本地未提交改动。若要验收当前 checkout，请使用宿主支持的仓库本地 `.agents/plugins/marketplace.json` 或本地构建产物；具体本地入口仍以宿主界面为准。

然后在 Codex 中输入 `/plugins`，选择并安装需要的插件，再开启新任务。若当前版本不接受该命令或没有 Plugins 页面，状态为 **UNKNOWN / 当前宿主不支持**；不要改写仓库文件来模拟安装。

在支持 ChatGPT 插件显式调用的界面中，可以输入 `@` 搜索插件或插件内 Skill。插件 UI 的实际名称来自 `plugins/**/skills/*/agents/openai.yaml`。安装后若旧任务中看不到新 Skill，请新开任务或按宿主要求刷新。

### 4.3 Codex：插件 Skill 与合并 AGENTS 指令

**推荐方式：插件。** 安装插件后，可以：

- 输入 `/skills` 查看可发现的 Skill；
- 用 `$repo-onboarding` 这类 canonical slug 显式调用；
- 或直接描述任务，让 Codex 依据 description 选择。

**项目指令方式：** 构建产物 `dist/codex-zh-CN/AGENTS.md` 把所有 active Skill 渲染为一份中文 Codex 项目指令。复制或引用时请保留整个 `dist/codex-zh-CN/` 目标目录，让 `AGENTS.md` 与同级 `references/`、`assets/`、`scripts/` 保持在一起；然后用自然语言提出任务。

这两种方式不要混淆：合并的 `AGENTS.md` 提供持续项目指令，但不等于逐个安装可通过 `$` 发现的独立 Skill。需要 `$` 发现时优先使用插件。

### 4.4 Claude Code

构建结果位于：

```text
dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md
```

把生成的 `.claude/skills/` 目录复制到目标 Claude Code 环境，再按当前 Claude Code 版本的 Skill 发现方式使用。仓库只保证生成结构，不在 canonical Skill 中写死 slash command；如果宿主没有显示命令列表，使用自然语言明确写出 Skill slug 和任务。

### 4.5 Cursor

构建结果位于：

```text
dist/cursor-zh-CN/.cursor/rules/<skill-name>.mdc
```

把生成的 `.cursor/rules/` 放入目标项目。当前构建实际生成 `.mdc` 规则文件，不会额外生成 Cursor `AGENTS.md`。规则的自动加载和作用范围由 Cursor 当前版本与文件配置决定；提出任务时仍应明确目标、范围和是否允许修改。

### 4.6 Qwen、Kimi 和通用 Prompt Pack

构建结果分别位于：

```text
dist/qwen-zh-CN/
dist/kimi-zh-CN/
dist/generic-zh-CN/
dist/generic-en/
```

这些目录提供普通 Markdown prompt，而不是本仓库能够验证的原生安装包。可将内容放到宿主支持的项目指令或系统提示位置，也可在对话中粘贴内容。若 prompt 引用了同级 `references/`、`assets/` 或 `scripts/`，请复制整个目标目录；只有没有资源引用时才适合单独复制一个 Markdown 文件。调用时使用自然语言；不要假设 `$`、`@` 或 slash command 一定存在。

### 平台与调用方式速查

| 平台/产物 | 安装或放置 | 显式调用 | 可靠的降级方式 |
|---|---|---|---|
| ChatGPT 单 Skill ZIP | Profile → Skills → Create → Upload | 取决于当前界面；不保证 `$`/`@` | 自然语言描述任务，让系统选择或使用界面选择器 |
| ChatGPT 插件 | Work/Plugins 中安装 | 支持的界面可用 `@` | 新任务中点选插件并自然语言提问 |
| Codex 插件 | marketplace + `/plugins` | `$slug` 或 `/skills` | 直接说明“使用 `<slug>`” |
| Codex `AGENTS.md` | 放到支持项目指令的上下文 | 无逐 Skill `$` 保证 | 自然语言 |
| Claude Code Skill | `.claude/skills/` | 由当前宿主版本决定 | 写出 slug + 任务 |
| Cursor rule | `.cursor/rules/*.mdc` | 不由本仓库保证 | 自然语言 |
| Qwen/Kimi/generic Markdown | 项目/系统提示或对话 | 不由本仓库保证 | 粘贴 prompt + 自然语言 |

## 5. 怎样写出容易成功的请求

一个好请求通常包含五件事：

1. **目标**：想理解、诊断、审查、计划还是实施；
2. **证据**：仓库、diff、日志、文件、会议记录或数据表在哪里；
3. **范围**：哪些目录、版本、时间段或材料在范围内；
4. **权限**：只读，还是允许修改哪些文件、运行哪些命令；
5. **交付物**：问题清单、规格、计划、新副本、报告或发布门禁结论。

可复制模板：

```text
请使用 <skill-slug> 完成以下任务：

目标：<我要得到什么>
证据：<仓库、文件、日志或材料>
范围：<包含和排除项>
权限：先只读；如需写入或运行命令，先说明并等待我确认
输出：<期望结构和语言>

找不到证据时请标记 UNKNOWN、假设和置信度，不要编造。
```

在支持 `$` 的 Codex 插件中，可把第一行改为 `$<skill-slug>`。使用 ChatGPT ZIP 时，应通过 `RD ·`、`PT ·`、`SM ·` 显示名称或自然语言触发对应前缀 Skill。

## 6. 权限、风险和安全闸门

### metadata 表达的是“意图上限”，不是自动授权

每个 canonical `skill.yaml` 都声明是否允许读取文件、写文件、运行 shell、访问网络和执行破坏性操作，并给出默认 `risk_level`。宿主沙箱、组织政策和用户授权仍然决定实际能力。即使 metadata 允许写入，AI 也不能越过你的明确范围；即使 metadata 标记只读，宿主也不应把它解释为隐含写权限。

权限字段分别是 `read_files`、`write_files`、`run_shell_commands`、`access_network` 和 `destructive_actions_allowed`。这些布尔值用于说明 Skill 设计上的能力上限，不代表宿主已经授予对应权限。

| 默认风险 | 用户应如何理解 |
|---|---|
| `read_only` | 只读分析；不得修改文件 |
| `advisory` | 输出建议、规格、计划或门禁结论；不得执行计划 |
| `tool_execution` | 为取证可运行受控的本地工具；不等于允许写文件 |
| `networked` | 任务可能需要网络资料；必须有可用网络并遵守来源和隐私要求 |
| `safe_edit` | 仅在用户授权范围内做最小写入，并按 Skill 的专属边界验证 |

本仓库所有 active Skill 都禁止破坏性操作。`safe_edit` 也不等于允许大范围重构、覆盖原始文件、提交、推送、发布或访问生产系统。

### 从只读到写入时必须停一下

推荐的安全闸门：

```text
只读分析 → 明确证据和范围 → 实施计划 → 用户确认写入范围 → 最小修改 → 验证 → 只读复核/发布门禁
```

特别注意：

- `safe-fix-implementation` 只修已确认的一个高优先级生产代码问题；
- `safe-test-implementation` 默认只改测试、fixture 和必要测试辅助代码；
- `documentation-sync` 默认只改文档；
- `architecture-decision-record` 只在明确要求时改 ADR/架构文档；
- `spreadsheet-data-cleaning` 把清洗结果写到新文件，不覆盖原始数据；
- `document-review`、`report-writer`、`presentation-outline` 只有在明确要求且工具可用时才生成或修订文件；
- `release-readiness-check` 只给 GO、GO WITH CONDITIONS 或 NO-GO，不执行发布；
- `skill-quality-audit` 只报告问题，不自动修复。

多 Skill 工作流的完整权限交接见 [工作流实战手册](WORKFLOW_COOKBOOK.zh-CN.md)。

## 7. 输出语言与双语名称

- 用户用中文提问，输出默认使用简体中文；用户用英文提问，输出使用英文。
- 混合语言任务应以用户明确指定的输出语言为准；未指定时跟随主要输入语言。
- Skill slug 使用稳定的英文小写连字符，例如 `bug-root-cause-analysis`，方便跨平台和脚本处理。
- 展示名称使用英文名称加中文用途。ChatGPT ZIP 另外使用 `RD ·`、`PT ·`、`SM ·` 前缀方便检索。
- 翻译不得改变权限、风险、停止条件或职责边界。发现中英文含义不一致时，以 canonical metadata 和当前任务证据为准并报告维护者。

## 8. 工具不可用时会发生什么

Skill 描述的是工作流，不保证宿主一定提供文件系统、shell、网络、浏览器、OCR、DOCX/XLSX/PDF/PPTX 或渲染工具。

正确的降级行为是：

- 说明缺少哪项能力以及哪些结论因此无法验证；
- 继续完成仍可基于现有文字或证据完成的部分；
- 把页码、视觉检查、实时来源、公式、格式保真等无法核验的项目标为 UNKNOWN；
- 给出用户可执行的下一步，而不是声称已经读取、渲染、搜索或生成文件；
- 原文件保持只读；转换或清洗应写到新位置。

示例：没有 OCR/渲染工具时，`pdf-review` 可以审查可可靠提取的文字，但不能声称检查了扫描页或视觉版式。没有网络时，`research-brief` 不能声称完成实时研究。没有演示工具时，`presentation-outline` 只交付大纲，不声称生成 PPTX。

## 9. 常见问题与排障

### 安装后找不到 Skill

1. 确认安装的是 ZIP 文件或正确插件，而不是展开目录或 canonical 源目录。
2. 新开任务或按宿主要求刷新；旧任务可能不会重新发现安装内容。
3. 用 canonical slug 搜索；ChatGPT ZIP 还可搜索 `RD ·`、`PT ·`、`SM ·`。
4. 确认工作区管理员允许个人 Skill 或插件。
5. Codex 插件可用 `/plugins` 检查安装、用 `/skills` 检查发现。
6. 若仍不可见，记录宿主版本、安装界面和错误信息；不要猜测是 Skill 内容错误。

### 为什么 `$repo-onboarding` 在 ChatGPT 网页端没有反应？

`$slug` 是 Codex Skill 的明确调用方式，不是所有 ChatGPT 网页表面的通用保证。个人上传 Skill 请使用自然语言或当前 Skills 界面；插件界面若支持显式调用，可用 `@` 搜索。

### 为什么 ChatGPT ZIP 叫 `rd-repo-onboarding`，插件里却叫 `repo-onboarding`？

前缀是网页端大量 Skill 的检索和防冲突策略。canonical slug 保持 `repo-onboarding`；ChatGPT ZIP 构建时增加 `rd-`、`pt-` 或 `sm-`。这不是重复 Skill。

### 上传后显示 Needs Review 或 Blocked 怎么办？

这是 ChatGPT 的安全扫描状态。核对 Skill 来源、内容、工具和权限；在组织工作区中联系管理员。不要为了通过扫描删除安全说明、伪装权限或绕过策略。

### 为什么 Document Data Doctor 没有 ZIP 或插件？

它的 3 个 Basic Skill 当前只进入 7 类常规跨平台产物，没有独立插件或 ChatGPT ZIP。这是实际分发边界，不是构建遗漏。

### Basic PDF/Word Skill 和通用审查 Skill 怎么选？

未限定范围的 PDF/Word 审查默认用 `pdf-review` 或 `document-review`，并在工具不可用时在同一 Skill 内降级。只有你明确要求轻量、只读、纯文本且不做 OCR、渲染、复杂格式或修订时，才用 `pdf-review-basic` 或 `word-document-review-basic`。

### 可以一次调用多个 Skill 吗？

可以把任务拆成连续步骤，但不要假设宿主会自动、无条件串联。每一步使用一个主要 Skill，把上一份输出作为下一步证据，并在从分析切换到写入时重新确认权限。现成顺序见 [工作流实战手册](WORKFLOW_COOKBOOK.zh-CN.md)。

### Skill 会自动修改、提交或发布吗？

不会。只有少数 `safe_edit` Skill 在明确授权下写入限定文件；提交、push、tag、部署和发布不在默认授权内。发布门禁 Skill 也只给结论。

### 研究或文档中缺少事实怎么办？

应标记未知、限制、假设和置信度，不能补造数字、来源、页码、负责人、日期或结论。需要实时资料时，先确认网络和来源访问能力。

### 这些 Skill 能做股票研究或投资建议吗？

不能。本仓库的公共边界明确排除私有投资策略、选股、估值权重、真实股票池和买卖建议。请勿把此类私有规则加入公开 Pack。

### 我应该修改 `packs/`、`plugins/` 还是 `dist/`？

维护 Skill 时只修改 `packs/` 中的 canonical 内容，再运行同步、验证和构建。`plugins/` 是同步生成的兼容/分发产物，`dist/` 是跨平台生成物；两者都不应手工维护业务逻辑。

## 10. 维护者入口

如果你的目标是新增或审计 Skill，请从以下文档进入：

- [新增 Skill](ADDING_SKILLS.zh-CN.md)
- [Skill 规范](SKILL_SPEC.md)
- [风格指南](STYLE_GUIDE.md)
- [本地化策略](LOCALIZATION_POLICY.md)
- [平台适配器](PLATFORM_ADAPTERS.md)
- [维护者检查清单](MAINTAINER_CHECKLIST.zh-CN.md)
- [版本与生命周期策略](VERSIONING.zh-CN.md)
- [贡献指南](../CONTRIBUTING.md)
- [安全模型](SECURITY_MODEL.md)
- [公共/私有边界](PUBLIC_PRIVATE_BOUNDARY.md)

基础维护顺序：

```bash
npm run docs:generate
npm run validate
npm test
npm run build
npm run docs:check
```

不要直接修改生成物，不要在未检查工作区时覆盖他人改动，也不要把机器绝对路径、密钥或客户数据写入文档和示例。

## 11. 官方平台参考

以下链接用于核验 ChatGPT/Codex 的当前 Skill 和插件入口；访问日期均为 **2026-07-15**：

- [OpenAI：Build skills](https://learn.chatgpt.com/docs/build-skills) — Skill 结构、渐进式加载、Codex 的 `$` 与 `/skills` 发现方式。
- [OpenAI：Plugins](https://learn.chatgpt.com/docs/plugins) — ChatGPT Work/桌面端插件入口和 `@` 显式调用。
- [OpenAI：Build plugins](https://learn.chatgpt.com/docs/build-plugins) — marketplace、插件目录和 Codex CLI 管理方式。
- [OpenAI Help：Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt) — 网页端上传、自动选择、安全扫描和可用性限制。

平台功能会变化；仓库能保证的是 canonical metadata、生成结构和本地验证，不保证第三方宿主在所有版本中提供相同按钮、调用符号或工具。
