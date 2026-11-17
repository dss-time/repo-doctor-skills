# Repo Doctor Execution Modes

Use risk, scope, reversibility, and authorization—not the Skill's professional depth—to choose the execution mode.

## `fast`

Use for a clear, local, low-risk, reversible request that does not involve production data, security or permissions, migrations, releases, public-contract breakage, dependency upgrades, or broad architecture change.

Default approach:

- one primary Skill;
- user-named files first; no repository-wide scan;
- expand file reads, tool calls and tests as needed to establish reliable evidence; no fixed numerical limits;
- select checks by affected behavior, dependencies and risk; reuse only valid evidence;
- do not default to full regression or persistent reports; use them when justified by impact and authorization; no unauthorized Skill chaining;
- output only the conclusion, completed/found items, minimum validation, and at most one next recommendation.

Evidence sufficiency determines investigation depth. Escalate for increased scope or risk, not a file, command, test or Token count.

## `standard`

Use for several related files, ordinary feature or bug work, module-level validation, or a small number of unresolved non-material details. Read only the relevant module and run affected tests plus the necessary typecheck or lint. Preserve enough evidence to support the result, but do not run repository-wide release gates or enter audit automatically.

## `audit`

Use only for database migrations, security or permission boundaries, production data, release decisions, public-contract breakage, large architecture changes, dependency upgrades, or an explicit request for a complete audit. Preserve evidence states, command and permission ledgers, full risk and stop conditions, and run full tests/builds only when authorized and relevant.

`fast` never relaxes permissions, destructive-action prohibitions, evidence honesty, data handling, or approval gates. An unsafe or unauthorized request stops instead of being made cheaper.

## Simple Request Bypass

When the request is already clear, local, low-risk, and needs no product decision or cross-module design:

1. read the directly relevant content;
2. answer or make only the smallest authorized edit;
3. run the nearest focused check;
4. return the compact result;
5. stop.

Do not expand an explanation, clear error, text/style adjustment, local type fix, settled configuration edit, or code-reading question into clarification, specification, planning, implementation, test, and review stages.

## One primary Skill

Activate one primary Skill per user request by default. A Skill may recommend one next Skill, but it must not execute or route to it unless the user explicitly asks for an end-to-end flow, consecutive analysis/implementation/validation, or automatic continuation. The Router recommends only and must never form a Router → Skill → Router loop.

## Progressive reference loading

Read only references required by the current risk and artifact:

- audit material only in `audit`;
- database material only for database work;
- release material only for release work;
- migration material only for migration work;
- Skill-specific checklists only when their named decision or evidence gap is present.

Do not preload every reference when a Skill starts.

User-directed verification deferral takes precedence over per-slice test timing. Record `verification_status: verification_deferred` and pending checks, continue safe authorized independent work, and retain all completion and safety gates. Existing valid evidence and authorization may be reused.
