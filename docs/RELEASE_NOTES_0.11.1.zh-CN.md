# Repo Doctor Skills 0.11.1

2026-11-21 发布的稳定非预发布文档补丁版本，标签为 `v0.11.1`。

## 变更

- 保留 0.11.0 的运行内容、Skill 源码、安装器和 CLI 行为。
- 补充 Codex、Claude Code、Gemini CLI、Kimi Code CLI、Qwen Code 和 Cursor 的统一 `npx skills` 安装入口。
- 说明 WorkBuddy 使用官方本地 Skill 导入边界，不猜测 WorkBuddy 专用安装参数。
- 明确安装格式兼容不等于宿主运行、权限、自动触发或多 Agent 行为已经验证。

## 验证

复用的 0.11.0 Live-model 验证为 PASS，289/289 个案例通过，绑定记录见 `tests/reports/release-promotion-0.11.1.json`。0.11.1 会运行发布元数据、文档、包和打包安装检查。本补丁只修改文档，不宣称重新完成大规模真实模型评测。

## 安装与升级

```sh
npx repo-doctor-skills@0.11.1 install --agent codex
npx repo-doctor-skills@0.11.1 install --preset full --agent codex
npx skills@latest add dss-time/repo-doctor-skills -a claude-code
npx skills@latest add dss-time/repo-doctor-skills -a cursor
```

选中的同名 Skill 会替换之前的副本，未选中的 Skill 会保留。WorkBuddy 用户应通过 WorkBuddy 官方 Skill 导入功能导入完整的本地 `skills/` 目录。
