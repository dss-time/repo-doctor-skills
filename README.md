**English** | [简体中文](./README.zh-CN.md)

# Repo Doctor Skills

Reliable AI coding skills that move fast on simple work and stay strict when risk matters.

Use focused Skills to diagnose bugs, review code, clarify requirements, make bounded fixes, test changes, and check release readiness without turning every task into a heavyweight process.

## Common problems it solves

- “This API sometimes returns 500. Where should I start?”
- “Review this change without editing it.”
- “Make this small fix and verify it.”
- “The requirement is vague. Help me close the important decisions.”

## Start in 30 seconds

Install the Recommended preset with one command:

```bash
npx repo-doctor-skills install
```

Not sure which Skill to use? Run `$repo-doctor-router`.

If you already know the Skill, invoke it directly—for example, `$safe-code-review`. The Router is optional and recommends only; it never runs the recommended Skill.

## Minimal example

**User**

```text
$repo-doctor-router

This API sometimes returns 500. I do not know whether to investigate first or edit it directly.
```

**Repo Doctor**

```text
Recommend: $bug-root-cause-analysis
Reason: This is a non-CI runtime failure whose cause should be verified before any fix.
Mode: fast
Needs: The error output and a minimal reproduction.
```

Then start a new turn with `$bug-root-cause-analysis` and provide that evidence. Repo Doctor does not chain Skills automatically.

## Recommended

The default preset installs these seven high-frequency Skills:

- `$repo-doctor-router` — optional fallback when the next Skill is unclear;
- `$requirements-clarification` — closes material ambiguity before implementation;
- `$bug-root-cause-analysis` — diagnoses non-CI runtime failures read-only;
- `$safe-fix-implementation` — makes one scoped, authorized production fix;
- `$safe-test-implementation` — adds one explicitly authorized test or regression guard;
- `$safe-code-review` — reviews a concrete diff without fixing it;
- `$decision-prototype` — explicitly builds disposable evidence for one uncertain decision.

This set covers the common path from uncertainty to diagnosis, change, test, and review while keeping specialist security, database, migration, release, and maintenance Skills out of the default install. It is only an installation preset: every Skill still comes from its existing source and keeps its original permissions, safety gates, and execution profile.

Installation ends with the next input to try:

```text
Repo Doctor Skills installed.

Installed: 7 Skills
Preset: Recommended
Target: <your shared Skills directory>

Try:

$repo-doctor-router
I don't know which Skill to use.
```

With no reliable Agent-specific signal, the installer uses the shared `~/.agents/skills` location and prints the exact target. It never chooses an Agent merely because a directory exists.

## Full

Install all 40 active Skills into the same Codex Skill directory:

```bash
npx repo-doctor-skills install --preset full
```

Why the counts differ: this repository has 40 active Skills across four source collections. The **Repo Doctor** plugin contains its 27 engineering Skills; the three current plugins contain 37 Skills in total; the remaining three Document Data Doctor Skills are available in regular platform builds and the Full source installer, but not in a standalone plugin. Full therefore means all 40 Skills supported by this Codex directory installation, without changing the existing plugin boundaries.

## Install via skills.sh

The Repo Doctor CLI above remains the recommended default installation experience. For skills.sh ecosystem discovery or installing an individual Skill, use the additional distribution entrypoint:

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

List the 40 active distributable Skills with `--list`, or select one with `--skill <slug>`.

## Choose by problem

| Problem | Start with |
|---|---|
| Bug or intermittent runtime failure | `$bug-root-cause-analysis` |
| Make a scoped code change | `$safe-fix-implementation` |
| Review a diff | `$safe-code-review` |
| Clarify an ambiguous requirement | `$requirements-clarification` |
| Turn decisions into a specification | `$requirements-to-spec` |
| Test one uncertain design direction | `$decision-prototype` |
| Analyze growing architecture friction | `$architecture-deepening-analysis` |
| Check a candidate release | `$release-readiness-check` |
| Still unsure | `$repo-doctor-router` |

See [Problem → Skill](docs/guides/problem-to-skill.md) for copyable minimal requests.

## Execution modes

- **Fast** — Simple work: a few files, targeted validation, and a quick finish.
- **Standard** — Normal development: relevant modules, relevant tests, and enough evidence to support the result.
- **Audit** — Database, security, migration, and release work: complete evidence and permission gates.

Fast never means skipping safety. Audit is not imposed on every small issue. The selected Skill and the actual risk can always require a stricter mode.

## Versions

Project Release Version and Plugin / Pack Component Version describe different layers, so they do not have to match. The project release identifies the repository snapshot; component versions identify the individual distributed capability. See the [User Manual](docs/USER_MANUAL.md#7-update) for the verified update procedure.

## Documentation

- [User Manual](docs/USER_MANUAL.md)
- [Skill Catalog](docs/SKILL_CATALOG.md)
- [Advanced Usage](docs/ADVANCED_USAGE.md)
- [Contributing / Maintainer Guide](CONTRIBUTING.md)

## License

[MIT](LICENSE)
