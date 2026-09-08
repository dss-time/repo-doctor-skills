# Repo Doctor Skills v0.7.0 正式稳定发布

2026-09-08 准备，目标 tag 为 `v0.7.0`。发布必须通过全部门禁，本文件不代表已经发布。

默认入口仍为 `npx repo-doctor-skills install`：Recommended 7/7，Full 40/40。重复安装跳过相同内容，从 Recommended 升级 Full 补齐缺少的 Skill；不同的本地内容需要显式 `--force` 才替换。

新增 `--skill safe-code-review` 单 Skill 安装，以及 `--language en|zh-CN|bilingual` 正文语言选择。默认双语，配套资源完整保留。未知、重复、缺少参数的选项在安装前拒绝。

简化新手入口，合并重复指南。常用 Skill 默认展示结论和关键证据，省略空字段；详细证据与命令账本仍可按需查看。已授权流程可在各 Skill 权限内继续，Router 仍只推荐。

项目版本为 0.7.0，Repo Doctor Pack/插件为 0.9.0。保持稳定 slug、权限元数据、专项职责和成熟度。skills.sh 保持 40/40，YAML 错误和 fixtures 为 0。正式资产仍为 37 个 standalone ZIP、RELEASE_NOTES、RELEASE_MANIFEST 和 SHA256SUMS。

历史 Live-model PASS 317/317 属于 v0.4.0，不代表本次提示词的新测量；当前候选验证与阻塞必须在发布前独立报告。不把文件缩短等同于 token、耗时或质量改善。

当前发布验证为 **NO_GO**，必须等待本次 v0.7.0 Live-model 证据通过。参见[本次验证记录](RELEASE_VALIDATION_0.7.0.md)。
