# Bug Root Cause Analysis

Reproduce and locate the root cause of a specific defect. Build an evidence chain; do not implement the fix.

## Boundary

- Do not turn a general code review or broad repository diagnosis into root-cause analysis without a concrete symptom.
- Route failures whose defining context is a CI workflow or runner to `ci-failure-diagnosis`.
- Do not modify business code, tests, configuration, dependencies, documentation, or other user files.
- Shell permission authorizes only the non-destructive diagnostics defined below. It does not authorize a fix, dependency change, external system action, or production access.
- Route test creation to `safe-test-implementation` and production fixes to `safe-fix-implementation` after the root cause is sufficiently confirmed.
- Match the user's language and preserve technical identifiers verbatim.

## Safe Diagnostic Execution

### Allowed diagnostics

- Use `rg` or equivalent code search; read files, configuration, logs, existing tests, and diagnostic output.
- Use read-only Git commands such as `git status`, `git diff`, `git log`, and `git show`. Do not change branches, the index, or the working tree.
- Read the actual command source in `package.json`, `Makefile`, CI workflow files, or equivalent build and test configuration before running it.
- Query existing tool and runtime versions and inspect already configured build or test settings.
- After the test-command gate passes, run the narrowest relevant existing test or a non-destructive minimum reproduction using non-production inputs.
- Compare pre-fix behavior and read test, build, or diagnostic output. Do not implement the repair.
- Stop and request confirmation when a diagnostic has uncertain, privileged, destructive, external, or production side effects.

### Prohibited actions

- Do not run `rm` or `rmdir`, or perform any unconfirmed deletion.
- Do not run `git reset`, `git checkout`, `git clean`, `git commit`, or `git push`.
- Do not install or upgrade dependencies with `npm install`, `pnpm install`, `yarn add`, `pip install`, `go get`, or equivalent commands.
- Do not run database migrate, seed, drop, or truncate operations.
- Do not deploy, publish, release, or tag anything.
- Do not run `sudo`, `chmod`, or `chown`.
- Do not modify a system proxy, VPN, TUN, network routes, system services, or host configuration.
- Do not send requests to a production environment or use production data to reproduce a defect.
- Do not print API keys, authentication credential values, or sensitive environment-variable values.
- Do not execute `curl | sh`, another remote-script pipeline, or downloaded code.
- Do not run `kill`, `pkill`, `service restart`, or other process or service controls.
- Do not execute an unknown repository script before reading its definition and transitive script chain.
- Do not use shell redirection, `tee`, or editor commands to change repository or user files.
- Do not change production code, tests, configuration, documentation, or dependencies to make reproduction easier.

### Test-command gate

Before running `npm test`, a repository script, or a language-specific test command:

1. Read the command and every referenced script definition.
2. Check for install, migration, deployment, publication, deletion, network, credential, service-control, or other external side effects.
3. Prefer the smallest targeted test and non-production fixture that can answer the diagnostic question.
4. Stop and request confirmation if any high-risk or uncertain side effect remains.
5. Never assume a command is safe only because its name contains `test`.

### Temporary artifacts and workspace integrity

- Capture read-only workspace state, including `git status --short` when Git is present, before and after diagnostics.
- Prefer an isolated system temporary directory for unavoidable caches or minimum-reproduction artifacts; never overwrite user files.
- Do not run `rm` or `rmdir` for cleanup. Allow only automatic cleanup by an isolated tool or runtime for artifacts created in this run and proven to belong to it.
- If ownership cannot be proven, leave the artifact in place and report it rather than deleting it.
- If a diagnostic produces a tracked-file diff, stop immediately and report the command and changed paths. Do not revert, clean, or continue.

### Evidence status

- `Observed`: directly read from repository evidence, logs, or an executed command.
- `Reproduced`: an executed command recreated the reported symptom under recorded conditions.
- `Inferred`: supported by evidence but not directly reproduced or observed.
- `Unverified`: could not be checked or no command was run.
- `Blocked`: intentionally not executed because permission, safety, capability, or required input was missing.

Record every executed diagnostic with its exact command, working directory, exit status, and relevant result. Redact sensitive values. Never claim `Reproduced` or a passing test when the corresponding command did not run successfully.

### Repeatable feedback mechanism

- Establish a repeatable feedback mechanism before assigning high confidence to a root cause. It may be an existing test, static check, log query, minimum script in an isolated temporary location, non-production interface request, or precise user action sequence.
- Record the mechanism, inputs, environment, expected symptom, observed result, and repeatability limits. Keep symptom reproduction separate from causal confirmation.
- When commands cannot run, provide the smallest user-runnable reproduction and evidence-collection steps. Mark their result `Unverified` until output is returned.
- For every hypothesis, record supporting evidence, a concrete falsification method or contradictory observation, confidence, and remaining unknowns.
- Without a reliable feedback mechanism, a causal conclusion may be only `Inferred` or `Unverified`; never label it a confirmed high-confidence root cause.
- A repair direction must remove the causal mechanism, not merely suppress the visible symptom. Always propose a regression test or repeatable regression check.

## Workflow

1. Record the symptom, user impact, affected scope, environment, version, inputs, state, and reproduction conditions.
2. Inspect repository instructions, command definitions, existing tests, configuration, and current workspace state before selecting a command.
3. Apply the safe diagnostic and test-command gates; record skipped commands as `Blocked` or `Unverified` with the reason.
4. Select and record a repeatable feedback mechanism. If none can run, provide minimum user-runnable steps and cap the conclusion at `Inferred` or `Unverified`.
5. Reproduce the symptom when safely possible. If not reproduced, state why; symptom reproduction alone is not root-cause confirmation.
6. Start from the first trustworthy error or invariant violation. Treat later failures as possible cascades until proven otherwise.
7. Trace `input/state -> execution path -> failure point -> user-visible symptom` using file locations, logs, stack frames, configuration, tests, or minimum experiments.
8. Compare working and failing paths, versions, inputs, or environments when evidence permits.
9. For primary and alternative hypotheses, record support, falsification method, contradictory evidence, confidence, and unknowns. Run the safest discriminator available.
10. Confirm the root cause only when the feedback mechanism and causal evidence distinguish it from plausible alternatives.
11. State the smallest causal repair direction and regression test or check without editing files. Reject symptom-only workarounds as root-cause fixes.
12. Assign confidence and list the exact evidence needed to raise it.
