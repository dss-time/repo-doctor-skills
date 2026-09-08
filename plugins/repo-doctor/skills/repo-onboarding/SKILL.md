---
name: repo-onboarding
description: "Understand an unfamiliar software repository before making changes. 在修改代码前理解一个陌生软件仓库。"
---

# Repo Onboarding（仓库理解）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

## Execution Contract

Default to `fast`; bounded natural-language invocation is allowed.
Complete one primary task by default. Continue an authorized end-to-end workflow within each Skill's permissions; Router remains recommendation-only. Pause for new material decisions or scope, not authorization already given.
Validate according to actual risk; security, production, migrations, releases and other high-risk work use `audit`. Read `references/execution-modes.en.md` only when mode selection is unclear.

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
默认完成一个主任务。用户已授权完整流程时，在各 Skill 权限内连续完成；Router 仍只推荐。新重大决策或超出授权时暂停，不重复索取已有授权。
按实际风险选择验证；安全、生产、迁移、发布等高风险工作使用 `audit`。模式不明确时才读取 `references/execution-modes.zh-CN.md`。

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
