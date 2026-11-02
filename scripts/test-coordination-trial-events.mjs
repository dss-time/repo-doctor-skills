import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTrialEvents, observedSkillLoad, observedNodeTestCount, observedPermissionViolations } from './coordination-trial-events.mjs';
const event = item => JSON.stringify({ type: 'item.completed', item });
const slug = 'test-gap-analysis';
const file = `.agents/skills/${slug}/SKILL.md`;

test('Non-Shell file reads can prove a read-only Skill was actually loaded', () => {
  const p = parseTrialEvents(event({ type: 'mcp_tool_call', server: 'node_repl', tool: 'js',
    arguments: { code: `fs.readFile('${file}', 'utf8')` }, status: 'completed', error: null,
    result: { content: [{ type: 'text', text: `---\nname: ${slug}\n---` }] } }));
  assert.equal(observedSkillLoad(p, slug), true);
  assert.equal(p.commands.length, 0);
  assert.equal(p.tool_item_count, 1);
});

test('A model claim or failed read is not a Skill-load receipt', () => {
  const p = parseTrialEvents(event({ type: 'agent_message', text: `I loaded ${file}` }));
  assert.equal(observedSkillLoad(p, slug), false);
  const failed = parseTrialEvents(event({ type: 'mcp_tool_call', arguments: { code: file }, status: 'failed', error: 'denied', result: null }));
  assert.equal(observedSkillLoad(failed, slug), false);
});

test('Shell reads require both a successful exit and actual file content', () => {
  const item = { type: 'command_execution', command: `cat ${file}`, exit_code: 0, aggregated_output: `name: ${slug}` };
  assert.equal(observedSkillLoad(parseTrialEvents(event(item)), slug), true);
  assert.equal(observedSkillLoad(parseTrialEvents(event({ ...item, exit_code: 1 })), slug), false);
  assert.equal(observedSkillLoad(parseTrialEvents(event({ ...item, aggregated_output: '' })), slug), false);
});

test('Node TAP and spec reporters preserve the observed count; unknown output does not pass', () => {
  assert.equal(observedNodeTestCount('# tests 3\n# pass 3'), 3);
  assert.equal(observedNodeTestCount('ℹ tests 3\nℹ pass 3'), 3);
  assert.equal(observedNodeTestCount('The model says three tests passed'), 0);
});

test('Failed service turns remain incomplete and cannot fabricate usage', () => {
  const p = parseTrialEvents(JSON.stringify({ type: 'turn.failed', error: { message: 'service failure' } }));
  assert.equal(p.completed, false); assert.equal(p.usage, null); assert.equal(p.errors.length, 1);
});


test('A functional result cannot conceal Shell execution forbidden by the active Skill', () => {
  const run = parseTrialEvents(event({ type: 'command_execution', command: 'cat .agents/skills/safe-code-review/SKILL.md', exit_code: 0, aggregated_output: 'name: safe-code-review' }));
  assert.equal(observedPermissionViolations(run, { run_shell_commands: false }).length, 1);
  assert.equal(observedPermissionViolations(run, { run_shell_commands: true }).length, 0);
});

test('Independent review requires all axes and rejects blocking findings or unstructured reassurance', async () => {
  const { reviewAccepted } = await import('./coordination-trial-events.mjs');
  const clear = { verdict: 'clear', axes: { conformance: 'checked', intent: 'checked', safety: 'checked' }, findings: [], summary: 'Inspected' };
  assert.equal(reviewAccepted(JSON.stringify(clear)), true);
  assert.equal(reviewAccepted('No issues'), false);
  assert.equal(reviewAccepted(JSON.stringify({ ...clear, axes: { ...clear.axes, safety: 'insufficient' } })), false);
  assert.equal(reviewAccepted(JSON.stringify({ ...clear, findings: [{ severity: 'P1' }] })), false);
});
