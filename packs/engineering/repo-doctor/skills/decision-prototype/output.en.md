# Output Contract

Lead with `status`, validation question, verdict, and recommended disposition.

1. `prototype_type`: `logic-prototype` or `ui-prototype`
2. `output_mode`: `fast`, `standard`, or `audit`
3. Single validation question and success/rejection criteria
4. Authorized location and `NON-PRODUCTION PROTOTYPE` marker
5. Key states, inputs, directions, and runnable command or interaction
6. Changed files and observed result
7. Verdict: `supported`, `rejected`, or `uncertain`
8. Evidence, limitations, and unresolved uncertainty
9. Production isolation and credential/data status
10. Disposition: `delete`, `retain_as_evidence`, or `reimplement_for_production`
11. Recommended next Repo Doctor Skill

Audit mode also includes exact permission and command ledgers. Never describe the prototype as production-ready.

When relevant, briefly state preserved authorization/business behavior, existing-data update evidence, validation target/isolation or unrun reason, and preexisting/concurrent edit protection. Unresolved safety gaps or edit conflicts keep affected work blocked/partial. Omit inapplicable fields and retain deferred-verification status.
