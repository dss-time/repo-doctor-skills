# Output Contract

1. `task_classification`
2. `recommended_next_skill`, including inventory verification status
3. `recommended_workflow`, in execution order
4. `reason`
5. `required_inputs`
6. `safety_notes`
7. `alternatives`
8. `stop_conditions`
9. Invocation examples: Codex `$skill-name`, platform-neutral natural language, and a copyable fallback prompt when explicit Skill invocation is unavailable

Do not execute the recommendation. Do not name a Skill that is absent from the verified active inventory.
