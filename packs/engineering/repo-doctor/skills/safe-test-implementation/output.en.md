# Output Contract

Default `fast`: protected behavior, selected test_mode and actual test command/result. Explain limits when production changes, failures or unverified evidence matter.
`standard` adds observable_behavior, test_boundary, red/green or sensitivity evidence, regression results and, when applicable, production_change_required and next_recommended_skill.
`audit` adds command preflight, permissions, mock rationale and the full command ledger.
Only test_first requires an observed expected failure; never invent red, green or sensitivity. Omit empty fields.

If the user deferred checks, include `verification_status: verification_deferred`, the instruction source and pending acceptance/check mapping. Distinguish implemented changes from verified delivery.

When relevant, briefly state preserved authorization/business behavior, existing-data update evidence, validation target/isolation or unrun reason, and preexisting/concurrent edit protection. Unresolved safety gaps or edit conflicts keep affected work blocked/partial. Omit inapplicable fields and retain deferred-verification status.
