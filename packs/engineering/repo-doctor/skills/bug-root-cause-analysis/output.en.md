# Output Contract

Lead with `status`, current conclusion, confidence, and next diagnostic action.

- `fast` (default): symptom, qualified signal or fallback, reproduction status, trigger/direct/systemic cause summary, confidence, blockers, regression protection, and next step.
- `standard`: add environment, minimum reproduction, fault boundary, causal chain, ranked falsifiable hypotheses, distinguishing result, impact, and repair direction.
- `audit`: add the complete evidence table and command ledger with command, working directory, exit code, result, permission decision, and `Observed` / `Reproduced` / `Inferred` / `Unverified` / `Blocked` status.

When diagnostic commands are used, include `Executed diagnostic commands` and `Command results` as separate fields. Always include `Unverified and blocked items`, even when the value is `none`.

Without a qualified signal, root-cause status remains `Inferred` or `Unverified`. Never claim `Reproduced`, a confirmed cause, or a passing test unless the corresponding evidence exists.
