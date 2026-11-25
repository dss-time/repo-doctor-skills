# 在临时 Git 仓库试用 Change Guard

[English](change-guard-demo.md)

在当前 Repo Doctor 源码目录中，用带有 Node 和 Git 的 POSIX Shell 执行。示例创建独立的临时仓库。

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

实跑报告的状态为 `violation`。它提示 `src/button.mjs` 原本已有改动，指出 `package-lock.json` 和 `.env.fixture` 超出声明范围，并把敏感文件的指纹标为未知。结合实际差异判断授权范围及是否需要补充检查。报告保留改动来源为未知。示例保留原有用户注释，同时仍会给出已有改动被触及的提示。

当前候选四个可写工程 Skills 在社区安装目录和 Codex Plugin 中均携带运行时入口。宿主能够运行 Node 和 Git 且具备本地状态权限时，可按任务风险直接调用。这里的 CLI 用来复现和诊断。已发布的 0.11.1 npm CLI 早于 Change Guard。运行时不可用时，采用人工基线和最终差异核对，并说明未知覆盖。 [项目状态与覆盖限制](../PROJECT_STATE.zh-CN.md)
