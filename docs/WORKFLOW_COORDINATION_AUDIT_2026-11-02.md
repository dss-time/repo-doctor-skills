# 协调核心独立审查与 Codex 真实试运行

日期：2026-11-02（Asia/Shanghai）。结论：**NOT READY**。发现并复现 5 项 P1、1 项 P2；真实功能路径已跑通，但只读 Skill 的 Shell 权限合规检查未通过。本次未修改协调核心及其既有分发副本，只新增审查/试运行工具、对抗用例和证据报告。

机器汇总：[summary.json](../tests/reports/coordination-audit-PNTYvH/summary.json)。可重复的本地对抗审查：`node scripts/audit-workflow-coordination.mjs`，当前按预期退出 1，表示仍存在发现，不是通过。原有 24 项集成测试仍全部通过，因此不能将该基线当作恢复与授权边界已经充分覆盖的证明。

## 独立性与审查范围

先独立检查仓库符合度、原始意图忠实度、运行安全三个轴，再合并同因问题。另启动全新 Codex 只读会话，仅提供核心源码、契约、需求协议和既有测试副本，不预先告知本地发现。该会话给出六项问题；逐项通过本地临时目录或内存探针复核。未修改真实项目业务文件、未发布、未提交。

独立 Codex 输出：[原始报告](../tests/reports/coordination-live-jNm920/report.json)。这里的原报告 PASS 仅表示试运行脚本观察到了审查会话完成和文件未修改，**不表示被审查核心无缺陷，也不表示权限检查通过**。工具事件复核发现其使用了 Shell，后续[权限评估](../tests/reports/coordination-live-jNm920/permission-assessment.json)优先用于权限合规结论。

CLI 版本：`codex-cli 0.166.0-alpha.5.1`。沿用用户现有配置，未指定替代模型；CLI 事件没有报告服务端实际模型标识，不据本机配置推断最终模型。

## 已复现的核心问题

| 级别 | 位置 | 具体问题与影响 | 最小修复方向 |
|---|---|---|---|
| P1 | [核心:300](../packs/engineering/repo-doctor/references/workflow-coordination.mjs#L300) | 写操作部分完成后进入 `validation_failed`，`reopen` 不要求核对副作用，下一动作直接成为 `execute`，可能重复非幂等写入。 | 将副作用状态与验证状态分离；失败写尝试也需按具体 attempt 核对后才能重试。 |
| P1 | [核心:185](../packs/engineering/repo-doctor/references/workflow-coordination.mjs#L185) | 可选条件先于中断检查处理；恢复成 `interrupted` 的写阶段，在条件变为 false 后被改成 `skipped`，未知副作用被掩盖。 | 先处理运行中/中断/不确定副作用，再允许条件跳过。 |
| P1 | [核心:94](../packs/engineering/repo-doctor/references/workflow-coordination.mjs#L94) | 单 Skill 阶段根据 `write_files: true` 一律推断为写阶段。需求澄清的 fast/standard 明明只读，正常只读请求却得到 `write_scope_missing`。 | 分开表示可用能力和本次必需操作；依据当前模式及宿主核验的正文限制确定操作范围。 |
| P1 | [核心:309](../packs/engineering/repo-doctor/references/workflow-coordination.mjs#L309) | 写操作已执行后恢复更早的 pending 检查点，模块无法识别检查点之后的已完成操作，直接返回 `execute`。 | 恢复时核对可信执行版本/attempt 记录；即使旧状态是 pending，也不能自动认为从未执行。 |
| P1 | [核心:202](../packs/engineering/repo-doctor/references/workflow-coordination.mjs#L202) | 阶段已完成后，当前请求路径从 A 改成未授权的 B，旧证据仍被接受并返回 `complete`；完成分支未比较当前 request binding。 | 阶段结果及复用资格绑定当前操作范围；范围变化重新检查授权、证据适用性和必要的副作用核对。 |
| P2 | [核心:51](../packs/engineering/repo-doctor/references/workflow-coordination.mjs#L51) | 任意非 `pass` 值都立即归为已观察失败；真实 `unknown` 得到 `failed / rerun`，旧失败也未先判断输入是否已变。 | 显式区分未知、历史失败、当前失败和失效；先判断适用性，不把缺失结果视为失败。 |

独立审查还指出 narrower Skill rules 不能只靠 capability metadata。当前协议本来将正文中的模式/目标约束交给可信宿主核验，因此没有把“故意违反正文的宿主仍返回 execute”另算成一个核心漏洞；但该宿主检查在真实接入中必须落实，不能仅写成约定。

本地探针只证明协调决策错误，不声称已对生产系统造成损害。临时写入用于复现部分副作用及检查点回放；没有执行生产操作。

## 真实 Codex 试运行

| 场景 | 实际观察 | 结论 |
|---|---|---|
| 简单文案 | 实际读取本地 documentation-sync，只有 README 指定拼写变化，回读验证；没有访谈、拆工作项或全量测试。 | 功能及已观测权限边界通过。 |
| 测试缺口分析 | 实际通过非 Shell 文件工具读取 Skill、Spec、实现、测试和清单，指出 25% 与 100% 用例缺失；无文件变化。 | 通过。 |
| 测试实施 | 实际读取 safe-test-implementation，仅修改授权测试文件，保留已有用例，精确命令执行后 3/3 通过。 | 功能和文件范围通过。 |
| 敏感性验证 | 宿主在独立副本替换为旧缺陷公式，新增 25% 用例失败，退出码 1。 | 能捕获目标缺陷；不是伪造历史红灯。 |
| 恢复与复用 | 保留真实模型输出和测试文件，恢复结构化状态，核对实际文件与原 CLI 回读记录，重建当前宿主授权；不重复模型缺口分析或测试编辑。 | 该受控恢复路径通过，不代表前述所有恢复边界安全。 |
| 独立审查 | 新 CLI 会话独立读取 baseline、Spec、代码、最终测试，给出无可执行问题结论；无文件变化。 | 审查功能完成，但加载 Skill 时使用了禁止的 Shell。 |
| 增量验证 | 无关文件变化仍为 valid/reuse；相关代码变化为 stale/rerun。 | 通过。最终 complete 检查点在这次故意失效探针之前。 |

简单场景：[原始报告](../tests/reports/coordination-live-JIiniM/report.json)。完整功能链的缺口与实施证据：[原始报告](../tests/reports/coordination-live-57aKPj/report.json)；恢复后的审查与最终状态：[原始报告](../tests/reports/coordination-live-zNVMTm/report.json)、[权限复核](../tests/reports/coordination-live-zNVMTm/permission-assessment.json)。原始报告全部保留，不用后续结果覆盖先前尝试。

这是宿主程序驱动的串行 CLI 试运行，各阶段使用独立会话；验证了跨会话状态交接，没有验证“同一个 Agent 自动调用多个 Skill”，也没有验证 Claude Code/Cursor。

## 集成层发现：功能通过不能替代权限验收

审查 Skill 的声明为 `run_shell_commands: false`，试运行宿主的 review 请求也只包含 `read_files`，但真实事件包含 `/bin/zsh -lc 'cat .agents/skills/safe-code-review/SKILL.md'`。操作虽然只读，仍不符合声明的 Shell 边界。核心独立审查会话还使用了 Shell Node 探针，同样不能标为权限合规通过。

原试运行工具核对了文件范围、测试结果和 Skill 读取记录，却未比较真实工具事件与声明能力，故原报告中的 PASS 过宽。已修正**观测工具**：发现该类事件就阻止后续证据验收，而不是把模型的“我没有运行 Shell”声明当证据。这里没有改动核心或绕过权限禁令。

下一步接入应让宿主在阶段开始前完成 Skill 内容加载（优先原生显式 Skill 输入），并按当前 Skill 限制可用工具；初始化读取也应计入策略。只读文件沙箱本身允许只读 Shell，不能替代 per-Skill 能力约束。

## 试运行过程中的工具兼容问题

1. 首次 CLI 启动在模型调用前因系统权限失败，未执行工具。经自动审查允许启动后，CLI 自身仍使用 workspace-write/read-only 沙箱，没有使用禁用审批或沙箱的参数。
2. 初版观测器只识别 Shell，漏掉了原生非 Shell 文件读取；原事件证明模型读取成功，已补充识别。
3. 本机 Node 默认输出 `ℹ tests 3`，观测器原先只识别 TAP 的 `# tests 3`，误判计数。已修正两种格式，并从保留成果恢复，避免重做已完成模型阶段。
4. 随后独立检查补充了 Shell 事件与 Skill 权限核对；原先功能 PASS 的报告附加权限失败评估，未覆盖原始记录。

## 实测数据与验证范围

共完成 6 个真实模型 turn（含因观测器误判而重复的一次缺口分析及独立核心审查）。CLI 报告累计 input_tokens 725,537，其中 cached_input_tokens 535,168；output_tokens 6,769；完成的工具条目 24。计数来自各 turn 原始事件，输入包含每轮上下文且可能重复，不能当作独立文本量或费用，也不能推导任何新旧效率比例。

原有协调测试 24/24 通过；新增观测器测试 6/6 通过；六项核心对抗审查全部复现预期缺陷（审查命令退出 1）；新增脚本语法检查与 `git diff --check` 通过。未重跑完整 npm test、正式发布门禁或新旧匹配基准。

优先修复五项核心 P1 和宿主权限落实，再重跑本次对抗检查及严格权限端到端场景。当前试运行不构成发布批准。
