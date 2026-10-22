# Repo Doctor Skills v0.8.1 — 正式稳定版

准备日期：2026-10-22。Tag：`v0.8.1`。正式稳定版本。

## 真实模型评测

Live-model 状态：**PASS，328/328**。新的 GPT-6.1 Sol low 评测覆盖 328 个唯一用例：205 项核心、44 个双语工作流步骤、65 项模式/判定及 14 项权限用例。v0.8.0 报告保留为历史证据，不复用；不使用豁免。

## 修改内容

- Skill 安装失败时回滚本批次修改；恢复失败时保留备份和恢复路径。
- 分离日常一致性与正式发布门禁，将新评测及续跑资格绑定到 canonical 源码与完整 Skill 运行文件。
- 统一测试优先的新功能交付、已诊断局部修复、需求澄清、规格和规划的职责路由。
- 为单独安装的 Skill 配齐工作流注册表、共享测试规则，明确已授权临时清理和原型转交边界。
- 扩展 npm 关键词，保留 `skills` 并加入 `workbuddy`；补充 WorkBuddy 通用 Skill 导入说明，尚未实机验证 WorkBuddy 安装和执行。
- 提供 41 个 Skill，其中 Repo Doctor Pack/plugin 0.10.1 包含 28 个；三个插件共提供 38 个独立 ChatGPT ZIP。推荐安装仍为 7 个。

## 验证范围

真实模型评测在隔离空工作区验证路由、合成工作流、模式和权限边界，不证明所有真实任务效果或所有模型/平台兼容。历史报告保留不变；打包、安装、文档与 CI 仍需独立验证。

首次进阶尝试在报告保存前遇到 120 秒服务超时。额度恢复后保留核心证据，将进阶并发降为 4、超时上限调整为 180 秒，并逐项保存检查点。报告数量表示已验证的唯一用例；中断尝试单独记录，不计入已验证证据。

## 安装

GitHub 发布后：

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill '*' -a codex
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.8.1
codex plugin add repo-doctor@repo-doctor-marketplace
```

同一 Agent 选择一种安装方式。GitHub Release 包含 38 个独立 ZIP 和 3 个元数据/校验文件。npm 发布状态单独记录，GitHub Release 不会自动更新 npm。

[真实模型报告](https://github.com/dss-time/repo-doctor-skills/blob/v0.8.1/tests/reports/live-codex-skill-validation-0.8.1.md)

## 外部发布状态

GitHub v0.8.1 及 [npm repo-doctor-skills@0.8.1](https://www.npmjs.com/package/repo-doctor-skills/v/0.8.1) 均已发布。npm 发布最初遇到服务错误，重新完成 CLI 登录及网页验证后，于 2026-10-22 发布成功。CLI 入口采用 npm 规范路径，实际压缩包通过推荐 7/7 及完整 41/41 安装验证。首次 GitHub CI 的注册表超时已通过离线 tarball 验证修复，main 和 tag CI 均通过。新的 328/328 模型评测结果保持不变。

```bash
npx repo-doctor-skills@0.8.1 install --agent codex
npx repo-doctor-skills@0.8.1 install --preset full --agent codex
```
