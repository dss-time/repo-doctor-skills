# v0.2.0 Release Candidate — Repo Doctor Skills

> Candidate date: 2026-07-15. This document describes a prepared Release Candidate; it does not mean that a commit, `v0.2.0` tag, GitHub Release, npm publication, or plugin-marketplace publication has occurred.

## Highlights

- Expands Repo Doctor to 25 bilingual engineering Skills covering workflow routing, requirements clarification, specification, vertical work-item planning, diagnosis, review, controlled implementation, verification, release gates, and session handoff.
- Adds Productivity Toolkit with 8 general office and research Skills.
- Adds Skill Maintainer with 2 maintainer workflows for controlled Skill authoring and read-only quality auditing.
- Retains 3 Document Data Doctor Basic Skills in the regular cross-platform build without giving them standalone plugins or ChatGPT ZIPs.
- Builds 7 regular platform targets and 35 plugin-backed ChatGPT single-Skill ZIP packages.
- Adds bilingual User Manuals, complete generated Skill Catalogs, Workflow Cookbooks, and deterministic documentation checks.
- Uses `packs/` as the only canonical Skill source and regenerates synchronized `plugins/` and `dist/` outputs.

## Version model

- **Project Release Candidate:** 0.2.0.
- **Component versions:** independent of the project release. Repo Doctor Pack/plugin is 0.6.0; Skill Maintainer Pack/plugin is 0.2.0; Productivity Toolkit Pack/plugin and Document Data Doctor Pack are 0.1.0; individual Skills keep their own versions.
- **Maturity:** independent of both version layers. All 4 active Packs and 38 active Skills are `beta`; the template Pack and template Skill remain `draft`. Beta means repository-validated and usable for real tasks while broader public-use or Live-model routing evidence is still limited; it does not mean unusable. Stable would not mean bug-free.
- **Live-model routing accuracy:** **UNKNOWN**. Activation contracts and deterministic validation do not replace an online model evaluation.

See [Versioning and Lifecycle Policy](VERSIONING.md) for the full policy and the historical `v0.0.1` tag-label exception.

## Compatibility and safety

- Public invocation slugs for the original Repo Doctor Skills remain available.
- Generated plugin and platform content comes from canonical `packs/`; generated copies are not maintained independently.
- Every active Skill continues to disallow destructive actions. Writable Skills remain limited to their documented scopes and still require host and user authorization.
- Document Data Doctor Basic Skills remain regular-build-only; this is an intentional distribution boundary.
- The repository does not include private investment strategies, customer data, secrets, or organization-specific workflows.

## Release-candidate gate

Before any separate publication authorization, the final read-only acceptance must confirm:

- project and component version consistency under the two-layer policy;
- valid Pack and Skill maturity states, with templates excluded;
- current generated Catalogs, plugin distributions, platform targets, and ChatGPT ZIPs;
- Schema validation, activation contracts, tests, documentation checks, and two consecutive deterministic builds;
- no stale generated files, duplicate descriptions, machine paths, credentials, customer data, or private investment logic;
- an empty `Unreleased` section and a complete 0.2.0 section in [CHANGELOG.md](../CHANGELOG.md).

Passing these gates makes the checkout eligible for final read-only acceptance. It does not authorize commit, push, tag creation, GitHub Release creation, npm publication, or marketplace publication.
