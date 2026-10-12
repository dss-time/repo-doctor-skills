# Quick start

## 1. Install

Use current Node.js LTS (tested with Node 24); the latest external skills CLI does not run on the repository's Node 18 minimum.

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

Run from your project and choose your agent and Skills. Start with `safe-code-review` or the seven starter Skills listed in the README. Add `-g` for a user-wide installation.

For the Codex engineering plugin instead:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills
codex plugin add repo-doctor@repo-doctor-marketplace
```

Use one installation method per agent for the same Skills, then start a new task.

## 2. Make a request

```text
$safe-code-review Review the current changes.
```

Describe the task without choosing an execution mode. Use `$repo-doctor-router` when unsure which Skill to choose.

## 3. Read the result

Reviews report supported findings and relevant limits. Fixes report changes and verification. Ask for detail when you need the full evidence.

## More

- [Choose by problem](guides/problem-to-skill.md)
- [User manual](USER_MANUAL.md)
- [Skill catalog](SKILL_CATALOG.md)
- [Multi-step tasks](WORKFLOW_COOKBOOK.md)
- [Source builds and other platforms](ADVANCED_USAGE.md)
- [Version and lifecycle](VERSIONING.md)

Update copied Skills with `npx skills@latest update`; re-run `add` to select new Skills. For preset or single-language installation, the optional `npx repo-doctor-skills install` installer remains available. Users do not need to clone or build this repository.
