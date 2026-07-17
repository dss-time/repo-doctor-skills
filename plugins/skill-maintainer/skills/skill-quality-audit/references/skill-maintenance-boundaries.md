# Skill Maintenance Boundaries

## Repository architecture

- Treat `packs/<category>/<pack>/skills/<slug>/` as canonical source.
- Treat `plugins/<plugin>/skills/` as synchronized compatibility or distribution output.
- Treat `dist/` as generated output; never maintain business logic there.
- Reuse `npm run create:skill`, shared sync helpers, validators, activation contracts, and platform builders before adding new tooling.

## Deterministic checks

Use scripts for facts that can be decided without semantic judgment:

- folder, slug, ID, frontmatter, and required-file rules;
- line limits, resource paths, forbidden files, orphan resources, and UI metadata shape;
- duplicate IDs/slugs, Pack/plugin/marketplace references, permissions contradictions;
- obvious credential patterns, machine paths, generated-target coverage, exit codes, and repeat-build hashes.

Never claim a deterministic checker has judged trigger accuracy, bilingual naturalness, workflow quality, or business safety.

## Model judgment

Use evidence-backed model review for:

- whether repeated work deserves a Skill;
- semantic duplication and adjacent-trigger conflict;
- description breadth, natural bilingual phrasing, and intent coverage;
- workflow executability, ordering, stopping conditions, failure handling, and permission design;
- whether progressive resources are necessary and non-duplicative;
- whether outputs are verifiable and finding severity matches real impact.

## Public boundary

## Repo Doctor Skill Quality Model

Treat this section as the shared authority for authoring and audit. Evaluate:

- whether explicit user invocation and automatic model activation select the Skill for distinct realistic intents rather than a synonym pile;
- whether every workflow phase has an inspectable completion condition and whether the instructions can terminate prematurely;
- whether main instructions contain only rules required by every branch, with branch-specific detail loaded progressively;
- whether one rule has multiple authoritative sources, or an instruction is unreachable, ineffective, duplicated, stale, or expands scope without a boundary;
- whether failure and exit conditions are explicit;
- whether English and Chinese preserve the same behavior, permissions, risk, and stop conditions;
- whether metadata, output contracts, examples, tests, and generated output agree;
- whether router references resolve to active Skills and reject missing or deprecated Skills; and
- whether a new Skill overlaps an existing owner instead of defining a distinct task state, input, output, permission boundary, and failure condition.

Record evidence for each judgment. Deterministic checks may prove references, files, schemas, and generated parity; semantic activation, premature completion, ineffective instructions, and responsibility overlap still require model judgment.

## Public boundary

Do not publish organization-specific procedures, customer material, credentials, private paths, non-public data access, or restricted investment and trading logic. If a request requires those details, keep the public interface generic and route private implementation to a separate private distribution.
