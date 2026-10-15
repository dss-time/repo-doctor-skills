# Repo Doctor Skills v0.8.0 正式稳定发布

准备日期：2026-10-15。Tag：`v0.8.0`。本版为正式稳定版。

## 真实模型评测

Live-model 状态：**PASS，328/328**，使用 GPT-6.1 Sol low。覆盖205 项核心用例、44 个双语工作流步骤、65 项模式/判定和 14 项权限用例。v0.7.3 结果仅为历史证据，不复用。本版不使用评测豁免。全部用例记录实际模型，未观察到模型切换或权限越界。初始核心尝试在 159 项通过后遇到服务额度限制；核验版本、模型、用例和 Skill 哈希不变后补齐剩余 46 项，保留原尝试。评测器未使用额度重置券。

## 更新内容

- 新增 `feature-implementation` 承接已确认功能规格及已授权配套测试/文档；功能交付流程使用新入口，局部缺陷继续使用 `safe-fix-implementation`。
- 精简 Router、需求澄清、仓库入门和项目体检的重复输出，取消问题数量下限，保留证据和详细模式。
- 发布检查的命令权限/风险与预检本地验证对齐；最小修复具备条件时必须真实验证。
- 增加双语交付样例及人工阻塞指引：操作位置、具体动作、成功标志、恢复步骤，不收集秘密值。
- 共 41 个 Skill，Repo Doctor Pack/插件 0.10.0 包含 28 个，独立 ChatGPT ZIP 为 38 个；Recommended 保持 7 个。

## 验证范围

真实模型用例在隔离空工作区检查路由、合成工作流产物、声明的模式和权限边界，不代表生产任务效果、token 节省比例或所有模型/平台组合。确定性打包、安装、文档及 CI 检查仍须通过。不发布凭据原值或批量模型全文。

## 发布后安装

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill '*' -a codex
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.8.0
codex plugin add repo-doctor@repo-doctor-marketplace
```

同一 Agent 选择一种方式。GitHub Release 包含 38 个独立 ZIP 和三个元数据/校验文件。

## npm 安装

npm 包 `repo-doctor-skills@0.8.0` 已于 2026-10-15 补充发布，`latest` 指向 0.8.0。

```bash
npx repo-doctor-skills@0.8.0 install --agent codex
npx repo-doctor-skills@0.8.0 install --preset full --agent codex
```

第一条安装推荐的 7 个 Skill，第二条安装全部 41 个，均使用用户级 Codex Skills 目录。

[真实模型报告](https://github.com/dss-time/repo-doctor-skills/blob/v0.8.0/tests/reports/live-codex-skill-validation-0.8.0.md)
