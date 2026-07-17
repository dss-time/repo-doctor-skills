# Quick Start

This guide is for first-time users.

## Choose Your Guide

- Stay here for a 5-minute build-oriented start.
- Read the [User Manual](USER_MANUAL.md) for installation, invocation syntax, permissions, and troubleshooting.
- Open the [Complete Skill Catalog](SKILL_CATALOG.md) when you know the task but not the Skill name.
- Follow the [Workflow Cookbook](WORKFLOW_COOKBOOK.md) when a task needs several Skills.
- Read [Versioning and Lifecycle Policy](VERSIONING.md) when checking a release, Pack/plugin version, or Skill maturity status.
- Maintainers should continue with [Adding Skills](ADDING_SKILLS.md).

## Release Candidate Note

This checkout is preparing project version **0.2.0** as a Release Candidate; it is not a published release merely because the metadata and documentation are present. Project, component, and maturity versions are separate. All 4 active Packs and 38 active Skills are `beta`, meaning repository-validated and suitable for real tasks while broad public-use and Live-model routing evidence remains limited. Live-model routing accuracy is currently **UNKNOWN**.

## What You Are Looking At

Repo Doctor Skills has two practical entry paths:

1. Use a synchronized compatibility distribution under `plugins/` for Repo Doctor, Productivity Toolkit, or Skill Maintainer.
2. Use `packs/` as the only canonical source for cross-platform AI Skills and build artifacts into `plugins/` and `dist/`.

If you only want to try the existing Codex plugin, read [LEGACY_CODEX_PLUGIN.md](LEGACY_CODEX_PLUGIN.md). If you want to build platform outputs, continue here.

## Clone the Repository

```bash
git clone https://github.com/dss-time/repo-doctor-skills.git
cd repo-doctor-skills
```

## Validate Skills

```bash
npm run validate
npm test
```

These commands check required files, metadata, locale coverage, permissions, public-safe boundaries, activation contracts, maintainer fixtures, synchronization, and deterministic builds.

## Build All Outputs

```bash
npm run build
```

This synchronizes plugin distributions, builds 7 regular platform targets under `dist/`, and creates plugin-backed ChatGPT packages under `dist/chatgpt-skills/`.

## ChatGPT ZIP Packages

Each package has a ZIP and a same-named expanded directory for inspection. The filename prefix identifies the source plugin and the remainder maps to the canonical Skill slug.

| Prefix | Plugin | Current Count |
|---|---|---:|
| `rd-*` | Repo Doctor | 25 |
| `pt-*` | Productivity Toolkit | 8 |
| `sm-*` | Skill Maintainer | 2 |

The three Document Data Doctor Basic Skills are included in the 7 regular cross-platform targets but have no standalone plugin or ChatGPT ZIP. See the [User Manual](USER_MANUAL.md) for the verified ChatGPT upload flow, package-name prefixes, and the distinction between an uploaded Skill and an installed plugin.

## Build a Chinese Generic Prompt Pack

```bash
node scripts/build-skills.mjs --target generic-zh-CN
```

Output:

```text
dist/generic-zh-CN/
```

Each file is a copyable Markdown prompt. If it links to sibling `references/`, `assets/`, or `scripts/`, copy the whole target directory so those resources remain available.

## Build a Codex / CodeX Chinese Output

```bash
node scripts/build-skills.mjs --target codex-zh-CN
```

Output:

```text
dist/codex-zh-CN/AGENTS.md
```

Use this by copying or referencing the generated target directory in a Codex / CodeX-style project context that supports agent instruction files. Keep `AGENTS.md` together with its sibling resource directories.

## Build a Claude Code Chinese Output

```bash
node scripts/build-skills.mjs --target claude-code-zh-CN
```

Output:

```text
dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md
```

Use this by copying the generated `.claude/skills/` directory into the target Claude Code environment.

## View the Output

```bash
find dist -maxdepth 4 -type f | sort
```

Generated files are ignored by Git. Do not edit `dist/` directly. Edit `packs/`, then rebuild.

## Common Questions

### Should I edit `plugins/` or `packs/`?

Edit `packs/`. The `plugins/` tree is synchronized compatibility and distribution output; do not maintain a second copy of Skill logic there.

### Should I commit generated `dist/` files?

No. `dist/*` is ignored. Keep only `dist/.gitkeep`.

### Do I need dependencies?

No npm package installation is currently required; the scripts use Node built-in modules. The full ChatGPT packaging step also requires a `zip` executable on `PATH`.

### Where do I add a new skill?

Start with [ADDING_SKILLS.md](ADDING_SKILLS.md) and use the repository's `npm run create:skill -- ...` scaffold. `packs/_template/` is a reference template, not a second creation workflow.
