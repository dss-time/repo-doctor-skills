# Repo Doctor v0.12.0 stable release candidate

[简体中文](RELEASE_NOTES_0.12.0.zh-CN.md)

The target is a stable release. The public release remains at v0.11.1 pending candidate checks. The existing gate requires Live-model validation PASS and a successful independent coordination review bound to this version.

- Use natural language for scoped development work. Eligible writing Skills can compare a local Git baseline with the final worktree and report existing edits, scope changes and protected paths.
- Checkpoint recovery reconciles attested failures recorded after the saved checkpoint. The host confirms history completeness and retains unresolved failures until a qualifying rerun or proven input change. Retry authority applies to the exact import and worktree. Changing an optional condition cannot erase a failed stage.
- The npm CLI uses project version 0.12.0. The engineering Pack and Codex plugin use their own version, 0.14.0. The isolated local preview does not set a public version or a release tag.
- Six Agent installation routes have installer evidence. Native automatic invocation and report handling have been observed in Codex. Other hosts still need native verification. Guard reports are advisory and Git-visible. Focused business checks remain necessary.

[Install and upgrade](AGENT_COMPATIBILITY.md) · [User examples](guides/repo-doctor-scenarios.md) · [Benchmark](TESTING_AND_EVALUATION.md)
