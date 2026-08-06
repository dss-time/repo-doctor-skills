# Bug Root Cause Analysis

A root-cause investigation starts with a trustworthy, repeatable signal that can tell success from the target failure.

## Output modes

- `fast`: concise default for a bounded bug: status, signal, reproduction, likely causal chain, confidence, blockers, and next step.
- `standard`: adds the main hypotheses, discriminating experiment, trigger/direct/systemic cause separation, and regression-protection advice.
- `audit`: adds the full evidence table, permission decisions, exact command ledger, alternatives, contradictory evidence, and all unverified items.

Collect the same quality of evidence in every mode; output mode changes disclosure, not rigor.

## Boundary

- Do not turn a general code review or broad repository diagnosis into root-cause analysis without a concrete symptom.
- Route failures whose defining context is a CI workflow or runner to `ci-failure-diagnosis`.
- Do not modify business code, tests, configuration, dependencies, documentation, or other user files.
- Shell permission authorizes only the non-destructive diagnostics defined below. It does not authorize a fix, dependency change, external system action, or production access.
- Route test creation to `safe-test-implementation` and production fixes to `safe-fix-implementation` after the root cause is sufficiently confirmed.
- Match the user's language and preserve technical identifiers verbatim.
- Never modify code, tests, configuration, documentation, dependencies, or diagnostic instrumentation. If a useful probe requires a file edit or new test, report it as `Blocked` until separately authorized under the appropriate Skill.

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

### Qualified observation signal

- Establish or confirm a signal before assigning a causal conclusion. A valid signal names the expected success and target failure, drives the relevant path, distinguishes this bug from nearby failures, and is repeatable under recorded conditions.
- The signal may be an existing test, static check, log query, already available non-production command, read-only probe, or precise user action sequence. Creating a new file or test is outside this Skill.
- Record the signal, inputs, environment, success predicate, failure predicate, observed result, and repeatability limits. Keep symptom reproduction separate from causal confirmation.
- When commands cannot run, provide the smallest user-runnable reproduction and evidence-collection steps. Mark their result `Unverified` until output is returned.
- For every hypothesis, record supporting evidence, a concrete falsification method or contradictory observation, confidence, and remaining unknowns.
- Without a reliable signal, a causal conclusion may be only `Inferred` or `Unverified`; never label it a confirmed high-confidence root cause.
- A repair direction must remove the causal mechanism, not merely suppress the visible symptom. Always propose a regression test or repeatable regression check.

## Workflow

1. Collect the symptom, user impact, affected scope, environment, version, inputs, state, timing, and reported reproduction conditions.
2. Establish or confirm the observation signal. Define its success predicate and target-failure predicate before forming a conclusion.
3. Prove the signal is relevant: show that it exercises the reported path and distinguishes the user's fault from unrelated failure. If this cannot be shown, mark the signal `Unverified` and cap the conclusion.
4. Build the smallest safe reproduction from existing commands, tests, logs, or user actions. Record failure rate and everything that remains load-bearing.
5. Partition the fault boundary across input, caller, module, dependency, configuration, environment, and time; compare working and failing cases when available.
6. Form ranked falsifiable hypotheses. For each, state the prediction, supporting and contradicting evidence, confidence, and one safe discriminator.
7. Apply command preflight, then use the narrowest available log, debugger observation, read-only probe, controlled comparison, or bisection. Change one explanatory variable at a time.
8. Separate `trigger_condition`, `direct_cause`, and `systemic_root_cause`. Do not call the trigger or visible exception the root cause unless causal evidence supports that level.
9. Recommend a regression test or repeatable regression check at the observable boundary, plus the smallest causal repair direction. Do not create the test or implement the fix.
10. Report `Observed`, `Reproduced`, `Inferred`, `Unverified`, and `Blocked` evidence honestly. State exactly what evidence would raise confidence.
