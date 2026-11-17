# Repo Doctor Skills 0.11.0

正式稳定版发布目标，日期 2026-11-17，标签 `v0.11.0`。

## 主要变化

- 新增 `multi-agent-workflow`，按任务独立性、授权及宿主原生能力选择 single 或 multi。原有 Skill 仍可单独使用，默认推荐 7 项保持不变。并发写入需要隔离工作区，由主 Agent 核验并集成。
- 新增可选的 `project init/check/refresh` 与 `task create/list/save/resume`。初始化先预览后应用；修订号和来源指纹保护本地状态。续接须由宿主重新核对，不恢复执行授权。
- 新增只读 `installations check`，诊断受管理内容、重复安装和迁移。安装器以事务记录选中 Skill，保留未选中项，记录失败时回滚同名替换。
- 实施、修复、测试及文档写入前按目标范围适配项目规范，核对目录指令、相关配置继承和局部风格。不执行配置代码发现规则、不格式化无关文件、不静默保存个人偏好。
- 分发 34 个 Skill，其中 Repo Doctor 27 个，提供 34 个 ChatGPT ZIP。npm 包内置项目运行数据，无需开发依赖。

## 验证

Live-model 验证 PASS：当前源码在 gpt-6.1-terra 上完整通过 289/289 案例；新的单点修改、串行恢复及独立核心审查通过。六项用户项目安全案例和十一项由发布主 Agent 核对的语义案例通过。完整 npm 测试、打包 CLI、双语构建和文档检查通过，打标签前检查远端 CI，详见[验证记录](RELEASE_VALIDATION_0.11.0.md)。

不使用 0.10.0/0.10.1 历史模型报告证明新增内容。早期原生多 Agent 开发试验保留其原始绑定与局限，不改写为当前版本试验。不宣称统一 Token 节省比例、硬件或跨客户端运行验证。

## 安装与升级

```sh
npx repo-doctor-skills@0.11.0 install --agent codex
npx repo-doctor-skills@0.11.0 install --preset full --agent codex
npx repo-doctor-skills@0.11.0 install --skill multi-agent-workflow --agent codex
```

重复安装替换选中的同名 Skill（包括本地自定义），内容相同则跳过，未选中项保留。升级前核对自定义内容。较早版本被删除或合并的目录须检查后手动清理：requirements-to-spec 改用 requirements-clarification，spec-to-work-items 改用 safe-change-plan。不自动删除未知安装。

项目初始化和任务存档始终可选，单独调用原 Skill 不要求初始化或多 Agent 模式。实际工具、强制沙箱和自动触发由宿主决定。
