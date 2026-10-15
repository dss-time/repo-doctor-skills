# Repo Doctor Skills v0.8.0 — Stable Release

Prepared: 2026-10-15. Tag: `v0.8.0`. Stable non-prerelease.

## Real-model validation

Live-model status: **PASS, 328/328**, using GPT-6.1 Sol with low reasoning. Coverage: 205 core, 44 bilingual workflow steps, 65 mode/verdict and 14 permission cases. v0.7.3 evidence is historical and is not reused. No waiver is used. All cases record the observed model; no reroutes or permission violations were observed. The initial core attempt stopped at 159 PASS because of a service quota; the remaining 46 were completed after confirming unchanged version, model, fixtures and Skill hashes. The original attempt is retained. No reset coupons were consumed by the evaluator.

## Changes

- Add `feature-implementation` for settled feature specifications and authorized supporting tests/docs; route feature delivery to it and retain `safe-fix-implementation` for local defects.
- Reduce repetitive output and question quotas in Router, clarification, onboarding and health checks while preserving evidence and detailed modes.
- Align release-check command permission/risk with preflighted local validation and require actual executable fix verification.
- Add bilingual worked examples and human-only blocker guidance: location, action, success signal and resume step, without collecting secret values.
- Ship 41 Skills, 28 in Repo Doctor Pack/plugin 0.10.0, and 38 standalone ChatGPT ZIPs. Recommended remains seven Skills.

## Validation scope

The real-model suite checks routing, synthetic workflow artifacts, declared modes and permission boundaries in an isolated empty workspace. It does not establish production-task effectiveness, token savings or every model/platform combination. Deterministic packaging, installation, documentation and CI checks remain required. No credential values or bulk model transcripts are published.

## Install after publication

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill '*' -a codex
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.8.0
codex plugin add repo-doctor@repo-doctor-marketplace
```

Choose one method per agent. The GitHub Release includes 38 individual ZIPs and three metadata/checksum files.

## npm installation

npm `repo-doctor-skills@0.8.0` was subsequently published on 2026-10-15; `latest` selects 0.8.0.

```bash
npx repo-doctor-skills@0.8.0 install --agent codex
npx repo-doctor-skills@0.8.0 install --preset full --agent codex
```

The first command installs seven recommended Skills; the second installs all 41. Both use the user-wide Codex Skills directory.

[Real-model report](https://github.com/dss-time/repo-doctor-skills/blob/v0.8.0/tests/reports/live-codex-skill-validation-0.8.0.md)
