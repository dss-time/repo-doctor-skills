# Repo Doctor Skills User Manual

This manual is for people encountering AI Skills for the first time. It starts with practical task entry points, then explains platform differences, safety boundaries, and maintenance. See the [complete Skill catalog](SKILL_CATALOG.md) for every Skill and the [workflow cookbook](WORKFLOW_COOKBOOK.md) for multi-Skill recipes.

> Documentation verified on 2026-07-15. Product interfaces and host capabilities can vary by version, plan, and workspace policy. When an entry described here is not visible, follow the current host UI and administrator policy.

## 1. What This Project Is

### Skill, in plain language

A Skill is a reusable set of working instructions. It tells an AI when to take a task, what evidence to inspect, which sequence to follow, what it may and may not do, and how to report the result. It is not a separate model, and installing it does not automatically grant access to your computer.

Repo Doctor Skills organizes these instructions into installable, buildable, cross-platform Packs. It covers four broad needs:

- understanding, reviewing, diagnosing, and safely changing software repositories;
- writing reports and research briefs, cleaning spreadsheets, and reviewing documents;
- tightly scoped basic, read-only checks of PDF, Word, and Excel material;
- helping maintainers create and audit Skills.

### Who it is for

- General users who want a copyable request without first learning repository internals.
- Developers using Codex, Claude Code, Cursor, or another host for safe project analysis or changes.
- Skill maintainers who need one canonical source and validated plugin and cross-platform outputs.

### What it is not

- It is not a one-click agent that fixes every issue automatically.
- It does not bypass host permissions, administrator policy, or human approval.
- It is not a release, deployment, tagging, committing, or pushing service.
- It is not a source of truth by itself; claims still need repository files, logs, tests, or reliable sources.
- It is not a private business knowledge base and contains no stock screening, valuation weights, trading advice, or other private investment strategy.

This public repository contains only cross-industry, public-safe engineering and productivity capabilities. Customer material, internal company workflows, credentials, real portfolios, and private analysis rules belong in separately controlled private systems and must not be added here or uploaded to an untrusted Skill.

## 2. A 30-Second First Run

If the Repo Doctor plugin is installed in a Codex environment that supports `$` Skill invocation, open a new task in the target repository and enter:

```text
$repo-onboarding

Help me understand this repository's technology stack, main entry points, build commands, test commands, and recommended reading order.
Do not modify any files. Mark anything you cannot verify as unknown.
```

If the current platform does not support `$`, use natural language:

```text
Use repo-onboarding to explain this repository's technology stack, main entry points, build commands, test commands, and recommended reading order.
Do not modify any files. Mark anything you cannot verify as unknown.
```

This first step is read-only. Review the result before deciding whether to proceed to impact analysis, a change plan, or an implementation Skill.

## 3. Choose a Pack, Then a Skill

The canonical source currently contains four active Packs. The latest counts, permissions, and per-Skill examples are generated from canonical metadata in the [complete Skill catalog](SKILL_CATALOG.md).

| Pack | Use it for | Do not use it for |
|---|---|---|
| Repo Doctor | Repository orientation, requirements, bug/CI diagnosis, review, impact analysis, planning, controlled fixes, tests, release gates, and specialist risk reviews | General office writing, research, or file-content organization |
| Productivity Toolkit | Reports, research briefs, spreadsheet cleaning, document/PDF review, meeting actions, presentation outlines, and cross-artifact consistency | Production-code changes or release execution |
| Skill Maintainer | Creating one repository-standard Skill or performing a read-only pre-release audit of a Skill, Pack, plugin, or generated output | Ordinary business work or a one-off simple prompt |
| Document Data Doctor | Explicitly lightweight, read-only, text-only PDF/Word checks and read-only Excel data-quality audits | General PDF/Word review, OCR/rendering/complex layout, cleaning, or rewriting |

### Release version and maturity

This checkout is preparing project version **0.2.0** as a Release Candidate, not announcing a completed publication. Project version, Pack/plugin component versions, individual Skill versions, and maturity status are separate. All 4 active Packs and 38 active Skills use `beta`: they have passed repository contracts and are suitable for real tasks, but they do not yet have enough broad public-use or Live-model routing evidence for `stable`. Beta does not mean unusable; stable would not mean bug-free. Live-model routing accuracy remains **UNKNOWN**. See [Versioning and Lifecycle Policy](VERSIONING.md) for exact component baselines and the historical tag-label exception.

### Common choices

| Goal | Start with | Difference from a nearby Skill |
|---|---|---|
| Understand an unfamiliar repository | `repo-onboarding` | `project-health-check` is a broad audit, not an orientation guide |
| Turn an ambiguous request into testable requirements | `requirements-to-spec` | `safe-change-plan` needs sufficiently confirmed input before planning implementation |
| Find a bug's cause | `bug-root-cause-analysis` | `safe-fix-implementation` changes production code only after authorization |
| Understand who a change affects | `change-impact-analysis` | Follow with the API, database, dependency, or other specialist review only when relevant |
| Identify test gaps only | `test-gap-analysis` | `safe-test-implementation` edits tests and requires explicit authorization |
| Diagnose CI | `ci-failure-diagnosis` | A runtime bug without CI context belongs to root-cause analysis |
| Produce a formal report | `report-writer` | Start with `research-brief` when gathering and cross-checking evidence is the primary work |
| Clean a spreadsheet into a new output | `spreadsheet-data-cleaning` | Use `excel-data-quality-check-basic` when you only want a read-only issue report |
| Review an ordinary Word document or PDF | `document-review` / `pdf-review` | Use a Basic Skill only for an explicitly lightweight, text-only check |
| Reconcile figures and terms across artifacts | `content-consistency-check` | Use `document-review` for the overall quality of one document |
| Create or audit a Skill | `skill-authoring` / `skill-quality-audit` | The former is a controlled writer; the latter is strictly read-only |

When unsure, state the goal, allowed modification scope, available material, and expected output. Let the host route from the description. A vague request such as “handle this” increases routing ambiguity.

## 4. Install and Use in Five Minutes

### Prepare the build artifacts

If you have repository source rather than released ZIPs or an installed plugin, run from the repository root:

```bash
npm run validate
npm test
npm run build
```

The full build uses `packs/` as the only canonical source, synchronizes `plugins/`, and produces seven regular platform targets plus plugin-backed ChatGPT ZIPs under `dist/`. ChatGPT packaging also requires a `zip` executable on `PATH`. Do not hand-edit Skill logic in `plugins/` or `dist/`.

### 4.1 ChatGPT web: upload one Skill ZIP

Use this route when you want a few Skills rather than a whole plugin.

1. Run the full build and open `dist/chatgpt-skills/`.
2. Select the required `.zip` file, not the same-named expanded inspection directory.
3. In ChatGPT, go to **Profile → Skills → Create → Upload from your computer**. Labels can vary by product version or workspace policy.
4. Upload it and review the safety scan. If the result is `Needs Review` or `Blocked`, inspect the source and content; do not bypass organization policy.
5. Start a new task and describe the goal naturally. ChatGPT may select an installed Skill from its description; availability of an explicit Skill picker depends on the current interface.

ZIP prefixes make a growing library searchable:

| Prefix | Source | Example |
|---|---|---|
| `rd-*` | Repo Doctor | `rd-repo-onboarding.zip` |
| `pt-*` | Productivity Toolkit | `pt-report-writer.zip` |
| `sm-*` | Skill Maintainer | `sm-skill-quality-audit.zip` |

Installed display names also begin with `RD ·`, `PT ·`, or `SM ·`. Do not rename the ZIP's internal `name` to Chinese or to a space-containing label; the builder already places the Chinese purpose in the display name and bilingual description.

The three Document Data Doctor Basic Skills currently have no standalone ChatGPT ZIP. Seven regular platform targets does not mean that every Skill has a web upload package.

**Invocation note:** for a personally uploaded ChatGPT Skill, this manual guarantees only natural-language selection and the controls exposed by the current interface. Do not assume `$skill-name` or `@skill-name` is available in every ChatGPT web version.

### 4.2 ChatGPT Work / Codex: install a plugin

Use this route when you want a whole Pack and plugin-level Skill discovery.

The official plugin interface can appear under Work in ChatGPT or under Work/Codex → Plugins in the desktop app. Availability depends on product version, plan, and workspace administration. This repository provides three synchronized plugins: `repo-doctor`, `productivity-toolkit`, and `skill-maintainer`.

With Codex CLI, add this repository as a marketplace:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

That command resolves the published remote `main`; it cannot include uncommitted local work. To evaluate the current checkout, use its local `.agents/plugins/marketplace.json` through a host that supports local marketplace discovery, or use locally built artifacts. The exact local entry remains host-dependent.

Then enter `/plugins` in Codex, install the desired plugin, and start a new task. If the current version rejects the command or exposes no Plugins page, the state is **UNKNOWN / unsupported by the current host**; do not alter repository files to simulate installation.

On a ChatGPT plugin surface that supports explicit invocation, type `@` to search for a plugin or bundled Skill. Actual plugin UI names come from `plugins/**/skills/*/agents/openai.yaml`. If a newly installed Skill is absent from an existing task, open a new task or refresh as required by the host.

### 4.3 Codex: plugin Skills versus combined AGENTS instructions

**Recommended: plugin installation.** Once installed, you can:

- enter `/skills` to inspect discovered Skills;
- explicitly invoke a canonical slug such as `$repo-onboarding`;
- or describe the task and let Codex select from the description.

**Project-instruction option:** `dist/codex-zh-CN/AGENTS.md` renders all active Skills into one Chinese Codex project-instruction file. When copying or referencing it, preserve the complete `dist/codex-zh-CN/` target so `AGENTS.md` stays with sibling `references/`, `assets/`, and `scripts/`; then use natural-language requests.

Do not confuse the two: combined `AGENTS.md` provides persistent project instructions, but it does not install individually `$`-discoverable Skills. Prefer the plugin when `$` discovery is required.

### 4.4 Claude Code

The generated structure is:

```text
dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md
```

Copy the generated `.claude/skills/` directory into the target Claude Code environment, then use the discovery mechanism supported by that Claude Code version. The repository guarantees the generated structure, not a hard-coded slash command. If no command list is shown, name the Skill slug and task in natural language.

### 4.5 Cursor

The generated structure is:

```text
dist/cursor-zh-CN/.cursor/rules/<skill-name>.mdc
```

Copy the generated `.cursor/rules/` into the target project. The current build actually produces `.mdc` rule files; it does not also produce a Cursor `AGENTS.md`. Automatic loading and rule scope depend on the current Cursor version and file configuration. Still state the goal, scope, and write authorization explicitly in the task.

### 4.6 Qwen, Kimi, and generic Prompt Packs

Generated files are under:

```text
dist/qwen-zh-CN/
dist/kimi-zh-CN/
dist/generic-zh-CN/
dist/generic-en/
```

These are ordinary Markdown prompts, not native installation packages that this repository can validate. Put their content in a host-supported project/system-instruction location or paste it into the conversation. If a prompt links to sibling `references/`, `assets/`, or `scripts/`, copy the complete target directory; copy one Markdown file only when it has no resource links. Use natural language; do not assume `$`, `@`, or a slash command exists.

### Platform and invocation quick reference

| Platform/artifact | Install or place | Explicit invocation | Reliable fallback |
|---|---|---|---|
| ChatGPT single-Skill ZIP | Profile → Skills → Create → Upload | Interface-dependent; no general `$`/`@` guarantee | Describe the task naturally and use the current Skill picker if available |
| ChatGPT plugin | Install under Work/Plugins | `@` on supported plugin surfaces | Select the plugin in a new task and ask naturally |
| Codex plugin | Marketplace + `/plugins` | `$slug` or `/skills` | Say “use `<slug>`” |
| Codex `AGENTS.md` | Place in a supported project-instruction context | No per-Skill `$` guarantee | Natural language |
| Claude Code Skill | `.claude/skills/` | Current-host dependent | Slug + natural-language task |
| Cursor rule | `.cursor/rules/*.mdc` | Not guaranteed by this repository | Natural language |
| Qwen/Kimi/generic Markdown | Project/system prompt or conversation | Not guaranteed by this repository | Paste prompt + natural language |

## 5. Write Requests That Route Well

A useful request normally includes five things:

1. **Goal:** understand, diagnose, review, plan, or implement.
2. **Evidence:** repository, diff, logs, files, meeting notes, or dataset.
3. **Scope:** included and excluded directories, versions, dates, or material.
4. **Permission:** read-only or the exact files and commands authorized.
5. **Deliverable:** issue list, specification, plan, new copy, report, or release-gate decision.

Copyable template:

```text
Use <skill-slug> for this task.

Goal: <what I need>
Evidence: <repository, files, logs, or material>
Scope: <included and excluded items>
Permission: start read-only; explain and wait for confirmation before writing or running commands
Output: <expected structure and language>

Mark missing evidence as UNKNOWN with assumptions and confidence. Do not invent it.
```

In a Codex plugin that supports `$`, replace the first line with `$<skill-slug>`. With a ChatGPT ZIP, select the prefixed `RD ·`, `PT ·`, or `SM ·` Skill when needed, or describe the task naturally.

## 6. Permissions, Risk, and Safety Gates

### Metadata is an intent ceiling, not automatic authorization

Every canonical `skill.yaml` declares file reading, file writing, shell, network, and destructive-action permissions, plus a default `risk_level`. The host sandbox, organization policy, and user authorization still determine actual capability. Write-capable metadata does not allow an AI to exceed your scope, and read-only metadata must never be treated as implicit write authorization.

The permission fields are `read_files`, `write_files`, `run_shell_commands`, `access_network`, and `destructive_actions_allowed`. These booleans state the Skill's designed capability ceiling; they do not prove that the host granted those capabilities.

| Default risk | What it means to a user |
|---|---|
| `read_only` | Read-only analysis; no file modification |
| `advisory` | Specifications, recommendations, plans, or gate decisions; no plan execution |
| `tool_execution` | Controlled local tools may be used for evidence; this does not imply file-write permission |
| `networked` | The task may need online sources; network access, source rules, and privacy controls still apply |
| `safe_edit` | Minimal writes inside an explicitly authorized scope, followed by Skill-specific validation |

Every active Skill in this repository forbids destructive actions. `safe_edit` still does not authorize broad refactoring, overwriting source material, committing, pushing, releasing, or production access.

### Pause before moving from read to write

Use this safety gate:

```text
Read-only analysis → evidence and scope → implementation plan → user confirms write scope → minimal change → validation → read-only review/release gate
```

Important boundaries:

- `safe-fix-implementation` addresses one confirmed high-priority production-code issue.
- `safe-test-implementation` defaults to tests, fixtures, and necessary test helpers only.
- `documentation-sync` defaults to documentation only.
- `architecture-decision-record` edits ADR/architecture documents only when explicitly requested.
- `spreadsheet-data-cleaning` writes a new cleaned output and does not overwrite source data.
- `document-review`, `report-writer`, and `presentation-outline` create or revise files only when explicitly requested and supported by available tools.
- `release-readiness-check` returns GO, GO WITH CONDITIONS, or NO-GO; it does not release.
- `skill-quality-audit` reports issues and never fixes them automatically.

See the [workflow cookbook](WORKFLOW_COOKBOOK.md) for full permission handoffs between Skills.

## 7. Output Language and Bilingual Names

- A Chinese request should produce Simplified Chinese by default; an English request should produce English.
- For mixed-language work, follow an explicitly requested output language; otherwise follow the primary input language.
- Skill slugs remain stable lowercase English with hyphens, such as `bug-root-cause-analysis`, for cross-platform and script compatibility.
- Display names combine the English name with a Chinese purpose. ChatGPT ZIPs additionally use `RD ·`, `PT ·`, or `SM ·` for searchability.
- Translation must not change permissions, risk, stop conditions, or responsibility boundaries. Report a mismatch and use canonical metadata plus task evidence rather than silently choosing a broader interpretation.

## 8. What Happens When Tools Are Unavailable

A Skill describes a workflow; it does not guarantee that a host provides a filesystem, shell, network, browser, OCR, DOCX/XLSX/PDF/PPTX processing, or rendering.

Correct degradation means:

- state which capability is missing and which conclusions cannot therefore be verified;
- complete the parts still supported by supplied text or evidence;
- mark unverified page numbers, visual checks, current sources, formulas, and format fidelity as UNKNOWN;
- give the user a next step instead of claiming to have read, rendered, searched, or generated a file;
- keep source files read-only and write transformations or cleaning results to a new location.

For example, without OCR or rendering, `pdf-review` can inspect reliably extracted text but cannot claim it checked scanned pages or visual layout. Without network access, `research-brief` cannot claim current research. Without presentation tools, `presentation-outline` produces an outline and cannot claim to have generated PPTX.

## 9. FAQ and Troubleshooting

### A Skill is missing after installation

1. Confirm that you installed the ZIP file or correct plugin, not the expanded directory or canonical source directory.
2. Start a new task or refresh as required; an existing task may not rediscover installations.
3. Search by canonical slug; for ChatGPT ZIPs also search `RD ·`, `PT ·`, or `SM ·`.
4. Confirm that your workspace administrator permits personal Skills or plugins.
5. In Codex, inspect installation with `/plugins` and discovery with `/skills`.
6. If it is still absent, record the host version, installation surface, and error. Do not assume the Skill content is the cause without evidence.

### Why does `$repo-onboarding` do nothing in ChatGPT web?

`$slug` is an explicit Codex Skill invocation, not a universal ChatGPT web guarantee. Use natural language or the current Skills interface for a personal upload. On a plugin surface that supports explicit invocation, use `@` to search.

### Why is the ChatGPT ZIP named `rd-repo-onboarding` while the plugin uses `repo-onboarding`?

The prefix is a web-library search and collision-avoidance strategy. The canonical slug remains `repo-onboarding`; the ChatGPT ZIP builder adds `rd-`, `pt-`, or `sm-`. They are not duplicate Skills.

### What should I do with Needs Review or Blocked?

Those are ChatGPT safety-scan states. Review source, content, tools, and permissions, and contact the administrator in an organization workspace. Do not remove safety guidance, disguise permissions, or bypass policy simply to pass scanning.

### Why is there no Document Data Doctor ZIP or plugin?

Its three Basic Skills currently enter the seven regular cross-platform targets, but have no standalone plugin or ChatGPT ZIP. This is the actual distribution boundary, not a missing build.

### Should I choose a Basic PDF/Word Skill or the general review Skill?

For an unqualified PDF/Word review, use `pdf-review` or `document-review`, which degrades in place when tools are unavailable. Use `pdf-review-basic` or `word-document-review-basic` only when you explicitly want a lightweight, read-only, text-only check without OCR, rendering, complex formatting, or revisions.

### Can I invoke several Skills at once?

You can split work into consecutive steps, but do not assume the host automatically chains them without conditions. Use one primary Skill per step, pass the previous output as evidence, and reconfirm permission when moving from analysis to writes. See the [workflow cookbook](WORKFLOW_COOKBOOK.md).

### Will a Skill automatically edit, commit, or release?

No. Only a small set of `safe_edit` Skills write within explicit scope. Commits, pushes, tags, deployments, and releases are outside default authorization. A release gate only returns a decision.

### What if facts are missing from research or documents?

They must be marked as unknown, limited, assumed, or low-confidence. The Skill must not invent figures, sources, page numbers, owners, dates, or conclusions. Confirm network and source access before requesting current research.

### Can these Skills perform stock research or give investment advice?

No. The public repository explicitly excludes private investment strategy, stock screening, valuation weights, real watchlists, and trading recommendations. Do not add them to a public Pack.

### Should I edit `packs/`, `plugins/`, or `dist/`?

Maintain canonical content only under `packs/`, then synchronize, validate, and rebuild. `plugins/` is synchronized compatibility/distribution output and `dist/` is generated cross-platform output. Neither is a second hand-maintained source of Skill logic.

## 10. Maintainer Entry Points

If you need to create or audit a Skill, start here:

- [Adding Skills](ADDING_SKILLS.md)
- [Skill specification](SKILL_SPEC.md)
- [Style guide](STYLE_GUIDE.md)
- [Localization policy](LOCALIZATION_POLICY.md)
- [Platform adapters](PLATFORM_ADAPTERS.md)
- [Maintainer checklist](MAINTAINER_CHECKLIST.md)
- [Versioning and lifecycle policy](VERSIONING.md)
- [Contributing guide](../CONTRIBUTING.md)
- [Security model](SECURITY_MODEL.md)
- [Public/private boundary](PUBLIC_PRIVATE_BOUNDARY.md)

Baseline maintenance sequence:

```bash
npm run docs:generate
npm run validate
npm test
npm run build
npm run docs:check
```

Do not edit generated artifacts directly, overwrite other work without inspecting the workspace, or place machine-specific absolute paths, secrets, or customer data in documentation or examples.

## 11. Official Platform References

These sources were used to verify current ChatGPT/Codex Skill and plugin entry points. All were accessed on **2026-07-15**:

- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills) — Skill structure, progressive loading, and Codex `$` and `/skills` discovery.
- [OpenAI: Plugins](https://learn.chatgpt.com/docs/plugins) — ChatGPT Work/desktop plugin entry points and explicit `@` invocation.
- [OpenAI: Build plugins](https://learn.chatgpt.com/docs/build-plugins) — marketplaces, plugin layout, and Codex CLI management.
- [OpenAI Help: Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt) — web upload, automatic selection, safety scanning, and availability limitations.

Platform features change. This repository guarantees its canonical metadata, generated structures, and local validation; it does not guarantee identical buttons, invocation symbols, or tools across every host version.
