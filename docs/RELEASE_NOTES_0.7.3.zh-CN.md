# Repo Doctor Skills v0.7.3 正式稳定发布

准备日期：2026-10-15。Tag：`v0.7.3`。本版为正式稳定版。

## 真实模型评测

Live-model 状态为 **PASS，317/317**。模型 **GPT-6.1 Sol**，推理强度 **low**，Codex CLI **0.162.0-alpha.17.2**。覆盖 200 项核心用例、44 个双语工作流步骤、61 项模式/判定和 12 项权限用例。每个通过用例均记录实际模型和 token 用量；没有观察到模型切换或权限越界。本版不使用评测豁免。

首次 Astra 尝试按维护者选择停止，不复用其结果。Sol 核心评测在 125 项通过后遇到额度限制；自然恢复后，核验模型、用例和 Skill 哈希未变化，再补齐 75 项。随后 117 项高级评测全部通过。原中断尝试保留于仓库，没有消耗额度重置券。

## 更新内容

- 评测器支持显式选择模型、核验实际模型，记录 token 数据和模型切换信息。
- 核心用例支持受限续跑，仅复用版本、模型、用例和 Skill 哈希一致的通过证据；语义失败不自动重试。
- 发布本版专属证据，同步中英文 README、版本政策和复现说明。
- 维持 v0.7.2 的 40 个 Skill、37 个 ChatGPT ZIP 和组件版本：Repo Doctor Pack/插件 0.9.1、Router 0.2.2、发布检查 0.1.2。

## 适用范围与发布检查

这组用例验证结构化路由、工作流产物、模式和声明的权限边界，不代表生产任务效果或所有模型/平台组合。隔离了 Skill 根、SQLite 状态和 Git 工作区；宿主认证和能力元数据仍可能可见。确定性发布检查及仓库已有 GitHub CI 同样适用。npm 包 `repo-doctor-skills@0.7.3` 已于 2026-10-15 补充发布，`latest` 标签指向该版本。

[完整评测报告](https://github.com/dss-time/repo-doctor-skills/blob/v0.7.3/tests/reports/live-codex-skill-validation-0.7.3.md)

## 安装

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.7.3
codex plugin add repo-doctor@repo-doctor-marketplace
```

同一 Agent 选择一种安装方式，安装后新建任务。Release 提供 37 个独立 ChatGPT ZIP 和三个元数据/校验文件。

## npm 命令安装

```bash
npx repo-doctor-skills@0.7.3 install --agent codex
npx repo-doctor-skills@0.7.3 install --preset full --agent codex
```

第一条安装推荐的 7 个 Skill，第二条安装全部 40 个，均写入用户级 Codex Skills 目录。同一 Agent 选择一种安装方式即可。
