# 快速开始

## 1. 安装

```bash
npx repo-doctor-skills install
```

默认安装 7 个常用 Skill。安装完成后查看打印的目标路径，在支持 Skills 的助手中新建任务。

## 2. 提出请求

```text
$safe-code-review 审查当前修改。
```

直接描述任务即可，无需指定执行模式。不知道选哪个时使用 `$repo-doctor-router`。

## 3. 查看结果

审查会报告有证据的问题和相关限制；修复请求会报告实际修改与验证结果。需要完整证据时再要求详细输出。

## 需要更多

- [按问题选 Skill](guides/problem-to-skill.zh-CN.md)
- [用户手册](USER_MANUAL.zh-CN.md)
- [全部能力](SKILL_CATALOG.zh-CN.md)
- [明确需要多步骤时](WORKFLOW_COOKBOOK.zh-CN.md)
- [源码构建与其他平台](ADVANCED_USAGE.zh-CN.md)
- [版本与生命周期](VERSIONING.zh-CN.md)

源码维护需要先安装开发依赖；普通 npm 用户不需要克隆或构建仓库。
