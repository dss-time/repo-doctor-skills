import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { normalizeRiskLevel, skillSchema } from "./skill-metadata.mjs";
import { parseYamlSubset, validateSchema } from "./validate-yaml-schemas.mjs";

const root = process.cwd();
const checker = path.join(root, "scripts", "check-skill-quality.mjs");
const creator = path.join(root, "scripts", "create-skill.mjs");
const yamlValidator = path.join(root, "scripts", "validate-yaml-schemas.mjs");
const fixtures = path.join(root, "tests", "fixtures", "skill-quality");
const failures = [];

function runNode(script, args, cwd = root) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
  });
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}

const valid = runNode(checker, [
  "--plugin-skill-dir",
  path.join(fixtures, "valid", "valid-skill"),
]);
expect(valid.status === 0, `valid fixture should exit 0: ${valid.stderr}`);

const invalid = runNode(checker, [
  "--plugin-skill-dir",
  path.join(fixtures, "invalid", "broken-skill"),
]);
expect(invalid.status === 1, "invalid fixture should exit 1");
expect(invalid.stderr.includes("frontmatter must contain only name and description"), "invalid fixture should detect frontmatter fields");
expect(invalid.stderr.includes("broken resource reference"), "invalid fixture should detect broken references");
expect(invalid.stderr.includes("redundant Skill documentation"), "invalid fixture should detect redundant files");
expect(invalid.stderr.includes("orphaned plugin resource"), "invalid fixture should detect orphaned resources");

const tempRoot = mkdtempSync(path.join(tmpdir(), "skill-maintainer-test-"));
try {
  const boundarySkill = path.join(tempRoot, "boundary-skill");
  mkdirSync(path.join(boundarySkill, "agents"), { recursive: true });
  const header = [
    "---",
    "name: boundary-skill",
    "description: Exercise the exact supported line-count boundary.",
    "---",
    "",
    "# Boundary Skill",
  ];
  const exactLines = [...header, ...Array.from({ length: 500 - header.length }, (_, index) => `Line ${index + 1}`)];
  writeFileSync(path.join(boundarySkill, "SKILL.md"), exactLines.join("\n"));
  writeFileSync(
    path.join(boundarySkill, "agents", "openai.yaml"),
    'interface:\n  display_name: "Boundary Skill"\n  short_description: "验证五百行边界输入"\n  default_prompt: "使用 $boundary-skill 验证边界。"\n',
  );
  const boundaryPass = runNode(checker, ["--plugin-skill-dir", boundarySkill]);
  expect(boundaryPass.status === 0, `500-line boundary should pass: ${boundaryPass.stderr}`);
  writeFileSync(path.join(boundarySkill, "SKILL.md"), `${exactLines.join("\n")}\nLine 501`);
  const boundaryFail = runNode(checker, ["--plugin-skill-dir", boundarySkill]);
  expect(boundaryFail.status === 1, "501-line boundary should exit 1");
  expect(boundaryFail.stderr.includes("exceeds 500 lines"), "501-line boundary should report the line limit");

  const createRoot = path.join(tempRoot, "creator");
  for (const pack of ["one", "two"]) {
    const packRoot = path.join(createRoot, "packs", "demo", pack);
    mkdirSync(path.join(packRoot, "skills"), { recursive: true });
    writeFileSync(path.join(packRoot, "pack.yaml"), `id: demo.${pack}\ncategory: demo\nskills:\n  - placeholder\n`);
  }
  const createSuccess = runNode(
    creator,
    ["--pack", "demo/one", "--name", "fixture-skill", "--id", "demo.fixture-skill", "--category", "demo"],
    createRoot,
  );
  expect(createSuccess.status === 0, `creator success fixture should exit 0: ${createSuccess.stderr}`);
  expect(
    readFileSync(path.join(createRoot, "packs", "demo", "one", "skills", "fixture-skill", "skill.yaml"), "utf8").includes("id: demo.fixture-skill"),
    "creator should write the canonical skill metadata",
  );
  const duplicate = runNode(
    creator,
    ["--pack", "demo/two", "--name", "fixture-skill", "--id", "demo.fixture-skill", "--category", "demo"],
    createRoot,
  );
  expect(duplicate.status === 1, "duplicate global slug should exit 1");
  expect(duplicate.stderr.includes("globally unique slugs"), "duplicate global slug should explain adapter collision");

  const mismatchedId = runNode(
    creator,
    ["--pack", "demo/two", "--name", "another-skill", "--id", "demo.wrong-slug", "--category", "demo"],
    createRoot,
  );
  expect(mismatchedId.status === 1, "mismatched id suffix should exit 1");
  expect(mismatchedId.stderr.includes("must end with the exact --name slug"), "mismatched id should explain the suffix contract");
  expect(!existsSync(path.join(createRoot, "packs", "demo", "two", "skills", "another-skill")), "failed creation must not leave a partial directory");

  const wrongCategory = runNode(
    creator,
    ["--pack", "demo/two", "--name", "category-skill", "--id", "demo.category-skill", "--category", "office"],
    createRoot,
  );
  expect(wrongCategory.status === 1, "pack category mismatch should exit 1");
  expect(wrongCategory.stderr.includes("must match pack category demo"), "category mismatch should name the canonical category");

  function writeYamlFixture(fixtureRoot, packYaml, skillYaml) {
    const packRoot = path.join(fixtureRoot, "packs", "fixture", "pack");
    mkdirSync(path.join(packRoot, "skills", "fixture-skill"), { recursive: true });
    writeFileSync(path.join(packRoot, "pack.yaml"), packYaml);
    writeFileSync(path.join(packRoot, "skills", "fixture-skill", "skill.yaml"), skillYaml);
  }

  const validPackYaml = readFileSync(path.join(root, "packs", "_template", "pack.yaml"), "utf8");
  const validSkillYaml = readFileSync(path.join(root, "packs", "_template", "skills", "example-skill", "skill.yaml"), "utf8");
  const validYamlRoot = path.join(tempRoot, "yaml-valid");
  writeYamlFixture(validYamlRoot, validPackYaml, validSkillYaml);
  const validYaml = runNode(yamlValidator, ["--root", validYamlRoot]);
  expect(validYaml.status === 0, `valid YAML/schema fixture should exit 0: ${validYaml.stderr}`);

  const malformedYamlRoot = path.join(tempRoot, "yaml-malformed");
  writeYamlFixture(malformedYamlRoot, "id: fixture.pack\n   name:\n", validSkillYaml);
  const malformedYaml = runNode(yamlValidator, ["--root", malformedYamlRoot]);
  expect(malformedYaml.status === 1, "illegal YAML indentation should exit 1");
  expect(malformedYaml.stderr.includes("indentation must use multiples of two spaces"), "illegal indentation should be reported clearly");

  const duplicateYamlRoot = path.join(tempRoot, "yaml-duplicate");
  writeYamlFixture(duplicateYamlRoot, `${validPackYaml}\nid: duplicate.pack\n`, validSkillYaml);
  const duplicateYaml = runNode(yamlValidator, ["--root", duplicateYamlRoot]);
  expect(duplicateYaml.status === 1, "duplicate YAML key should exit 1");
  expect(duplicateYaml.stderr.includes("duplicate key id"), "duplicate YAML key should name the duplicate");

  const invalidSchemaRoot = path.join(tempRoot, "yaml-schema-invalid");
  writeYamlFixture(invalidSchemaRoot, validPackYaml.replace("visibility: public", "visibility: external"), validSkillYaml);
  const invalidSchema = runNode(yamlValidator, ["--root", invalidSchemaRoot]);
  expect(invalidSchema.status === 1, "schema enum violation should exit 1");
  expect(invalidSchema.stderr.includes("is not one of"), "schema enum violation should report allowed values");

  const invalidPackStatusRoot = path.join(tempRoot, "yaml-pack-status-invalid");
  writeYamlFixture(
    invalidPackStatusRoot,
    validPackYaml.replace("status: draft", "status: candidate"),
    validSkillYaml,
  );
  const invalidPackStatus = runNode(yamlValidator, ["--root", invalidPackStatusRoot]);
  expect(invalidPackStatus.status === 1, "unknown Pack status should fail Schema validation");
  expect(
    invalidPackStatus.stderr.includes("$.status: value \"candidate\" is not one of"),
    "unknown Pack status should report the lifecycle enum violation",
  );

  const riskForms = [
    {
      name: "scalar known value",
      yaml: "risk_level: tool_execution\n",
      status: "structure_error",
      schemaValid: false,
    },
    {
      name: "inline object",
      yaml: "risk_level: { default: tool_execution }\n",
      status: "valid",
      value: "tool_execution",
      schemaValid: true,
    },
    {
      name: "block object",
      yaml: "risk_level:\n  default: tool_execution\n",
      status: "valid",
      value: "tool_execution",
      schemaValid: true,
    },
    {
      name: "missing risk",
      yaml: "id: fixture\n",
      status: "missing",
      schemaValid: false,
    },
    {
      name: "missing default",
      yaml: "risk_level: {}\n",
      status: "missing_default",
      schemaValid: false,
    },
    {
      name: "invalid default type",
      yaml: "risk_level: { default: true }\n",
      status: "invalid_default_type",
      schemaValid: false,
    },
    {
      name: "unknown default",
      yaml: "risk_level: { default: unknown-risk }\n",
      status: "unknown_value",
      value: "unknown-risk",
      schemaValid: false,
    },
    {
      name: "extra mapping field",
      yaml: "risk_level: { default: tool_execution, extra: value }\n",
      status: "structure_error",
      value: "tool_execution",
      schemaValid: false,
    },
  ];
  for (const fixture of riskForms) {
    const parsed = parseYamlSubset(fixture.yaml);
    const normalized = normalizeRiskLevel(parsed.risk_level);
    const schemaErrors = validateSchema(
      parsed.risk_level,
      skillSchema.properties.risk_level,
      "$.risk_level",
    );
    expect(normalized.status === fixture.status, `${fixture.name} should normalize as ${fixture.status}`);
    if (fixture.value) expect(normalized.value === fixture.value, `${fixture.name} should preserve its normalized value`);
    expect((schemaErrors.length === 0) === fixture.schemaValid, `${fixture.name} should have the expected Schema status`);
  }
  expect(
    normalizeRiskLevel(parseYamlSubset(riskForms[1].yaml).risk_level).value
      === normalizeRiskLevel(parseYamlSubset(riskForms[2].yaml).risk_level).value,
    "inline and block risk mappings must normalize to the same value",
  );

  function replaceYamlSection(source, key, replacement) {
    const lines = source.split("\n");
    const start = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (start === -1) throw new Error(`missing YAML section ${key}`);
    let end = start + 1;
    while (end < lines.length && lines[end].startsWith("  ")) end += 1;
    lines.splice(start, end - start, ...replacement.split("\n"));
    return lines.join("\n");
  }

  const sourceRiskSkill = path.join(
    root,
    "packs",
    "engineering",
    "repo-doctor",
    "skills",
    "requirements-to-spec",
  );
  function runRiskFixture(name, { permissions, risk, filesystem = "read" }) {
    const fixtureRoot = path.join(tempRoot, "risk-quality", name);
    const packRoot = path.join(fixtureRoot, "packs", "fixture", "risk-pack");
    const skillRoot = path.join(packRoot, "skills", "requirements-to-spec");
    mkdirSync(path.dirname(skillRoot), { recursive: true });
    cpSync(sourceRiskSkill, skillRoot, { recursive: true });
    writeFileSync(path.join(packRoot, "pack.yaml"), "skills:\n  - requirements-to-spec\n");
    let yaml = readFileSync(path.join(skillRoot, "skill.yaml"), "utf8");
    yaml = replaceYamlSection(yaml, "permissions", permissions);
    yaml = replaceYamlSection(yaml, "risk_level", risk);
    yaml = yaml.replace("filesystem: read", `filesystem: ${filesystem}`);
    if (permissions.includes("run_shell_commands: true")) yaml = yaml.replace("shell: none", "shell: optional");
    writeFileSync(path.join(skillRoot, "skill.yaml"), yaml);
    return runNode(checker, ["--root", fixtureRoot]);
  }

  const readOnlyPermissionsInline = "permissions: { read_files: true, write_files: false, run_shell_commands: false, access_network: false, destructive_actions_allowed: false }";
  const readOnlyPermissionsBlock = "permissions:\n  read_files: true\n  write_files: false\n  run_shell_commands: false\n  access_network: false\n  destructive_actions_allowed: false";
  const shellPermissionsInline = "permissions: { read_files: true, write_files: false, run_shell_commands: true, access_network: false, destructive_actions_allowed: false }";
  const shellPermissionsBlock = "permissions:\n  read_files: true\n  write_files: false\n  run_shell_commands: true\n  access_network: false\n  destructive_actions_allowed: false";
  const writePermissionsBlock = "permissions:\n  read_files: true\n  write_files: true\n  run_shell_commands: false\n  access_network: false\n  destructive_actions_allowed: false";
  const destructivePermissions = "permissions: { read_files: true, write_files: false, run_shell_commands: false, access_network: false, destructive_actions_allowed: true }";

  for (const [name, permissions, risk] of [
    ["valid-inline-read-only", readOnlyPermissionsInline, "risk_level: { default: read_only }"],
    ["valid-block-read-only", readOnlyPermissionsBlock, "risk_level:\n  default: read_only"],
    ["valid-inline-tool", shellPermissionsInline, "risk_level: { default: tool_execution }"],
    ["valid-block-tool", shellPermissionsBlock, "risk_level:\n  default: tool_execution"],
  ]) {
    const result = runRiskFixture(name, { permissions, risk });
    expect(result.status === 0, `${name} should pass the quality checker: ${result.stderr}`);
  }

  for (const fixture of [
    {
      name: "scalar-risk",
      permissions: readOnlyPermissionsBlock,
      risk: "risk_level: tool_execution",
      error: "risk_level is invalid (structure_error): tool_execution",
    },
    {
      name: "missing-default",
      permissions: readOnlyPermissionsBlock,
      risk: "risk_level: {}",
      error: "risk_level is invalid (missing_default)",
    },
    {
      name: "invalid-default-type",
      permissions: readOnlyPermissionsBlock,
      risk: "risk_level: { default: true }",
      error: "risk_level is invalid (invalid_default_type)",
    },
    {
      name: "unknown-risk",
      permissions: readOnlyPermissionsBlock,
      risk: "risk_level: { default: unknown-risk }",
      error: "risk_level is invalid (unknown_value): unknown-risk",
    },
    {
      name: "inline-low-shell",
      permissions: shellPermissionsInline,
      risk: "risk_level: { default: read_only }",
      error: "shell permission is incompatible with risk_level.default: read_only",
    },
    {
      name: "block-low-shell",
      permissions: shellPermissionsBlock,
      risk: "risk_level:\n  default: read_only",
      error: "shell permission is incompatible with risk_level.default: read_only",
    },
    {
      name: "block-low-write",
      permissions: writePermissionsBlock,
      risk: "risk_level:\n  default: read_only",
      filesystem: "write",
      error: "write permission is incompatible with risk_level.default: read_only",
    },
    {
      name: "destructive-mismatch",
      permissions: destructivePermissions,
      risk: "risk_level: { default: safe_edit }",
      error: "destructive permission requires destructive risk level",
    },
  ]) {
    const result = runRiskFixture(fixture.name, fixture);
    expect(result.status === 1, `${fixture.name} must fail the quality checker`);
    expect(result.stderr.includes(fixture.error), `${fixture.name} should report ${fixture.error}`);
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

if (failures.length) {
  console.error("Maintainer tool tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Maintainer tool tests passed for quality, creation, YAML parsing, Schema, and risk/permission boundary cases.");
