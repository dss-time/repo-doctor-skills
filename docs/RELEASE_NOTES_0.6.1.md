# Repo Doctor Skills v0.6.1 Stable Release

> Release date: 2026-08-14. This compatibility patch fixes skills.sh discovery and distribution.

## skills.sh compatibility and distribution fix

Repo Doctor Skills now publishes a generated root `skills/` compatibility output containing exactly all 40 active Skills:

```bash
npx skills@latest add dss-time/repo-doctor-skills --list
```

The output is generated from canonical metadata under `packs/`; `skills/` is not a second source of truth. Deterministic tests compare the full canonical and distributable slug sets and reject missing Skills, extras, duplicates, fixtures, generated drift, and YAML parse errors.

The `safe-code-review` bilingual description is preserved exactly while generated YAML descriptions are now quoted for standard-parser compatibility. Test fixtures such as `wrong-name` and `valid-skill` remain available to deterministic tests but are outside the public discovery boundary.

The existing npm experience is unchanged:

```bash
npx repo-doctor-skills install
```

Recommended remains 7/7, Full remains 40/40, and the npm tarball, shared Codex install, plugins, permissions, and component versions remain unchanged. All release gates and isolated skills.sh install smoke tests pass.

Live-model validation remains **PASS** through the preserved 317/317 report; this patch changes distribution compatibility, not Skill routing behavior.
