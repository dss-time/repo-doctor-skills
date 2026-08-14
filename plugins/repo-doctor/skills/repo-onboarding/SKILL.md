---
name: repo-onboarding
description: "Understand an unfamiliar software repository before making changes. 在修改代码前理解一个陌生软件仓库。"
---

# Repo Onboarding（仓库理解）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Use the Simple Request Bypass for clear, local, low-risk work. Activate one primary Skill by default; a next Skill may be recommended but never executed automatically.
Escalate to `audit` only for security, permissions, production data, migrations, releases, public-contract breakage, dependency upgrades, large architecture change, or an explicit full-audit request.
For mode selection, fast soft budgets, tiered validation, stop conditions, and progressive reference loading, read `references/execution-modes.en.md` only when the mode or escalation boundary is unclear; never preload every reference.

# Repo Onboarding

Use this skill to understand an unfamiliar repository before editing code.

## Safety Boundary

- Read-only by default.
- Do not modify files.
- Do not run commands unless the environment and user request allow it.
- Separate facts from assumptions.

## Workflow

1. Inspect repository metadata and top-level structure.
2. Identify the language, framework, package manager, and build tools.
3. Read important README, manifest, config, CI, test, and plugin files.
4. Identify entry points, core modules, scripts, and validation commands.
5. Identify risky areas such as public interfaces, shared utilities, authentication, data migrations, generated files, release scripts, or build config.
6. Produce a practical onboarding map and reading order.

# Output Format

1. Project summary
2. Technology stack
3. Directory map
4. Entry points and core flow
5. How to run and validate
6. Recommended reading order
7. Risk areas
8. Recommended next step

Use tables where they improve scanability. Include evidence for commands and file roles.

---

## 执行契约

默认使用 `fast`；允许边界明确的自然语言隐式调用。
清晰、局部、低风险请求使用简单请求快速通道；默认只激活一个主 Skill，下一 Skill 只能推荐，不能自动执行。
只有安全、权限、生产数据、迁移、发布、公共契约破坏、依赖升级、大型架构变更或用户明确要求完整审计时才升级为 `audit`。
模式选择、fast 软预算、分级验证、停止条件和按需 reference 规则见 `references/execution-modes.zh-CN.md`；仅在模式或升级边界不明确时读取，不得预读全部 references。

# 仓库理解

用于在修改代码前理解一个陌生仓库。

## 安全边界

- 默认只读。
- 不修改文件。
- 除非环境和用户明确允许，否则不运行命令。
- 区分事实和推断。

## 工作流程

1. 检查仓库元数据和顶层目录结构。
2. 识别语言、框架、包管理器和构建工具。
3. 阅读重要的 README、manifest、配置、CI、测试和插件文件。
4. 识别入口文件、核心模块、脚本和验证命令。
5. 识别风险区域，例如公共接口、共享工具、认证、数据迁移、生成文件、发布脚本或构建配置。
6. 输出实用的仓库理解地图和新人阅读顺序。

# 输出格式

1. 项目总结
2. 技术栈
3. 目录地图
4. 入口文件和核心流程
5. 运行与验证方式
6. 推荐阅读顺序
7. 风险区域
8. 下一步建议

能提升可读性时使用表格。命令和文件职责需要给出证据。
