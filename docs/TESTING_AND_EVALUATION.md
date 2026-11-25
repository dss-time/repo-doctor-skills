# Testing and Evaluation

Deterministic contract tests are not live-model routing accuracy. The former validate repository structure, references, permissions, transitions, and fixtures; only an observed manual run can measure model behavior.

## Deterministic gates

Run:

```bash
npm run validate
npm test
npm run build
npm run docs:check
npm run quality:check
npm run release:check
npm run doctor
```

`npm run workflow:validate` validates the unique canonical registry. `npm run test:workflow` includes three bilingual Golden Workflows. Golden fixtures must never be reported as live-model results.

## Change Guard preflight

Run `node --test scripts/test-change-guard.mjs` for Git behavior and `node scripts/measure-change-guard.mjs` for end-to-end CLI timing and state size. The [independent review](research/change-guard-independent-review.md) records the fixture, raw samples and current model-comparison blockers.

The existing 30-case preparation mode verifies synthetic fixtures and isolated Skill builds. It yields no model outcomes. Use the same Git setup, CLI availability, prompts, authorization and behavior-based scoring across native Codex and both Repo Doctor versions. Preserve the host's original usage fields and distinguish agent-run checks from post-run verification.

### Authenticated six-case A/B/C pilot

The six-case pilot ran with `gpt-6.2-sol` and low reasoning. Each arm passed 6/6 after offline adjudication of the same artifacts. Report interpretation and automatic invocation are separate measurements. The primary measurements preserve the host’s `tokenUsage.last` values, and the continuation records thread totals where available. Use `node scripts/change-guard-pilot.mjs --profile PATH --model MODEL_ID --output NEW_REPORT.json` with an officially signed-in isolated profile. `--case` and `--arm` select only missing or repeated observations. [Design, raw observations and adjudications](research/change-guard-live-pilot.md)

### Shared integration study

The first run yielded 14 usable turns and the follow-up yielded seven. The final candidate completed a baseline and check in three of four eligible turns. It skipped the shared-module case and left the low-risk edit light. The follow-up revised both the Skill instructions and the consent for local diagnostic state, so their individual effects are unknown. Reports retain cumulative and last-turn tokens, tool counts and elapsed time. [Design, metrics, raw observations and limits](research/change-guard-integration.md)

The frozen candidate retried the public-module, existing-edits and protected-path cases. Each stopped before any tool call with `usageLimitExceeded`, leaving the count at 21 usable observations. An offline business assertion can establish the fixture outcome. Agent-run verification and report handling need their own evidence. [Retry record](../tests/reports/change-guard-0.12.0-freeze-retest-2026-11-24.json)

## Offline live-model preparation

The default commands do not use the network, read API keys, upload prompts, upload code, or create model output:

```bash
npm run eval:prepare
npm run eval:validate
npm run eval:report
```

Without an observed result, the report must say `UNKNOWN`. To prepare a file outside the repository:

```bash
npm run eval:prepare -- --output /safe/local/path/eval-plan.json
```

Execute each case manually in Codex, Claude Code, Cursor, Qwen, Kimi, or a generic ChatGPT Skill. Record the exact platform and model version, repository commit, Pack version, actual route/workflow, files and commands, permission or forbidden actions, stop-condition behavior, evaluator, timestamp, and evidence. Never include credentials, private code, personal data, or raw confidential conversations.

Validate and report an observed file:

```bash
npm run eval:validate -- --input /safe/local/path/observed.json
npm run eval:report -- --input /safe/local/path/observed.json
```

The report computes Top-1 and acceptable routing accuracy, missed and false-trigger rates, forbidden-Skill hits, permission violations, stop-condition compliance, bilingual consistency, workflow completeness, and handoff recovery. Partial runs remain `PARTIAL`.

## Reproduce the 328-case Codex evaluation

These commands make real, metered model calls using the host's existing authentication. Use a temporary empty Git workspace and install Full Skills into `<temporary-skill-home>/skills` first. Generate the current inventory with `npm run release:inventory` before starting. The explicit model must match across both phases:

```bash
node scripts/live-codex-validation.mjs --workspace <temporary-git-workspace> --skill-home <temporary-skill-home> --model gpt-6.1-sol --output tests/reports/live-codex-core-validation-0.8.0.json
node scripts/live-codex-advanced-validation.mjs --workspace <temporary-git-workspace> --skill-home <temporary-skill-home> --model gpt-6.1-sol --base-report tests/reports/live-codex-core-validation-0.8.0.json --output tests/reports/live-codex-skill-validation-0.8.0.json
```

The core phase contains 205 cases; advanced validation adds 44 bilingual workflow steps, 65 mode/verdict cases and 14 permission cases. For quota or service interruptions, preserve the original core report and add `--resume-report <saved-core-report.json>` to the first command. Resume requires identical version, model, fixtures and installed Skill hashes; semantic failures require review. Advanced service-only mode/permission retries use the existing `--retry-service-failures --base-report <saved-328-case-report.json>` option. Preserve original attempts and never report unexecuted cases as passed.

Reports record per-case model and token usage when supplied by the service. These fixtures assess structured routing, workflow artifacts, declared modes and permission boundaries; they do not establish production task effectiveness. Host authentication and capability metadata can remain visible despite isolated Skill roots and SQLite state.
