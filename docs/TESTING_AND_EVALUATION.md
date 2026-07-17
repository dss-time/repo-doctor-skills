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
