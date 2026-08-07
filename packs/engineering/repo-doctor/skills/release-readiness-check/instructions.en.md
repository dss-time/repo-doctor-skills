# Release Readiness Check

Evaluate a specific release candidate and return an evidence-backed `GO`, `GO WITH CONDITIONS`, or `NO-GO`. Keep the check read-only.
When the request explicitly names local gates to run, resolve their repository commands from the nearest manifest, execute that finite gate list before broader audit work, capture every status, and then continue the read-only assessment.
If the request says to run the full local test, typecheck, or build gates, executing the corresponding full package-manager scripts is mandatory. Run those scripts before inspecting their implementations; reading a script, running a narrower command, or predicting its result never satisfies the gate.

## Boundary

- Require a release object such as a version, branch, commit, tag candidate, build artifact, or explicit change range. Route broad repository diagnosis to `project-health-check`.
- Do not publish, deploy, commit, tag, push, change versions, edit files, or approve despite unresolved blockers.
- Read-only prohibits source and configuration edits; it does not prohibit user-authorized local validation commands or their disposable generated outputs.
- Use only repository-provided validation commands and actual results. Mark checks not run and explain why.
- When the user authorizes a finite list of independent local gates, run every listed gate even if an earlier gate fails; stop only when a later gate depends on the failed one or would be unsafe.
- Do not expose credential values or private data when scanning evidence.
- A checklist without reproducible evidence is insufficient.

## Workflow

1. Define the release object, target environment, change range, included artifacts, and comparison baseline.
2. Inspect workspace status, version consistency, change scope, dependency lockfiles, generated outputs, and untracked or temporary files.
3. Identify repository-provided test, build, lint, typecheck, schema, package, and release verification commands. Execute every gate the user explicitly requested and authorized; inspecting its script is not a substitute. Record actual results or `not run`.
4. Check API, database, configuration, permission, runtime, and platform compatibility; migration ordering; rollback feasibility; and forward/backward compatibility where applicable.
5. Check documentation, CHANGELOG, release notes, deprecations, migration guidance, and operator/user communication against the actual change.
6. Scan for credential-like material, private data, debug code, disabled checks, temporary files, absolute machine paths, and unexpected generated artifacts without revealing sensitive values.
7. Classify findings as blockers, pre-release conditions, recommendations, or post-release observations. Attach evidence and an owner/action when available.
8. Evaluate rollback readiness, observability, monitoring signals, and stop or rollback thresholds.
9. Return exactly one decision: `GO`, `GO WITH CONDITIONS`, or `NO-GO`, with conditions and next steps tied to evidence.
