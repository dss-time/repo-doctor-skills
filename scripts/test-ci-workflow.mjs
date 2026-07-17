import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const content = readFileSync(path.join(process.cwd(), ".github", "workflows", "ci.yml"), "utf8");
const required = [
  /actions\/checkout@v6/,
  /actions\/setup-node@v6/,
  /node-version:\s*["']?lts\/\*/,
  /npm run validate/,
  /npm test/,
  /npm run build/,
  /npm run docs:check/,
  /npm run quality:check/,
  /npm run release:check/,
  /git diff --exit-code/
];
for (const pattern of required) assert.match(content, pattern, `CI missing ${pattern}`);
const order = ["npm run validate", "npm test", "npm run build", "npm run docs:check", "npm run quality:check", "npm run release:check"];
let previous = -1;
for (const command of order) {
  const index = content.indexOf(command);
  assert.ok(index > previous, `CI command out of order: ${command}`);
  previous = index;
}
assert.match(content, /permissions:\s*\n\s+contents:\s+read/);
assert.match(content, /persist-credentials:\s+false/);
assert.doesNotMatch(content, /npm publish|gh release|git push/);
console.log("CI contract test passed for complete ordered, read-only quality gates.");
