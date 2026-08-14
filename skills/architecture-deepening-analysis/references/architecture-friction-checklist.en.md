# Architecture Friction Detailed Checklist

Read this only while qualifying a candidate or preparing audit output.

## Evidence prompts

- What must each caller know beyond the declared interface?
- Which rules are repeated across callers or adapters?
- Which unrelated files change for one domain behavior?
- Do tests observe stable behavior or internal choreography?
- If the module disappears, which complexity disappears and which moves outward?
- Which real use cases justify the abstraction today?
- Which ADRs constrain seam placement, compatibility, or migration?

## Option comparison

Compare interface surface, hidden responsibility, caller migration, compatibility, runtime effects, test seam, operational rollout, rollback cost, and uncertainty. Include a conservative option when it meaningfully differs.

## Rejection checks

Reject findings based only on file length, naming taste, directory depth, novelty, aesthetic cleanup, one caller with no change pressure, or imagined future reuse.
