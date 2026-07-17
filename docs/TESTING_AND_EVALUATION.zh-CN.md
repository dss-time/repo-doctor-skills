# 测试与评测

确定性契约测试不等于真实模型路由准确率。前者验证仓库结构、引用、权限、转换和 fixture；只有人工观察到的真实运行才能衡量模型行为。

## 确定性门禁

运行：

```bash
npm run validate
npm test
npm run build
npm run docs:check
npm run quality:check
npm run release:check
npm run doctor
```

`npm run workflow:validate` 校验唯一 canonical 注册表；`npm run test:workflow` 包含三组双语 Golden Workflow。不得把 Golden fixture 报告成真实模型结果。

## 离线准备真实模型评测

以下默认命令不联网、不读取 API Key、不上传 Prompt、不上传代码，也不生成模型输出：

```bash
npm run eval:prepare
npm run eval:validate
npm run eval:report
```

没有人工观测结果时，报告必须为 `UNKNOWN`。可在仓库外准备文件：

```bash
npm run eval:prepare -- --output /安全的本地路径/eval-plan.json
```

在 Codex、Claude Code、Cursor、Qwen、Kimi 或通用 ChatGPT Skill 中逐条人工执行。准确记录平台和模型版本、仓库 commit、Pack 版本、实际路由/工作流、文件与命令、权限或禁止动作、停止条件、评测人、时间和证据。不得记录凭据、私有代码、个人信息或原始机密对话。

验证和汇总人工结果：

```bash
npm run eval:validate -- --input /安全的本地路径/observed.json
npm run eval:report -- --input /安全的本地路径/observed.json
```

报告计算 Top-1 与可接受路由准确率、漏触发率、误触发率、禁止 Skill 命中、权限越界、停止条件合规、中英文一致性、工作流完整率和交接恢复成功率。部分运行保持 `PARTIAL`。
