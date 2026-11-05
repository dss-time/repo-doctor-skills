import path from "node:path";
import { syncPackPlugin } from "./sync-pack-plugin.mjs";

const root = process.cwd();
const interfaces = {
  "report-writer": {
    shortDescription: "基于目标、读者和证据撰写结构化报告并保持引用一致",
    defaultPrompt: "使用 $report-writer 根据这些材料撰写一份有证据边界的结构化报告。",
  },
  "research-brief": {
    shortDescription: "围绕研究问题建立来源台账、交叉验证并输出简报",
    defaultPrompt: "使用 $research-brief 有来源地研究这个问题；无法联网时明确降级。",
  },
  "meeting-notes-to-actions": {
    shortDescription: "将会议记录整理成决定、行动项、负责人、日期和待确认项",
    defaultPrompt: "使用 $meeting-notes-to-actions 提取会议决定和行动项，缺失负责人或日期标记 TBD。",
  },
  "presentation-outline": {
    shortDescription: "根据受众和目标设计故事线与逐页演示大纲",
    defaultPrompt: "使用 $presentation-outline 设计逐页演示大纲；未经授权不要生成 PPTX。",
  },
  "content-consistency-check": {
    shortDescription: "核对多个材料中的术语、数字、日期、版本、链接和结论",
    defaultPrompt: "使用 $content-consistency-check 对比这些材料并报告冲突两侧和权威证据状态。",
  },
};

syncPackPlugin({
  packRoot: path.join(root, "packs", "productivity", "productivity-toolkit"),
  pluginRoot: path.join(root, "plugins", "productivity-toolkit"),
  interfaces,
  prune: true,
});
