# 0.10.0 release validation

Prepared stable version: 0.10.0. Release date: 2026-11-06. The final full model corpus and actual coordination trial pass. Publication remains gated on CI for the final evidence commit.

## Local checks

The complete npm suite passes, including packed CLI installation (Recommended 7/7, Full 33/33), same-name replacement/rollback, credential scanning, scoped authorization, deferred verification, recovery identity, prior effects and explicit result reuse. The coordination suite passes 74/74 checks. Metadata, bilingual/generated quality and documentation checks pass for three Packs, 33 active Skills, 13 workflows, seven targets and 33 ZIPs.

Earlier candidate commits dc07e46 and ca47ae2 passed all seven GitHub CI jobs. The final evidence commit will receive its own CI run before publication.

## Independent safety review

The final bounded core review in tests/reports/coordination-live-YdH09l/report.json passes on gpt-6.1-terra. Repository conformance, intent fidelity and operational safety were all checked with no findings. The reviewer inspected the actual committed baseline, current source, protocol contracts and a real host-executed focused regression receipt whose SHA256 matches the reviewed core.

Review findings from earlier attempts were fixed rather than waived: current execution identity is held in runtime memory; imported completion and reused states require current host authority; recovered pending operations require explicit dispositions; optional skips cannot erase prior effects; current read-only capability cannot imply a historical absence of writes; demonstrated input changes take priority over incomplete receipt metadata.

## Final model corpus and actual workflow

The gpt-6-sol core first pass scored 161/165: three explicit selections returned an incorrect null protocol field, and one workbook-cleaning negative case selected content-consistency-check. These semantic failures remain preserved and are not accepted as passing evidence. A fresh full gpt-6.1-terra run passed 55 cases before the service returned usageLimitExceeded for the remaining 110; its checkpoint resumed only the externally blocked cases and completed 165/165 PASS without changing source or expectations. The final gpt-6.1-terra corpus passes 284/284: 165 core cases, 40 workflow steps, 65 mode cases and 14 permission cases. The actual model is recorded in each result. The complete report is tests/reports/live-codex-skill-validation-0.10.0.json. Service-blocked gpt-6.1-sol and gpt-6-astra attempts remain historical and are not mixed into that final corpus. The release gate requires 284/284 PASS bound to final canonical/runtime content.

Final-source single-edit and coordinated regression/recovery trials run on gpt-6.1-terra. Their accepted reports have been assembled with the independent core audit into tests/reports/coordination-release-0.10.0.json and pass its release checker.

The preceding 312-case development run remains under tests/reports/unified-validation-2026-11-05 as historical evidence, not approval for the final recovery fixes.

## Cleanup and authentication

A superseded model checkpoint, a duplicate core report, a redundant short log and stale ignored build candidates were removed. Completed unsuccessful coordination attempts were losslessly archived under tests/reports/release-0.10.0-attempt-history/attempts.tar.gz. manifest.json records original filenames, byte counts and SHA256; every extracted file was verified before removing 120 loose files. Active and accepted final reports remain separate and directly verifiable. Meaningful regression suites remain in the repository and stay outside the npm package.

npm authentication was rechecked successfully on 2026-11-06 as beideng000001. Authentication will be checked again immediately before publication; credentials are never requested in chat.

## Limits

Evidence covers source analysis, actual isolated synthetic fixtures and the recorded model behavior. Production systems, real backend/hardware integration, every client/framework, and universal tool-response prompt-injection resistance remain outside this run. Skill instructions complement host sandbox and authorization controls.
