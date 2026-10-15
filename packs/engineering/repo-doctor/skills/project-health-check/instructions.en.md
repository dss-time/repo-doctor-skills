# Project Health Check

Use this skill for a broad repository diagnosis. Do not start by rewriting code.

## Review Dimensions

- Architecture risk
- Type risk
- Test gaps
- Security risk
- Performance risk
- Dependency risk
- Maintainability issues
- Dead or redundant code
- Release risk

## Workflow

1. Inspect metadata, scripts, test config, CI, and source layout.
2. Identify core modules and shared utilities.
3. Search references before calling code unused.
4. Check test coverage signals and release commands when available.
5. Prioritize by real user or release risk.
6. Assess every review dimension; report findings and evidence using the output contract, marking any unassessed dimension.
