# Matt Skills Clean-Room Adaptation Analysis

## Analysis record

- Analysis date: 2026-08-05
- External repository: `mattpocock/skills`
- External commit: `2ab958093e83e0ec752e6c1c5932da465bf23e0c`
- Access method: read-only clone in an operating-system temporary directory
- Repository baseline: `c876946c1a80e9da28193a58c1bc38a4a6cc3669`
- Scope reviewed: `grill-me`, `grill-with-docs`, `grilling`, `improve-codebase-architecture`, `tdd`, `handoff`, `prototype`, `diagnosing-bugs`, `ask-matt`, `code-review`, `domain-modeling`, and `codebase-design`

This report records problem-level observations only. It does not reproduce external instructions, templates, examples, headings, or distinctive wording.

## Repository evidence and adaptation boundary

`packs/` is the only canonical source for Skill behavior, bilingual content, permissions, output contracts, examples, tests, and resources. `plugins/` and `dist/` are generated projections. The current Skill Schema accepts extension fields, but the repository generators and validators intentionally emit only stable platform metadata. No supported target has a repository-verified, cross-platform Skill alias contract.

The adaptation therefore keeps existing Skill names stable, adds only the two lifecycle-complete capabilities requested by the project brief, and improves discovery through descriptions, router behavior, activation fixtures, and bilingual entrypoint guides.

## Problem-level inspiration

The external reference highlighted several useful user problems:

- A clarification session is more effective when it resolves one consequential decision branch at a time and obtains repository facts before asking product questions.
- Tests are more durable when they protect observable behavior through a stable public boundary and evolve in small behavior slices.
- Difficult diagnosis depends on a trustworthy signal that distinguishes the target failure from nearby noise.
- A handoff is valuable when it carries only the state needed to resume and points to durable artifacts instead of copying them.
- Code review benefits from separating repository expectations from requested behavior.
- A disposable prototype can answer a question that conversation alone cannot settle.
- Architecture analysis should start from caller friction and change evidence, then compare more than one design direction.
- A router should give the shortest useful next action while keeping deeper workflow and permission detail available on demand.

## Capability overlap matrix

| External capability | Existing Repo Doctor owner | Classification | Adaptation decision |
|---|---|---|---|
| `grill-me` | `requirements-clarification` | Enhance existing skill | Add a high-information `fast` interview mode; keep repository and permission evidence. |
| `grill-with-docs` | `requirements-clarification`, `architecture-decision-record`, `documentation-sync` | Enhance existing skill | Add `documented` mode with terminology and ADR checks; require explicit write authorization for durable documents. |
| `grilling` | `requirements-clarification` | Enhance existing skill | Implement a decision tree and ledger without copying the external interaction script. |
| `improve-codebase-architecture` | no complete owner; partial overlap with `project-health-check` and `change-impact-analysis` | Add new skill | Add `architecture-deepening-analysis` as read-only analysis and migration planning, not a refactoring executor. |
| `tdd` | `safe-test-implementation` | Enhance existing skill | Add one-behavior red–green–organize cycles while preserving test-only write scope and command gates. |
| `handoff` | `session-handoff` | Enhance existing skill | Default to the OS temporary directory, tailor to the next-session goal, reference existing artifacts, and redact sensitive values. |
| `prototype` | no complete owner | Add new skill | Add `decision-prototype` with logic/UI branches, explicit success criteria, production isolation, and a formal handoff boundary. |
| `diagnosing-bugs` | `bug-root-cause-analysis`, `ci-failure-diagnosis`, `performance-regression-analysis` | Enhance existing skill | Put signal qualification first for runtime bugs; retain specialist routing and evidence states. |
| `ask-matt` | `repo-doctor-router` | Enhance existing skill | Make the default answer compact and add problem-oriented entrypoint guides. |
| `code-review` | `safe-code-review` | Enhance existing skill | Use three independent evidence axes and aggregate only after axis-local conclusions. |
| `domain-modeling` | `requirements-clarification`, `architecture-decision-record`, `documentation-sync` | Reference only | Consume repository vocabulary and ADRs; do not add an active glossary-writing Skill. |
| `codebase-design` | `architecture-deepening-analysis` | Reference only | Use evidence-based interface/caller friction as analytical input without importing a fixed vocabulary layer. |

## Adopted principles

1. Resolve repository-verifiable facts before asking the user to make a choice.
2. Make the default response short; disclose evidence tables and ledgers only in audit-oriented modes.
3. Protect one observable behavior at a time and verify the failure reason before implementation.
4. Establish and qualify the diagnostic signal before elevating a causal claim.
5. Keep independent review concerns independent until final deduplication.
6. Use prototypes to answer one declared question and prevent them from silently becoming production code.
7. Require caller, change, test, or ADR evidence before recommending architectural abstraction.
8. Reference durable artifacts rather than copying them into transient handoffs.
9. Keep permissions, dangerous-command gates, evidence status, bilingual parity, canonical generation, and deterministic validation visible throughout.

## Designs explicitly rejected

- Copying or lightly rewriting any external Skill text, examples, templates, headings, or named interaction style.
- Importing the external files or preserving its composition graph.
- Automatically updating domain documents during an interview.
- Treating a prototype as production-ready or allowing production credentials, data, or real mutations by default.
- Combining diagnosis, fix implementation, test creation, cleanup, commit, and release into one permission scope.
- Running code review axes in a way that lets one axis hide missing evidence in another.
- Requiring subagents, browser reports, a specific issue tracker, a particular `CONTEXT.md` layout, or external CDN assets.
- Creating a catch-all architecture refactoring executor.
- Adding a `$doctor` wrapper or alias frontmatter without verified host support.
- Creating additional active Skills for vocabulary, questioning, or routing primitives.

## Alias and platform capability matrix

| Target | Verified invocation/discovery surface | Native alias field verified? | Decision |
|---|---|---:|---|
| Codex / ChatGPT Skill | Skill folder plus `SKILL.md`; required `name` and `description`; optional UI/policy lives in `agents/openai.yaml` | No | Keep `repo-doctor-router`; use concise descriptions and guides. Do not emit alias frontmatter. |
| Claude Code | Generated `.claude/skills/<name>/SKILL.md` with `name` and `description` | No repository-verified cross-platform alias | Keep the canonical slug. |
| Cursor | Generated `.cursor/rules/<name>.mdc`; manual selection is tied to the rule name | No Skill alias contract | Keep one generated rule per Skill. |
| Qwen | Skill name is the direct invocation name; documented frontmatter fields do not include aliases | No | Keep one canonical name and provide problem-oriented examples. |
| Kimi | Repository output is a portable Chinese prompt pack, not a verified native alias surface | No | Use plain-language entrypoints. |
| Generic prompt | Copyable Markdown | Not applicable | Use problem-oriented guide text. |

Primary verification sources:

- OpenAI Build Skills documentation: <https://learn.chatgpt.com/docs/build-skills>
- Cursor Rules documentation: <https://docs.cursor.com/context/rules>
- Qwen Code Agent Skills documentation: <https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/>

The current repository additionally enforces generated plugin frontmatter containing only `name` and `description`. Because no reliable alias contract spans the target set, adding an `aliases` Schema field would create misleading metadata with no portable behavior. A thin `$doctor` wrapper was also rejected: it would add an active Skill, increase trigger competition and context usage, and duplicate a routing entry without improving verified invocation.

## Independent implementation statement

The implementation is designed from this repository's existing permission model, evidence vocabulary, metadata Schema, workflow registry, bilingual source layout, generator contracts, and deterministic tests. The external repository was used only to identify user problems and workflow trade-offs. All changed and new instructions, descriptions, examples, output contracts, tests, and documentation are newly authored for Repo Doctor.

## License and attribution considerations

The external repository declares the MIT License. That license can permit reuse under its terms, but this project intentionally uses a clean-room, problem-level adaptation and does not incorporate substantial external text or files. This research note preserves provenance and commit identity without implying endorsement. If future work imports code or substantial expression, maintainers must perform a fresh license review and include the required notice.

## No-direct-copy declaration

No external Skill file was copied into this repository. No external paragraph, checklist, description, title structure, example, or output template was translated, renamed, or reordered to create the resulting Skills.
