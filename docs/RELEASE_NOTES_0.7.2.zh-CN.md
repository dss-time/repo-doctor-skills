# Repo Doctor Skills v0.7.2 正式稳定发布

准备日期：2026-10-14。Tag：`v0.7.2`。本版为正式稳定版，从 v0.7.2-rc.1 晋升。

## 修改内容

- 发布检查先预检脚本、生命周期钩子和间接命令；阻塞不安全门禁，继续独立且安全的检查。
- Router 提供可复制的下一步请求，保留用户范围和缺失输入占位符。
- 双语 README 与手册说明安装位置、作用范围、更新方式，补齐项目理解、体检、CI 和安装排障入口。
- 插件与 ZIP 按 canonical 清单逐项比较，日常检查不再硬编码数量；发布快照检查仍保留。
- 保持 40 个 Skill、37 个 ChatGPT ZIP 和现有 slug。Repo Doctor Pack/插件为 0.9.1；Router 为 0.2.2；发布检查为 0.1.2。

## 验证范围

本版本 Live-model 状态为 **UNKNOWN**。按维护者要求，仅做工作流、UX、doctor、文档、发布元数据、Schema 与生成一致性的定向验证，未运行完整本地测试或 317 次模型评测。旧版证据不作为本版 PASS 证据。推送可能触发仓库已有的离线 CI；不会新建真实模型评测。

2026-10-14 核验时，v0.7.1 提交已在 main，但没有远程标签或 GitHub Release。已有标签均保留。本次不发布 npm。

## 安装

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.7.2
codex plugin add repo-doctor@repo-doctor-marketplace
```

同一 Agent 选择一种安装方式，安装后新建任务。GitHub 正式发布提供独立 ChatGPT ZIP 和 SHA-256 校验文件。

## 明确授权的评测例外

维护者明确要求“跳过317 次真实模型评测发布正式版本”。本次仅对 v0.7.2 豁免该项评测，状态保持 UNKNOWN，不声称 PASS；其他发布检查保持不变。Skill 正文与 v0.7.2-rc.1 相同。详见[版本限定例外记录](https://github.com/dss-time/repo-doctor-skills/blob/v0.7.2/docs/RELEASE_WAIVER_0.7.2.md)。
