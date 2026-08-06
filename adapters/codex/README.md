# Codex Adapter

Codex adapter output includes:

```text
AGENTS.md
skills/<skill-name>/SKILL.md
```

`AGENTS.md` preserves the aggregate compatibility target. Each installable Skill package contains both English and Simplified Chinese instructions and can be copied into an isolated Codex Skills root. This repository also synchronizes compatibility distributions under `plugins/` from canonical Packs.

## Mapping

- Use `packs/` as the canonical source.
- Generate concise instructions from `instructions.<locale>.md`.
- Preserve permission and risk boundaries from `skill.yaml`.
- Keep localized output format requirements visible.

## Compatibility

The generated `plugins/repo-doctor` distribution preserves the historical Codex installation path. Maintain its Skill logic in `packs/engineering/repo-doctor/`, then regenerate it with repository scripts.
