**English** | [简体中文](./README.zh-CN.md)

> 🇨🇳 中文用户：请查看 [中文项目说明](./README.zh-CN.md)、[中文快速开始](./docs/QUICK_START.zh-CN.md) 和 [中文用户操作手册](./docs/USER_MANUAL.zh-CN.md)。

# Repo Doctor Skills

A bilingual, cross-platform AI Skills framework for repository diagnosis, code review, document review, and safe agent workflows.

Repo Doctor Skills is an early open-source framework for turning expert workflows into structured AI Skill packs. It includes a canonical `packs/` source format, validation scripts, build adapters, and synchronized plugin compatibility outputs for existing Repo Doctor users.

This project was originally published as `repo-doctor-codex-plugin`. The public repository is now named `repo-doctor-skills`; the historical Codex plugin path remains available as a generated compatibility output.

## What This Project Can Do

- Define skills with metadata, permissions, localization, examples, and tests.
- Validate public skills before they are published.
- Build seven cross-platform targets for generic Markdown, Codex / CodeX, Claude Code, Cursor, Qwen, and Kimi.
- Keep public-safe packs separate from private or internal implementations.
- Synchronize Repo Doctor, Productivity Toolkit, and Skill Maintainer plugin distributions from the same canonical sources.

## What This Project Is Not

- It is not a loose prompt collection.
- It is not a private workflow repository.
- It is not a finance, stock, or investment strategy library.
- It does not include company templates, customer cases, secrets, or private data connectors.

## Who This Is For

- Developers building reusable Agent workflows.
- Open-source maintainers who want public-safe skill packs.
- Teams that need a clean split between public skills and private internal packs.
- Users who want a Codex-compatible plugin and cross-platform outputs from the same canonical source model.

## Quick Start

Choose the shortest guide for your goal:

- [5-minute Quick Start](docs/QUICK_START.md) for cloning, validating, and building.
- [User Manual](docs/USER_MANUAL.md) for installation, invocation syntax, permissions, and troubleshooting.
- [Complete Skill Catalog](docs/SKILL_CATALOG.md) for choosing among all active Skills.
- [Workflow Cookbook](docs/WORKFLOW_COOKBOOK.md) for chaining Skills into real tasks.
- [Testing and Evaluation](docs/TESTING_AND_EVALUATION.md)
- [0.3.0 Release Preparation Recommendation](docs/RELEASE_PREPARATION_0.3.0.md)
- [Versioning and Lifecycle Policy](docs/VERSIONING.md) for project releases, component versions, and maturity status.
- [Adding Skills](docs/ADDING_SKILLS.md) for maintainers working from canonical sources.

Clone the repository and run validation:

```bash
git clone https://github.com/dss-time/repo-doctor-skills.git
cd repo-doctor-skills
npm run validate
npm test
```

Build all supported outputs:

```bash
npm run build
```

Build one target:

```bash
node scripts/build-skills.mjs --target generic-zh-CN
node scripts/build-skills.mjs --target generic-en
node scripts/build-skills.mjs --target codex-zh-CN
node scripts/build-skills.mjs --target claude-code-zh-CN
node scripts/build-skills.mjs --target cursor-zh-CN
node scripts/build-skills.mjs --target qwen-zh-CN
node scripts/build-skills.mjs --target kimi-zh-CN
```

Generated files are written to `dist/`. The generated output is ignored by Git; only `dist/.gitkeep` is kept.

For a step-by-step guide, see [docs/QUICK_START.md](docs/QUICK_START.md).

## Four Ways To Use This Repository

### 1. Use the Repo Doctor Codex / CodeX Compatibility Plugin

If you want the Repo Doctor Codex-compatible distribution, use:

```text
plugins/repo-doctor/
```

This generated compatibility distribution is synchronized from `packs/engineering/repo-doctor/`. It contains 25 scoped workflow and specialist engineering Skills:

- `repo-doctor-router`
- `repo-onboarding`
- `requirements-clarification`
- `requirements-to-spec`
- `spec-to-work-items`
- `project-health-check`
- `safe-code-review`
- `change-impact-analysis`
- `safe-fix-implementation`
- `bug-root-cause-analysis`
- `safe-change-plan`
- `test-gap-analysis`
- `safe-test-implementation`
- `ci-failure-diagnosis`
- `documentation-sync`
- `release-readiness-check`
- `dependency-upgrade-analysis`
- `api-contract-review`
- `database-migration-review`
- `dead-code-verification`
- `security-focused-review`
- `performance-regression-analysis`
- `architecture-decision-record`
- `configuration-audit`
- `session-handoff`

Installation and marketplace setup are documented in [docs/LEGACY_CODEX_PLUGIN.md](docs/LEGACY_CODEX_PLUGIN.md).

### 2. Use the Productivity Toolkit Plugin

The generated `plugins/productivity-toolkit/` distribution provides eight cross-industry office and research workflows:

- `report-writer`
- `research-brief`
- `spreadsheet-data-cleaning`
- `document-review`
- `pdf-review`
- `meeting-notes-to-actions`
- `presentation-outline`
- `content-consistency-check`

Its canonical source is `packs/productivity/productivity-toolkit/`. The plugin does not contain investment strategy, valuation, stock selection, trading advice, private templates, or organization-specific rules.

### 3. Use the Skill Maintainer Plugin

The generated `plugins/skill-maintainer/` distribution provides two maintainer-only workflows:

- `skill-authoring` engineers one repository-standard bilingual Skill through the existing scaffold, activation contracts, and build system.
- `skill-quality-audit` performs a strictly read-only pre-release audit of a Skill, Pack, plugin, or Skills repository.

Its canonical source is `packs/engineering/skill-maintainer/`. Deterministic checks remain in repository scripts; semantic trigger and workflow judgment remains in the audit Skill.

### 4. Use This As a Cross-Platform Skills Source Repository

If you want to build skills for multiple platforms, edit canonical sources under:

```text
packs/
```

Then run:

```bash
npm run validate
npm run build
```

Use adapter output from `dist/`:

- `dist/generic-zh-CN/` for Chinese generic Markdown prompts
- `dist/generic-en/` for English generic Markdown prompts
- `dist/codex-zh-CN/AGENTS.md` for Codex / CodeX-style usage
- `dist/claude-code-zh-CN/.claude/skills/<skill-name>/SKILL.md` for Claude Code
- `dist/cursor-zh-CN/.cursor/rules/<skill-name>.mdc` for Cursor
- `dist/qwen-zh-CN/` and `dist/kimi-zh-CN/` for Chinese prompt packs
- `dist/chatgpt-skills/rd-*.zip` for ChatGPT Repo Doctor Skill uploads
- `dist/chatgpt-skills/pt-*.zip` for ChatGPT productivity-skill uploads
- `dist/chatgpt-skills/sm-*.zip` for ChatGPT Skill-maintainer uploads

## ChatGPT ZIP Packages

`npm run build` writes each plugin-backed Skill twice under `dist/chatgpt-skills/`: an expanded directory for inspection and a same-named ZIP for upload. For example, `rd-api-contract-review.zip` and `rd-api-contract-review/` both represent the canonical `api-contract-review` Skill.

| Prefix | Plugin | Current Count | Purpose |
|---|---|---:|---|
| `rd-*` | Repo Doctor | 25 | Software engineering routing, clarification, diagnosis, planning, safe changes, verification, and session transfer. |
| `pt-*` | Productivity Toolkit | 8 | Reports, research, spreadsheet cleaning, PDF/Word review, meetings, and presentations. |
| `sm-*` | Skill Maintainer | 2 | Skill authoring and read-only quality audits. |

The three Document Data Doctor Basic Skills participate in the canonical Packs and all seven regular cross-platform targets, but they do not have a standalone plugin or ChatGPT ZIP. See the [User Manual](docs/USER_MANUAL.md) for verified ChatGPT and Codex installation and invocation differences.

## Canonical Source and Generated Outputs

| Path | Purpose | Edit First? |
|---|---|---|
| `packs/` | The only canonical source for Skill logic, bilingual content, permissions, risk, tests, resources, and output contracts. | Yes. |
| `plugins/` | Generated compatibility and distribution output for Repo Doctor, Productivity Toolkit, and Skill Maintainer. | No; synchronize from canonical packs. |
| `adapters/` | Platform-specific guidance for rendering skills. | Only when adapter behavior changes. |
| `dist/` | Cross-platform artifacts and ChatGPT packages generated by the build pipeline. | Never edit directly. |

The current canonical inventory is 4 active Packs with 38 active Skills, plus 1 template Pack containing 1 template Skill. Three plugin distributions contain 35 Skills in total; the build emits 35 matching ChatGPT ZIPs and 7 regular cross-platform targets. Validation discovers the Pack and Skill sets from manifests rather than relying on these documentation counts.

## Supported Platforms

The seven regular build targets are `generic-zh-CN`, `generic-en`, `codex-zh-CN`, `claude-code-zh-CN`, `cursor-zh-CN`, `qwen-zh-CN`, and `kimi-zh-CN`. ChatGPT ZIP packaging is an additional plugin-backed distribution step in `npm run build`.

## Supported Languages

The public core supports:

- `en`
- `zh-CN`

`skill.yaml` is the metadata source of truth. English and Chinese instructions must keep the same permissions, risk boundaries, and workflow behavior.

## Repository Layout

```text
docs/       Standards, quick starts, safety model, localization, and adapter docs
schemas/    JSON schemas for skills and packs
adapters/   Platform-specific adapter notes
packs/      Canonical public skill packs and templates
examples/   Public-safe examples and sample outputs
tests/      Validation fixtures
scripts/    Validation and build scripts
dist/       Generated cross-platform artifacts, ignored except .gitkeep
plugins/    Generated plugin compatibility and distribution outputs
```

## Validate Skills

```bash
npm run validate
```

The validators check required files and metadata, locale coverage, permissions, canonical/plugin integration, direct resource links, UI metadata, line limits, and obvious secret or machine-path patterns. Semantic trigger accuracy and workflow quality still require model review and activation evaluation.

## Build Platform Outputs

```bash
npm run build
```

Or build a single target:

```bash
node scripts/build-skills.mjs --target generic-zh-CN
node scripts/build-skills.mjs --target generic-en
node scripts/build-skills.mjs --target codex-zh-CN
node scripts/build-skills.mjs --target claude-code-zh-CN
node scripts/build-skills.mjs --target cursor-zh-CN
node scripts/build-skills.mjs --target qwen-zh-CN
node scripts/build-skills.mjs --target kimi-zh-CN
```

## Add a Skill

New skills should start in `packs/`, not `plugins/` or `dist/`.

Use `npm run create:skill` as shown below; `packs/_template/` remains a reference template, not a competing creation path.

Every skill should include:

```text
skill.yaml
instructions.en.md
instructions.zh-CN.md
output.en.md
output.zh-CN.md
examples.en.md
examples.zh-CN.md
tests/case-001.en.yaml
tests/case-001.zh-CN.yaml
```

After adding or editing a skill:

```bash
npm run validate
npm test
npm run build
```

## Create a New Skill

Use the scaffold script:

```bash
npm run create:skill -- --pack engineering/repo-doctor --name bug-diagnosis --id repo.bug-diagnosis --category engineering
```

The new Skill is created under `packs/`. Complete the canonical files and required Pack/integration metadata there; do not edit synchronized `plugins/` or generated `dist/` copies. Then run:

```bash
npm run validate
npm test
npm run build
```

Detailed guidance is in [docs/ADDING_SKILLS.md](docs/ADDING_SKILLS.md).

## Public / Private Boundary

This public repository may include:

- Skill standards
- Generic workflows
- Platform adapters
- Repo Doctor base skills
- Basic PDF, Word, Excel, and report skills
- Public-safe examples and tests
- Finance skill interface and safety boundaries

This public repository must not include:

- Company-internal templates or workflows
- Customer cases
- Private data sources
- API keys, tokens, or secrets
- Stock screening rules
- Buy, sell, or hold logic
- Technical indicator strategy combinations
- Valuation model weights
- Portfolio construction rules
- Paid data source integration logic

See [docs/PUBLIC_PRIVATE_BOUNDARY.md](docs/PUBLIC_PRIVATE_BOUNDARY.md).

## For Users

- Install and invoke Skills using the [User Manual](docs/USER_MANUAL.md); start uncertain repository work with `$repo-doctor-router`.
- Browse all active Skills in the [Skill Catalog](docs/SKILL_CATALOG.md). If a Skill is missing, verify the selected plugin/ZIP, rebuild or reinstall the correct platform output, and use its canonical slug.
- Run `npm run doctor` or `npm run doctor -- --json` for a read-only installation and synchronization check.
- To update, pull a version you trust and rebuild/reinstall the relevant generated output. To uninstall, remove the installed plugin/Skill through the host; do not delete canonical `packs/` merely to disable an installation.

## For Maintainers

Use `npm run validate`, `npm test`, `npm run build`, `npm run docs:check`, `npm run quality:check`, and `npm run release:check`. Validate the machine-readable registry with `npm run workflow:validate`; Golden Workflows are part of `npm run test:workflow`. Prepare and record manual live-model runs using the [Testing and Evaluation guide](docs/TESTING_AND_EVALUATION.md). Deterministic contract tests are not live-model routing accuracy.

## Release Candidate Status

The historical **v0.2.0 prerelease** remains unchanged. This checkout is the authorized **v0.3.0-rc.1 Release Candidate**; it is published as a prerelease because live-model evaluation remains UNKNOWN. Project release version, component versions, and maturity status are separate layers. All 4 active Packs and 38 active Skills in the current checkout are marked `beta`: they are repository-validated and suitable for real tasks, but broad public-use and Live-model routing evidence is still limited. Beta does not mean unusable, and a future `stable` label would not mean bug-free.

Live-model routing accuracy remains **UNKNOWN**. See [Versioning and Lifecycle Policy](docs/VERSIONING.md) for the component baselines and the historical `v0.0.1` tag-label exception, and [CHANGELOG.md](CHANGELOG.md) for the candidate change record.

## Related Docs

- [Quick Start](docs/QUICK_START.md)
- [User Manual](docs/USER_MANUAL.md)
- [Complete Skill Catalog](docs/SKILL_CATALOG.md)
- [Workflow Cookbook](docs/WORKFLOW_COOKBOOK.md)
- [Versioning and Lifecycle Policy](docs/VERSIONING.md)
- [Adding Skills](docs/ADDING_SKILLS.md)
- [Legacy Codex Plugin](docs/LEGACY_CODEX_PLUGIN.md)
- [Skill Specification](docs/SKILL_SPEC.md)
- [Platform Adapters](docs/PLATFORM_ADAPTERS.md)
- [Security Model](docs/SECURITY_MODEL.md)
- [Localization Policy](docs/LOCALIZATION_POLICY.md)
- [Public / Private Boundary](docs/PUBLIC_PRIVATE_BOUNDARY.md)
- [Glossary](docs/GLOSSARY.md)

## License

MIT. See [LICENSE](LICENSE).
