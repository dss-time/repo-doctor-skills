# Repo Doctor v0.12.0 正式版候选

[English](RELEASE_NOTES_0.12.0.md)

当前公开稳定版为 v0.11.1。正式发布门禁仍要求本版本绑定的真实模型和独立协调审查通过。

- 用自然语言提交有边界的开发需求。适用的可写 Skills 可以比较本地 Git 基线与最终工作区，报告已有修改、范围偏移和受保护路径。
- 恢复检查点时，由宿主核对检查点之后观测的失败并确认历史完整。未解决失败须等到合格复验或证实输入变化后才可解除。重试授权绑定本次导入及工作树。可选条件变化也不会清除阶段失败。
- npm CLI 使用项目版本 0.12.0。工程 Pack 与 Codex 插件采用独立版本 0.14.0。隔离本地试用不产生公开版本或标签。
- 六个 Agent 已有安装验证。Codex 已观测宿主自动调用和报告处理，其他宿主的实际执行仍未验证。Guard 报告基于 Git 可见变化，业务仍需实际测试。

[安装和升级](AGENT_COMPATIBILITY.zh-CN.md) · [使用案例](guides/repo-doctor-scenarios.zh-CN.md) · [Benchmark](TESTING_AND_EVALUATION.zh-CN.md)
