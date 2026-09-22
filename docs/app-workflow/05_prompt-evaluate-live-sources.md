Perform a read-only evaluation of live product-data options for this application.

Do not install a provider SDK.
Do not create accounts.
Do not configure credentials.
Do not modify production code.
Do not accept terms on my behalf.
Do not begin scraping.
Do not select a paid provider without my approval.

Use the repository audit and implemented product schema to evaluate:

1. Existing product-data integrations already present in the app.
2. Beauty-product databases.
3. Barcode-based product databases.
4. Retailer or brand feeds, if legitimately available.
5. Search providers that include product data, if any.
6. Manual and community-submitted catalog strategies.
7. A hybrid local-index plus external-fallback strategy.

For every viable provider, document:

- Available fields
- Brand coverage
- Skincare coverage
- Makeup coverage
- Coverage of unconventional products such as wipes, coconut oil, and lash serum
- Ingredient-list availability
- Product-image availability
- Barcode availability
- Geographic coverage
- Search capabilities
- Freshness or update model
- Rate limits
- Authentication
- Pricing
- Storage and caching restrictions
- Licensing and attribution requirements
- Commercial-use restrictions
- Data quality risks
- Duplicate-product risks
- Provider reliability
- Whether recently launched products are likely to appear
- Whether the provider can be used from the server
- Whether its credentials can remain private

Explicitly acknowledge:

No search system can return a new product that is absent from every connected catalog.

Recommend an architecture that supports:

- Local search first
- Optional server-side provider fallback
- Normalization into the internal product schema
- Data provenance
- Deduplication
- Caching or upserting when legally permitted
- Scheduled synchronization
- Manual entry when no provider has the product

Conclude with:

A. The recommended provider or provider combination.
B. Expected gaps.
C. Expected recurring costs.
D. Required credentials.
E. Required licensing or legal review.
F. What can be built without credentials.
G. The exact decision I need to approve.

Do not implement the provider yet.
