# Repo Doctor Skills v0.4.1 正式稳定版

> 发布日期：2026-08-06。该正式非预发布版本使用 `v0.4.1` tag，只修复文档、可复现安装和远程 Release 验证，不改变 Skill 行为。

## 变更内容

- 修正遗留候选状态文案，把计划版本表述改为已发布事实。
- 稳定版 Codex marketplace 安装固定到 `v0.4.1`；`main` 只用于开发版本。
- 新增无运行时依赖的验证器：下载真实 GitHub Release，校验 Manifest、SHA-256、全部远端资产摘要和每个 ZIP。
- 新增双语 Release 资产选择指南，并同步英文和简体中文文档。

没有新增、删除、重命名或改变任何 Skill 行为；没有破坏性变化，也没有新增运行时依赖。仓库仍为 4 个 active Pack、40 个 active Skill、27 个 Repo Doctor Skill、13 个 workflow、300 条 activation contract、7 个常规平台构建、37 个单 Skill ZIP 和 40 个 Release 总资产。

组件契约不变：Repo Doctor Pack/插件保持 0.7.0，Productivity Toolkit Pack/插件保持 0.1.0，Skill Maintainer Pack/插件保持 0.2.0，Document Data Doctor Pack 保持 0.1.0；单个 Skill 版本也不变。

## 验证

未变化的 Skill 集合继续具有 **317/317 PASS** 的 Live-model 验证证据：200 项核心路由、44 个双语工作流步骤、61 项模式与判定、12 项权限边界。v0.4.1 只修改文档和发布验证工具，不把 v0.4.0 的报告冒充为本次新执行的 317 次调用。

发布门禁还会运行 Schema、Skill、workflow、activation、完整测试、构建、文档、质量、发布元数据、Doctor、语法、生成物漂移、敏感内容、ZIP 和远程 v0.4.0 资产检查。v0.4.1 发布后会再次验证真实远程资产。

## 安装与升级

稳定版：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.4.1
```

开发版：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

从 v0.4.0 升级时，应刷新或替换已配置的 marketplace source，使其固定到 `v0.4.1`；按宿主要求重新安装或刷新所选插件，并开启新任务重新发现 Skill。使用 ChatGPT 单 Skill 的用户应下载对应 `*-v0.4.1.zip`，验证后再替换旧上传包。

## 发布证据

- [Live Codex 验证报告](../tests/reports/live-codex-skill-validation.md)
- [双语验证报告](../tests/reports/bilingual-skill-validation.md)
- [构建产物验证报告](../tests/reports/build-artifact-validation.json)
- [Release Manifest 校验说明](guides/release-asset-selection.zh-CN.md#verify-release-metadata)
- [SHA256SUMS 校验说明](guides/release-asset-selection.zh-CN.md#verify-release-metadata)
- [Release 资产选择指南](guides/release-asset-selection.zh-CN.md)

Release Manifest 和 `SHA256SUMS-v0.4.1.txt` 会从最终 tag 内容生成并作为正式 GitHub Release 资产上传；仓库文档不会用本机路径或发布前占位文件冒充这些证据。
