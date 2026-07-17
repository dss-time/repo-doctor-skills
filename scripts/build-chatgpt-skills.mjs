import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  compareNames,
  copyDirectoryContents,
  toPosixPath,
  walkFiles,
} from "./deterministic-files.mjs";
import { discoverActivePackSkills } from "./sync-pack-plugin.mjs";
import { syncRepoDoctorPlugin } from "./sync-repo-doctor-plugin.mjs";

const root = process.cwd();
const outputRoot = path.join(root, "dist", "chatgpt-skills");
const pluginBuilds = [
  {
    packRoot: path.join(root, "packs", "engineering", "repo-doctor"),
    sourceRoot: path.join(root, "plugins", "repo-doctor", "skills"),
    publishPrefix: "rd",
    displayPrefix: "RD",
  },
  {
    packRoot: path.join(root, "packs", "productivity", "productivity-toolkit"),
    sourceRoot: path.join(root, "plugins", "productivity-toolkit", "skills"),
    publishPrefix: "pt",
    displayPrefix: "PT",
  },
  {
    packRoot: path.join(root, "packs", "engineering", "skill-maintainer"),
    sourceRoot: path.join(root, "plugins", "skill-maintainer", "skills"),
    publishPrefix: "sm",
    displayPrefix: "SM",
  },
];
const reproducibleTimestamp = new Date("2000-01-01T00:00:00Z");

const interfaces = {
  "repo-doctor-router": {
    displayName: "Repo Doctor Router（工作流路由）",
    shortDescription: "分析工程任务状态并推荐现有 Repo Doctor Skill 或安全工作流",
    defaultPrompt: "使用 $repo-doctor-router 推荐下一 Skill 或工作流，但不要执行推荐。",
  },
  "requirements-clarification": {
    displayName: "Requirements Clarification（需求决策澄清）",
    shortDescription: "在规格化前逐项关闭会实质改变实现的需求决策",
    defaultPrompt: "使用 $requirements-clarification 澄清关键需求决策，不要实施代码。",
  },
  "spec-to-work-items": {
    displayName: "Spec to Work Items（规格拆分工作项）",
    shortDescription: "把已确认规格拆成可独立验证且可安全并行的垂直工作项",
    defaultPrompt: "使用 $spec-to-work-items 拆分已确认规格，不创建外部 Issue。",
  },
  "session-handoff": {
    displayName: "Session Handoff（会话交接）",
    shortDescription: "生成脱敏、可续接的会话摘要和下一会话启动指令",
    defaultPrompt: "使用 $session-handoff 生成脱敏交接，不修改业务代码。",
  },
  "report-writer": {
    displayName: "Report Writer（报告撰写）",
    shortDescription: "基于目标、读者和证据撰写结构化报告并保持引用一致",
    defaultPrompt: "使用 $report-writer 根据这些材料撰写一份有证据边界的结构化报告。",
  },
  "research-brief": {
    displayName: "Research Brief（研究简报）",
    shortDescription: "围绕研究问题建立来源台账、交叉验证并输出简报",
    defaultPrompt: "使用 $research-brief 有来源地研究这个问题；无法联网时明确降级。",
  },
  "spreadsheet-data-cleaning": {
    displayName: "Spreadsheet Data Cleaning（表格数据清洗）",
    shortDescription: "画像并清洗表格，另存结果并提供前后统计和审计日志",
    defaultPrompt: "使用 $spreadsheet-data-cleaning 清洗这份表格，保留原文件并输出审计记录。",
  },
  "document-review": {
    displayName: "Document Review（文档审查）",
    shortDescription: "审查文档结构、逻辑、证据、语言和格式并分级问题",
    defaultPrompt: "使用 $document-review 审查这份文档，区分必须修改、建议修改和可选润色。",
  },
  "pdf-review": {
    displayName: "PDF Review（PDF 审查）",
    shortDescription: "按真实提取、页码、OCR 和渲染能力执行 PDF 专项审查",
    defaultPrompt: "使用 $pdf-review 审查这份 PDF，不要虚构页码、OCR 或视觉验证。",
  },
  "meeting-notes-to-actions": {
    displayName: "Meeting Notes to Actions（会议纪要转行动项）",
    shortDescription: "将会议记录整理成决定、行动项、负责人、日期和待确认项",
    defaultPrompt: "使用 $meeting-notes-to-actions 提取会议决定和行动项，缺失负责人或日期标记 TBD。",
  },
  "presentation-outline": {
    displayName: "Presentation Outline（演示文稿大纲）",
    shortDescription: "根据受众和目标设计故事线与逐页演示大纲",
    defaultPrompt: "使用 $presentation-outline 设计逐页演示大纲；未经授权不要生成 PPTX。",
  },
  "content-consistency-check": {
    displayName: "Content Consistency Check（内容一致性检查）",
    shortDescription: "核对多个材料中的术语、数字、日期、版本、链接和结论",
    defaultPrompt: "使用 $content-consistency-check 对比这些材料并报告冲突两侧和权威证据状态。",
  },
  "dependency-upgrade-analysis": {
    displayName: "Dependency Upgrade Analysis（依赖升级分析）",
    shortDescription: "分析依赖升级的破坏性变化、生态兼容性与分阶段回滚方案",
    defaultPrompt: "使用 $dependency-upgrade-analysis 分析这次依赖升级，不修改依赖或锁文件。",
  },
  "api-contract-review": {
    displayName: "API Contract Review（API 契约审查）",
    shortDescription: "核对接口各方契约并判定兼容性、行为变化与版本化风险",
    defaultPrompt: "使用 $api-contract-review 审查这次接口契约变化，不修改接口。",
  },
  "database-migration-review": {
    displayName: "Database Migration Review（数据库迁移审查）",
    shortDescription: "审查迁移可逆性、数据安全、锁表风险与零停机发布顺序",
    defaultPrompt: "使用 $database-migration-review 审查这次数据库迁移，不执行迁移。",
  },
  "dead-code-verification": {
    displayName: "Dead Code Verification（死代码验证）",
    shortDescription: "以静态与动态证据验证代码可删除性，证据不足时保持保守",
    defaultPrompt: "使用 $dead-code-verification 验证这些代码是否可以安全删除，不删除代码。",
  },
  "security-focused-review": {
    displayName: "Security Focused Review（安全专项审查）",
    shortDescription: "基于威胁模型执行安全专项审查并区分漏洞、风险与未知项",
    defaultPrompt: "使用 $security-focused-review 对指定范围执行安全专项审查，不攻击系统或直接修复。",
  },
  "performance-regression-analysis": {
    displayName: "Performance Regression Analysis（性能回归分析）",
    shortDescription: "基于基线和测量证据定位性能回归并设计验证实验",
    defaultPrompt: "使用 $performance-regression-analysis 分析这次性能回归，不直接优化代码。",
  },
  "architecture-decision-record": {
    displayName: "Architecture Decision Record（架构决策记录）",
    shortDescription: "按仓库约定记录架构选项、决策理由、后果与复审条件",
    defaultPrompt: "使用 $architecture-decision-record 按仓库约定创建或更新 ADR，只修改架构文档。",
  },
  "configuration-audit": {
    displayName: "Configuration Audit（配置审计）",
    shortDescription: "审计配置来源、优先级、环境漂移、危险默认值与凭据风险",
    defaultPrompt: "使用 $configuration-audit 审计配置来源和环境漂移，不修改配置或显示凭据值。",
  },
  "safe-test-implementation": {
    displayName: "Safe Test Implementation（安全补充测试）",
    shortDescription: "遵循仓库约定最小化补充高价值测试并验证结果",
    defaultPrompt: "使用 $safe-test-implementation 根据已确认缺口最小化补充测试，不要修改生产代码。",
  },
  "ci-failure-diagnosis": {
    displayName: "CI Failure Diagnosis（CI 失败诊断）",
    shortDescription: "定位 CI 首个可信错误并区分代码、环境、权限与 flaky 问题",
    defaultPrompt: "使用 $ci-failure-diagnosis 定位这次 CI 失败的第一个可信错误，不要实施修复。",
  },
  "documentation-sync": {
    displayName: "Documentation Sync（文档同步维护）",
    shortDescription: "根据已确认实现同步受影响文档并保持结构与术语一致",
    defaultPrompt: "使用 $documentation-sync 根据已确认变更同步受影响文档，只修改文档。",
  },
  "release-readiness-check": {
    displayName: "Release Readiness Check（发布就绪检查）",
    shortDescription: "对具体候选版本执行有证据的只读发布门禁检查",
    defaultPrompt: "使用 $release-readiness-check 检查这个候选版本并给出发布结论，不执行发布。",
  },
  "requirements-to-spec": {
    displayName: "Requirements to Spec（需求澄清与规格化）",
    shortDescription: "把模糊需求整理为可实施、可验证的规格与验收标准",
    defaultPrompt: "使用 $requirements-to-spec 把这项需求整理为可验证规格，不要修改代码。",
  },
  "bug-root-cause-analysis": {
    displayName: "Bug Root Cause Analysis（Bug 根因分析）",
    shortDescription: "复现具体故障并建立从输入到症状的根因证据链",
    defaultPrompt: "使用 $bug-root-cause-analysis 复现并定位这个故障的根因，不要实施修复。",
  },
  "safe-change-plan": {
    displayName: "Safe Change Plan（安全变更计划）",
    shortDescription: "把已确认分析拆成原子、可验证、可回滚的实施计划",
    defaultPrompt: "使用 $safe-change-plan 根据已确认分析制定安全变更计划，不要执行计划。",
  },
  "test-gap-analysis": {
    displayName: "Test Gap Analysis（测试缺口分析）",
    shortDescription: "映射需求或 Diff 到现有测试并排序覆盖缺口",
    defaultPrompt: "使用 $test-gap-analysis 分析这项变更的测试缺口，不要编写测试代码。",
  },
  "change-impact-analysis": {
    displayName: "Change Impact Analysis（改代码看影响）",
    shortDescription: "修改、重构、重命名或删除代码前，先分析依赖与影响范围",
    defaultPrompt: "使用 $change-impact-analysis 分析这次代码变更的影响范围和安全实施方案。",
  },
  "project-health-check": {
    displayName: "Project Health Check（项目健康检查）",
    shortDescription: "全面检查架构、质量、安全、性能、测试和发布风险",
    defaultPrompt: "使用 $project-health-check 对这个项目进行全面健康检查并给出优先级建议。",
  },
  "repo-onboarding": {
    displayName: "Repo Onboarding（理解新项目）",
    shortDescription: "快速理解陌生项目的结构、技术栈、入口、命令与核心模块",
    defaultPrompt: "使用 $repo-onboarding 帮我快速理解这个陌生项目以及应该从哪里开始阅读。",
  },
  "safe-code-review": {
    displayName: "Safe Code Review（安全审查代码）",
    shortDescription: "专业审查代码或 PR，识别缺陷、安全风险与可维护性问题",
    defaultPrompt: "使用 $safe-code-review 审查这些代码改动，并按优先级报告可操作问题。",
  },
  "safe-fix-implementation": {
    displayName: "Safe Fix Implementation（只修一个问题）",
    shortDescription: "一次只实施一个小而安全、可验证的修复",
    defaultPrompt: "使用 $safe-fix-implementation 安全修复一个已确认的问题并完成验证。",
  },
  "skill-authoring": {
    displayName: "Skill Authoring（Skill 工程化创建）",
    shortDescription: "按仓库唯一脚手架工程化创建一个双语可发布 Skill",
    defaultPrompt: "使用 $skill-authoring 按当前仓库规范创建一个边界明确的双语 Skill。",
  },
  "skill-quality-audit": {
    displayName: "Skill Quality Audit（Skill 质量审计）",
    shortDescription: "只读审计 Skill、Pack 或插件的结构、触发、安全与发布质量",
    defaultPrompt: "使用 $skill-quality-audit 只读审计这个 Skill 的发布质量，不要自动修改文件。",
  },
};

function yamlString(value) {
  return JSON.stringify(value);
}

function titleCase(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function interfaceFor(source, slug) {
  const configured = interfaces[slug];
  if (configured) return configured;

  const content = readFileSync(source, "utf8");
  const heading = content.match(/^#\s+(.+)$/m)?.[1] ?? titleCase(slug);
  const description = content.match(/^description:\s*(.+)$/m)?.[1] ?? "Repo Doctor workflow";
  return {
    displayName: heading,
    shortDescription: description.slice(0, 80),
    defaultPrompt: `使用 $${slug} 执行这个 Repo Doctor 工作流。`,
  };
}

export function splitSkillDocument(content) {
  const bomLength = content.startsWith("\uFEFF") ? 1 : 0;
  const openingLineEnd = content.indexOf("\n", bomLength);
  if (openingLineEnd === -1 || content.slice(bomLength, openingLineEnd).replace(/\r$/, "") !== "---") {
    throw new Error("SKILL.md must start with YAML frontmatter");
  }

  let closingStart = -1;
  let closingEnd = -1;
  let cursor = openingLineEnd + 1;
  while (cursor <= content.length) {
    const newline = content.indexOf("\n", cursor);
    const lineEnd = newline === -1 ? content.length : newline;
    if (content.slice(cursor, lineEnd).replace(/\r$/, "") === "---") {
      closingStart = cursor;
      closingEnd = newline === -1 ? content.length : newline + 1;
      break;
    }
    if (newline === -1) break;
    cursor = newline + 1;
  }
  if (closingStart === -1) throw new Error("SKILL.md frontmatter is not closed");

  const frontmatter = content.slice(openingLineEnd + 1, closingStart);
  const fields = new Map();
  const starts = [];
  cursor = 0;
  while (cursor < frontmatter.length) {
    const newline = frontmatter.indexOf("\n", cursor);
    const lineEnd = newline === -1 ? frontmatter.length : newline;
    const line = frontmatter.slice(cursor, lineEnd).replace(/\r$/, "");
    const match = line.match(/^([A-Za-z0-9_-]+):/);
    if (match) {
      if (fields.has(match[1])) throw new Error(`duplicate frontmatter field: ${match[1]}`);
      const field = { key: match[1], start: cursor, end: frontmatter.length };
      fields.set(match[1], field);
      starts.push(field);
    }
    if (newline === -1) break;
    cursor = newline + 1;
  }
  for (let index = 0; index < starts.length - 1; index += 1) {
    starts[index].end = starts[index + 1].start;
  }

  return {
    opening: content.slice(0, openingLineEnd + 1),
    frontmatter,
    closing: content.slice(closingStart, closingEnd),
    body: content.slice(closingEnd),
    fields,
  };
}

export function frontmatterFieldSource(content, key) {
  const document = typeof content === "string" ? splitSkillDocument(content) : content;
  const field = document.fields.get(key);
  return field ? document.frontmatter.slice(field.start, field.end) : "";
}

export function renderSkillContent(content, slug) {
  const document = splitSkillDocument(content);
  const nameField = document.fields.get("name");
  if (!nameField) throw new Error("SKILL.md frontmatter is missing name");
  const newline = document.frontmatter.indexOf("\n", nameField.start);
  const lineEnd = newline === -1 ? document.frontmatter.length : newline;
  const terminatorStart = document.frontmatter[lineEnd - 1] === "\r" ? lineEnd - 1 : lineEnd;
  const frontmatter = [
    document.frontmatter.slice(0, nameField.start),
    `name: ${slug}`,
    document.frontmatter.slice(terminatorStart),
  ].join("");
  return `${document.opening}${frontmatter}${document.closing}${document.body}`;
}

export function renderSkill(source, slug) {
  return renderSkillContent(readFileSync(source, "utf8"), slug);
}

export function renderInterface(config, publishedSlug, displayPrefix) {
  const defaultPrompt = config.defaultPrompt.replace(
    /\$[a-z0-9-]+/,
    `$${publishedSlug}`,
  );
  return [
    "interface:",
    `  display_name: ${yamlString(`${displayPrefix} · ${config.displayName}`)}`,
    `  short_description: ${yamlString(config.shortDescription)}`,
    `  default_prompt: ${yamlString(defaultPrompt)}`,
    "",
  ].join("\n");
}

export function collectFiles(dir) {
  if (!existsSync(dir)) return [];
  return walkFiles(dir)
    .map((file) => toPosixPath(path.relative(dir, file)))
    .sort(compareNames);
}

export function orderedArchiveEntries(skillRoot) {
  return walkFiles(skillRoot)
    .map((file) => toPosixPath(path.relative(skillRoot, file)))
    .sort(compareNames);
}

export function buildChatGptSkills() {
  syncRepoDoctorPlugin({ root });
  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(outputRoot, { recursive: true });

  for (const { packRoot, sourceRoot, publishPrefix, displayPrefix } of pluginBuilds) {
    for (const slug of discoverActivePackSkills(packRoot)) {
      const source = path.join(sourceRoot, slug, "SKILL.md");
      const config = interfaceFor(source, slug);
      const publishedSlug = `${publishPrefix}-${slug}`;

      const skillRoot = path.join(outputRoot, publishedSlug);
      const agentsRoot = path.join(skillRoot, "agents");
      mkdirSync(agentsRoot, { recursive: true });
      writeFileSync(
        path.join(skillRoot, "SKILL.md"),
        renderSkill(source, publishedSlug),
      );
      writeFileSync(
        path.join(agentsRoot, "openai.yaml"),
        renderInterface(config, publishedSlug, displayPrefix),
      );
      utimesSync(path.join(skillRoot, "SKILL.md"), reproducibleTimestamp, reproducibleTimestamp);
      utimesSync(path.join(agentsRoot, "openai.yaml"), reproducibleTimestamp, reproducibleTimestamp);

      for (const resourceName of ["references", "assets", "scripts"]) {
        const sourceResource = path.join(sourceRoot, slug, resourceName);
        if (!existsSync(sourceResource)) continue;
        const destinationResource = path.join(skillRoot, resourceName);
        copyDirectoryContents(sourceResource, destinationResource);
        for (const relativeFile of collectFiles(destinationResource)) {
          utimesSync(
            path.join(destinationResource, ...relativeFile.split("/")),
            reproducibleTimestamp,
            reproducibleTimestamp,
          );
        }
      }

      const archive = path.join(outputRoot, `${publishedSlug}.zip`);
      const archiveEntries = orderedArchiveEntries(skillRoot);
      execFileSync("zip", ["-q", "-X", archive, ...archiveEntries], {
        cwd: skillRoot,
      });
      console.log(`Built ${path.relative(root, archive)}`);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildChatGptSkills();
}
