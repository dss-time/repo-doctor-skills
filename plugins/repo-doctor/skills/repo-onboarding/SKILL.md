---
name: repo-onboarding(理解项目)
description: Use this skill when the user wants to understand an unfamiliar repository, project structure, architecture, tech stack, entry points, build commands, test commands, core modules, configuration, deployment flow, or where to start reading before making changes. Do not use this skill for direct code modification.
---

# Repo Onboarding Skill

## Language Policy

Respond in the same language as the user's request.

If the user writes in Chinese, respond in Chinese.
If the user writes in English, respond in English.
If the user writes in another language, respond in that language when possible.
If the user's language is mixed or unclear, use the dominant language of the request.

Translate section headings and explanations into the user's language.
Do not translate code identifiers, file paths, package names, commands, error messages, API names, or configuration keys.

Keep technical terms readable. When a translated term may be ambiguous, include the original English term in parentheses.


You are helping the user understand an unfamiliar software repository.

Do not modify code during onboarding unless the user explicitly asks.

## Goals

Help the user understand:

- what the project does
- what technologies it uses
- how the repository is structured
- where the entry points are
- how to run, test, build, and release it
- which modules are most important
- which files a new contributor should read first
- which areas should be treated carefully before editing

## Workflow

1. Inspect the repository root.
2. Identify the main language, framework, package manager, and build tools.
3. Read important metadata files such as README files, manifests, lockfiles, config files, CI files, Docker files, and test configs.
4. Identify entry points and core modules.
5. Identify scripts for development, test, build, lint, typecheck, and release.
6. Identify likely risk areas.
7. Produce a practical onboarding map.

## Output Format

Localize all section headings according to the user's language. The following English headings describe the required structure, not the required output language.

### 1. Project Summary

Explain what the repository appears to do. If uncertain, say what evidence supports the conclusion.

### 2. Technology Stack

| Area | Detected Technology | Evidence |
|---|---|---|

### 3. Directory Map

| Path | Responsibility | Importance |
|---|---|---|

Importance should be one of: Core, Important, Supporting, Config, Test, Unknown.

### 4. Entry Points and Core Flow

List likely entry points and explain why they matter.

### 5. How To Run and Validate

| Purpose | Command | Confidence | Evidence |
|---|---|---|---|

Do not claim a command works unless it is defined or validated.

### 6. Recommended Reading Order

Give a numbered reading order for a new developer.

### 7. Risk Areas

List areas that deserve caution before editing, such as public APIs, shared utilities, authentication, routing, database migrations, package exports, build config, or generated files.

### 8. Recommended Next Step

Recommend whether to run project-health-check, safe-code-review, or change-impact-analysis next.

## Rules

Separate facts from assumptions.

Do not invent missing documentation.

Do not modify files.

Do not recommend large refactors during onboarding.
