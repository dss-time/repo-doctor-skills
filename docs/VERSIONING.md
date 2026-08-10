# Versioning and Lifecycle Policy

Repo Doctor Skills keeps release versions, component versions, and maturity statuses separate. A matching number in two places is not evidence that they share a lifecycle.

## 1. Project release version

The project release version covers the repository-level release as a whole. Its authoritative metadata is `package.json`; the same version must be used by the Git tag, GitHub Release, formal `CHANGELOG.md` section, and release notes.

The current project release is **0.5.1 stable**. Its 30-case live performance comparison completed every baseline/optimized pair: baseline correctness was 27/30 and optimized correctness was 30/30, with bilingual, safety, permission, and regression gates passing. The machine-readable comparison discloses the recovery timeout override used for two long optimized cases. The separate 317/317-call report remains historical v0.4.0 evidence rather than a newly executed v0.5.1 corpus.

The immutable `v0.5.0` tag points to the intended execution-efficiency candidate, but that tag's clean-checkout CI exposed a build-integrity test dependency on ignored `dist/` output. No GitHub Release was created for v0.5.0, and the tag is preserved without deletion or movement. v0.5.1 contains the same Skill behavior plus the test-only clean-build isolation fix.

For future releases:

- use the tag format `v<project-version>`;
- require the tag, GitHub Release name, package version, changelog version, and release notes to agree;
- treat a release as published only after the external release action succeeds.

## 2. Component versions

Packs, plugins, and Skills have component versions independent of the project release version:

- a Pack version describes that Pack's public component contract;
- a plugin generated from a Pack must use the same version as that Pack;
- a Skill version describes that Skill's own contract and does not have to equal its Pack version;
- a project release may include unchanged components without changing their component versions;
- marketplace entries and ChatGPT ZIPs currently have no independent embedded version field.

For the 0.5.1 stable project release, the component baselines are:

| Component | Version | Distribution rule |
|---|---:|---|
| Repo Doctor Pack / plugin | 0.8.0 | Pack and generated plugin must match. |
| Productivity Toolkit Pack / plugin | 0.1.0 | Pack and generated plugin must match. |
| Skill Maintainer Pack / plugin | 0.2.0 | Pack and generated plugin must match. |
| Document Data Doctor Pack | 0.1.0 | No standalone plugin or ChatGPT ZIP. |
| Individual Skills | 30 at 0.1.0; 7 at 0.2.0; 2 at 0.3.0; 1 at 0.4.0 | Per `skill.yaml`; independent of project and Pack versions. |

Do not mechanically replace every component version with the project version. Update a component version only when its own contract changes, and regenerate plugin and platform outputs from `packs/`.

The execution and activation contract introduced by the v0.5.0 candidate advances the Repo Doctor Pack/plugin pair together to 0.8.0. `safe-fix-implementation` advances to 0.2.0 because its public activation description covers exact, low-risk edits with an explicit target and desired result. v0.5.1 changes no Skill behavior or component contract, so these component versions remain unchanged.

## 3. Maturity status

Maturity status is independent of both version layers:

- `draft`: incomplete or still under maintainer review; included in local builds only when the repository's active-status rules allow it.
- `beta`: validated by repository contracts and suitable for real tasks, but still lacks enough broad public-use or live-model routing evidence for `stable`. Beta does not mean unusable.
- `stable`: a mature public interface supported by compatibility and use evidence. Stable does not mean bug-free or risk-free.
- `deprecated`: retained only for compatibility and excluded from new active routing.

A Pack's maturity must not be higher than the least mature active Skill it contains. Template Packs and template Skills remain `draft`, are excluded from active counts, and are not released as plugins or standalone ZIPs.

For the 0.5.1 stable project release, all 4 active Packs and all 40 active Skills remain `beta`. The template Pack and its template Skill remain `draft`; project-channel stability does not automatically promote component maturity.

Repository validation, activation contracts, deterministic builds, and live-model tests provide different evidence. The v0.5.1 comparison evidence matched 30/30 baseline/optimized cases and produced a 27 PASS/PASS, 3 FAIL/PASS, 0 PASS/FAIL, 0 FAIL/FAIL matrix. The earlier 317/317 Live-model corpus remains historical v0.4.0 evidence. v0.5.1 also reruns deterministic and remote Release gates and performs current-HEAD and post-release routing and permission smoke tests.

## Semantic Versioning decisions

Use [Semantic Versioning](https://semver.org/) independently at the appropriate layer:

- patch: backward-compatible fixes without new public capability;
- minor: backward-compatible Skills, Packs, platform outputs, or user capabilities;
- major: incompatible public invocation, schema, Pack-format, or component-contract changes.

Repo Doctor Skills is still pre-1.0. Version 0.4.1 was the preceding stable documentation and Release-verification patch. The v0.5.0 candidate introduced backward-compatible execution modes, Simple Request Bypass, progressive reference loading, and generated implicit-invocation policy without removing or renaming a canonical Skill slug, but it did not form a GitHub Release. Version 0.5.1 is the stable patch release of that candidate, adding only clean-checkout CI isolation for the build-integrity test. A 1.0.0 release requires an explicit product decision.

## Historical version-label exception

The GitHub Release published on 2026-07-09 used the tag `v0.0.1`, while its release name/body, `package.json`, Pack and Skill metadata, and draft release notes identified the project content as **0.1.0**. The Repo Doctor plugin manifest already used its independent component version 0.2.0. This is a historical project tag-label error, not a reason to collapse project and component versions.

For project history and SemVer planning, treat 0.1.0 as the content release baseline and preserve the existing `v0.0.1` tag as immutable history. Do not delete, move, or recreate that tag. The `v0.2.0` prerelease, `v0.3.0-rc.1` prerelease, and `v0.3.0` stable release also remain immutable; later releases must use new tags.

## Release checks

Before publication, confirm all of the following:

1. Project version agrees across `package.json`, the intended tag, release notes, and `CHANGELOG.md`.
2. Each Pack version agrees with its corresponding generated plugin manifest.
3. Skill versions remain valid and change only with their own contracts.
4. Pack and Skill maturity decisions have evidence; templates and deprecated content remain correctly excluded.
5. Generated catalogs, plugins, platform outputs, and ChatGPT ZIPs are rebuilt from canonical `packs/` sources.
6. Validation, tests, documentation checks, and repeated builds pass.
7. Release publication, commit, push, and tagging remain separate, explicitly authorized actions.
