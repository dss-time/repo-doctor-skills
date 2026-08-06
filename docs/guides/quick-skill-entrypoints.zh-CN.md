# Skill 快速入口

从你遇到的问题出发即可。以下示例使用 Codex 的 `$skill-name` 语法；其他平台请使用其原生 Skill 选择器，或把同一请求作为普通文本复制。

Repo Doctor 保持稳定 canonical 名称。由于 alias 行为无法在当前支持目标间可靠移植，本仓库不发布 alias frontmatter，也不复制一个 `$doctor` 包装 Skill。

## 我还没想清楚需求

```text
$requirements-clarification 使用 fast 模式。先检查仓库，只问会改变实施方向的 3～5 个关键决策。
```

## 我已经有规格

```text
$spec-to-work-items 把这份已确认规格拆成可独立验证的垂直工作项。
```

范围较小且影响已知时，可以使用 `$safe-change-plan`。

## 我需要拆任务

```text
$spec-to-work-items 把已确认规格拆成带依赖、验证和回滚说明的工作项。
```

## 我遇到了 Bug

```text
$bug-root-cause-analysis 使用 fast 模式。先建立可信成败信号，再复现并定位根因，不要修复。
```

workflow 或 runner 失败应改用 `$ci-failure-diagnosis`。

## 我想先验证方案

```text
$decision-prototype 使用 standard 模式构建最小非生产 UI 原型，判断这两个方向。
```

业务规则/状态问题使用 `logic-prototype`，交互或信息结构问题使用 `ui-prototype`。原型写入需要明确授权范围。

## 我需要写测试

```text
$safe-test-implementation 对一个外部可观察行为使用 test_first 和 standard 输出，只修改已授权测试范围。
```

还不知道保护哪个行为或边界时，先使用 `$test-gap-analysis`。

## 我需要审查代码

```text
$safe-code-review 使用 standard 模式，从 Repository Conformance、Change Intent Fidelity 和 Operational Safety 三轴审查这个 Diff，不要修复。
```

## 我担心架构越来越复杂

```text
$architecture-deepening-analysis 分析调用方负担和重复适配，比较至少两个可回滚方案，不要重构。
```

该 Skill 需要具体调用方、修改、重复、缺陷或测试证据。直接进行大规模重构必须先经过澄清、影响分析、计划和写权限门禁。

## 我要切换到新会话

```text
$session-handoff 创建面向完成验证的 standard 脱敏交接，保存到操作系统临时目录。
```

既有规格、ADR、Issue、Commit 和 Diff 只引用，不复制全文。

## 我不知道该用哪个 Skill

```text
$repo-doctor-router 使用 fast 模式推荐一个 Skill，只给原因、模式和最小输入。
```

需要 workflow ID、门禁、停止条件、注册表证据或替代路径时，再要求 `standard` 或 `audit` 路由。
