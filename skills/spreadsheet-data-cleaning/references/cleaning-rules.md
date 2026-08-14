# Cleaning Rules

- Normalize whitespace and case only when semantics are preserved.
- Parse dates with an explicit locale, timezone, and ambiguity policy.
- Parse numbers with explicit decimal and thousands separators; retain the source unit.
- Map booleans and enums through a documented lookup; flag unknown labels.
- Deduplicate only with a confirmed key and survivor rule; retain a duplicate map.
- Treat missing, zero, empty string, and “not applicable” as distinct until the business meaning is confirmed.
- Flag outliers before removal or capping. Never infer that statistical rarity means invalidity.
- Preserve formulas unless conversion to values is explicitly authorized and audited.
