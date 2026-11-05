# Requirements Clarification and Specification

Every question must close a named decision. Discover repository facts, let the user decide product choices, and reuse confirmed decisions directly in the specification.

## Phase selection

- `clarification`: use an evidence-first decision-tree interview when material product, behavior, data, security, permission, compatibility, migration, or acceptance decisions remain open.
- `specification`: produce an implementable, testable specification directly when material decisions are already closed and the user needs settled discussion or clarification results organized.
- Declare `phase`. Skip the interview when material decisions are closed. A clarification-only request ends with a decision summary. Continue to specification only when the user requests complete requirements preparation or a specification.
- When a complete specification already exists and needs no clarification or revision, route to `change-impact-analysis`, `safe-change-plan`, or an already authorized implementation workflow.

## Output modes

- `fast` (default): show only facts, conclusions, and unknowns needed for the current decision or specification, without a minimum question count.
- `standard`: cover goal, non-goals, users, current/expected behavior, business rules, data boundary, exceptional paths, compatibility, migration, and acceptance.
- `documented`: add terminology and ADR checks to standard. Optional domain-document synchronization is permitted only during clarification with explicit path-scoped write authorization. The specification phase stays read-only in every mode and returns its specification only in the response.

Do not silently change output mode. Phase selection and output mode are independent dimensions.

## Permission and scope boundary

- Read user material, related repository files, and confirmed decisions before asking. Do not ask the user to repeat answers established by repository evidence.
- Never edit code, tests, configuration, external tasks, or production data. Do not invoke Shell or access the network.
- Keep fast, standard, and the specification phase read-only. Before a documented-mode edit, inspect repository rules and the target file, preserve structure, and record reason and evidence.
- Route new durable architecture decisions to `architecture-decision-record` and general documentation drift to `documentation-sync`.
- Separate facts, inferences, open decisions, deferred decisions, and out-of-scope items. Existing code does not prove the user approved a requirement.
- Route settled feature delivery to `feature-implementation` and diagnosed local repairs to `safe-fix-implementation`. This Skill never implements.

## Clarification phase

1. Read the request, linked specifications, repository instructions, terminology, interfaces, configuration, tests, and relevant available history.
2. Build a ledger of `confirmed`, `inferred`, `open`, `deferred`, and `out_of_scope`, citing fact sources and inference basis and confidence.
3. Build a question tree only for actual unresolved decisions, recording decision, impact, dependencies, answer source, and applicable branches.
4. Verify repository facts first, then rank user choices by impact, risk, reversibility, and dependency. In fast, select at most five highest-gain branches.
5. Handle one branch at a time. Ask one concrete question with a recommendation and trade-offs, wait for the answer, then update the ledger. Do not enter a dependent branch until the current branch is resolved or explicitly deferred.
6. In standard and documented, cover the complete decision surface. In documented, record terminology and ADR conflicts separately without silently renaming concepts.
7. Complete clarification when material decisions are closed, marking lesser unknowns deferred with revisit conditions. If the user already requested a specification, reuse the ledger and enter specification.

## Specification phase

1. Cite settled discussion, a clarification ledger, or authoritative source and verify material decisions are already closed, including when entering this phase directly.
2. Reuse confirmed goals, users, business rules, and constraints. Use repository evidence for current behavior, desired behavior, and measurable success criteria.
3. Define scope, exclusions, dependencies, non-blocking assumptions, deferred items, and unknown evidence. Give each assumption confidence and a verification method.
4. Describe normal, exceptional, boundary, permission, compatibility, and migration requirements. Write acceptance criteria using Given/When/Then or equally observable conditions.
5. Recheck open decisions. If a material unknown changes the contract, stop specification work and return to clarification for that decision rather than presenting it as a non-blocking assumption.
6. Return the specification only in the response. Do not append a file-by-file implementation plan. Route delivery slices or code steps to `safe-change-plan`, and unknown impact to `change-impact-analysis`.

## Completion and stop conditions

Clarification completes when material decisions are closed and the ledger has evidence. Specification completes when desired behavior, scope, constraints, and testable acceptance are complete with no material open decisions.
Block affected work when essential evidence is missing, the user declines a required choice, authoritative sources conflict, or an optional documentation edit lacks authorization. State the minimum input needed. Do not interview a complete specification or a simple explicit request, and never ask questions to meet a quota.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.

Before editing user files or running test/build/diagnostic commands, read [user workspace safety](../../references/user-workspace-safety.en.md) and apply relevant sections. Read-only analysis/review uses it when assessing authorization/business invariants, existing-data update semantics, validation isolation or edit conflicts; preserve this Skill's own permissions.
