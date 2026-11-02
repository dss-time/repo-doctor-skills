# Repo Doctor Skills v0.9.0-beta.1 — Beta 发布候选

准备日期：2026-11-02。计划 tag：`v0.9.0-beta.1`。本版属于 Beta 预发布候选，发布状态以 GitHub Releases 为准。

本候选完整 Live-model 路由评测状态为 **UNKNOWN**；历史 328 项 PASS 不证明本版。另有绑定当前源码与运行时的协调能力真实试运行，作为 Beta 必需门禁，不冒充完整语料评测，也没有使用豁免。

新增基于既有 Registry 的串行协作、Task Context v2、证据有效性、风险义务、条件推进与安全恢复。修复失败写入重试、中断跳过、旧检查点回放、操作范围变化后错误完成、只读模式要求写权限，以及未知证据误判。单独 Skill 的安装与使用继续保留。

Repo Doctor Pack/插件为 0.11.0；保留 41 个 active Skill、13 条工作流、38 个插件 ZIP。变化的 Skill 契约独立提升补丁版本。

查看[候选验证记录](WORKFLOW_COORDINATION_BETA_VALIDATION.md)和机器报告 `tests/reports/coordination-release-0.9.0-beta.1.json`。报告缺失、来源过期、权限越界或独立审查阻塞都会阻止候选通过。

真实试运行宿主先加载 Skill，禁止 Shell 的阶段移除原生 Shell 工具，并核对实际工具事件；各阶段使用独立 CLI 会话与合成项目。未证明同 Agent 自动编排、所有外部 MCP 工具的沙箱能力、Claude Code/Cursor 原生执行、多 Agent 并行或生产安全。

v1 上下文属于未发布原型，须经明确复核重建为 v2；不自动信任旧检查点。没有新旧匹配效率比例。计划中的正式操作应为 prerelease／npm beta，不更新现有稳定分发。
