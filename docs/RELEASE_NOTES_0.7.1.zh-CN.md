# Repo Doctor Skills v0.7.1 正式稳定发布

发布日期：2026-10-12。Tag：`v0.7.1`。

## 更方便的安装

首推 `npx skills@latest add dss-time/repo-doctor-skills`，按提示选择 Skill 和 Agent。单项安装使用 `--skill safe-code-review`；为 Codex 完整安装使用 `--skill '*' -a codex`；加 `-g` 可在所有项目使用。已测试 Node 24 与 skills CLI 1.7.2。

Codex 也可运行 `codex plugin marketplace add dss-time/repo-doctor-skills`，再运行 `codex plugin add repo-doctor@repo-doctor-marketplace` 安装 27 个工程 Skill。同一 Agent 选择插件或复制 Skills 其中一种，避免重复。原安装器仍提供 preset 和单语言选项。

## 验证与发布状态

真实外部安装器已在临时项目中完成单项和全部 40 个 Skill 安装。149 个安装文件与候选分发完全一致，包含资源和调用策略。仓库测试新增完整资源一致性与安装入口检查。

Skill 正文、slug、权限策略、组件版本以及 37 个 ZIP / 40 个资产契约均沿用 v0.7.0；本补丁不声称模型表现提升。

Live-model 状态为 **PASS，317/317**，来自本次 v0.7.1 新报告：200 项核心用例、44 个双语工作流步骤、61 项执行模式/判定用例和 12 项权限边界用例。没有使用 v0.4.0 历史结果满足门禁。首次高级尝试遇到服务额度限制，后续尝试出现 9 项服务容量错误；这些报告均保留。针对性重试验证了未改动的 Skill 哈希，沿用相同断言，最终全部通过。没有使用重置券或发布豁免。

验证器复用宿主认证；被测试的 Skill 文件位于临时安装中，发现阶段也可能看到宿主能力元数据。该语料检查结构化路由、工作流产物、模式和声明的权限边界，不衡量生产任务效果、token 节省或延迟改善。
