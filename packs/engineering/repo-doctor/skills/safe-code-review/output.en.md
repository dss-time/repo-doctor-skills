# Output Contract

Lead with the overall conclusion, review scope, and highest-priority next action.

- `fast`: only evidence-backed P0/P1/P2 findings, blockers, and a bounded recommendation.
- `standard`: separate results for `Repository Conformance`, `Change Intent Fidelity`, and `Operational Safety`; explicitly state `no findings` or `insufficient evidence` per axis.
- `audit`: add evidence sources, commands/tests, skipped checks, permission record, and residual-risk ledger.

Every deduplicated finding must include: severity, contributing axis or axes, file, tight location, direct evidence, problem, impact, recommendation, and validation method. Never output a finding without evidence or implement the recommendation.
