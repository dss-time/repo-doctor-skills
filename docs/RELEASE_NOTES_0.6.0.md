# Repo Doctor Skills v0.6.0 Stable Release

> Release date: 2026-08-11. This stable non-prerelease uses tag `v0.6.0` and introduces public one-command installation.

## Public one-command installation

Install the Recommended preset:

```bash
npx repo-doctor-skills install
```

The default installs seven high-frequency Skills and immediately suggests `$repo-doctor-router`:

```text
Repo Doctor Skills installed.

Installed: 7 Skills
Preset: Recommended
Target: <resolved Skills directory>

Try:

$repo-doctor-router
I don't know which Skill to use.
```

Install all 40 active Skills with:

```bash
npx repo-doctor-skills install --preset full
```

Advanced users can still use the existing Codex plugins, individual ChatGPT ZIPs, source builds, and platform-specific outputs.

## CLI behavior

- `install` defaults to Recommended without asking for a Pack, category, identifier, or Skill list.
- `--preset recommended` installs 7 Skills; `--preset full` installs 40.
- `--agent codex` and `--agent shared` explicitly select a supported Skills directory.
- `--target-dir` supports isolated or custom installs.
- existing selected Skills are not replaced unless `--force` is explicit.
- conflicting configured Codex/shared homes cause a zero-write exit.
- without a reliable Agent-specific signal, the CLI uses the shared `.agents/skills` home and prints the exact target.

## Package boundary

The npm package is a new public distribution layer. It contains only the executable bin, the runtime installer, 40 generated installable Skill assets, README, LICENSE, and package metadata. It excludes Git data, CI configuration, tests, benchmarks, caches, local configuration, development output, and secrets.

Project version `0.6.0` is independent from Pack, plugin, and individual Skill component versions. Repo Doctor Pack/plugin remains 0.8.0, Productivity Toolkit remains 0.1.0, Skill Maintainer remains 0.2.0, and Document Data Doctor remains 0.1.0.

## Reliability and safety

Skill core behavior is unchanged. No canonical slug, permission, security gate, execution mode, execution profile, workflow, Schema, Pack, plugin, adapter, or build contract was weakened or renamed. Fast still requires safety; writes still require their existing authorization boundaries; destructive actions remain disabled.

Live-model validation status remains **PASS** through the preserved 317/317 machine-readable routing report used by the stable release contract. v0.6.0 adds distribution and UX behavior, not new Skill routing claims.

## Verification

The release gate covers:

- schema, Skill, workflow, activation, permission, security, documentation, build, quality, and release metadata checks;
- public package metadata, executable bin, `npm pack --dry-run`, and tarball file allowlist;
- isolated tarball execution outside the Git checkout;
- Recommended 7/7 and Full 40/40 installation;
- `--help`, `--version`, agent targeting, custom targeting, collision refusal, `--force`, ambiguous-home zero-write behavior, post-install output, and cleanup;
- generated-output drift, absolute-path, secret-pattern, ZIP-integrity, manifest, checksum, main CI, tag CI, public npm smoke, and remote GitHub Release checks.

The GitHub Release continues to publish the existing 37 versioned standalone Skill ZIPs plus release notes, the Release Manifest, and `SHA256SUMS-v0.6.0.txt`. The npm distribution does not replace or remove those assets.
