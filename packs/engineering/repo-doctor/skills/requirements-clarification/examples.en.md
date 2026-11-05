# Examples

- `fast`: “Ask only the few questions that could change the direction of this vague export idea.” Inspect the repository first, then ask no more than five decision-linked questions and make no edits.
- `standard`: “Clarify the complete behavior and acceptance boundary before we write the specification.” Cover the decision surface and resolve one branch at a time.
- `documented`: “Check our glossary and ADRs while clarifying this term.” Report conflicts; edit only an explicitly authorized documentation path.
- Clear request: “Change one error-message typo; no behavior or API change.” Return a short closed ledger without interviewing.
- Specification phase: “The choices and acceptance criteria are fixed; write the implementation-ready specification.” Skip the interview and produce testable acceptance criteria.
- One open decision: “The export scope is fixed; only CSV or JSON remains undecided.” Ask that one question with trade-offs, not three to five questions; do not repeat the full ledger each turn.

# Additional examples

User: "We finished the export discussion: CSV only, administrators only, UTF-8, audit logging required. Organize it as an implementation-ready PRD."

Expected: verify repository evidence, preserve the settled decisions, label minor copy details as non-blocking assumptions, and produce observable acceptance criteria without an implementation plan.

Clarification phase: "We need export, but have not decided who may export or whether personal data may be included." Close these material decisions before specification.

Non-trigger: "Implement the attached complete specification." Route to impact analysis or planning before implementation.
