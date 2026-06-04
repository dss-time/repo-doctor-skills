---
name: change-impact-analysis（改代码看影响）
description: Use this skill when the user wants to modify, refactor, rename, delete, move, or redesign a file, function, module, package export, component, API, database model, configuration file, or shared utility and wants to understand the impact before editing. Trigger for questions like what will this change affect, is it safe to delete, can I rename this, how should I refactor this safely, or what tests are needed before changing it.
---

# Change Impact Analysis Skill

## Language Policy

Respond in the same language as the user's request.

If the user writes in Chinese, respond in Chinese.
If the user writes in English, respond in English.
If the user writes in another language, respond in that language when possible.
If the user's language is mixed or unclear, use the dominant language of the request.

Translate section headings and explanations into the user's language.
Do not translate code identifiers, file paths, package names, commands, error messages, API names, or configuration keys.

Keep technical terms readable. When a translated term may be ambiguous, include the original English term in parentheses.


You are helping the user analyze the impact of a proposed change before modifying code.

The goal is to prevent unsafe AI-assisted edits.

## Core Principle

Do not modify code first.

Before changing anything, understand:

- what the target does
- who depends on it
- whether it is public API
- whether it is used dynamically
- what behavior must be preserved
- what tests protect it
- what can break
- what the safest change plan is

## When To Use

Use this skill when the user wants to:

- refactor a file
- rename a function
- delete code
- move a module
- change an exported API
- change a shared utility
- change request logic
- change state management
- change routing
- change database models
- change build config
- change package exports
- modify a core component
- simplify legacy code

## Workflow

1. Identify the target.
2. Search references.
3. Check imports, calls, re-exports, dynamic imports, route references, config references, test references, documentation references, package exports, and CI usage.
4. Classify dependency risk.
5. Identify behavior that must be preserved.
6. Identify likely breakage.
7. Recommend the smallest safe plan.

## Output Format

Localize all section headings according to the user's language. The following English headings describe the required structure, not the required output language.

### 1. Change Target

| Item | Value |
|---|---|
| Target |  |
| Current Responsibility |  |
| Proposed Change |  |
| Exported |  |
| Public API Risk |  |
| Confidence |  |

### 2. Current Responsibility

Explain what the target currently does. Separate facts from assumptions.

### 3. References and Dependencies

| Reference Location | Usage Type | Risk If Changed |
|---|---|---|

Usage types can include import, call, re-export, route, config, test, documentation, dynamic usage, package export, or unknown.

### 4. Risk Level

Choose one:

- Low: local-only change with clear tests
- Medium: shared internal change with several references
- High: public API or cross-module change
- Critical: release, build, security, data, or external compatibility risk

Explain why.

### 5. Affected Behavior

| Behavior | Why It Matters | How To Protect It |
|---|---|---|

### 6. Tests Needed Before Changing

| Test | Purpose | Priority |
|---|---|---|

### 7. Minimum Safe Change Plan

Give a staged plan:

1. Add or identify regression tests.
2. Introduce the new implementation without removing the old API if public API is involved.
3. Update internal references.
4. Run typecheck and tests.
5. Remove old code only after confirming no external usage.

### 8. Unsafe Actions To Avoid

List unsafe actions, such as deleting files immediately, renaming exported APIs without compatibility layers, changing return shapes without updating consumers, or modifying config without validating build.

### 9. Validation Commands

| Purpose | Command | Confidence |
|---|---|---|

If commands are inferred, say so.

### 10. Final Decision

Say whether the change is:

- safe to do directly
- safe only after tests
- safe only with compatibility layer
- risky and needs manual confirmation
- not recommended

## Rules

Do not modify files unless the user explicitly asks.

Do not assume no references exist without searching.

Do not ignore public API compatibility.

Do not recommend deletion when dynamic usage may exist.

If the user asks to proceed with implementation, make the smallest safe change first.
