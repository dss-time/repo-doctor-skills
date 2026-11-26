import { closeSync, constants, fstatSync, lstatSync, openSync, readdirSync, readSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { credentialFindings } from './credential-findings.mjs';

const require = createRequire(import.meta.url);
const maxBytes = 1024 * 1024;
const budgets = { description_characters: 1024, body_lines: 500, body_estimated_tokens: 5000 };
const skippedDirectories = new Set(['.git', '.hg', '.svn', 'node_modules']);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

function yamlParser() {
  try { return require('../package-assets/skill-lint-yaml/index.js'); }
  catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    return require('yaml');
  }
}

function splitDocument(text) {
  const opening = /^\uFEFF?---[ \t]*\r?\n/.exec(text);
  if (!opening) return null;
  const rest = text.slice(opening[0].length);
  const close = /^---[ \t]*(?:\r?\n|$)/m.exec(rest);
  if (!close) return null;
  return { yaml: rest.slice(0, close.index), body: rest.slice(close.index + close[0].length) };
}

function readSkill(file) {
  const fd = openSync(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > maxBytes) return null;
    const buffer = Buffer.allocUnsafe(stat.size + 1);
    let bytes = 0;
    while (bytes < buffer.length) {
      const count = readSync(fd, buffer, bytes, buffer.length - bytes, null);
      if (!count) break;
      bytes += count;
    }
    if (bytes !== stat.size) return null;
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, bytes));
  } finally { closeSync(fd); }
}

const capabilities = [
  ['file-write', /\b(?:writ(?:e|es|ing)|creat(?:e|es|ing)|edit(?:s|ing)?|modif(?:y|ies|ying)|delet(?:e|es|ing)|updat(?:e|es|ing)|sav(?:e|es|ing)|overwrit(?:e|es|ing))\b.{0,38}\b(?:files?|folders?|director(?:y|ies)|workspace|disk|source code|repository|configs?)\b|(?:写入|覆盖|编辑|修改|删除|新建).{0,12}(?:文件|目录|配置|代码)/i,
    'State which paths may be changed and when user approval is required.'],
  ['shell', /\b(?:run|execute|invoke|launch|use)\b.{0,36}\b(?:shell|terminal|bash|powershell|commands?|scripts?|npm|git)\b|^\s*\x60{3,}\s*(?:sh|bash|shell|zsh|fish|cmd|powershell|pwsh|console)\b|(?:执行|运行|调用).{0,12}(?:命令|脚本|shell|终端)/i,
    'State which commands may be run and what authorization or preflight is required.'],
  ['network', /\b(?:curl|wget)\b|\b(?:fetch|download|upload|send|call|make|access|use)\b.{0,40}\b(?:https?:|(?:external|remote) (?:urls?|servers?|services?)|network|http(?:s)? requests?|apis?|webhooks?)\b|(?:访问|发起|请求|上传|下载|调用).{0,12}(?:网络|外部|远程|API|网页)/i,
    'State which destinations and data are allowed and when network access needs approval.'],
];
const scopeOrApproval = /\b(?:only (?:with|after|if|when|within|under|to)|(?:require|obtain|ask for|with|after|without) (?:explicit )?(?:user |maintainer )?(?:approval|authorization|consent|confirmation|permission)|allowlist(?:ed)?)\b|(?:仅限|仅在|只有|需(?:经|要|获|征得)|未经|已授权|白名单)/i;
const restriction = /\b(?:do not|must not|never|prohibited|read.only)\b|(?:不得|禁止|不要|不能|只读)/i;
const stop = new Set('a an and are as at be by for from in is it of on or that the this to use when with you your skill helps can'.split(' '));

function normalize(value) {
  return value.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)?.join(' ') ?? '';
}

function terms(value) {
  const words = new Set();
  for (const word of value.match(/\p{Script=Han}+|[\p{L}\p{N}]+/gu) ?? []) {
    if (/^\p{Script=Han}{2,}$/u.test(word)) {
      const chars = [...word];
      for (let i = 1; i < chars.length; i += 1) words.add(chars[i - 1] + chars[i]);
    } else if (word.length > 1 && !stop.has(word)) words.add(word);
  }
  return words;
}

function similar(a, b) {
  if (a.description === b.description && a.description.length >= 8) return true;
  if (Math.min(a.words.size, b.words.size) < 4) return false;
  const [short, long] = a.words.size < b.words.size ? [a.words, b.words] : [b.words, a.words];
  if (short.size / long.size < 0.8) return false;
  let shared = 0;
  for (const word of short) if (long.has(word)) shared += 1;
  return shared / (short.size + long.size - shared) >= 0.8;
}

function inspect(text, file, add, yaml) {
  const parts = splitDocument(text);
  if (!parts) {
    add('error', 'frontmatter.missing', 'Opening or closing YAML frontmatter delimiter is missing.',
      'Start SKILL.md with a YAML mapping enclosed by two lines containing ---.');
    return null;
  }
  let document;
  try { document = yaml.parseDocument(parts.yaml, { uniqueKeys: true, stringKeys: true }); }
  catch { /* Untrusted syntax may exceed parser limits. */ }
  if (!document || document.errors.length || !yaml.isMap(document.contents)) {
    add('error', 'frontmatter.invalid', 'Frontmatter must be a valid YAML mapping with unique keys.',
      'Fix YAML syntax or duplicate keys; quote ambiguous values where needed.');
    return null;
  }
  const name = document.get('name');
  const description = document.get('description');
  const validName = typeof name === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) && name.length <= 64;
  const validDescription = typeof description === 'string' && Boolean(description.trim());
  if (!validName) {
    add('error', 'frontmatter.name', 'Expected a skill name of 1–64 lowercase letters, digits or single hyphens.',
      'Set name to a lowercase identifier such as example-skill.');
  } else if (name !== path.basename(path.dirname(file))) {
    add('warning', 'frontmatter.directory-name', 'Skill name differs from its parent directory.',
      'Use a matching directory name when distributing the Skill.');
  }
  if (!validDescription) {
    add('error', 'frontmatter.description', 'A non-empty string description is required.',
      'Describe what the Skill does and when to use it.');
  } else if ([...description].length > budgets.description_characters) {
    add('warning', 'budget.description', 'Description exceeds 1,024 characters.',
      'Keep the purpose and activation conditions in frontmatter. Move detail into the body.');
  }

  const body = parts.body.trim();
  const lines = body ? body.split(/\r?\n/) : [];
  const denseChars = body.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)?.length ?? 0;
  const estimated = Math.ceil((body.length - denseChars) / 4) + denseChars;
  if (lines.length > budgets.body_lines || estimated > budgets.body_estimated_tokens) {
    add('warning', 'budget.body', 'Body has ' + lines.length + ' lines and about ' + estimated + ' tokens (rough estimate).',
      'Aim for 500 lines or fewer and about 5,000 tokens or fewer. Move extended examples into references.');
  }
  const instructions = [...(validDescription ? description.split(/\r?\n/) : []), ...lines];
  for (const [kind, operation, suggestion] of capabilities) {
    if (instructions.some((line, index) => operation.test(line)
      && !restriction.test(line)
      && ![instructions[index - 1], line, instructions[index + 1]].some(value => value && scopeOrApproval.test(value)))) {
      add('warning', 'boundary.' + kind, 'Possible ' + kind + ' instructions lack a nearby authorization or scope statement.', suggestion);
    }
  }

  const triggerNode = document.get('triggers', true);
  const rawTriggers = yaml.isScalar(triggerNode) ? [triggerNode.value]
    : yaml.isSeq(triggerNode) ? triggerNode.items.filter(yaml.isScalar).map(item => item.value) : [];
  const normalized = validDescription ? normalize(description) : '';
  return {
    name: validName ? name : null,
    description: normalized,
    words: terms(normalized),
    triggers: new Set(rawTriggers.filter(value => typeof value === 'string').map(normalize).filter(value => value.length >= 4)),
  };
}

function lint(paths, cwd) {
  const files = new Set();
  const diagnostics = [];
  const visitedDirectories = new Set();
  const display = file => {
    const relative = path.relative(cwd, file).split(path.sep).join('/') || '.';
    return credentialFindings(relative).length ? '[path omitted]' : relative;
  };
  const emit = (file, severity, rule_id, message, suggestion, related) => diagnostics.push({
    path: display(file), severity, rule_id, message, suggestion,
    ...(related ? { related_path: display(related) } : {}),
  });
  const inputError = (file, rule, message) => emit(file, 'error', rule, message,
    'Pass an accessible directory or a regular file named SKILL.md.');
  const visit = (file, explicit) => {
    let stat;
    try { stat = lstatSync(file); }
    catch { inputError(file, 'input.unreadable', 'Could not read the scan path.'); return; }
    if (stat.isDirectory()) {
      if (visitedDirectories.has(file)) return;
      visitedDirectories.add(file);
      let entries;
      try { entries = readdirSync(file, { withFileTypes: true }); }
      catch { inputError(file, 'input.unreadable', 'Could not list the scan directory.'); return; }
      for (const entry of entries.sort((a, b) => compare(a.name, b.name))) {
        if ((entry.isDirectory() && !skippedDirectories.has(entry.name)) || entry.name === 'SKILL.md') {
          if (!entry.isSymbolicLink()) visit(path.join(file, entry.name), false);
        }
      }
    } else if (stat.isFile() && path.basename(file) === 'SKILL.md') files.add(file);
    else if (explicit || !stat.isSymbolicLink()) inputError(file, 'input.unsupported', 'Unsupported scan path.');
  };

  for (const file of [...new Set(paths.map(value => path.resolve(cwd, value)))].sort(compare)) visit(file, true);
  if (!files.size && !diagnostics.length) emit(cwd, 'error', 'input.no-skills', 'No SKILL.md files were found.',
    'Pass the folder containing your Skills or the path to a SKILL.md file.');
  const yaml = files.size ? yamlParser() : null;
  const inspected = [];
  for (const file of [...files].sort(compare)) {
    let text;
    try { text = readSkill(file); }
    catch { inputError(file, 'input.unreadable', 'Could not read the Skill as a UTF-8 file.'); continue; }
    if (text === null) {
      emit(file, 'error', 'input.size', 'Skill exceeds 1 MiB or changed while it was being read.',
        'Reduce the file size or retry after edits finish.');
      continue;
    }
    const found = inspect(text, file, (...args) => emit(file, ...args), yaml);
    if (found) inspected.push({ file, ...found });
  }

  for (let i = 0; i < inspected.length; i += 1) {
    const a = inspected[i];
    for (let j = i + 1; j < inspected.length; j += 1) {
      const b = inspected[j];
      if (a.name && a.name === b.name) emit(b.file, 'warning', 'routing.duplicate-name', 'Both Skills declare the same name.',
        'Give each independently installed Skill a distinct name.', a.file);
      if ([...a.triggers].some(trigger => b.triggers.has(trigger))) emit(b.file, 'warning', 'routing.trigger-overlap', 'Skills share an explicit trigger.',
        'Narrow the trigger phrases or document when each Skill should apply.', a.file);
      else if (similar(a, b)) emit(b.file, 'warning', 'routing.description-overlap', 'Skill descriptions have high lexical similarity.',
        'Make the intended tasks and exclusions for each Skill more distinct.', a.file);
    }
  }
  diagnostics.sort((a, b) => compare(a.path, b.path) || compare(a.rule_id, b.rule_id) || compare(a.related_path ?? '', b.related_path ?? ''));
  const errors = diagnostics.filter(item => item.severity === 'error').length;
  return { schema_version: 1, summary: { files: files.size, errors, warnings: diagnostics.length - errors }, diagnostics };
}

function byPath(diagnostics) {
  const files = new Map();
  for (const item of diagnostics) {
    if (!files.has(item.path)) files.set(item.path, []);
    files.get(item.path).push(item);
  }
  return files;
}

function formatTerminalReport({ summary, diagnostics }) {
  const errors = [];
  const important = [];
  const boundary = [];
  const other = [];
  let routingCount = 0;
  for (const item of diagnostics) {
    if (item.severity === 'error') errors.push(item);
    else if (item.rule_id.startsWith('routing.') || item.rule_id.startsWith('budget.')) {
      important.push(item);
      if (item.rule_id.startsWith('routing.')) routingCount += 1;
    } else if (item.rule_id.startsWith('boundary.')) boundary.push(item);
    else other.push(item);
  }

  const counts = [routingCount + ' routing', (important.length - routingCount) + ' budget', boundary.length + ' boundary'];
  if (other.length) counts.push(other.length + ' other');
  const lines = ['Scanned ' + summary.files + ' SKILL.md file(s): ' + summary.errors + ' error(s), '
    + summary.warnings + ' warning(s) (' + counts.join(', ') + ')'];

  for (const [heading, items] of [
    ['Errors', errors], ['Routing & Budget Warnings', important], ['Other Warnings', other],
  ]) {
    if (!items.length) continue;
    lines.push('', heading);
    for (const [file, findings] of byPath(items)) {
      lines.push('  ' + JSON.stringify(file));
      for (const item of findings) {
        lines.push('    [' + item.rule_id + '] ' + item.message
          + (item.related_path ? ' Related: ' + JSON.stringify(item.related_path) + '.' : '') + ' ' + item.suggestion);
      }
    }
  }

  if (boundary.length) {
    lines.push('', 'Boundary Warnings',
      '  For Skills you maintain, spell out the allowed scope and required approval. For trusted third-party Skills, you can set these reminders aside at your discretion.');
    for (const [file, findings] of byPath(boundary)) {
      const rules = new Set(findings.map(item => item.rule_id));
      const names = capabilities.map(([name]) => name).filter(name => rules.has('boundary.' + name));
      lines.push('  ' + JSON.stringify(file) + ' [' + names.join(', ') + ']');
    }
  }
  return lines.join('\n') + '\n';
}

export function runSkillLintCli(args, { cwd = process.cwd(), stdout = process.stdout, stderr = process.stderr } = {}) {
  const [action, ...options] = args;
  let json = false;
  let positionalOnly = false;
  const paths = [];
  if (action !== 'lint') {
    stderr.write('Unknown Skills operation; see --help.\n');
    return 2;
  }
  for (const value of options) {
    if (!positionalOnly && value === '--') positionalOnly = true;
    else if (!positionalOnly && value === '--json' && !json) json = true;
    else if (!positionalOnly && value.startsWith('-')) {
      stderr.write('Unknown or repeated skills lint option; see --help.\n');
      return 2;
    } else paths.push(value);
  }
  let report;
  try { report = lint(paths.length ? paths : ['.'], cwd); }
  catch {
    stderr.write('Unable to complete Skill lint. Check the installed YAML parser and scan inputs.\n');
    return 2;
  }
  if (json) stdout.write(JSON.stringify(report, null, 2) + '\n');
  else stdout.write(formatTerminalReport(report));
  return report.summary.errors ? 1 : 0;
}
