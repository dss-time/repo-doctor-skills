# 在隔离配置中试用 Repo Doctor Beta

[English](LOCAL_CODEX_BETA.md)

此本地市场使用生成的 Codex 工程插件，包含 27 个 Skills。npm 候选仍包含全部 34 个公开 Skills。市场 ID 为 `repo-doctor-beta-marketplace`，显示名称为 **Repo Doctor Beta**。安装选择器为 `repo-doctor@repo-doctor-beta-marketplace`，插件版本为 `0.14.0`。稳定版市场保留在日常配置中。

从此仓库在子 Shell 中执行以下命令，隔离 Codex 配置和个人 Skill 目录。临时测试项目没有同名项目级 Skills。

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

已准备好的隔离配置已经安装 Beta。新建配置时，使用自己的空 `HOME` 和 `CODEX_HOME`，并在相同命令块内执行以下命令。

```bash
"$bin" plugin marketplace add "$root/market-v0.12.0"
"$bin" plugin add repo-doctor@repo-doctor-beta-marketplace
"$bin" plugin list
```

如需登录，在隔离命令块内使用 `"$bin" login`。在同一命令块内启动 `"$bin"`，直接用自然语言描述开发需求。退出命令块并通过日常配置启动 Codex，即可切回稳定版。Beta 测试项目应避免另有同名 Skills。

当前 CLI 的“升级市场”命令实际拒绝这个本地目录市场。图形客户端按钮未实点。重新生成并刷新本地来源后，在隔离命令块内使用以下已验证的重装操作。命令只作用于 Beta 选择器。

```bash
"$bin" plugin remove repo-doctor@repo-doctor-beta-marketplace
"$bin" plugin add repo-doctor@repo-doctor-beta-marketplace
"$bin" plugin list
```

已核对安装版本并逐文件比较安装结果与生成来源。本地安装通过不代表公开发布验收通过。 [正式版候选状态](RELEASE_NOTES_0.12.0.zh-CN.md)
