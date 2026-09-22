You are acting as a senior full-stack engineer, search engineer, product architect, UX designer, and QA lead.

Your assignment is to upgrade the skincare routine app’s existing “Add Product to Cabinet” page into a highly forgiving, intelligent beauty-product search and selection experience.

This is not a simple text-field update. Treat it as a complete product-search feature that must work for real users who misspell words, omit spaces, use informal terminology, or do not know a product’s exact name.

Do not stop after giving me recommendations. Inspect the repository, create an implementation plan, implement the feature, run the relevant tests, fix issues, and report exactly what changed.

## Product Context

This app helps users organize skincare, makeup, beauty, and personal-care products and place them into an appropriate routine order.

The current page contains:

- Brand
- Product Name
- Category: Cleanse, Treat, Seal, Finish, Protect
- When to Use: Morning, Evening, Both
- “Add Product to Cabinet” button

Preserve the current brand identity and overall visual style unless an existing design system indicates otherwise. Improve the experience without making the page feel like an unrelated third-party search interface.

The product catalog must be inclusive of conventional and unconventional beauty products, including:

- Skincare
- Makeup
- Makeup-removal products
- Cleansing wipes and makeup-remover wipes
- Sunscreen
- Lip products
- Eye products
- Eyelash and eyebrow serums
- Facial oils
- Coconut oil and other single-ingredient oils
- Acne treatments
- Masks
- Toners and essences
- Mists
- Primers
- Setting sprays
- Beauty tools when relevant
- Hairline or scalp products that may interact with facial skincare
- Other products a reasonable user might include in a beauty routine

Do not restrict discovery only to products traditionally labeled “makeup” or “skincare.”

## Core User Experience

Replace or enhance the manual Brand and Product Name fields with an intelligent product-search combobox.

The user should be able to search using any reasonable combination of:

- Brand
- Product name
- Product type
- Category
- Common nickname
- Alternate spelling
- Partial phrase
- Ingredient
- Barcode, if available

Search results should update as the user types. The interaction must be fast, keyboard accessible, mobile friendly, and tolerant of imperfect input.

Each result should display, when the data exists:

- Product image
- Brand
- Product name
- Product type or category
- Size or variant, if relevant
- Ingredient-data availability
- Data source or verification status
- An obvious action for selecting or adding the product

When the user selects a result:

- Populate the brand and product name automatically.
- Suggest the most likely routine category.
- Suggest Morning, Evening, or Both when the available product information supports it.
- Allow the user to override every suggestion.
- Never silently make a medically meaningful assumption.
- Preserve a clear path back to search results.

## Required Search Behavior

The search must not require an exact product name.

For example, a user searching:

“Dior Moisterizer”

must receive relevant Dior moisturizers even though “moisturizer” is misspelled and the user did not enter an exact product name.

The search system must handle:

- Misspellings
- Missing or extra spaces
- Joined words
- Hyphens and punctuation
- Capitalization differences
- Singular and plural forms
- Common spelling variants, such as “moisturizer” and “moisturiser”
- Brand aliases
- Abbreviated searches
- Partial words
- Words entered in the wrong order
- Generic category searches
- Common beauty-language synonyms
- Minor transpositions, omissions, and duplicated letters
- Diacritics and accented characters when applicable

Examples that should produce useful results:

- “Dior Moisterizer”
- “dio moist”
- “Dior skin cream”
- “ceravecleanser”
- “cera ve cleanser”
- “makeup wipes”
- “make up remover”
- “cleansing cloths”
- “lash serum”
- “eyelash growth serum”
- “coconut oil”
- “vit c serum”
- “hyaluronic serum”
- “spf”
- “sun screen”
- “lip sleeping mask”

Create and maintain a domain-specific synonym and alias system. Initial examples should include:

- moisturizer, moisturiser, hydrator, face cream
- makeup remover, make-up remover, cleansing remover
- makeup wipes, remover wipes, cleansing wipes, cleansing cloths
- lash serum, eyelash serum, eyelash growth serum
- SPF, sunscreen, sun screen, sunblock
- vitamin C, vit C, ascorbic acid
- retinol, retinoid, vitamin A
- hyaluronic acid, HA, sodium hyaluronate
- cleanser, face wash, cleansing gel, cleansing balm
- toner, essence, facial essence
- facial oil, face oil, beauty oil

Do not let broad synonyms overwhelm exact matches or create obviously irrelevant results.

## Search Relevance

Use a deliberate ranking strategy rather than basic substring matching.

Rank results in approximately this order:

1. Exact brand and exact product-name matches
2. Exact brand plus product-category matches
3. Exact product-name matches
4. Prefix and partial matches
5. Alias and synonym matches
6. Typo-tolerant or fuzzy matches
7. Semantic matches used as a fallback

Weight brand and product name more heavily than description or ingredients.

A search such as “Dior moisturizer” should recognize “Dior” as a likely brand and “moisturizer” as a likely product category. It should prioritize Dior moisturizers instead of returning unrelated products that merely mention either word.

Do not use embeddings or an LLM as the only retrieval method. Use deterministic lexical search, normalization, typo tolerance, aliases, and structured filters as the foundation. Semantic retrieval may supplement those methods when it improves recall without harming precision.

Evaluate the current stack and choose the smallest reliable implementation. Depending on the existing architecture, this may involve:

- The current database’s full-text and fuzzy-search capabilities
- PostgreSQL full-text search and trigram matching
- Typesense
- Meilisearch
- Algolia
- Another existing search service already used by the repository

Do not add a major infrastructure dependency if the existing stack can meet the requirements cleanly. Explain the choice in the implementation report.

## Query Normalization

Create a reusable query-normalization layer that:

- Trims whitespace
- Collapses repeated whitespace
- Normalizes case
- Normalizes punctuation and hyphens
- Handles Unicode consistently
- Removes diacritics for matching while preserving original display text
- Supports joined and separated forms
- Recognizes known brands
- Recognizes known product types
- Applies controlled synonym expansion
- Preserves the original query for analytics and debugging

Store normalized searchable fields separately from user-facing display values when appropriate.

## Product Data

First inspect the repository and determine whether the app already has:

- A product database
- A beauty-product API
- A barcode API
- Existing catalog-ingestion logic
- Search infrastructure
- Ingredient data
- Product categorization logic
- Environment variables for external providers

Reuse stable existing systems where possible.

If the current app does not have a sufficient product catalog, create a provider-adapter architecture rather than tightly coupling the UI to one external API.

The adapter should support:

- Searching products
- Looking up products by provider ID
- Looking up products by barcode
- Normalizing provider data into the app’s internal schema
- Recording provenance
- Incremental synchronization
- Deduplication
- Graceful fallback when a provider is unavailable

A normalized product record should support fields such as:

- Internal product ID
- Provider name
- Provider product ID
- Barcode or UPC/EAN
- Brand
- Normalized brand
- Product name
- Normalized product name
- Aliases
- Product type
- Category hierarchy
- Raw ingredient list
- Normalized ingredients
- Product image
- Size or variant
- Market or country
- Product URL
- Verification status
- Created date
- Updated date
- Last synchronized date

Adapt this schema to the repository’s existing conventions rather than duplicating equivalent fields.

## Newly Released Products

The goal is to find recently launched products whenever the selected data provider knows about them.

Do not falsely promise that every product released “yesterday” will appear. No search algorithm can retrieve a product that is missing from every underlying catalog.

Instead, implement the strongest practical freshness strategy supported by the stack:

- Search the local index first.
- If local results are insufficient, optionally query the external provider.
- Normalize and merge eligible external results.
- Cache or upsert newly discovered products.
- Use incremental or scheduled synchronization.
- Store `last_synced_at` and provider provenance.
- Respect provider rate limits, licensing, and terms of service.
- Keep API credentials server-side.
- Never expose secret keys in client code.
- Do not add unauthorized scraping.

If the provider supports webhooks or change feeds, use them. Otherwise, implement a sensible scheduled refresh and on-demand fallback.

## No-Result Experience

Never leave the user at a dead end.

If there are no strong results:

- Show corrected-query or alternative-query suggestions.
- Offer an external-catalog search when supported.
- Let the user add the product manually.
- Optionally allow barcode scanning or barcode entry if compatible with the stack.
- Make it clear when a product is user-submitted or unverified.
- Allow the product to be enriched later when better data becomes available.

The manual-add fallback should collect only the information necessary to continue, with optional fields for:

- Brand
- Product name
- Product type
- Barcode
- Ingredient list
- Product photo

Do not treat a manually entered product as verified.

## Routine Classification

Keep product type separate from routine step.

For example:

- “Moisturizer” is a product type.
- “Seal” may be its routine step.
- “Makeup-remover wipe” is a product type.
- “Cleanse” may be its routine step.
- “Sunscreen” is a product type.
- “Protect” may be its routine step.

Create a maintainable mapping layer that can suggest:

- Cleanse
- Treat
- Seal
- Finish
- Protect

Also suggest:

- Morning
- Evening
- Both

These must remain suggestions that the user can change.

Do not classify solely from a product’s name when ingredient or product-type information contradicts it. If confidence is low, ask the user to confirm instead of pretending certainty.

## Ingredient Safety

This app may help users understand routine order and potential ingredient conflicts, but search results alone are not enough to make safety claims.

Follow these rules:

- Never infer compatibility solely from brand or product name.
- Use the complete ingredient list when available.
- Preserve the original INCI ingredient text.
- Record whether ingredient information is complete, partial, unavailable, or unverified.
- Do not say two products are safe together when ingredient data is missing.
- Do not state that ingredients universally “cancel each other out” unless the app has a reliable, reviewed rule supporting that claim.
- Clearly distinguish irritation risk, reduced effectiveness, formulation concerns, and true contraindications.
- Return “insufficient information” when the data cannot support a conclusion.
- Include concise reasoning, confidence, and source provenance for compatibility guidance.
- Preserve any existing medical or legal disclaimers.
- Do not present the app as a substitute for a dermatologist or medical professional.

Do not invent ingredient lists or silently fill missing ingredients using an LLM.

## Accessibility and Interface

Implement the search as an accessible combobox or equivalent established pattern.

Support:

- Keyboard navigation
- Visible focus states
- Screen-reader labels
- Escape to close
- Enter to select
- Up and down arrows to navigate
- Loading state
- Empty state
- Error state
- Offline or provider-unavailable state
- Clear-search action
- Mobile touch targets
- Responsive layouts

Use debouncing and cancellation so stale requests do not overwrite newer results.

Preserve the current page’s typography, spacing, colors, borders, and rounded-button language unless the repository’s design system provides a more authoritative implementation.

Do not redesign unrelated screens.

## Analytics

If the app already has analytics infrastructure, add privacy-conscious events for:

- Search submitted
- Search result selected
- Search returned zero results
- Suggested correction used
- External fallback used
- Manual product added
- Search latency
- Provider error

Do not log sensitive user information or complete private routines unnecessarily. Do not add a new analytics vendor solely for this feature.

## Implementation Process

Follow this sequence:

1. Inspect the repository structure and relevant CLAUDE.md files.
2. Identify the framework, database, search implementation, API layer, component library, tests, and deployment constraints.
3. Locate the existing “Add Product to Cabinet” page and all related models, routes, services, and components.
4. Determine whether a catalog or external product provider already exists.
5. Review the screenshot or current rendered page if available.
6. Write a concise implementation plan with the files and systems that must change.
7. Identify any genuinely blocking questions.
8. If there are no blocking questions, proceed without waiting for permission.
9. Implement the smallest complete and maintainable solution.
10. Add migrations, indexes, environment-variable documentation, and seed data where required.
11. Run formatting, linting, type checking, unit tests, integration tests, and the build.
12. Run relevant end-to-end tests or create them if the project already uses an E2E framework.
13. Fix all failures caused by the change.
14. Review the final diff for unnecessary complexity, insecure behavior, and unrelated edits.

Do not:

- Rewrite the entire application.
- Replace the existing design system.
- Hard-code API keys.
- Expose provider credentials to the browser.
- Introduce fake production data.
- Invent product ingredients.
- Make unsupported medical claims.
- Remove existing functionality without documenting and replacing it.
- Stop at a mockup if the repository supports functional implementation.
- claim something works without running an appropriate verification step.

## Required Tests

Add automated tests for at least the following behavior:

1. “Dior Moisterizer” returns Dior moisturizer products.
2. “dio moist” returns relevant Dior moisturizer products.
3. “ceravecleanser” can match “CeraVe Cleanser.”
4. “cera ve cleanser” can match “CeraVe Cleanser.”
5. “makeup wipes” returns makeup-remover or cleansing-wipe products.
6. “lash serum” returns eyelash-serum products.
7. “sun screen” returns sunscreen products.
8. Extra spaces and capitalization do not change the intended results.
9. Exact matches rank above fuzzy matches.
10. Correct-brand results rank above unrelated products containing similar words.
11. A stale response cannot replace results from a newer query.
12. Selecting a product correctly populates the form.
13. Suggested routine values remain editable.
14. No-result searches provide a manual-add path.
15. Provider failures produce a useful error state rather than crashing the page.
16. Duplicate products from multiple providers are merged or clearly disambiguated.
17. Missing ingredient data is labeled as missing and is never fabricated.
18. API credentials do not appear in browser bundles or client requests.

Use deterministic fixtures for automated tests. Do not make the normal test suite depend on a live third-party API.

## Acceptance Criteria

The task is complete only when:

- Users can search by brand, product name, type, nickname, or partial phrase.
- Common misspellings still produce useful results.
- Brand-plus-category searches return the expected product family.
- The interface supports conventional and unconventional beauty products.
- Search results are ranked sensibly.
- Users can select a product without manually retyping its information.
- Users can still add an unknown product manually.
- Recently discovered external products can be normalized and added to the local catalog when permitted.
- Routine-step and time-of-day suggestions are editable.
- Ingredient availability and verification status are visible.
- The feature works on desktop and mobile.
- Accessibility behavior is implemented.
- Loading, empty, error, and provider-unavailable states are handled.
- Tests, type checking, linting, and the production build pass.
- No secrets are exposed.
- No unsupported medical claims are introduced.

## Final Response

After implementation, provide:

1. A brief explanation of the architecture selected.
2. A list of files created or modified.
3. The product-data source or sources used.
4. The search and ranking strategy.
5. How typo tolerance, spacing errors, aliases, and synonyms are handled.
6. How newly released products are discovered.
7. Known catalog limitations.
8. Tests added and their results.
9. Required environment variables or setup steps.
10. Any database migration or deployment instructions.
11. Screenshots of the completed desktop and mobile interface if the environment supports screenshots.
12. Any remaining risks or recommended next steps.

Be honest about limitations. In particular, do not claim that a product released yesterday will appear unless an underlying provider has already indexed it.

Begin by inspecting the repository and locating the current “Add Product to Cabinet” implementation.
