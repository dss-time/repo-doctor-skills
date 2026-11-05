# Examples

- Approved CSV export: implement the agreed public export behavior and its quoting/error tests one slice at a time; cite actual focused check results and any unverified acceptance criteria.
- Continue approved work items: verify the current diff/evidence, skip completed unchanged slices, and resume the first unblocked item without re-requesting existing scope authorization.
- Missing test runner: finish independent authorized edits, report partial/unverified status and the pending command; do not install tools or claim green.
- Non-trigger: “Fix this diagnosed null check in one file.” Use `safe-fix-implementation`.
- Non-trigger: “Decide what the export feature should do.” Use `requirements-clarification`.

## Update only intended existing-data fields
User: "Add one editable field to existing configuration."
Verify actual omission, null, empty-value and whole-object replacement semantics. Avoid submitting stale records over unrelated fields. Investigate unknown payload semantics before affected writes and plan synthetic-record checks for field preservation and concurrency conflicts.
