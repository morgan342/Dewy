Using the repository audit you just completed, create a detailed implementation plan for intelligent beauty-product search.

This is still a planning step.

Do not edit files.
Do not install dependencies.
Do not create migrations.
Do not write implementation code.
Do not configure a paid service.
Do not make commits.

Separate the system into these distinct layers:

1. Product catalog: which products exist and where their data comes from.
2. Search and relevance: how users find known products despite imperfect input.
3. Product selection interface: how users review and choose a result.
4. Routine classification: how the app suggests Cleanse, Treat, Seal, Finish, or Protect.
5. Ingredient intelligence: how ingredient availability and compatibility are handled.

For the first implementation, prioritize:

- Search normalization
- Typo tolerance
- Brand recognition
- Partial matching
- Missing-space and joined-word matching
- Controlled synonyms
- Deterministic ranking
- An accessible search interface
- Manual product entry when no product is found
- Automated tests

Do not include a new ingredient-conflict engine in the initial implementation unless the repository already has a reviewed rules engine. Ingredient compatibility is a separate safety-sensitive feature.

Evaluate whether the current stack can support the required search behavior without a new service.

If it can, recommend using the existing stack.

If it cannot, compare only the realistic alternatives. For each alternative, explain:

- Why it is needed
- Hosting requirements
- Recurring cost implications
- Operational complexity
- Privacy implications
- Vendor lock-in
- Typo-tolerance capabilities
- Synonym support
- Index synchronization requirements

Do not choose or install a paid product without my approval.

The implementation plan must include:

1. Recommended architecture.
2. Exact files to create or modify.
3. Database or index changes.
4. Internal product schema.
5. Search-query normalization flow.
6. Search-ranking rules.
7. Synonym and alias strategy.
8. Product deduplication strategy.
9. User-interface states.
10. Accessibility requirements.
11. Loading, empty, error, offline, and provider-unavailable states.
12. Test strategy.
13. Security considerations.
14. Data provenance requirements.
15. Rollback strategy.
16. Implementation phases.
17. Verification commands after each phase.
18. Decisions requiring my approval.

Use the following ranking priority:

1. Exact brand plus exact product name.
2. Exact brand plus product type.
3. Exact product name.
4. Brand plus prefix or partial product match.
5. Controlled synonym matches.
6. Typo-tolerant matches.
7. Semantic matches only as a final fallback, if justified.

Search should recognize that a query can contain different entities. For example:

- “Dior” is probably the brand.
- “Moisterizer” is probably a misspelled product type.

Do not treat search as basic substring matching.

Propose deterministic test fixtures for products such as:

- Dior moisturizer
- CeraVe cleanser
- Makeup-remover wipes
- Eyelash serum
- Coconut oil
- Sunscreen
- Vitamin C serum
- Lip sleeping mask

The plan must explicitly explain how these searches will be handled:

- Dior Moisterizer
- dio moist
- Dior skin cream
- ceravecleanser
- cera ve cleanser
- makeup wipes
- make up remover
- lash serum
- eyelash growth serum
- coconut oil
- vit c serum
- sun screen
- lip sleeping mask

End with:

A. Your single recommended architecture.
B. Why it is the smallest reliable option for this repository.
C. What will be included in the first coding phase.
D. What will be deferred.
E. Any blocking decision I must make before implementation.

Do not begin implementation.
