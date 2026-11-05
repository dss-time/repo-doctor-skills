# Examples

User: "Fix the highest-priority issue from the health check. Do not fix everything."

Expected behavior: select one small issue, check impact, edit only required files, and run the minimum safe, authorized validation; if unavailable, report the reason, pending command and unverified status.

## Preserve authorization and behavior
User: "Fix the page failing to refresh after submission; preserve other behavior."
Inspect role checks, field filtering, submission errors and success callbacks. Fix the refresh path without removing authorization or treating errors as success. Plan allowed/rejected submission checks and retain them as pending when the user defers tests.
