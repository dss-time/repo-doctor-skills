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

for (const slug of ["repo-doctor-router", "requirements-clarification", "spec-to-work-items", "session-handoff"]) {
  assert.ok(active.has(slug), `${slug} must be active in Repo Doctor`);
}

for (const locale of ["en", "zh-CN"]) {
  const suffix = locale === "en" ? "en" : "zh-CN";
  const router = requireTerms(
    `packs/engineering/repo-doctor/skills/repo-doctor-router/instructions.${suffix}.md`,
    [
      "requirements-clarification",
      "requirements-to-spec",
      "spec-to-work-items",
      "bug-root-cause-analysis",
      "session-handoff",
      "release-readiness-check",
    ],
  );
  for (const match of router.matchAll(/`\$?([a-z0-9]+(?:-[a-z0-9]+)+)`/g)) {
    assert.ok(active.has(match[1]), `router ${locale} references inactive Skill ${match[1]}`);
  }
  requireTerms(
    `packs/engineering/repo-doctor/skills/repo-doctor-router/output.${suffix}.md`,
    ["task_classification", "registry", "workflow_id", "recommended_next_skill", "applicable_stages", "permission_gates", "alternatives", "stop_conditions"],
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
    ["test_mode", "observable_behavior", "test_boundary", "initial_result", "expected_failure_reason", "sensitivity_evidence", "sensitivity_status", "production_change_required", "verification_commands", "regression_result", "limitations", "next_recommended_skill"],
  );
  requireTerms(
    `packs/engineering/repo-doctor/skills/session-handoff/output.${suffix}.md`,
    locale === "en"
      ? ["Current objective", "Modified files", "Commands run", "Test and validation results", "Unresolved questions", "Recommended next steps", "must not be repeated", "Copyable next-session"]
      : ["当前目标", "已修改文件", "已运行命令", "测试与验证结果", "未解决问题", "下一步", "不应重复执行", "可复制的下一会话"],
  );
}

requireTerms("packs/engineering/repo-doctor/skills/requirements-to-spec/instructions.en.md", ["material decisions are already closed", "requirements-clarification", "stop specification work"]);
requireTerms("packs/engineering/repo-doctor/skills/requirements-to-spec/instructions.zh-CN.md", ["重大决策已经闭合", "requirements-clarification", "停止规格化"]);
requireTerms("packs/engineering/repo-doctor/skills/spec-to-work-items/instructions.en.md", ["Return copyable Markdown only in the response", "even when the user asks", "use Shell to write indirectly"]);
requireTerms("packs/engineering/repo-doctor/skills/spec-to-work-items/instructions.zh-CN.md", ["当前响应中输出 Markdown", "即使用户明确授权", "不得用 Shell"]);

requireTerms("packs/engineering/repo-doctor/skills/bug-root-cause-analysis/instructions.en.md", ["Repeatable feedback mechanism", "symptom reproduction alone is not root-cause confirmation", "falsification"]);
requireTerms("packs/engineering/repo-doctor/skills/bug-root-cause-analysis/instructions.zh-CN.md", ["可重复反馈方式", "现象复现本身不等于根因确认", "反证"]);
requireTerms("packs/engineering/repo-doctor/skills/safe-code-review/instructions.en.md", ["Intent Alignment", "Implementation Quality", "insufficient"]);
requireTerms("packs/engineering/repo-doctor/skills/safe-code-review/instructions.zh-CN.md", ["Intent Alignment", "Implementation Quality", "证据不足"]);
requireTerms("packs/engineering/repo-doctor/skills/safe-test-implementation/instructions.en.md", ["test_first", "regression_after_fix", "characterization", "sensitivity_unverified", "Never switch modes silently"]);
requireTerms("packs/engineering/repo-doctor/skills/safe-test-implementation/instructions.zh-CN.md", ["test_first", "regression_after_fix", "characterization", "sensitivity_unverified", "不得静默切换模式"]);

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

console.log("Repo Doctor workflow contract tests passed for routing, clarification, work items, handoff, RCA, dual-dimension review, test feedback, and Skill quality.");
