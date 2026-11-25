const knownCredential = /(?:AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|sk-(?:proj-)?[A-Za-z0-9_-]{32,}|-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----)/;
const placeholder = /^(?:<[^>]+>|\$\{[A-Za-z_][A-Za-z0-9_]*\}|\$[A-Z_]+|(?:your|example|placeholder|synthetic|dummy|test)[_-][\w.-]+|REDACTED|CHANGEME|xxx+)$/i;
const assignment = /(?<![\w.-])["']?([A-Za-z_][A-Za-z0-9_.-]*)["']?[ \t]*[:=][ \t]*/g;
const credentialSuffix = /(?:^|_)(?:api_key|access_token|refresh_token|client_secret|password|passwd|secret|token|secret_access_key|private_key)$/i;
const environmentKey = String.raw`["'][A-Za-z_][A-Za-z0-9_]*["']`;
const environmentLookup = String.raw`(?:process\.env\.[A-Za-z_][A-Za-z0-9_]*|os\.environ\[${environmentKey}\]|(?:os\.environ\.get|os\.getenv|System\.getenv|Environment\.GetEnvironmentVariable)\(${environmentKey}\))`;
const expressionEnd = String.raw`\s*(?=$|[,;}#]|\/\/)`;
const pureEnvironment = new RegExp(`^${environmentLookup}${expressionEnd}`);
const defaultEnvironment = new RegExp(String.raw`^(?:os\.environ\.get|os\.getenv)\(${environmentKey}\s*,\s*(["'])(.*?)\1\s*\)${expressionEnd}`);
const fallbackEnvironment = new RegExp(String.raw`^${environmentLookup}\s*(?:\|\||\?\?)\s*(["'])(.*?)\1${expressionEnd}`);

function isCredentialName(name) {
  const normalized = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[.-]/g, '_');
  return credentialSuffix.test(normalized);
}

function isSafeEnvironmentExpression(expression) {
  if (pureEnvironment.test(expression)) return true;
  const fallback = expression.match(defaultEnvironment) ?? expression.match(fallbackEnvironment);
  // Only explicit synthetic/default placeholders are exempt. Expressions with
  // unrecognized arguments or hardcoded fallback values remain review findings.
  return Boolean(fallback && placeholder.test(fallback[2]));
}

// Return locations and classifications only, never credential values.
export function credentialFindings(text) {
  const findings = [];
  for (const [index, line] of text.split('\n').entries()) {
    if (knownCredential.test(line)) {
      findings.push({ line: index + 1, severity: 'error', kind: 'credential-pattern' });
      continue;
    }
    for (const match of line.matchAll(assignment)) {
      if (!isCredentialName(match[1])) continue;
      const expression = line.slice(match.index + match[0].length);
      // Inspect the entire environment expression before extracting a literal,
      // so getenv("NAME", "value") cannot be mistaken for a pure lookup.
      if (isSafeEnvironmentExpression(expression)) continue;
      const literal = expression.match(/^(?:"([^"\r\n]*)"|'([^'\r\n]*)'|(\$\{[^}\r\n]+\}|[^\s,;}#]+))/);
      const value = literal?.[1] ?? literal?.[2] ?? literal?.[3];
      if (value && !placeholder.test(value)) {
        findings.push({ line: index + 1, column: match.index + 1, severity: 'review', kind: 'credential-assignment' });
      }
    }
  }
  return findings;
}
