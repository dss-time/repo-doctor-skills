# Repo Doctor for Codex

Repo Doctor is a universal Codex plugin that helps developers safely understand, review, diagnose, and change software repositories.

The core idea is simple:

> Let Codex understand and diagnose the repository before modifying code.

Repo Doctor is designed for developers who want safer AI-assisted coding workflows across different programming languages, frameworks, teams, and natural languages.

---

## Table of Contents

- [What is Repo Doctor?](#what-is-repo-doctor)
- [Why use it?](#why-use-it)
- [Language Support](#language-support)
- [Installation](#installation)
- [How to Verify Installation](#how-to-verify-installation)
- [Quick Start](#quick-start)
- [Which Skill Should I Use?](#which-skill-should-i-use)
- [Skill Tutorials](#skill-tutorials)
  - [repo-onboarding](#1-repo-onboarding)
  - [project-health-check](#2-project-health-check)
  - [safe-code-review](#3-safe-code-review)
  - [change-impact-analysis](#4-change-impact-analysis)
- [Recommended Workflows](#recommended-workflows)
- [Prompt Examples](#prompt-examples)
- [Troubleshooting](#troubleshooting)
- [Repository Structure](#repository-structure)
- [Roadmap](#roadmap)

---

## What is Repo Doctor?

Repo Doctor is a Codex plugin that provides a set of reusable skills for repository-level software engineering work.

It helps Codex behave less like a code generator and more like a careful senior engineer who first asks:

- What is this repository?
- What are the important files?
- What can break if I change this?
- Is this code actually unused?
- What should be tested before refactoring?
- What should be fixed before release?
- What should not be changed yet?

Repo Doctor currently includes four skills:

| Skill | Main Use |
|---|---|
| `repo-onboarding` | Understand an unfamiliar repository before changing it. |
| `project-health-check` | Diagnose project quality, risks, tests, security, and release readiness. |
| `safe-code-review` | Review code, files, PRs, or current changes with practical priorities. |
| `change-impact-analysis` | Analyze the impact before modifying, deleting, renaming, or refactoring shared code. |

---

## Why use it?

AI coding tools are powerful, but unsafe code changes can create serious problems.

Common risks include:

- changing shared code without understanding who depends on it
- deleting code that is still used
- refactoring public APIs without compatibility checks
- missing tests around risky behavior
- reviewing only style instead of correctness and safety
- modifying unfamiliar repositories too quickly
- letting AI edit first without understanding the project context

Repo Doctor encourages a safer workflow:

```text
Understand → Diagnose → Analyze Impact → Change Safely
```

---

## Language Support

Repo Doctor follows the user's language by default.

If you ask in English, it should respond in English.

If you ask in Chinese, it should respond in Chinese.

If you ask in another language, it will try to respond in that language.

Code identifiers, file paths, package names, commands, API names, configuration keys, and error messages are kept unchanged.

Example in Chinese:

```text
$project-health-check

请帮我检查这个项目，先不要修改代码。
```

Expected response language: Chinese.

Example in English:

```text
$project-health-check

Please check this repository before I make changes.
```

Expected response language: English.

---

## Installation

Open Codex plugin marketplace and add this repository as a marketplace source.

Use:

```text
Source: dss-time/repo-doctor-codex-plugin
Git ref: main
Sparse path: leave empty
```

You can also use the full Git URL:

```text
Source: https://github.com/dss-time/repo-doctor-codex-plugin.git
Git ref: main
Sparse path: leave empty
```

Then install the `Repo Doctor` plugin.

After installation, open or restart Codex, then start a new conversation in the repository you want to analyze.

---

## How to Verify Installation

After installing the plugin, open Codex in any repository and type:

```text
$
```

You should be able to search for these skills:

```text
repo-onboarding
project-health-check
safe-code-review
change-impact-analysis
```

You can also try:

```text
/skills
```

If the skills appear in the list, the plugin is installed correctly.

If they do not appear, see [Troubleshooting](#troubleshooting).

---

## Quick Start

### New to a repository?

Use:

```text
$repo-onboarding

Help me understand this repository before I make changes.
Do not modify code.
```

### Want a full project diagnosis?

Use:

```text
$project-health-check

Run a project health check.
Do not modify code.
Give me P0/P1/P2/P3 priorities.
```

### Want to review current changes?

Use:

```text
$safe-code-review

Review my current changes.
Focus on correctness, maintainability, security, performance, types, tests, and redundant code.
```

### Want to refactor or delete shared code?

Use:

```text
$change-impact-analysis

I want to refactor src/utils/request.ts.
Before editing, analyze what depends on it, what can break, and what tests I need.
```

---

## Which Skill Should I Use?

| Situation | Recommended Skill |
|---|---|
| I just opened an unfamiliar project. | `repo-onboarding` |
| I want to know whether this project is healthy. | `project-health-check` |
| I want a senior-style review of my code changes. | `safe-code-review` |
| I want to refactor a module safely. | `change-impact-analysis` |
| I want to delete a function or file. | `change-impact-analysis` |
| I want to know whether code is dead or redundant. | `project-health-check` first, then `change-impact-analysis` |
| I want to review a PR before merging. | `safe-code-review` |
| I want to prepare before a release. | `project-health-check` |
| I want to onboard a new teammate. | `repo-onboarding` |
| I want Codex to avoid changing code too early. | Any Repo Doctor skill, with “Do not modify code first.” |

---

# Skill Tutorials

## 1. repo-onboarding

### What it does

`repo-onboarding` helps you understand an unfamiliar repository before changing code.

It identifies:

- project purpose
- technology stack
- package manager
- build tools
- test tools
- directory structure
- entry points
- important modules
- development commands
- risk areas
- recommended reading order

### When to use it

Use it when:

- you clone a new repository
- you join a new team
- you inherit a legacy project
- you want Codex to understand the project before coding
- you want a project map before refactoring

### Basic prompt

```text
$repo-onboarding

Help me understand this repository.
Do not modify code.
Tell me the tech stack, directory structure, entry points, scripts, core modules, and recommended reading order.
```

### Chinese prompt

```text
$repo-onboarding

请帮我理解当前项目。
先不要修改任何代码。
请输出：
1. 项目是做什么的
2. 技术栈
3. 目录结构
4. 入口文件
5. 启动、测试、构建命令
6. 核心模块
7. 新人应该先读哪些文件
8. 哪些地方修改时要小心
```

### Expected output

Repo Doctor should return something like:

```text
1. Project Summary
2. Technology Stack
3. Directory Map
4. Entry Points and Core Flow
5. How To Run and Validate
6. Recommended Reading Order
7. Risk Areas
8. Recommended Next Step
```

---

## 2. project-health-check

### What it does

`project-health-check` performs a broad diagnosis of repository health.

It checks:

- architecture
- correctness
- maintainability
- type safety
- security
- performance
- dependencies
- test gaps
- release readiness
- redundant code
- possible dead code

### When to use it

Use it when:

- you want to know whether a project is healthy
- you want a prioritized improvement plan
- you want to find risky modules
- you want to prepare for release
- you want to clean up technical debt
- you want to decide what to fix first

### Basic prompt

```text
$project-health-check

Run a project health check.
Do not modify code.
Give me P0/P1/P2/P3 priorities.
Focus on architecture, correctness, security, performance, type safety, tests, redundant code, and release readiness.
```

### Chinese prompt

```text
$project-health-check

请对当前项目做一次项目体检。
先不要修改代码。
重点检查：
1. 架构问题
2. 逻辑错误
3. 冗余代码
4. 疑似死代码
5. 安全风险
6. 性能问题
7. 类型问题
8. 测试缺失
9. 发布风险

请按照 P0/P1/P2/P3 给出优先级。
```

### Expected output

Repo Doctor should return:

```text
1. Overall Health Conclusion
2. Health Score
3. P0/P1/P2/P3 Issues
4. Architecture and Module Boundary Issues
5. Redundant Code and Possible Dead Code
6. Security and Stability Risks
7. Performance Issues
8. Test Gaps
9. Release Readiness Checks
10. Recommended Roadmap
11. Final Recommendation
```

### Priority system

| Priority | Meaning |
|---|---|
| P0 | Must fix immediately. Usually security, data loss, crash, or release-blocking risk. |
| P1 | Should fix soon. Usually correctness, stability, maintainability, or type-safety risk. |
| P2 | Recommended improvement. Usually duplication, structure, testing, or future maintenance cost. |
| P3 | Optional cleanup. Usually style, naming, minor readability, or non-critical improvement. |

---

## 3. safe-code-review

### What it does

`safe-code-review` reviews a file, module, PR, or current changes.

It focuses on:

- logic errors
- edge cases
- maintainability
- security risks
- performance issues
- type safety
- public API compatibility
- redundant code
- missing tests
- safe refactoring suggestions

### When to use it

Use it when:

- you want to review your current changes
- you want to review a PR
- you want a second opinion before committing
- you want to check a file or module
- you want to find bugs before release
- you want practical code review instead of style-only comments

### Basic prompt

```text
$safe-code-review

Review my current changes.
Do not modify code first.
Focus on correctness, maintainability, security, performance, types, tests, and redundant code.
Use P0/P1/P2/P3 priorities.
```

### Chinese prompt

```text
$safe-code-review

请审查我当前的代码改动。
先不要修改代码。
重点看：
1. 逻辑错误
2. 边界条件
3. 类型问题
4. 安全风险
5. 性能问题
6. 冗余代码
7. 是否缺少测试
8. 是否会破坏已有 API

请按照 P0/P1/P2/P3 输出。
```

### Review one file

```text
$safe-code-review

Please review src/utils/request.ts.
Do not modify it yet.
Tell me what is correct, what is risky, what should be tested, and what should be refactored.
```

### Review a PR

```text
$safe-code-review

Review this PR as a senior engineer.
Focus on correctness, compatibility, security, performance, and missing tests.
Do not nitpick style unless it affects maintainability.
```

---

## 4. change-impact-analysis

### What it does

`change-impact-analysis` analyzes what could break before modifying shared code.

It checks:

- what the target does
- where it is imported
- whether it is exported
- whether it is public API
- whether it is used dynamically
- which tests protect it
- what behavior must be preserved
- what can break
- the safest change plan

### When to use it

Use it before:

- deleting a file
- deleting a function
- renaming an exported function
- moving a module
- changing a shared utility
- refactoring request logic
- changing routing
- changing package exports
- changing database models
- changing build configuration
- modifying a core component

### Basic prompt

```text
$change-impact-analysis

I want to modify src/utils/request.ts.
Do not edit code first.
Analyze who depends on it, whether it is public API, what can break, and what tests are needed.
```

### Chinese prompt

```text
$change-impact-analysis

我想修改 src/utils/request.ts。
请先不要修改代码。
请分析：
1. 这个文件当前负责什么
2. 它被哪些地方引用
3. 是否属于 public API
4. 修改后可能影响哪些模块
5. 哪些行为必须保持兼容
6. 修改前应该补哪些测试
7. 最小安全修改方案是什么
```

### Delete code safely

```text
$change-impact-analysis

I want to delete src/legacy/oldFormatter.ts.
Before deleting it, check whether it is referenced, exported, dynamically used, documented, or part of a public API.
Then tell me whether it is safe to delete.
```

### Rename an exported API safely

```text
$change-impact-analysis

I want to rename the exported function createRequestClient to createHttpClient.
Before editing, analyze all references, public API risk, migration strategy, and compatibility options.
```

---

## Recommended Workflows

### Workflow 1: First time opening a repository

```text
$repo-onboarding
```

Then:

```text
$project-health-check
```

Goal:

```text
Understand the project before making changes.
```

---

### Workflow 2: Before refactoring shared code

```text
$change-impact-analysis
```

Then, after reviewing the impact report:

```text
$safe-code-review
```

Goal:

```text
Analyze impact before editing, then review the final changes.
```

---

### Workflow 3: Before opening a pull request

```text
$safe-code-review
```

Goal:

```text
Find correctness, safety, compatibility, and test issues before review.
```

---

### Workflow 4: Before release

```text
$project-health-check
```

Recommended prompt:

```text
$project-health-check

Check whether this repository is ready for release.
Focus on build scripts, tests, CI, dependencies, environment variables, breaking changes, and release risks.
Do not modify code.
```

---

## Prompt Examples

### Find redundant code

```text
$project-health-check

Find redundant code and possible dead code in this repository.
Do not delete anything.
For each item, explain what must be verified before deletion.
```

### Check a TypeScript utility library

```text
$project-health-check

This is a TypeScript utility library.
Check public exports, type safety, package exports, dependency risks, test gaps, and API compatibility.
Do not modify code.
```

### Check a frontend project

```text
$project-health-check

This is a frontend project.
Check routing, state management, request logic, component structure, rendering performance, XSS risks, localStorage usage, and test gaps.
```

### Check a backend project

```text
$project-health-check

This is a backend project.
Check API boundaries, authentication, authorization, database access, input validation, error handling, logging, performance, and test gaps.
```

### Ask for a safe refactor plan

```text
$change-impact-analysis

I want to refactor the authentication module.
Before editing, analyze dependencies, public API risk, behavior that must stay compatible, tests needed, and a phased refactor plan.
```

### Review current changes without editing

```text
$safe-code-review

Review my current changes.
Do not modify code.
Only output findings, risks, and suggested fixes.
```

### Ask Repo Doctor to proceed after analysis

```text
$change-impact-analysis

I want to refactor src/utils/request.ts.
First analyze the impact.
After the impact report, wait for my confirmation before editing.
```

---

## What Repo Doctor Will Not Do Automatically

Repo Doctor is intentionally conservative.

It should not:

- delete files without confirmation
- rename public APIs without compatibility analysis
- perform large rewrites when small fixes are enough
- introduce dependencies without a strong reason
- claim code is unused without searching references
- change behavior silently
- modify code before understanding the impact

If you want Codex to modify code, ask explicitly after reviewing the analysis.

Example:

```text
Based on the impact analysis, make the smallest safe change.
Do not change public APIs.
Run or suggest validation commands after editing.
```

---

## Troubleshooting

### I cannot find the skills with `$`

Try:

```text
/skills
```

If the skills still do not appear:

1. Make sure the plugin is installed.
2. Restart Codex.
3. Start a new Codex conversation.
4. Confirm you added the correct marketplace source:

```text
dss-time/repo-doctor-codex-plugin
```

5. Confirm the Git ref is correct:

```text
main
```

6. Leave sparse path empty.

---

### The plugin was added but no skills appear

Check that the repository contains this structure:

```text
.agents/plugins/marketplace.json
plugins/repo-doctor/.codex-plugin/plugin.json
plugins/repo-doctor/skills/repo-onboarding/SKILL.md
plugins/repo-doctor/skills/project-health-check/SKILL.md
plugins/repo-doctor/skills/safe-code-review/SKILL.md
plugins/repo-doctor/skills/change-impact-analysis/SKILL.md
```

---

### The response language is not what I expected

Tell Codex explicitly:

```text
Please respond in Chinese.
```

or:

```text
Please respond in English.
```

Repo Doctor is designed to follow the language of your request, but explicit language instructions are always safer.

---

### Codex starts editing too early

Use this phrase:

```text
Do not modify code. Only analyze first.
```

or:

```text
先不要修改代码，只输出分析报告。
```

---

## Repository Structure

This plugin follows the Codex plugin structure:

```text
repo-doctor-codex-plugin/
├── .agents/
│   └── plugins/
│       └── marketplace.json
├── plugins/
│   └── repo-doctor/
│       ├── .codex-plugin/
│       │   └── plugin.json
│       └── skills/
│           ├── repo-onboarding/
│           │   └── SKILL.md
│           ├── project-health-check/
│           │   └── SKILL.md
│           ├── safe-code-review/
│           │   └── SKILL.md
│           └── change-impact-analysis/
│               └── SKILL.md
├── README.md
└── LICENSE
```

---

## Roadmap

Possible future skills:

- `dead-code-finder`
- `test-gap-analyzer`
- `release-readiness-check`
- `dependency-risk-audit`
- `api-contract-review`
- `frontend-quality-check`
- `backend-stability-check`

---

## License

MIT
