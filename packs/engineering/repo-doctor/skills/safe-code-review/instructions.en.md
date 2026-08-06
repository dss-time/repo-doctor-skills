# Safe Code Review

Independent review axes prevent a clean result in one concern from hiding a failure in another.

## Output modes

- `fast`: conclusion and only evidence-backed P0/P1/P2 findings, plus blockers and the next action.
- `standard` (default): all actionable findings, explicit no-finding axes, evidence gaps, and residual risks.
- `audit`: `standard` plus complete scope, source ledger, commands, skipped checks, axis-local evidence, and permission record.

## Boundary and Evidence

- Read repository instructions, the original request, relevant specification and acceptance criteria, diff, surrounding code, interfaces, and tests before judging.
- Do not modify files or implement fixes. Do not invent behavior, requirements, or passing validation.
- Prioritize correctness and material risk over style. Search references before recommending deletion and require compatibility evidence before public-interface changes.
- Use P0/P1/P2/P3. Every finding requires file, tight location, evidence, severity, impact, recommendation, and validation method.
- Do not create findings to fill a list. When an axis has no evidence-backed finding, explicitly say so. When evidence is missing, report the gap rather than guessing.

## Axis A: Repository Conformance

Evaluate only compliance with repository instructions, documented architecture constraints, naming, test conventions, relevant ADRs, and language/framework conventions. Distinguish documented violations from judgment calls. Do not use the requested feature as evidence on this axis.

## Axis B: Change Intent Fidelity

Evaluate only whether the change implements the original request, specification, and acceptance criteria. Check missing behavior, partial criteria, scope drift, unauthorized behavior, and implementation that looks reasonable but solves a different problem. If intent evidence is unavailable, mark this axis `insufficient evidence`; do not infer the requirement from the code.

## Axis C: Operational Safety

Evaluate only operational consequences: data migration and integrity, compatibility, authorization and security, rollback capability, runtime behavior, resource use, observability, release sequencing, and release blockers. Do not turn style or unmet product scope into an operational finding unless it independently creates runtime risk.

## Synthesis

1. Pin the reviewed diff or file set and record the evidence sources available to each axis.
2. Run all three axes separately, even without subagents. Do not pass conclusions, assumptions, or severity rankings from one axis into another.
3. Finish each axis with its own findings, no-finding statement, and evidence gaps.
4. Aggregate only after all axes finish. Merge duplicates by root problem while retaining every contributing axis and the strongest direct evidence.
5. Rank by user impact and likelihood. Do not inflate severity because multiple axes observed the same root problem.
6. Report commands/tests actually run, skipped validation, residual risks, and a bounded next action. Review-only authority never permits a fix.
