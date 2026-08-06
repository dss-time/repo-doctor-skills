# Requirements Clarification

Every question must close a named decision; repository facts are discovered, while product choices are decided by the user.

## Modes

- `fast`: ask only the 3–5 unresolved questions with the highest information gain. Prefer choices that can change the solution direction. Keep the response short and never create or modify files.
- `standard` (default): close the full decision surface: goal, non-goals, users, current and expected behavior, business rules, data boundary, exceptional paths, compatibility, acceptance conditions, and open decisions.
- `documented`: perform `standard`, then inspect project terminology and relevant ADRs for conflicts. A documentation change is optional and requires explicit path-scoped write authorization. Record why each edit is necessary and which evidence supports it.

Do not silently change mode. Output modes and their minimum fields are defined in the localized output contract.

## Permission and scope boundary

- Read user-provided material and relevant repository files before asking. Do not ask the user to repeat an answer reliably established by repository evidence.
- Never edit code, tests, configuration, task systems, or production data.
- In `fast` and `standard`, stay read-only. In `documented`, do not edit domain documentation or ADRs until the user explicitly authorizes the exact write scope. A request to clarify requirements is not write authorization.
- Before an authorized documentation edit, inspect repository rules and the target file, preserve established structure, and report the reason and evidence. Use `architecture-decision-record` for a new durable architectural decision and `documentation-sync` for general confirmed drift when either is the narrower owner.
- Keep facts, reasoned inferences, open decisions, deferred decisions, and out-of-scope items separate.
- Do not manufacture a long questionnaire for a simple, explicit, low-risk change or re-open decisions already fixed by an authoritative specification.

## Decision-tree workflow

1. Read the request, linked specifications, repository instructions, terminology, interfaces, configuration, tests, and relevant history available within scope.
2. Create a decision ledger with `confirmed`, `inferred`, `open`, `deferred`, and `out_of_scope`. Cite sources for facts and the basis and confidence for inferences.
3. Build a question tree. Each node names the decision it resolves, why it matters, dependencies, answer source (`repository` or `user`), and child branches.
4. Explore every fact that can be verified from code or documentation before asking. Ask the user only for product choices, business trade-offs, priorities, or value judgments.
5. Rank unresolved branches by direction-changing impact, risk, reversibility, and dependency. In `fast`, select at most five highest-gain branches.
6. Work one branch at a time. Ask one concrete question, include a recommended option and concise trade-offs, wait for the answer, then update the ledger. Do not enter another dependent branch until the current branch is resolved or explicitly deferred.
7. In `standard` and `documented`, cover goal, non-goals, users, current behavior, expected behavior, business rules, data boundaries, exceptional paths, compatibility, acceptance criteria, and remaining decisions.
8. In `documented`, compare user language with the project glossary and relevant ADRs. Record terminology conflicts separately from product decisions; do not silently rename established concepts.
9. Stop when no remaining open decision can materially change the implementation contract. Mark lesser unknowns `deferred` with a revisit condition.
10. Return the decision ledger, unresolved items, and a compact handoff to `requirements-to-spec`. Do not implement.

## Stop conditions

Return `Blocked` when essential evidence is unavailable, the user declines a required choice, authoritative sources conflict, or a requested durable edit lacks explicit write authorization. A clear request or existing complete specification should finish immediately or route to `requirements-to-spec`, not start an interview.
