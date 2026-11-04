# v0.9.0 稳定版等价晋升验证

日期为 2026-11-04，时区为 Asia/Shanghai。维护者明确要求将已发布 Beta 晋升为稳定版。

源版本为 0.9.0-beta.2，源提交为 11006f2e66bed5f0f4d2e0d5912f01d59d6ed852。晋升记录见 tests/reports/release-promotion-0.9.0.json。

- 完整 packs/skills 内容与源 Beta 的 SHA-256 绑定一致。
- 已发布 CLI 和安装器字节一致，package manifest 只有项目版本变化。
- 复用源 Beta 的 328/328 模型结果及串行协作报告，原报告保留 Beta 版本号及原始摘要。
- 本次没有重新运行模型语料。等价性、原始报告、安装器或清单发生变化时，晋升门禁拒绝复用。
- 原有非阻塞 P2 继续披露，依赖覆盖不完整时可能保守阻止恢复。
- 本次重新运行稳定版打包、安装、完整工程检查、跨系统 CI 和远端发布资产校验。

实际发布与 CI 以 GitHub Actions 和 npm registry 的成功记录为准。
