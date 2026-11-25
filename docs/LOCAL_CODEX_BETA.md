# Try Repo Doctor Beta in an isolated Codex profile

[简体中文](LOCAL_CODEX_BETA.zh-CN.md)

This local preview uses the generated Codex engineering plugin with 27 Skills. The npm candidate retains all 34 public Skills. The local marketplace ID is `repo-doctor-beta-marketplace`, the display name is **Repo Doctor Beta**, and the installed selector is `repo-doctor@repo-doctor-beta-marketplace` at plugin version `0.14.0`. The stable marketplace stays in your normal profile.

Run the commands in a subshell from this checkout to isolate the Codex profile and the user-level Skill directory. The disposable project starts without project-level duplicate Skills.

```bash
(
  root="$PWD/dist/local-codex-beta"
  bin="/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"
  cd "$root/smoke-project" || exit
  export HOME="$root/home" CODEX_HOME="$root/profile"
  "$bin" plugin marketplace list
  "$bin" plugin list
)
```

The prepared profile already has the Beta plugin installed. For a fresh isolated profile, use the same command block with its own empty `HOME` and `CODEX_HOME`, then run these in the block.

```bash
"$bin" plugin marketplace add "$root/market-v0.12.0"
"$bin" plugin add repo-doctor@repo-doctor-beta-marketplace
"$bin" plugin list
```

Use `"$bin" login` in the isolated block if Codex asks for sign-in. Start `"$bin"` in that block and describe an ordinary development task. Exit the block and reopen Codex through your normal profile to use Stable. Avoid copied project Skills with the same names in the Beta test workspace.

The installed CLI's marketplace upgrade command rejects this market because its source is a local directory. The graphical button was not exercised. After regenerating and refreshing the local source, use the verified reinstall procedure inside the isolated block. These commands target only the Beta selector.

```bash
"$bin" plugin remove repo-doctor@repo-doctor-beta-marketplace
"$bin" plugin add repo-doctor@repo-doctor-beta-marketplace
"$bin" plugin list
```

The verification checked the installed version and compared the installed Skill files with the generated source. A passing local install grants no public release approval. [Stable release candidate](RELEASE_NOTES_0.12.0.md)
