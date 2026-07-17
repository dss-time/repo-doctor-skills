# Repo Doctor Skills 完整目录

> 此文件由 `scripts/generate-skill-catalog.mjs` 基于 `packs/`、activation contracts 和插件 UI 元数据确定性生成。请勿手工编辑；运行 `node scripts/generate-skill-catalog.mjs` 更新。

本目录对应项目 Release Candidate `0.3.0-rc.1`，收录 4 个 active Pack 中的 38 个 active Skill。当前其中 35 个配置了插件兼容产物和独立 ChatGPT ZIP，3 个仅进入常规跨平台构建产物。相邻 Skill 来自 281 条 activation contract 以及 canonical description 中明确提到的 Skill。

这里的 **beta** 表示已经可以公开使用并通过当前仓库的 contract、构建和文档验证，但仍需要真实环境反馈；它不等于在线模型路由已经验证。Live-model 路由准确率仍为 **UNKNOWN**。`stable` 也只表示成熟度更高，不代表绝对无 Bug。

权限字段表达 canonical 作者声明的意图，并不保证宿主平台会自动强制执行。实际读写、shell、网络和破坏性操作仍受宿主能力、用户授权和运行时安全控制约束。

调用示例使用不依赖平台符号的自然语言。Codex、ChatGPT 和其他平台的 `$`、`@` 或自然语言调用差异请见[用户操作手册](USER_MANUAL.zh-CN.md)。

## 字段说明

- **Canonical 用途与边界** 原样复用 canonical 双语 description；**适合使用 / 不应使用的例子** 来自双语 activation contract，并明确显示应转交的 Skill。
- **Activation contract 相邻 Skill** 是当前 Skill 的测试用例会转交、明确排除，或 description 明确引用的 Skill；它不是对所有可能路由关系的推测。
- **分发** 列出实际插件 UI 元数据和 ChatGPT 发布前缀；没有独立插件/ZIP 不代表 canonical Skill 不存在。
- 项目、Pack、插件和 Skill 使用分层 SemVer；项目版本不要求等于组件版本，Pack 与对应插件必须一致，Skill 可以独立演进。详见[版本政策](VERSIONING.zh-CN.md)。

## 1. Repo Doctor（Repo Doctor / 仓库医生）

- **Pack ID：** `engineering.repo-doctor`
- **Canonical：** `packs/engineering/repo-doctor/pack.yaml`
- **Active Skill：** 25
- **Pack 版本 / 状态：** `0.6.0` / `beta`
- **Canonical Pack 说明：** 用于理解、审查、诊断和安全修改软件仓库的公开安全技能包。
- **实际 active 清单：** `repo-doctor-router`、`repo-onboarding`、`requirements-clarification`、`requirements-to-spec`、`spec-to-work-items`、`bug-root-cause-analysis`、`project-health-check`、`safe-code-review`、`change-impact-analysis`、`safe-change-plan`、`test-gap-analysis`、`safe-test-implementation`、`ci-failure-diagnosis`、`documentation-sync`、`release-readiness-check`、`dependency-upgrade-analysis`、`api-contract-review`、`database-migration-review`、`dead-code-verification`、`security-focused-review`、`performance-regression-analysis`、`architecture-decision-record`、`configuration-audit`、`session-handoff`、`safe-fix-implementation`

### `repo-doctor-router` — Repo Doctor Router（工作流路由）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/repo-doctor-router/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `repo-doctor-router`
- **Canonical 用途与边界：** 对当前仓库任务分类，并推荐一个现有 Repo Doctor Skill 或有序工作流，但不执行被推荐能力。用于初次进入陌生仓库、不知道选择哪个 Skill，或需要在澄清、规格、计划、实施、测试、审查、诊断、发布检查与会话交接之间选择安全下一步；普通问答不涉及仓库工作流决策时不要触发。
- **适合使用的例子：** 我不知道该选哪个 Repo Doctor Skill，请先路由当前工程任务但不要执行推荐。
- **不应使用的例子：** 请直接把这个已确认的小型生产 Bug 修好并运行测试。 → 应转给 `safe-fix-implementation`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=none, shell=none, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Repo Doctor Router（工作流路由）；ChatGPT ZIP：`dist/chatgpt-skills/rd-repo-doctor-router.zip` / RD · Repo Doctor Router（工作流路由）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `requirements-clarification`、`project-health-check`、`safe-fix-implementation`

### `repo-onboarding` — Repo Onboarding（仓库理解）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/repo-onboarding/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `repo-onboarding`
- **Canonical 用途与边界：** 在修改代码前理解一个陌生软件仓库。
- **适合使用的例子：** 帮我快速理解这个陌生仓库，从哪里开始看
- **不应使用的例子：** 全面检查这个项目的架构、测试、安全和维护性问题，按优先级报告。 → 应转给 `project-health-check`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Repo Onboarding（理解新项目）；ChatGPT ZIP：`dist/chatgpt-skills/rd-repo-onboarding.zip` / RD · Repo Onboarding（理解新项目）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `requirements-to-spec`、`project-health-check`、`safe-code-review`、`safe-fix-implementation`

### `requirements-clarification` — Requirements Clarification（需求决策澄清）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/requirements-clarification/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `requirements-clarification`
- **Canonical 用途与边界：** 在规格化或实施前，关闭仍未确定且会实质影响产品、行为、兼容性、数据、权限、安全、迁移和验收的决策。用于存在关键歧义的需求；先检查仓库证据，再一次聚焦一个问题，最终生成交给 requirements-to-spec 的澄清摘要。已清楚的小改动不使用，也不生成最终规格、不修改长期文档或实施代码。
- **适合使用的例子：** 写规格前先读取仓库，逐个关闭会改变权限、数据边界和兼容性的需求决策。
- **不应使用的例子：** 所有关键决策已经闭合，请把它们整理成可实施、可测试的完整规格。 → 应转给 `requirements-to-spec`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=none, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Requirements Clarification（需求决策澄清）；ChatGPT ZIP：`dist/chatgpt-skills/rd-requirements-clarification.zip` / RD · Requirements Clarification（需求决策澄清）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `requirements-to-spec`、`safe-fix-implementation`

### `requirements-to-spec` — Requirements Specification（需求规格化）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/requirements-to-spec/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `requirements-to-spec`
- **Canonical 用途与边界：** 将产品、数据、安全、权限、兼容性和验收等重大决策已经闭合的需求整理为结构化、可实施、可验证的规格。用于已有澄清摘要或讨论已定稿、只剩非阻塞假设时；发现重大未决决策必须停止并转交 requirements-clarification。不用于拆工作项、制定实施计划、解释代码、修 Bug 或直接修改。
- **适合使用的例子：** 导出行为、兼容性、权限和验收口径都已闭合，请整理成可实施、可测试规格，不要改代码。
- **不应使用的例子：** 规格已经完整，请分析重命名这个公共 API 会影响什么。 → 应转给 `change-impact-analysis`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=none, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Requirements Specification（需求规格化）；ChatGPT ZIP：`dist/chatgpt-skills/rd-requirements-to-spec.zip` / RD · Requirements Specification（需求规格化）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `requirements-clarification`、`change-impact-analysis`、`safe-change-plan`、`safe-fix-implementation`

### `spec-to-work-items` — Spec to Work Items（规格拆分工作项）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/spec-to-work-items/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `advisory`
- **调用标识：** `spec-to-work-items`
- **Canonical 用途与边界：** 将已确认规格、实施计划或已闭合对话拆成可独立执行和验证的垂直工作项，明确依赖、安全并行、冲突区域、测试、风险和回滚。用于包含多个可交付行为的交付规划；只在当前响应返回可复制 Markdown；即使用户授权也不写文件、不调用 Shell、不创建外部任务。需求未闭合、单个小修复或按文件与技术层罗列清单时不使用。
- **适合使用的例子：** 把这个已批准的大规格按可交付行为拆成可独立验证、标明依赖和并行机会的工作项。
- **不应使用的例子：** 需求仍有会改变兼容性的开放决策，请先逐项澄清。 → 应转给 `requirements-clarification`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=none, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Spec to Work Items（规格拆分工作项）；ChatGPT ZIP：`dist/chatgpt-skills/rd-spec-to-work-items.zip` / RD · Spec to Work Items（规格拆分工作项）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `requirements-clarification`、`safe-change-plan`、`safe-fix-implementation`

### `bug-root-cause-analysis` — Bug Root Cause Analysis（Bug 根因分析）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/bug-root-cause-analysis/skill.yaml`
- **版本 / 状态 / 风险：** `0.2.0` / `beta` / `tool_execution`
- **调用标识：** `bug-root-cause-analysis`
- **Canonical 用途与边界：** 针对具体运行时 Bug，从第一个可信错误出发，结合代码、日志、配置、现有测试和最小实验复现并建立有证据的因果链。用于非 CI 的症状到根因分析；不要吸收 CI 流水线失败、普通代码审查、项目体检、新增或修改测试请求或直接修复请求。
- **适合使用的例子：** 这个接口只在空 tags 时返回 500，请复现并定位根因，不要修。
- **不应使用的例子：** 请审查当前 PR 是否存在正确性和安全问题。 → 应转给 `safe-code-review`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=是；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Bug Root Cause Analysis（Bug 根因分析）；ChatGPT ZIP：`dist/chatgpt-skills/rd-bug-root-cause-analysis.zip` / RD · Bug Root Cause Analysis（Bug 根因分析）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`safe-code-review`、`safe-test-implementation`、`dependency-upgrade-analysis`、`database-migration-review`、`safe-fix-implementation`

### `project-health-check` — Project Health Check（项目体检）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/project-health-check/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `project-health-check`
- **Canonical 用途与边界：** 从架构、正确性、安全、性能、依赖、测试和一般发布风险等方面广泛诊断项目健康度。单一依赖升级、API 契约、数据库迁移、死代码候选、安全边界、性能回归或配置范围应交给相应专项审查；具体候选版本门禁使用 release-readiness-check。
- **适合使用的例子：** 全面检查这个项目的架构、测试、安全和维护性
- **不应使用的例子：** 我刚接手这个项目，只想理解目录、入口和怎么运行，不要检查项目问题。 → 应转给 `repo-onboarding`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Project Health Check（项目健康检查）；ChatGPT ZIP：`dist/chatgpt-skills/rd-project-health-check.zip` / RD · Project Health Check（项目健康检查）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `repo-onboarding`、`safe-code-review`、`test-gap-analysis`、`release-readiness-check`、`security-focused-review`、`safe-fix-implementation`

### `safe-code-review` — Safe Code Review（安全代码审查）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/safe-code-review/skill.yaml`
- **版本 / 状态 / 风险：** `0.2.0` / `beta` / `read_only`
- **调用标识：** `safe-code-review`
- **Canonical 用途与边界：** 广泛审查代码改动或 PR 的正确性、兼容性、安全性、可维护性和测试。用户要求单一安全、性能回归或 API 契约专项时分别使用对应专项 Skill；本 Skill 不实施修复。
- **适合使用的例子：** 审查当前 Git Diff，找出 Bug 和设计问题
- **不应使用的例子：** 对整个仓库做架构、依赖、测试、安全和维护性健康体检，不限于当前 diff。 → 应转给 `project-health-check`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Safe Code Review（安全审查代码）；ChatGPT ZIP：`dist/chatgpt-skills/rd-safe-code-review.zip` / RD · Safe Code Review（安全审查代码）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`api-contract-review`、`security-focused-review`、`performance-regression-analysis`、`safe-fix-implementation`

### `change-impact-analysis` — Change Impact Analysis（变更影响分析）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/change-impact-analysis/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `change-impact-analysis`
- **Canonical 用途与边界：** 在修改、重命名、移动或删除共享代码前分析一般依赖关系和兼容性影响。核心问题是依赖升级、API 契约、数据库迁移或死代码可删除性时使用对应专项 Skill；本 Skill 不修改文件。
- **适合使用的例子：** 重命名这个公共函数会影响哪些调用方
- **不应使用的例子：** 影响分析已经确认，请把变更拆成原子、可验证、可回滚的实施步骤，但不要执行。 → 应转给 `safe-change-plan`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Change Impact Analysis（改代码看影响）；ChatGPT ZIP：`dist/chatgpt-skills/rd-change-impact-analysis.zip` / RD · Change Impact Analysis（改代码看影响）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `requirements-to-spec`、`safe-change-plan`、`dependency-upgrade-analysis`、`api-contract-review`、`database-migration-review`、`dead-code-verification`、`safe-fix-implementation`

### `safe-change-plan` — Safe Change Plan（安全变更计划）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/safe-change-plan/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `advisory`
- **调用标识：** `safe-change-plan`
- **Canonical 用途与边界：** 将已确认规格、根因结论或影响分析转为原子化、可验证、可回滚且范围明确的实施计划。仅在重大决策已闭合且影响范围足够明确时使用；未决需求交给 requirements-clarification，已闭合但尚需规格化的需求交给 requirements-to-spec，影响未知交给 change-impact-analysis，架构理由或决策文档交给 architecture-decision-record，执行交给 safe-fix-implementation。
- **适合使用的例子：** 需求和影响分析已确认，请拆成原子、可验证、可回滚的实施计划，不要执行。
- **不应使用的例子：** 我想重命名共享模块，但还不知道调用方和兼容性影响。 → 应转给 `change-impact-analysis`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Safe Change Plan（安全变更计划）；ChatGPT ZIP：`dist/chatgpt-skills/rd-safe-change-plan.zip` / RD · Safe Change Plan（安全变更计划）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `requirements-clarification`、`requirements-to-spec`、`bug-root-cause-analysis`、`change-impact-analysis`、`architecture-decision-record`、`safe-fix-implementation`

### `test-gap-analysis` — Test Gap Analysis（测试缺口分析）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/test-gap-analysis/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `test-gap-analysis`
- **Canonical 用途与边界：** 将需求、根因、现有测试或 Git Diff 映射到有证据的测试覆盖与优先级缺口，覆盖单元、集成、契约、端到端和人工验证。用于判断已覆盖和缺失场景；不得批量生成测试代码，明确实施测试时交给可用的 safe-test-implementation。
- **适合使用的例子：** 把这个认证 diff 映射到现有测试并分析缺口，不要写测试。
- **不应使用的例子：** 对整个仓库做健康检查，包括架构、安全、依赖和测试风险。 → 应转给 `project-health-check`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Test Gap Analysis（测试缺口分析）；ChatGPT ZIP：`dist/chatgpt-skills/rd-test-gap-analysis.zip` / RD · Test Gap Analysis（测试缺口分析）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`safe-code-review`、`safe-test-implementation`、`safe-fix-implementation`

### `safe-test-implementation` — Safe Test Implementation（安全补充测试）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/safe-test-implementation/skill.yaml`
- **版本 / 状态 / 风险：** `0.3.0` / `beta` / `safe_edit`
- **调用标识：** `safe-test-implementation`
- **Canonical 用途与边界：** 以一种明确模式最小化补充高价值测试：行为实现前的 test_first、已验证修复后的 regression_after_fix，或旧行为的 characterization。仅用于已授权的测试、fixture 和必要测试辅助代码修改；不得伪造红灯、修改生产代码、执行通用 Bug 修复或只为覆盖率补断言。
- **适合使用的例子：** 修复尚未实现，请用 test_first 模式补最小测试，只修改测试和 fixture，并记录真实预期失败。
- **不应使用的例子：** 分析这个 diff 还缺哪些单元、集成和端到端测试，不要写测试。 → 应转给 `test-gap-analysis`
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=是；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=write, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Safe Test Implementation（安全补充测试）；ChatGPT ZIP：`dist/chatgpt-skills/rd-safe-test-implementation.zip` / RD · Safe Test Implementation（安全补充测试）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `bug-root-cause-analysis`、`test-gap-analysis`、`safe-fix-implementation`

### `ci-failure-diagnosis` — CI Failure Diagnosis（CI 失败诊断）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/ci-failure-diagnosis/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `ci-failure-diagnosis`
- **Canonical 用途与边界：** 根据 workflow 定义和日志定位失败的 workflow、job、step 与第一个可信错误，并对比 CI 和本地环境以诊断 CI 特定失败。用于 CI 流水线上下文；不作为普通本地 Bug 分析，不实施修复、不泄露密钥，也不建议降低安全控制。
- **适合使用的例子：** 这个 GitHub Actions job 本地通过但 CI 失败，请找第一个可信错误并诊断，不要修。
- **不应使用的例子：** API 在本地运行时稳定返回 500，没有 CI 上下文，请定位根因。 → 应转给 `bug-root-cause-analysis`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / CI Failure Diagnosis（CI 失败诊断）；ChatGPT ZIP：`dist/chatgpt-skills/rd-ci-failure-diagnosis.zip` / RD · CI Failure Diagnosis（CI 失败诊断）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `bug-root-cause-analysis`、`project-health-check`、`safe-fix-implementation`

### `documentation-sync` — Documentation Sync（文档同步维护）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/documentation-sync/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `safe_edit`
- **调用标识：** `documentation-sync`
- **Canonical 用途与边界：** 根据已确认的代码、配置、API 或行为变更，只更新有证据支持的 README、API、配置、示例、迁移和 CHANGELOG 内容，并保留原有风格与语言。用于仅文档修改；不得改变生产行为、编造未证实内容，也不作为通用代码修复。
- **适合使用的例子：** 实现和测试已经确认，请同步 README、API 文档、示例和 CHANGELOG，只改文档。
- **不应使用的例子：** 修复 CLI 返回值错误并更新相应文档。 → 应转给 `safe-fix-implementation`
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=是；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=write, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Documentation Sync（文档同步维护）；ChatGPT ZIP：`dist/chatgpt-skills/rd-documentation-sync.zip` / RD · Documentation Sync（文档同步维护）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `requirements-to-spec`、`safe-code-review`、`safe-fix-implementation`

### `release-readiness-check` — Release Readiness Check（发布就绪检查）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/release-readiness-check/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `advisory`
- **调用标识：** `release-readiness-check`
- **Canonical 用途与边界：** 针对具体候选版本执行有证据的只读发布门禁，检查工作区、版本、变更、验证、兼容性、回滚、文档和敏感产物后给出 GO、GO WITH CONDITIONS 或 NO-GO。用于候选版本；不作为广泛项目体检，也不执行发布、提交、tag、push 或版本修改。
- **适合使用的例子：** 对候选 commit 执行发布门禁并给出 GO 或 NO-GO，不要 tag、push 或修改版本。
- **不应使用的例子：** 对整个仓库做广泛健康检查，包括架构、安全、依赖和长期维护风险。 → 应转给 `project-health-check`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Release Readiness Check（发布就绪检查）；ChatGPT ZIP：`dist/chatgpt-skills/rd-release-readiness-check.zip` / RD · Release Readiness Check（发布就绪检查）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`safe-fix-implementation`

### `dependency-upgrade-analysis` — Dependency Upgrade Analysis（依赖升级分析）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/dependency-upgrade-analysis/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `dependency-upgrade-analysis`
- **Canonical 用途与边界：** 基于 manifest、锁文件、仓库用法和已验证官方发布资料分析具体依赖升级，覆盖破坏性变更、运行时要求、安全、许可证、生态兼容、验证和回滚。用于修改依赖版本前；不替代通用影响分析，也不修改 manifest 或锁文件。
- **适合使用的例子：** 分析把 React 18 升级到目标版本的破坏性变化、生态兼容性和回滚方案，不要改依赖。
- **不应使用的例子：** 我要重命名内部模块，请分析调用方和普通代码影响。 → 应转给 `change-impact-analysis`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=optional
- **分发：** 插件：`repo-doctor` v0.6.0 / Dependency Upgrade Analysis（依赖升级分析）；ChatGPT ZIP：`dist/chatgpt-skills/rd-dependency-upgrade-analysis.zip` / RD · Dependency Upgrade Analysis（依赖升级分析）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`change-impact-analysis`、`safe-fix-implementation`

### `api-contract-review` — API Contract Review（API 契约审查）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/api-contract-review/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `api-contract-review`
- **Canonical 用途与边界：** 审查具体 REST、GraphQL、RPC、事件、SDK 或内部模块契约在服务端、客户端、Schema、文档和测试间的一致性，并分类破坏性、非破坏性和行为变化。用于 API 契约兼容性；不替代普通代码审查或通用影响分析，也不修改接口。
- **适合使用的例子：** 专项审查这个 REST 接口的字段、错误码、分页、幂等和鉴权是否与客户端及 Schema 一致，不要改接口。
- **不应使用的例子：** 请对整个 PR 做普通正确性和可维护性代码审查。 → 应转给 `safe-code-review`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / API Contract Review（API 契约审查）；ChatGPT ZIP：`dist/chatgpt-skills/rd-api-contract-review.zip` / RD · API Contract Review（API 契约审查）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `safe-code-review`、`change-impact-analysis`、`safe-fix-implementation`

### `database-migration-review` — Database Migration Review（数据库迁移审查）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/database-migration-review/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `database-migration-review`
- **Canonical 用途与边界：** 审查具体数据库 Schema 或数据迁移的可逆性、数据安全、锁、回填、复制、兼容、零停机发布、验证和回滚。用于迁移专项风险；不替代通用影响分析，不执行迁移、不连接生产，也不修改迁移文件。
- **适合使用的例子：** 审查这次数据库迁移的 up/down、回填、锁表、复制延迟和零停机发布顺序，不执行迁移。
- **不应使用的例子：** 需求和影响已经确认，请生成通用原子实施计划。 → 应转给 `safe-change-plan`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Database Migration Review（数据库迁移审查）；ChatGPT ZIP：`dist/chatgpt-skills/rd-database-migration-review.zip` / RD · Database Migration Review（数据库迁移审查）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`change-impact-analysis`、`safe-change-plan`、`safe-fix-implementation`

### `dead-code-verification` — Dead Code Verification（死代码验证）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/dead-code-verification/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `dead-code-verification`
- **Canonical 用途与边界：** 通过检查静态与动态使用、注册器、构建入口、模板、插件、脚本和外部契约，验证具体符号、文件、路由、配置路径或功能是否可安全删除。用于无用代码证据；不替代通用影响分析，不把文本搜索无结果当安全证明，也不删除代码。
- **适合使用的例子：** 验证这个 handler 是否真是死代码，检查动态导入、路由、注册器和外部 API，证据不足不要建议删除。
- **不应使用的例子：** 我已经决定删除这个公共函数，请分析删除会影响哪些调用方。 → 应转给 `change-impact-analysis`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Dead Code Verification（死代码验证）；ChatGPT ZIP：`dist/chatgpt-skills/rd-dead-code-verification.zip` / RD · Dead Code Verification（死代码验证）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `safe-code-review`、`change-impact-analysis`、`safe-fix-implementation`

### `security-focused-review` — Security Focused Review（安全专项审查）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/security-focused-review/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `security-focused-review`
- **Canonical 用途与边界：** 通过建立资产、信任边界和攻击前提，对鉴权、授权、校验、注入、路径、SSRF、XSS、CSRF、反序列化、凭证、日志和依赖执行有证据的范围化安全审查。用于安全深度审查；不替代普通代码审查，不执行攻击、不访问生产、不显示密钥，也不实施修复。
- **适合使用的例子：** 对认证边界做安全专项审查，先建立威胁模型并检查授权、注入和日志泄漏，不要攻击或修复。
- **不应使用的例子：** 请对整个仓库做架构、依赖、测试、安全和维护性健康体检。 → 应转给 `project-health-check`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=optional
- **分发：** 插件：`repo-doctor` v0.6.0 / Security Focused Review（安全专项审查）；ChatGPT ZIP：`dist/chatgpt-skills/rd-security-focused-review.zip` / RD · Security Focused Review（安全专项审查）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`safe-code-review`、`safe-fix-implementation`

### `performance-regression-analysis` — Performance Regression Analysis（性能回归分析）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/performance-regression-analysis/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `performance-regression-analysis`
- **Canonical 用途与边界：** 针对明确基线和工作负载，使用 profile、benchmark、trace、日志或可复现实验分析具体性能回归，覆盖算法、I/O、N+1、缓存、内存、并发、网络、数据库和渲染。用于有测量依据的性能深度分析；不替代普通代码审查，不凭代码外观断言变慢，也不优化代码。
- **适合使用的例子：** 基于基线、工作负载和 profile 分析这个接口的性能回归，区分测量与推断，不要优化代码。
- **不应使用的例子：** 请普通审查这个 PR 的正确性、类型和可维护性问题。 → 应转给 `safe-code-review`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Performance Regression Analysis（性能回归分析）；ChatGPT ZIP：`dist/chatgpt-skills/rd-performance-regression-analysis.zip` / RD · Performance Regression Analysis（性能回归分析）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`safe-code-review`、`safe-fix-implementation`

### `architecture-decision-record` — Architecture Decision Record（架构决策记录）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/architecture-decision-record/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `safe_edit`
- **调用标识：** `architecture-decision-record`
- **Canonical 用途与边界：** 根据真实架构问题、证据、候选方案、权衡和明确决策状态创建或更新 ADR，并遵循仓库 ADR 目录、编号和模板。仅在用户授权修改 ADR 或架构文档时使用；不生成实施计划、不虚构团队共识，也不修改业务代码。
- **适合使用的例子：** 根据仓库真实约定创建一份 Proposed ADR，记录队列选型的候选方案、理由、后果和复审条件，只改架构文档。
- **不应使用的例子：** 决策已经确定，请拆成逐步验证和回滚的代码实施计划。 → 应转给 `safe-change-plan`
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=write, git=optional, shell=none, web=optional
- **分发：** 插件：`repo-doctor` v0.6.0 / Architecture Decision Record（架构决策记录）；ChatGPT ZIP：`dist/chatgpt-skills/rd-architecture-decision-record.zip` / RD · Architecture Decision Record（架构决策记录）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `requirements-to-spec`、`safe-change-plan`、`documentation-sync`、`safe-fix-implementation`

### `configuration-audit` — Configuration Audit（配置审计）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/configuration-audit/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `configuration-audit`
- **Canonical 用途与边界：** 基于仓库证据审计配置来源、优先级、环境覆盖、默认值、必填、类型、校验、漂移、过期项、危险默认值、未文档化变量和凭证误提交风险。用于配置专项风险；不替代广泛体检，不读取或显示敏感值、不连接外部环境，也不修改配置。
- **适合使用的例子：** 审计配置来源、覆盖优先级、危险默认值和环境漂移，只报告凭据名称与位置，不显示值或改配置。
- **不应使用的例子：** 请对整个项目做广泛健康检查，包括架构、测试、依赖和配置。 → 应转给 `project-health-check`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Configuration Audit（配置审计）；ChatGPT ZIP：`dist/chatgpt-skills/rd-configuration-audit.zip` / RD · Configuration Audit（配置审计）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`change-impact-analysis`、`safe-fix-implementation`

### `session-handoff` — Session Handoff（会话交接）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/session-handoff/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `safe_edit`
- **调用标识：** `session-handoff`
- **Canonical 用途与边界：** 生成经过敏感信息清理且区分事实与推断的续接摘要，使新 Agent 会话无需重做已完成工作即可继续仓库任务。用于上下文过长、负责人切换或稍后继续；引用已有产物，记录仓库和验证状态，推荐下一 Skills，并提供可复制启动指令。不修改业务代码、不创建 commit、不声称会自动加载，也不在缺少安全 scratch 位置或写入授权时落盘。
- **适合使用的例子：** 当前会话太长，请生成脱敏交接摘要，让下一个 Agent 可以继续且不重复已完成工作。
- **不应使用的例子：** 请审查当前 diff 是否符合规格并检查实现质量。 → 应转给 `safe-code-review`
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=write, git=optional, shell=none, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Session Handoff（会话交接）；ChatGPT ZIP：`dist/chatgpt-skills/rd-session-handoff.zip` / RD · Session Handoff（会话交接）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `safe-code-review`、`documentation-sync`

### `safe-fix-implementation` — Safe Fix Implementation（最小安全修复）

- **Canonical 元数据：** `packs/engineering/repo-doctor/skills/safe-fix-implementation/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `safe_edit`
- **调用标识：** `safe-fix-implementation`
- **Canonical 用途与边界：** 在明确诊断后实施一个小范围、可验证的生产代码修复。仅测试修改使用 safe-test-implementation，仅文档修改使用 documentation-sync。
- **适合使用的例子：** 根据刚才确认的 P1 实施最小安全修复
- **不应使用的例子：** 只复现并分析这个空指针错误的根因，建立证据链，不要修改任何文件。 → 应转给 `bug-root-cause-analysis`
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=是；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=write, git=optional, shell=optional, web=none
- **分发：** 插件：`repo-doctor` v0.6.0 / Safe Fix Implementation（只修一个问题）；ChatGPT ZIP：`dist/chatgpt-skills/rd-safe-fix-implementation.zip` / RD · Safe Fix Implementation（只修一个问题）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `bug-root-cause-analysis`、`safe-code-review`、`safe-change-plan`、`safe-test-implementation`、`documentation-sync`

## 2. Productivity Toolkit（通用办公与研究生产力工具包）

- **Pack ID：** `productivity.productivity-toolkit`
- **Canonical：** `packs/productivity/productivity-toolkit/pack.yaml`
- **Active Skill：** 8
- **Pack 版本 / 状态：** `0.1.0` / `beta`
- **Canonical Pack 说明：** 面向跨行业场景的公开安全生产力技能包，覆盖报告、研究简报、数据清洗、文档与 PDF 审查、会议行动项、演示大纲和内容一致性。
- **实际 active 清单：** `report-writer`、`research-brief`、`spreadsheet-data-cleaning`、`document-review`、`pdf-review`、`meeting-notes-to-actions`、`presentation-outline`、`content-consistency-check`

### `report-writer` — Report Writer（报告撰写）

- **Canonical 元数据：** `packs/productivity/productivity-toolkit/skills/report-writer/skill.yaml`
- **版本 / 状态 / 风险：** `0.2.0` / `beta` / `safe_edit`
- **调用标识：** `report-writer`
- **Canonical 用途与边界：** 根据用户提供的目标、读者、证据和格式撰写或修订结构化报告，并区分事实、引用、推断、建议和未知项。交付物是报告时使用；主要任务是搜集和综合证据时使用 research-brief；不得补造事实，也不得在缺少工具或未获明确授权时声称生成 DOCX/PDF。
- **适合使用的例子：** 根据这些已经提供的访谈和数据撰写结构化报告，区分事实、推断和未知。
- **不应使用的例子：** 请先联网搜集当前官方资料、交叉验证冲突并制作研究简报。 → 应转给 `research-brief`
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=是；访问网络=是；允许破坏性操作=否
- **工具需求：** filesystem=write, git=none, shell=optional, web=optional
- **分发：** 插件：`productivity-toolkit` v0.1.0 / Report Writer（报告撰写）；ChatGPT ZIP：`dist/chatgpt-skills/pt-report-writer.zip` / PT · Report Writer（报告撰写）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `research-brief`、`document-review`

### `research-brief` — Research Brief（研究简报）

- **Canonical 元数据：** `packs/productivity/productivity-toolkit/skills/research-brief/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `networked`
- **调用标识：** `research-brief`
- **Canonical 用途与边界：** 围绕有边界的研究问题制定来源计划、建立证据台账、交叉验证并输出结论、未知项和下一步。主要任务是搜集或综合证据时使用；已有材料只需形成正式报告时使用 report-writer；无法访问资料或网络时不得声称完成实时研究。
- **适合使用的例子：** 围绕这个明确问题研究官方和原始来源，记录发布、事件和访问日期并制作简报。
- **不应使用的例子：** 资料已经全部提供，请直接整理成正式五页报告，不需要外部研究。 → 应转给 `report-writer`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=是；允许破坏性操作=否
- **工具需求：** filesystem=read, git=none, shell=none, web=optional
- **分发：** 插件：`productivity-toolkit` v0.1.0 / Research Brief（研究简报）；ChatGPT ZIP：`dist/chatgpt-skills/pt-research-brief.zip` / PT · Research Brief（研究简报）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `report-writer`、`presentation-outline`

### `spreadsheet-data-cleaning` — Spreadsheet Data Cleaning（表格数据清洗）

- **Canonical 元数据：** `packs/productivity/productivity-toolkit/skills/spreadsheet-data-cleaning/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `safe_edit`
- **调用标识：** `spreadsheet-data-cleaning`
- **Canonical 用途与边界：** 对电子表格或分隔数据进行画像、清洗、标准化、转换、填补或去重，并在用户授权下生成新结果，提供可追踪规则、前后统计、审计日志及公式、编码、行列数和关键汇总验证。不得覆盖原始数据、猜测关键值或删除可能有效的记录；缺少执行工具时降级为清洗计划。用户只要求只读数据质量审计或问题报告，不要求修改或清洗副本时，应使用 excel-data-quality-check-basic。
- **适合使用的例子：** 画像并清洗这份 XLSX，结果另存，保留歧义记录并输出前后统计和审计日志。
- **不应使用的例子：** 只检查 Excel 的质量问题并给报告，不要修改或生成清洗文件。 → 应转给 `excel-data-quality-check-basic`
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=是；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=write, git=none, shell=optional, web=none
- **分发：** 插件：`productivity-toolkit` v0.1.0 / Spreadsheet Data Cleaning（表格数据清洗）；ChatGPT ZIP：`dist/chatgpt-skills/pt-spreadsheet-data-cleaning.zip` / PT · Spreadsheet Data Cleaning（表格数据清洗）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `content-consistency-check`、`excel-data-quality-check-basic`

### `document-review` — Document Review（文档审查）

- **Canonical 元数据：** `packs/productivity/productivity-toolkit/skills/document-review/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `safe_edit`
- **调用标识：** `document-review`
- **Canonical 用途与边界：** 未限定范围的通用文档或 Word 审查，以及结构、逻辑、完整性、术语、事实依据、数字、引用、语法、格式、表格、链接、批注、修订痕迹或获授权修订等整体检查，默认使用本 Skill。DOCX 或渲染工具不可用时仍在本 Skill 内降级并说明限制。跨文档核对应使用 content-consistency-check；用户明确指定 word-document-review-basic，或明确要求轻量、只读、只检查文字和标题且不处理复杂格式或修订时不使用本 Skill。
- **适合使用的例子：** 整体审查这份文档的结构、逻辑、完整性、证据和语言，分级列出问题，不要整篇重写。
- **不应使用的例子：** 只核对报告、表格和演示中相同数字、日期和版本是否冲突。 → 应转给 `content-consistency-check`
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=是；访问网络=是；允许破坏性操作=否
- **工具需求：** filesystem=write, git=none, shell=optional, web=optional
- **分发：** 插件：`productivity-toolkit` v0.1.0 / Document Review（文档审查）；ChatGPT ZIP：`dist/chatgpt-skills/pt-document-review.zip` / PT · Document Review（文档审查）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `pdf-review`、`content-consistency-check`、`word-document-review-basic`

### `pdf-review` — PDF Review（PDF 审查）

- **Canonical 元数据：** `packs/productivity/productivity-toolkit/skills/pdf-review/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `tool_execution`
- **调用标识：** `pdf-review`
- **Canonical 用途与边界：** 未限定范围的通用 PDF 审查，以及涉及可搜索文字、结构、表格、页码定位、数字一致性、引用、扫描页、OCR、渲染、完整性或视觉版式的检查，默认使用本 Skill。检测可用能力，工具不可用时仍在本 Skill 内降级；不得修改原 PDF 或声称完成不受支持的验证。用户明确指定 pdf-review-basic，或明确要求不做 OCR、渲染和复杂版式检查的轻量纯文本任务时不使用本 Skill。
- **适合使用的例子：** 审查这份 PDF 的页面结构、表格、数字矛盾和版式，并为可验证发现保留页码。
- **不应使用的例子：** 只做基础 PDF 文本风险检查，不需要 OCR、渲染或完整页面审查。 → 应转给 `pdf-review-basic`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=是；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=none, shell=optional, web=none
- **分发：** 插件：`productivity-toolkit` v0.1.0 / PDF Review（PDF 审查）；ChatGPT ZIP：`dist/chatgpt-skills/pt-pdf-review.zip` / PT · PDF Review（PDF 审查）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `document-review`、`content-consistency-check`、`pdf-review-basic`

### `meeting-notes-to-actions` — Meeting Notes to Actions（会议纪要转行动项）

- **Canonical 元数据：** `packs/productivity/productivity-toolkit/skills/meeting-notes-to-actions/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `advisory`
- **调用标识：** `meeting-notes-to-actions`
- **Canonical 用途与边界：** 将给定会议记录或转写整理为摘要、决定、行动项、负责人、截止日期、依赖和待确认问题，并区分讨论、建议、决定和承诺。来源是会议材料时使用；不得虚构负责人、日期、决定或任务系统更新，缺失字段标记 TBD。
- **适合使用的例子：** 把会议记录整理成摘要、决定和行动项，缺失负责人或日期全部写 TBD。
- **不应使用的例子：** 把已经确认的行动计划写成正式项目报告，而不是提取会议任务。 → 应转给 `report-writer`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=none, shell=none, web=none
- **分发：** 插件：`productivity-toolkit` v0.1.0 / Meeting Notes to Actions（会议纪要转行动项）；ChatGPT ZIP：`dist/chatgpt-skills/pt-meeting-notes-to-actions.zip` / PT · Meeting Notes to Actions（会议纪要转行动项）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `report-writer`、`research-brief`、`presentation-outline`

### `presentation-outline` — Presentation Outline（演示文稿大纲）

- **Canonical 元数据：** `packs/productivity/productivity-toolkit/skills/presentation-outline/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `safe_edit`
- **调用标识：** `presentation-outline`
- **Canonical 用途与边界：** 针对受众设计演示故事线和逐页大纲，包含每页目的、标题、要点、证据和建议视觉。默认交付物是大纲时使用；仅在用户明确要求且平台具备演示工具时生成 PPTX；不得编造缺失数据，也不得把报告机械切成高密度幻灯片。
- **适合使用的例子：** 为十五分钟演示设计故事线和逐页大纲，包括每页目的、证据和视觉建议，不生成 PPTX。
- **不应使用的例子：** 根据完整材料撰写带摘要、方法、发现和建议的正式报告。 → 应转给 `report-writer`
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=是；访问网络=是；允许破坏性操作=否
- **工具需求：** filesystem=write, git=none, shell=optional, web=optional
- **分发：** 插件：`productivity-toolkit` v0.1.0 / Presentation Outline（演示文稿大纲）；ChatGPT ZIP：`dist/chatgpt-skills/pt-presentation-outline.zip` / PT · Presentation Outline（演示文稿大纲）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `report-writer`、`research-brief`、`content-consistency-check`

### `content-consistency-check` — Content Consistency Check（内容一致性检查）

- **Canonical 元数据：** `packs/productivity/productivity-toolkit/skills/content-consistency-check/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `tool_execution`
- **调用标识：** `content-consistency-check`
- **Canonical 用途与边界：** 对一个或多个材料中的术语、数字、日期、单位、人物、版本、链接和结论进行对照，报告冲突两侧位置、严重度、类型和建议权威基准。主要任务是跨内容核对时使用；单份文档整体质量应使用 document-review；没有权威证据时不得擅选正确值，也不得声称完成不受支持的文件格式检查。
- **适合使用的例子：** 对比报告、表格、PDF 和演示中的术语、数字、日期、单位、版本和结论冲突。
- **不应使用的例子：** 整体审查一份文档的论证、结构、语法和完整性，不需要跨文件核对。 → 应转给 `document-review`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=是；访问网络=是；允许破坏性操作=否
- **工具需求：** filesystem=read, git=none, shell=optional, web=optional
- **分发：** 插件：`productivity-toolkit` v0.1.0 / Content Consistency Check（内容一致性检查）；ChatGPT ZIP：`dist/chatgpt-skills/pt-content-consistency-check.zip` / PT · Content Consistency Check（内容一致性检查）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `spreadsheet-data-cleaning`、`document-review`

## 3. Skill Maintainer（Skill 维护工具）

- **Pack ID：** `engineering.skill-maintainer`
- **Canonical：** `packs/engineering/skill-maintainer/pack.yaml`
- **Active Skill：** 2
- **Pack 版本 / 状态：** `0.2.0` / `beta`
- **Canonical Pack 说明：** 面向维护者的公开安全工作流，用于工程化创建 AI Skill，并在发布前审计 Skill、Pack、插件和生成物质量。
- **实际 active 清单：** `skill-authoring`、`skill-quality-audit`

### `skill-authoring` — Skill Authoring（Skill 工程化创建）

- **Canonical 元数据：** `packs/engineering/skill-maintainer/skills/skill-authoring/skill.yaml`
- **版本 / 状态 / 风险：** `0.2.0` / `beta` / `safe_edit`
- **调用标识：** `skill-authoring`
- **Canonical 用途与边界：** 在当前 Skills 仓库中，根据具体用例工程化创建或更新一个 AI Skill，覆盖 canonical 源、最少资源、双语元数据、UI 集成、activation 契约、验证和跨平台构建检查。维护者明确需要可复用 Skill 产物时使用；不用于一次性 Prompt、调用现有业务 Skill、只创建空插件、普通代码修改或未经确认批量创建多个 Skill。
- **适合使用的例子：** 请按这个仓库现有脚手架工程化创建一个双语 AI Skill，包含真实触发例、反例、UI 元数据和跨平台验证。
- **不应使用的例子：** 只帮我把这一封一次性请假邮件润色得更自然，不要创建任何可复用 Skill。 → 应转给 当前没有匹配的仓库 Skill；停止并说明边界
- **声明权限：** 读取文件=是；写入文件=是；运行 shell=是；访问网络=是；允许破坏性操作=否
- **工具需求：** filesystem=write, git=optional, shell=optional, web=optional
- **分发：** 插件：`skill-maintainer` v0.2.0 / Skill Authoring（Skill 工程化创建）；ChatGPT ZIP：`dist/chatgpt-skills/sm-skill-authoring.zip` / SM · Skill Authoring（Skill 工程化创建）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `documentation-sync`、`safe-fix-implementation`、`report-writer`、`skill-quality-audit`

### `skill-quality-audit` — Skill Quality Audit（Skill 质量审计）

- **Canonical 元数据：** `packs/engineering/skill-maintainer/skills/skill-quality-audit/skill.yaml`
- **版本 / 状态 / 风险：** `0.2.0` / `beta` / `tool_execution`
- **调用标识：** `skill-quality-audit`
- **Canonical 用途与边界：** 对一个 AI Skill、Pack、插件或 Skills 仓库执行严格只读的发布前质量审计，覆盖结构、触发、工作流、渐进资源、双语跨平台产物、安全和发布集成。维护者需要发现、严重度、证据和发布建议时使用；不用于普通应用代码或 PR 审查、广泛项目体检、产品候选版本门禁，也不自动修复文件。
- **适合使用的例子：** 发布前只读审计这个结构合法的 AI Skill，并在没有问题时也给出有证据的评分卡和发布建议。
- **不应使用的例子：** 需要创建一个 Skill；如果平台脚手架工具不可用，请明确降级并检查仓库现有脚本，不要伪称已经生成文件。 → 应转给 `skill-authoring`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=是；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=optional, shell=optional, web=none
- **分发：** 插件：`skill-maintainer` v0.2.0 / Skill Quality Audit（Skill 质量审计）；ChatGPT ZIP：`dist/chatgpt-skills/sm-skill-quality-audit.zip` / SM · Skill Quality Audit（Skill 质量审计）（ZIP 内不嵌入 version/status，以构建来源和漂移检查证明一致性）
- **Activation contract 相邻 Skill：** `project-health-check`、`safe-code-review`、`test-gap-analysis`、`release-readiness-check`、`security-focused-review`、`safe-fix-implementation`、`document-review`、`skill-authoring`

## 4. Document Data Doctor（文档数据医生）

- **Pack ID：** `office.document-data-doctor`
- **Canonical：** `packs/office/document-data-doctor/pack.yaml`
- **Active Skill：** 3
- **Pack 版本 / 状态：** `0.1.0` / `beta`
- **Canonical Pack 说明：** 用于基于证据审查 PDF、Word、Excel 和报告输出的公开安全基础技能包。
- **实际 active 清单：** `pdf-review-basic`、`word-document-review-basic`、`excel-data-quality-check-basic`

### `pdf-review-basic` — Basic PDF Review（PDF 基础审查）

- **Canonical 元数据：** `packs/office/document-data-doctor/skills/pdf-review-basic/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `pdf-review-basic`
- **Canonical 用途与边界：** 仅在用户明确把任务限定为基础、轻量、只读、纯文本检查时，检查 PDF 的可提取文字、标题和明显文本问题并给出简短清单，不做 OCR、页面渲染、扫描内容识别、表格、图片、复杂版式或源文件修改。不得用于未限定范围的通用 PDF 审查；通用请求、页码或视觉核验、OCR、扫描页、表格、图片、版式或完整性应使用 pdf-review。PDF 修改或重新生成不属于这两个审查 Skill，需要另行授权的编辑流程。
- **适合使用的例子：** 只做基础 PDF 文字检查，不需要 OCR 或页面渲染。
- **不应使用的例子：** 审查这个 PDF。 → 应转给 `pdf-review`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=none, shell=optional, web=none
- **分发：** 当前未配置独立插件 Skill 或 ChatGPT ZIP；它仍会进入常规跨平台构建产物。
- **Activation contract 相邻 Skill：** `pdf-review`

### `word-document-review-basic` — Basic Word Document Review（Word 文档基础审查）

- **Canonical 元数据：** `packs/office/document-data-doctor/skills/word-document-review-basic/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `word-document-review-basic`
- **Canonical 用途与边界：** 仅在用户明确把任务限定为基础、轻量、只读、纯文本检查时，检查 Word 文档的文字、标题层级、简单语法、明显一致性和未解决占位符，不编辑源文件、不保留复杂格式，也不处理修订痕迹、批注、复杂表格、图片、页眉页脚或视觉版式。不得用于未限定范围的通用 Word 或文档审查；整体结构、逻辑、事实、修订、格式、表格、链接、批注或 DOCX 渲染验证应使用 document-review。
- **适合使用的例子：** 只检查 Word 中的文字和标题结构，不修改文件。
- **不应使用的例子：** 审查这个 Word 文档。 → 应转给 `document-review`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=none, shell=optional, web=none
- **分发：** 当前未配置独立插件 Skill 或 ChatGPT ZIP；它仍会进入常规跨平台构建产物。
- **Activation contract 相邻 Skill：** `document-review`

### `excel-data-quality-check-basic` — Basic Excel Data Quality Check（Excel 数据质量基础检查）

- **Canonical 元数据：** `packs/office/document-data-doctor/skills/excel-data-quality-check-basic/skill.yaml`
- **版本 / 状态 / 风险：** `0.1.0` / `beta` / `read_only`
- **调用标识：** `excel-data-quality-check-basic`
- **Canonical 用途与边界：** 对表格执行只读数据质量审计，报告缺失、重复、类型、格式、异常和来源可追溯性问题，不清洗、标准化、填补、去重、覆盖或生成修改后的副本。用于检查、审计或列出数据质量问题；用户要求转换、修复或输出清洗结果时使用 spreadsheet-data-cleaning。
- **适合使用的例子：** 检查这个 Excel 是否存在重复、缺失和格式问题，不要修改或生成新文件。
- **不应使用的例子：** 清洗这个 Excel，去重并生成新文件。 → 应转给 `spreadsheet-data-cleaning`
- **声明权限：** 读取文件=是；写入文件=否；运行 shell=否；访问网络=否；允许破坏性操作=否
- **工具需求：** filesystem=read, git=none, shell=optional, web=none
- **分发：** 当前未配置独立插件 Skill 或 ChatGPT ZIP；它仍会进入常规跨平台构建产物。
- **Activation contract 相邻 Skill：** `spreadsheet-data-cleaning`
