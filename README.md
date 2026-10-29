**English** | [简体中文](./README.zh-CN.md)

# Repo Doctor Skills

# Repo Doctor Skills[![XERJ Corpus Hub contributor](https://hub.xerj.org/contributors/dss-time/badge.svg)](https://hub.xerj.org/contributors/dss-time)

Focused Skills for debugging, code review, fixes, and tests.

## Start in 30 seconds

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

Use current Node.js LTS (Node 24 was tested). Run from your project, follow the installer's Skill and agent selection, then start a new task. No repository clone or build is needed. Installs are project-local by default; add `-g` for all projects.

## Minimal example

```text
$safe-code-review Review the current changes.
```

Use `$repo-doctor-router` when unsure. It recommends a Skill and gives a copyable next request; invoke a known Skill directly.

## Codex plugin

For the complete engineering collection (28 Skills):

```bash
codex plugin marketplace add dss-time/repo-doctor-skills
codex plugin add repo-doctor@repo-doctor-marketplace
```

Choose either the plugin or copied Skills for the same agent to avoid duplicates. See [Advanced usage](docs/ADVANCED_USAGE.md) for the other two plugins.

## Recommended

Start by selecting these seven frequently used Skills:

| Task | Skill |
|---|---|
| Choose a capability | `$repo-doctor-router` |
| Clarify requirements | `$requirements-clarification` |
| Diagnose a bug | `$bug-root-cause-analysis` |
| Implement a fix | `$safe-fix-implementation` |
| Add tests | `$safe-test-implementation` |
| Review code | `$safe-code-review` |
| Test a design | `$decision-prototype` |

Install that selection directly for Codex:

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill repo-doctor-router requirements-clarification bug-root-cause-analysis safe-fix-implementation safe-test-implementation safe-code-review decision-prototype -a codex
```

## Full

Install all 41 Skills for Codex:

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill '*' -a codex
```

## Individual Skills and updates

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill safe-code-review
npx skills@latest check
npx skills@latest update
```

Bodies are bilingual and include supporting resources. Re-run `add` to select newly added Skills. Invoke Skills using your agent's syntax; the examples above use Codex.

WorkBuddy users can use the generic Skill import format; see [WorkBuddy guidance](docs/ADVANCED_USAGE.md#workbuddy). Installation and execution in WorkBuddy have not yet been verified.

## Optional preset and language installer

```bash
npx repo-doctor-skills install
npx repo-doctor-skills install --preset full
npx repo-doctor-skills install --language en
```

This alternative installs seven starter Skills by default and supports `en`, `zh-CN`, or `bilingual` bodies. It prints the target, skips identical content, and requires `--force` to replace different content. The external skills CLI has its own Node requirements.

## v0.8.1 stable release

The source contains 41 Skills (28 in Repo Doctor) and 38 ChatGPT ZIPs. Fresh GPT-6.1 Sol low validation passed **328/328**: 205 core, 44 workflow steps, 65 mode/verdict and 14 permission cases. [Release notes](docs/RELEASE_NOTES_0.8.1.md) · [Worked delivery examples](docs/guides/delivery-examples.md).

Pin the GitHub plugin to `v0.8.1`:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.8.1
codex plugin add repo-doctor@repo-doctor-marketplace
```
Install the exact npm version (seven recommended Skills, or all 41):

```bash
npx repo-doctor-skills@0.8.1 install --agent codex
npx repo-doctor-skills@0.8.1 install --preset full --agent codex
```

Choose one installation method per agent. The official skills CLI installs from the public GitHub source.

## Documentation

- [Problem → Skill](docs/guides/problem-to-skill.md)
- [User manual](docs/USER_MANUAL.md)
- [Skill catalog](docs/SKILL_CATALOG.md)
- [Advanced usage: plugins, platforms, versions, source builds](docs/ADVANCED_USAGE.md)
- [Contributing](CONTRIBUTING.md)

[MIT](LICENSE)
