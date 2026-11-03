import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateSchema } from "./validate-yaml-schemas.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const skillSchema = JSON.parse(
  readFileSync(path.join(repositoryRoot, "schemas", "skill.schema.json"), "utf8"),
);
const riskLevelSchema = skillSchema.properties.risk_level;

export function normalizeRiskLevel(rawRiskLevel) {
  if (rawRiskLevel === undefined) {
    return { status: "missing", value: null, schemaErrors: ["risk_level is required"] };
  }
  if (rawRiskLevel === null || typeof rawRiskLevel !== "object" || Array.isArray(rawRiskLevel)) {
    return {
      status: "structure_error",
      value: typeof rawRiskLevel === "string" ? rawRiskLevel : null,
      schemaErrors: validateSchema(rawRiskLevel, riskLevelSchema, "$.risk_level"),
    };
  }
  if (!Object.hasOwn(rawRiskLevel, "default")) {
    return {
      status: "missing_default",
      value: null,
      schemaErrors: validateSchema(rawRiskLevel, riskLevelSchema, "$.risk_level"),
    };
  }
  if (typeof rawRiskLevel.default !== "string") {
    return {
      status: "invalid_default_type",
      value: null,
      schemaErrors: validateSchema(rawRiskLevel, riskLevelSchema, "$.risk_level"),
    };
  }

  const defaultErrors = validateSchema(
    rawRiskLevel.default,
    riskLevelSchema.properties.default,
    "$.risk_level.default",
  );
  if (defaultErrors.length > 0) {
    return { status: "unknown_value", value: rawRiskLevel.default, schemaErrors: defaultErrors };
  }
  const schemaErrors = validateSchema(rawRiskLevel, riskLevelSchema, "$.risk_level");
  if (schemaErrors.length > 0) {
    return { status: "structure_error", value: rawRiskLevel.default, schemaErrors };
  }
  return { status: "valid", value: rawRiskLevel.default, schemaErrors: [] };
}

export function permissionRiskIssues(metadata) {
  const issues = [];
  const permissions = metadata.permissions;
  const tools = metadata.tool_requirements;
  const risk = normalizeRiskLevel(metadata.risk_level);

  if (risk.status !== "valid") {
    issues.push({
      code: `risk_${risk.status}`,
      message: `risk_level is invalid (${risk.status})${risk.value ? `: ${risk.value}` : ""}`,
    });
  }
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
    issues.push({ code: "permissions_structure", message: "permissions must be a mapping" });
    return { issues, risk };
  }
  if (!tools || typeof tools !== "object" || Array.isArray(tools)) {
    issues.push({ code: "tools_structure", message: "tool_requirements must be a mapping" });
    return { issues, risk };
  }

  if (permissions.write_files === true && tools.filesystem !== "write") {
    issues.push({
      code: "write_without_filesystem",
      message: "write permission requires tool_requirements.filesystem: write",
    });
  }
  if (permissions.run_shell_commands === true && !new Set(["optional", "required"]).has(tools.shell)) {
    issues.push({
      code: "shell_without_tool",
      message: "shell permission conflicts with tool_requirements.shell: none",
    });
  }
  if (permissions.run_shell_commands === false && tools.shell !== "none") {
    issues.push({
      code: "shell_tool_without_permission",
      message: "disabled shell permission requires tool_requirements.shell: none",
    });
  }
  if (permissions.access_network === true && !new Set(["optional", "required"]).has(tools.web)) {
    issues.push({
      code: "network_without_tool",
      message: "network permission conflicts with tool_requirements.web: none",
    });
  }

  if (risk.status === "valid") {
    const writeRisks = new Set(["safe_edit", "sensitive", "destructive"]);
    const executionRisks = new Set(["safe_edit", "tool_execution", "networked", "sensitive", "destructive"]);
    if (permissions.write_files === true && !writeRisks.has(risk.value)) {
      issues.push({
        code: "write_risk_too_low",
        message: `write permission is incompatible with risk_level.default: ${risk.value}`,
      });
    }
    if (permissions.run_shell_commands === true && !executionRisks.has(risk.value)) {
      issues.push({
        code: "shell_risk_too_low",
        message: `shell permission is incompatible with risk_level.default: ${risk.value}`,
      });
    }
    if (permissions.access_network === true && !executionRisks.has(risk.value)) {
      issues.push({
        code: "network_risk_too_low",
        message: `network permission is incompatible with risk_level.default: ${risk.value}`,
      });
    }
    if (permissions.destructive_actions_allowed === true && risk.value !== "destructive") {
      issues.push({
        code: "destructive_risk_mismatch",
        message: "destructive permission requires destructive risk level",
      });
    }
  }

  return { issues, risk };
}
