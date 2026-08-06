import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverActivePackSkills } from "./sync-pack-plugin.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoPack = path.join(root, "packs", "engineering", "repo-doctor");
const maintainerPack = path.join(root, "packs", "engineering", "skill-maintainer");
const active = new Set(discoverActivePackSkills(repoPack));

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function requireTerms(relativePath, terms) {
  const content = read(relativePath);
  for (const term of terms) assert.ok(content.includes(term), `${relativePath}: missing ${term}`);
  return content;
}

for (const slug of ["repo-doctor-router", "requirements-clarification", "decision-prototype", "architecture-deepening-analysis", "spec-to-work-items", "session-handoff"]) {
  assert.ok(active.has(slug), `${slug} must be active in Repo Doctor`);
}

const progressiveModeSkills = [
  "repo-doctor-router",
  "safe-test-implementation",
  "bug-root-cause-analysis",
  "session-handoff",
  "safe-code-review",
  "decision-prototype",
  "architecture-deepening-analysis",
];
for (const slug of progressiveModeSkills) {
  for (const locale of ["en", "zh-CN"]) {
    requireTerms(
      `packs/engineering/repo-doctor/skills/${slug}/instructions.${locale}.md`,
      ["fast", "standard", "audit"],
    );
  }
}
for (const locale of ["en", "zh-CN"]) {
  requireTerms(
    `packs/engineering/repo-doctor/skills/requirements-clarification/instructions.${locale}.md`,
    ["fast", "standard", "documented"],
  );
}

for (const locale of ["en", "zh-CN"]) {
  const suffix = locale === "en" ? "en" : "zh-CN";
  const router = requireTerms(
    `packs/engineering/repo-doctor/skills/repo-doctor-router/instructions.${suffix}.md`,
    [
      "requirements-clarification",
      "requirements-to-spec",
      "spec-to-work-items",
      "decision-prototype",
      "bug-root-cause-analysis",
      "architecture-deepening-analysis",
      "session-handoff",
      "release-readiness-check",
    ],
  );
  for (const match of router.matchAll(/`\$?([a-z0-9]+(?:-[a-z0-9]+)+)`/g)) {
    assert.ok(active.has(match[1]), `router ${locale} references inactive Skill ${match[1]}`);
  }
  requireTerms(
    `packs/engineering/repo-doctor/skills/repo-doctor-router/output.${suffix}.md`,
    locale === "en"
      ? ["Recommend: $<skill-name>", "Reason:", "Mode:", "Needs:", "workflow ID", "permission gate", "stop condition"]
      : ["推荐：$<skill-name>", "原因：", "模式：", "需要：", "workflow ID", "权限门禁", "停止条件"],
  );
  requireTerms(
    `packs/engineering/repo-doctor/skills/requirements-clarification/output.${suffix}.md`,
    ["confirmed", "inferred", "open", "deferred", "out_of_scope", "requirements-to-spec"],
  );
  requireTerms(
    `packs/engineering/repo-doctor/skills/spec-to-work-items/output.${suffix}.md`,
    ["user_visible_outcome", "dependencies", "parallelizable_with", "acceptance_criteria", "verification", "rollback_notes", "recommended_skills"],
  );
  requireTerms(
    `packs/engineering/repo-doctor/skills/safe-test-implementation/output.${suffix}.md`,
    ["test_mode", "observable_behavior", "test_boundary", "production_change_required", "next_recommended_skill", "audit"],
  );
  requireTerms(
    `packs/engineering/repo-doctor/skills/session-handoff/output.${suffix}.md`,
    locale === "en"
      ? ["next-session goal", "confirmed facts", "unverified information", "completed changes", "unfinished tasks", "repository state", "validation commands", "minimum start instruction"]
      : ["下一会话目标", "已确认事实", "未验证信息", "已完成修改", "未完成任务", "仓库状态", "验证命令", "最小启动指令"],
  );
}

requireTerms("packs/engineering/repo-doctor/skills/requirements-to-spec/instructions.en.md", ["material decisions are already closed", "requirements-clarification", "stop specification work"]);
requireTerms("packs/engineering/repo-doctor/skills/requirements-to-spec/instructions.zh-CN.md", ["重大决策已经闭合", "requirements-clarification", "停止规格化"]);
requireTerms("packs/engineering/repo-doctor/skills/spec-to-work-items/instructions.en.md", ["Return copyable Markdown only in the response", "even when the user asks", "use Shell to write indirectly"]);
requireTerms("packs/engineering/repo-doctor/skills/spec-to-work-items/instructions.zh-CN.md", ["当前响应中输出 Markdown", "即使用户明确授权", "不得用 Shell"]);

requireTerms("packs/engineering/repo-doctor/skills/bug-root-cause-analysis/instructions.en.md", ["trustworthy, repeatable signal", "success predicate", "falsifiable hypotheses", "trigger_condition", "systemic_root_cause"]);
requireTerms("packs/engineering/repo-doctor/skills/bug-root-cause-analysis/instructions.zh-CN.md", ["可信、可重复", "成功判据", "可证伪", "trigger_condition", "systemic_root_cause"]);
requireTerms("packs/engineering/repo-doctor/skills/safe-code-review/instructions.en.md", ["Repository Conformance", "Change Intent Fidelity", "Operational Safety", "insufficient evidence"]);
requireTerms("packs/engineering/repo-doctor/skills/safe-code-review/instructions.zh-CN.md", ["Repository Conformance", "Change Intent Fidelity", "Operational Safety", "证据不足"]);
requireTerms("packs/engineering/repo-doctor/skills/safe-test-implementation/instructions.en.md", ["test_first", "regression_after_fix", "characterization", "sensitivity_unverified", "Never switch either silently", "One behavior slice"]);
requireTerms("packs/engineering/repo-doctor/skills/safe-test-implementation/instructions.zh-CN.md", ["test_first", "regression_after_fix", "characterization", "sensitivity_unverified", "不得静默切换", "一个行为切片"]);
requireTerms("packs/engineering/repo-doctor/skills/decision-prototype/instructions.en.md", ["logic-prototype", "ui-prototype", "NON-PRODUCTION PROTOTYPE", "supported", "rejected", "uncertain"]);
requireTerms("packs/engineering/repo-doctor/skills/decision-prototype/instructions.zh-CN.md", ["logic-prototype", "ui-prototype", "NON-PRODUCTION PROTOTYPE", "supported", "rejected", "uncertain"]);
requireTerms("packs/engineering/repo-doctor/skills/architecture-deepening-analysis/instructions.en.md", ["caller", "at least two", "rollback", "ADR", "never performs a broad refactor"]);
requireTerms("packs/engineering/repo-doctor/skills/architecture-deepening-analysis/instructions.zh-CN.md", ["调用方", "至少两个", "回滚", "ADR", "绝不执行大范围重构"]);

for (const slug of discoverActivePackSkills(maintainerPack)) {
  const en = read(`packs/engineering/skill-maintainer/skills/${slug}/instructions.en.md`);
  const zh = read(`packs/engineering/skill-maintainer/skills/${slug}/instructions.zh-CN.md`);
  assert.ok(en.includes("automatic") && en.includes("completion"), `${slug}: missing English activation/completion quality checks`);
  assert.ok(zh.includes("自动") && zh.includes("完成条件"), `${slug}: missing Chinese activation/completion quality checks`);
}

const sharedQuality = read("packs/engineering/skill-maintainer/references/skill-maintenance-boundaries.md");
for (const term of ["multiple authoritative sources", "ineffective", "duplicated", "stale", "router references", "overlaps an existing owner"]) {
  assert.ok(sharedQuality.includes(term), `shared Skill quality model missing ${term}`);
}

console.log("Repo Doctor workflow contract tests passed for concise routing, decision-tree clarification, prototypes, architecture analysis, handoff, signal-first RCA, three-axis review, test cycles, and Skill quality.");
