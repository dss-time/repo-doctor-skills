# Output Contract

Default `fast` output:

```text
Recommend: $<skill-name>
Reason: <one sentence>
Mode: fast | standard | audit
Needs: <minimum input>
Try: <copyable invocation preserving the user’s problem and scope>
```

Keep `fast` to these fields. Give one host-supported invocation or natural-language request, preserving scope and permissions; use placeholders for missing inputs.

For `standard` or requested detail, add classification, workflow ID, current stage, prerequisites, permission gate, stop condition, next Skill, and one alternative. For `audit`, add registry/version verification, active-inventory evidence, rejected candidates, platform alias capability, and unresolved uncertainty.
