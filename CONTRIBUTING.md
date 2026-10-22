# Contributing

Repo Doctor Skills accepts public-safe contributions only.

## Source of Truth

Maintain Skill and Pack logic only under `packs/`. The `plugins/` tree is synchronized compatibility and distribution output, and `dist/` contains generated cross-platform artifacts. Do not manually maintain a second copy of canonical content in either generated tree.

## Before Adding a Skill

1. Read `docs/SKILL_SPEC.md`.
2. Confirm the skill is generic and safe for a public repository.
3. Use the existing `npm run create:skill -- ...` scaffold; do not copy a second creation system.
4. Add localized workflows, output contracts, examples, activation cases, UI metadata, and only necessary referenced resources.
5. Run `npm run validate`, `npm test`, and `npm run build`.

## Public-Safe Contributions

Accepted examples:

- Generic workflow improvements.
- Platform adapter documentation.
- Schema and validation improvements.
- Repo Doctor base skill improvements.
- Office document workflow improvements that do not include private templates.

Rejected examples:

- Internal company processes.
- Customer-specific examples.
- Secrets or private API details.
- Financial strategy logic, stock rules, or investment recommendations.

## Language Policy

Public skills should support both `en` and `zh-CN`. Safety rules, permissions, and risk boundaries must remain consistent across languages.

## Quality Gates

The project intentionally has no standalone `format` or `lint` script and does not add empty scripts or formatter/linter dependencies merely to fill those labels. Use the existing evidence-based gates:

```bash
find scripts -type f -name '*.mjs' -exec node --check {} \;
npm run validate
npm test
npm run build
node scripts/check-skill-quality.mjs --check-dist
git diff --check
```

`npm test` includes isolated deterministic-build and ZIP-order fixtures. Before release, run the full build twice and confirm the generated-tree fingerprint is unchanged. A unified formatter or linter can be evaluated later if the executable codebase grows enough to justify one; it is not a current release blocker.

Daily development uses `npm run release:check -- --development`: it checks current package/lock and Pack/plugin consistency, version floors, inventory, lifecycle, and preserved release history. It does not require a new model evaluation or certify a release. `npm run doctor` reports stale release evidence as a warning and keeps the release conclusion `NO_GO` while daily consistency can pass.

Formal releases still require `npm run release:check`; CI runs this stricter gate on `v*` tags. Before a new evaluation, rebuild `skills/`, refresh the release inventory, and install that exact generated tree into the isolated evaluation home. The evaluator records hashes of canonical `packs/` and the entire generated/installed Skill tree, including references, scripts, assets, and workflows. Core resume, advanced validation, and the release gate reject missing or mismatched content bindings. Rebuild and run a fresh evaluation after content changes; never backfill a binding into an old PASS report. Historical reports and release contracts remain unchanged until preparing an explicitly authorized new release.

Advanced evaluation writes an `INCOMPLETE` checkpoint beside its output after each completed case. Use `--resume-advanced` with the same output path, core report, model, Skill content and evaluator files to reuse passed individual cases and complete workflows. An interrupted workflow is rerun in full to preserve its session context. Checkpoints cannot certify a release; semantic failures require review rather than automatic resume.
