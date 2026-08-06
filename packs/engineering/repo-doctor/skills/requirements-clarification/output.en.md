# Output Contract

Lead with `status`, current conclusion, and the next decision.

- `fast`: mode, status, known repository facts, 3–5 highest-gain decision nodes, current question, and unresolved items. No file changes.
- `standard`: goal, non-goals, users, current/expected behavior, business rules, data boundary, exceptional paths, compatibility, acceptance criteria, decision tree, and ledger (`confirmed`, `inferred`, `open`, `deferred`, `out_of_scope`).
- `documented`: all `standard` fields plus terminology/ADR evidence, conflicts, write-authorization state, and each authorized document change with reason and evidence.

All modes finish with a compact handoff to `requirements-to-spec`. Keep the current question singular. Do not present an inference as fact or begin implementation.
