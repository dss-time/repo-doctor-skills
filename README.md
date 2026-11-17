**English** | [简体中文](./README.zh-CN.md)

# Repo Doctor Skills

[![XERJ Corpus Hub contributor](https://hub.xerj.org/contributors/dss-time/badge.svg)](https://hub.xerj.org/contributors/dss-time)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen) ![Agent Skills](https://img.shields.io/badge/Agent-Skills-blue) ![Codex](https://img.shields.io/badge/Codex-Compatible-blue) ![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-orange)

Help your AI agent diagnose bugs, implement features, review code and verify results within explicit safety boundaries, using rules matched to your project's languages and runtimes.

From a local fix to authorized multi-stage delivery: use one Skill for a small task, or reuse existing authorization and valid evidence to move through dependent stages.

Version **0.11.0** contains 34 Skills, including 27 Repo Doctor engineering Skills. [GitHub Release](https://github.com/dss-time/repo-doctor-skills/releases/tag/v0.11.0) · [npm](https://www.npmjs.com/package/repo-doctor-skills/v/0.11.0) · [Release notes](docs/RELEASE_NOTES_0.11.0.md).

Release validation uses fresh source-bound model cases and isolated coordination trials. See the [validation record](docs/RELEASE_VALIDATION_0.11.0.md) for results and limits. Earlier 0.10.0/0.10.1 reports remain historical evidence for their original content.

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

## Why Repo Doctor Skills

| Advantage | What it means for your work |
|---|---|
| **Protect your existing project** | Check authorization and business behavior, existing-data update semantics and preexisting edits before changes. Inspect actual environments and side effects before tests or builds. Unknown risks block affected operations. |
| **Progressive context disclosure** | Hosts with native Skills support discover capabilities through names and descriptions, load the selected Skill's body, then read references as needed, avoiding loading the entire instruction collection upfront. |
| **Language- and runtime-aware rules** | Apply checks to relevant components. Pure JS/TS does not inherit C/C++ memory-management requirements; native, embedded and mixed-stack work requires checking the corresponding boundaries and available validation tools. |
| **Individual Skills that connect into workflows** | Use focused requirements, diagnosis, implementation, testing and review capabilities independently, or coordinate them serially within existing authorization. Reuse valid acceptance evidence to reduce repeated confirmations and checks. |
| **Evidence behind completion claims** | Distinguish implemented, verified, deferred and blocked work. Script inspection is not a passing test, and a local check is not full delivery. Published versions include source-bound model evaluation records. |
| **Flexible installation, English and Chinese** | Install a recommended set, a subset or one Skill. Bilingual content and platform adapters support different hosts; the bundled installer supports language selection and replacement of selected same-name Skills. |

Skill instructions guide safe execution; enforcement still depends on host tools, sandboxes and approval controls. Cross-language support does not mean every language, framework or device has been validated.

### How on-demand loading works

```text
Name and description → Match the task → Read the selected Skill → Read references or use scripts as needed
```

For example, feature implementation selects rules for the actual stack, reads the testing contract when authoring tests, and loads the workflow protocol for multi-stage continuation or recovery. Installing all Skills does not mean loading all bodies for every task. Loading behavior depends on the host; generic prompt imports do not guarantee automatic disclosure, and the current bilingual bodies add context when a Skill is activated. No universal Token savings percentage has been measured.

**Included in 0.11.0:** [adaptive single-agent / multi-agent execution](docs/MULTI_AGENT_WORKFLOW.md), plus [project initialization, task checkpoints and read-only installation diagnosis](docs/PROJECT_STATE.md). Existing Skills remain independently usable. Project setup remains optional.

Current source also strengthens **project convention adaptation**: direct implementation, fix, test and documentation calls check applicable instructions, configuration and nearby style for the target directory and stack before editing, without project initialization. Changes stay within the task; configuration discovery does not execute configuration code, format the whole repository or silently store personal preferences. See [user workspace safety](packs/engineering/repo-doctor/references/user-workspace-safety.en.md#5-adapt-to-project-conventions-within-the-edit-scope). Actual adherence depends on the host and model.

## Codex plugin

For the current source engineering collection (27 Skills):

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

Install all 34 source Skills for Codex:

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


## v0.11.0 stable release

Version 0.11.0 contains 34 Skills (27 in Repo Doctor) and 34 ChatGPT ZIPs. It adds adaptive execution, project/task state, installation diagnosis and scoped project convention rules. Earlier PDF/Word/Excel removals and requirements/planning consolidations remain in effect. [Release notes](docs/RELEASE_NOTES_0.11.0.md) · [Worked delivery examples](docs/guides/delivery-examples.md).

When upgrading, use `requirements-clarification` for the former `requirements-to-spec` tasks and `safe-change-plan` for the former `spec-to-work-items` tasks. Previously installed directories for removed or merged Skills require manual cleanup after reviewing any local customizations. See the [migration notes](docs/RELEASE_NOTES_0.11.0.md#install-and-upgrade).

Pin the GitHub plugin to `v0.11.0`:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.11.0
codex plugin add repo-doctor@repo-doctor-marketplace
```
Install the exact npm version (seven recommended Skills, or all 34):

```bash
npx repo-doctor-skills@0.11.0 install --agent codex
npx repo-doctor-skills@0.11.0 install --preset full --agent codex
```

Choose one installation method per agent. The official skills CLI installs from the public GitHub source.

## Adaptive execution mode

Version 0.11.0 adds `multi-agent-workflow` to the previous 33 Skills. Install it with the CLI:

```bash
npx repo-doctor-skills@0.11.0 install --skill multi-agent-workflow --agent codex
```

Keep the existing Skills needed by your task installed alongside it. Ask for automatic mode selection, or let the agent select this entry for independent work that needs coordination. Small fixes and ordinary direct Skill calls use their existing owner. Parallel execution requires host subagents; concurrent writers require isolated workspaces. The seven Recommended Skills remain the default selection.

```text
$multi-agent-workflow Choose single or multi for this task, then complete the authorized work. Reuse existing Skills, preserve my edits and verify the integrated result.
```

See [mode selection and examples](docs/MULTI_AGENT_WORKFLOW.md). Host capabilities determine whether native parallel execution is available.

## Local project and installation state

Version 0.11.0 adds optional project initialization, revision-checked task checkpoints and read-only installation diagnosis. Preview setup before applying it, and revalidate saved task evidence before continuation.

```sh
npx repo-doctor-skills@0.11.0 project init
npx repo-doctor-skills@0.11.0 task list
npx repo-doctor-skills@0.11.0 installations check
```

See [setup, task and migration commands](docs/PROJECT_STATE.md). The same commands can run from a local checkout.

## Documentation

- [Problem → Skill](docs/guides/problem-to-skill.md)
- [User manual](docs/USER_MANUAL.md)
- [Skill catalog](docs/SKILL_CATALOG.md)
- [Advanced usage: plugins, platforms, versions, source builds](docs/ADVANCED_USAGE.md)
- [Contributing](CONTRIBUTING.md)

[MIT](LICENSE)

## Language-aware security

Engineering Skills select checks per language/runtime and component. Pure JS/TS does not inherit C/C++ memory-management requirements; native boundaries are assessed separately. Shared untrusted-input rules preserve execution scope. See [security evaluation and limitations](evals/security/README.md).

Workflows reuse existing authorization within its scope and valid acceptance evidence. Language/runtime profiles load for relevant components. When the user explicitly requests batch verification, Skills record `verification_deferred` and pending checks until the agreed validation point.

User-project safety guidance covers preserving authorization/business behavior, existing-data update semantics, actual test/build isolation, and preexisting/concurrent edits. Relevant implementation and review Skills load applicable rules. Unresolved risks block affected operations. See [user workspace safety](packs/engineering/repo-doctor/references/user-workspace-safety.en.md).

Current source-bound evaluation and local checks are recorded in [0.11.0 validation](docs/RELEASE_VALIDATION_0.11.0.md). The [0.10.1 evidence reuse record](tests/reports/release-promotion-0.10.1.json) and earlier [development evaluations](tests/reports/unified-validation-2026-11-05/README.md) remain historical.
