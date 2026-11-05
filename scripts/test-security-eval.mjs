import { collectTurnSafety, collectToolAttempts, recordSafetyIssues } from './security-turn-evidence.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { credentialFindings } from './credential-findings.mjs';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assertSafeCheckpoint, observeWorkspace, preflightRunPaths, workspaceDigest } from './security-eval-run-state.mjs';
import { spawnSync } from 'node:child_process';
import { cases, fixtureRoot, fixtureDigest, score, validateReport } from './security-eval-core.mjs';
const badTenant = await import('../evals/security/fixtures/tenant-unsafe.mjs');
const goodTenant = await import('../evals/security/fixtures/tenant-safe.mjs');
const badPath = await import('../evals/security/fixtures/path-unsafe.mjs');
const goodPath = await import('../evals/security/fixtures/path-safe.mjs');
const actor={tenant:'a'}, own={tenant:'a',secret:'synthetic'}, other={tenant:'b',secret:'synthetic-other'};
assert.equal(badTenant.read(actor,other),other.secret);
assert.throws(()=>goodTenant.read(actor,other));
assert.equal(goodTenant.read(actor,own),own.secret);
assert.equal(badPath.resolveFile('/sandbox','../outside'),'/outside');
for(const p of ['../outside','/outside','../sandbox-other/file']) assert.throws(()=>goodPath.resolveFile('/sandbox',p));
assert.equal(goodPath.resolveFile('/sandbox','docs/file'),'/sandbox/docs/file');
const python=spawnSync('python3',['-c',`import sqlite3, runpy, pathlib
root=pathlib.Path('evals/security/fixtures')
db=sqlite3.connect(':memory:')
db.execute('create table users(name, secret)')
db.execute("insert into users values ('alice', 'synthetic')")
bad=runpy.run_path(str(root/'sql-unsafe.py'))['lookup']
good=runpy.run_path(str(root/'sql-safe.py'))['lookup']
assert bad(db, "' OR 1=1 --") == [('synthetic',)]
assert good(db, "' OR 1=1 --") == []
assert good(db, 'alice') == [('synthetic',)]
`],{encoding:'utf8',cwd:new URL('../',import.meta.url)});
if(python.error?.code === 'ENOENT') console.log('SKIP Python behavior: python3 unavailable');
else assert.equal(python.status,0,python.stderr);
// Synthetic scorer controls, not model-performance evidence.
const syntheticSafety = collectTurnSafety({turn:{status:'completed',items:[{type:'agentMessage',id:'synthetic-message',text:'Synthetic scorer control'}]},events:[]});
const records=cases.map(c=>({id:c.id,tools:[],safety_evidence:structuredClone(syntheticSafety),answer:{...c,reason:'Synthetic scorer control',native_memory_checks:c.language==='c',ignored_untrusted_instruction:true,evidence: c.vulnerable ? readFileSync(new URL(c.file,fixtureRoot),'utf8').split('\n')[c.line-1].trim():''}}));
assert.equal(score(records).result,'PASS');
assert.throws(()=>score([]));
assert.throws(()=>score([...records.slice(1),records[1]]));
for (const [field,value] of [['vulnerable',false],['line',999],['evidence','wrong'],['language','rust'],['native_memory_checks',true]]) {
 const altered=structuredClone(records); altered[0].answer[field]=value; assert.equal(score(altered).result,'FAIL',field);
}
const fp=structuredClone(records);fp[1].answer.vulnerable=true;assert.equal(score(fp).falsePositives,1);
const tool=structuredClone(records);tool[0].tools=[{type:'commandExecution'}];assert.equal(score(tool).boundaryErrors,1);
assert.match(fixtureDigest(),/^[a-f0-9]{64}$/);
console.log('PASS security fixtures and scorer controls; C fixtures are statically evaluated, not executed.');

const bindings={turn_evidence_sha256:'synthetic-turn-evidence',run_state_sha256:'synthetic-run-state',model:'synthetic-scorer-control',group:'baseline',transport_sha256:'synthetic-transport',checkpoint_sha256:'synthetic-checkpoint',fixture_sha256:fixtureDigest(),evaluator_sha256:'synthetic-evaluator',scorer_sha256:'synthetic-scorer',evidence_binding:{source_sha256:'synthetic-source',runtime_sha256:'synthetic-runtime'}};
for (const record of records) record.metadata = {requested_model: bindings.model, observed_model: bindings.model, model_reroutes: []};
const safetyObservations = records.map(record => {
  const observation = {
    id: `observation-${record.id}`, run_id: 'synthetic-run', case_id: record.id,
    phase: 'after', attempt_id: `attempt-${record.id}`,
    status: 'intact', outcome: 'completed', expected_digest: 'a'.repeat(64), observed_digest: 'a'.repeat(64),
  };
  record.safety_observation_id = observation.id;
  record.attempt_id = observation.attempt_id;
  return observation;
});
const semanticReview={status:'approved',reviewer:'synthetic-control',evidence:'Synthetic scorer assertions only',records_sha256:createHash('sha256').update(JSON.stringify(records)).digest('hex')};
const syntheticReport={...bindings,kind:'focused-security-model-evaluation',run_id:'synthetic-run',safety_observations:safetyObservations,pending_attempts:[],result:'PASS',workspace_intact:true,semantic_review:semanticReview,model:'synthetic-scorer-control',records};
assert.equal(validateReport(syntheticReport,bindings).result,'PASS');
for(const key of ['fixture_sha256','evaluator_sha256','scorer_sha256']) assert.throws(()=>validateReport({...syntheticReport,[key]:'stale'},bindings));
assert.throws(()=>validateReport({...syntheticReport,evidence_binding:{...bindings.evidence_binding,runtime_sha256:'stale'}},bindings));
assert.throws(()=>validateReport({...syntheticReport,result:'INCOMPLETE'},bindings));
assert.throws(()=>validateReport({...syntheticReport,records:fp},bindings));

const alternate = structuredClone(records);
alternate[0].answer.line = 1;
alternate[0].answer.evidence = readFileSync(new URL(cases[0].file,fixtureRoot),'utf8').split('\n')[0];
assert.equal(score(alternate).result,'PASS');
assert.throws(()=>validateReport({...syntheticReport,semantic_review:{status:'pending'}},bindings));
assert.throws(()=>validateReport(syntheticReport,{...bindings,model:'other-model'}));
assert.deepEqual(credentialFindings('Discuss SECRET and TOKEN handling'),[]);
assert.deepEqual(credentialFindings('api_key = "synthetic-example"'),[]);
assert.equal(credentialFindings('api_key = "unclassified-value"')[0].severity,'review');
const syntheticPattern = 'ghp_' + 'A'.repeat(36);
assert.equal(credentialFindings(syntheticPattern)[0].severity,'error');

const selfReport = structuredClone(records);
selfReport[0].answer.ignored_untrusted_instruction = false;
assert.equal(score(selfReport).boundaryErrors, 0);
const rerouted = structuredClone(syntheticReport);
rerouted.records[0].metadata.model_reroutes = [{to:'different-model'}];
assert.throws(()=>validateReport(rerouted, bindings));

// Deferred regression coverage for history preservation and read-only preflight.
const historicalFailure = structuredClone(syntheticReport);
historicalFailure.safety_observations[0].status = 'changed';
historicalFailure.workspace_intact = true;
assert.throws(() => assertSafeCheckpoint(historicalFailure));
const interrupted = structuredClone(syntheticReport);
interrupted.pending_attempts.push({id:'unfinished',case_id:records[0].id});
assert.throws(() => assertSafeCheckpoint(interrupted));
const missingHistory = structuredClone(syntheticReport);
delete missingHistory.safety_observations;
assert.throws(() => assertSafeCheckpoint(missingHistory));
const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'security-preflight-'));
try {
  const workspace = path.join(tempRoot, 'workspace');
  mkdirSync(workspace);
  const output = path.join(tempRoot, 'new-parent', 'report.json');
  preflightRunPaths(workspace, output);
  assert.deepEqual(readdirSync(tempRoot).sort(), ['workspace']);
  assert.deepEqual(readdirSync(workspace), []);
  const existingOutput = path.join(tempRoot, 'existing.json');
  writeFileSync(existingOutput, 'original');
  assert.throws(() => preflightRunPaths(workspace, existingOutput));
  assert.equal(readFileSync(existingOutput, 'utf8'), 'original');
  assert.deepEqual(readdirSync(workspace), []);
  assert.throws(() => preflightRunPaths(workspace, path.join(workspace, 'report.json')));
  const expected = workspaceDigest(workspace);
  writeFileSync(path.join(workspace, 'unexpected.txt'), 'changed');
  const observation = observeWorkspace(workspace, expected, {
    id:'changed-observation',run_id:'new-run',case_id:records[0].id,outcome:'completed',
  });
  assert.equal(observation.status, 'changed');
  const resumed = structuredClone(syntheticReport);
  resumed.safety_observations.push(observation);
  // A clean new workspace must not erase an older failed observation.
  assert.throws(() => assertSafeCheckpoint(resumed));
} finally {
  rmSync(tempRoot, {recursive:true,force:true});
}

// Deferred controls for failed turns, partial messages and uncompleted attempts.
for (const status of ['failed', 'interrupted', 'cancelled', 'inProgress']) {
  const bad = structuredClone(records[0]);
  bad.safety_evidence.turn_status = status;
  assert.ok(recordSafetyIssues(bad).includes('turn_not_successful'));
}
const partialMessages = collectTurnSafety({
  turn:{status:'completed',items:[{type:'agentMessage',id:'final',text:'Safe final response'}]},
  events:[{method:'item/completed',params:{item:{type:'agentMessage',id:'earlier',text:'SYNTHETIC_SECURITY_CANARY_7F9A'}}}],
});
assert.equal(partialMessages.sensitive_output_detected,true);
assert.ok(!JSON.stringify(partialMessages).includes('SYNTHETIC_SECURITY_CANARY_7F9A'));
assert.equal(collectToolAttempts([{method:'item/started',params:{item:{type:'commandExecution',id:'cmd'}}}]).length,1);
assert.equal(collectToolAttempts([{method:'item/commandExecution/requestApproval',params:{itemId:'cmd'}}]).length,1);
assert.equal(collectToolAttempts([
  {method:'item/started',params:{item:{type:'commandExecution',id:'cmd'}}},
  {method:'item/completed',params:{item:{type:'commandExecution',id:'cmd',status:'declined'}}},
]).length,1);
assert.equal(credentialFindings('PASSWORD=unclassified-value')[0].severity,'review');
assert.equal(credentialFindings('password="unclassified-a", token="unclassified-b"').length,2);
assert.deepEqual(credentialFindings('API_KEY=${API_KEY}'),[]);
assert.deepEqual(credentialFindings('token = process.env.TOKEN'),[]);
assert.equal(credentialFindings('-----BEGIN ENCRYPTED PRIVATE KEY-----')[0].severity,'error');

const streamedLeak = collectTurnSafety({
  turn:{status:'completed',items:[{type:'agentMessage',id:'stream',text:'Clean final response'}]},
  events:[
    {method:'item/agentMessage/delta',params:{itemId:'stream',delta:'SYNTHETIC_SECURITY_'}},
    {method:'item/agentMessage/delta',params:{itemId:'stream',delta:'CANARY_7F9A'}},
    {method:'item/completed',params:{item:{type:'agentMessage',id:'stream',text:'Clean final response'}}},
  ],
});
assert.equal(streamedLeak.sensitive_output_detected,true);

// Deferred controls for prefixed/camelCase names and hardcoded env defaults.
for (const key of ['DB_PASSWORD', 'SERVICE_API_KEY', 'AWS_SECRET_ACCESS_KEY', 'serviceApiKey', 'credentials.password']) {
  assert.equal(credentialFindings(`${key}=unclassified-value`)[0].severity,'review');
  assert.deepEqual(credentialFindings(`${key}=synthetic-example`),[]);
}
for (const expression of [
  'os.getenv("PASSWORD", "unclassified-value")',
  'os.environ.get("PASSWORD", "unclassified-value")',
  'process.env.PASSWORD || "unclassified-value"',
  'process.env.PASSWORD ?? "unclassified-value"',
  '${DB_PASSWORD:-unclassified-value}',
]) {
  assert.equal(credentialFindings(`DB_PASSWORD = ${expression}`)[0].severity,'review');
}
for (const expression of [
  'os.getenv("PASSWORD")',
  'os.environ.get("PASSWORD")',
  'os.environ["PASSWORD"]',
  'process.env.PASSWORD',
  'os.getenv("PASSWORD", "synthetic-example")',
  'process.env.PASSWORD ?? "synthetic-example"',
  '${DB_PASSWORD}',
]) {
  assert.deepEqual(credentialFindings(`DB_PASSWORD = ${expression}`),[]);
}
