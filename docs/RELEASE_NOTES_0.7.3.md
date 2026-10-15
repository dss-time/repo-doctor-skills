# Repo Doctor Skills v0.7.3 — Stable Release

Prepared: 2026-10-15. Tag: `v0.7.3`. Stable non-prerelease.

## Real-model validation

Live-model status: **PASS, 317/317** on **GPT-6.1 Sol**, reasoning effort **low**, Codex CLI **0.162.0-alpha.17.2**. Coverage: 200 core cases, 44 bilingual workflow steps, 61 mode/verdict cases and 12 permission cases. Every passing case records the observed model and token usage. No model reroutes or permission violations were observed. This release uses no evaluation waiver.

The first Astra attempt was stopped following the maintainer's model choice and is not reused. The Sol core run hit a quota limit after 125 PASS cases. After natural quota recovery, the remaining 75 were run with unchanged model, fixtures and installed Skill hashes; all 117 advanced cases then passed. Original interrupted attempts remain in the repository. No reset coupons were consumed.

## Changes

- Add explicit evaluator model selection, actual model verification, token metadata and model-reroute observations.
- Add guarded core resume for service/quota failures; require identical version, model, cases and Skill hashes. Semantic failures are not automatically retried.
- Publish current evidence and update bilingual README, version policy and evaluation instructions.
- Preserve all 40 Skills, 37 ChatGPT ZIPs and component versions from v0.7.2: Repo Doctor Pack/plugin 0.9.1, Router 0.2.2, Release Readiness Check 0.1.2.

## Scope and release checks

The suite validates structured routing, workflow artifacts, modes and declared permission boundaries. It does not measure production task effectiveness or prove all model/platform combinations. Skill roots, SQLite state and the Git workspace are isolated; host authentication and capability metadata can remain visible. Deterministic release checks and existing GitHub CI also apply. No npm publication is included.

[Full report](https://github.com/dss-time/repo-doctor-skills/blob/v0.7.3/tests/reports/live-codex-skill-validation-0.7.3.md)

## Install

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.7.3
codex plugin add repo-doctor@repo-doctor-marketplace
```

Choose one install method per agent, then start a new task. The Release includes 37 individual ChatGPT ZIPs and three metadata/checksum files.
