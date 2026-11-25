# Try Change Guard in a disposable Git repository

[简体中文](change-guard-demo.zh-CN.md)

Run this from the current Repo Doctor checkout in a POSIX shell with Node and Git. The example creates its own temporary repository.

```sh
rd_demo="$(mktemp -d)"
git -C "$rd_demo" init -q
mkdir -p "$rd_demo/src"
printf 'export const label = "Save";\n' > "$rd_demo/src/button.mjs"
printf '{}\n' > "$rd_demo/package-lock.json"
git -C "$rd_demo" add .
git -C "$rd_demo" -c core.hooksPath=.unused-hooks -c commit.gpgSign=false -c user.name=Demo -c user.email=demo@example.invalid commit -qm fixture

printf '// existing user edit\n' >> "$rd_demo/src/button.mjs"
node bin/repo-doctor-skills.mjs change begin --root "$rd_demo" --id demo --scope src/button.mjs --json

printf 'export const label = "Save changes";\n// existing user edit\n' > "$rd_demo/src/button.mjs"
printf '{"unexpected":true}\n' > "$rd_demo/package-lock.json"
printf 'APP_MODE=fixture\n' > "$rd_demo/.env.fixture"
node bin/repo-doctor-skills.mjs change check --root "$rd_demo" --id demo --json
```

The observed report had status `violation`. It warned that `src/button.mjs` already contained an edit, flagged `package-lock.json` and `.env.fixture` outside the declared scope, and gave the sensitive file an additional unknown fingerprint. Review the actual changes and decide whether their authorization or coverage needs clarification. The report leaves change ownership unknown. A warning can coexist with a preserved user edit, as this fixture shows.

The candidate's four writing Skills include the runtime entry point in the community installation tree and Codex plugin. With Node, Git and host permission, a Skill can invoke it when the task warrants it. The CLI here supports reproduction and diagnostics. The published 0.11.1 CLI predates Change Guard. If runtime execution is unavailable, use a manual baseline and final diff review and report the unknown coverage. [Project state and coverage limits](../PROJECT_STATE.md)
