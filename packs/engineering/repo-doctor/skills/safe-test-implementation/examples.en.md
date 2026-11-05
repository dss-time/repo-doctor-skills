# Examples

- `test_first`: “Protect the behavior that a locked account rejects login.” Confirm the public boundary, add one test, prove it fails for that behavior, then stop for separately authorized production implementation.
- `regression_after_fix`: “The session fix is verified; add its regression test.” Run on the fixed state and report safe sensitivity evidence without inventing historical red.
- `characterization`: “Preserve the current CSV escaping contract before refactoring.” A passing initial run is valid if the assertion discriminates meaningful states.
- Audit blocker: a test script contains an install or database migration step. Record the command as `Blocked` and do not execute it.
- Non-trigger: “Fix the production null dereference.” Use `safe-fix-implementation`.

## A test name does not establish isolation
User: "Run the relevant tests to verify the fix."
Setup uses a shared development database and falls back to its default connection when test configuration is absent. NODE_ENV=test does not authorize cleanup against it. Mark that command Blocked, identify missing isolation evidence and continue independent authorized test edits without reading real credentials.
