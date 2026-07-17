# Repo Doctor 技能包

Repo Doctor 是一个公开安全的软件工程技能包，用于仓库级 AI 辅助工作。

它包含：

- `repo-doctor-router`
- `repo-onboarding`
- `requirements-clarification`
- `requirements-to-spec`
- `spec-to-work-items`
- `bug-root-cause-analysis`
- `project-health-check`
- `safe-code-review`
- `change-impact-analysis`
- `safe-change-plan`
- `test-gap-analysis`
- `safe-test-implementation`
- `ci-failure-diagnosis`
- `documentation-sync`
- `release-readiness-check`
- `dependency-upgrade-analysis`
- `api-contract-review`
- `database-migration-review`
- `dead-code-verification`
- `security-focused-review`
- `performance-regression-analysis`
- `architecture-decision-record`
- `configuration-audit`
- `session-handoff`
- `safe-fix-implementation`

该技能包默认先读后改。路由、需求澄清、工作项规划、分析、诊断、专项审查和发布门禁 Skill 保持只读；`session-handoff` 只可在明确授权的 scratch 位置写入脱敏交接，`safe-test-implementation` 只修改测试、fixture 和测试辅助代码，`documentation-sync` 只修改文档，`architecture-decision-record` 只修改 ADR 和架构文档。生产代码修改仍由 `safe-fix-implementation` 在明确诊断和验证方案后负责。
