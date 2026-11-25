**English** | [简体中文](./README.zh-CN.md)

# Repo Doctor

**Make AI coding safer, not slower.**

Safe, scoped, and verifiable code changes for AI coding agents.

Repo Doctor gives coding agents a way to check whether their edits touched your existing work, changed staging, or crossed an agreed boundary. In this source candidate, eligible engineering Skills share **Change Guard**, a local Git worktree comparison. They can use it alongside focused tests and existing engineering evidence.

## Quick start

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

Start a task in your coding agent and describe the work in your own words. You can also invoke a Skill directly or ask `$repo-doctor-router` for a recommendation.

## Minimal example

```text
Fix the label formatting bug in src/labels.mjs. Keep my uncommitted accessibility note in that file and leave unrelated files alone.
```

In the isolated Codex follow-up, a request to fix a label while preserving an existing user edit led to a baseline and a final warning for the edited path. The user note survived and the fixture checks passed. Three of four eligible candidate turns ran both checks. The public-module turn skipped them, and the low-risk edit stayed light. Invocation depends on Skill selection, host permissions and runtime availability. [Live observations and costs](docs/research/change-guard-integration.md)

On macOS with 251 tracked fixture files, median baseline time was 170–255 ms and median check time was 142–229 ms, including Node startup. Costs vary by worktree and environment. The candidate upgrade passed on macOS with Node 18 and 24. Linux and Windows runs are pending. [Candidate verification](docs/research/change-guard-integration.md#候选冻结和本轮补验)

## Explicit worktree comparison for diagnostics

The following commands run from a Repo Doctor source checkout against the Git worktree you choose. The published 0.11.1 CLI predates this workflow.

```bash
node bin/repo-doctor-skills.mjs change begin --root ../my-project --id export-fix --scope src/export --json
node bin/repo-doctor-skills.mjs change check --root ../my-project --id export-fix --json
```

A baseline makes it possible to distinguish an existing edit from a later change to the same file. For example, if a task touches a user-edited file and also updates a lockfile outside its scope, the JSON report flags both. The report leaves edit ownership unknown and puts remediation in the developer’s hands. Git-ignored work and transient concurrent changes can be invisible. Verify business behavior separately with focused tests. [Report fields, project policy and coverage limits](docs/PROJECT_STATE.md#change-guard).

[Try the verified disposable Git example](docs/guides/change-guard-demo.md).

## How it works

- **Change safety.** Existing Skills check user edits, business behavior and permission boundaries. Change Guard adds a Git-visible comparison for tasks where a persisted baseline helps.
- **Adaptive verification.** Choose checks by impact and evidence. Small tasks use focused checks. Contracts, data updates and permission boundaries can require isolated integration tests. [Execution modes](docs/MULTI_AGENT_WORKFLOW.md).
- **Engineering evidence.** Optional task checkpoints preserve history. The host revalidates execution receipts, worktree identity, relevant inputs and environment before reuse. [Workflow coordination](docs/WORKFLOW_COORDINATION.md).
- **Runs alongside your other tools.** Invoke a single Skill or use authorized coordination for dependent stages. Hosts choose when to load references and whether isolated parallel execution is available.

## Hosts and installation

Use current Node.js LTS. The bundled CLI supports Node 18 and later. The external Skills installer has its own Node requirements. Run the quick-start command in your target project and select your host and Skills. Native activation and tool permissions depend on the host.

| Host | Command or import |
|---|---|
| Codex | `npx skills@latest add dss-time/repo-doctor-skills -a codex` |
| Claude Code | `npx skills@latest add dss-time/repo-doctor-skills -a claude-code` |
| Cursor | `npx skills@latest add dss-time/repo-doctor-skills -a cursor` |
| WorkBuddy | Import the `skills/` directories using the host's local Skill import |

See [Advanced usage](docs/ADVANCED_USAGE.md) for additional hosts and bundled installation. The compatibility matrix covers Linux, macOS and Windows.

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


## v0.11.1 stable release

Version 0.11.1 contains 34 Skills (27 in Repo Doctor) and 34 ChatGPT ZIPs. It keeps the 0.11.0 runtime and adds unified multi-platform installation guidance for Codex, Claude Code, Cursor and WorkBuddy. [Release notes](docs/RELEASE_NOTES_0.11.1.md) · [Worked delivery examples](docs/guides/delivery-examples.md).

When upgrading, use `requirements-clarification` for the former `requirements-to-spec` tasks and `safe-change-plan` for the former `spec-to-work-items` tasks. Previously installed directories for removed or merged Skills require manual cleanup after reviewing any local customizations. See the [migration notes](docs/RELEASE_NOTES_0.11.1.md#install-and-upgrade).

Pin the GitHub plugin to `v0.11.1`:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.11.1
codex plugin add repo-doctor@repo-doctor-marketplace
```
Install the exact npm version (seven recommended Skills, or all 34):

```bash
npx repo-doctor-skills@0.11.1 install --agent codex
npx repo-doctor-skills@0.11.1 install --preset full --agent codex
```

Choose one installation method per agent. The official skills CLI installs from the public GitHub source.

## Adaptive execution mode

Version 0.11.0 adds `multi-agent-workflow` to the previous 33 Skills. Install it with the CLI:

```bash
npx repo-doctor-skills@0.11.1 install --skill multi-agent-workflow --agent codex
```

Keep the existing Skills needed by your task installed alongside it. Ask for automatic mode selection, or let the agent select this entry for independent work that needs coordination. Small fixes and ordinary direct Skill calls use their existing owner. Parallel execution requires host subagents; concurrent writers require isolated workspaces. The seven Recommended Skills remain the default selection.

```text
$multi-agent-workflow Choose single or multi for this task, then complete the authorized work. Reuse existing Skills, preserve my edits and verify the integrated result.
```

See [mode selection and examples](docs/MULTI_AGENT_WORKFLOW.md). Host capabilities determine whether native parallel execution is available.

## Local project and installation state

Version 0.11.0 adds optional project initialization, revision-checked task checkpoints and read-only installation diagnosis. Preview setup before applying it, and revalidate saved task evidence before continuation.

```sh
npx repo-doctor-skills@0.11.1 project init
npx repo-doctor-skills@0.11.1 task list
npx repo-doctor-skills@0.11.1 installations check
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
