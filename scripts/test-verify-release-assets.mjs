import assert from "node:assert/strict";
import {
  ReleaseVerificationError,
  isNetworkFailure,
  parseArguments,
  parseChecksums,
  parseManifest,
  validateSkillContent,
  validateZipEntry,
} from "./verify-release-assets.mjs";

function expectFailure(callback, fragment) {
  assert.throws(
    callback,
    (error) => error instanceof ReleaseVerificationError
      && error.status === "FAIL"
      && error.message.includes(fragment),
  );
}

const digestA = "a".repeat(64);
const digestB = "b".repeat(64);
const checksumText = `${digestA}  rd-router-v0.4.1.zip\n${digestB}  pt-report-v0.4.1.zip\n`;
assert.deepEqual(
  Object.fromEntries(parseChecksums(checksumText)),
  {
    "rd-router-v0.4.1.zip": digestA,
    "pt-report-v0.4.1.zip": digestB,
  },
);
assert.deepEqual(
  Object.fromEntries(parseManifest(
    [
      "Repo Doctor Skills Release Manifest",
      "Version: 0.4.1",
      "Tag: v0.4.1",
      "Assets:",
      `  ${digestA}  rd-router-v0.4.1.zip`,
      `  ${digestB}  pt-report-v0.4.1.zip`,
      "",
    ].join("\n"),
    "v0.4.1",
  )),
  Object.fromEntries(parseChecksums(checksumText)),
);

for (const valid of ["SKILL.md", "agents/openai.yaml", "references/check.md", "assets/template.md"]) {
  assert.equal(validateZipEntry(valid), valid);
}
for (const [entry, fragment] of [
  ["../secret", "path traversal"],
  ["/absolute/SKILL.md", "absolute"],
  ["C:\\temp\\SKILL.md", "absolute"],
  ["node_modules/pkg/index.js", "forbidden"],
  [".git/config", "forbidden"],
  ["repository/package.json", "unexpected top-level"],
]) {
  expectFailure(() => validateZipEntry(entry), fragment);
}

const bilingualSkill = [
  "---",
  "name: rd-demo",
  "description: English purpose. 中文用途。",
  "---",
  "",
  "# Demo",
  "",
  "Use evidence and preserve safety boundaries.",
  "",
  "# 示例",
  "",
  "使用证据并保留安全边界。",
  "",
].join("\n");
validateSkillContent(bilingualSkill, "rd-demo", "rd-demo-v0.4.1.zip");
expectFailure(
  () => validateSkillContent(bilingualSkill.replace("name: rd-demo", "name: rd-other"), "rd-demo", "demo.zip"),
  "does not match",
);
expectFailure(
  () => validateSkillContent(
    bilingualSkill
      .replace("description: English purpose. 中文用途。", "description: English purpose.")
      .replace("# 示例", "# Example")
      .replace("使用证据并保留安全边界。", ""),
    "rd-demo",
    "demo.zip",
  ),
  "Simplified Chinese",
);

assert.equal(isNetworkFailure("dial tcp: i/o timeout"), true);
assert.equal(isNetworkFailure("TLS handshake timeout"), true);
assert.equal(isNetworkFailure("error connecting to api.github.com"), true);
assert.equal(isNetworkFailure("release not found"), false);
assert.deepEqual(
  parseArguments(["--repo", "dss-time/repo-doctor-skills", "--tag", "v0.4.0"]),
  { repository: "dss-time/repo-doctor-skills", tag: "v0.4.0" },
);
expectFailure(() => parseArguments(["--tag", "main"]), "invalid --tag");
expectFailure(() => parseChecksums(`${digestA}  ../escape.zip\n`), "invalid checksum line");

console.log("Remote Release asset verifier tests passed.");
