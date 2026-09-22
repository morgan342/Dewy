Implement the approved first phase of the intelligent beauty-product search plan.

For this phase, build only the local search foundation and its automated tests.

Do not connect a new paid service.
Do not add a live external product API yet.
Do not implement ingredient-conflict or medical-safety logic.
Do not redesign unrelated pages.
Do not discard or overwrite pre-existing uncommitted work.
Do not commit unless I explicitly ask you to.

Use the repository’s existing architecture, conventions, database, and testing framework.

Implement a reusable search-normalization layer that:

- Trims leading and trailing whitespace.
- Collapses repeated whitespace.
- Normalizes capitalization for matching.
- Normalizes punctuation and hyphens.
- Handles Unicode consistently.
- Removes diacritics for matching while preserving the original display text.
- Supports joined and separated forms where practical.
- Supports American and British spelling variants.
- Preserves the user’s original query for display and debugging.
- Does not modify the stored user-facing product name.

Implement controlled beauty-domain aliases and synonyms, including:

- moisturizer, moisturiser, hydrator, face cream
- makeup remover, make-up remover
- makeup wipes, remover wipes, cleansing wipes, cleansing cloths
- lash serum, eyelash serum, eyelash growth serum
- SPF, sunscreen, sun screen, sunblock
- vitamin C, vit C, ascorbic acid
- hyaluronic acid, HA, sodium hyaluronate
- cleanser, face wash, cleansing gel, cleansing balm
- toner, essence, facial essence
- facial oil, face oil, beauty oil

Implement deterministic ranking using this priority:

1. Exact brand plus exact product name.
2. Exact brand plus exact product type.
3. Exact product name.
4. Brand plus prefix or partial match.
5. Controlled alias or synonym match.
6. Typo-tolerant match.

Weight brand, product name, and product type more heavily than descriptions or ingredients.

Do not use an LLM as the primary search engine.

Create deterministic test fixtures using clearly marked development or test data. The fixtures should include enough products to verify ranking and prevent false positives.

Add tests for:

1. “Dior Moisterizer” returns Dior moisturizers.
2. “dio moist” returns Dior moisturizers.
3. “Dior skin cream” returns Dior moisturizers.
4. “ceravecleanser” matches CeraVe cleanser.
5. “cera ve cleanser” matches CeraVe cleanser.
6. “makeup wipes” returns makeup-remover or cleansing-wipe products.
7. “make up remover” returns makeup-removal products.
8. “lash serum” returns eyelash-serum products.
9. “eyelash growth serum” returns eyelash-serum products.
10. “sun screen” returns sunscreen.
11. “vit c serum” returns vitamin C serum.
12. “lip sleeping mask” returns relevant lip products.
13. Extra spaces do not change results.
14. Capitalization does not change results.
15. Exact matches rank above fuzzy matches.
16. Correct-brand matches rank above unrelated products.
17. Weak fuzzy matches do not overwhelm stronger exact results.
18. An empty or whitespace-only query is handled safely.

Keep all third-party network calls out of the normal automated test suite.

After implementation:

- Run the formatter.
- Run linting.
- Run type checking.
- Run relevant unit and integration tests.
- Run the production build.
- Fix failures caused by your changes.

Then report:

1. Files changed.
2. Search strategy implemented.
3. Tests added.
4. Commands run and their actual results.
5. Any deviations from the approved plan.
6. Known limitations.

Stop after completing and verifying this phase.
