# Adding Skills

This guide explains how to add a new public-safe skill.

## What Is a Skill?

A Skill is a structured workflow package. In this repository it includes metadata, localized instructions, output contracts, examples, and tests.

## What Is a Pack?

A Pack is a group of related skills. For example:

```text
packs/engineering/repo-doctor/
packs/productivity/productivity-toolkit/
```

## Where To Add a Skill

Add new skills under `packs/<category>/<pack-name>/skills/<skill-name>/`.

Do not start by editing:

- `dist/`: generated output, never edited directly.
- `plugins/`: synchronized plugin compatibility and distribution output; never maintain canonical Skill logic here.

If a skill should support multiple platforms, add it to `packs/` first and let build scripts generate platform outputs.

Create the canonical skeleton with the repository's single scaffold:

```bash
npm run create:skill -- --pack engineering/repo-doctor --name example-skill --id repo.example-skill --category engineering
```

Use `skill-authoring` when the suitability, neighboring Skills, resource plan, plugin integration, and activation design also need to be worked through.

## Standard Skill Structure

```text
skill-name/
├── skill.yaml
├── instructions.en.md
├── instructions.zh-CN.md
├── output.en.md
├── output.zh-CN.md
├── examples.en.md
├── examples.zh-CN.md
└── tests/
    ├── case-001.en.yaml
    └── case-001.zh-CN.yaml
```

## `skill.yaml`

`skill.yaml` is the metadata source of truth. Required fields:

```yaml
id: example.example-skill
name:
  en: Example Skill
  zh-CN: 示例 Skill
category: example
visibility: public
version: 0.1.0
status: draft
default_locale: zh-CN
supported_locales:
  - en
  - zh-CN
description:
  en: A short public-safe description.
  zh-CN: 一句公开安全的简短说明。
triggers:
  en:
    - example trigger
  zh-CN:
    - 示例触发词
tool_requirements:
  filesystem: read
  git: none
  shell: none
  web: none
permissions:
  read_files: true
  write_files: false
  run_shell_commands: false
  access_network: false
  destructive_actions_allowed: false
risk_level:
  default: read_only
output_schema:
  type: example_report
localization:
  en:
    status: complete
  zh-CN:
    status: complete
```

## `instructions.en.md` and `instructions.zh-CN.md`

Write the workflow the agent should follow.

Include:

- Purpose
- Safety boundary
- Step-by-step process
- Evidence requirements
- What not to do

The Chinese version should be natural Chinese, not a mechanical translation, but it must preserve the same safety and permission rules.

## `output.en.md` and `output.zh-CN.md`

Define the report or response format.

Good output specs tell the agent:

- Required sections
- Tables to include
- Evidence fields
- Manual confirmation items
- Limitations or assumptions

## `examples.en.md` and `examples.zh-CN.md`

Examples should be small and public-safe.

Include:

- Example user request
- Expected behavior
- Important safety reminders

Do not include customer data, internal templates, secrets, or private strategies.

## Test Cases

Use lightweight YAML files:

```yaml
input: "Review this example input."
expected:
  must_include:
    - evidence
    - limitations
  must_not:
    - private data
```

Add both:

```text
tests/case-001.en.yaml
tests/case-001.zh-CN.yaml
```

## Validate

```bash
npm run validate
```

Fix every reported issue before opening a pull request.

The deterministic checker covers names, frontmatter, required files, direct references, UI metadata, Pack/plugin integration, permissions, line limits, and obvious secret or machine-path patterns. It does not judge whether the Skill is worth creating, whether triggers are semantically accurate, or whether the workflow is well designed. Use the read-only `skill-quality-audit` workflow for those model judgments.

Run activation and maintainer-tool contracts too:

```bash
npm test
```

## Build

```bash
npm run build
```

Check the generated outputs under `dist/`, but do not edit or commit generated files.

## Update Pack README

If the skill changes what a pack offers, update:

```text
packs/<category>/<pack-name>/README.md
packs/<category>/<pack-name>/README.zh-CN.md
packs/<category>/<pack-name>/pack.yaml
```

## Public-Safe Checklist

A public skill must not include:

- Company-internal templates or workflows
- Customer cases
- Private data sources
- API keys, tokens, or secrets
- Financial, stock, or investment strategy logic
- Paid data connector implementation details

If the content depends on private business rules, keep it in a private pack.

## Complete Example

Run the scaffold command for the target Pack, then replace every placeholder in `skill.yaml`, localized instruction files, output files, examples, and tests. Update `pack.yaml`, Pack documentation, plugin synchronization, UI metadata, activation cases, and repository documentation only where the new Skill requires them. Never edit generated copies as the source of truth.
