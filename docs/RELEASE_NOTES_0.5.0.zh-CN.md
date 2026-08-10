# Repo Doctor Skills v0.5.0 未发布标签候选版

> 历史状态：不可变的 `v0.5.0` tag 创建于 2026-08-07，但 clean-checkout tag CI 因 build-integrity 测试依赖被忽略的 `dist/` 产物而失败。v0.5.0 没有发布 GitHub Release 或任何正式资产；该 tag 原样保留，不删除也不移动。请改用 v0.5.1。

## 主要变化

- 为全部 27 个 Repo Doctor Skill 增加 canonical `fast`、`standard`、`audit` 执行模式。
- 增加 Simple Request Bypass、渐进式参考加载、单主 Skill 路由、聚焦验证、紧凑 fast 输出，并默认禁止自动 Skill 串联。
- 从 canonical metadata 生成 `policy.allow_implicit_invocation`；重量级、专项、Router、原型、ADR 和 handoff 入口要求显式调用。
- 增加 30 条性能契约，覆盖 20 个简单请求和 10 个高强度请求，中英文各 15 条。
- 改进 `safe-fix-implementation` 对明确低风险编辑的显式激活，同时保留仅测试修改与仅文档修改的独立边界。

项目版本提升到 0.5.0。Repo Doctor Pack/插件因执行与 activation 契约变化提升到 0.8.0；`safe-fix-implementation` 因公开 activation 描述变化提升到 0.2.0。其他 Pack、插件和 Skill 版本保持不变。4 个 active Pack 和 40 个 active Skill 仍全部为 `beta`。

## 真实性能验证

最终对比完成 **30/30** 组 baseline/optimized 配对案例：20 个简单、10 个高强度、15 个英文、15 个简体中文。正确率由 baseline 的 **27/30** 提升到 optimized 的 **30/30**，矩阵如下：

- 27 个 PASS/PASS；
- 3 个 FAIL/PASS；
- 0 个 PASS/FAIL；
- 0 个 FAIL/FAIL。

双语、权限、安全、无回归、简单执行有界和重量级显式调用门禁全部通过。optimized 契约修复了 baseline 在数据库迁移审查、发布就绪和明确低风险编辑请求上的失败。

本次 30 案例对比的 Live-model 验证状态为 **PASS**。

测量结果**不支持**“简单请求提速 30%”的说法。简单案例的中位延迟变化为 +2.89%，P75 延迟为 +4.13%，工具调用中位数为 +33.33%，P75 工具调用为 +25.00%，输出中位数为 +2.33%，P75 输出为 -6.00%。完整测试、完整构建和自动串联次数仍为零。本次发布依据是正确率与有界执行行为，不是测得的速度提升。

最终机器可读报告记录 baseline 2 次、optimized 8 次传输重试/超时，耗尽案例为零；超时尝试不计入延迟汇总。两个长耗时 optimized 案例使用了明确披露的 300 秒恢复超时上限，prompt、模型、reasoning、并发、重试次数和断言均未改变。完整证据见 `tests/reports/live-performance-comparison.json` 及其 Markdown 版本。

此前 317/317 次调用报告仍作为 v0.4.0 历史证据保留，不冒充为 v0.5.0 新执行全集。

## 安装或升级

稳定版 Codex marketplace 安装：

```text
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.5.0
```

只有明确测试开发内容时才使用 `--ref main`。刷新或替换 marketplace source 后，按宿主要求重新安装或刷新所选插件，并开启新任务重新发现 Skill。

独立 ChatGPT Skill 用户应下载对应 `*-v0.5.0.zip`，使用 `SHA256SUMS-v0.5.0.txt` 验证后再替换旧上传包。参见[发布资产选择指南](guides/release-asset-selection.zh-CN.md)。

## 发布资产与验证

本次发布包含 37 个带版本号的独立 Skill ZIP，以及：

- `Repo-Doctor-Skills-v0.5.0-RELEASE_NOTES.md`；
- `Repo-Doctor-Skills-v0.5.0-RELEASE_MANIFEST.txt`；
- `SHA256SUMS-v0.5.0.txt`。

Manifest 与校验和文件由最终 tag 内容生成。发布后，远程验证器会下载并检查真实 GitHub Release 资产：

```text
npm run release:verify-remote -- --tag v0.5.0
```

正式发布门禁包括 schema、Skill、workflow、activation、性能契约、完整测试、确定性构建、文档、质量、发布元数据、Doctor、生成物漂移、敏感内容、ZIP 完整性和远程资产检查。
