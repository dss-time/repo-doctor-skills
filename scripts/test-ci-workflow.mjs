import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const content = readFileSync(path.join(process.cwd(), ".github", "workflows", "ci.yml"), "utf8");
const workflow = parse(content);
assert.match(readFileSync(".gitattributes", "utf8"), /^\* text=auto eol=lf$/m);
const compatibility = workflow.jobs.compatibility;
assert.deepEqual(compatibility.strategy.matrix.os, ["ubuntu-latest", "macos-latest", "windows-latest"]);
assert.deepEqual(compatibility.strategy.matrix.node, ["18", "lts/*"]);
assert.equal(JSON.parse(readFileSync("package.json", "utf8")).engines.node, ">=18");
assert.ok(compatibility.steps.some((step) => step.run === "node scripts/test-installer.mjs"));
assert.ok(compatibility.steps.some((step) => step.run === "npm run test:npm"
  && step.if === "runner.os == 'Linux' && matrix.node == '18'"));
const qualityContent = content.slice(content.indexOf("  quality-gates:"));
const required = [
  /actions\/checkout@v6/,
  /find scripts -type f -name .*?-print0 \| xargs -0 -n 1 node --check/,
  /actions\/setup-node@v6/,
  /node-version:\s*["']?lts\/\*/,
  /npm run validate/,
  /npm run test:core/,
  /npm run test:ux/,
  /npm run test:npm/,
  /npm run build/,
  /npm run docs:check/,
  /npm run quality:check/,
  /npm run release:check/,
  /git diff --exit-code/
];
for (const pattern of required) assert.match(content, pattern, `CI missing ${pattern}`);
const order = [
  "npm run validate",
  "npm run test:core",
  "npm run test:ux",
  "npm run test:npm",
  "npm run build",
  "npm run docs:check",
  "npm run quality:check",
  "npm run release:check",
];
let previous = -1;
for (const command of order) {
  const index = qualityContent.indexOf(command);
  assert.ok(index > previous, `CI command out of order: ${command}`);
  previous = index;
}
assert.match(content, /permissions:\s*\n\s+contents:\s+read/);
assert.match(content, /persist-credentials:\s+false/);
assert.match(content, /run: npm run release:check -- --development/);
assert.match(content, /if: startsWith\(github\.ref, 'refs\/tags\/v'\)\s+run: npm run release:check\s*\n/);
assert.doesNotMatch(content, /npm publish|gh release|git push/);
console.log("CI contract test passed for complete ordered, read-only quality gates.");
