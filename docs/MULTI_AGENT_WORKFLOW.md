# Adaptive single-agent and multi-agent execution

[简体中文](MULTI_AGENT_WORKFLOW.zh-CN.md)

Current source adds one coordinator, `multi-agent-workflow`, to the existing Skills. Invoke it explicitly to let the agent choose a mode. Its activation description also allows host-selected activation for genuinely independent work needing coordination. Direct calls to an existing Skill retain that owner. Model activation depends on the host and is evaluated separately from deterministic packaging checks.

## Modes

| Situation | Selection |
| --- | --- |
| Exact typo, diagnosed local fix, tightly dependent change | `single` with the existing owner |
| Ordinary direct review request | existing `safe-code-review` |
| Independent read-only review assignments with available host workers | `multi`, fixed baseline and separate findings |
| Approved independent slices with stable contracts and isolated checkouts | `multi`, followed by lead integration and validation |
| Missing agents or no useful parallel work | `single`, explain fallback |
| Shared writes/resources without isolation | serialize affected work |
| User explicitly requests single | `single` |
| Independent-agent review is required but unavailable | keep that condition blocked |

The lead checks dependencies before selecting concurrency. Multiple files or long work alone do not establish independence. It may change mode at a real dependency boundary after accounting for existing workers and edits.

## Use

Install this entry plus the existing Skills required for the task. Version 0.11.0 includes 34 Skills; npm 0.10.1 retains the older 33-Skill set.

```sh
node bin/repo-doctor-skills.mjs install --skill multi-agent-workflow --agent codex
```

```text
$multi-agent-workflow Choose single or multi based on the actual task.
Implement the already approved feature slices within src/export/ and tests/export/.
Reuse valid analysis, preserve existing edits and run preflighted isolated checks.
Use independent workers only where dependencies and permissions allow it.
```

```text
$multi-agent-workflow Use independent read-only workers to inspect this diff
for intent fidelity and operational safety. Do not edit files or run commands.
Verify the findings and report actual worker identities and any limits.
```

A direct `$safe-fix-implementation` or `$safe-code-review` request remains valid. The coordinator does not replace the Router's recommendation-only role or the existing serial workflow registry.

## Execution and safety

The host supplies native child-agent tools, lifecycle observation and permissions. The coordinator uses actual tool calls and identifiers, bounded assignments and existing worker Skills. It does not install a background scheduler or configure the host.

Read-only workers can share a fixed baseline. Concurrent writers need separate verified workspaces. Shared contracts, lockfiles, generators, databases, ports and external services still require ordering or isolation. One lead verifies outputs, integrates scoped patches and checks the assembled behavior. A separate read-only worker reviews implementation delivery when supported. Required independence cannot be claimed during single-agent fallback.

Worker reports do not grant authority or prove successful execution. On cancellation or timeout, stop and inspect the original worker before retrying. Preserve user changes, uncertain effects, deferred verification and the existing authorization intersection. Worktree creation, Git merges, commit/push, cleanup and release actions require their applicable authorization and capability checks.

## Validation boundary

The development regression checks preserve a pinned source/runtime baseline for all 33 existing Skills, the shared protocols outside the explicitly pinned project-convention addition, and Registry, plus the unchanged seven Recommended Skills. They check additive generation and activation-case completeness. Semantic mode choice and actual native delegation require model/host trials. Published 0.10.0/0.10.1 evaluation reports certify their original release content, not this addition.

Canonical behavior and worker contracts live in the [Skill instructions](../packs/engineering/repo-doctor/skills/multi-agent-workflow/instructions.en.md) and [worker protocol](../packs/engineering/repo-doctor/skills/multi-agent-workflow/references/worker-protocol.en.md).

The historical [scoped development record](../tests/reports/multi-agent-workflow-development.json) records eight mode-selection scenarios, a separate safety review, and a native two-worker isolated implementation trial. The lead verified exact changed-file sets and preserved user notes, integrated both accepted outputs and passed five combined tests plus six additional boundary assertions. A fresh independent reviewer loaded safe-code-review and inspected the integrated result. Per-worker tool filtering, live Git merging and interrupted-worker recovery were outside this trial.
