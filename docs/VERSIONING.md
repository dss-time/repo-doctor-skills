# Versioning and Lifecycle Policy

Repo Doctor Skills keeps release versions, component versions, and maturity statuses separate. A matching number in two places is not evidence that they share a lifecycle.

## 1. Project release version

The project release version covers the repository-level release as a whole. Its authoritative metadata is `package.json`; the same version must be used by the Git tag, GitHub Release, formal `CHANGELOG.md` section, and release notes.

The current project release is **0.4.1 stable**. The unchanged Skill corpus retains **PASS** evidence from 317/317 real Codex calls, comprising 200 core routing calls, 44 bilingual workflow steps, 61 mode and prototype-verdict cases, and 12 permission-boundary cases. The machine-readable 317-call report identifies its actual v0.4.0 execution version; v0.4.1 does not misrepresent it as a new run.

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

For the 0.4.1 stable project release, the component baselines remain:

| Component | Version | Distribution rule |
|---|---:|---|
| Repo Doctor Pack / plugin | 0.7.0 | Pack and generated plugin must match. |
| Productivity Toolkit Pack / plugin | 0.1.0 | Pack and generated plugin must match. |
| Skill Maintainer Pack / plugin | 0.2.0 | Pack and generated plugin must match. |
| Document Data Doctor Pack | 0.1.0 | No standalone plugin or ChatGPT ZIP. |
| Individual Skills | 31 at 0.1.0; 6 at 0.2.0; 2 at 0.3.0; 1 at 0.4.0 | Per `skill.yaml`; independent of project and Pack versions. |

Do not mechanically replace every component version with the project version. Update a component version only when its own contract changes, and regenerate plugin and platform outputs from `packs/`.

v0.4.1 changes repository documentation and the remote Release verifier, not Pack, plugin, or Skill public contracts. The Pack/plugin pairs therefore remain at their v0.4.0 component baselines and continue to match exactly.

## 3. Maturity status

Maturity status is independent of both version layers:

- `draft`: incomplete or still under maintainer review; included in local builds only when the repository's active-status rules allow it.
- `beta`: validated by repository contracts and suitable for real tasks, but still lacks enough broad public-use or live-model routing evidence for `stable`. Beta does not mean unusable.
- `stable`: a mature public interface supported by compatibility and use evidence. Stable does not mean bug-free or risk-free.
- `deprecated`: retained only for compatibility and excluded from new active routing.

A Pack's maturity must not be higher than the least mature active Skill it contains. Template Packs and template Skills remain `draft`, are excluded from active counts, and are not released as plugins or standalone ZIPs.

For the 0.4.1 stable project release, all 4 active Packs and all 40 active Skills remain `beta`. The template Pack and its template Skill remain `draft`; project-channel stability does not automatically promote component maturity.

Repository validation, activation contracts, deterministic builds, and live-model tests provide different evidence. The unchanged Skill corpus passed 317/317 Live-model calls with zero failed or blocked cases at v0.4.0; the machine-readable report retains every case and bounded evidence. v0.4.1 reruns deterministic and remote Release gates and performs post-release routing and permission smoke tests.

## Semantic Versioning decisions

Use [Semantic Versioning](https://semver.org/) independently at the appropriate layer:

- patch: backward-compatible fixes without new public capability;
- minor: backward-compatible Skills, Packs, platform outputs, or user capabilities;
- major: incompatible public invocation, schema, Pack-format, or component-contract changes.

Repo Doctor Skills is still pre-1.0. Version 0.4.0 was the minor release after v0.3.0 because it added two backward-compatible Skills, expanded workflows and platform installation output, and enhanced six existing Skills without removing or renaming a canonical slug. Version 0.4.1 is a patch because it changes documentation, reproducible installation guidance, and Release verification without changing a Skill contract. A 1.0.0 release requires an explicit product decision.

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
