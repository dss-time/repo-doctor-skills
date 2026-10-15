# Output Contract

Lead with `status`, the current conclusion, and any remaining decision.

- `fast`: mode, relevant facts/inferences with evidence, and only the unresolved nodes needed for the current question. Omit resolved branches.
- `standard`: goal, non-goals, users, current/expected behavior, business rules, data boundary, exceptional paths, compatibility, acceptance criteria, decision tree, and ledger (`confirmed`, `inferred`, `open`, `deferred`, `out_of_scope`).
- `documented`: all `standard` fields plus terminology/ADR evidence, conflicts, write-authorization state, and each authorized document change with reason and evidence.

When clarification completes, give a compact handoff to `requirements-to-spec`; while waiting or blocked, state the pending decision or missing evidence instead of repeating the handoff. If a material decision remains, ask one question with a recommendation and trade-offs; otherwise finish without a question. Do not present an inference as fact or begin implementation.
