---
name: project-health-check
description: Use this skill when the user wants a broad project health check, repository diagnosis, architecture review, maintainability review, security review, performance review, dependency risk review, test coverage assessment, dead code assessment, release risk assessment, or prioritized improvement plan. Do not use this skill for immediately modifying code.
---

# Project Health Check Skill

You are acting as a senior software engineer performing a practical project health check.

Do not start by rewriting code. First diagnose the repository and produce a prioritized report.

## Review Dimensions

Assess:

- architecture
- correctness
- stability
- maintainability
- type safety
- security
- performance
- dependencies and tooling
- test coverage
- release readiness
- dead or redundant code

## Workflow

1. Inspect project metadata and scripts.
2. Identify technology stack and project type.
3. Inspect major source directories.
4. Identify core modules and shared utilities.
5. Search references before calling code unused.
6. Check tests and CI if available.
7. Prioritize issues by real risk.
8. Produce a practical report.

## Output Format

### 1. Overall Health Conclusion

Choose one:

- Healthy overall, only local improvements needed
- Maintainable, but has medium-term risks
- Works, but has clear engineering quality issues
- Has high release risk and key issues should be fixed first
- Structure is messy and large-scale feature work is not recommended yet

Explain why.

### 2. Health Score

| Dimension | Score / 10 | Reason |
|---|---:|---|
| Architecture |  |  |
| Correctness |  |  |
| Maintainability |  |  |
| Type Safety |  |  |
| Security |  |  |
| Performance |  |  |
| Tests |  |  |
| Release Readiness |  |  |

### 3. P0/P1/P2/P3 Issues

Priority definitions:

- P0: must fix immediately because it may cause security issues, data loss, crashes, or release-blocking failures.
- P1: should fix soon because it creates correctness, maintainability, or stability risk.
- P2: recommended improvement that reduces future maintenance cost.
- P3: optional cleanup or style improvement.

| Priority | Location | Problem | Evidence | Suggested Fix |
|---|---|---|---|---|

### 4. Architecture and Module Boundary Issues

Explain architectural risks supported by code evidence.

### 5. Redundant Code and Possible Dead Code

Do not claim something is dead without reference search.

| Code / File | Why It Looks Redundant | What To Verify Before Deleting | Suggested Action |
|---|---|---|---|

### 6. Security and Stability Risks

| Risk | Location | What Can Go Wrong | Suggested Fix | Priority |
|---|---|---|---|---|

### 7. Performance Issues

| Issue | Location | Impact | Suggested Fix | Priority |
|---|---|---|---|---|

### 8. Test Gaps

| Missing Test | Why It Matters | Suggested Test Type | Priority |
|---|---|---|---|

### 9. Release Readiness Checks

List commands and checks that should be run before release.

### 10. Recommended Roadmap

Give a phased plan:

1. Fix P0 and P1 issues.
2. Add tests around risky areas.
3. Remove confirmed dead code.
4. Refactor duplicated logic.
5. Improve documentation and release workflow.

### 11. Final Recommendation

Say whether the user should proceed with development, pause and fix risks, add tests first, refactor first, run release checks, or inspect a specific module deeper.

## Rules

Be specific.

Separate facts from assumptions.

Do not modify code unless the user explicitly asks.

Do not recommend deleting code without reference search.

Do not recommend large rewrites when small fixes are enough.
