---
name: performance-regression-analysis
description: Explicit-invocation analysis of one measured performance regression against a defined baseline and workload using profiles, benchmarks, traces, logs, or reproducible experiments. Do not trigger for ordinary slowness guesses, replace general code review, or optimize code. 仅显式调用：针对明确基线和工作负载，使用 profile、benchmark、trace、日志或可复现实验分析一个已测量的性能回归。不得因普通性能猜测而触发，不替代代码审查，也不优化代码。
---

# Performance Regression Analysis（性能回归分析）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `standard`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Performance Regression Analysis

Analyze one specific performance regression. Keep production code and configuration unchanged.

## Boundary
- Require a baseline, workload, metric, or explicit plan to obtain them. Do not claim regression from code appearance alone.
- Route broad code review to `safe-code-review`, general health to `project-health-check`, test implementation to `safe-test-implementation`, and optimization implementation to `safe-fix-implementation`.
- Do not run unsafe load against production or infer causality from one noisy sample.

## Workflow
1. Define baseline and candidate versions, environment, workload, dataset, warmup, concurrency, metric, percentile, budget, and measurement method.
2. Inspect supplied profiles, benchmarks, traces, logs, query plans, browser traces, or reproducible experiments; record missing controls.
3. Compare algorithms, repeated I/O, N+1 behavior, caches, allocation and memory, concurrency and contention, network, database, serialization, and frontend rendering as applicable.
4. Separate measured regression, correlated observation, code-based hypothesis, and unknown.
5. Check variance, sample size, cold/warm effects, environment drift, and measurement bias before attributing cause.
6. Rank hypotheses by impact, evidence, confidence, and experiment cost; propose falsifiable validation experiments and optimization priorities.
7. Do not optimize code; report exact evidence, locations, impact, severity/priority, confidence, validation, and unknowns.

# Output Contract
1. Scope, baseline, workload, and metrics
2. Evidence and measurement quality
3. Findings with measured/inferred status, severity, impact, and confidence
4. Ranked hypotheses and affected locations
5. Validation experiments and expected signals
6. Optimization priorities without implementation
7. Unknowns

---

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 性能回归分析

分析一个具体性能回归，保持生产代码和配置不变。

## 职责边界
- 需要基线、工作负载、指标或获取它们的明确方案；不得仅凭代码外观声称回归。
- 广泛代码审查交给 `safe-code-review`，一般体检交给 `project-health-check`，测试实施交给 `safe-test-implementation`，优化实施交给 `safe-fix-implementation`。
- 不对生产执行不安全压力，也不从单个噪声样本推断因果。

## 工作流程
1. 明确基线与候选版本、环境、工作负载、数据集、预热、并发、指标、分位数、预算和测量方法。
2. 检查用户提供的 profile、benchmark、trace、日志、查询计划、浏览器 trace 或可复现实验，记录缺失控制变量。
3. 按适用情况比较算法、重复 I/O、N+1、缓存、分配与内存、并发与争用、网络、数据库、序列化和前端渲染。
4. 分离已测量回归、相关观察、代码假设和未知。
5. 归因前检查方差、样本量、冷热效应、环境漂移和测量偏差。
6. 按影响、证据、置信度和实验成本排序假设，提出可证伪实验和优化优先级。
7. 不优化代码，报告准确证据、位置、影响、严重度/优先级、置信度、验证和未知项。

# 输出契约
1. 范围、基线、工作负载和指标
2. 证据与测量质量
3. 发现、测量/推断状态、严重度、影响和置信度
4. 排序假设与受影响位置
5. 验证实验与预期信号
6. 不含实施的优化优先级
7. 未知项
