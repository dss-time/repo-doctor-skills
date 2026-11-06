# Repo Doctor Skills 0.10.0

正式稳定版本，非预发布。Tag 为 `v0.10.0`，日期为 2026-11-06。

- 共 33 个 Skill，Repo Doctor 26 个、Productivity Toolkit 5 个、Skill Maintainer 2 个。
- 删除 6 个 PDF、Word、Excel Skill；requirements-to-spec 合并至 requirements-clarification，spec-to-work-items 合并至 safe-change-plan。旧工作流请改用合并后的入口。
- 保留重复安装覆盖同名 Skill、内容相同时跳过以及失败回滚。
- 按实际语言、运行时与组件选择安全规则，支持已有授权与证据复用、用户明确要求的延期验证。
- 加强原有权限/业务行为、已有数据、测试/构建隔离及用户已有/并发修改的保护。
- 完善凭据扫描、真实模型输出与工具尝试记录、断点恢复和报告绑定。保留有回归价值的测试，清理已失效检查点及重复报告。

发布前须完成绑定最终源码和分发文件的 Live-model PASS 评测。此前开发阶段已完成 gpt-6.1-sol 312 个计分案例，全部通过。正式发布记录见 tests/reports/live-codex-skill-validation-0.10.0.json 和 tests/reports/coordination-release-0.10.0.json。

验证使用隔离合成项目及模型指令评测，真实后端、硬件与全部客户端/框架集成仍需各自验证。项目稳定版本与组件成熟度独立管理。

```sh
npx repo-doctor-skills@0.10.0 install --agent codex
npx repo-doctor-skills@0.10.0 install --preset full --agent codex
npx repo-doctor-skills@0.10.0 install --skill safe-fix-implementation --agent codex
```

GitHub Release 提供 33 个独立 Skill ZIP、发布说明、绑定提交的清单及 SHA256 校验文件。npm 仅分发 CLI 与独立运行资源，仓库测试和历史报告不进入 npm 包。
