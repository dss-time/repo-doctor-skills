# 0.11.0 release validation

Status: PASS_LOCAL_AND_MODEL. Remote CI must pass before tagging/publication.

- Full corpus: **289/289 PASS**, gpt-6.1-terra, [source-bound report](../tests/reports/live-codex-skill-validation-0.11.0.json).
- Actual single edit, serial checkpoint recovery and independent core review: [PASS](../tests/reports/coordination-release-0.11.0.json).
- Workspace safety and scoped conventions: [6/6 PASS](../tests/reports/live-user-safety-validation-0.11.0.json).
- Targeted language, authorization and adaptive-mode answers: [11/11 PASS](../tests/reports/live-change-regression-validation-0.11.0.json), reviewed by the release lead, not an independent reviewer.
- Full `npm test`: PASS, including 47 state tests, Recommended 7/7, Full 34/34 and isolated packed CLI commands.
- Bilingual 34/34, 7/7 build targets and 34/34 ZIPs: PASS. Documentation, quality and development metadata: PASS.

## Preserved attempts

The first advanced run stopped after 174 passing cases due to quota exhaustion and authentication refresh errors. Its unchanged core results were reused, and the complete advanced suite was rerun successfully. The initial convention fixture required a specific expression rather than observable behavior; its report is retained. The corrected verifier checks zero, missing, normal, negative and NaN behavior, style, types and exact allowed write scope. No Skill source changed to accommodate the verifier correction. See [attempt history](../tests/reports/release-0.11.0-attempt-history/).

## Scope

34 Skills, 27 Repo Doctor entries, Recommended 7 unchanged, 13 serial registered workflows, 7 build targets and 34 ChatGPT ZIPs.

- Fresh gpt-6.1-terra core, workflow, mode and permission evaluation against the complete current Skill source/runtime hashes.
- Fresh isolated single-edit, serial recovery and independent core review trials.
- Synthetic user-workspace safety fixtures, including scoped project conventions and treating configuration as data.
- Read-only targeted language, authorization and adaptive mode semantic checks.
- Local full regression, packed CLI, build, documentation and generated-content checks; remote CI before tagging.

## Evidence boundaries

Fixed-corpus model responses do not prove universal runtime correctness. Coordination trials use a serial Codex host adapter and synthetic local data. Native multi-agent development evidence remains historical after later reference changes; current routing/semantic checks do not imply a fresh native parallel implementation trial. No Windows native, Linux native, hardware, production, remote A2A or cross-client execution claim is inferred from local macOS results. Remote installer CI results are reported separately. No Token savings percentage is claimed.
