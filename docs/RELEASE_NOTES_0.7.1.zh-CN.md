# Repo Doctor Skills v0.7.1 正式稳定发布准备

2026-10-12 准备，目标 tag 为 `v0.7.1`。本文件描述拟发布版本，尚未正式发布。

## 更方便的安装

首推 `npx skills@latest add dss-time/repo-doctor-skills`，按提示选择 Skill 和 Agent。单项安装使用 `--skill safe-code-review`；为 Codex 完整安装使用 `--skill '*' -a codex`；加 `-g` 可在所有项目使用。已测试 Node 24 与 skills CLI 1.7.2。

Codex 也可运行 `codex plugin marketplace add dss-time/repo-doctor-skills`，再运行 `codex plugin add repo-doctor@repo-doctor-marketplace` 安装 27 个工程 Skill。同一 Agent 选择插件或复制 Skills 其中一种，避免重复。原安装器仍提供 preset 和单语言选项。

## 验证与发布状态

真实外部安装器已在临时项目中完成单项和全部 40 个 Skill 安装。149 个安装文件与候选分发完全一致，包含资源和调用策略。仓库测试新增完整资源一致性与安装入口检查。

Skill 正文、slug、权限策略、组件版本以及 37 个 ZIP / 40 个资产契约均沿用 v0.7.0；本补丁不声称模型表现提升。

Live-model 状态为 **BLOCKED**。未改动的 v0.7.0 Skills 所需完整行为报告仍缺失；v0.4.0 历史结果与部分执行报告不能满足门禁。发布元数据已如实记录阻塞，不再声明 PASS。v0.7.1 没有豁免。发布准备时 npm 身份检查返回 E401。正式发布需要先解决这些阻塞，通过最终 Main 和 Tag CI，并验证公开资产。
