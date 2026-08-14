# Repo Doctor Skills User Manual

This manual starts with the shortest supported path for a new Repo Doctor user. Platform packaging and maintainer details are collected in [Advanced Usage](ADVANCED_USAGE.md).

> Platform entry points were verified on 2026-07-15. Product interfaces, plans, and workspace policy can change; use the controls exposed by your current host.

## 1. Install

### Recommended: seven starter Skills

Run:

```bash
npx repo-doctor-skills install
```

This non-interactive installer writes only the seven Recommended Skills to the Codex Skills directory, verifies every installed `SKILL.md`, and prints `$repo-doctor-router` as the first command. The preset contains `repo-doctor-router`, `requirements-clarification`, `bug-root-cause-analysis`, `safe-fix-implementation`, `safe-test-implementation`, `safe-code-review`, and `decision-prototype`.

Use `--agent codex` to choose Codex explicitly. The installer does not identify an Agent merely because a directory exists. With no explicit agent, exactly one configured `CODEX_HOME` or `AGENTS_HOME` is treated as a reliable signal. If both are present, it exits without writing; if neither is present, it safely installs to the shared `~/.agents/skills` location and prints that exact target.

### Full: all 40 active Skills

```bash
npx repo-doctor-skills install --preset full
```

The source repository has 40 active Skills. The Repo Doctor plugin shows 27 because it contains only the engineering collection. The three current plugins contain 37 Skills in total. The remaining three Document Data Doctor Skills participate in regular platform builds and the Full source installer, but do not have a standalone plugin. No Skill is missing from the source inventory.

### Individual

Installing one Skill is an advanced workflow because the correct artifact and resource layout depend on the host. See [Advanced Usage](ADVANCED_USAGE.md#6-individual-skill-installation). It is intentionally not another first-run decision.

## 2. Try this first

In a repository task, enter:

```text
$repo-doctor-router

This API sometimes returns 500. I do not know whether to investigate first or edit it directly.
```

The default compact response follows this contract:

```text
Recommend: $bug-root-cause-analysis
Reason: This is a non-CI runtime failure whose cause should be verified before any fix.
Mode: fast
Needs: The error output and a minimal reproduction.
```

The Router stops there. Start a later turn with the recommended Skill if you want to continue.

## 3. Router

Not sure which Skill to use? Run `$repo-doctor-router`.

The Router:

- recommends one active Repo Doctor Skill;
- recommends `fast`, `standard`, or `audit`;
- stays read-only and does not run commands or edit files;
- never recursively invokes the recommendation;
- defaults to a short four-line answer.

It is a fallback, not a mandatory gateway. If you already know you need `$safe-code-review`, `$requirements-clarification`, or another Skill, invoke that Skill directly.

## 4. Common tasks

| Goal | Start with | Minimal request |
|---|---|---|
| Diagnose a runtime bug | `$bug-root-cause-analysis` | `Find the cause of this intermittent 500; do not edit files.` |
| Make one scoped fix | `$safe-fix-implementation` | `Fix this confirmed issue; writes are authorized only in <files>.` |
| Review code | `$safe-code-review` | `Review the current diff only; do not fix it.` |
| Clarify a requirement | `$requirements-clarification` | `Ask only the questions that materially change this work.` |
| Produce a testable specification | `$requirements-to-spec` | `Turn these settled requirements into acceptance criteria.` |
| Compare an uncertain approach | `$decision-prototype` | `Build a throwaway prototype to compare these two options.` |
| Analyze architecture friction | `$architecture-deepening-analysis` | `Analyze the repeated coupling; do not refactor.` |
| Gate a candidate release | `$release-readiness-check` | `Check whether this version is release-ready; do not release it.` |

A good request states the goal, evidence, scope, write permission, and expected output. Clear authorization still does not remove a Skill's safety boundary.

## 5. Problem → Skill

Use the [Problem → Skill guide](guides/problem-to-skill.md) when you know the problem but want a copyable shortest request. Use the [Skill Catalog](SKILL_CATALOG.md) when you need the complete inventory and detailed boundaries.

One primary Skill per step is the safest default. Repo Doctor does not assume that the host automatically chains Skills; pass the previous result as evidence and reconfirm permission before moving from analysis to writes.

## 6. Fast / Standard / Audit

| Mode | User meaning |
|---|---|
| **Fast** | Simple work: a few files, targeted validation, and a quick finish. |
| **Standard** | Normal development: relevant modules, relevant tests, and enough evidence. |
| **Audit** | Database, security, migration, and release work: complete evidence and permission gates. |

Fast never means skipping safety. Audit is not imposed on every small problem. A Skill escalates only when the task's actual risk, permission boundary, or evidence requirement calls for it.

## 7. Update

### Understand the two version layers

- **Project Release Version** identifies a tested repository snapshot, such as GitHub Release `v0.6.1`.
- **Plugin / Pack Component Version** identifies the individual distributed component, such as Repo Doctor `0.8.0`.

These versions describe different layers and do not have to match. A project release can include a component whose own contract did not change.

### Update a Codex plugin installation

There is no automatic-update capability promised by this project.

1. Read the release notes and choose the exact release tag you trust.
2. Refresh or replace the configured marketplace source so it points to that tag. For the current stable release, the verified source command is:

   ```bash
   codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.6.1
   ```

3. Reinstall or refresh **Repo Doctor** using the controls offered by your host.
4. Start a new task and use `/skills` to confirm discovery.

Use the development source only when deliberately testing unreleased work:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

The remote `main` branch can change and does not include uncommitted files from a local checkout. For downloaded ChatGPT ZIPs or copied platform outputs, download/build the new artifact, verify it, replace the previous installation through the host, and start a new task. See [Versioning and Lifecycle Policy](VERSIONING.md).

## 8. Advanced Usage

See [Advanced Usage](ADVANCED_USAGE.md) for:

- ChatGPT single-Skill ZIPs and the `rd-*`, `pt-*`, and `sm-*` names;
- ChatGPT plugin, Codex project instructions, Claude Code, Cursor, Qwen, Kimi, and generic prompts;
- source checkout, validation, build targets, platform differences, and single-Skill distribution;
- developer and maintainer entry points.

For deliberate multi-step work, continue from the [Workflow Cookbook](WORKFLOW_COOKBOOK.md). For the five-minute source workflow, see [Quick Start](QUICK_START.md).

## 9. Safety and troubleshooting

A Skill is a reusable working contract, not a separate model and not an automatic permission grant. The host sandbox, administrator policy, and your explicit scope always apply.

Metadata fields such as `risk_level` and `write_files` describe the Skill's designed ceiling. They do not grant access. Every active Skill forbids destructive actions; write-capable Skills still do not automatically authorize commits, pushes, tags, deployments, releases, production access, or broad refactors.

When moving from read-only work to edits, use this sequence:

```text
evidence and scope → plan → explicit write authorization → minimal change → validation → review or release gate
```

If a Skill is missing after installation:

1. Confirm that **Repo Doctor** is installed, not only its marketplace source.
2. Start a new task and inspect `/plugins` and `/skills`.
3. Search by the stable lowercase Skill name.
4. Confirm that workspace policy permits plugins.
5. Record the host version and exact error before blaming Skill content.

`$skill-name` is a Codex invocation and is not guaranteed in every ChatGPT web interface. Personally uploaded ChatGPT Skills should be selected through the current interface or by natural-language description. Missing filesystem, shell, network, OCR, or document tools must be reported as a limitation; the Skill must not pretend it inspected unavailable evidence.

## 10. Official platform references

These sources supported the platform descriptions and were accessed on 2026-07-15:

- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI: Plugins](https://learn.chatgpt.com/docs/plugins)
- [OpenAI: Build plugins](https://learn.chatgpt.com/docs/build-plugins)
- [OpenAI Help: Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt)

The repository guarantees its checked-in metadata and generated structures, not identical buttons or invocation symbols across every host version.
