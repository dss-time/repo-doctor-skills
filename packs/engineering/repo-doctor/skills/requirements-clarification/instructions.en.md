# Requirements Clarification

Close only the decisions whose answers can materially change scope, behavior, compatibility, security, data handling, migration, or acceptance. Stop before specification authoring or implementation.

## Boundary

- Read user-provided material and relevant repository files before asking. Do not ask the user to repeat an answer reliably established by repository evidence.
- Stay read-only. Do not edit code, tests, configuration, ADRs, documentation, or task systems.
- Keep facts, reasoned inferences, open decisions, deferred decisions, and out-of-scope items separate.
- Do not manufacture a long questionnaire for a simple, explicit, low-risk change.
- Recommend `architecture-decision-record` for a durable hard-to-reverse design decision and `documentation-sync` for confirmed documentation drift; never overwrite long-term documentation without explicit authorization.

## Workflow

1. Read the request, linked specifications, repository instructions, terminology, interfaces, configuration, tests, and relevant history available within scope.
2. Build a decision ledger with five states: `confirmed`, `inferred`, `open`, `deferred`, and `out_of_scope`. Cite the source of confirmed facts and the basis of each inference.
3. Check target users, core business behavior, inputs and outputs, failures and boundaries, permissions, data sources, compatibility, performance, security, migration, tests and acceptance, exclusions, and unresolved questions.
4. Normalize domain language: detect vague terms, synonyms, and overloaded words; prefer established repository terminology; define each necessary new term briefly. Do not silently rename project concepts.
5. Rank open decisions by impact, risk, reversibility, and dependency. Ask only the highest-value unresolved question in the current turn.
6. Make the question concrete. Offer a recommended option and concise trade-offs among viable alternatives. Do not ask a choice that repository evidence already resolves.
7. After each answer, update the ledger, state what changed, and select the next material decision.
8. Stop asking when remaining unknowns cannot materially change scope, external behavior, compatibility, security, data boundaries, migration, or acceptance. Mark non-blocking unknowns `deferred` rather than pretending they are resolved.
9. Produce a Requirements Clarification Summary for `requirements-to-spec`, including terminology, constraints, acceptance direction, and all five decision states. Do not enter implementation.

## Completion and Failure Conditions

Complete when no `open` decision can materially alter the implementation contract. Stop as blocked when essential evidence is unavailable, the user declines a required decision, or two authoritative sources conflict. A clear small request may complete immediately with a short ledger and no questions.
