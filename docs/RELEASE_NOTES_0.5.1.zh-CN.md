# Repo Doctor Skills v0.5.1 正式稳定版

> 发布日期：2026-08-10。该正式非预发布版本使用 `v0.5.1` tag，是 Repo Doctor 执行效率工作的首个正式发布版本。

## 发布谱系

不可变的 `v0.5.0` tag 包含原定 Skill 行为，但其 clean-checkout CI 因 build-integrity 测试在 build 步骤前读取被忽略的 `dist/` 产物而失败，因此 v0.5.0 没有创建 GitHub Release。该历史 tag 不删除、不重写。v0.5.1 保持相同 Skill 行为，只增加测试侧 clean-build 隔离修复：integrity 测试现在在临时目录生成并检查 canonical Codex 产物。

项目版本是 0.5.1。Repo Doctor Pack/插件保持 0.8.0，`safe-fix-implementation` 保持 0.2.0；其他组件版本均不变。4 个 active Pack 和 40 个 active Skill 仍全部为 `beta`。

## 包含能力

- 全部 27 个 Repo Doctor Skill 的 canonical `fast`、`standard`、`audit` 执行 profile；
- Simple Request Bypass 与紧凑 fast-mode 响应；
- 生成式 implicit invocation policy；
- 单主 Skill 行为与禁止自动 Skill 串联；
- 渐进式参考加载；
- 更紧凑的 Router 选择与 handoff；
- 覆盖 20 个简单场景和 10 个高强度场景的 30 条性能契约；
- 支持 resume、matched-pair、有限传输重试和真实证据记录的 Benchmark harness；
- Codex build-integrity 检查的 clean-checkout CI 隔离。

## Benchmark 证据

最终对比完成 **30/30** 组 baseline/optimized 配对案例：20 个简单、10 个高强度、15 个英文、15 个简体中文。Baseline correctness 为 **27/30**，optimized correctness 为 **30/30**：

- 27 个 PASS/PASS；
- 3 个 FAIL/PASS；
- 0 个 PASS/FAIL 回归；
- 0 个 FAIL/FAIL。

Safety、permission、database、双语、无回归、简单执行有界和重量级显式调用门禁全部通过。

30 案例对比及有界当前候选 smoke 的 Live-model 验证状态为 **PASS**。

版本化候选 smoke 中，英文 release-readiness 与中文 database-safety 首次在 180 秒传输上限内没有产生可用结果；只重跑这两个缺口并使用已披露的 300 秒恢复上限后，分别在 208,272 ms 和 191,700 ms 得到 PASS。Prompt、Skill、模型、reasoning effort 和断言均未改变。

v0.5.1 优先改善任务正确率、调用边界和执行可靠性；本轮 Benchmark **未证明**延迟或工具调用数量下降。简单请求中位延迟变化为 **+2.89%**，P75 延迟为 **+4.13%**，工具调用中位数为 **+33.33%**。不得将本版本描述为“提速 30%”或“显著降低运行时间”。

最终报告记录 baseline 2 次、optimized 8 次传输重试/超时，耗尽案例为零；超时尝试不计入延迟汇总。两个长耗时 optimized 案例使用了明确披露的 300 秒恢复超时上限，prompt、模型、reasoning effort、并发、重试次数和断言均未改变。完整证据见 `tests/reports/live-performance-comparison.json` 及其 Markdown 版本。

此前 317/317 次调用报告仍作为 v0.4.0 历史证据保留，不冒充为 v0.5.1 新执行全集。

## 安装或升级

稳定版 Codex marketplace 安装：

```text
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.5.1
```

只有明确测试开发内容时才使用 `--ref main`。刷新或替换 marketplace source 后，按宿主要求重新安装或刷新所选插件，并开启新任务重新发现 Skill。

独立 ChatGPT Skill 用户应下载对应 `*-v0.5.1.zip`，使用 `SHA256SUMS-v0.5.1.txt` 验证后再替换旧上传包。参见[发布资产选择指南](guides/release-asset-selection.zh-CN.md)。

## 发布资产与验证

本次发布包含 37 个带版本号的独立 Skill ZIP，以及：

- `Repo-Doctor-Skills-v0.5.1-RELEASE_NOTES.md`；
- `Repo-Doctor-Skills-v0.5.1-RELEASE_MANIFEST.txt`；
- `SHA256SUMS-v0.5.1.txt`。

发布后使用以下命令验证真实远程 GitHub Release 资产：

```text
npm run release:verify-remote -- --tag v0.5.1
```

正式门禁包括 schema、Skill、workflow、activation、性能契约、完整测试、确定性构建、clean checkout、文档、质量、发布元数据、Doctor、生成物漂移、敏感内容、ZIP 完整性、远程资产和隔离 Codex smoke 检查。
