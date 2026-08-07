# Skill Performance Validation

Status: **KEEP OPTIMIZATION**

External status: **AVAILABLE**

## Deterministic coverage

All 30 execution contracts remain valid: 20 simple cases require fast, bounded execution; 10 elevated cases preserve standard or audit behavior and permission gates. Repo Doctor execution profiles remain present for 27/27 Skills.

## Real Codex A/B

The real comparison uses baseline `v0.4.1` at `6bccaa68cb982fdf78c68408284f7e4443d9543d` and the current uncommitted worktree. Every turn uses a fresh copy of a fully synthetic Node/TypeScript project, host Codex authentication, an isolated Skill root and SQLite state, the same prompts, low reasoning effort, workspace-write sandbox, and approval policy `never`.

- Primary Skills Median: baseline 1; optimized 1; change 0.00%
- Files Read Median: baseline 1; optimized 1; change 0.00%
- Files Read P75: baseline 2; optimized 2; change 0.00%
- Commands Median: baseline 3; optimized 3; change 0.00%
- Commands P75: baseline 4; optimized 4; change 0.00%
- Tool Calls Median: baseline 3; optimized 4; change 33.33%
- Tool Calls P75: baseline 4; optimized 5; change 25.00%
- Median Time: baseline 151413; optimized 155790; change 2.89%
- P75 Time: baseline 157856; optimized 164370; change 4.13%
- Full Test Trigger: baseline 0; optimized 0; change 0.00%
- Full Build Trigger: baseline 0; optimized 0; change 0.00%
- Auto Chaining: baseline 0; optimized 0; change 0.00%
- Output Length Median: baseline 343; optimized 351; change 2.33%
- Output Length P75: baseline 467; optimized 439; change -6.00%

Correctness: baseline 27/30; optimized 30/30. Permissions: PASS. Safety: PASS.

Matched pairs: 30/30. PASS/PASS 27; FAIL/PASS 3; PASS/FAIL 0; FAIL/FAIL 0.

Transport: baseline retries 2, timeouts 2; optimized retries 8, timeouts 8. Timeout attempts are excluded from model-performance metrics.

## Implicit invocation

No tested ordinary request selected Router, heavyweight architecture analysis, bug root-cause analysis, safe fix, or requirements clarification outside its intended boundary. No evidence-supported policy change is required.

## Measurement limits

- File-read counts are observed lower bounds from command arguments; commands that enumerate or search broadly may inspect additional files.
- Wall time includes external service and local tool latency; both variants use identical settings but service variance remains.
- Matched-pair metrics use only Cases with usable Baseline and Optimized results; transport timeout attempts are excluded.
- The benchmark uses one real completed turn per matched variant/Case and does not claim statistical significance beyond the reported sample.

Machine-readable details:

- `tests/reports/skill-performance-baseline.json`
- `tests/reports/skill-performance-validation.json`
- `tests/reports/live-performance-comparison.json`
- `tests/reports/live-performance-comparison.md`

## Conclusion

KEEP_OPTIMIZATION
