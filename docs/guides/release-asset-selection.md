# Release Asset Selection Guide

Use this guide to choose one published Repo Doctor Skills asset without inventing an aggregate package or mixing ChatGPT and Codex installation paths.

## Release inventory

v0.6.0 publishes 40 assets:

- 37 versioned single-Skill ChatGPT ZIPs: 27 `rd-*`, 8 `pt-*`, and 2 `sm-*`;
- `Repo-Doctor-Skills-v0.6.0-RELEASE_NOTES.md`;
- `Repo-Doctor-Skills-v0.6.0-RELEASE_MANIFEST.txt`;
- `SHA256SUMS-v0.6.0.txt`.

The three Document Data Doctor Basic Skills participate in the seven regular platform builds but do not have standalone plugins or ChatGPT ZIPs. There is no all-Skills ZIP.

## Choose a single Skill ZIP

The filename identifies both the distribution family and the version:

| Need | Release asset | Canonical Skill |
|---|---|---|
| Route an engineering request | `rd-repo-doctor-router-v0.6.0.zip` | `repo-doctor-router` |
| Diagnose a qualified non-CI runtime bug | `rd-bug-root-cause-analysis-v0.6.0.zip` | `bug-root-cause-analysis` |
| Review a code change | `rd-safe-code-review-v0.6.0.zip` | `safe-code-review` |
| Analyze architecture friction | `rd-architecture-deepening-analysis-v0.6.0.zip` | `architecture-deepening-analysis` |
| Draft an evidence-aware report | `pt-report-writer-v0.6.0.zip` | `report-writer` |
| Review a Word or general document | `pt-document-review-v0.6.0.zip` | `document-review` |
| Review a PDF | `pt-pdf-review-v0.6.0.zip` | `pdf-review` |
| Clean Excel or other spreadsheet data | `pt-spreadsheet-data-cleaning-v0.6.0.zip` | `spreadsheet-data-cleaning` |
| Create a presentation outline | `pt-presentation-outline-v0.6.0.zip` | `presentation-outline` |
| Author a repository-standard Skill | `sm-skill-authoring-v0.6.0.zip` | `skill-authoring` |
| Audit Skill release quality | `sm-skill-quality-audit-v0.6.0.zip` | `skill-quality-audit` |

Other assets follow the same published naming rule:

- `rd-<repo-doctor-slug>-v0.6.0.zip`;
- `pt-<productivity-slug>-v0.6.0.zip`;
- `sm-<skill-maintainer-slug>-v0.6.0.zip`.

Upload one of these ZIPs through the ChatGPT Skill interface when you need one personal Skill. The prefix prevents collisions in a growing web Skill library; it does not change the canonical repository slug.

## Single-Skill ZIP versus plugin

Use a single ZIP when:

- one ChatGPT Skill is sufficient;
- you want the smallest upload surface;
- you do not need plugin-level installation or discovery.

Use a plugin when:

- you want a complete Pack;
- you want Codex plugin discovery and canonical `$skill-name` invocation;
- you want to upgrade the Pack through one version-pinned marketplace source.

The repository publishes three plugins: `repo-doctor`, `productivity-toolkit`, and `skill-maintainer`. Document Data Doctor has no standalone plugin.

## ChatGPT ZIPs and Codex

The versioned ZIP assets are ChatGPT upload packages. Do not pass a ZIP filename to `codex plugin marketplace add`, and do not describe direct ZIP import as a supported Codex plugin installation.

For Codex, use one of the repository-supported paths:

1. install a complete plugin from the tagged marketplace source; or
2. check out the trusted tag, run `npm run build`, and use the generated `dist/codex-zh-CN/skills/<slug>/` directory through the host's documented Skills installation path.

Stable marketplace source:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref v0.6.0
```

Development source, only for testing the latest `main`:

```bash
codex plugin marketplace add dss-time/repo-doctor-skills --ref main
```

The current Codex CLI supports `--ref` for Git marketplace sources.

<a id="verify-release-metadata"></a>
## Verify the Release Manifest and SHA-256

Download the selected ZIP together with the formal metadata assets:

```bash
gh release download v0.6.0 \
  -R dss-time/repo-doctor-skills \
  -p 'rd-repo-doctor-router-v0.6.0.zip' \
  -p 'Repo-Doctor-Skills-v0.6.0-RELEASE_MANIFEST.txt' \
  -p 'SHA256SUMS-v0.6.0.txt'
```

`SHA256SUMS-v0.6.0.txt` covers all 37 Skill ZIPs. If only one ZIP is present locally, verify that file against its matching line:

```bash
expected=$(awk '$2 == "rd-repo-doctor-router-v0.6.0.zip" { print $1 }' SHA256SUMS-v0.6.0.txt)
actual=$(shasum -a 256 rd-repo-doctor-router-v0.6.0.zip | awk '{ print $1 }')
test -n "$expected" && test "$expected" = "$actual"
```

To verify the complete remote Release, use the repository verifier:

```bash
npm run release:verify-remote -- --tag v0.6.0
```

The verifier downloads the actual Release to an operating-system temporary directory, checks the remote asset list and GitHub digests, compares the Manifest and SHA-256 file, tests every ZIP, validates Skill identity and bilingual content, rejects unsafe paths, repository/build debris, and credential patterns, and removes the temporary directory. A network failure returns `BLOCKED_NETWORK`, never PASS.

## Pin, upgrade, and avoid conflicts

- Pin stable use to `v0.6.0`; use `main` only for deliberate development testing.
- Before upgrading, record which plugin or individual ZIPs are installed and verify the replacement assets.
- Replace the existing version of the same Skill through the host's supported interface instead of retaining parallel copies.
- Do not install both a plugin and manually copied Codex Skills with the same canonical slugs unless the host documents precedence and you have verified the result.
- Do not rename ZIP internals or canonical slugs. ChatGPT published names use `rd-`, `pt-`, or `sm-`; Codex plugin invocation uses the canonical slug.
- Start a new task after installation or upgrade so discovery does not reuse an older task snapshot.

Users upgrading from v0.4.0 do not need to migrate prompts or rename Skills. This patch changes documentation, version pinning, and Release verification only.
