# Advanced Usage

This guide collects installation alternatives, platform-specific behavior, source builds, and maintainer-oriented concepts. New Repo Doctor users should start with the [User Manual](USER_MANUAL.md).

## 1. Recommended / Full / Individual

These are the only three installation concepts exposed to users:

| Concept | Use it when | Source command |
|---|---|---|
| **Recommended** | Default for most users; installs seven high-frequency Skills | `npx repo-doctor-skills install` |
| **Full** | You need every active Skill supported by the Skills directory format | `npx repo-doctor-skills install --preset full` |
| **Individual** | You know the exact Skill and platform artifact you need | See section 6 |

The public npm CLI is the shortest installation path. Advanced users can still use plugins, source builds, platform outputs, and individual assets.

## 2. Plugin installation

Add the stable source:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.6.1
```

Open `/plugins`, install the required plugin, and start a new task. This repository distributes three plugins:

- **Repo Doctor** for repository engineering;
- **Productivity Toolkit** for reports, research, spreadsheets, documents, meetings, and presentations;
- **Skill Maintainer** for creating or auditing Skills.

Use `--ref main` only for intentional development testing:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

See [Legacy Codex Plugin](LEGACY_CODEX_PLUGIN.md) for the compatibility path and host-specific notes.

Plugin counts follow distribution boundaries: Repo Doctor contains 27 Skills; Repo Doctor, Productivity Toolkit, and Skill Maintainer contain 37 together. The source inventory is 40 because three Document Data Doctor Skills are regular-build-only. Installing Full from source installs all 40 without changing those plugin boundaries.

## 3. ChatGPT single-Skill ZIPs

Use a ZIP when you need a few Skills rather than a whole plugin.

1. Download the versioned release asset, or run the full build.
2. Select the `.zip`, not its expanded inspection directory.
3. In ChatGPT, use the current **Skills → Create → Upload** surface when available.
4. Review the safety scan. Do not bypass workspace policy when the result is Needs Review or Blocked.
5. Start a new task and select the Skill through the current interface or describe the task naturally.

Prefixes identify the source library:

| Prefix | Library | Example |
|---|---|---|
| `rd-*` | Repo Doctor | `rd-safe-code-review.zip` |
| `pt-*` | Productivity Toolkit | `pt-report-writer.zip` |
| `sm-*` | Skill Maintainer | `sm-skill-quality-audit.zip` |

The `$slug` syntax is not guaranteed for personally uploaded ChatGPT Skills. The three Document Data Doctor Basic Skills participate in regular builds but do not have standalone ChatGPT ZIPs.

## 4. Other platform outputs

### Codex combined project instructions

The generated Codex target contains a combined `AGENTS.md` plus sibling resources. Copy the complete target directory so linked references, assets, and scripts remain available. This gives persistent project instructions; it does not install individually discoverable `$` Skills.

### Claude Code

The generated structure is:

```text
dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md
```

Copy `.claude/skills/` into the supported target context. Discovery and explicit command syntax depend on the host version; the reliable fallback is the Skill slug plus a natural-language task.

### Cursor

The generated structure is:

```text
dist/cursor-zh-CN/.cursor/rules/<skill-name>.mdc
```

Copy `.cursor/rules/` into the target project. Automatic loading and scope depend on Cursor configuration. This project does not claim that this target also installs per-Skill `$` invocation.

### Qwen, Kimi, and portable prompts

The `qwen-zh-CN`, `kimi-zh-CN`, `generic-zh-CN`, and `generic-en` targets are Markdown prompts, not native packages verified by this project. Put the complete target in a host-supported instruction context, or paste a self-contained prompt. Do not assume `$`, `@`, or slash-command support.

## 5. Source installer, validation, and build

Requirements: Node.js 18 or later; ChatGPT ZIP creation also needs `zip` on `PATH`.

```bash
git clone https://github.com/dss-time/repo-doctor-skills.git
cd repo-doctor-skills
npm run install:skills -- --agent codex
npm run validate
npm test
npm run build
```

Build one regular target when you do not need the full distribution:

```bash
node scripts/build-skills.mjs --target generic-en
node scripts/build-skills.mjs --target generic-zh-CN
node scripts/build-skills.mjs --target codex-zh-CN
node scripts/build-skills.mjs --target claude-code-zh-CN
node scripts/build-skills.mjs --target cursor-zh-CN
node scripts/build-skills.mjs --target qwen-zh-CN
node scripts/build-skills.mjs --target kimi-zh-CN
```

Generated regular outputs and ChatGPT packages are written under `dist/`.

Installer targeting is deliberately conservative:

- `--agent codex` uses `CODEX_HOME/skills` or the standard Codex home when `CODEX_HOME` is unset;
- `--agent shared` uses `AGENTS_HOME/skills` or the shared `.agents/skills` home;
- `--target-dir` is the explicit option for an isolated or custom destination;
- without an explicit option, exactly one configured `CODEX_HOME` or `AGENTS_HOME` is required;
- multiple detected homes cause a safe exit before any write; directory existence alone is never treated as Agent detection.

The installer defaults to Recommended, verifies the installed set, and refuses to replace an existing selected Skill unless `--force` is explicit. Public CLI equivalents include:

```bash
npx repo-doctor-skills install --agent codex
npx repo-doctor-skills install --agent shared
npx repo-doctor-skills install --target-dir ./my-skills
npx repo-doctor-skills install --force
```

## 6. Individual Skill installation

- **Codex plugin:** invoke the installed canonical slug directly, such as `$safe-code-review`.
- **ChatGPT ZIP:** install the matching prefixed ZIP and use the current Skills interface or natural language.
- **Portable prompt:** copy the Skill together with every directly linked resource.

Do not copy a lone instruction file when it links to sibling references, assets, or scripts. Do not rename stable Skill slugs inside an installation.

## 7. Maintainer model

The source and distribution layers have different responsibilities:

| Layer | Purpose | Editing rule |
|---|---|---|
| `packs/` | Canonical Skill logic, metadata, localization, permissions, risk, examples, and tests | Edit here first |
| `plugins/` | Synchronized plugin compatibility and distribution output | Regenerate; do not maintain Skill logic here |
| `adapters/` | Platform rendering guidance | Edit only when platform behavior changes |
| `skills/` | Generated skills.sh compatibility output for all active Skills | Regenerate; never edit directly |
| `dist/` | Generated cross-platform and ZIP output | Never edit directly |

The repository keeps canonical slugs, permissions, security gates, execution profiles, workflows, schemas, Pack/Plugin/Adapter/Build architecture, bilingual parity, and release machinery aligned through validation and generation.

Maintainer entry points:

- [Adding Skills](ADDING_SKILLS.md)
- [Skill Specification](SKILL_SPEC.md)
- [Platform Adapters](PLATFORM_ADAPTERS.md)
- [Maintainer Checklist](MAINTAINER_CHECKLIST.md)
- [Versioning and Lifecycle](VERSIONING.md)
- [Contributing](../CONTRIBUTING.md)

Typical maintenance validation:

```bash
npm run docs:generate
npm run validate
npm test
npm run build
npm run docs:check
npm run quality:check
```

## 8. Continue from here

- [Quick Start](QUICK_START.md) for the source workflow
- [Execution Modes](guides/execution-modes.md) for detailed mode contracts
- [Workflow Cookbook](WORKFLOW_COOKBOOK.md) for deliberate multi-step tasks
- [Release Asset Selection](guides/release-asset-selection.md) for downloading and verifying published artifacts
- [Versioning and Lifecycle](VERSIONING.md) for project and component versions
