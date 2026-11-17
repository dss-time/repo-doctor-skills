# 项目初始化、任务存档与安装诊断

[English](PROJECT_STATE.md)

这些开发命令可通过当前检出目录的 CLI 使用，已发布的 npm 0.10.1 尚未包含。原有 Skills 可继续单独使用，初始化为可选功能。命令输出 JSON，退出成功表示状态操作执行完成，证据是否有效以返回的 CURRENT、STALE、UNKNOWN 等状态为准。

## 项目初始化与复用

```sh
node bin/repo-doctor-skills.mjs project init --root .
node bin/repo-doctor-skills.mjs project init --root . --apply
node bin/repo-doctor-skills.mjs project check --root .
```

第一条仅预览。添加 `--apply` 才创建 `.repo-doctor/project.json`，以及默认忽略本地状态的 `.repo-doctor/.gitignore`。保留已有配置和用户忽略规则，操作系统支持时采用私有 JSON 文件权限。

配置记录包管理器脚本引用、已存在文档位置和相关清单、锁文件、仓库约定的指纹，保存内容不包含脚本正文、环境变量或凭据。CMake、Make、Cargo、Go、Python 等非 Node 清单也会记录指纹，但不猜测执行命令。`environment_safety` 始终为 `unverified`，指纹匹配不能证明命令运行安全。

来源变化后，`project check` 返回 `STALE` 及变化的相对路径。检查当前定义后显式刷新，修订号取前一步实际输出：

```sh
node bin/repo-doctor-skills.mjs project refresh --root . --revision 1
node bin/repo-doctor-skills.mjs project refresh --root . --revision 1 --apply
```

刷新默认预览，写入前在锁内再次检查修订号。状态路径拒绝越界和内部符号链接，项目绑定实际根目录，复制或移动状态后需要显式重新初始化或迁移。配置字段不授予宿主权限。

## 持久化任务与安全续接

```sh
node bin/repo-doctor-skills.mjs task create --root . --id export-fix --goal "修复已批准的导出行为" --acceptance export-correct --skill safe-fix-implementation
node bin/repo-doctor-skills.mjs task list --root .
node bin/repo-doctor-skills.mjs task resume --root . --id export-fix
```

也可用 `--workflow bug-repair` 替换 `--skill` 选择注册工作流。任务存入 `.repo-doctor/tasks/<id>.json`，ID 使用小写字母、数字和连字符。创建和枚举不会执行任务。

宿主完成已授权阶段后，可保存真实 Task Context v2。输入文件仅包含原始 `context` 对象，修订号取当前存档：

```sh
node bin/repo-doctor-skills.mjs task save --root . --id export-fix --input checkpoint.json --revision 1
```

保存前核对身份、结构、注册表兼容性和修订号，保留历史，并从 scope.files 和 evidence 收集依赖指纹。依赖覆盖不足时保持未知。拒绝更新或原子写入失败时保留已有记录，协作进程使用项目锁，修订号也能拦截过期更新。

`task resume` 复用既有协调核心，将 running 阶段恢复为 interrupted，清空旧 next_actions，不恢复宿主授权或可信证据。返回恒包含 `requires_host_revalidation: true`，状态为 `UNKNOWN` 或 `STALE`，不证明完成。注册表变化时返回迁移信息，不恢复上下文。宿主续接前仍须核对实际副作用、当前授权和真实凭据，特别是中断写入不能自动重放。CLI 提供发现入口和可检查存档，跨会话自动唤醒需要宿主接入。

## 安装来源与升级诊断

自带安装器将本次选中 Skill 的记录放在目标旁，例如名为 `skills` 的目标对应 `.repo-doctor-skills.json`，Skills 目录内部继续只包含 Skill 子目录。记录来源、包版本、语言和内容指纹，保留未选中条目。同名覆盖、相同跳过及整批失败回滚继续支持，清单提交失败也会触发该批回滚。

```sh
node bin/repo-doctor-skills.mjs installations check --target-dir .agents/skills
```

可重复 `--target-dir` 检查多个明确位置。省略时只读检查项目与用户常规 `.agents/skills`、`.codex/skills` 位置，全程不写入、不联网。插件缓存或自定义布局需要显式提供实际 Skill 目录。报告包括：

- 有记录安装的原始内容、用户修改及缺失状态。
- 没有有效清单的未知来源，包括第三方安装器复制的内容。
- 不同位置的重复名称及内容相同、不同或未验证。
- 两个合并入口和六个已移除办公 Skill 的迁移提示。
- 无效清单、不安全链接和未验证内容，不据此认领所有权。

清单是本地记录，不能证明加密来源。诊断不删除、认领或覆盖未知安装。处理迁移提示前核对自定义内容与安装方式，外部安装器及插件更新器也不会自动写入本 CLI 的清单。

## 失败与验证

锁占用时明确报错，不自动删除旧锁。中断后先核对原进程和状态，再由用户处理已确认废弃的锁。文件写入使用临时普通文件、原子重命名、协作锁和修订号；不遵守锁的外部编辑器仍需宿主核对冲突。

`npm run test:state` 验证状态和 CLI，`npm run test:ux` 验证安装回滚，安装包测试覆盖相同公开命令及自包含运行数据。这些命令不执行存储的验证脚本，不安装项目依赖，不迁移数据或访问生产。
