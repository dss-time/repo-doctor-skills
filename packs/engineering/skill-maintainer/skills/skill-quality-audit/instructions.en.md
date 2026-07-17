# Skill Quality Audit

Read `../../references/skill-maintenance-boundaries.md` and `references/audit-rubric.md`. Use `assets/skill-audit-report.md` for the report.

1. Define the audit object, release target, canonical source, generated outputs, intended platforms, neighboring Skills, and evidence available. Keep the workspace strictly read-only.
2. Inspect repository instructions, schemas, Pack/plugin/marketplace manifests, scaffold, validator, activation contracts, adapters, build scripts, and git status before judging the target.
3. Run only commands proven not to modify the workspace, such as the deterministic quality checker, validator, and tests. Do not run build/sync commands that rewrite outputs unless the user separately authorizes an isolated or generated-output check; otherwise mark reproducibility unverified.
4. Audit structure and format: folder/name consistency, frontmatter, required files, direct resource links, depth, orphaned files, line length, redundant documentation, UI metadata, and Pack/plugin references.
5. Audit triggering: explicit user invocation and automatic model activation, distinct realistic intents rather than synonym piles, what/when/not-when semantics, bilingual phrasing, breadth, adjacent routing, positive/negative/boundary/conflict/tool-unavailable cases, and gaps where no Skill owns the intent.
6. Audit workflow and output: executable order, inspectable completion criteria for every phase, premature-termination risk, evidence use, permissions, analysis/edit/validation/release separation, stopping conditions, failures, exits, unknowns, actual platform capability, and acceptance-ready output.
7. Audit progressive loading and authority: keep only all-branch procedure in instructions, branch-specific rules in first-level references, copied templates in assets, deterministic repeated logic in tested scripts, and reject multiple authorities, ineffective instructions, duplicated, stale, unreachable, or unbounded content.
8. Audit canonical uniqueness, adapter output, platform syntax leakage, English/Chinese behavior-permission-risk parity, output/schema/example/test agreement, generated coverage, and available repeat-build evidence.
9. Resolve every router reference against the active inventory and report missing or deprecated targets. Compare task state, inputs, outputs, permissions, and failure conditions to detect responsibility overlap with existing Skills.
10. Audit safety and publishing: credential/private-path/customer/restricted-content patterns, destructive or production actions, unauthorized publishing, manifest/version/CHANGELOG consistency, and public/private placement.
11. Report only evidence-backed findings. Assign P0/P1/P2 using the rubric; do not elevate style preferences. Include location, evidence, impact, recommendation, validation, unknowns, and one release recommendation. Do not edit files.
