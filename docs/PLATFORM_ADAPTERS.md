# Platform Adapters

Repo Doctor Skills canonical skills live under `packs/`. Adapters render them into platform-specific formats.

## Invocation names and aliases

Canonical Skill slugs are the only portable invocation identity. The current canonical Schema intentionally has no `alias` field: host support is inconsistent, and unrecognized frontmatter would not create a reliable cross-platform shortcut. Codex and plugin distributions use their generated names, while other adapters preserve the canonical slug or expose it through their native rule format. Use natural-language routing when a host does not expose direct Skill invocation, and treat any host-specific shortcut as adapter UI metadata rather than canonical behavior.

## Claude Code

Target output:

```text
.claude/skills/<skill-name>/SKILL.md
```

Claude Code expects compact skill instructions. Adapter output should merge `skill.yaml`, localized instructions, and output format into a single `SKILL.md`.

## Codex / CodeX

Target output:

```text
AGENTS.md
```

or a plugin/skill document under a compatible plugin structure. This repository synchronizes plugin distributions under `plugins/` from the only canonical source under `packs/`; generated plugin copies are not an editing surface.

## Cursor

Target output:

```text
.cursor/rules/*.mdc
```

or `AGENTS.md` when rule files are not desired. Cursor outputs should be concise and scoped because rule files may be loaded broadly.

## Generic Prompt Pack

Target output is ordinary Markdown. It should not assume file system, shell, Git, browser, or network tools unless the skill metadata explicitly allows them.

## Chinese LLM Environments

Chinese LLM adapters should:

- Default to `zh-CN`.
- Use explicit rules and fixed output formats.
- Avoid assuming file system, terminal, or network access.
- Keep safety boundaries visible in the generated prompt.
- Prefer structured outputs when downstream systems need predictable parsing.
