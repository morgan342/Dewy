Implement maintainable routine-step and time-of-day suggestions for selected products.

Keep product type separate from routine step.

Examples:

- “Moisturizer” is a product type; “Seal” may be its routine step.
- “Makeup-remover wipe” is a product type; “Cleanse” may be its routine step.
- “Sunscreen” is a product type; “Protect” may be its routine step.
- “Vitamin C serum” is a product type; “Treat” may be its routine step.

The app’s current routine categories are:

- Cleanse
- Treat
- Seal
- Finish
- Protect

The current time-of-day options are:

- Morning
- Evening
- Both

Implement a centralized, maintainable mapping layer rather than scattering conditionals throughout interface components.

Requirements:

- Suggestions must remain editable.
- Store whether the final value came from the system suggestion or user choice when the schema supports it.
- Use product type and structured metadata before relying on product-name keywords.
- If confidence is low, do not auto-select; ask the user to choose.
- Preserve the user’s manual override.
- Do not overwrite an existing user choice when product data refreshes.
- Do not make medical claims.
- Do not build a new ingredient-conflict engine in this phase.

Add tests for:

- Cleanser → Cleanse
- Makeup-remover wipes → Cleanse
- Serum → Treat when appropriate
- Moisturizer → Seal
- Sunscreen → Protect
- Ambiguous oil → no forced classification or an explicitly low-confidence suggestion
- Editable suggestions
- Preserved user overrides
- Morning, Evening, and Both suggestions
- Low-confidence handling

Run the formatter, linter, type checker, tests, build, and relevant end-to-end tests.

Report:

1. Mapping architecture.
2. Files changed.
3. Supported mappings.
4. Low-confidence behavior.
5. Tests and actual results.
6. Known taxonomy gaps.

Stop after this phase.
