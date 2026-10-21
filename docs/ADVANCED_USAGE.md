# Advanced Usage

This guide collects installation alternatives, platform-specific behavior, source builds, and maintainer-oriented concepts. New Repo Doctor users should start with the [User Manual](USER_MANUAL.md).

## 1. Recommended / Full / Individual

The standard skills CLI lets users select Skills and their agent. The optional preset installer offers these three selections:

| Concept | Use it when | Source command |
|---|---|---|
| **Recommended** | Default for most users; installs seven high-frequency Skills | `npx repo-doctor-skills install` |
| **Full** | You need every active Skill supported by the Skills directory format | `npx repo-doctor-skills install --preset full` |
| **Individual** | You know the exact Skill and platform artifact you need | See section 6 |

Start with `npx skills@latest add dss-time/repo-doctor-skills` for interactive selection. The preset installer is useful for fixed selections and single-language bodies. Users can also choose plugins, source builds, platform outputs, and individual assets.

## 2. Plugin installation

Add the stable source:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.8.0
codex plugin add repo-doctor@repo-doctor-marketplace
```

This example pins the v0.8.0 stable release. Omit `--ref` to use the marketplace's current default branch. Start a new task after installation. This repository distributes three plugins:

- **Repo Doctor** for repository engineering;
- **Productivity Toolkit** for reports, research, spreadsheets, documents, meetings, and presentations;
- **Skill Maintainer** for creating or auditing Skills.

Install the other collections directly with `codex plugin add productivity-toolkit@repo-doctor-marketplace` or `codex plugin add skill-maintainer@repo-doctor-marketplace`. Use `codex plugin marketplace upgrade repo-doctor-marketplace` to refresh an unpinned Git source. Choose a plugin or copied Skills for the same agent to avoid duplicate discovery.

Use `--ref main` only for intentional development testing:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

See [Legacy Codex Plugin](LEGACY_CODEX_PLUGIN.md) for the compatibility path and host-specific notes.

v0.8.0 contains 41 Skills: Repo Doctor has 28, the three plugins contain 38 together, and three Document Data Doctor Skills are regular-build-only. A Full source installation includes all 41. Published v0.7.3 remains at 40 / 27 / 37 respectively; its archives and npm package do not contain feature-implementation yet.

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
npm ci
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

## Individual Skills, language and reinstalling

```bash
npx repo-doctor-skills install --skill safe-code-review
npx repo-doctor-skills install --language en
```

`--skill` and `--preset` are mutually exclusive. Choose en, zh-CN, or bilingual (default) for the body; resources remain available. Identical content is skipped, different content is reported, and `--force` replaces only selected Skills.

Project Release Version and Plugin / Pack Component Version are independent; see [version policy](VERSIONING.md).
