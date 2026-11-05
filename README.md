**English** | [简体中文](./README.zh-CN.md)

# Repo Doctor Skills

[![XERJ Corpus Hub contributor](https://hub.xerj.org/contributors/dss-time/badge.svg)](https://hub.xerj.org/contributors/dss-time)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen) ![Agent Skills](https://img.shields.io/badge/Agent-Skills-blue) ![Codex](https://img.shields.io/badge/Codex-Compatible-blue) ![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-orange)

Focused Skills for debugging, code review, fixes, and tests.


The prepared stable release is **0.10.0** with 33 Skills; final publication is pending release gates. See [release notes](docs/RELEASE_NOTES_0.10.0.md) and [current validation](tests/reports/live-codex-skill-validation-0.10.0.json).

The final release Live-model report covers 284 scored core/workflow/mode/permission cases on GPT-6.1 Sol. Additional development security and user-workspace fixtures are recorded separately. Installation compatibility is checked by CI on Linux, macOS and Windows with Node 18 and current LTS.

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

Authorized multi-stage tasks can use [serial workflow coordination and evidence reuse](docs/WORKFLOW_COORDINATION.md). Simple tasks still use one Skill; automatic execution depends on the host.

## Codex plugin

For the complete engineering collection (26 Skills):

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

Install all 33 source Skills for Codex:

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

This alternative installs seven starter Skills by default and supports `en`, `zh-CN`, or `bilingual` bodies. Reinstalling replaces selected same-name Skills in the target directory, including local edits and old resources. Identical content is skipped. The bundled installer supports Node.js 18 and later. CI covers installation on Linux, macOS and Windows using Node 18 and current LTS, with full repository checks on Linux. The external skills CLI has its own Node requirements.


The stable npm installer replaces selected same-name Skill directories by default.

## v0.10.0 stable release

Version 0.10.0 contains 33 Skills (26 in Repo Doctor) and 33 ChatGPT ZIPs. Six PDF/Word/Excel Skills have been removed and two requirements/planning pairs have been consolidated. Final Live-model PASS evidence is bound to the release source. [Release notes](docs/RELEASE_NOTES_0.10.0.md) · [Worked delivery examples](docs/guides/delivery-examples.md).

Pin the GitHub plugin to `v0.10.0`:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.10.0
codex plugin add repo-doctor@repo-doctor-marketplace
```
Install the exact npm version (seven recommended Skills, or all 33):

```bash
npx repo-doctor-skills@0.10.0 install --agent codex
npx repo-doctor-skills@0.10.0 install --preset full --agent codex
```

Choose one installation method per agent. The official skills CLI installs from the public GitHub source.

## Documentation

- [Problem → Skill](docs/guides/problem-to-skill.md)
- [User manual](docs/USER_MANUAL.md)
- [Skill catalog](docs/SKILL_CATALOG.md)
- [Advanced usage: plugins, platforms, versions, source builds](docs/ADVANCED_USAGE.md)
- [Contributing](CONTRIBUTING.md)

[MIT](LICENSE)

## Language-aware security

Engineering Skills select checks per language/runtime and component. Pure JS/TS does not inherit C/C++ memory-management requirements; native boundaries are assessed separately. Shared untrusted-input rules preserve execution scope. See [security evaluation and limitations](evals/security/README.md).

P1 workflow updates reuse existing authorization and valid acceptance evidence. Execution boundaries are shared; language/runtime profiles load only for relevant components. Explicit user-directed batch verification records `verification_deferred` and pending checks until the agreed validation point. Security evaluation adds contextual injection inputs, accepted evidence locations, model binding and atomic checkpoints with separate semantic acceptance. Current validation evidence is recorded in the [unified validation report](tests/reports/unified-validation-2026-11-05/README.md).

User-project safety guidance now covers preserving authorization/business behavior, existing-data update semantics, actual test/build isolation, and preexisting/concurrent edits. Relevant implementation and review Skills load applicable rules; unresolved risks block affected operations. See [user workspace safety](packs/engineering/repo-doctor/references/user-workspace-safety.en.md). Current validation evidence is recorded in the [unified validation report](tests/reports/unified-validation-2026-11-05/README.md).
