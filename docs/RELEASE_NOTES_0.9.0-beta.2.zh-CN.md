# Repo Doctor Skills v0.9.0-beta.2 — Beta 发布候选

准备日期为 2026-11-03，tag 为 `v0.9.0-beta.2`。

Live-model 验证状态为 **UNKNOWN**，正在运行绑定本版源码的全量评测。

## 修改内容

- 自带 npm CLI 重复安装时默认替换选中的同名 Skill 目录，包括本地修改和旧资源。内容相同则跳过，批量安装失败时回滚。
- 性能评测从 canonical 清单读取路由选项与当前安装数量，独立观测历史基线的安装数量。
- 统一 17 个 Skill 的 Shell 工具需求与禁止 Shell 的权限，仓库理解明确使用原生只读文件 API。
- 新增权限回归检查，阻止 Shell 工具需求与权限矛盾。
- 保留 Node.js >=18 支持，增加 Linux、macOS、Windows 在 Node 18 和当前 LTS 下的安装 CI，Linux Node 18 同时验证 npm tarball。

- 已观察到的失败在环境信息缺失时继续阻止执行与交付，新增回归已验证能检出原缺陷。

## 组件

41 个有效 Skill、28 个 Repo Doctor Skill、13 条工作流和 38 个 ChatGPT ZIP。Repo Doctor Pack/插件为 0.11.1，Document Data Doctor Pack 为 0.1.1。

## 验证

本版实际结果见[验证记录](RELEASE_VALIDATION_0.9.0-beta.2.md)。全量语料及串行协作试运行报告需要绑定当前 canonical 源和完整安装运行时。

## 安装

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

GitHub 源包含当前候选版本。npm 已发布稳定版仍为 0.8.1，GitHub Release 发布后，npm 分发版本由独立发布流程更新。
