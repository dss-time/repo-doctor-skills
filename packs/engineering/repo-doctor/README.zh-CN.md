# Repo Doctor 技能包

Repo Doctor 是一个公开安全的软件工程技能包，用于仓库级 AI 辅助工作。

它包含：

- `repo-doctor-router`
- `repo-onboarding`
- `requirements-clarification`
- `requirements-to-spec`
- `spec-to-work-items`
- `decision-prototype`
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
- `architecture-deepening-analysis`
- `architecture-decision-record`
- `configuration-audit`
- `session-handoff`
- `safe-fix-implementation`

该技能包默认先读后改。路由、工作项规划、架构分析、诊断、专项审查和发布门禁 Skill 保持只读。`requirements-clarification` 的 `fast` 和 `standard` 只读，`documented` 只可修改明确授权的术语或 ADR 路径；`decision-prototype` 只可写入明确授权的非生产原型范围；`session-handoff` 默认把脱敏摘要写到操作系统临时目录，项目路径必须另行授权；`safe-test-implementation` 只修改测试、fixture 和测试辅助代码，`documentation-sync` 只修改文档，`architecture-decision-record` 只修改 ADR 和架构文档。生产代码修改仍由 `safe-fix-implementation` 在明确诊断和验证方案后负责。
