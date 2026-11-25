# Repo Doctor 0.12.0 发布草案

[English](RELEASE_NOTES_0.12.0_DRAFT.md)

**发布判定为 NO-GO。** 包元数据与稳定版安装指引仍指向 0.11.1。

## 改动

- Change Guard 将 Git 可见的修改与工作树绑定的私有基线比较，报告已有改动被触及、范围偏移、受保护路径和未知覆盖。
- 本地验证修复了模式与类型的重复提示、符号链接路径影响其他覆盖，以及大小写不敏感文件系统中的范围和保护路径别名。
- 功能实现、安全修复、安全测试和文档同步共享内置 Guard 入口，在风险、授权和宿主能力允许时可自动调用。运行时不可用时，保留未知覆盖并继续人工检查。
- 验证凭据绑定工作树。旧凭据仍可读取，复用前需要重新观测。

## 兼容性和限制

仓库、npm 包、命令、插件和 Skills 保留既有标识。Guard 运行时由源码 CLI、本地 npm 包、上述单装 Skills 和 Codex Plugin 提供。报告保留未知来源，项目代码和 Git 索引保持原状。忽略路径、隐藏索引项、子模块内部修改及短暂并发变更可能遗漏。

## 发布门禁

修订冻结候选通过 Linux、macOS、Windows 的 Node 18 与 LTS 矩阵，以及独立 Linux 质量门禁。修复了 Windows 工作树根目录和大小写别名判定。独立 0.12.0-beta.1 本地包通过打包和 macOS Node 18、24 升级。公开稳定安装仍指向 0.11.1。 [候选绑定证据](../tests/reports/change-guard-0.12.0-release-validation-2026-11-25.json)

## 试用范围

本地试用为 GO。原模型补跑三案均完成自然语言触发和结果检查，包括此前漏触发的公共模块。受保护路径规则命中时仍需核对授权。公开 Beta、RC 与 Stable 的判定见专项记录。宿主 Hook 尚未经实跑。 [实测与边界](research/change-guard-integration.md#0120-local2-跨平台和模型实测)

六个 Agent 的项目级与个人级安装及内置运行时单测通过。只有 Codex 有当前候选的宿主调用和自然语言观测。公开 Beta 和 RC 仍为 **BLOCKED**，Stable 为 **NO-GO**。 [Beta 验收](RELEASE_NOTES_0.12.0-beta.1.zh-CN.md)
