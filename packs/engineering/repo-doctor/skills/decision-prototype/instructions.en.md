# Decision Prototype

A prototype is useful only when one declared question can change the next decision.

## Branches and output modes

- `logic-prototype`: exercise business rules, data shapes, or state transitions through a small runnable interface.
- `ui-prototype`: expose materially different information structures or interactions for visual comparison.
- `fast`: question, criterion, branch, run instruction, verdict, and disposition.
- `standard` (default): add authorized location, key states, evidence, limitations, and production handoff.
- `audit`: add permission record, command preflight/ledger, changed files, isolation evidence, and all uncertainties.

Read `references/prototype-checklist.en.md` only when designing states, deciding isolation, or preparing audit evidence.

## Permission and production boundary

- Require explicit authorization for the prototype file paths and every shell command. A request to explore an idea does not authorize writes.
- Inspect repository instructions, framework, existing task runner, routing, component system, and safe scratch conventions before choosing a location.
- Mark every artifact `NON-PRODUCTION PROTOTYPE`. Do not present it as tested, hardened, accessible, secure, maintainable, or complete production code.
- By default do not connect a production database, use real credentials, send real external requests, mutate production data, deploy, publish, commit, or delete files.
- Use in-memory state, synthetic public-safe data, and local stubs. If the question genuinely concerns persistence or an external dependency, stop for a separately approved non-production environment and data boundary.
- Never install a dependency without explicit authorization. Prefer the existing runtime and components.
- Do not automatically delete prototype files. Recommend deletion, retention as evidence, or formal reimplementation; execute deletion only on a separate explicit request.
- Production work must move to `requirements-to-spec`, `safe-change-plan`, or `safe-fix-implementation` with appropriate authorization.

## Workflow

1. State one validation question in a form the prototype can answer. Split or defer every second question.
2. Define observable success criteria and what would count as rejection or uncertainty.
3. Select `logic-prototype` or `ui-prototype` from the evidence, and state the choice.
4. Inspect repository rules and confirm the explicitly authorized file location, command scope, and non-production isolation.
5. Build the least code that is runnable and sufficient to exercise the criterion. Reuse existing tooling; avoid abstraction, polish, broad error handling, and unrelated cleanup.
6. Surface the key states and results. Logic prototypes show inputs, transitions, and outcomes; UI prototypes show the materially different states or directions needed to decide.
7. Run only preflighted commands and record observed results. Do not infer a successful run from compilation or appearance alone.
8. Compare evidence with the success criteria and record the decision.
9. Return exactly one verdict: `supported`, `rejected`, or `uncertain`, with the evidence and remaining unknowns.
10. Recommend `delete`, `retain_as_evidence`, or `reimplement_for_production`. Never equate keeping the prototype with production completion.

## Stop conditions

Return `Blocked` for missing write authorization, unsafe location, unavailable runtime, required production access, real credentials/data, unapproved dependency installation, destructive cleanup, or a validation question too broad to answer with a minimal prototype.
