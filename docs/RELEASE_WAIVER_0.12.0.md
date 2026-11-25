# v0.12.0 one-time release waiver

- stable release target: 0.12.0
- live model status: UNKNOWN
- maintainer waiver: explicitly authorized
- waiver scope: v0.12.0 only
- waiver scope identifier: live-model-and-coordination-status-only
- candidate commit: 3921cdd0ea93295f03e7a8d70f2b1080d92c6b81
- candidate tree: 6d5e9b0401e3408fe7afe27e9b4116cdc5595013

The isolated Codex host exhausted its model quota. The missing live-model and independent coordination reports are therefore recorded as UNKNOWN and BLOCKED, not PASS. This waiver applies once to v0.12.0 and the candidate above. It does not waive deterministic tests, coordination regression tests, cross-platform CI, installation and upgrade checks, build integrity, source and artifact binding, metadata checks, security checks, or known blocking defects. Future versions require the original live-model and independent coordination gates.
