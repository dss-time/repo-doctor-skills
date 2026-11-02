// Observe CLI receipts without requiring Shell for Skills that prohibit it.
import { createHash } from 'node:crypto';
const hash = text => createHash('sha256').update(text).digest('hex');
export function parseTrialEvents(stdout) {
  const events = stdout.split('\n').filter(Boolean).flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
  const items = events.filter(e => e.type === 'item.completed').map(e => e.item);
  const commands = items.filter(i => i?.type === 'command_execution').map(i => ({ command: i.command, exit_code: i.exit_code, output: i.aggregated_output }));
  const tools = items.filter(i => i?.type === 'mcp_tool_call').map(i => ({ server: i.server, tool: i.tool, arguments: i.arguments, status: i.status, error: i.error,
    result_error: Boolean(i.result?.isError || i.result?.is_error), result_excerpt: JSON.stringify(i.result).slice(0, 2400), result_sha256: hash(JSON.stringify(i.result)) }));
  return { commands, tools, tool_item_count: items.filter(i => ['command_execution', 'mcp_tool_call', 'file_change'].includes(i?.type)).length,
    final_answer: items.filter(i => i?.type === 'agent_message').at(-1)?.text ?? '',
    answer: items.filter(i => i?.type === 'agent_message').map(i => i.text).join('\n'),
    completed: events.some(e => e.type === 'turn.completed'), usage: events.find(e => e.type === 'turn.completed')?.usage ?? null,
    errors: events.filter(e => ['error', 'turn.failed'].includes(e.type)) };
}
export function observedSkillLoad(run, slug) {
  const filename = `.agents/skills/${slug}/SKILL.md`;
  return run.commands.some(c => c.command?.includes(filename) && c.exit_code === 0 && c.output?.includes(`name: ${slug}`))
    || run.tools?.some(t => t.status === 'completed' && !t.error && !t.result_error
      && JSON.stringify(t.arguments).includes(filename) && t.result_excerpt.includes(`name: ${slug}`));
}
export function observedNodeTestCount(stdout) {
  return Number(stdout.match(/(?:#|ℹ) tests (\d+)/)?.[1] || 0);
}
export function observedPermissionViolations(run, permissions) {
  const violations = [];
  if (permissions.run_shell_commands !== true && (run.commands?.length
      || run.tools?.some(t => t.tool === 'exec_command' || /(?:tools\.exec_command|node:child_process)/.test(JSON.stringify(t.arguments))))) {
    violations.push('Shell execution observed outside the Skill-declared permission set (including bootstrap reads)');
  }
  return violations;
}
export const independentReviewSchema = {
  type: 'object', additionalProperties: false, required: ['verdict', 'axes', 'findings', 'summary'],
  properties: {
    verdict: { type: 'string', enum: ['clear', 'findings', 'blocked'] },
    axes: { type: 'object', additionalProperties: false, required: ['conformance', 'intent', 'safety'], properties: Object.fromEntries(['conformance', 'intent', 'safety'].map(k => [k, { type: 'string', enum: ['checked', 'insufficient'] }])) },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['severity', 'title', 'file', 'line', 'reason'], properties: { severity: { type: 'string', enum: ['P0','P1','P2','P3'] }, title: { type: 'string' }, file: { type: 'string' }, line: { type: 'integer' }, reason: { type: 'string' } } } },
    summary: { type: 'string' },
  },
};
export function reviewAccepted(text) {
  try {
    const review = JSON.parse(text);
    return ['clear', 'findings'].includes(review.verdict) && ['conformance','intent','safety'].every(k => review.axes?.[k] === 'checked')
      && Array.isArray(review.findings) && !review.findings.some(f => !['P2','P3'].includes(f.severity));
  } catch { return false; }
}
