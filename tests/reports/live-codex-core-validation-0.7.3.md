# Live Codex Skill Validation

- Overall: **PASS**
- Project version: 0.7.3
- Requested model: gpt-6.1-sol
- Reasoning effort: low
- CLI version: unrecorded
- Installed Skills: 40/40
- Real calls: 200
- Passed: 200
- Failed: 0
- Blocked: 0
- Pass rate: 100.00%

## Invocation counts

| Invocation | Total | Passed | Failed | Blocked |
| --- | ---: | ---: | ---: | ---: |
| explicit | 80 | 80 | 0 | 0 |
| implicit | 80 | 80 | 0 | 0 |
| negative | 40 | 40 | 0 | 0 |

## Cases

| Case | Skill | Language | Invocation | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- | --- |
| repo-doctor-router--explicit-en | repo-doctor-router | en | explicit | repo-doctor-router | repo-doctor-router | PASS |
| repo-doctor-router--explicit-zh-CN | repo-doctor-router | zh-CN | explicit | repo-doctor-router | repo-doctor-router | PASS |
| repo-doctor-router--implicit-en | repo-doctor-router | en | implicit | none | none | PASS |
| repo-doctor-router--implicit-zh-CN | repo-doctor-router | zh-CN | implicit | none | none | PASS |
| repo-doctor-router--negative-zh-CN | repo-doctor-router | zh-CN | negative | safe-fix-implementation | safe-fix-implementation | PASS |
| repo-onboarding--explicit-en | repo-onboarding | en | explicit | repo-onboarding | repo-onboarding | PASS |
| repo-onboarding--explicit-zh-CN | repo-onboarding | zh-CN | explicit | repo-onboarding | repo-onboarding | PASS |
| repo-onboarding--implicit-en | repo-onboarding | en | implicit | repo-onboarding | repo-onboarding | PASS |
| repo-onboarding--implicit-zh-CN | repo-onboarding | zh-CN | implicit | repo-onboarding | repo-onboarding | PASS |
| repo-onboarding--negative-zh-CN | repo-onboarding | zh-CN | negative | project-health-check | project-health-check | PASS |
| requirements-clarification--explicit-en | requirements-clarification | en | explicit | requirements-clarification | requirements-clarification | PASS |
| requirements-clarification--explicit-zh-CN | requirements-clarification | zh-CN | explicit | requirements-clarification | requirements-clarification | PASS |
| requirements-clarification--implicit-en | requirements-clarification | en | implicit | requirements-clarification | requirements-clarification | PASS |
| requirements-clarification--implicit-zh-CN | requirements-clarification | zh-CN | implicit | requirements-clarification | requirements-clarification | PASS |
| requirements-clarification--negative-zh-CN | requirements-clarification | zh-CN | negative | requirements-to-spec | requirements-to-spec | PASS |
| requirements-to-spec--explicit-en | requirements-to-spec | en | explicit | requirements-to-spec | requirements-to-spec | PASS |
| requirements-to-spec--explicit-zh-CN | requirements-to-spec | zh-CN | explicit | requirements-to-spec | requirements-to-spec | PASS |
| requirements-to-spec--implicit-en | requirements-to-spec | en | implicit | requirements-to-spec | requirements-to-spec | PASS |
| requirements-to-spec--implicit-zh-CN | requirements-to-spec | zh-CN | implicit | requirements-to-spec | requirements-to-spec | PASS |
| requirements-to-spec--negative-zh-CN | requirements-to-spec | zh-CN | negative | api-contract-review | api-contract-review | PASS |
| spec-to-work-items--explicit-en | spec-to-work-items | en | explicit | spec-to-work-items | spec-to-work-items | PASS |
| spec-to-work-items--explicit-zh-CN | spec-to-work-items | zh-CN | explicit | spec-to-work-items | spec-to-work-items | PASS |
| spec-to-work-items--implicit-en | spec-to-work-items | en | implicit | spec-to-work-items | spec-to-work-items | PASS |
| spec-to-work-items--implicit-zh-CN | spec-to-work-items | zh-CN | implicit | spec-to-work-items | spec-to-work-items | PASS |
| spec-to-work-items--negative-zh-CN | spec-to-work-items | zh-CN | negative | requirements-clarification | requirements-clarification | PASS |
| decision-prototype--explicit-en | decision-prototype | en | explicit | decision-prototype | decision-prototype | PASS |
| decision-prototype--explicit-zh-CN | decision-prototype | zh-CN | explicit | decision-prototype | decision-prototype | PASS |
| decision-prototype--implicit-en | decision-prototype | en | implicit | none | none | PASS |
| decision-prototype--implicit-zh-CN | decision-prototype | zh-CN | implicit | none | none | PASS |
| decision-prototype--negative-zh-CN | decision-prototype | zh-CN | negative | requirements-clarification | requirements-clarification | PASS |
| bug-root-cause-analysis--explicit-en | bug-root-cause-analysis | en | explicit | bug-root-cause-analysis | bug-root-cause-analysis | PASS |
| bug-root-cause-analysis--explicit-zh-CN | bug-root-cause-analysis | zh-CN | explicit | bug-root-cause-analysis | bug-root-cause-analysis | PASS |
| bug-root-cause-analysis--implicit-en | bug-root-cause-analysis | en | implicit | bug-root-cause-analysis | bug-root-cause-analysis | PASS |
| bug-root-cause-analysis--implicit-zh-CN | bug-root-cause-analysis | zh-CN | implicit | bug-root-cause-analysis | bug-root-cause-analysis | PASS |
| bug-root-cause-analysis--negative-zh-CN | bug-root-cause-analysis | zh-CN | negative | safe-code-review | safe-code-review | PASS |
| project-health-check--explicit-en | project-health-check | en | explicit | project-health-check | project-health-check | PASS |
| project-health-check--explicit-zh-CN | project-health-check | zh-CN | explicit | project-health-check | project-health-check | PASS |
| project-health-check--implicit-en | project-health-check | en | implicit | none | none | PASS |
| project-health-check--implicit-zh-CN | project-health-check | zh-CN | implicit | none | none | PASS |
| project-health-check--negative-zh-CN | project-health-check | zh-CN | negative | skill-quality-audit | skill-quality-audit | PASS |
| safe-code-review--explicit-en | safe-code-review | en | explicit | safe-code-review | safe-code-review | PASS |
| safe-code-review--explicit-zh-CN | safe-code-review | zh-CN | explicit | safe-code-review | safe-code-review | PASS |
| safe-code-review--implicit-en | safe-code-review | en | implicit | safe-code-review | safe-code-review | PASS |
| safe-code-review--implicit-zh-CN | safe-code-review | zh-CN | implicit | safe-code-review | safe-code-review | PASS |
| safe-code-review--negative-zh-CN | safe-code-review | zh-CN | negative | skill-quality-audit | skill-quality-audit | PASS |
| change-impact-analysis--explicit-en | change-impact-analysis | en | explicit | change-impact-analysis | change-impact-analysis | PASS |
| change-impact-analysis--explicit-zh-CN | change-impact-analysis | zh-CN | explicit | change-impact-analysis | change-impact-analysis | PASS |
| change-impact-analysis--implicit-en | change-impact-analysis | en | implicit | change-impact-analysis | change-impact-analysis | PASS |
| change-impact-analysis--implicit-zh-CN | change-impact-analysis | zh-CN | implicit | change-impact-analysis | change-impact-analysis | PASS |
| change-impact-analysis--negative-zh-CN | change-impact-analysis | zh-CN | negative | api-contract-review | api-contract-review | PASS |
| safe-change-plan--explicit-en | safe-change-plan | en | explicit | safe-change-plan | safe-change-plan | PASS |
| safe-change-plan--explicit-zh-CN | safe-change-plan | zh-CN | explicit | safe-change-plan | safe-change-plan | PASS |
| safe-change-plan--implicit-en | safe-change-plan | en | implicit | safe-change-plan | safe-change-plan | PASS |
| safe-change-plan--implicit-zh-CN | safe-change-plan | zh-CN | implicit | safe-change-plan | safe-change-plan | PASS |
| safe-change-plan--negative-zh-CN | safe-change-plan | zh-CN | negative | change-impact-analysis | change-impact-analysis | PASS |
| test-gap-analysis--explicit-en | test-gap-analysis | en | explicit | test-gap-analysis | test-gap-analysis | PASS |
| test-gap-analysis--explicit-zh-CN | test-gap-analysis | zh-CN | explicit | test-gap-analysis | test-gap-analysis | PASS |
| test-gap-analysis--implicit-en | test-gap-analysis | en | implicit | test-gap-analysis | test-gap-analysis | PASS |
| test-gap-analysis--implicit-zh-CN | test-gap-analysis | zh-CN | implicit | test-gap-analysis | test-gap-analysis | PASS |
| test-gap-analysis--negative-zh-CN | test-gap-analysis | zh-CN | negative | project-health-check | project-health-check | PASS |
| safe-test-implementation--explicit-en | safe-test-implementation | en | explicit | safe-test-implementation | safe-test-implementation | PASS |
| safe-test-implementation--explicit-zh-CN | safe-test-implementation | zh-CN | explicit | safe-test-implementation | safe-test-implementation | PASS |
| safe-test-implementation--implicit-en | safe-test-implementation | en | implicit | safe-test-implementation | safe-test-implementation | PASS |
| safe-test-implementation--implicit-zh-CN | safe-test-implementation | zh-CN | implicit | safe-test-implementation | safe-test-implementation | PASS |
| safe-test-implementation--negative-zh-CN | safe-test-implementation | zh-CN | negative | test-gap-analysis | test-gap-analysis | PASS |
| ci-failure-diagnosis--explicit-en | ci-failure-diagnosis | en | explicit | ci-failure-diagnosis | ci-failure-diagnosis | PASS |
| ci-failure-diagnosis--explicit-zh-CN | ci-failure-diagnosis | zh-CN | explicit | ci-failure-diagnosis | ci-failure-diagnosis | PASS |
| ci-failure-diagnosis--implicit-en | ci-failure-diagnosis | en | implicit | ci-failure-diagnosis | ci-failure-diagnosis | PASS |
| ci-failure-diagnosis--implicit-zh-CN | ci-failure-diagnosis | zh-CN | implicit | ci-failure-diagnosis | ci-failure-diagnosis | PASS |
| ci-failure-diagnosis--negative-zh-CN | ci-failure-diagnosis | zh-CN | negative | bug-root-cause-analysis | bug-root-cause-analysis | PASS |
| documentation-sync--explicit-en | documentation-sync | en | explicit | documentation-sync | documentation-sync | PASS |
| documentation-sync--explicit-zh-CN | documentation-sync | zh-CN | explicit | documentation-sync | documentation-sync | PASS |
| documentation-sync--implicit-en | documentation-sync | en | implicit | documentation-sync | documentation-sync | PASS |
| documentation-sync--implicit-zh-CN | documentation-sync | zh-CN | implicit | documentation-sync | documentation-sync | PASS |
| documentation-sync--negative-zh-CN | documentation-sync | zh-CN | negative | safe-fix-implementation | safe-fix-implementation | PASS |
| release-readiness-check--explicit-en | release-readiness-check | en | explicit | release-readiness-check | release-readiness-check | PASS |
| release-readiness-check--explicit-zh-CN | release-readiness-check | zh-CN | explicit | release-readiness-check | release-readiness-check | PASS |
| release-readiness-check--implicit-en | release-readiness-check | en | implicit | none | none | PASS |
| release-readiness-check--implicit-zh-CN | release-readiness-check | zh-CN | implicit | none | none | PASS |
| release-readiness-check--negative-zh-CN | release-readiness-check | zh-CN | negative | project-health-check | project-health-check | PASS |
| dependency-upgrade-analysis--explicit-en | dependency-upgrade-analysis | en | explicit | dependency-upgrade-analysis | dependency-upgrade-analysis | PASS |
| dependency-upgrade-analysis--explicit-zh-CN | dependency-upgrade-analysis | zh-CN | explicit | dependency-upgrade-analysis | dependency-upgrade-analysis | PASS |
| dependency-upgrade-analysis--implicit-en | dependency-upgrade-analysis | en | implicit | none | none | PASS |
| dependency-upgrade-analysis--implicit-zh-CN | dependency-upgrade-analysis | zh-CN | implicit | none | none | PASS |
| dependency-upgrade-analysis--negative-zh-CN | dependency-upgrade-analysis | zh-CN | negative | change-impact-analysis | change-impact-analysis | PASS |
| api-contract-review--explicit-en | api-contract-review | en | explicit | api-contract-review | api-contract-review | PASS |
| api-contract-review--explicit-zh-CN | api-contract-review | zh-CN | explicit | api-contract-review | api-contract-review | PASS |
| api-contract-review--implicit-en | api-contract-review | en | implicit | api-contract-review | api-contract-review | PASS |
| api-contract-review--implicit-zh-CN | api-contract-review | zh-CN | implicit | api-contract-review | api-contract-review | PASS |
| api-contract-review--negative-zh-CN | api-contract-review | zh-CN | negative | safe-code-review | safe-code-review | PASS |
| database-migration-review--explicit-en | database-migration-review | en | explicit | database-migration-review | database-migration-review | PASS |
| database-migration-review--explicit-zh-CN | database-migration-review | zh-CN | explicit | database-migration-review | database-migration-review | PASS |
| database-migration-review--implicit-en | database-migration-review | en | implicit | none | none | PASS |
| database-migration-review--implicit-zh-CN | database-migration-review | zh-CN | implicit | none | none | PASS |
| database-migration-review--negative-zh-CN | database-migration-review | zh-CN | negative | safe-change-plan | safe-change-plan | PASS |
| dead-code-verification--explicit-en | dead-code-verification | en | explicit | dead-code-verification | dead-code-verification | PASS |
| dead-code-verification--explicit-zh-CN | dead-code-verification | zh-CN | explicit | dead-code-verification | dead-code-verification | PASS |
| dead-code-verification--implicit-en | dead-code-verification | en | implicit | dead-code-verification | dead-code-verification | PASS |
| dead-code-verification--implicit-zh-CN | dead-code-verification | zh-CN | implicit | dead-code-verification | dead-code-verification | PASS |
| dead-code-verification--negative-zh-CN | dead-code-verification | zh-CN | negative | change-impact-analysis | change-impact-analysis | PASS |
| security-focused-review--explicit-en | security-focused-review | en | explicit | security-focused-review | security-focused-review | PASS |
| security-focused-review--explicit-zh-CN | security-focused-review | zh-CN | explicit | security-focused-review | security-focused-review | PASS |
| security-focused-review--implicit-en | security-focused-review | en | implicit | none | none | PASS |
| security-focused-review--implicit-zh-CN | security-focused-review | zh-CN | implicit | none | none | PASS |
| security-focused-review--negative-zh-CN | security-focused-review | zh-CN | negative | project-health-check | project-health-check | PASS |
| performance-regression-analysis--explicit-en | performance-regression-analysis | en | explicit | performance-regression-analysis | performance-regression-analysis | PASS |
| performance-regression-analysis--explicit-zh-CN | performance-regression-analysis | zh-CN | explicit | performance-regression-analysis | performance-regression-analysis | PASS |
| performance-regression-analysis--implicit-en | performance-regression-analysis | en | implicit | none | none | PASS |
| performance-regression-analysis--implicit-zh-CN | performance-regression-analysis | zh-CN | implicit | none | none | PASS |
| performance-regression-analysis--negative-zh-CN | performance-regression-analysis | zh-CN | negative | safe-code-review | safe-code-review | PASS |
| architecture-deepening-analysis--explicit-en | architecture-deepening-analysis | en | explicit | architecture-deepening-analysis | architecture-deepening-analysis | PASS |
| architecture-deepening-analysis--explicit-zh-CN | architecture-deepening-analysis | zh-CN | explicit | architecture-deepening-analysis | architecture-deepening-analysis | PASS |
| architecture-deepening-analysis--implicit-en | architecture-deepening-analysis | en | implicit | none | none | PASS |
| architecture-deepening-analysis--implicit-zh-CN | architecture-deepening-analysis | zh-CN | implicit | none | none | PASS |
| architecture-deepening-analysis--negative-zh-CN | architecture-deepening-analysis | zh-CN | negative | project-health-check | project-health-check | PASS |
| architecture-decision-record--explicit-en | architecture-decision-record | en | explicit | architecture-decision-record | architecture-decision-record | PASS |
| architecture-decision-record--explicit-zh-CN | architecture-decision-record | zh-CN | explicit | architecture-decision-record | architecture-decision-record | PASS |
| architecture-decision-record--implicit-en | architecture-decision-record | en | implicit | none | none | PASS |
| architecture-decision-record--implicit-zh-CN | architecture-decision-record | zh-CN | implicit | none | none | PASS |
| architecture-decision-record--negative-zh-CN | architecture-decision-record | zh-CN | negative | safe-change-plan | safe-change-plan | PASS |
| configuration-audit--explicit-en | configuration-audit | en | explicit | configuration-audit | configuration-audit | PASS |
| configuration-audit--explicit-zh-CN | configuration-audit | zh-CN | explicit | configuration-audit | configuration-audit | PASS |
| configuration-audit--implicit-en | configuration-audit | en | implicit | none | none | PASS |
| configuration-audit--implicit-zh-CN | configuration-audit | zh-CN | implicit | none | none | PASS |
| configuration-audit--negative-zh-CN | configuration-audit | zh-CN | negative | project-health-check | project-health-check | PASS |
| session-handoff--explicit-en | session-handoff | en | explicit | session-handoff | session-handoff | PASS |
| session-handoff--explicit-zh-CN | session-handoff | zh-CN | explicit | session-handoff | session-handoff | PASS |
| session-handoff--implicit-en | session-handoff | en | implicit | none | none | PASS |
| session-handoff--implicit-zh-CN | session-handoff | zh-CN | implicit | none | none | PASS |
| session-handoff--negative-zh-CN | session-handoff | zh-CN | negative | safe-code-review | safe-code-review | PASS |
| safe-fix-implementation--explicit-en | safe-fix-implementation | en | explicit | safe-fix-implementation | safe-fix-implementation | PASS |
| safe-fix-implementation--explicit-zh-CN | safe-fix-implementation | zh-CN | explicit | safe-fix-implementation | safe-fix-implementation | PASS |
| safe-fix-implementation--implicit-en | safe-fix-implementation | en | implicit | safe-fix-implementation | safe-fix-implementation | PASS |
| safe-fix-implementation--implicit-zh-CN | safe-fix-implementation | zh-CN | implicit | safe-fix-implementation | safe-fix-implementation | PASS |
| safe-fix-implementation--negative-zh-CN | safe-fix-implementation | zh-CN | negative | safe-test-implementation | safe-test-implementation | PASS |
| skill-authoring--explicit-en | skill-authoring | en | explicit | skill-authoring | skill-authoring | PASS |
| skill-authoring--explicit-zh-CN | skill-authoring | zh-CN | explicit | skill-authoring | skill-authoring | PASS |
| skill-authoring--implicit-en | skill-authoring | en | implicit | skill-authoring | skill-authoring | PASS |
| skill-authoring--implicit-zh-CN | skill-authoring | zh-CN | implicit | skill-authoring | skill-authoring | PASS |
| skill-authoring--negative-en | skill-authoring | en | negative | report-writer | report-writer | PASS |
| skill-quality-audit--explicit-en | skill-quality-audit | en | explicit | skill-quality-audit | skill-quality-audit | PASS |
| skill-quality-audit--explicit-zh-CN | skill-quality-audit | zh-CN | explicit | skill-quality-audit | skill-quality-audit | PASS |
| skill-quality-audit--implicit-en | skill-quality-audit | en | implicit | skill-quality-audit | skill-quality-audit | PASS |
| skill-quality-audit--implicit-zh-CN | skill-quality-audit | zh-CN | implicit | skill-quality-audit | skill-quality-audit | PASS |
| skill-quality-audit--negative-en | skill-quality-audit | en | negative | safe-code-review | safe-code-review | PASS |
| pdf-review-basic--explicit-en | pdf-review-basic | en | explicit | pdf-review-basic | pdf-review-basic | PASS |
| pdf-review-basic--explicit-zh-CN | pdf-review-basic | zh-CN | explicit | pdf-review-basic | pdf-review-basic | PASS |
| pdf-review-basic--implicit-en | pdf-review-basic | en | implicit | pdf-review-basic | pdf-review-basic | PASS |
| pdf-review-basic--implicit-zh-CN | pdf-review-basic | zh-CN | implicit | pdf-review-basic | pdf-review-basic | PASS |
| pdf-review-basic--negative-zh-CN | pdf-review-basic | zh-CN | negative | pdf-review | pdf-review | PASS |
| word-document-review-basic--explicit-en | word-document-review-basic | en | explicit | word-document-review-basic | word-document-review-basic | PASS |
| word-document-review-basic--explicit-zh-CN | word-document-review-basic | zh-CN | explicit | word-document-review-basic | word-document-review-basic | PASS |
| word-document-review-basic--implicit-en | word-document-review-basic | en | implicit | word-document-review-basic | word-document-review-basic | PASS |
| word-document-review-basic--implicit-zh-CN | word-document-review-basic | zh-CN | implicit | word-document-review-basic | word-document-review-basic | PASS |
| word-document-review-basic--negative-zh-CN | word-document-review-basic | zh-CN | negative | document-review | document-review | PASS |
| excel-data-quality-check-basic--explicit-en | excel-data-quality-check-basic | en | explicit | excel-data-quality-check-basic | excel-data-quality-check-basic | PASS |
| excel-data-quality-check-basic--explicit-zh-CN | excel-data-quality-check-basic | zh-CN | explicit | excel-data-quality-check-basic | excel-data-quality-check-basic | PASS |
| excel-data-quality-check-basic--implicit-en | excel-data-quality-check-basic | en | implicit | excel-data-quality-check-basic | excel-data-quality-check-basic | PASS |
| excel-data-quality-check-basic--implicit-zh-CN | excel-data-quality-check-basic | zh-CN | implicit | excel-data-quality-check-basic | excel-data-quality-check-basic | PASS |
| excel-data-quality-check-basic--negative-zh-CN | excel-data-quality-check-basic | zh-CN | negative | spreadsheet-data-cleaning | spreadsheet-data-cleaning | PASS |
| report-writer--explicit-en | report-writer | en | explicit | report-writer | report-writer | PASS |
| report-writer--explicit-zh-CN | report-writer | zh-CN | explicit | report-writer | report-writer | PASS |
| report-writer--implicit-en | report-writer | en | implicit | report-writer | report-writer | PASS |
| report-writer--implicit-zh-CN | report-writer | zh-CN | implicit | report-writer | report-writer | PASS |
| report-writer--negative-zh-CN | report-writer | zh-CN | negative | research-brief | research-brief | PASS |
| research-brief--explicit-en | research-brief | en | explicit | research-brief | research-brief | PASS |
| research-brief--explicit-zh-CN | research-brief | zh-CN | explicit | research-brief | research-brief | PASS |
| research-brief--implicit-en | research-brief | en | implicit | research-brief | research-brief | PASS |
| research-brief--implicit-zh-CN | research-brief | zh-CN | implicit | research-brief | research-brief | PASS |
| research-brief--negative-zh-CN | research-brief | zh-CN | negative | report-writer | report-writer | PASS |
| spreadsheet-data-cleaning--explicit-en | spreadsheet-data-cleaning | en | explicit | spreadsheet-data-cleaning | spreadsheet-data-cleaning | PASS |
| spreadsheet-data-cleaning--explicit-zh-CN | spreadsheet-data-cleaning | zh-CN | explicit | spreadsheet-data-cleaning | spreadsheet-data-cleaning | PASS |
| spreadsheet-data-cleaning--implicit-en | spreadsheet-data-cleaning | en | implicit | spreadsheet-data-cleaning | spreadsheet-data-cleaning | PASS |
| spreadsheet-data-cleaning--implicit-zh-CN | spreadsheet-data-cleaning | zh-CN | implicit | spreadsheet-data-cleaning | spreadsheet-data-cleaning | PASS |
| spreadsheet-data-cleaning--negative-zh-CN | spreadsheet-data-cleaning | zh-CN | negative | excel-data-quality-check-basic | excel-data-quality-check-basic | PASS |
| document-review--explicit-en | document-review | en | explicit | document-review | document-review | PASS |
| document-review--explicit-zh-CN | document-review | zh-CN | explicit | document-review | document-review | PASS |
| document-review--implicit-en | document-review | en | implicit | document-review | document-review | PASS |
| document-review--implicit-zh-CN | document-review | zh-CN | implicit | document-review | document-review | PASS |
| document-review--negative-zh-CN | document-review | zh-CN | negative | content-consistency-check | content-consistency-check | PASS |
| pdf-review--explicit-en | pdf-review | en | explicit | pdf-review | pdf-review | PASS |
| pdf-review--explicit-zh-CN | pdf-review | zh-CN | explicit | pdf-review | pdf-review | PASS |
| pdf-review--implicit-en | pdf-review | en | implicit | pdf-review | pdf-review | PASS |
| pdf-review--implicit-zh-CN | pdf-review | zh-CN | implicit | pdf-review | pdf-review | PASS |
| pdf-review--negative-zh-CN | pdf-review | zh-CN | negative | pdf-review-basic | pdf-review-basic | PASS |
| meeting-notes-to-actions--explicit-en | meeting-notes-to-actions | en | explicit | meeting-notes-to-actions | meeting-notes-to-actions | PASS |
| meeting-notes-to-actions--explicit-zh-CN | meeting-notes-to-actions | zh-CN | explicit | meeting-notes-to-actions | meeting-notes-to-actions | PASS |
| meeting-notes-to-actions--implicit-en | meeting-notes-to-actions | en | implicit | meeting-notes-to-actions | meeting-notes-to-actions | PASS |
| meeting-notes-to-actions--implicit-zh-CN | meeting-notes-to-actions | zh-CN | implicit | meeting-notes-to-actions | meeting-notes-to-actions | PASS |
| meeting-notes-to-actions--negative-zh-CN | meeting-notes-to-actions | zh-CN | negative | report-writer | report-writer | PASS |
| presentation-outline--explicit-en | presentation-outline | en | explicit | presentation-outline | presentation-outline | PASS |
| presentation-outline--explicit-zh-CN | presentation-outline | zh-CN | explicit | presentation-outline | presentation-outline | PASS |
| presentation-outline--implicit-en | presentation-outline | en | implicit | presentation-outline | presentation-outline | PASS |
| presentation-outline--implicit-zh-CN | presentation-outline | zh-CN | implicit | presentation-outline | presentation-outline | PASS |
| presentation-outline--negative-zh-CN | presentation-outline | zh-CN | negative | report-writer | report-writer | PASS |
| content-consistency-check--explicit-en | content-consistency-check | en | explicit | content-consistency-check | content-consistency-check | PASS |
| content-consistency-check--explicit-zh-CN | content-consistency-check | zh-CN | explicit | content-consistency-check | content-consistency-check | PASS |
| content-consistency-check--implicit-en | content-consistency-check | en | implicit | content-consistency-check | content-consistency-check | PASS |
| content-consistency-check--implicit-zh-CN | content-consistency-check | zh-CN | implicit | content-consistency-check | content-consistency-check | PASS |
| content-consistency-check--negative-zh-CN | content-consistency-check | zh-CN | negative | document-review | document-review | PASS |

## Failures

None.
