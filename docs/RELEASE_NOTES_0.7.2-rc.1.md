# Repo Doctor Skills v0.7.2-rc.1 — Release Candidate

Prepared: 2026-10-14. Tag: `v0.7.2-rc.1`. This is a prerelease, not a stable release.

## Changes

- Preflight release-check scripts, lifecycle hooks and transitive commands; block unsafe gates while continuing independent safe checks.
- Add a copyable next request to Router output, preserving the user's scope and missing-input placeholders.
- Clarify installation locations, scope and updates in English and Chinese; add onboarding, health-check, CI and installation troubleshooting examples.
- Compare plugin/ZIP membership against canonical manifests instead of hardcoded daily counts, retaining separate release snapshot checks.
- Keep 40 Skills, 37 ChatGPT ZIPs and stable slugs. Repo Doctor Pack/plugin: 0.9.1; Router: 0.2.2; Release Readiness Check: 0.1.2.

## Validation and limits

Live-model status: **UNKNOWN** for this candidate. No full local test suite or 317-call model evaluation was run. Historical v0.7.1 evidence is not reused as current PASS evidence. Focused workflow, UX, doctor, documentation, release metadata, schema and generated-output checks are used for this prerelease. Existing GitHub CI may run its configured offline suite on push; no new live-model evaluation is scheduled.

The prior v0.7.1 commits were on main without a remote tag or GitHub Release when inspected on 2026-10-14. Existing release tags are preserved. This release does not publish npm.

## Install

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.7.2-rc.1
codex plugin add repo-doctor@repo-doctor-marketplace
```

Use one installation method per agent, then start a new task. Individual ChatGPT ZIPs and SHA-256 checksums are attached to the GitHub prerelease.
