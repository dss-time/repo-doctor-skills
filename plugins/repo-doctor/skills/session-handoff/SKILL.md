---
name: session-handoff
description: Prepare a sanitized, evidence-separated continuation brief so a new agent session can resume repository work without reconstructing completed work. Use when context is long, ownership is changing, or work must continue later; reference existing artifacts, record repository and validation state, recommend next Skills, and provide a copyable start prompt. Do not change business code, create commits, promise automatic loading, or write a file unless a safe scratch location and write authorization are available. 生成经过敏感信息清理且区分事实与推断的续接摘要，使新 Agent 会话无需重做已完成工作即可继续仓库任务。用于上下文过长、负责人切换或稍后继续；引用已有产物，记录仓库和验证状态，推荐下一 Skills，并提供可复制启动指令。不修改业务代码、不创建 commit、不声称会自动加载，也不在缺少安全 scratch 位置或写入授权时落盘。
---

# Session Handoff（会话交接）

Use the section matching the user's language. 使用与用户输入语言一致的章节。

# Session Handoff

Create a continuation brief that another agent can use immediately while preserving evidence boundaries and sensitive-data safety.

## Boundary

- Stay read-only by default. Do not modify business code, tests, configuration, documentation, Git state, commits, branches, external tasks, or releases.
- Do not claim the next session will automatically discover or read the brief.
- Reference long specifications, ADRs, work-item plans, diffs, logs, and documentation by path or identifier rather than copying them.
- Redact authentication material, password values, identity numbers, private addresses, and other sensitive personal or customer data. Preserve only the minimum non-sensitive context needed to continue.
- Output the full brief in the response. Write a file only when the user separately authorizes writing and a repository-approved scratch location is confirmed; never default to the project root.

## Workflow

1. Reconstruct the current objective and original user intent from the conversation and repository artifacts. Mark unavailable source context as unknown.
2. Separate confirmed facts, explicit decisions, reasonable inferences, unresolved questions, and blockers. Never promote an inference to a fact.
3. Record completed work, current repository state, changed files, actual commands, exit results, tests, and validation. Never claim a command ran when it did not.
4. Link relevant specifications, ADRs, work-item plans, commits, diffs, logs, and documentation. Summarize only what the next session needs to choose its first action.
5. Identify risks, permission constraints, conflict zones, generated files, user-owned changes, and actions that must not be repeated.
6. Order the next steps and recommend only existing Repo Doctor Skills. State required inputs and stop conditions for the first step.
7. Sanitize the complete brief. Replace sensitive values with category labels such as `[REDACTED_CREDENTIAL]`; do not preserve reversible fragments.
8. Provide a copyable next-session start prompt that names the brief or includes it inline, tells the agent to verify current state, and does not imply automatic loading.

## Completion and Failure Conditions

Complete when the brief is sufficient to choose and verify the next action without repeating completed work. If repository state, command results, or original intent cannot be verified, mark those fields `unknown`. If no safe write location or permission exists, return the complete brief in the response and report that no file was written.

# Output Contract

1. Current objective
2. Original user intent
3. Confirmed facts and separate inferences
4. Decisions made
5. Completed work
6. Current repository state
7. Modified files
8. Commands run and exact results
9. Test and validation results
10. Unresolved questions and current blockers
11. Recommended next steps in order
12. Recommended existing Repo Doctor Skills
13. Risks, permissions, and cautions
14. Work that must not be repeated
15. Paths or identifiers for specifications, ADRs, work items, commits, diffs, logs, and documentation
16. Sanitization summary and file-write status
17. Copyable next-session start instruction

Do not include raw sensitive values or claim automatic discovery by the next session.

---

# Session Handoff（会话交接）

生成可供另一个 Agent 立即使用的续接摘要，同时保持证据边界并清理敏感信息。

## 职责边界

- 默认只读，不修改业务代码、测试、配置、文档、Git 状态、commit、分支、外部任务或发布。
- 不声称下一会话会自动发现或读取交接内容。
- 已存在的长规格、ADR、工作项、diff、日志和文档只引用路径或标识，不重复全文。
- 清理认证材料、密码值、身份证号、私人地址和其他敏感个人或客户数据，只保留继续任务所需的最少非敏感上下文。
- 默认在响应中输出完整交接。只有用户另行授权写入且确认仓库认可的 scratch 位置时才落盘，绝不默认写到项目根目录。

## 工作流程

1. 从对话和仓库产物重建当前目标与用户原始意图；无法获得的来源上下文标为未知。
2. 区分已确认事实、明确决策、合理推断、未解决问题和阻塞，不得把推断提升为事实。
3. 记录已完成工作、当前仓库状态、改动文件、实际命令、退出结果、测试和验证；没有运行的命令不得声称已运行。
4. 引用相关规格、ADR、工作项、commit、diff、日志和文档；只摘要下一会话选择第一个动作所需内容。
5. 标识风险、权限限制、冲突区域、生成文件、用户已有改动，以及不应重复执行的动作。
6. 排列下一步顺序，只推荐现有 Repo Doctor Skills，并说明第一步所需输入和停止条件。
7. 对完整交接内容做敏感信息清理，用 `[REDACTED_CREDENTIAL]` 等类别标签替代，不保留可逆片段。
8. 提供可复制的下一会话启动指令，明确交接内容路径或内联内容，要求先核对当前状态，不暗示自动加载。

## 完成与失败条件

只有摘要足以让下一会话不重复已完成工作，并能选择、验证下一动作时才完成。仓库状态、命令结果或原始意图无法核实时，相应字段标为 `unknown`。没有安全写入位置或权限时，在响应中输出完整内容并说明未写文件。

# 输出契约

1. 当前目标
2. 用户原始意图
3. 已确认事实及单独列出的推断
4. 已做出的决策
5. 已完成工作
6. 当前仓库状态
7. 已修改文件
8. 已运行命令及准确结果
9. 测试与验证结果
10. 未解决问题与当前阻塞
11. 按顺序排列的下一步
12. 推荐的现有 Repo Doctor Skills
13. 风险、权限和注意事项
14. 不应重复执行的工作
15. 规格、ADR、工作项、commit、diff、日志和文档的路径或标识
16. 敏感信息清理摘要及文件写入状态
17. 可复制的下一会话启动指令

不得包含敏感原值，也不得声称下一会话会自动发现交接内容。
