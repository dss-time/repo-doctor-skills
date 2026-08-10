# Release 资产选择指南

本指南帮助你选择一个真实发布的 Repo Doctor Skills 资产，避免编造聚合包，也避免混用 ChatGPT 与 Codex 安装路径。

## Release 资产清单

v0.5.1 共发布 40 个资产：

- 37 个带版本的 ChatGPT 单 Skill ZIP：27 个 `rd-*`、8 个 `pt-*`、2 个 `sm-*`；
- `Repo-Doctor-Skills-v0.5.1-RELEASE_NOTES.md`；
- `Repo-Doctor-Skills-v0.5.1-RELEASE_MANIFEST.txt`；
- `SHA256SUMS-v0.5.1.txt`。

Document Data Doctor 的 3 个 Basic Skill 会进入 7 个常规平台构建，但没有独立插件或 ChatGPT ZIP。仓库不存在“全部 Skills 聚合 ZIP”。

## 选择单 Skill ZIP

文件名同时标识分发族和版本：

| 需求 | Release 资产 | Canonical Skill |
|---|---|---|
| 路由工程请求 | `rd-repo-doctor-router-v0.5.1.zip` | `repo-doctor-router` |
| 诊断满足前提的非 CI 运行时 Bug | `rd-bug-root-cause-analysis-v0.5.1.zip` | `bug-root-cause-analysis` |
| 审查代码改动 | `rd-safe-code-review-v0.5.1.zip` | `safe-code-review` |
| 分析架构摩擦 | `rd-architecture-deepening-analysis-v0.5.1.zip` | `architecture-deepening-analysis` |
| 撰写证据感知报告 | `pt-report-writer-v0.5.1.zip` | `report-writer` |
| 审查 Word 或一般文档 | `pt-document-review-v0.5.1.zip` | `document-review` |
| 审查 PDF | `pt-pdf-review-v0.5.1.zip` | `pdf-review` |
| 清洗 Excel 或其他表格数据 | `pt-spreadsheet-data-cleaning-v0.5.1.zip` | `spreadsheet-data-cleaning` |
| 创建演示文稿大纲 | `pt-presentation-outline-v0.5.1.zip` | `presentation-outline` |
| 创建仓库标准 Skill | `sm-skill-authoring-v0.5.1.zip` | `skill-authoring` |
| 审计 Skill 发布质量 | `sm-skill-quality-audit-v0.5.1.zip` | `skill-quality-audit` |

其他资产遵循相同命名规则：

- `rd-<repo-doctor-slug>-v0.5.1.zip`；
- `pt-<productivity-slug>-v0.5.1.zip`；
- `sm-<skill-maintainer-slug>-v0.5.1.zip`。

只需要一个个人 ChatGPT Skill 时，通过 ChatGPT Skill 界面上传对应 ZIP。前缀用于避免网页 Skill 库中的名称冲突，不会改变仓库 canonical slug。

## 单 Skill ZIP 与插件的区别

适合使用单 ZIP 的情况：

- 只需要一个 ChatGPT Skill；
- 希望上传面最小；
- 不需要插件级安装或发现。

适合使用插件的情况：

- 需要完整 Pack；
- 需要 Codex 插件发现和 canonical `$skill-name` 调用；
- 希望通过一个固定版本的 marketplace source 升级整个 Pack。

仓库发布 3 个插件：`repo-doctor`、`productivity-toolkit`、`skill-maintainer`。Document Data Doctor 没有独立插件。

## ChatGPT ZIP 与 Codex

带版本的 ZIP 是 ChatGPT 上传包。不要把 ZIP 文件名传给 `codex plugin marketplace add`，也不要把“直接导入 ZIP”写成受支持的 Codex 插件安装方式。

Codex 使用仓库已验证的两条路径之一：

1. 从固定 tag 的 marketplace source 安装完整插件；
2. checkout 可信 tag，运行 `npm run build`，再按宿主文档从 `dist/codex-zh-CN/skills/<slug>/` 使用生成的单 Skill 目录。

稳定版 marketplace source：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.5.1
```

只用于测试最新 `main` 的开发版 source：

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

当前 Codex CLI 的 Git marketplace source 支持 `--ref`。

<a id="verify-release-metadata"></a>
## 校验 Release Manifest 与 SHA-256

下载所选 ZIP 和正式元数据资产：

```bash
gh release download v0.5.1 \
  -R dss-time/repo-doctor-skills \
  -p 'rd-repo-doctor-router-v0.5.1.zip' \
  -p 'Repo-Doctor-Skills-v0.5.1-RELEASE_MANIFEST.txt' \
  -p 'SHA256SUMS-v0.5.1.txt'
```

`SHA256SUMS-v0.5.1.txt` 覆盖全部 37 个 Skill ZIP。如果本地只下载了一个 ZIP，可核对对应行：

```bash
expected=$(awk '$2 == "rd-repo-doctor-router-v0.5.1.zip" { print $1 }' SHA256SUMS-v0.5.1.txt)
actual=$(shasum -a 256 rd-repo-doctor-router-v0.5.1.zip | awk '{ print $1 }')
test -n "$expected" && test "$expected" = "$actual"
```

完整验证远程 Release：

```bash
npm run release:verify-remote -- --tag v0.5.1
```

验证器会把真实 Release 下载到操作系统临时目录，核对远端资产列表和 GitHub 摘要、Manifest、SHA-256、所有 ZIP、Skill 身份和双语内容，并拒绝不安全路径、仓库/构建残留和凭证模式；结束后删除临时目录。网络失败返回 `BLOCKED_NETWORK`，绝不伪造 PASS。

## 固定版本、升级与避免冲突

- 稳定使用固定到 `v0.5.1`；只有明确测试开发内容时使用 `main`。
- 升级前记录已安装的插件或单 ZIP，并验证替换资产。
- 通过宿主支持的界面替换同一 Skill 的旧版本，不要长期保留并行副本。
- 除非宿主明确记录优先级且已经核验，否则不要同时安装插件和具有相同 canonical slug 的手工 Codex Skill。
- 不修改 ZIP 内部名称或 canonical slug。ChatGPT 发布名称带 `rd-`、`pt-` 或 `sm-`；Codex 插件调用使用 canonical slug。
- 安装或升级后新建任务，避免复用旧任务的发现快照。

从 v0.4.0 升级不需要迁移 prompt 或重命名 Skill。本 patch 只改变文档、版本固定和 Release 验证。
