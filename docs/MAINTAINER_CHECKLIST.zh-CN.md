# 维护者检查清单

发布、合并或大幅更新文档前，请使用这份清单。

## 文档

- [ ] 用户可见行为变化时，同时更新 `README.md` 和 `README.zh-CN.md`。
- [ ] `docs/QUICK_START.md` 和 `docs/QUICK_START.zh-CN.md` 仍匹配当前命令和输出。
- [ ] `docs/ADDING_SKILLS.md` 和 `docs/ADDING_SKILLS.zh-CN.md` 仍匹配当前 skill 结构。
- [ ] `CHANGELOG.md` 已记录相关公开变化。
- [ ] 面向问题的 Skill 快速入口保持双语，并使用稳定 canonical 名称，不伪造 alias frontmatter。
- [ ] `docs/VERSIONING.md` 和 `docs/VERSIONING.zh-CN.md` 仍匹配项目/组件版本模型和成熟度策略。
- [ ] `packs/` 仍是唯一 canonical 来源；没有在生成的 `plugins/` 或 `dist/` 副本中直接维护 Skill 业务逻辑。
- [ ] `docs/guides/execution-modes.md` 与中文版本保持语义一致。

## Skill 结构

每个新增或修改的 skill 都应包含：

- [ ] `skill.yaml`
- [ ] `instructions.en.md`
- [ ] `instructions.zh-CN.md`
- [ ] `output.en.md`
- [ ] `output.zh-CN.md`
- [ ] `examples.en.md`
- [ ] `examples.zh-CN.md`
- [ ] `tests/case-001.en.yaml`
- [ ] `tests/case-001.zh-CN.yaml`

## 元数据

- [ ] `skill.yaml` 包含必需字段：`id`、`name`、`category`、`visibility`、`version`、`status`、`default_locale`、`supported_locales`、`description`、`triggers`、`tool_requirements`、`permissions`、`risk_level`、`output_schema` 和 `localization`。
- [ ] `visibility` 适合公开仓库。
- [ ] `supported_locales` 包含 `en` 和 `zh-CN`。
- [ ] 权限明确声明是否允许写文件、运行命令、联网和破坏性操作。
- [ ] 变更 Skill 说明何时适合自动调用、何时需要明确写权限，以及排除工作由哪个相邻 Skill 承接。
- [ ] 适用 Skill 保持 `fast`、`standard`、`audit` 语义；`documented`、`test_mode` 等专项模式与输出模式保持独立。
- [ ] 每个 Repo Doctor `skill.yaml` 都有 execution 分类、`fast` 或 `standard` 默认值和明确的隐式调用策略。
- [ ] Heavyweight 和 explicit-only candidate 会生成 `allow_implicit_invocation: false`；没有等价字段的 adapter 使用精确 description，不编造 alias。
- [ ] 项目发布版本在 `package.json`、计划使用的 Git tag/GitHub Release、`CHANGELOG.md` 和候选版本说明中一致。
- [ ] 每个 Pack 版本与对应生成插件 manifest 一致；不要把 Pack/插件版本机械强制为项目版本。
- [ ] 每个 Skill 保持有独立依据的语义版本，不自动继承 Pack 或项目版本。
- [ ] Pack/Skill 成熟度有证据，Pack 不得高于其中成熟度最低的 active Skill。
- [ ] `beta` 被准确描述为已通过仓库验证、可用但广泛使用/Live-model 证据有限；`stable` 不得写成绝对无 Bug。
- [ ] 模板内容保持 `draft` 且不进入 active/插件/ZIP 数量；deprecated 内容没有被重新激活。

## 公开安全

- [ ] 没有提交 token、API key、凭证或 secret。
- [ ] 没有加入公司内部流程、模板、客户案例或私有数据源。
- [ ] 没有把股票池、买卖信号、投资策略、估值权重或非公开业务规则加入 public skills。
- [ ] 财务相关内容仍然只作为接口规范和安全边界存在。

## 验证

- [ ] `find scripts -type f -name '*.mjs' -exec node --check {} \;` 通过。
- [ ] `npm run validate` 通过。
- [ ] `npm test` 通过，包括 activation、维护工具、同步和构建完整性契约。
- [ ] `npm run test:performance` 至少通过 20 个简单场景和 10 个高风险场景，且不降低权限门禁。
- [ ] `npm run build` 通过。
- [ ] Codex、Claude Code、Cursor、Qwen、Kimi、中英文 generic、portable prompt 和 ChatGPT 包均包含全部 active Skill，且没有手工编辑生成物造成漂移。
- [ ] `npm run docs:generate` 已刷新生成的 Skill Catalog，且 `npm run docs:check` 通过。
- [ ] 构建后 `node scripts/check-skill-quality.mjs --check-dist` 通过。
- [ ] 重复运行 `npm run build` 后，生成树指纹保持一致，且没有陈旧或额外产物。
- [ ] `git diff --check` 通过。
- [ ] `dist/` 生成文件没有被提交。
- [ ] 只保留 `dist/.gitkeep`。

当前有意不单独配置 `format` 或 `lint` 脚本。不要只为补齐名称而增加空脚本、全仓机械格式化或新的 formatter/linter 依赖。现阶段由上述语法、Schema、校验、测试、构建、生成物、空白字符、确定性构建和代码审查门禁覆盖基础质量；如果未来可执行代码规模明显增长，再评估引入统一格式化或 lint 工具。

## 生成兼容性

- [ ] `plugins/repo-doctor/`、`plugins/productivity-toolkit/` 和 `plugins/skill-maintainer/` 与各自 canonical Pack manifest 一致。
- [ ] 每个插件 manifest 仍指向生成的 `./skills/` 目录。
- [ ] 插件与 ChatGPT 包集合不存在相对 canonical 源的手工漂移。
- [ ] 除非有意改变架构，Document Data Doctor 的 3 个 Basic Skill 仍只进入 Pack/跨平台产物，没有独立插件或 ChatGPT ZIP。
- [ ] adapters 文档仍然匹配生成输出行为。

## Release Candidate

- [ ] `CHANGELOG.md` 在 `Unreleased` 记录当前工作；只有真正准备项目发布时才创建带日期候选段。
- [ ] CHANGELOG 比较链接、候选发布说明和版本策略链接有效。
- [ ] 在 commit、push、tag 和外部发布动作真正成功之前，候选版本没有被写成“已发布”。
- [ ] 除非确实执行了有证据的在线评测，否则 Live-model 路由准确率保持 `UNKNOWN`。
- [ ] commit、push、创建 tag、GitHub Release、npm 发布和插件市场发布仍是需要分别明确授权的动作。
