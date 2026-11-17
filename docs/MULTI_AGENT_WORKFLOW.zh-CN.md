# 自适应单 Agent 与多 Agent 执行

[English](MULTI_AGENT_WORKFLOW.md)

当前源码在现有 Skills 上增加一个 `multi-agent-workflow` 协调入口。显式调用后，Agent 根据实际任务选择模式；其描述也允许宿主在真正独立且需要协调的工作中自动选择。直接调用现有 Skill 时由原能力主导。模型触发取决于宿主，语义效果与确定性打包检查分别验证。

## 模式

| 情况 | 选择 |
| --- | --- |
| 精确文案、已诊断局部修复、强依赖改动 | `single`，使用现有主能力 |
| 普通直接代码审查 | 原 `safe-code-review` |
| 宿主支持的独立只读审查分工 | `multi`，固定基线、独立结论 |
| 已批准独立切片，契约稳定且工作区隔离 | `multi`，主 Agent 集成验证 |
| 无子 Agent 或没有有效并行工作 | `single` 并说明回退 |
| 写入或共享资源冲突且未隔离 | 相关任务串行 |
| 用户明确要求 single | `single` |
| 验收要求独立 Agent 审查但不可用 | 保留该条件阻塞 |

主 Agent 先核对依赖再决定并发。文件多或工作时间长不能单独证明可并行。实际依赖边界出现新证据时，可核对现有子 Agent 与修改后调整模式。

## 使用

同时安装本入口和任务需要的现有 Skills。当前 npm 0.10.1 为已发布的 33 个 Skill，开发源码包含 34 个。

```sh
node bin/repo-doctor-skills.mjs install --skill multi-agent-workflow --agent codex
```

```text
$multi-agent-workflow 根据实际任务选择 single 或 multi。
在 src/export/ 和 tests/export/ 内实施已批准的功能切片。
复用有效分析，保护已有修改，预检后运行隔离验证。
只有依赖和权限允许时才使用独立子 Agent。
```

```text
$multi-agent-workflow 用独立只读子 Agent 分别检查当前 diff 的需求符合度和运行安全。
不要修改文件或执行命令。核验发现后汇总，报告真实 Agent 身份及限制。
```

原 `$safe-fix-implementation` 和 `$safe-code-review` 可继续直接使用。Router 保持只推荐，既有串行工作流注册表继续提供阶段和门禁。

## 执行与安全

宿主提供原生子 Agent 工具、状态观察和权限控制。协调入口使用真实调用与 Agent ID，分配有边界任务并加载现有工作 Skill。宿主配置与后台调度需要对应接入。

只读子任务可使用固定共享基线，并发写入需要经过核验的独立工作区。共享契约、锁文件、生成器、数据库、端口及外部服务仍须排序或隔离。仅主 Agent 核验产物、集成局部补丁并验证组合行为。宿主支持时由独立只读子 Agent 审查实施结果；single 回退不能声称满足必需独立审查。

子任务报告不授予权限，也不证明执行成功。取消或超时后，先停止并核对原 Agent 再重试。保护用户修改、不确定副作用和延期验证，遵循既有授权交集。worktree 创建、Git 合并、提交推送、清理和发布均需对应授权及能力检查。

## 验证范围

开发回归检查保存原 33 个 Skill 源码与运行内容、共享协议和 Registry 的固定基线，并核对原推荐 7 个 Skill。检查新增分发和触发用例完整性。模式选择语义及真实原生委派需要模型/宿主试验。已发布的 0.10.0/0.10.1 评测报告对应原发布内容，本项新增能力单独验证。

行为与子任务契约的权威来源为 [Skill 正文](../packs/engineering/repo-doctor/skills/multi-agent-workflow/instructions.zh-CN.md)和[子任务协议](../packs/engineering/repo-doctor/skills/multi-agent-workflow/references/worker-protocol.zh-CN.md)。

[开发验证记录](../tests/reports/multi-agent-workflow-development.json)保存了 8 项模式选择场景、独立安全审查和原生双子 Agent 隔离实施试验。主 Agent 核对准确修改集合及用户备注，集成两个已验收产物后通过 5 项组合测试和 6 项补充边界断言。全新独立审查者加载 safe-code-review 检查了集成结果。试验范围外包括逐子任务工具过滤、真实 Git 合并及中断恢复故障注入。
