# User workspace change and validation safety

Apply only sections relevant to the task's edits, existing-data updates or command execution. Reuse verified evidence while it remains current; a typo or pure algorithm change does not require a database/deployment investigation. Preserve existing authorization and Skill capability limits. Unknowns block the affected operation while independent safe authorized work can continue. Honor user-directed verification deferral and retain pending checks until the agreed point.

## 1. Preserve authorization and business behavior

- Before editing, identify the intended change and required existing behavior from the user's request, surrounding implementation, callers and tests. As applicable, inspect authentication, role/action permissions, object/tenant ownership, field filtering, input validation, state transitions, error feedback and existing callbacks/effects. Hidden UI is not evidence of server authorization.
- Distinguish invariants intentionally changed by this task from invariants to preserve. A specifically authorized permission fix may change its target policy. Otherwise, never make a check pass by removing authorization, broadening access, bypassing validation, swallowing errors, fabricating success or weakening assertions.
- Trace real call paths to enforcement points and business effects so a local edit cannot bypass existing checks. Resolve missing intent or constraint evidence when it affects authorization, data or business outcomes.
- Plan paired verification for applicable boundaries: valid authorized operations still succeed, unauthorized/invalid operations remain rejected, and error paths do not produce success effects. Deferred or blocked checks remain unverified.

## 2. Preserve contents when updating existing data

- For existing records, configuration or persistent state, inspect actual callers, interface implementation/contracts and existing examples first. Distinguish omitted fields, null, empty strings/arrays, 0 and false, and partial update, whole-object replacement, append, clear, overwrite and delete behavior. PUT/PATCH names alone do not establish semantics.
- Identify writable fields and server-owned fields and verify nested-object/list merge or replacement rules. Avoid spreading entire records into writes and causing over-assignment, or submitting stale whole objects that overwrite unrelated fields. Use the established, verified update interface.
- Send clearing values only when clearing/deletion is in the user's goal and interface semantics are confirmed. An id-only payload, `value || default`, or converting missing fields to empty values can lose data and must be evaluated against the contract. Preserve valid 0/false values.
- Where other actors can update the same data, inspect existing versions, ETags, conditional writes, conflict handling or transactions. Preserve concurrency controls during read-modify-write and do not treat an old snapshot as current data. Block affected writes when safe update semantics are unknown. Do not replay writes with unknown outcomes.
- Plan synthetic-data checks that only intended fields change, unrelated fields remain, omission differs from clearing, nested objects/lists follow the contract, and valid values/concurrency conflicts behave correctly. Do not probe semantics using real data.

## 3. Actual test and build environment

- Before execution, inspect command definitions, package-manager lifecycles, transitive scripts, test setup/teardown, fixtures, plugins and build hooks. Identify file/storage writes, external services, migrations, cleanup, uploads, notifications, queued work and device actions.
- Establish actual resource ownership and isolation from safely readable configuration structure, non-sensitive target identifiers and existing environment evidence. Inspect variable names/sources, non-sensitive targets and effects only. Do not read or print credentials, full environment dumps or credential-bearing connection strings.
- Names such as test/build, NODE_ENV=test, localhost, containers or development databases alone do not prove disposability. Shared development databases, containers mounting user files, browser persistence and local services can hold real data. Confirm that errors or missing configuration cannot fall back to real environments.
- Prefer existing local stubs, in-memory resources or demonstrably isolated disposable resources. Write artifacts only to authorized paths and ensure cleanup cannot delete source, user files or shared directories. Do not automatically install tools or broaden external access to make checks pass.
- If isolation or effect scope cannot be established, do not run that command. Mark it Blocked/Unverified and identify missing evidence. Isolation must fit the current Skill's permissions; task authorization does not expand prohibited production access, migrations or publishing.
- Recheck preflight when evidence or environmental dependencies change. After failures, reconcile effects before destructive recovery or replaying external writes with unknown outcomes.

## 4. Protect existing and concurrent edits

- Before writing, read the target, record its current content baseline and relevant actual diff, and distinguish preexisting user edits, this task's edits and unknown changes. Git is supplemental; HEAD or an assumed clean tree does not replace current contents. Protect untracked files and authorized files outside Git as well.
- Immediately before writing, recheck the resolved target, file identity and edited region. Use expected-content/version conditional updates when supported. On baseline changes, reread and compare. Recompute the patch on the new baseline when both edits can clearly be preserved; otherwise pause that file and retain reconciliation evidence.
- Prefer focused patches over whole-file writes from stale content. Check generator/formatter write sets and preexisting edits too. Never resolve conflicts with reset, checkout, clean or a stale backup overwriting user files.
- Roll back only attributable regions introduced by this task. When later edits exist, do not restore an entire pre-edit snapshot. Preserve the file and report conflicts when ownership cannot be separated safely. Backups must follow data-handling restrictions and must not persist extra sensitive content.
- A pre-write read is not atomic write protection. Without conditional-update support, minimize the read/write window, recheck the result and disclose remaining concurrency uncertainty.

## Completion and output

Before delivery, check the final diff, data payload, actual command execution status and file baseline against applicable sections. Unresolved permission changes, data-loss risks, unknown environment effects or edit conflicts prevent a safe-completion claim. Keep output compact and report only relevant preserved invariants, update-semantics evidence, validation environment/unrun reasons and edit-protection status. Deferred verification uses verification_deferred. Static inspection is not real-interface validation or a runtime isolation guarantee.
