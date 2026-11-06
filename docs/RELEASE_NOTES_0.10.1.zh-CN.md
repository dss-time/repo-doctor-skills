# Repo Doctor Skills 0.10.1

稳定版文档补丁，日期为 2026-11-06，Tag 为 `v0.10.1`。

## 修改内容

- 修正中英文 README 的发布状态，分别标明最终运行组件证据和历史开发阶段评测。
- 工作流协调说明更新为已发布的 Task Context v2 实现、Registry 版本 6、13 条工作流和 33 个 active Skills。
- 删除工作流手册中已过期的 Document Data Doctor Basic Skill 分发说明。
- 明确授权门禁复用范围内有效授权，仅对尚未覆盖、范围扩大或另有限制的操作补充请求授权。
- 通过 npm 补丁包发布修正后的 README，并更新稳定版安装示例。

## 验证依据

复用 0.10.0 的 Live-model PASS 证据，284/284 个案例在 gpt-6.1-terra 上通过。实际单点修改、协调恢复和独立核心审查证据同样来自 0.10.0，原报告保留原版本。

tests/reports/release-promotion-0.10.1.json 记录来源标签与提交、完整 Skill 源码和运行内容、安装器与 CLI 字节、除版本外的包元数据及原报告摘要。本地文档、发布元数据及安装包检查验证本次补丁。

评测覆盖已记录的隔离场景和宿主适配器。真实生产系统及更多客户端、硬件集成需要对应验证。

## 安装

```sh
npx repo-doctor-skills@0.10.1 install --agent codex
npx repo-doctor-skills@0.10.1 install --preset full --agent codex
```

## 已有安装升级

重复安装替换选中的同名 Skill，内容相同则跳过。从 0.10.0 之前的版本升级时，requirements-to-spec 的任务改用 requirements-clarification，spec-to-work-items 的任务改用 safe-change-plan。合并入口和已删除的 PDF、Word、Excel Skill 旧目录需要检查本地自定义内容后手动清理。
