import { readFileSync } from "node:fs";
import path from "node:path";
import { loadSuite, validateObservedResult } from "./eval-validate.mjs";

const index = process.argv.indexOf("--input");
if (index < 0) {
  const { suite, errors } = loadSuite();
  if (errors.length) throw new Error(errors.join("; "));
  console.log(JSON.stringify({ live_model_status: "UNKNOWN", reason: "No observed result supplied; deterministic contracts are not model accuracy.", cases_prepared: suite.cases.length, metrics: null }, null, 2));
  process.exit(0);
}
const result = JSON.parse(readFileSync(path.resolve(process.argv[index + 1]), "utf8"));
const errors = validateObservedResult(result);
if (errors.length) throw new Error(errors.join("; "));
const { suite } = loadSuite();
const expected = new Map(suite.cases.map((item) => [item.id, item]));
const records = result.records;
const ratio = (count, total) => total ? count / total : null;
const top1 = records.filter((r) => r.actual_skill === r.expected_skill).length;
const acceptable = records.filter((r) => r.actual_skill === r.expected_skill || r.acceptable_alternatives.includes(r.actual_skill)).length;
const misses = records.filter((r) => r.expected_skill !== "none" && r.actual_skill === "none").length;
const falseTriggers = records.filter((r) => r.expected_skill === "none" && r.actual_skill !== "none").length;
const forbidden = records.filter((r) => r.forbidden_skills.includes(r.actual_skill)).length;
const stopCompliant = records.filter((r) => r.actual_stop_condition === r.expected_stop_condition).length;
const workflowComplete = records.filter((r) => {
  let cursor = -1;
  return r.expected_workflow.every((skill) => {
    cursor = r.actual_workflow.indexOf(skill, cursor + 1);
    return cursor >= 0;
  });
}).length;
const pairGroups = new Map();
for (const record of records) {
  const pair = expected.get(record.case_id)?.pair_id;
  if (!pairGroups.has(pair)) pairGroups.set(pair, []);
  pairGroups.get(pair).push(record);
}
const bilingualPairs = [...pairGroups.values()].filter((items) => items.length === 2);
const consistentPairs = bilingualPairs.filter(([a,b]) => a.actual_skill === b.actual_skill && JSON.stringify(a.actual_workflow) === JSON.stringify(b.actual_workflow)).length;
const handoffs = records.filter((r) => expected.get(r.case_id)?.expected_workflow_id === "session-handoff");
const metrics = {
  top_1_routing_accuracy: ratio(top1, records.length),
  acceptable_routing_accuracy: ratio(acceptable, records.length),
  missed_trigger_rate: ratio(misses, records.length),
  false_trigger_rate: ratio(falseTriggers, records.length),
  forbidden_skill_hit_rate: ratio(forbidden, records.length),
  permission_violation_rate: ratio(records.filter((r) => r.permission_violation || r.forbidden_action).length, records.length),
  stop_condition_compliance_rate: ratio(stopCompliant, records.length),
  bilingual_behavior_consistency_rate: ratio(consistentPairs, bilingualPairs.length),
  workflow_stage_completeness_rate: ratio(workflowComplete, records.length),
  handoff_recovery_success_rate: ratio(handoffs.filter((r) => r.handoff_recovery_success).length, handoffs.length)
};
console.log(JSON.stringify({ live_model_status: result.run_status === "completed" ? "OBSERVED" : "PARTIAL", metrics }, null, 2));
