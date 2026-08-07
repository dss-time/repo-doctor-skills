# Live Performance Comparison

Status: **KEEP_OPTIMIZATION**

External status: **AVAILABLE**

## Baseline

- Tag: `v0.4.1`
- Commit: `6bccaa68cb982fdf78c68408284f7e4443d9543d`
- Skills: 40
- Environment: host Codex authentication with isolated Skill root, SQLite state, and fresh synthetic workspace per case

## Optimized

- Worktree: current uncommitted candidate on `main`
- Base commit: `6bccaa68cb982fdf78c68408284f7e4443d9543d`
- Skills: 40
- Execution profiles: 27/27 Repo Doctor Skills

## Test count

| Group | Count |
|---|---:|
| Chinese simple | 10 |
| English simple | 10 |
| Chinese elevated | 5 |
| English elevated | 5 |

## Matched pairs

- Usable matched pairs: 30/30
- Coverage threshold: >=24/30 overall, >=16/20 simple, >=8/10 elevated, >=12/15 per language
- Coverage sufficient: true
- PASS/PASS: 27
- FAIL/PASS: 3
- PASS/FAIL: 0
- FAIL/FAIL: 0

## Actual performance

Metrics use the same completed Case set for Baseline and Optimized. Transport timeouts are excluded. File reads are directly observed lower bounds from command arguments; unavailable values are never estimated.

| Metric | Baseline | Optimized | Change |
|---|---:|---:|---:|
| Primary Skills Median | 1 | 1 | 0.00% |
| Files Read Median | 1 | 1 | 0.00% |
| Files Read P75 | 2 | 2 | 0.00% |
| Commands Median | 3 | 3 | 0.00% |
| Commands P75 | 4 | 4 | 0.00% |
| Tool Calls Median | 3 | 4 | 33.33% |
| Tool Calls P75 | 4 | 5 | 25.00% |
| Median Time | 151413 | 155790 | 2.89% |
| P75 Time | 157856 | 164370 | 4.13% |
| Full Test Trigger | 0 | 0 | 0.00% |
| Full Build Trigger | 0 | 0 | 0.00% |
| Auto Chaining | 0 | 0 | 0.00% |
| Output Length Median | 343 | 351 | 2.33% |
| Output Length P75 | 467 | 439 | -6.00% |

## Correctness

- Baseline: 27/30
- Optimized: 30/30
- Bilingual: PASS
- Permissions: PASS
- Safety: PASS
- No unresolved Baseline PASS → Optimized FAIL: true

## Transport

- Baseline retries: 2
- Baseline timeouts: 2
- Baseline exhausted timeout cases: 0
- Optimized retries: 8
- Optimized timeouts: 8
- Optimized exhausted timeout cases: 0

## Implicit invocation

No tested ordinary request selected Router, heavyweight architecture analysis, bug root-cause analysis, safe fix, or requirements clarification outside its intended boundary. No evidence-supported policy change is required.

## Conclusion

KEEP_OPTIMIZATION

Rerun: `npm run benchmark:performance -- --baseline-ref v0.4.1 --resume`
