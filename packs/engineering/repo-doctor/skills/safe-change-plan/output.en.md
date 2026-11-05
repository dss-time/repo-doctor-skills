# Output Contract

Lead with `granularity`, plan basis, input sufficiency, desired behavior, scope, prerequisites, risks, and unknowns.

## Atomic steps output

Each step includes goal, files or modules, intended change, dependencies, verification method, failure signal, and rollback action. Order by dependency and label required work, recommendations, and later optimization.

## Work items output

Provide dependency overview, parallel groups, shared state, conflict areas, and integration checkpoints. Each item includes the following fields.

- `id`
- `title`
- `goal`
- `user_visible_outcome`
- `scope`
- `out_of_scope`
- `affected_areas`
- `dependencies`
- `parallelizable_with`
- `acceptance_criteria`
- `verification`
- `risks`
- `rollback_notes`
- `recommended_skills`
- `status`

When complete implementation detail is requested, nest necessary atomic steps inside their work item. Do not duplicate top-level scope, risk, or rollback information.

Finish with test strategy, compatibility and release risks, stop conditions, completion criteria, and a necessary implementation handoff. Report unresolved assumptions or rejected low-quality decomposition when relevant, omitting empty sections. Return the plan only in the response, without writing files, using Shell, or creating external issues or tasks.

If the user deferred checks, include `verification_status: verification_deferred`, the instruction source and pending acceptance/check mapping. Distinguish implemented changes from verified delivery.
