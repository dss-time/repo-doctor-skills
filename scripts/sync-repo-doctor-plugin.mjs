import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverActivePackSkills, syncPackPlugin } from "./sync-pack-plugin.mjs";

const uiDescriptions = {
  "repo-doctor-router": "分析当前工程状态并推荐现有 Repo Doctor Skill 或安全工作流",
  "repo-onboarding": "快速理解陌生项目的结构、技术栈、入口、命令与核心模块",
  "requirements-clarification": "在规格化前逐项关闭会实质改变实现的需求决策",
  "requirements-to-spec": "把重大决策已闭合的需求整理为可实施、可验证规格",
  "spec-to-work-items": "把已确认规格拆成可独立验证且可安全并行的垂直工作项",
  "bug-root-cause-analysis": "复现具体故障并建立从输入到症状的根因证据链",
  "project-health-check": "全面检查架构、质量、安全、性能、测试和发布风险",
  "safe-code-review": "审查代码或 PR 并按优先级报告可操作问题",
  "change-impact-analysis": "修改共享代码前分析依赖、兼容性、风险与测试影响",
  "safe-change-plan": "把已确认分析拆成原子、可验证、可回滚的实施计划",
  "test-gap-analysis": "映射需求或 Diff 到现有测试并排序覆盖缺口",
  "safe-test-implementation": "按测试先行、修复后回归或特征化模式最小化补充高价值测试",
  "ci-failure-diagnosis": "定位 CI 首个可信错误并区分代码、环境、权限与 flaky 问题",
  "documentation-sync": "根据已确认实现同步受影响文档并保持结构与术语一致",
  "release-readiness-check": "对具体候选版本执行有证据的只读发布门禁检查",
  "dependency-upgrade-analysis": "分析依赖升级的破坏性变化、生态兼容性与分阶段回滚方案",
  "api-contract-review": "核对接口各方契约并判定兼容性、行为变化与版本化风险",
  "database-migration-review": "审查迁移可逆性、数据安全、锁表风险与零停机发布顺序",
  "dead-code-verification": "以静态与动态证据验证代码可删除性，证据不足时保持保守",
  "security-focused-review": "基于威胁模型执行安全专项审查并区分漏洞、风险与未知项",
  "performance-regression-analysis": "基于基线和测量证据定位性能回归并设计验证实验",
  "architecture-decision-record": "按仓库约定记录架构选项、决策理由、后果与复审条件",
  "configuration-audit": "审计配置来源、优先级、环境漂移、危险默认值与凭据风险",
  "session-handoff": "生成脱敏、可续接的会话状态摘要和下一会话启动指令",
  "safe-fix-implementation": "一次只实施一个小而安全、可验证的生产代码修复",
};
const uiPrompts = {
  "repo-doctor-router": "使用 $repo-doctor-router 从 canonical 工作流注册表推荐下一 Skill 或 workflow_id，但不要执行推荐。",
  "repo-onboarding": "使用 $repo-onboarding 帮我理解这个陌生仓库的结构、入口和真实命令。",
  "requirements-clarification": "使用 $requirements-clarification 在规格化前关闭关键需求决策，不要实施代码。",
  "requirements-to-spec": "使用 $requirements-to-spec 将重大决策已闭合的需求整理为可验证规格；若仍有重大选择则停止并转交澄清。",
  "spec-to-work-items": "使用 $spec-to-work-items 把已确认规格拆成可独立验证的垂直工作项，不创建外部 Issue。",
  "bug-root-cause-analysis": "使用 $bug-root-cause-analysis 复现并定位具体 Bug 根因，不要实施修复。",
  "project-health-check": "使用 $project-health-check 对这个项目执行广泛健康检查，不要直接修复。",
  "safe-code-review": "使用 $safe-code-review 审查这些代码改动，不要自动实施修复。",
  "change-impact-analysis": "使用 $change-impact-analysis 分析这项代码变更会影响什么，不要直接修改文件。",
  "safe-change-plan": "使用 $safe-change-plan 将已确认分析拆成可验证、可回滚计划，不要执行计划。",
  "test-gap-analysis": "使用 $test-gap-analysis 映射现有测试并分析优先级缺口，不要编写测试。",
  "safe-test-implementation": "使用 $safe-test-implementation 选择 test_first、regression_after_fix 或 characterization 模式补测试，不要修改生产代码。",
  "ci-failure-diagnosis": "使用 $ci-failure-diagnosis 定位 CI 第一个可信错误，不要实施修复或暴露敏感值。",
  "documentation-sync": "使用 $documentation-sync 根据已确认变更同步文档，只修改文档。",
  "release-readiness-check": "使用 $release-readiness-check 检查候选版本并给出门禁结论，不执行发布操作。",
  "dependency-upgrade-analysis": "使用 $dependency-upgrade-analysis 分析这次依赖升级的兼容性、验证与回滚方案，不修改依赖。",
  "api-contract-review": "使用 $api-contract-review 审查接口契约变化及兼容性，不修改接口。",
  "database-migration-review": "使用 $database-migration-review 审查迁移安全性和发布顺序，不执行迁移。",
  "dead-code-verification": "使用 $dead-code-verification 验证这些代码是否可以安全删除，不删除文件。",
  "security-focused-review": "使用 $security-focused-review 对指定范围执行安全专项审查，不攻击系统或直接修复。",
  "performance-regression-analysis": "使用 $performance-regression-analysis 基于基线和测量证据分析性能回归，不直接优化代码。",
  "architecture-decision-record": "使用 $architecture-decision-record 按仓库约定创建或更新 ADR，只修改架构文档。",
  "configuration-audit": "使用 $configuration-audit 审计配置来源、优先级和漂移，不显示凭据值或修改配置。",
  "session-handoff": "使用 $session-handoff 生成脱敏会话交接和可复制启动指令，不修改业务代码。",
  "safe-fix-implementation": "使用 $safe-fix-implementation 安全修复一个已确认问题并完成验证。",
};
const uiDisplayNames = {
  "repo-onboarding": "Repo Onboarding（理解新项目）",
  "project-health-check": "Project Health Check（项目健康检查）",
  "safe-code-review": "Safe Code Review（安全审查代码）",
  "change-impact-analysis": "Change Impact Analysis（改代码看影响）",
  "safe-fix-implementation": "Safe Fix Implementation（只修一个问题）",
};

export function syncRepoDoctorPlugin({ root = process.cwd(), pluginRoot, log = true } = {}) {
  const packRoot = path.join(root, "packs", "engineering", "repo-doctor");
  const destination = pluginRoot ?? path.join(root, "plugins", "repo-doctor");
  const skills = discoverActivePackSkills(packRoot);
  const missingInterfaces = skills.filter((slug) => !uiDescriptions[slug] || !uiPrompts[slug]);
  if (missingInterfaces.length > 0) {
    throw new Error(`Missing Repo Doctor UI metadata for: ${missingInterfaces.join(", ")}`);
  }
  const interfaces = Object.fromEntries(
    skills.map((slug) => [
      slug,
      {
        displayName: uiDisplayNames[slug],
        shortDescription: uiDescriptions[slug],
        defaultPrompt: uiPrompts[slug],
      },
    ]),
  );

  return syncPackPlugin({
    packRoot,
    pluginRoot: destination,
    skills,
    interfaces,
    prune: true,
    rebuild: true,
    log,
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncRepoDoctorPlugin();
}
