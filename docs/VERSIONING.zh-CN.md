# 版本与生命周期策略

Repo Doctor Skills 将项目发布版本、组件版本和成熟度状态分开管理。两个位置恰好出现相同数字，并不表示它们共用同一生命周期。

## 1. 项目发布版本

项目发布版本描述整个仓库级发布。`package.json` 是项目版本的权威元数据；Git tag、GitHub Release、`CHANGELOG.md` 正式版本段和发布说明必须使用相同版本。

当前项目发布版本是 **0.6.1 stable**。本版本修复 skills.sh 兼容性和严格 40/40 分发，不改变 Skill 行为或现有 npm 安装器。已保存的 30 案例性能对比和 317/317 Live-model 报告继续作为行为证据；v0.6.0 增加公开 npm CLI，v0.6.1 增加分发兼容性，不冒充新的路由全集。

不可变的 `v0.5.0` tag 指向原定执行效率候选版本，但该 tag 的 clean-checkout CI 暴露出 build-integrity 测试依赖被忽略的 `dist/` 产物，因此 v0.5.0 没有创建 GitHub Release。该 tag 原样保留，不删除也不移动。v0.5.1 保持相同 Skill 行为，只增加测试侧 clean-build 隔离修复。

后续发布必须：

- 使用 `v<项目版本>` 作为 tag 格式；
- 保证 tag、GitHub Release 名称、package 版本、CHANGELOG 版本和发布说明一致；
- 只有外部发布动作真正成功后，才能称为“已发布”。

## 2. 组件版本

Pack、插件和 Skill 使用独立于项目发布版本的组件版本：

- Pack 版本描述该 Pack 的公开组件契约；
- 由 Pack 生成的插件必须与对应 Pack 使用相同版本；
- Skill 版本描述该 Skill 自身契约，不要求与 Pack 版本相同；
- 项目发布可以包含未发生契约变化的组件，而不提升其组件版本；
- marketplace 条目和 ChatGPT ZIP 当前没有独立的内嵌版本字段。

0.6.1 项目正式稳定版使用以下组件基线：

| 组件 | 版本 | 分发规则 |
|---|---:|---|
| Repo Doctor Pack / 插件 | 0.8.0 | Pack 与生成插件必须一致。 |
| Productivity Toolkit Pack / 插件 | 0.1.0 | Pack 与生成插件必须一致。 |
| Skill Maintainer Pack / 插件 | 0.2.0 | Pack 与生成插件必须一致。 |
| Document Data Doctor Pack | 0.1.0 | 没有独立插件或 ChatGPT ZIP。 |
| 单个 Skill | 30 个为 0.1.0；7 个为 0.2.0；2 个为 0.3.0；1 个为 0.4.0 | 以各自 `skill.yaml` 为准；独立于项目版本和 Pack 版本。 |

不要把所有组件版本机械替换成项目版本。只有组件自身契约变化时才更新其版本，并始终从 `packs/` 重新生成插件和平台产物。

v0.5.0 候选版本引入的执行与 activation 契约使 Repo Doctor Pack/插件配对同步提升到 0.8.0。`safe-fix-implementation` 的公开 activation 描述覆盖目标与期望结果明确的精确低风险编辑，因此提升到 0.2.0。v0.6.0 和 v0.6.1 只改变项目分发层，所以这些组件版本保持不变。

## 3. 成熟度状态

成熟度状态独立于上述两层版本：

- `draft`：尚未完成或仍处于维护者审查阶段；是否进入本地构建由仓库 active-status 规则决定。
- `beta`：已经通过仓库契约验证，可以用于真实任务，但尚缺少足够的广泛公开使用或 Live-model 路由证据，不能标记为 `stable`。Beta 不等于不可用。
- `stable`：有兼容性和使用证据支持的成熟公开接口。Stable 不等于绝对无 Bug 或无风险。
- `deprecated`：仅为兼容保留，不进入新的 active 路由。

Pack 的成熟度不得高于其中成熟度最低的主要 active Skill。模板 Pack 和模板 Skill 保持 `draft`，不计入 active 数量，也不生成插件或独立 ZIP。

0.6.1 项目正式稳定版中，4 个 active Pack 和 40 个 active Skill 仍全部为 `beta`。模板 Pack 及其中的模板 Skill 继续保持 `draft`；项目通道 stable 也不会自动提升组件成熟度。

仓库校验、activation contract、确定性构建、npm tarball smoke、skills.sh 发现/安装 smoke 和真实模型测试分别提供不同证据。保存的 v0.5.1 对比证据完成 30/30 组 baseline/optimized 案例，矩阵为 27 PASS/PASS、3 FAIL/PASS、0 PASS/FAIL、0 FAIL/FAIL；317/317 Live-model 全集仍是 v0.4.0 历史证据。v0.6.0 新增公开 package 的 Recommended 7/7 和 Full 40/40 隔离安装证据；v0.6.1 增加严格 skills.sh 40/40 一致性证据。

## Semantic Versioning 决策

在相应版本层分别遵循 [Semantic Versioning](https://semver.org/)：

- patch：没有新增公开能力的向后兼容修复；
- minor：向后兼容地增加 Skill、Pack、平台产物或用户能力；
- major：公开调用名、Schema、Pack 格式或组件契约发生不兼容变化。

Repo Doctor Skills 仍处于 1.0 之前。0.4.1 是更早的文档与 Release 验证 patch。0.6.0 是增加公开 npm CLI、一键安装和 Recommended/Full preset 的向后兼容 minor release。0.6.1 是向后兼容 patch：修复 skills.sh YAML 兼容性和生成分发一致性，不删除或重命名 canonical Skill slug，也不改变组件行为。1.0.0 必须是明确的产品决策。

## 历史版本标签例外

2026-07-09 发布的 GitHub Release 使用了 `v0.0.1` tag，但其 Release 名称和正文、`package.json`、Pack/Skill metadata 和发布说明草稿都把项目内容标识为 **0.1.0**；Repo Doctor 插件 manifest 当时已经使用独立组件版本 0.2.0。这是一次历史项目 tag 标签错误，不能据此把项目版本与组件版本合并。

项目历史和 SemVer 规划以 0.1.0 作为内容发布基线，同时原样保留已有 `v0.0.1` tag，不删除、不移动、不重建。`v0.2.0` 预发布、`v0.3.0-rc.1` 预发布和 `v0.3.0` 正式版也保持不可变；后续版本必须使用新 tag。

## 发布检查

正式发布前必须确认：

1. `package.json`、计划使用的 tag、发布说明和 `CHANGELOG.md` 中的项目版本一致。
2. 每个 Pack 版本与对应生成插件 manifest 一致。
3. Skill 版本合法，并且只随自身契约变化。
4. Pack/Skill 成熟度决策有证据，模板和 deprecated 内容仍被正确排除。
5. Catalog、插件、平台产物和 ChatGPT ZIP 都从 canonical `packs/` 重新生成。
6. validate、test、文档检查和重复构建全部通过。
7. 发布、commit、push 和 tag 始终是需要单独明确授权的动作。
