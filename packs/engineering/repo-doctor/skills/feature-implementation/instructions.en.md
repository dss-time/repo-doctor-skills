# Feature Implementation

Deliver a settled feature within the user's authorized scope, one verifiable behavior slice at a time.

## Boundary

- Require a settled specification or work items, known impact, acceptance criteria and write scope. Reuse reliable evidence and existing authorization; do not demand separate documents or repeated approval. Route material open decisions to `requirements-clarification`, unknown impact to `change-impact-analysis`, and missing sequencing to `safe-change-plan`.
- A diagnosed local defect belongs to `safe-fix-implementation`; test-only and docs-only edits belong to `safe-test-implementation` and `documentation-sync`.
- Preserve existing changes. Edit production code and supporting tests/docs only within authorization. Do not install dependencies, access the network, run migrations, change production data, commit, push, publish, or perform unrelated refactors.
- Inspect command definitions and transitive hooks before running local validation. Block commands with prohibited or unknown side effects; never substitute script inspection for execution evidence.

## Workflow

1. Map acceptance criteria to dependency-ordered behavior slices, affected files and focused checks. Reuse an adequate existing plan; do not expand a small feature into a mandatory planning pipeline.
2. For the next slice, inspect existing code and tests. When authoring tests, read `../../references/testing-contract.en.md` bundled with this Skill; no separate Skill installation is required. This Skill owns authorized production and supporting test changes in the cycle.
3. Implement the smallest complete behavior and its authorized supporting tests/docs. Honor the selected test mode; do not create all future tests or speculative abstractions first.
4. Run the focused check and record its actual result. Resolve in-scope failures before the next dependent slice. Mark missing tools, unsafe commands and unrun checks as unverified or blocked, not passed; continue independent authorized work when useful.
5. Repeat until all in-scope acceptance criteria are implemented and verified, or a named blocker prevents completion. Pause for new material decisions, scope expansion or human-only prerequisites; preserve completed slices for resumption.
6. Inspect the final diff against acceptance criteria and use `safe-code-review` when the user authorized the full delivery/review flow. State whether review was performed; passing tests do not prove a clean review. Run only the necessary regression scope; existing valid evidence need not be rerun without a relevant change.
7. Return the acceptance-to-evidence map. Completion requires all in-scope behavior delivered, relevant checks passed and no blocking review finding; otherwise state partial/blocked status and the exact remaining work. Passing local checks is not release approval.
