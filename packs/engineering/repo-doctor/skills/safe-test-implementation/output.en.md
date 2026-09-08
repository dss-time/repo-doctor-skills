# Output Contract

Default `fast`: protected behavior, selected test_mode and actual test command/result. Explain limits when production changes, failures or unverified evidence matter.
`standard` adds observable_behavior, test_boundary, red/green or sensitivity evidence, regression results and, when applicable, production_change_required and next_recommended_skill.
`audit` adds command preflight, permissions, mock rationale and the full command ledger.
Only test_first requires an observed expected failure; never invent red, green or sensitivity. Omit empty fields.
