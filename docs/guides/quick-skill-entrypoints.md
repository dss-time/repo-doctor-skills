# Quick Skill Entrypoints

Start from the problem you have. These examples use Codex `$skill-name` syntax; on another platform, use its native Skill picker or copy the same request as plain text.

Repo Doctor keeps stable canonical names. It does not publish alias frontmatter or a duplicate `$doctor` wrapper because alias behavior is not reliably portable across the supported targets.

## I have not clarified the requirement

```text
$requirements-clarification Use fast mode. Inspect the repository first and ask only the 3–5 decisions that could change the implementation direction.
```

## I already have a specification

```text
$spec-to-work-items Split this settled specification into independently verifiable vertical work items.
```

For a small settled change with known impact, use `$safe-change-plan`.

## I need to split the work

```text
$spec-to-work-items Turn this confirmed specification into dependency-aware work items with verification and rollback notes.
```

## I found a Bug

```text
$bug-root-cause-analysis Use fast mode. Establish a trustworthy success/failure signal, reproduce the symptom, and identify the root cause without fixing it.
```

For a workflow or runner failure, use `$ci-failure-diagnosis` instead.

## I want to validate an idea first

```text
$decision-prototype Use standard mode to build the smallest non-production UI prototype that can decide between these directions.
```

Use `logic-prototype` for business rules/state and `ui-prototype` for interaction or information structure. Prototype writes require explicit scope authorization.

## I need to write tests

```text
$safe-test-implementation Use test_first and standard output for one observable behavior. Modify only the authorized test scope.
```

Use `$test-gap-analysis` first when you do not yet know which behavior or boundary needs protection.

## I need a code review

```text
$safe-code-review Review this diff in standard mode across Repository Conformance, Change Intent Fidelity, and Operational Safety. Do not fix anything.
```

## The architecture is getting harder to change

```text
$architecture-deepening-analysis Analyze caller burden and repeated adaptation, compare at least two reversible options, and do not refactor.
```

This Skill needs concrete caller, change, duplication, defect, or test evidence. A direct large-refactor request requires clarification, impact analysis, planning, and write authorization.

## I need to move to a new session

```text
$session-handoff Create a standard sanitized handoff focused on finishing validation. Save it to the operating-system temporary directory.
```

Existing specifications, ADRs, issues, commits, and diffs are referenced rather than copied.

## I do not know which Skill to use

```text
$repo-doctor-router Recommend one Skill in fast mode. Give only the reason, mode, and minimum input.
```

Ask for `standard` or `audit` routing when you need workflow IDs, gates, stop conditions, registry evidence, or alternatives.
