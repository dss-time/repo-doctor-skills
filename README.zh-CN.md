[English](./README.md) | **简体中文**

# Repo Doctor Skills

用职责明确的 Skill 排查 Bug、审查代码、完成修复和测试。

## 30 秒开始

```bash
npx repo-doctor-skills install
```

## 最小示例

```text
$safe-code-review 审查当前修改。
```

不知道选哪个时，使用 `$repo-doctor-router`。它只推荐；知道 Skill 名时直接调用。

## 推荐安装

默认安装 7 个高频 Skill：

| 任务 | Skill |
|---|---|
| 选择能力 | `$repo-doctor-router` |
| 澄清需求 | `$requirements-clarification` |
| 排查 Bug | `$bug-root-cause-analysis` |
| 实施修复 | `$safe-fix-implementation` |
| 编写测试 | `$safe-test-implementation` |
| 审查代码 | `$safe-code-review` |
| 验证方案 | `$decision-prototype` |

安装器打印实际目标。重复安装跳过相同内容；不同内容需要显式使用 `--force` 才替换。

## 完整安装

安装全部 40 个 Skill，也可从 Recommended 原目录升级：

```bash
npx repo-doctor-skills install --preset full
```

## 单个 Skill 与语言

```bash
npx repo-doctor-skills install --skill safe-code-review
npx repo-doctor-skills install --language zh-CN
```

正文默认双语，可选 `en`、`zh-CN`、`bilingual`；单语言安装仍保留全部配套资源。

## skills.sh

```bash
npx skills@latest add dss-time/repo-doctor-skills
```

使用 `--list` 查看 40 个 Skill。该外部 CLI 的 Node 要求由其自身版本决定。

## 文档

- [问题 → Skill](docs/guides/problem-to-skill.zh-CN.md)
- [用户手册](docs/USER_MANUAL.zh-CN.md)
- [Skill 目录](docs/SKILL_CATALOG.zh-CN.md)
- [高级用法：插件、平台、版本与源码构建](docs/ADVANCED_USAGE.zh-CN.md)
- [贡献指南](CONTRIBUTING.md)

[MIT](LICENSE)
