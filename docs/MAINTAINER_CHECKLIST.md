# Maintainer Checklist

Use this checklist before release, merge, or major documentation updates.

## Documentation

- [ ] `README.md` and `README.zh-CN.md` are both updated when user-facing behavior changes.
- [ ] `docs/QUICK_START.md` and `docs/QUICK_START.zh-CN.md` still match the current commands and outputs.
- [ ] `docs/ADDING_SKILLS.md` and `docs/ADDING_SKILLS.zh-CN.md` still match the current skill structure.
- [ ] `CHANGELOG.md` includes the relevant public changes.
- [ ] Problem-oriented Skill entrypoint guides remain bilingual and use stable canonical names rather than unverified alias frontmatter.
- [ ] `docs/VERSIONING.md` and `docs/VERSIONING.zh-CN.md` still match the project/component version model and maturity policy.
- [ ] `packs/` remains the only canonical source; no Skill logic was maintained directly in generated `plugins/` or `dist/` copies.
- [ ] `docs/guides/execution-modes.md` and its Chinese counterpart remain semantically aligned.

## Skill Structure

For each new or changed skill, confirm these files exist:

- [ ] `skill.yaml`
- [ ] `instructions.en.md`
- [ ] `instructions.zh-CN.md`
- [ ] `output.en.md`
- [ ] `output.zh-CN.md`
- [ ] `examples.en.md`
- [ ] `examples.zh-CN.md`
- [ ] `tests/case-001.en.yaml`
- [ ] `tests/case-001.zh-CN.yaml`

## Metadata

- [ ] `skill.yaml` includes required fields: `id`, `name`, `category`, `visibility`, `version`, `status`, `default_locale`, `supported_locales`, `description`, `triggers`, `tool_requirements`, `permissions`, `risk_level`, `output_schema`, and `localization`.
- [ ] `visibility` is correct for a public repository.
- [ ] `supported_locales` includes `en` and `zh-CN`.
- [ ] Permissions explicitly declare file write, shell, network, and destructive-action behavior.
- [ ] Changed Skills state when automatic invocation is appropriate, when explicit write authorization is required, and which adjacent Skill owns excluded work.
- [ ] Applicable Skills preserve `fast`, `standard`, and `audit` semantics; specialized mode sets such as `documented` or `test_mode` remain distinct from output modes.
- [ ] Every Repo Doctor `skill.yaml` has an `execution` classification, `fast` or `standard` default, and an intentional implicit-invocation policy.
- [ ] Heavyweight and explicit-only candidates generate `allow_implicit_invocation: false`; adapters without an equivalent field use precise descriptions instead of aliases.
- [ ] The project release version agrees across `package.json`, the intended Git tag/GitHub Release, `CHANGELOG.md`, and release-candidate notes.
- [ ] Every Pack version matches its corresponding generated plugin manifest; Pack/plugin versions are not mechanically forced to equal the project version.
- [ ] Each Skill keeps an independently justified semantic version rather than inheriting its Pack or project version automatically.
- [ ] Pack and Skill maturity statuses have evidence; a Pack is not more mature than its least mature active Skill.
- [ ] `beta` is described as repository-validated and usable with limited broad-use/live-model evidence; `stable` is not described as bug-free.
- [ ] Template content remains `draft` and excluded from active/plugin/ZIP counts; deprecated content is not reactivated.

## Public Safety

- [ ] No token, API key, credential, or secret was committed.
- [ ] No company-internal workflow, template, customer case, or private data source was added.
- [ ] No stock pool, buy/sell signal, investment strategy, valuation weight, or non-public business rule was added to public skills.
- [ ] Finance-related content remains interface-only and safety-boundary-only.

## Validation

- [ ] `find scripts -type f -name '*.mjs' -exec node --check {} \;` passes.
- [ ] `npm run validate` passes.
- [ ] `npm test` passes, including activation, maintainer, synchronization, and build-integrity contracts.
- [ ] `npm run test:performance` passes at least 20 simple and 10 elevated scenarios without weakening permission gates.
- [ ] `npm run build` passes.
- [ ] Codex, Claude Code, Cursor, Qwen, Kimi, generic Chinese/English, portable prompt, and ChatGPT package outputs include every active Skill without hand-edited generated drift.
- [ ] `npm run docs:generate` refreshes the generated Skill Catalogs and `npm run docs:check` passes.
- [ ] `node scripts/check-skill-quality.mjs --check-dist` passes after the build.
- [ ] Repeating `npm run build` produces the same generated-tree fingerprint with no stale or extra artifacts.
- [ ] `git diff --check` passes.
- [ ] `dist/` generated files are not committed.
- [ ] Only `dist/.gitkeep` is kept.

There are intentionally no standalone `format` or `lint` scripts at this stage. Do not add empty scripts, repository-wide mechanical formatting, or new formatter/linter dependencies merely to fill that label. The syntax, Schema, validation, test, build, generated-output, whitespace, deterministic-build, and review gates above cover the current baseline. Revisit a unified formatter or linter if the executable codebase grows enough to justify one.

## Generated Compatibility

- [ ] `plugins/repo-doctor/`, `plugins/productivity-toolkit/`, and `plugins/skill-maintainer/` match their canonical Pack manifests.
- [ ] Each plugin manifest still points to its generated `./skills/` directory.
- [ ] Plugin and ChatGPT package sets contain no manual drift from canonical sources.
- [ ] The three Document Data Doctor Basic Skills remain Pack/cross-platform-only and have no standalone plugin or ChatGPT ZIP unless that architecture is intentionally changed.
- [ ] Adapter documentation still matches generated output behavior.

## Release Candidate

- [ ] `CHANGELOG.md` records current work under `Unreleased`; a dated candidate section is created only when a project release is actually prepared.
- [ ] Changelog comparison links, release notes, and version-policy links are valid.
- [ ] The candidate is described as not yet published until commit, push, tag, and external release actions actually succeed.
- [ ] Live-model routing accuracy is reported as `UNKNOWN` unless an evidence-backed online evaluation was actually run.
- [ ] Commit, push, tag creation, GitHub Release creation, npm publication, and marketplace publication remain separate explicit authorizations.
