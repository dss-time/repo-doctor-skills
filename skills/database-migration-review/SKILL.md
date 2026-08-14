---
name: database-migration-review
description: "Explicit-invocation review of one concrete database schema or data migration for reversibility, data safety, locking, backfill, replication, compatibility, rollout, validation, and rollback. Never execute migrations, connect to production, or modify migration files. 仅显式调用：审查一个具体数据库 Schema 或数据迁移的可逆性、数据安全、锁、回填、复制、兼容、发布、验证和回滚。绝不执行迁移、不连接生产，也不修改迁移文件。"
---

# English

## Execution Contract

Default to `standard`; explicit invocation is required.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Database Migration Review

Review one concrete migration using repository evidence. Do not execute it or connect to any production system.

## Boundary
- Route generic blast radius to `change-impact-analysis`, implementation planning to `safe-change-plan`, and edits to `safe-fix-implementation`.
- Do not infer engine behavior, table size, traffic, replication topology, or maintenance windows without evidence.
- Keep migration, application, configuration, and data unchanged.

## Workflow
1. Identify database engine/version, migration framework, up/down operations, affected objects, application versions, deployment order, and available size or traffic evidence.
2. Separate schema change, data migration/backfill, and application rollout phases.
3. Check reversibility, destructive operations, defaults, nullability, casts, indexes, constraints, foreign keys, triggers, and compatibility windows.
4. Assess locks, long transactions, backfill rate, disk growth, replication lag, retries, partial failure, and zero-downtime sequencing.
5. Verify expand/migrate/contract ordering and old/new application compatibility.
6. Recommend backup, dry run, sampling, checksums or invariants, canary/gray rollout, observability, stop conditions, and rollback.
7. Report evidence, severity, impact, confidence, validation, and unknowns without executing or editing.

# Output Contract
1. Scope, engine, and rollout phases
2. Evidence
3. Findings with severity, impact, confidence, and phase
4. Data-loss, locking, replication, and compatibility risks
5. Backup, validation, canary, and rollback recommendations
6. Deployment sequence and stop conditions
7. Unknowns

# 简体中文

## 执行契约

默认使用 `standard`；仅允许用户显式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 数据库迁移审查

基于仓库证据审查一个具体迁移，不执行迁移，也不连接任何生产系统。

## 职责边界
- 通用影响交给 `change-impact-analysis`，实施计划交给 `safe-change-plan`，修改交给 `safe-fix-implementation`。
- 不得无证据推断数据库引擎行为、表大小、流量、复制拓扑或维护窗口。
- 保持迁移、应用、配置和数据不变。

## 工作流程
1. 识别数据库引擎/版本、迁移框架、up/down、受影响对象、应用版本、部署顺序及可用容量或流量证据。
2. 分离 schema change、data migration/回填和 application rollout 阶段。
3. 检查可逆性、破坏性操作、默认值、空值、类型转换、索引、约束、外键、触发器和兼容窗口。
4. 评估锁、长事务、回填速率、磁盘增长、复制延迟、重试、部分失败和零停机顺序。
5. 验证 expand/migrate/contract 顺序及新旧应用兼容性。
6. 建议备份、dry run、抽样、校验和或不变量、灰度、可观察性、停止条件和回滚。
7. 不执行或修改，报告证据、严重度、影响、置信度、验证和未知项。

# 输出契约
1. 范围、引擎与发布阶段
2. 证据
3. 发现、严重度、影响、置信度和阶段
4. 数据丢失、锁、复制和兼容风险
5. 备份、验证、灰度和回滚建议
6. 部署顺序与停止条件
7. 未知项
