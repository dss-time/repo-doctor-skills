# Workflow Cookbook

This guide starts with real tasks instead of assuming that you already know every Skill name. Each workflow explains the sequence, why each Skill belongs there, copyable prompts, permission transitions, stop conditions, and safe handoffs.

For the purpose of an individual Skill, open the [Complete Skill Catalog](SKILL_CATALOG.md). If you have not installed or built the project yet, start with the [User Manual](USER_MANUAL.md).

## Before You Start: Invocation and Safety Conventions

### Use portable natural language

The prompts in this guide say “Use skill-name...” so they can be copied across platforms:

- In Codex with installed Skills, you may replace the first sentence with **$skill-name** or select the Skill through **/skills**.
- ChatGPT single-Skill ZIPs have plugin prefixes: Repo Doctor uses **rd-***, Productivity Toolkit uses **pt-***, and Skill Maintainer uses **sm-***. For example, the canonical **repo-onboarding** Skill is published as **rd-repo-onboarding**. After upload, use the Skill selection mechanism shown by the current interface or ask in natural language; do not assume every ChatGPT surface supports **$**.
- When using a ChatGPT plugin, supported surfaces can select a plugin or bundled Skill through **@**.
- Invocation on Claude Code, Cursor, Qwen, Kimi, and the generic Prompt Pack depends on the host. If there is no native selector, keep the canonical name in the prompt and describe the task in natural language.
- The three Document Data Doctor Basic Skills are included in regular cross-platform outputs, but they have no standalone plugin or ChatGPT ZIP.

Platform names can vary. The canonical slug, responsibility boundary, and handoff content in a workflow should not.

### Permission labels

| Label | Meaning | Rule |
|---|---|---|
| **[R]** | Read-only analysis | May read repositories or supplied material; does not write files. |
| **[R+T]** | Read-only with controlled tools | May run reproduction, parsing, rendering, or validation commands without writing business files. |
| **[R+N]** | Read-only with network access | Uses sources only when the host allows it; without network access, findings must be marked unverified. |
| **[A]** | Advice or gate decision | Produces a specification, plan, action list, or GO/NO-GO decision without implementation. |
| **[W]** | Controlled write | Writes only within the Skill contract and the scope explicitly authorized by the user. |
| **[GATE]** | Explicit approval point | The next phase moves from analysis to writing, execution, or a release-related action, so scope must be confirmed first. |

These labels summarize canonical metadata and Skill contracts; they do not grant host permissions. Host controls for files, commands, and network access still apply. Every active Skill in this repository disallows destructive actions.

### Carry evidence through every handoff

Do not tell the next Skill only to “continue.” Pass the prior output as evidence and state that it is not new authorization to write:

```text
Use <next-skill> for the next step.

Goal:
In scope / out of scope:
Prior conclusions and evidence locations:
Confirmed facts:
Unknowns and assumptions:
Allowed files, commands, and network scope:
Stop conditions:

The prior output is evidence only. It does not authorize file changes, release,
commit, or push operations.
```

If the previous step has a blocking unknown, the next Skill should stop and ask. Non-blocking unknowns should remain explicit assumptions with confidence.

## Workflow Finder

| Real task | Recommended starting point | Main gate before writing |
|---|---|---|
| Unsure which Repo Doctor workflow fits | **repo-doctor-router** | Router recommends only and never executes the next Skill |
| Understand an unfamiliar repository | **repo-onboarding** | Normally no write phase |
| Move from a vague requirement to a release gate | **requirements-clarification** | Close material decisions, then confirm specification, slices, impact, and plan |
| Diagnose and fix a runtime bug | **bug-root-cause-analysis** | Confirm root cause and minimal fix scope |
| Diagnose a CI failure | **ci-failure-diagnosis** | Confirm the first real error and remediation branch |
| Review a high-risk API, database, or security change | **change-impact-analysis** | Confirm specialist evidence and an atomic plan |
| Turn research into a report | **research-brief** | Verify sources and authorize an output file |
| Clean spreadsheet data | **excel-data-quality-check-basic** or **spreadsheet-data-cleaning** | Confirm cleaning rules and a new output path |
| Turn meeting notes into actions and a presentation | **meeting-notes-to-actions** | Confirm owners, dates, and file output |
| Review a document, PDF, or spreadsheet | A Basic or enhanced Skill | Confirm tool capability and whether edits are allowed |
| Author and audit a Skill | **skill-authoring** | Confirm creation scope, generated artifacts, and publication actions |

## 1. Understand an Unfamiliar Repository

**Use when:** You do not yet know the stack, entry points, build commands, test commands, or reading order.  
**Sequence:** **repo-onboarding [R]** → optional **project-health-check [R]**.

| Step | Why this Skill | Output and permission |
|---|---|---|
| 1. Repository orientation | **repo-onboarding** builds a project map without expanding “understand this project” into a health check or code review. | Read-only; reports the stack, entry points, commands, key directories, reading order, and unknowns. |
| 2. Optional health check | Use **project-health-check** only if you also want broad findings about tests, dependencies, configuration, and maintainability. | Read-only; produces broad health findings and does not fix them. |

Copyable prompt:

```text
Use repo-onboarding to help me understand the current repository.

Based on actual files, explain the technology stack, main entry points, build and
test commands, relationships between key directories, and a recommended reading
order. Mark anything without evidence as unknown. Do not modify files.
```

Request the optional check separately:

```text
Use project-health-check for a read-only health assessment of the repository we
just mapped.

Focus on build, tests, dependencies, configuration, documentation, and
maintenance risks. Cite file locations and separate facts, inferences, and
unknowns. Do not implement fixes.
```

**Gate and handoff:** This workflow remains read-only by default. If the result recommends a fix, do not ask it to “fix everything.” Pass one concrete issue to **change-impact-analysis** or **safe-change-plan**, then confirm scope before implementation.

## 2. Move from a Vague Requirement to a Release Gate

**Use when:** A user has an incomplete feature request and wants it delivered safely.  
**Sequence:** **requirements-clarification [R]** → **requirements-to-spec [R]** → optional **spec-to-work-items [A]** → **change-impact-analysis [R]** → **safe-change-plan [A]** → **[GATE]** → **safe-fix-implementation [W]** → **safe-code-review [R]** → **test-gap-analysis [R]** → optional **[GATE] safe-test-implementation [W]** → optional **documentation-sync [W]** → **release-readiness-check [A/GATE]**.

| Phase | Why it comes here | Main boundary |
|---|---|---|
| Decision clarification | **requirements-clarification** reads repository evidence and closes only choices that materially affect behavior, compatibility, security, data, migration, or acceptance. | Asks one focused decision at a time and stops before specification or code. |
| Specification | **requirements-to-spec** converts settled material decisions into scope, constraints, flows, and testable acceptance criteria. | If a material decision is open, stop and return to clarification; do not plan code or write files. |
| Delivery slicing | For a large specification, **spec-to-work-items** creates vertical, independently verifiable items with dependencies, conflicts, tests, and parallel groups. | Does not create external issues or replace the code-level `safe-change-plan`. |
| Impact analysis | **change-impact-analysis** uses repository evidence to identify affected modules, contracts, tests, and risks. | Does not implement changes. |
| Implementation plan | **safe-change-plan** turns confirmed inputs into atomic steps with validation and rollback. | Stops and sends work back when requirements are vague or impact is unknown. |
| Implementation | **safe-fix-implementation** implements one confirmed issue or tightly bounded fix. | The plan and file scope must be approved before code writes or commands. |
| Review and tests | **safe-code-review** reviews the change; **test-gap-analysis** identifies gaps; **safe-test-implementation** writes tests only after approval. | Review and gap analysis are not write authorization. |
| Documentation and gate | Use **documentation-sync** for user-visible behavior, then **release-readiness-check** for GO, GO WITH CONDITIONS, or NO-GO. | The release gate does not release, change versions, create tags, commit, or push. |

Close material decisions first, then create the specification:

```text
First use requirements-clarification to close material decisions. After they are closed, use requirements-to-spec to turn the settled request into an implementable,
verifiable specification:

<paste the original request>

Use repository evidence to resolve questions. Include in-scope and out-of-scope
items, constraints, assumptions, open questions, and testable acceptance
criteria. Ask only about blocking choices. Do not modify code or create an
implementation plan yet.
```

```text
Use change-impact-analysis to analyze the confirmed specification.

Specification:
<paste it or provide its file location>

List directly and indirectly affected modules, contracts, configuration, tests,
documentation, and compatibility risks, with evidence locations. Do not modify
files.
```

```text
Use safe-change-plan to create an atomic implementation plan from the confirmed
specification and impact analysis.

For each step, state the goal, files or modules, intended change, dependencies,
validation, failure rollback, and stop condition. Separate required work,
recommended work, and later improvements. Do not execute the plan.
```

**[GATE] Before implementation:** Approve the files or modules, allowed validation commands, explicitly excluded scope, and stop conditions. Then invoke:

```text
Use safe-fix-implementation to execute only this approved plan item:

<one atomic step>

Allowed changes:
Allowed commands:
Explicitly excluded:
Stop conditions:

Protect existing worktree changes, make the smallest change, and run the most
relevant validation. Do not broaden scope, commit, or push.
```

Review and test analysis remain separate:

```text
Use safe-code-review to review the current changes without editing them.

List evidence-backed findings by severity, with impact and validation advice.
Do not auto-fix findings or label style preferences as high risk.
```

```text
Use test-gap-analysis to map the confirmed requirement and current diff to the
existing tests.

Separate covered, partially covered, missing, and indeterminate scenarios.
Prioritize recommendations by risk. Do not create test files.
```

If the gaps justify new tests, authorize them separately:

```text
Use safe-test-implementation to add only these confirmed high-value tests:

<paste the gaps and behavior mapping>

Choose exactly one mode: test_first before behavior exists, regression_after_fix after a verified fix, or characterization for legacy behavior. Only test_first requires an observed expected failure; never fabricate a red run. Modify only tests, fixtures, and necessary test helpers. If
production code must change, stop and explain why. Run the smallest relevant
tests first, then a reasonable regression scope.
```

Documentation and final gate:

```text
Use documentation-sync to update only documentation affected by the confirmed
implementation and diff.

Preserve the existing language, structure, and terminology. Write only claims
that code or configuration can prove. If you find an implementation error,
report it as a blocker and do not edit business code.
```

```text
Use release-readiness-check as a read-only gate for the current release
candidate.

Provide reproducible evidence, blockers, conditions, risks, rollback readiness,
and a GO, GO WITH CONDITIONS, or NO-GO conclusion. Do not release, change the
version, create a tag, commit, or push.
```

**Safe handoff:** Every step receives the previous conclusions and evidence only. A plan is not implementation authorization, test advice is not authorization to write tests, and a GO decision is not release authorization.

## 3. Diagnose and Fix a Runtime Bug

**Use when:** A stable or intermittent user-visible failure needs a proven root cause before repair.  
**Sequence:** **bug-root-cause-analysis [R+T]** → optional **safe-change-plan [A]** → **[GATE] safe-fix-implementation [W]** → **test-gap-analysis [R]** → optional **[GATE] safe-test-implementation [W]** → **safe-code-review [R]**.

| Step | Why | Stop condition |
|---|---|---|
| Root-cause analysis | **bug-root-cause-analysis** starts with the first credible error and builds an input/state → path → failure point → symptom chain. | Do not claim a proven root cause when reproduction fails, key logs are absent, or equally plausible hypotheses remain. |
| Plan | For cross-module, high-risk, or rollback-heavy changes, **safe-change-plan** turns the fix direction into atomic steps. | Return to analysis or ask when inputs are insufficient. |
| Fix | **safe-fix-implementation** executes the approved minimal repair. | Stop when production changes exceed scope, tests indicate a different root cause, or user changes conflict. |
| Regression | **test-gap-analysis** decides which regression tests matter; **safe-test-implementation** writes them only after approval. | Stop before changing production code merely to make a test possible unless scope is expanded. |

Copyable prompt:

```text
Use bug-root-cause-analysis to investigate this bug:

Symptom:
Impact:
Environment:
Reproduction steps:
Logs or errors:

Start from the first credible error and build a causal chain. Separate a proven
root cause, primary hypothesis, alternative hypotheses, and unknowns. You may
run a safe minimal reproduction, but do not modify files or implement a fix.
```

After confirming the cause:

```text
Use safe-change-plan to turn the proven root cause and minimal repair direction
into a verifiable, reversible plan. Do not execute it.
```

```text
Use safe-fix-implementation to fix only this proven root cause:

Root cause and evidence:
Approved file scope:
Validation commands:
Stop conditions:

Make the smallest change and do not include opportunistic refactoring. Do not
commit or push.
```

```text
Use test-gap-analysis to identify regression test gaps for this confirmed bug
and fix. For now, provide only test recommendations and real repository
commands; do not write tests.
```

**Safe handoff:** A “possible cause” cannot go directly to the implementation Skill. Pass its confidence and verification method. If the failure occurs only in CI, use the CI workflow below instead of forcing it into a local runtime-bug workflow.

## 4. Diagnose a CI Failure

**Use when:** A workflow, job, or step fails in CI and you need the first real failure cause.  
**Sequence:** **ci-failure-diagnosis [R]** → branch to **safe-test-implementation [W]**, **safe-fix-implementation [W]**, or an external platform administrator → optional **release-readiness-check [A/GATE]**.

| Diagnosis category | Recommended handoff |
|---|---|
| Broken test, missing regression, or flaky test | Confirm scope, then use **safe-test-implementation**. |
| Production-code regression | Add impact analysis or a plan when needed, then use **safe-fix-implementation**. |
| Dependency or lockfile problem | Use **dependency-upgrade-analysis** first; do not immediately edit the lockfile. |
| Permission, secret, or runner environment | Report the configuration name and location to an authorized platform administrator; never reveal secret values or weaken controls. |
| Runtime bug independent of CI | Hand off to **bug-root-cause-analysis** for a runtime evidence chain. |

Diagnosis prompt:

```text
Use ci-failure-diagnosis to investigate this CI failure.

Workflow / job / step:
CI log:
Relevant commit or diff:
Local result:

Find the first credible error. Classify it as code, test, dependency, cache,
permission/secret, runner environment, or flaky failure. Compare local and CI
runtimes, operating systems, environment-variable names, lockfiles, and
commands. Do not reveal secret values or modify files.
```

For a confirmed test problem:

```text
Use safe-test-implementation to fix only the confirmed test problem in the
diagnosis.

Allowed test scope:
Production code that must remain unchanged:
Minimal reproduction command:
Regression command:

If production code must change, stop. Do not commit or push.
```

For a confirmed code problem:

```text
Use safe-fix-implementation to repair only the production-code issue proven by
the CI diagnosis.

Evidence:
Approved file scope:
Local reproduction and validation commands:
Stop conditions:
```

**Gate and handoff:** Without the failed step, nearby first-error log lines, or workflow configuration, the diagnosis should mark the cause UNKNOWN and request material. CI diagnosis gives a repair direction; it does not edit workflows, permissions, or secrets. A final readiness check is still only a gate and does not rerun or release an external pipeline.

## 5. Review a Specialist or High-Risk Change

**Use when:** A change affects compatibility, migration, security, performance, configuration, or an architecture decision.  
**Sequence:** **change-impact-analysis [R]** → one or a few relevant specialist Skills **[R]** → optional **architecture-decision-record [W]** → **safe-change-plan [A]** → **[GATE] safe-fix-implementation [W]**.

Choose a specialist with this table. Do not make one invocation absorb every review:

| Risk question | Specialist Skill | What it does not do |
|---|---|---|
| Dependency versions, breaking changes, licenses, or ecosystem compatibility | **dependency-upgrade-analysis** | Does not change dependencies or lockfiles. |
| REST, GraphQL, RPC, event, or SDK contracts | **api-contract-review** | Does not modify the API. |
| Schema, backfill, locks, or zero-downtime sequencing | **database-migration-review** | Does not execute migrations or connect to production. |
| Whether an entry point is truly safe to remove | **dead-code-verification** | Does not recommend deletion without proof and does not delete code. |
| Authentication, input, injection, SSRF, XSS, or secrets | **security-focused-review** | Does not attack production or directly fix findings. |
| Baseline, profile, benchmark, or performance regression | **performance-regression-analysis** | Does not infer a regression from appearance alone or optimize code. |
| Configuration sources, precedence, drift, and unsafe defaults | **configuration-audit** | Does not reveal secret values or change configuration. |
| A real architectural choice and its trade-offs must be recorded | **architecture-decision-record** | Writes only ADR/architecture documents and never invents consensus. |

General impact prompt:

```text
Use change-impact-analysis to analyze this high-risk change:

Goal:
Proposed change:
What must remain unchanged:

Identify direct and indirect impact, compatibility boundaries, data,
configuration, and contract risks, test needs, and rollback needs. Do not
implement the change.
```

Then invoke only the necessary specialist. Database example:

```text
Use database-migration-review to review this migration design and related code.

Check up/down behavior, reversibility, data loss, defaults, nullability, type
conversion, indexes, constraints, locks, backfill, replication lag, and
zero-downtime rollout order. Provide evidence, confidence, validation, and
rollback advice. Do not run migrations or connect to production.
```

Security example:

```text
Use security-focused-review to review <explicit scope>.

Start with a lightweight threat model and trust boundaries. For each finding,
include evidence location, attack precondition, impact, exploitability,
severity, confidence, and repair direction. Do not perform attacks, access
production, reveal secrets, or modify code.
```

When an actual decision needs a record:

```text
Use architecture-decision-record to create or update an ADR from existing
evidence.

Problem:
Candidate options:
Decision-maker conclusion already confirmed:
Items still undecided:

Follow the repository's ADR location and template. Anything without consensus
must remain Proposed. Modify only ADR or architecture documentation.
```

**[GATE] Before implementation:** Merge general impact and specialist findings into **safe-change-plan**, including API/database/configuration compatibility, rollout order, rollback, and stop conditions. A specialist review is not implementation authorization, and an ADR is not implementation authorization. Only an explicitly approved atomic step can move to **safe-fix-implementation**.

## 6. Turn Research into a Deliverable Report

**Use when:** You need to research supplied or online sources and then produce a report or review a PDF.  
**Sequence:** **research-brief [R+N]** → optional **content-consistency-check [R+T]** → **[GATE] report-writer [W]** → optional **document-review [W]** → when a real PDF exists, **pdf-review [R+T]**.

| Step | Why | Main boundary |
|---|---|---|
| Research brief | **research-brief** defines the question, evidence standard, and dates, and prioritizes primary or official sources. | Without network access or supplied material, it must not pretend to have completed current research. |
| Consistency check | Use **content-consistency-check** when documents disagree on numbers, dates, versions, or conclusions. | Does not choose a “correct” value without authoritative evidence. |
| Report writing | **report-writer** organizes verified material into a report for a defined audience. | Confirm output format and location before file writes or export; never invent facts. |
| Document review | **document-review** checks structure, logic, facts, numbers, citations, and formatting; its default is an issue list. | Revises a copy only when requested, preserving meaning and structure. |
| PDF review | Use **pdf-review** only after a real PDF exists and the required tools are available. | Without rendering or OCR, disclose limits and never invent pages or visual validation. |

Research prompt:

```text
Use research-brief to investigate this question:

Research question:
Scope:
Cutoff date:
Acceptable sources:
Excluded scope:

Prioritize primary, official, and high-quality sources. Record publication date,
event date, and access date. Separate facts, inferences, conflicting evidence,
and unknowns. If network or source material is unavailable, describe the
degraded result and do not fabricate sources.
```

For multiple source documents:

```text
Use content-consistency-check to compare terminology, numbers, dates, units,
people, versions, links, and conclusions across these materials.

For each conflict, cite both locations, severity, possible scope or timing
differences, and a recommended reference point. Do not choose the correct value
for me without authoritative evidence.
```

**[GATE] After confirming audience, structure, format, and output path:**

```text
Use report-writer to draft a report from the verified research brief and
consistency findings.

Audience:
Purpose:
Required sections:
Output format and location:

Separate facts, citations, inferences, recommendations, and unknowns. Keep
numbers, dates, terms, and citations consistent. State material limitations
instead of inventing missing facts.
```

Review and PDF handoff:

```text
Use document-review to review this report. First provide required changes,
recommended changes, and optional polish. Do not rewrite the entire document or
overwrite the source unless I authorize that separately.
```

```text
Use pdf-review to inspect this generated PDF.

State whether it is searchable, scanned, or OCR-derived. Preserve page
locations where reliable and check missing pages, garbled text, table
alignment, number conflicts, citations, and layout. Mark rendering or OCR
checks unverified when the capability is unavailable.
```

**Safe handoff:** The source ledger must move with the research result into report writing. Network access, document writes, and file export are separate permissions; network access in one step does not authorize later file creation or overwrite.

## 7. Clean Spreadsheet Data Without Losing the Source

**Use when:** You want a data-quality picture first and then a traceable, cleaned copy.  
**Sequence:** For audit only, **excel-data-quality-check-basic [R]**; for cleaning, **spreadsheet-data-cleaning [W]** → optional **content-consistency-check [R+T]** → optional **report-writer [W]** or **presentation-outline [W]**.

| Choice | When to use it | Boundary |
|---|---|---|
| **excel-data-quality-check-basic** | You need a read-only check of missing values, duplicates, types, formulas, and anomalies. | Does not write files, run scripts, or produce cleaned data. |
| **spreadsheet-data-cleaning** | The user explicitly wants cleaning and the platform has spreadsheet tooling. | Keeps the source read-only, saves a new result, and logs every rule. |
| **content-consistency-check** | The result must be compared with other documents, reports, or versions. | Reports conflicts without guessing the authoritative value. |

Start with a read-only profile:

```text
Use excel-data-quality-check-basic for a read-only quality check of <file>.

Report worksheets, columns, types, missing values, duplicates, anomalies,
formula risks, and indeterminate items. Do not modify the source or create a
cleaned copy.
```

When cleaning is confirmed, approve rules and output path first:

```text
Use spreadsheet-data-cleaning to clean <source file>.

Allowed cleaning rules:
- <rule 1>
- <rule 2>

Key fields that must not be guessed or filled:
New output file:
Audit log:
Formulas, row/column counts, and key totals to preserve:

The source must remain unchanged. First show the data profile and proposed
rules. Stop for confirmation if a rule may delete valid data, alter formula
meaning, or overwrite the source.
```

Validate the result:

```text
Compare the cleaned result with the source for consistency.

Check row and column counts, key fields, date and number formats, formulas,
duplicate and missing-value statistics, key totals, and the audit log. Separate
expected changes, unexpected changes, and indeterminate items.
```

**[GATE]:** Deleting rows, filling key fields, correcting business anomalies, changing formulas, and overwriting files each require separate confirmation. If spreadsheet tooling is unavailable, provide rules and limitations; do not claim an XLSX/CSV was generated or validated.

## 8. Turn Meeting Notes into Actions and a Presentation

**Use when:** Raw meeting notes need to become decisions, action items, and follow-up material.  
**Sequence:** **meeting-notes-to-actions [A]** → human confirmation of owners and dates **[GATE]** → choose **report-writer [W]** or **presentation-outline [W]** → optional **content-consistency-check [R+T]**.

| Step | Why | Boundary |
|---|---|---|
| Structure the notes | **meeting-notes-to-actions** separates discussion, suggestion, decision, and action while merging duplicates. | Unknown owners or dates remain TBD and are never guessed. |
| Human confirmation | Participants confirm decisions, owners, dates, and dependencies. | An unresolved TBD must not become a downstream commitment. |
| Choose an output | Use **report-writer** for a formal record or **presentation-outline** for a narrative. | An outline is the default; PPTX requires tools and an explicit user request. |
| Check consistency | Compare names, numbers, dates, and decisions across the notes, report, and deck. | Reports conflicts without silently rewriting decisions. |

Action prompt:

```text
Use meeting-notes-to-actions to organize these meeting notes:

<paste notes>

Return a summary, explicit decisions, actions, owners, due dates, dependencies,
and open questions. Extract only information that appears in the notes. Mark an
unknown owner or date as TBD. Separate discussion, suggestion, decision, and
action.
```

After human confirmation, produce a report:

```text
Use report-writer to turn the confirmed meeting decisions and actions into a
shareable meeting report.

Audience:
Output format and location:
Confirmed owners and dates:
Items still marked TBD:

Do not rewrite discussion or suggestions as decisions, and do not invent owners
or due dates.
```

Or produce a presentation outline:

```text
Use presentation-outline to create a presentation outline from the confirmed
meeting outcome.

Audience:
Goal:
Setting and duration:
Core conclusion:

For each slide, give its purpose, title, points, evidence, and suggested visual.
Mark missing data as a placeholder with a source requirement. Produce only an
outline by default; do not generate a PPTX.
```

**Safe handoff:** Preserve the raw notes as evidence, then preserve the structured result. Human confirmation is a factual-quality gate; writing a report or generating a file is a permission gate. They are not the same approval.

## 9. Route Basic vs. Enhanced Document, PDF, and Spreadsheet Review

**Use when:** You have a Word, PDF, or Excel file but do not know whether to choose a conservative Basic check or enhanced processing.  
**Sequence:** Route by task intent and actual tool capability. Never treat missing tools as evidence that enhanced review was completed.

### Routing decision

1. **Need only a conservative, read-only check of accessible text or structure?**
   - PDF: **pdf-review-basic [R]**
   - Word: **word-document-review-basic [R]**
   - Excel: **excel-data-quality-check-basic [R]**
2. **Need structure, logic, citations, and formatting review, with a possible copy revision after approval?**
   - Use **document-review [W]**.
3. **Need PDF page locations, tables, missing-page checks, OCR status, or visual-layout inspection?**
   - Use **pdf-review [R+T]** and require the relevant extraction, rendering, or OCR tools.
4. **Need to clean Excel/CSV data and generate a new file?**
   - Use **spreadsheet-data-cleaning [W]**.
5. **Need to compare terms, numbers, dates, links, or conclusions across files?**
   - Use **content-consistency-check [R+T]**.

Basic PDF example:

```text
Use pdf-review-basic for a read-only basic review of <file>.

Report issues, evidence, and unknowns only from text and structure that are
reliably accessible. Do not claim OCR, page rendering, or visual inspection,
and do not modify the file.
```

Enhanced PDF example:

```text
Use pdf-review to inspect <file>.

I need page-specific, table, and layout findings. First confirm whether text
extraction, page rendering, and OCR are reliable. State any degraded scope when
a capability is missing. Do not invent page numbers, missing pages, or visual
findings.
```

Basic and enhanced Word examples:

```text
Use word-document-review-basic for a read-only basic review of <file>. Report
verifiable structure, terminology, numbers, and obvious issues. Do not modify
the file or claim to have checked inaccessible formatting.
```

```text
Use document-review to check <file> for structure, logic, completeness,
terminology, facts, numbers, citations, grammar, and formatting consistency.

By default, provide an issue list and suggested changes. Before any edit,
describe which formatting can be preserved, the output-copy location, and
anything that cannot be verified. Do not overwrite the source without approval.
```

**[GATE]:** “Read-only” and “requires no tools” are different concepts. When tools are unavailable, narrow the conclusion or stop. Do not switch to a Basic Skill while still claiming OCR, rendering, formula verification, or format fidelity. Source files remain read-only by default; transformations and revisions go to a new location.

## 10. Author a Skill and Audit It Before Release

**Use when:** A maintainer wants to add a reusable Skill and audit its quality before publication.  
**Sequence:** **skill-authoring [W]** → repository validation and build → **skill-quality-audit [R+T]** → when authorized, return to **skill-authoring [W]** for corrections → separate publication authorization.

| Step | Why | Boundary |
|---|---|---|
| Fit and authoring | **skill-authoring** first determines whether the request deserves a Skill, then checks duplicates, neighbors, Pack, and public/private boundary. | Creates only the requested scope, protects existing changes, and does not commit, push, or publish by default. |
| Deterministic validation | The authoring workflow runs existing validate, test, and build commands and inspects generated artifacts. | Fixes only failures introduced by the current Skill; it does not clean up the whole repository. |
| Quality audit | **skill-quality-audit** checks structure, triggers, workflow, resources, cross-platform output, safety, and release consistency. | The audit is strictly read-only. Scripts judge deterministic rules; model workflow and activation cases judge semantics. |
| Correction loop | Return to a write-capable Skill only after the user approves specific findings. | P0/P1/P2 findings are not automatic write authorization. |

Authoring prompt:

```text
Use skill-authoring to engineer a Skill in the current repository.

Real usage scenario:
Two to five positive examples:
Explicit negative examples:
Neighboring Skills:
Target Pack / plugin:
Public or private boundary:
Target platforms:

First decide whether this is worth a Skill and check duplication and trigger
conflicts. Then plan the minimum necessary SKILL.md, references, assets, scripts,
and UI metadata. Reuse the existing scaffold. Do not create empty directories,
an in-Skill README, or duplicated per-platform bodies. Do not commit, push, or
publish by default.
```

Audit prompt:

```text
Use skill-quality-audit for a read-only pre-release audit of <Skill, Pack, or
repository scope>.

Check structure and frontmatter, trigger quality, workflow and permission
boundaries, progressive loading, script tests, bilingual and cross-platform
output, manifest/pack/generated-artifact consistency, security, and release
readiness. Return an overall conclusion, scorecard, P0/P1/P2 findings, evidence
locations, impact, repair advice, and validation advice. Do not modify files.
```

Correction prompt:

```text
Use skill-authoring to correct only these approved audit findings:

Approved findings:
Allowed changes:
Explicitly excluded:
Validation to rerun:
Stop conditions:

Do not address unapproved findings or change versions, commit, push, or publish.
```

**Final gate:** Passing validate, test, and build and receiving a publishable audit recommendation still does not authorize publication. Version changes, commits, pushes, marketplace publication, and external distribution each require a new, explicit user request.

## 11. Route or Transfer Work Safely

Use **repo-doctor-router [R]** when the user knows the task but not the Skill. It returns a verified next Skill, a shortest safe workflow, alternatives, required inputs, and stop conditions; it never executes the recommendation. Use **session-handoff [R]** when the context is long or ownership changes. The handoff references existing artifacts, separates facts from inferences, removes sensitive values, records real commands and results, and gives a copyable next-session prompt without claiming automatic loading.

## Future Roadmap — Not Implemented

Potential future work may evaluate large-project decision maps, explicitly authorized issue-tracker adapters, background research coordination, and visual architecture reports. Automatic issue creation, commit, push, publication, merge, release, or conflict resolution is not implemented. Investment, stock, valuation, and trading Skills remain outside Repo Doctor's engineering scope.

## General Failure Handling

- **Insufficient evidence:** Mark the item UNKNOWN and list the missing files, logs, tools, or choices. Do not fill the gap with invented facts.
- **Unavailable tools:** State the degraded scope and what cannot be verified. Do not claim execution, rendering, OCR, network access, or file generation.
- **Permission transition:** Reconfirm file scope, commands, and stop conditions before moving from [R], [R+T], [R+N], or [A] to [W].
- **Out-of-scope finding:** Preserve and report the evidence; do not fix it opportunistically.
- **Existing worktree changes:** Identify and protect them first; stop if the work cannot be isolated safely.
- **Failed validation:** Preserve the failure and return to the smallest responsible step; do not substitute “looks fine” for a passing result.
- **Release-related request:** **release-readiness-check** provides a gate decision only. Release, version, tag, commit, and push actions always need separate authorization.

## Next Steps

- Look up exact permissions, risk, and activation-contract neighbors in the [Complete Skill Catalog](SKILL_CATALOG.md).
- Learn installation, platform invocation, and troubleshooting in the [User Manual](USER_MANUAL.md).
- Learn canonical authoring and build mechanics in [Adding Skills](ADDING_SKILLS.md).
- 中文版本：[工作流实战手册](WORKFLOW_COOKBOOK.zh-CN.md)

## Canonical Registered Workflows

The only machine-readable relationship source is `packs/engineering/repo-doctor/workflows.yaml`. The Router returns an exact `workflow_id`; prose here explains usage but does not redefine transitions.

| Workflow ID | Purpose | Write gate |
|---|---|---|
| `feature-delivery` | End-to-end feature delivery. | Implementation and optional test approval |
| `bug-repair` | Evidence-led bug repair and post-fix regression. | Fix and test approval |
| `test-first-change` | Expected failure before production implementation. | Test and implementation approval |
| `post-fix-regression-test` | Regression coverage after a verified fix. | Test approval |
| `review-only` | Read-only diff review. | None |
| `ci-diagnosis` | First credible CI failure diagnosis. | None |
| `dependency-upgrade` | Dependency upgrade analysis. | None |
| `database-migration` | Migration and rollout review. | None |
| `api-contract-change` | API compatibility review. | None |
| `session-handoff` | Sanitized read-only continuation state. | None |
| `release-preparation` | Read-only release gate. | None; publishing is external |

A read-only output is evidence, never write authorization. `spec-to-work-items` returns response Markdown only and cannot persist files or create tasks. Golden Workflow fixtures verify contracts, not live-model routing accuracy.
