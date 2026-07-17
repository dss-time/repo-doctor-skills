# Legacy Codex Plugin

This document preserves the historical Repo Doctor Codex plugin installation path and explains its current generated compatibility role in Repo Doctor Skills.

## `plugins/` vs `packs/`

```text
plugins/repo-doctor/
```

This is the historical Codex plugin path. Its current contents are synchronized from `packs/engineering/repo-doctor/` for compatibility and distribution. It may be installed or inspected, but it is not the primary editing surface.

```text
packs/
```

This is the only canonical source structure. Maintain Skill logic, bilingual content, permissions, risk, tests, resources, and output contracts here.

The compatibility path remains for existing users. Repo Doctor Skills was originally published as `repo-doctor-codex-plugin`; the current public repository name is `repo-doctor-skills`. Do not edit generated plugin copies as a second source of truth.

## Generated Plugin Structure

```text
.agents/plugins/marketplace.json
plugins/repo-doctor/.codex-plugin/plugin.json
plugins/repo-doctor/skills/
```

`plugins/repo-doctor/.codex-plugin/plugin.json` points to:

```json
{
  "skills": "./skills/"
}
```

The generated Repo Doctor distribution contains 25 scoped workflow and specialist engineering Skills:

- `repo-doctor-router`
- `repo-onboarding`
- `requirements-clarification`
- `requirements-to-spec`
- `spec-to-work-items`
- `project-health-check`
- `safe-code-review`
- `change-impact-analysis`
- `safe-fix-implementation`
- `bug-root-cause-analysis`
- `safe-change-plan`
- `test-gap-analysis`
- `safe-test-implementation`
- `ci-failure-diagnosis`
- `documentation-sync`
- `release-readiness-check`
- `dependency-upgrade-analysis`
- `api-contract-review`
- `database-migration-review`
- `dead-code-verification`
- `security-focused-review`
- `performance-regression-analysis`
- `architecture-decision-record`
- `configuration-audit`
- `session-handoff`

## Maintain and Regenerate the Plugin

Create or update Repo Doctor Skills in the canonical Pack, then use the repository scripts:

```bash
npm run sync:plugin
npm run validate
npm test
npm run build
node scripts/check-skill-quality.mjs --check-dist
```

`npm run sync:plugin` refreshes the Repo Doctor compatibility distribution only. The full build creates all seven regular cross-platform targets, synchronizes the three plugin distributions through the build pipeline, creates the `rd-*`, `pt-*`, and `sm-*` ChatGPT packages, and checks generated output for drift.

## Marketplace Source

In a Codex host that supports plugin marketplace sources, add this repository. Host UI labels and installation behavior may vary, so verify them against the host version you use.

Use:

```text
Source: dss-time/repo-doctor-skills
Git ref: main
Sparse path: leave empty
```

Or use the full Git URL:

```text
Source: https://github.com/dss-time/repo-doctor-skills.git
Git ref: main
Sparse path: leave empty
```

Then install the `Repo Doctor` plugin.

## Local Marketplace Configuration

The repository also includes:

```text
.agents/plugins/marketplace.json
```

It points to the local plugin path:

```json
{
  "source": {
    "source": "local",
    "path": "./plugins/repo-doctor"
  }
}
```

## Verify Installation

After installing the plugin, follow the host's refresh or new-conversation behavior.

Type:

```text
$
```

If that host supports `$` Skill discovery, search for examples such as:

```text
repo-onboarding
project-health-check
safe-code-review
change-impact-analysis
safe-fix-implementation
```

## Cross-Platform Build

Use the canonical `packs/` source and run:

```bash
npm run validate
npm test
npm run build
```

The generated artifacts include, for example:

```text
dist/codex-zh-CN/AGENTS.md
dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md
dist/generic-zh-CN/
```

## Quick Start

```text
$repo-onboarding

Help me understand this repository before I make changes.
Do not modify code.
```

```text
$project-health-check

Run a project health check.
Do not modify code.
Give me P0/P1/P2/P3 priorities.
```

```text
$safe-code-review

Review my current changes.
Focus on correctness, maintainability, security, performance, types, tests, and redundant code.
```

```text
$change-impact-analysis

I want to refactor a shared request utility.
Before editing, analyze what depends on it, what can break, and what tests I need.
```

```text
$safe-fix-implementation

Please fix the highest-priority issue from the previous project-health-check report.
Do not fix all issues at once.
Start with the smallest safe P0/P1 fix.
After editing, run or suggest validation commands.
```
