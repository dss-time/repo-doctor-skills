# Repo Doctor Skills v0.6.1 正式版

> 发布日期：2026-08-14。本兼容性补丁修复 skills.sh 的发现与分发。

## skills.sh 兼容性与分发修复

Repo Doctor Skills 现在提供根级生成式 `skills/` 兼容输出，严格包含全部 40 个 active Skill：

```bash
npx skills@latest add dss-time/repo-doctor-skills --list
```

该输出由 `packs/` 下的 canonical metadata 生成；`skills/` 不是第二套真源。确定性测试比较完整 canonical 与可分发 slug 集合，并拒绝缺失、额外、重复、fixture、生成漂移和 YAML 解析错误。

`safe-code-review` 的中英文 description 语义和精度完整保留，同时所有生成 YAML description 都使用标准 parser 可接受的引号。`wrong-name`、`valid-skill` 等测试 fixture 继续用于确定性测试，但不会进入公开发现边界。

现有 npm 默认体验保持不变：

```bash
npx repo-doctor-skills install
```

Recommended 仍为 7/7，Full 仍为 40/40；npm tarball、Codex shared install、现有插件、权限和组件版本均不变。全部发布门禁与隔离 skills.sh 安装 smoke 均通过。

Live-model 验证继续通过已保存的 317/317 报告保持 **PASS**；本补丁只改变分发兼容性，不改变 Skill 路由行为。
