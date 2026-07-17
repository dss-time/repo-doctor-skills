# Safe Code Review

Review a code change in two independent dimensions, then deduplicate findings without losing their dimension. Stay read-only.

## Boundary and Evidence

- Read repository instructions, the original request, relevant specification and acceptance criteria, diff, surrounding code, interfaces, and tests before judging.
- Do not modify files or implement fixes. Do not invent behavior, requirements, or passing validation.
- Prioritize correctness and material risk over style. Search references before recommending deletion and require compatibility evidence before public-interface changes.
- Use P0/P1/P2/P3. Every finding needs a tight location, evidence, impact, recommendation, and validation method.
- If no reliable requirement or specification exists, mark Intent Alignment evidence as insufficient. Do not infer compliance from the implementation itself.

## Phase A: Intent Alignment

Review the change against the original user request, specification, acceptance criteria, repository policy, and compatibility commitments. Check for missing required behavior, incomplete acceptance criteria, unauthorized behavior, scope expansion, compatibility regressions, and unhandled boundaries, failures, permissions, data rules, migration, or rollback requirements.

Record the intent evidence used and each gap. If intent evidence is unavailable, report the unknowns and limit the conclusion.

## Phase B: Implementation Quality

Independently review correctness, security, data integrity, concurrency, performance, maintainability, module boundaries, duplication, test quality, observability, and rollback capability. Inspect changed files and the minimum surrounding paths needed to prove or disprove a risk.

## Synthesis

1. Run the two phases separately even when the platform has no subagents; do not let a clean implementation-quality pass substitute for intent evidence.
2. Merge duplicate findings by root problem while retaining `Intent Alignment`, `Implementation Quality`, or both as the dimension.
3. Rank by user impact and likelihood, not by which phase found the issue.
4. Report no-finding areas, evidence gaps, tests not run, and residual risks.
5. Finish with a bounded recommendation. No findings does not prove full requirement compliance when intent evidence is insufficient.
