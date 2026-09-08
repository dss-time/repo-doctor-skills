# v0.7.0 current release validation

Run date: 2026-09-08. Candidate: the current uncommitted main worktree. Decision: **NO_GO** pending fresh Live-model evidence. This record describes this run, not historical report results.

## Completed work

- Preserved the existing v0.7.0 edits and main branch; no branch, commit, push, tag, npm publication or GitHub Release was created.
- Restored Router execution-mode reference links in both canonical languages and regenerated the plugin and skills.sh projections.
- Replaced the Doctor test's stale hardcoded project version with the package version.
- Changed the release contract to require `tests/reports/live-codex-skill-validation-0.7.0.json` with project version 0.7.0. The original v0.4.0 report remains unchanged and cannot satisfy this release.
- Verified GitHub authentication for dss-time and npm authentication for beideng000001 through network-enabled checks. Remote main matched the local baseline; npm latest was 0.6.1 and remote v0.7.0 did not exist at verification time.

## Current deterministic evidence

- Schema validation: 41 Skills including the template, 5 Packs.
- Active Skill validation: 40; registered workflows: 13.
- Activation contracts: 300 cases passed; performance contracts: 20 simple and 10 elevated scenarios passed.
- Workflow, maintainer, build-integrity, skills.sh, plugin-sync, documentation, release-tool and offline evaluation tests passed.
- Installer and public tarball tests passed, including Recommended 7/7, Full 40/40, idempotence, expansion, individual selection, language selection, conflict protection and isolated destinations.
- Documentation and quality checks passed, including generated outputs.
- Fresh inventory, bilingual and artifact reports: 40/40 bilingual Skills, 7/7 targets and 37/37 ZIPs.
- Repeat build: identical SHA-256 hashes for 1,099 files across dist, skills and plugins.
- Script syntax and diff whitespace checks passed.
- A source-only export with no pre-existing dist or node_modules passed dependency installation, validation, build, docs, quality, UX, npm and report checks. This was a clean-directory check, not a committed clean Git checkout; Git-dependent release checks remain pending.

The full test suite passed before the release contract was corrected to reject historical evidence. The final release gate remains failing because the required current report is not yet PASS. These failures are retained; the earlier suite result is not an all-gates-pass result for the final candidate.

An initial dependency install using an empty offline cache failed with ENOTCACHED. A subsequent normal offline `npm ci` succeeded from the existing cache. The full suite was rerun after restoring dependencies.

## Blocked gate and next actions

The user subsequently authorized sending the candidate public Skills and synthetic prompts to the OpenAI Codex service. Three isolated 200-case core attempts were made. The first stopped at 22 passed, 3 failed, and 175 blocked; the second stopped at 41 passed, 2 failed, and 157 blocked; the third stopped at 41 passed, 0 failed, and 159 blocked. All blocks were the external `usageLimitExceeded` response, and unstarted cases were recorded explicitly rather than treated as passed. The first two reports are retained in `tests/reports/attempts/`; the third is retained outside the repository under the isolated validation directory.

The runner now distinguishes a Skill active in the current turn from a recommended handoff, and it supplies the full capability catalog only to adjacent-recommendation cases. Targeted Router and project-health-check probes passed. Authentication secrets do not enter reports. Historical 317/317 is not current evidence and no waiver has been requested or applied.

After usable model capacity is available, rerun the core and advanced corpus against an isolated installation and store the complete version-specific PASS report. Rerun the full final local and clean-checkout gates. Only after they pass: commit on main, push, verify Main CI for that commit, publish npm 0.7.0, create and push the immutable annotated v0.7.0 tag, verify Tag CI, publish the GitHub stable Release, and verify public npm installation plus all remote assets and checksums. Refresh authentication and remote version state before publication.
