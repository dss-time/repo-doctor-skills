# Skill 工程化创建

读取 `../../references/skill-maintenance-boundaries.md` 和 `references/authoring-checklist.md`。编辑前使用 `assets/skill-design-brief.md` 记录设计。

1. 检查仓库指令、canonical Packs、现有 Skills、schemas、脚手架、同步/构建适配器、activation 契约、manifests 和脏工作区，保护用户已有改动。
2. 推导 2–5 个覆盖不同真实意图的正向请求、用户主动调用与模型自动调用用例、明确反例和相邻 Skill；不得靠堆同义词制造 trigger 覆盖。只有会改变范围、权限、公开/私有归属或 Skill 数量的阻塞选择才询问。
3. 判断重复工作是否值得成为 Skill。至少应存在可复用流程、输出契约、安全边界、专业资料、模板或确定性逻辑；简单一次性 Prompt 应拒绝创建。
4. 全局搜索重复 slug、ID、语义和触发。意图相同时优先增强现有 Skill；未经授权不得扩展为多个 Skill。
5. 确定 canonical Pack、插件分发、可见性、目标平台、权限和转交关系；私有或受限实现不得进入本公开仓库。
6. 规划最少文件。canonical instructions 只保留所有分支都需要的流程，分支专用细节通过一级 `references/` 渐进加载；复制材料使用 `assets/`，只有确有需要才增加有测试的确定性 `scripts/`。每条规则只有一个权威来源。不得创建空资源目录或 Skill 内 README/CHANGELOG。
7. 先检查文件系统、shell 和脚手架能力，再运行现有 `npm run create:skill -- --pack ... --name ... --id ... --category ...`。如果所需能力不可用，必须在写入前停止，输出已完成的设计 brief 和待执行的准确命令，并明确“尚未实现、尚未验证”，不得声称已生成文件。若脚手架缺失或不完整，只能在用户授权范围内增强现有脚本并补测试，不得手建竞争结构或覆盖现有 Skill。
8. 用双语元数据、命令式流程、输出契约、示例和测试替换占位内容；description 写清做什么、何时触发、何时不触发；canonical 正文不写死平台调用语法。每个阶段需要可检查完成条件，并明确失败与退出条件；删除无效、重复、过期或无边界扩张的指令。
9. 更新 Pack 索引、相关插件同步配置、UI 元数据、必要 manifests/marketplace、activation cases 和仓库文档，由 adapters 生成平台副本。
10. 应用共享 Repo Doctor Skill 质量模型，检查提前结束、中英文行为/权限/风险一致、输出/示例/测试一致、与现有职责重叠，以及 Router 是否引用不存在或已弃用 Skill。运行确定性质量检查、validate、activation、维护工具测试和 build；抽查所有目标产物并重复构建比较哈希。修复失败，不隐藏未知项。
11. 报告需求理解、适合度、触发、反例、资源、文件、验证和限制。未经明确授权不 commit、push、发布或安装。
