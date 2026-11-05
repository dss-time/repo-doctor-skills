# Output Contract

Lead with `status`, `phase`, output mode, current conclusion, and remaining decisions. Return the requested phase, recording shared facts and the ledger once.

## Clarification output

- `fast` returns relevant facts, inferences, evidence, and current unresolved nodes, omitting resolved branches.
- `standard` returns goal, non-goals, users, current/expected behavior, rules, data boundary, exceptional paths, compatibility, migration, acceptance, question tree, and a ledger of `confirmed`, `inferred`, `open`, `deferred`, and `out_of_scope`.
- `documented` adds terminology/ADR evidence, conflicts, authorization state, and the reason and evidence for authorized documentation edits.

Ask one question with a recommendation and trade-offs only while a material decision remains open. If specification was not requested, finish clarification with a compact decision summary. If specification was requested, reuse the ledger and continue without repeating the interview.

## Specification output

1. Settled source and evidence.
2. Target users, goals, current behavior, and desired behavior.
3. Scope, exclusions, constraints, and dependencies.
4. Normal, exceptional, boundary, permission, compatibility, and migration requirements.
5. Non-blocking assumptions, confidence, verification methods, deferred items, and unknown evidence.
6. Testable acceptance criteria using Given/When/Then or equally observable conditions.
7. Risks, completion status, and necessary next action.

Fast still covers applicable essential requirements, combining fields concisely. Standard and documented expand evidence. Specification returns only in the response, without file writes or a file-by-file implementation plan. Reopened material decisions mean specification is incomplete and returns to clarification.
