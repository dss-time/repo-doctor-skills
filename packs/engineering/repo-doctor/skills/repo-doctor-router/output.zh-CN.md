# 输出契约

默认 `fast` 输出：

```text
推荐：$<skill-name>
原因：<一句话>
模式：fast | standard | audit
需要：<最小输入>
```

`standard` 或用户要求详细信息时，增加分类、workflow ID、当前阶段、前置条件、权限门禁、停止条件、后续 Skill 和一个替代路径。`audit` 再增加注册表/版本核验、active 清单证据、被拒绝候选、平台 alias 能力和未解决不确定性。

不得执行推荐，也不得把未核验 Skill 声称为可用。
