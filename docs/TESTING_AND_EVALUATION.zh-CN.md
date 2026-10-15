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

## 复现 328 项 Codex 真实评测

以下命令使用宿主现有认证，产生真实模型调用并消耗额度。先准备空的临时 Git 工作区，并将 Full Skills 安装到 `<临时技能目录>/skills`；开始前运行 `npm run release:inventory` 生成当前清单。两个阶段必须显式使用相同模型：

```bash
node scripts/live-codex-validation.mjs --workspace <临时Git工作区> --skill-home <临时技能目录> --model gpt-6.1-sol --output tests/reports/live-codex-core-validation-0.8.0.json
node scripts/live-codex-advanced-validation.mjs --workspace <临时Git工作区> --skill-home <临时技能目录> --model gpt-6.1-sol --base-report tests/reports/live-codex-core-validation-0.8.0.json --output tests/reports/live-codex-skill-validation-0.8.0.json
```

核心阶段为 205 项；高级阶段增加 44 个双语工作流步骤、65 项模式/判定和 14 项权限用例。遇到额度或服务阻塞时先保留原核心报告，再为第一条命令增加 `--resume-report <已保存核心报告.json>`。续跑要求版本、模型、用例和安装的 Skill 哈希相同；语义失败必须先审查。高级阶段中仅由服务引起的模式/权限失败可使用已有的 `--retry-service-failures --base-report <已保存328项报告.json>`。保留原尝试，不将未执行项报告为通过。

报告在服务提供数据时记录逐项模型和 token 用量。这组用例验证结构化路由、工作流产物、声明的模式和权限边界，不代表生产任务效果。隔离 Skill 根和 SQLite 状态后，宿主认证及能力元数据仍可能可见。
