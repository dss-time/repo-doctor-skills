# Decision Prototype Detailed Checklist

Read this only for branch design or audit evidence.

## Logic prototype

- One state/business-rule question
- Synthetic input cases covering the deciding edge
- Visible before/action/after state
- A runnable existing-runtime command
- No persistence or external request unless separately approved in non-production

## UI prototype

- One interaction or information-structure question
- Two or more materially different directions only when comparison is required
- Representative synthetic states, including empty, error, and dense states when relevant
- Existing design system and runtime; no production mutation
- A direct way to select and compare directions

## Audit evidence

- Authorized paths and commands
- Command preflight, working directory, exit code, and result
- Production isolation and redaction check
- Criterion-to-observation mapping
- Verdict, uncertainty, disposition, and production handoff
