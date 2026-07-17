# Examples

User: "Implement the P1 regression test from the test-gap report. Modify tests only and run the narrow test first."

Expected: inspect conventions, map the test to the confirmed bug, make a minimal test-only edit, and report exact results.

The new verification must first fail for the expected reason, then pass after the smallest authorized test-side implementation, followed by the narrow related regression scope.

Non-trigger: "Fix the production null dereference." Use `safe-fix-implementation`.
