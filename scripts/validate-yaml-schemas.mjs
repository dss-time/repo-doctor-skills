import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sortedDirectoryEntries } from "./deterministic-files.mjs";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const options = {
    root: process.cwd(),
    skillSchema: path.join(scriptRoot, "schemas", "skill.schema.json"),
    packSchema: path.join(scriptRoot, "schemas", "pack.schema.json"),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (!["--root", "--skill-schema", "--pack-schema"].includes(flag)) {
      throw new Error(`unknown argument: ${flag}`);
    }
    const value = argv[index + 1];
    if (!value) throw new Error(`${flag} requires a path`);
    const key = flag === "--root" ? "root" : flag === "--skill-schema" ? "skillSchema" : "packSchema";
    options[key] = path.resolve(value);
    index += 1;
  }
  return options;
}

function splitFlow(value, lineNumber) {
  const parts = [];
  let current = "";
  let quote = null;
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      current += char;
      if (char === quote) {
        if (quote === "'" && value[index + 1] === "'") {
          current += value[index + 1];
          index += 1;
        } else if (quote === '"' && value[index - 1] === "\\") {
          // JSON-style escaping keeps this quote inside the string.
        } else {
          quote = null;
        }
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
    } else if (char === "[" || char === "{") {
      depth += 1;
      current += char;
    } else if (char === "]" || char === "}") {
      depth -= 1;
      if (depth < 0) throw new Error(`line ${lineNumber}: unbalanced flow collection`);
      current += char;
    } else if (char === "," && depth === 0) {
      if (!current.trim()) throw new Error(`line ${lineNumber}: empty flow collection item`);
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (quote || depth !== 0) throw new Error(`line ${lineNumber}: unclosed flow collection or quote`);
  if (current.trim()) parts.push(current.trim());
  else if (value.trim()) throw new Error(`line ${lineNumber}: trailing comma is not supported`);
  return parts;
}

function findFlowColon(value) {
  let quote = null;
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === quote && value[index - 1] !== "\\") quote = null;
      continue;
    }
    if (char === "'" || char === '"') quote = char;
    else if (char === "[" || char === "{") depth += 1;
    else if (char === "]" || char === "}") depth -= 1;
    else if (char === ":" && depth === 0) return index;
  }
  return -1;
}

function parseScalar(raw, lineNumber) {
  const value = raw.trim();
  if (!value) throw new Error(`line ${lineNumber}: empty scalar`);

  if (value.startsWith("[")) {
    if (!value.endsWith("]")) throw new Error(`line ${lineNumber}: unclosed flow sequence`);
    const body = value.slice(1, -1).trim();
    return body ? splitFlow(body, lineNumber).map((item) => parseScalar(item, lineNumber)) : [];
  }
  if (value.startsWith("{")) {
    if (!value.endsWith("}")) throw new Error(`line ${lineNumber}: unclosed flow mapping`);
    const result = Object.create(null);
    const body = value.slice(1, -1).trim();
    if (!body) return result;
    for (const entry of splitFlow(body, lineNumber)) {
      const separator = findFlowColon(entry);
      if (separator < 1) throw new Error(`line ${lineNumber}: invalid flow mapping entry`);
      const key = entry.slice(0, separator).trim();
      if (!/^[A-Za-z0-9_-]+$/.test(key)) throw new Error(`line ${lineNumber}: unsupported mapping key ${key}`);
      if (Object.hasOwn(result, key)) throw new Error(`line ${lineNumber}: duplicate key ${key}`);
      result[key] = parseScalar(entry.slice(separator + 1), lineNumber);
    }
    return result;
  }
  if (value.startsWith('"')) {
    if (!value.endsWith('"')) throw new Error(`line ${lineNumber}: unclosed double-quoted scalar`);
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`line ${lineNumber}: invalid double-quoted scalar (${error.message})`);
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'")) throw new Error(`line ${lineNumber}: unclosed single-quoted scalar`);
    return value.slice(1, -1).replaceAll("''", "'");
  }
  if (/^[|>&*!]/.test(value)) throw new Error(`line ${lineNumber}: unsupported YAML feature in scalar`);
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return Number(value);
  return value;
}

export function parseYamlSubset(source) {
  const tokens = [];
  const lines = source.replace(/^\uFEFF/, "").replaceAll("\r\n", "\n").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.includes("\t")) throw new Error(`line ${index + 1}: tabs are not allowed for indentation`);
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    if (indent % 2 !== 0) throw new Error(`line ${index + 1}: indentation must use multiples of two spaces`);
    tokens.push({ indent, content: line.slice(indent), lineNumber: index + 1 });
  }
  if (!tokens.length) throw new Error("document is empty");
  if (tokens[0].indent !== 0) throw new Error(`line ${tokens[0].lineNumber}: root content must start at indentation zero`);

  function parseNode(start, indent) {
    const first = tokens[start];
    if (!first || first.indent !== indent) {
      throw new Error(`line ${first?.lineNumber ?? lines.length}: expected indentation ${indent}`);
    }
    const isArray = first.content === "-" || first.content.startsWith("- ");
    const container = isArray ? [] : Object.create(null);
    let cursor = start;

    while (cursor < tokens.length && tokens[cursor].indent === indent) {
      const token = tokens[cursor];
      const listLine = token.content === "-" || token.content.startsWith("- ");
      if (listLine !== isArray) throw new Error(`line ${token.lineNumber}: cannot mix sequence and mapping entries`);

      if (isArray) {
        const raw = token.content.slice(1).trim();
        if (raw) {
          container.push(parseScalar(raw, token.lineNumber));
          cursor += 1;
          if (cursor < tokens.length && tokens[cursor].indent > indent) {
            throw new Error(`line ${tokens[cursor].lineNumber}: unexpected indentation after a scalar sequence item`);
          }
        } else {
          const child = tokens[cursor + 1];
          if (!child || child.indent <= indent) throw new Error(`line ${token.lineNumber}: sequence item has no value`);
          if (child.indent !== indent + 2) throw new Error(`line ${child.lineNumber}: indentation jumped more than two spaces`);
          const parsed = parseNode(cursor + 1, indent + 2);
          container.push(parsed.value);
          cursor = parsed.next;
        }
        continue;
      }

      const match = token.content.match(/^([A-Za-z0-9_-]+):(.*)$/);
      if (!match) throw new Error(`line ${token.lineNumber}: expected an unquoted mapping key followed by ':'`);
      const [, key, remainder] = match;
      if (Object.hasOwn(container, key)) throw new Error(`line ${token.lineNumber}: duplicate key ${key}`);
      const raw = remainder.trim();
      if (raw) {
        container[key] = parseScalar(raw, token.lineNumber);
        cursor += 1;
        if (cursor < tokens.length && tokens[cursor].indent > indent) {
          throw new Error(`line ${tokens[cursor].lineNumber}: unexpected indentation after scalar key ${key}`);
        }
      } else {
        const child = tokens[cursor + 1];
        if (!child || child.indent <= indent) throw new Error(`line ${token.lineNumber}: key ${key} has no value`);
        if (child.indent !== indent + 2) throw new Error(`line ${child.lineNumber}: indentation jumped more than two spaces`);
        const parsed = parseNode(cursor + 1, indent + 2);
        container[key] = parsed.value;
        cursor = parsed.next;
      }
    }
    if (cursor < tokens.length && tokens[cursor].indent > indent) {
      throw new Error(`line ${tokens[cursor].lineNumber}: unexpected indentation`);
    }
    return { value: container, next: cursor };
  }

  const parsed = parseNode(0, 0);
  if (parsed.next !== tokens.length) {
    throw new Error(`line ${tokens[parsed.next].lineNumber}: indentation does not match an open mapping or sequence`);
  }
  if (Array.isArray(parsed.value)) throw new Error("document root must be a mapping");
  return parsed.value;
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function validateSchema(value, schema, instancePath = "$") {
  const errors = [];
  const expectedType = schema.type;
  if (expectedType) {
    const actualType = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
    const matches = (Array.isArray(expectedType) ? expectedType : [expectedType]).some(type => type === "object"
      ? actualType === "object" && value !== null && !Array.isArray(value)
      : type === "integer"
        ? Number.isInteger(value)
        : actualType === type);
    if (!matches) return [`${instancePath}: expected type ${expectedType}, received ${actualType}`];
  }

  if (Object.hasOwn(schema, "const") && !sameValue(value, schema.const)) {
    errors.push(`${instancePath}: expected constant ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.some((candidate) => sameValue(value, candidate))) {
    errors.push(`${instancePath}: value ${JSON.stringify(value)} is not one of ${schema.enum.map(JSON.stringify).join(", ")}`);
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${instancePath}: number is below minimum ${schema.minimum}`);
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && [...value].length < schema.minLength) {
      errors.push(`${instancePath}: string is shorter than minLength ${schema.minLength}`);
    }
    if (schema.pattern) {
      let pattern;
      try {
        pattern = new RegExp(schema.pattern, "u");
      } catch (error) {
        errors.push(`${instancePath}: schema has invalid pattern (${error.message})`);
      }
      if (pattern && !pattern.test(value)) errors.push(`${instancePath}: string does not match pattern ${schema.pattern}`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${instancePath}: array has fewer than minItems ${schema.minItems}`);
    }
    if (schema.uniqueItems) {
      for (let left = 0; left < value.length; left += 1) {
        for (let right = left + 1; right < value.length; right += 1) {
          if (sameValue(value[left], value[right])) errors.push(`${instancePath}: array items ${left} and ${right} are duplicates`);
        }
      }
    }
    if (schema.items) {
      value.forEach((item, index) => errors.push(...validateSchema(item, schema.items, `${instancePath}[${index}]`)));
    }
    if (schema.contains && !value.some((item, index) => validateSchema(item, schema.contains, `${instancePath}[${index}]`).length === 0)) {
      errors.push(`${instancePath}: no array item satisfies contains`);
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(value, required)) errors.push(`${instancePath}: missing required property ${required}`);
    }
    for (const [key, child] of Object.entries(value)) {
      if (schema.properties && Object.hasOwn(schema.properties, key)) {
        errors.push(...validateSchema(child, schema.properties[key], `${instancePath}.${key}`));
      } else if (schema.additionalProperties === false) {
        errors.push(`${instancePath}: additional property ${key} is not allowed`);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        errors.push(...validateSchema(child, schema.additionalProperties, `${instancePath}.${key}`));
      }
    }
  }
  return errors;
}

function collectYamlFiles(directory, output = []) {
  if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) return output;
  for (const entry of sortedDirectoryEntries(directory)) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collectYamlFiles(target, output);
    else if (entry.isFile() && (entry.name === "skill.yaml" || entry.name === "pack.yaml")) output.push(target);
  }
  return output;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`YAML schema validation failed:\n- ${error.message}`);
    process.exit(1);
  }

  const failures = [];
  let schemas;
  try {
    schemas = {
      "skill.yaml": JSON.parse(readFileSync(options.skillSchema, "utf8")),
      "pack.yaml": JSON.parse(readFileSync(options.packSchema, "utf8")),
    };
  } catch (error) {
    console.error(`YAML schema validation failed:\n- unable to read schema: ${error.message}`);
    process.exit(1);
  }

  const files = collectYamlFiles(path.join(options.root, "packs"));
  if (!files.length) failures.push("packs: no skill.yaml or pack.yaml files found");
  for (const file of files) {
    const relative = path.relative(options.root, file);
    let document;
    try {
      document = parseYamlSubset(readFileSync(file, "utf8"));
    } catch (error) {
      failures.push(`${relative}: YAML parse error: ${error.message}`);
      continue;
    }
    for (const error of validateSchema(document, schemas[path.basename(file)])) failures.push(`${relative}: ${error}`);
  }

  if (failures.length) {
    console.error("YAML schema validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  const skillCount = files.filter((file) => path.basename(file) === "skill.yaml").length;
  const packCount = files.length - skillCount;
  console.log(`YAML schema validation passed for ${skillCount} skills and ${packCount} packs.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
