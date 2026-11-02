// Assemble successful current-bound cases without overwriting original attempts.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { liveEvidenceBinding, assertLiveEvidenceBinding } from './live-evidence-binding.mjs';
import { inspectCoordinationRelease } from './check-coordination-release.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputs = process.argv.slice(2);
if (!inputs.length) throw new Error('Provide current trial report JSON paths');
const version = JSON.parse(readFileSync(path.join(root,'package.json'),'utf8')).version;
const binding = liveEvidenceBinding(root);
const required = new Map([['simple','PASS'],['workflow','PASS'],['core-review','REVIEW_COMPLETED']]);
const cases = new Map();
const sources = inputs.map(input => {
  const absolute = path.resolve(input);
  const relative = path.relative(root,absolute).split(path.sep).join('/');
  if (relative.startsWith('../') || !relative.startsWith('tests/reports/')) throw new Error('Only repository trial report artifacts are accepted');
  const bytes = readFileSync(absolute); const report = JSON.parse(bytes);
  assertLiveEvidenceBinding(report.content_binding,binding);
  if (report.project_version !== version) throw new Error('Trial project version changed');
  for (const entry of report.cases ?? []) {
    if (required.get(entry.case) !== entry.result) continue;
    if (cases.has(entry.case)) throw new Error(`Ambiguous duplicate successful case: ${entry.case}`);
    cases.set(entry.case, entry);
  }
  return { path: relative, sha256: createHash('sha256').update(bytes).digest('hex'), result: report.result };
});
const report = { schema_version: 1, project_version: version, date: new Date().toISOString(), result: 'PASS', content_binding: binding,
  cases: [...cases.values()], source_reports: sources,
  full_corpus_live_model_status: 'UNKNOWN',
  limitations: ['Scoped Codex serial CLI adapter with synthetic fixtures.', 'No Claude Code/Cursor native runtime claim.', 'No old/new matched Token savings measurement.'] };
const errors=inspectCoordinationRelease(root,report,version);
if(errors.length)throw new Error(errors.join('\n'));
const output=path.join(root,'tests/reports',`coordination-release-${version}.json`);
if(existsSync(output))throw new Error('Candidate report already exists; preserve it and explicitly choose a new release evidence version');
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
process.stdout.write(`Candidate evidence: ${path.relative(root,output)}\n`);
