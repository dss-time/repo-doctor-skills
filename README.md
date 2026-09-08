**English** | [简体中文](./README.zh-CN.md)

# Repo Doctor Skills

Focused Skills for debugging, code review, fixes, and tests.

## Start in 30 seconds

```bash
npx repo-doctor-skills install
```

## Minimal example

```text
$safe-code-review Review the current changes.
```

Use `$repo-doctor-router` when unsure. It recommends only; invoke a known Skill directly.

## Recommended

The default installs seven frequently used Skills:

| Task | Skill |
|---|---|
| Choose a capability | `$repo-doctor-router` |
| Clarify requirements | `$requirements-clarification` |
| Diagnose a bug | `$bug-root-cause-analysis` |
| Implement a fix | `$safe-fix-implementation` |
| Add tests | `$safe-test-implementation` |
| Review code | `$safe-code-review` |
| Test a design | `$decision-prototype` |

The installer prints the actual target. Reinstalling skips identical content; replacing different content requires `--force`.

## Full

Install all 40 Skills, including when expanding Recommended in the same directory:

```bash
npx repo-doctor-skills install --preset full
```

## Individual Skills and language

```bash
npx repo-doctor-skills install --skill safe-code-review
npx repo-doctor-skills install --language en
```

Bodies default to bilingual. Choose `en`, `zh-CN`, or `bilingual`; supporting resources remain available.

## skills.sh

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

Use `--list` to discover 40 Skills. This external CLI has its own version-dependent Node requirements.

## Documentation

- [Problem → Skill](docs/guides/problem-to-skill.md)
- [User manual](docs/USER_MANUAL.md)
- [Skill catalog](docs/SKILL_CATALOG.md)
- [Advanced usage: plugins, platforms, versions, source builds](docs/ADVANCED_USAGE.md)
- [Contributing](CONTRIBUTING.md)

[MIT](LICENSE)
