# Output Format

Default `fast`: report the fix and the actual verification command/result, usually in one short paragraph.
Add material unverified scope, failures or residual risks only when present. Omit empty sections and unnecessary next-Skill recommendations.
`standard` adds relevant impact; `audit` adds scope, permissions and the full verification record.

If the user deferred checks, include `verification_status: verification_deferred`, the instruction source and pending acceptance/check mapping. Distinguish implemented changes from verified delivery.

When relevant, briefly state preserved authorization/business behavior, existing-data update evidence, validation target/isolation or unrun reason, and preexisting/concurrent edit protection. Unresolved safety gaps or edit conflicts keep affected work blocked/partial. Omit inapplicable fields and retain deferred-verification status.
