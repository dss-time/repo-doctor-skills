# Performance Regression Analysis

Analyze one specific performance regression. Keep production code and configuration unchanged.

## Boundary
- Require a baseline, workload, metric, or explicit plan to obtain them. Do not claim regression from code appearance alone.
- Route broad code review to `safe-code-review`, general health to `project-health-check`, test implementation to `safe-test-implementation`, and optimization implementation to `safe-fix-implementation`.
- Do not run unsafe load against production or infer causality from one noisy sample.

## Workflow
1. Define baseline and candidate versions, environment, workload, dataset, warmup, concurrency, metric, percentile, budget, and measurement method.
2. Inspect supplied profiles, benchmarks, traces, logs, query plans, browser traces, or reproducible experiments; record missing controls.
3. Compare algorithms, repeated I/O, N+1 behavior, caches, allocation and memory, concurrency and contention, network, database, serialization, and frontend rendering as applicable.
4. Separate measured regression, correlated observation, code-based hypothesis, and unknown.
5. Check variance, sample size, cold/warm effects, environment drift, and measurement bias before attributing cause.
6. Rank hypotheses by impact, evidence, confidence, and experiment cost; propose falsifiable validation experiments and optimization priorities.
7. Do not optimize code; report exact evidence, locations, impact, severity/priority, confidence, validation, and unknowns.

Read [execution boundaries](../../references/execution-boundaries.en.md). For code analysis, implementation or verification whose rules depend on the stack, consult [language and runtime selection](../../references/language-security-boundaries.en.md) and apply only relevant component profiles. Routing, handoff and ordinary documentation work do not require language profiles.
