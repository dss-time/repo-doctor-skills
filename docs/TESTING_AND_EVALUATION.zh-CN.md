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

## Change Guard 预检

运行 `node --test scripts/test-change-guard.mjs` 验证 Git 行为，运行 `node scripts/measure-change-guard.mjs` 测量 CLI 端到端耗时和状态体积。[独立审查](research/change-guard-independent-review.md)记录夹具、原始样本及模型对照当前的阻碍。

现有 30 案例的准备模式核验合成夹具和隔离 Skill 构建。真实对照应在原生 Codex 和两个 Repo Doctor 版本之间统一 Git 初始状态、CLI 可用性、提示、授权与行为评分。保留宿主原始用量字段，并区分 Agent 运行的命令和事后裁判检查。

### 已认证六案 A/B/C 试验

六案固定为 `gpt-6.2-sol` 和 low 推理。对相同产物离线复核后，每组通过 6/6。报告解读与自动调用分别计量。主样本保留宿主 `tokenUsage.last`，续跑在可用时另存线程累计值。用官方已登录的隔离目录执行 `node scripts/change-guard-pilot.mjs --profile PATH --model MODEL_ID --output NEW_REPORT.json`。用 `--case` 和 `--arm` 仅选择缺失或需复测的观测。[方法、原始观测与复核记录](research/change-guard-live-pilot.md)

### 共享集成专项实测

初测有 14 条有效观测，复测有 7 条。复测 C 组四个适用任务中三个完成基线和检查，公共模块任务遗漏；低风险修改未调用。复测调整了 Skill 决策位置以及本地诊断状态授权，无法单独归因。两轮分别记录线程累计与 last Token、工具次数和耗时。 [设计、统计、原始记录与覆盖限制](research/change-guard-integration.md)

冻结候选补跑公共模块、已有修改和受保护路径三案。每轮都在工具执行前收到 `usageLimitExceeded`，没有新增有效模型样本。复用已有 21 条观测，禁止把离线业务断言通过当作 Agent 已执行验证或正确处理报告。 [原始补跑记录](../tests/reports/change-guard-0.12.0-freeze-retest-2026-11-24.json)

额度恢复后，原模型的三案均完成基线、检查和夹具断言，累计有效观测为 24 条。已有修改答复确认保留用户内容，受保护路径答复区分策略命中与实际授权，公共模块答复保留过滤器限制带来的 unknown。详细记录包含宿主统计与绑定范围。 [本轮记录](research/change-guard-integration.md#0120-local2-跨平台和模型实测)

新增的是六宿主安装验证。Skills CLI 1.9.0 的 12 个隔离安装均通过，Codex 另完成项目及个人发现检查。独立运行时结果与真实宿主自动调用分开统计。 [兼容性明细](AGENT_COMPATIBILITY.zh-CN.md)

协调器修订改变了候选绑定，简单任务和协调工作流重新通过。独立审查发现另一项检查点恢复问题。既有 Change Guard 自然语言观测仍保留原绑定。 [协调复验](../tests/reports/coordination-0.12.0-beta.1-p1-retest-2026-11-25.json)

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
