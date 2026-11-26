**English** | [简体中文](./README.zh-CN.md)

# Repo Doctor

**Make AI coding safer, not slower.**

Safe, scoped, and verifiable code changes for AI coding agents.

Keep AI edits focused, spot when they touch your uncommitted work, and see what was actually verified. Available for OpenAI Codex, Claude Code, Cursor, GitHub Copilot, Gemini CLI and OpenCode. See the matrix for tested capabilities.

## Quick start

Run this in your project and select your coding agent.

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

Start a new session and describe the change, scope and behavior to preserve in your own words. Use `$repo-doctor-router` if you want a Skill recommendation. The public **0.12.0** release includes Change Guard. The Receipt and Skills lint demos below use this checkout.

## Minimal example

| What you can ask | How Repo Doctor helps |
| --- | --- |
| “Fix the order list that stays stale after an edit. Preserve the existing business rules.” | Reproduce the behavior, trace the refresh path, keep the fix local and report focused regression results. |
| “Add a search filter to the order page. Keep my uncommitted work.” | When appropriate, the candidate records the initial Git state and flags later changes to files you had already edited. |
| “Fix this TypeScript error. Keep dependencies as they are.” | The candidate can surface dependency manifest and lockfile changes after the baseline so you can check their scope. |
| “Change the copy on this button.” | A focused check can be enough. The observed low-risk Codex example stayed light without a baseline. |

More examples cover style changes, shared request helpers, bulk approval and resuming a task. [Natural-language examples](docs/guides/repo-doctor-scenarios.md)

## 30-second Quick Demo

Run from this checkout in a shell after `npm ci`. Both examples use disposable folders.

**Create a PR receipt.** Capture a baseline, make a sample edit, and paste the Markdown output into a PR description.

```bash
demo=$(mktemp -d)
git -C "$demo" init -q
node bin/repo-doctor-skills.mjs change begin --root "$demo" --id receipt-demo --scope demo.txt
printf 'Example change\n' > "$demo/demo.txt"
node bin/repo-doctor-skills.mjs receipt export --root "$demo" --id receipt-demo
```

**Lint a Skill offline.** Replace the sample directory with any directory containing `SKILL.md` files.

```bash
demo=$(mktemp -d)
mkdir "$demo/demo-skill"
printf '%s\n' '---' 'name: demo-skill' 'description: Summarize meeting notes.' '---' 'List the decisions.' > "$demo/demo-skill/SKILL.md"
node bin/repo-doctor-skills.mjs skills lint "$demo" --json
```

### Export a Verification Receipt

Try asking: “Fix the stale order list, preserve my uncommitted edits, run the focused tests, and give me a verification summary for the PR.”

With the CLI from this checkout, export using the ID of the Change Guard baseline captured before edits. A Task State checkpoint with the same ID is optional.

```bash
node bin/repo-doctor-skills.mjs receipt export --id order-list-fix
node bin/repo-doctor-skills.mjs receipt export --id order-list-fix --format json
```

Paste the Markdown into the PR description. It shows the declared scope, observed changes and recorded verification. A matching dependency fingerprint covers only the recorded inputs. The export does not run tests or reattest the original execution or environment. Missing coverage stays unknown. Add `--out receipt.md` to create a new file inside the repository without replacing an existing file.

### Lint your own Skills

Run the linter from this checkout against a directory or a single `SKILL.md`. With no paths it scans the current directory. It skips discovered symlinks, version control metadata and `node_modules`.

```bash
node bin/repo-doctor-skills.mjs skills lint ./my-skills --json
```

The offline check reads YAML frontmatter and Markdown. It requires no Repo Doctor manifests. JSON diagnostics include the path, severity, rule ID and a fix suggestion. Exit codes are `0` for clean results or warnings only, `1` for errors, and `2` for command failures. Budget estimates, potential routing overlap and missing permission boundaries are prompts for review.

## How it works and where it stops

- **Match verification to risk.** Skills guide root-cause investigation, scoped edits and regression tests. Prior evidence can be reused when its inputs, worktree and environment still match.
- **Compare the worktree when it matters.** Four candidate writing Skills share a local runtime. With Node, Git and permission to use project-local state, they can record a baseline and check before handoff. Each of these Skills bundles the runtime when installed through the Skills CLI.
- **Review what actually changed.** Findings identify observed changes, risks and unknown coverage. Check them against the authorized task. Ignored files and transient concurrent writes may be invisible. Business behavior still needs focused verification.

In Codex, the existing user note was preserved and all three targeted repeats ran the checks. A shared-module task missed earlier and triggered on retry. Median baseline and check times on a 251-tracked-file macOS fixture were 170–255 ms and 142–229 ms, including Node startup. [Live observations](docs/research/change-guard-integration.md) · [Reproducible disposable Git example](docs/guides/change-guard-demo.md)

## Hosts and installation

Use one installation channel per agent. Project scope is the default. Add `-g` for user-wide installation. The installation and standalone runtime results below use Skills CLI **1.9.0** and the frozen candidate.

| Agent | Targeted install | Verified scope |
| --- | --- | --- |
| OpenAI Codex | `npx skills@latest add dss-time/repo-doctor-skills -a codex` | Project/global install. Candidate host discovery, body loading, automatic calls and some report handling observed. |
| Claude Code | `npx skills@latest add dss-time/repo-doctor-skills -a claude-code` | Project/global install and standalone runtime. Host execution unverified. |
| Cursor | `npx skills@latest add dss-time/repo-doctor-skills -a cursor` | Project/global install and standalone runtime. Host execution unverified. |
| GitHub Copilot | `npx skills@latest add dss-time/repo-doctor-skills -a github-copilot` | Project/global install and standalone runtime. Host execution unverified. |
| Gemini CLI | `npx skills@latest add dss-time/repo-doctor-skills -a gemini-cli` | Project/global install and standalone runtime. Host execution unverified. |
| OpenCode | `npx skills@latest add dss-time/repo-doctor-skills -a opencode` | Project/global install and standalone runtime. Host execution unverified. |

Skills CLI 1.9.0 requires Node **22.20.0+**. Use current LTS. The bundled Repo Doctor CLI and candidate runtime support Node 18+. Worktree comparisons need local Git. [Agent installation, permissions, upgrades and local Beta checks](docs/AGENT_COMPATIBILITY.md) · [Other existing installation channels](docs/ADVANCED_USAGE.md)

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
