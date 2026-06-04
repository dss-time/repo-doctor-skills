# Repo Doctor for Codex

Repo Doctor is a universal Codex plugin that helps developers safely understand, review, diagnose, and change software repositories.

The core idea is simple:

> Let Codex understand and diagnose the repository before modifying code.

Repo Doctor is designed for developers who want safer AI-assisted coding workflows.

## Why Repo Doctor?

Many developers use AI coding tools, but the biggest risk is not code generation itself. The bigger risk is unsafe code changes:

- changing shared code without understanding its impact
- deleting code that is still used
- refactoring public APIs without compatibility checks
- missing tests around risky behavior
- reviewing only style instead of correctness and safety
- modifying unfamiliar repositories too quickly

Repo Doctor helps reduce these risks.

## Included Skills

### repo-onboarding

Use this when you are new to a repository and want to understand the project purpose, technology stack, directory structure, entry points, build commands, test commands, and recommended reading order.

Example:

    $repo-onboarding

    Help me understand this repository before I make changes.
    Do not modify code.

### project-health-check

Use this for a broad project diagnosis covering architecture, maintainability, correctness, security, performance, type safety, tests, release readiness, and dead or redundant code.

Example:

    $project-health-check

    Run a project health check.
    Do not modify code.
    Give me P0/P1/P2/P3 priorities.

### safe-code-review

Use this for professional code review of a file, module, PR, or current changes.

Example:

    $safe-code-review

    Review my current changes.
    Focus on correctness, maintainability, security, performance, types, tests, and redundant code.

### change-impact-analysis

Use this before changing, deleting, renaming, or refactoring shared code.

Example:

    $change-impact-analysis

    I want to refactor src/utils/request.ts.
    Before editing, analyze what depends on it, what can break, and what tests I need.

## Installation

In Codex plugin marketplace, add this repository as a marketplace source:

    Source: dss-time/repo-doctor-codex-plugin
    Git ref: main
    Sparse path: leave empty

Then install the Repo Doctor plugin.

## Recommended Workflow

1. Run `$repo-onboarding` when entering an unfamiliar repository.
2. Run `$project-health-check` before major development.
3. Run `$change-impact-analysis` before refactoring shared code.
4. Run `$safe-code-review` before committing or opening a PR.

## Philosophy

Repo Doctor does not try to rewrite your entire project.

It focuses on:

- understanding first
- evidence-based diagnosis
- small safe changes
- reference search before deletion
- compatibility before refactoring
- tests before risky changes
- clear priority levels
