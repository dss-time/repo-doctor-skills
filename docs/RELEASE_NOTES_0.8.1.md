# Repo Doctor Skills v0.8.1 — Stable Release

Prepared: 2026-10-22. Tag: `v0.8.1`. Stable non-prerelease.

## Real-model validation

Live-model status: **PASS, 328/328**. Fresh GPT-6.1 Sol low evidence covers 328 unique validated cases: 205 core, 44 bilingual workflow steps, 65 mode/verdict and 14 permission cases. v0.8.0 reports remain historical and are not reused. No waiver is used.

## Changes

- Roll back an entire attempted Skill installation on failure; retain recovery files if restoration fails.
- Separate development consistency from formal release gates and bind new model reports and resume eligibility to canonical source and complete Skill runtime trees.
- Align test-first feature delivery, diagnosed local fixes, clarification, specification and planning routes.
- Bundle the workflow registry and shared test rules with individual Skills and preserve authorized temporary cleanup and prototype handoffs.
- Expand npm keywords, retaining `skills` and adding `workbuddy`; document generic WorkBuddy Skill import compatibility, with actual WorkBuddy installation/execution not yet verified.
- Ship 41 Skills: Repo Doctor Pack/plugin 0.10.1 has 28; the three plugins provide 38 individual ChatGPT ZIPs. Recommended remains seven Skills.

## Validation limits

The real-model suite checks routing, synthetic workflow artifacts, declared modes and permission boundaries in an isolated empty workspace. It does not certify production-task effectiveness or every model/platform. Historical reports remain unchanged. Deterministic packaging, installation, documentation and CI checks are also required.

The first advanced attempt ended on a 120-second service timeout before a report was saved. After account quota recovery, core evidence was retained and advanced evaluation restarted with concurrency 4, a 180-second timeout and per-case checkpoints. Report counts refer to unique validated cases; the interrupted attempt is disclosed separately and is not counted as validated evidence.

## Installation

After GitHub publication:

```bash
npx skills@latest add dss-time/repo-doctor-skills --skill '*' -a codex
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.8.1
codex plugin add repo-doctor@repo-doctor-marketplace
```

Choose one installation method per agent. The GitHub Release includes 38 individual ZIPs and three metadata/checksum files. npm publication status is recorded separately; do not assume that a GitHub Release updates npm.

[Real-model report](https://github.com/dss-time/repo-doctor-skills/blob/v0.8.1/tests/reports/live-codex-skill-validation-0.8.1.md)
