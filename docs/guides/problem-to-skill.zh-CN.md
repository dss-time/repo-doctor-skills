# 问题 → Skill

问题明确时直接调用对应 Skill；只有拿不准时才使用 Router 兜底。

## Bug

- **问题：** 运行失败、行为错误、超时或偶发 500，需要先确认根因。
- **Skill：** `$bug-root-cause-analysis`
- **说明：** 在提出修复前，复现并追踪非 CI 运行故障。
- **最短示例：** `$bug-root-cause-analysis — 这个接口偶尔返回 500，请查明根因，不要修改文件。`

## 修改代码

- **问题：** 一个已确认、范围明确的生产代码问题可以开始修复。
- **Skill：** `$safe-fix-implementation`
- **说明：** 在授权范围内做最小修改，并执行与风险相称的验证。
- **最短示例：** `$safe-fix-implementation — 修复 src/parser.ts 中已确认的空值检查；已授权修改这个文件。`

## 代码审查

- **问题：** 需要审查一个 diff 或明确代码范围，但不修改文件。
- **Skill：** `$safe-code-review`
- **说明：** 保持只读，只报告有证据支持的缺陷和风险。
- **最短示例：** `$safe-code-review — 只审查当前 diff，不要修复。`

## 需求不清

- **问题：** 产品、兼容性、安全、数据或发布方式仍有重大未决选择。
- **Skill：** `$requirements-clarification`
- **说明：** 只追问会实质改变工作的关键问题。
- **最短示例：** `$requirements-clarification — 修改登录流程前，先澄清必须决定的事项。`

## 需求转规格

- **问题：** 决策已经确定，但还缺少可测试的实施规格。
- **Skill：** `$requirements-to-spec`
- **说明：** 把已确认需求转成边界明确、可验证的规格。
- **最短示例：** `$requirements-to-spec — 把这些已确定的需求整理成验收标准和约束。`

## 验证方案

- **问题：** 一个设计、交互、状态或业务逻辑选择需要可运行证据。
- **Skill：** `$decision-prototype`
- **说明：** 用一次性原型支持决策，不进入生产实施。
- **最短示例：** `$decision-prototype — 用一次性原型比较这两种重试策略。`

## 架构越来越难改

- **问题：** 重复的调用方负担、耦合或适配代码需要有证据的改进方案。
- **Skill：** `$architecture-deepening-analysis`
- **说明：** 分析架构摩擦、方案和迁移风险，但不直接重构。
- **最短示例：** `$architecture-deepening-analysis — 分析为什么增加一个 provider 要改五个模块，不要重构。`

## 准备发布

- **问题：** 一个明确候选版本需要有证据支持的发布门禁结论。
- **Skill：** `$release-readiness-check`
- **说明：** 返回 GO、带条件 GO 或 NO-GO，不执行发布。
- **最短示例：** `$release-readiness-check — 检查当前提交的 v1.4.0 是否可以发布。`

## 不知道选哪个

- **问题：** 不确定下一步 Skill 或执行模式。
- **Skill：** `$repo-doctor-router`
- **说明：** 推荐一个 active Skill 和 `fast`、`standard` 或 `audit`，但不执行。
- **最短示例：** `$repo-doctor-router — 这个接口偶尔返回 500，我该先排查还是直接修改？`
