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

读取[执行边界](../../references/execution-boundaries.zh-CN.md)。分析、实施或验证代码且检查规则依赖技术栈时，按需读取[语言与运行时选择](../../references/language-security-boundaries.zh-CN.md)，仅应用相关组件规则。路由、交接和普通文档任务无需加载语言规则。

修改用户文件或运行测试、构建、诊断命令前，读取[用户项目修改与验证安全](../../references/user-workspace-safety.zh-CN.md)并应用相关章节。只读分析/审查涉及权限与业务不变量、已有数据更新语义、验证隔离或编辑冲突时按需读取，保持本 Skill 自身权限。
