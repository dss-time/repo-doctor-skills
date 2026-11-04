# v0.9.0-beta.2 验证记录

验证运行跨 2026-11-03 至 2026-11-04，时区为 Asia/Shanghai。

本版 Live-model 状态为 PASS，328/328。

## 已完成的本地验证

- macOS、Node 24.19.0、Codex CLI 0.166.0-alpha.5.1。
- `npm run validate` 通过，包含 41 个有效 Skill、1 个模板、5 个 Pack Schema 和 13 条工作流。
- `npm test` 通过，覆盖完整工程套件、安装器默认覆盖、失败回滚、npm 离线 tarball 和文档。
- 协调回归 61/61 通过，原有六项对抗审查回归通过。
- 新增环境未知失败回归，在独立副本恢复原缺陷后确实失败，退出码为 1。
- 双语完整性 41/41、平台产物 7/7、ChatGPT ZIP 38/38 通过。
- 最终源码连续两次构建的 10 组生成树指纹一致，指纹包含文件内容与执行位。
- 性能基准 prepare-only 通过，历史基线 40 项、当前 41 项，28 个工程 Skill 包含 feature-implementation。

## 真实模型执行记录

初次单用例连接探针通过，安装发现为 41/41。探针报告按完整评测标准返回不完整结果，保留在 attempts 下。

首次核心评测因独立审查发现 P1 发布阻塞问题而主动中断。审查复现了已核验失败测试在环境字段缺失后可能允许交付的问题。失败报告和中断记录完整保留，修复后重新构建并重新启动最终源码全量评测。

修复让已核验失败的未知状态继续以 evidence_insufficient 阻止依赖执行与交付。双语协议明确该行为，新增回归包含执行前和交付前两个场景，并验证已证实环境变化时仍按过期证据处理。

第二次独立核心审查又复现了重试接受之前尝试凭据的 P1 问题和环境缺失与依赖变化的判定顺序问题。已修复 execution_attempt 校验和失效优先级，新增两项回归在分别恢复原缺陷的独立副本上均失败，退出码为 1。

模型服务随后返回账户额度限制，提示北京时间 18:52 后重试。对应阻塞报告保留，最终全量评测需在额度恢复后完成。

进一步审查指出任务决策或验收变化不应清除观测输入未变的失败。已移除该过滤条件，回归覆盖决策和验收变化前的执行与交付。

首次分支 CI 的 Linux、macOS、质量门禁通过。Windows 在读取 CRLF frontmatter 时失败，新增 .gitattributes 统一文本为 LF 后，分支 CI 全部通过。

- 成功运行 https://github.com/dss-time/repo-doctor-skills/actions/runs/41604748380
- 对应提交 2821fe7729ce22d1ab1e4c7dfa48beec0956f8fa
- 六个系统/Node 组合和完整质量门禁均通过。

最终独立核心审查通过现有 Beta 门禁，无 P0/P1，保留一个非阻塞 P2。依赖覆盖不完整时，已证明输入变化仍可能被归为未知，导致恢复被保守阻塞。审查原文保留在 tests/reports/coordination-live-5S4dph/report.json。

最终源码的串行协作门禁已通过，报告为 tests/reports/coordination-release-0.9.0-beta.2.json。它组合三份相同源码绑定的真实记录，分别覆盖简单修改、串行测试工作流与独立核心审查。早期失败报告继续保留。

最终源码核心真实模型评测为 PASS，205/205，实际模型均为 gpt-6.1-sol，推理强度 low，权限越界为 0。报告为 tests/reports/live-codex-core-validation-0.9.0-beta.2.json。完整高级评测已通过，总计 328/328，failed=0、blocked=0。


## 完整真实模型结论

- 完整报告为 tests/reports/live-codex-skill-validation-0.9.0-beta.2.json 及同名 Markdown。
- 205 项核心、44 个双语工作流步骤、65 项模式/判定、14 项权限全部通过。
- 高级评测先因额度限制停于 223/328，通过项未改写。原报告保留在 tests/reports/attempts/live-codex-0.9.0-beta.2-advanced-quota.json。
- 2026-11-04 从检查点恢复，核对同版本、同模型、同评测器和完整源码/运行时绑定，复用完整通过的工作流并补齐剩余项。
- 正式发布门禁同时要求完整模型报告与当前串行协作报告。
