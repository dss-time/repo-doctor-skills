# Worked delivery examples

[简体中文](delivery-examples.zh-CN.md) · [Workflow cookbook](../WORKFLOW_COOKBOOK.md)

These are fictional walkthroughs, not commands or test results observed in this repository. Paths, script names and outcomes illustrate what evidence to collect; resolve real commands from the target project's manifest. `feature-implementation` is included in v0.8.0 and is not included in v0.7.3.

## 1. Deliver a settled CSV export feature

**Confirmed contract:** export the filtered rows in displayed order; use columns `name,email`; null fields become empty cells; quote commas, quotes and line breaks using CSV escaping; export failure shows an error and keeps the current screen. Authentication and public API changes are excluded. Source, related tests and the export help page are authorized; dependency installation and publishing are excluded.

Start with:

```text
$feature-implementation Implement the confirmed CSV export contract below.
Scope: src/export/, tests/export/, docs/export.md.
Local validation is authorized after command preflight. Do not install dependencies,
change authentication, commit or publish.
Contract: <the confirmed contract above>
```

An adequate existing spec and known impact can be reused; do not manufacture clarification or planning stages. If a material contract is missing, resolve that before code.

| Slice | Implementation and evidence | Completion boundary |
|---|---|---|
| Serialize cells | At the public serializer boundary, prove a focused test fails for missing escaping in `test_first`, implement the minimal serializer, then rerun the same check. | Normal, null, comma, quote and newline cases satisfy the agreed contract. |
| Export filtered rows | Connect the existing filter state to export without changing filtering or row order. Run the relevant integration check. | Exported rows match the visible filtered order, with the agreed columns. |
| Handle failure and explain usage | Preserve the screen on failure, show the agreed error and update the authorized help page. | Error behavior is verified and the docs describe the implemented behavior. |

Inspect package scripts and hooks before execution. Suppose this example project defines `test:export`: record its exact command, exit code and assertion result; listing it in the manifest alone proves nothing. Fix a failed slice before dependent work, and preserve evidence for unchanged completed slices.

Illustrative final report:

```text
Complete within the approved scope. CSV serialization, filtered ordering and
failure behavior are implemented in <changed paths>; help is updated.
Acceptance evidence: <criterion -> test/location -> observed result>.
Validation: <actual focused commands, exit codes and concise results>.
Review: <observed review findings and their resolution>.
Release/deployment was not performed.
```

Report `partial` if any acceptance criterion lacks evidence. This report does not grant release permission; a release gate is a separate decision.

## 2. Repair a diagnosed local bug

**Observed example:** a public parser rejects an empty optional field with a null dereference. Diagnosis cites the failing input and the exact branch; the agreed behavior is an empty value, while invalid non-empty input must still be rejected.

1. `bug-root-cause-analysis` records the reproducer, expected/actual result and supported cause. An unexplained failure does not yet justify editing.
2. With source/test writes authorized, `safe-fix-implementation` edits only the affected null branch. For test authoring, apply `safe-test-implementation` in the appropriate mode: `test_first` requires actual red; a test added after a fix uses `regression_after_fix` and states its sensitivity evidence without inventing historical red.
3. Run the focused regression and a neighboring invalid-input case. The final report links changed paths, actual check results and any residual uncertainty. A wider cleanup is deferred.

If the test runner is missing, an acceptable result is:

```text
Partial: the scoped parser fix is implemented, but validation is unverified
because <required runner> is unavailable. Pending check: <manifest-defined command>.
No dependency installation was performed. Resume after the runner is available;
check the current diff, then run that command before claiming verification.
```

## 3. Hand off a genuinely human-only blocker

Use this format only when the agent cannot complete the required step with its available tools and authorization. Do not turn ordinary executable work into a manual task.

Example: a previously authorized operation returns an official browser authentication link and requires account-owner approval.

| Field | What to give the user |
|---|---|
| Location | The official authentication link returned by the tool, and the local terminal that is waiting. Never invent a link or dashboard path. |
| Action | Open the link yourself, confirm the intended account and approve the requested authentication. Enter secrets only in the trusted official interface. |
| Success signal | The local CLI reports authentication complete, or the account owner reports completion. A link opening alone is not success. |
| Resume | Tell the agent “authentication complete”; the agent verifies a non-sensitive account/status signal, then resumes only the previously authorized operation. |

Never ask for a password, token or one-time code in chat. Do not assume completion after time passes or automatically retry publication. Continue independent authorized work while waiting; keep dependent work blocked until the required success signal exists. If the destination/account or authorization scope changes, resolve that new decision first.
