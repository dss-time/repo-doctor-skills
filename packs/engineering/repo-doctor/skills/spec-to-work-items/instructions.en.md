# Spec to Work Items

Convert settled scope into delivery slices that can be executed and verified independently. Prefer observable behavior over technical layers.

## Boundary

- Require a confirmed specification, implementation plan, or sufficiently settled conversation. Route material open decisions to `requirements-clarification` or `requirements-to-spec`.
- Stay read-only. Return a Markdown work-item plan in the response. Save a file or create GitHub, Linear, or other external tasks only after explicit authorization and confirmed platform support.
- Do not substitute for the code-level atomic steps of `safe-change-plan`; this Skill owns delivery slicing, dependencies, and parallel coordination.
- Include migrations, compatibility, rollback, documentation, and tests within the behavior slice they support.

## Workflow

1. Establish the source specification, user-visible outcomes, acceptance criteria, exclusions, constraints, and unresolved assumptions.
2. Identify independently observable behaviors. Slice vertically so each item delivers one coherent outcome across the necessary layers.
3. For each item, define scope and out-of-scope boundaries, affected areas, acceptance criteria, the smallest credible verification, risks, rollback notes, and recommended Repo Doctor Skills.
4. Model prerequisites and blockers as a dependency graph. Name items that can run in parallel only when their dependencies, shared state, and integration sequence permit it.
5. Identify shared files, schemas, interfaces, fixtures, generated artifacts, and other conflict zones. Explain coordination when parallel items touch the same core area.
6. Keep tests close to each behavior. Do not defer all testing to a final item unless a genuinely cross-cutting verification cannot run earlier.
7. Validate the plan against the quality gates below; revise or reject it when a gate fails.
8. Return the ordered Markdown plan, parallel groups, integration checkpoints, and remaining planning unknowns.

## Quality Rejection Gates

Reject and explain a decomposition that:

- consists only of database, backend, frontend, documentation, or test layers;
- cannot verify an item independently;
- uses acceptance criteria such as only “development complete”;
- leaves dependencies unspecified;
- assigns broad edits to the same core files without declaring conflicts;
- postpones all tests to the end; or
- combines unrelated outcomes in one item.

## Completion Conditions

Complete only when every item has all required fields, dependencies are acyclic or explicitly blocked, parallel claims are justified, conflicts are visible, and every acceptance criterion is observable and verifiable.
