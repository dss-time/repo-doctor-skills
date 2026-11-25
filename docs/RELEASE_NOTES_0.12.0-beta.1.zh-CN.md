# Repo Doctor 0.12.0-beta.1

[English](RELEASE_NOTES_0.12.0-beta.1.md)

尚未发布的本地候选版本。计划标签 `v0.12.0-beta.1` 尚未创建。完整 Live-model 路由准确率为 **UNKNOWN**。稳定安装仍指向 0.11.1。

像往常一样描述修改内容、范围和必须保留的行为。适用的可写 Skills 共享本地 Git 基线和报告，覆盖已有修改、范围外路径、依赖变化和受保护文件。报告用于复核并保留未知覆盖。业务行为仍由测试验证。34 个公开 Skills 均保留。

冻结源码提交通过 Linux、macOS 和 Windows 七项矩阵作业。独立构建的 npm Beta 在 macOS 上用 Node 18 和 24 通过从 0.11.1 升级的检查。Skills CLI 1.9.0 验证了六种 Agent 的项目级和个人级安装。Codex 的宿主自动调用及边界见 Benchmark。 [跨平台和产物证据](../tests/reports/change-guard-0.12.0-release-validation-2026-11-25.json) · [安装与本地试用](AGENT_COMPATIBILITY.zh-CN.md)

**公开 Beta 为 BLOCKED。** 未知外部依赖后来取得值时，已观察失败仍阻塞后续执行与交付，直至获得符合契约的复验或真实输入变化。修订候选的简单任务和协调工作流通过。新的独立审查发现从较早检查点恢复时可能漏掉后续失败，已确认复现，公开门禁继续关闭。RC 为 **BLOCKED**，Stable 为 **NO-GO**。 [修订候选验收](../tests/reports/coordination-0.12.0-beta.1-p1-retest-2026-11-25.json) · [本地 Codex Beta 试用](LOCAL_CODEX_BETA.zh-CN.md)
