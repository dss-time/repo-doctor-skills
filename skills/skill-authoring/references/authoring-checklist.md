# Authoring Checklist

## Intent

- Collect 2–5 positive requests, negative requests, and adjacent Skills.
- Confirm the work is reusable and materially more than a one-time prompt.
- Search folder slugs, IDs, descriptions, triggers, instructions, indexes, and plugin skills for overlap.

## Placement and resources

- Choose one canonical Pack and one public/private boundary.
- Reuse the existing scaffold, sync helper, adapters, schemas, and test runners.
- Keep SKILL instructions concise and imperative.
- Add first-level references for detailed rules, assets for copied templates, and scripts only for deterministic repeated logic.
- Reference every resource and test every script; create no empty directories.

## Integration

- Update Pack YAML and bilingual Pack documentation.
- Generate plugin `SKILL.md` and `agents/openai.yaml` from canonical source.
- Add bilingual activation, adjacent, negative, assumption/tool-unavailable, and blocking cases.
- Update manifests, marketplace, README, and CHANGELOG only when the new capability changes them.
- Validate frontmatter, UI names, output packages, resource inclusion, and repeated-build stability.
