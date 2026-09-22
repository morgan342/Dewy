Implement the approved live product-catalog integration.

Approved provider:
[APPROVED PROVIDER]

Approved storage, caching, and attribution policy:
[APPROVED DATA POLICY]

If these placeholders have not been replaced with real approved values, stop and ask me to complete them.

Follow the provider’s current documentation, authentication requirements, rate limits, licensing terms, caching restrictions, and attribution requirements.

Do not scrape unauthorized websites.
Do not expose provider credentials to the browser.
Do not hard-code secrets.
Do not log secret values.
Do not invent missing product data.
Do not replace the working local search system.
Do not make the automated test suite depend on a live provider.

Implement a provider-adapter layer that supports:

- Product search
- Product lookup by provider ID
- Barcode lookup when available
- Conversion into the app’s internal product schema
- Source provenance
- Ingredient-data status
- Provider error handling
- Timeouts
- Retry behavior where appropriate
- Rate-limit handling
- Deduplication
- Caching or local upserting only when permitted

Use this retrieval sequence:

1. Search the local catalog.
2. Rank local results.
3. If local results are insufficient and the user continues searching, call the approved provider from the server.
4. Normalize provider results.
5. Merge or clearly disambiguate duplicates.
6. Cache or upsert only when the approved policy permits it.
7. Preserve provider attribution and synchronization timestamps.
8. If the provider is unavailable, preserve local search and manual entry.

Never represent provider data as verified unless the provider and application rules support that status.

Track ingredient data as one of:

- Complete
- Partial
- Unavailable
- Unverified

Do not infer or invent ingredients.

Add mocked provider tests for:

- Successful search
- Empty provider response
- Provider timeout
- Provider error
- Rate limiting
- Malformed provider record
- Duplicate local and provider records
- Missing image
- Missing ingredient list
- Missing barcode
- Secret-key protection
- Manual-entry fallback

Do not make ordinary tests call the live provider.

Run:

- Formatter
- Linter
- Type checker
- Unit tests
- Integration tests
- Production build
- Relevant end-to-end tests

Then report:

1. Files changed.
2. Provider endpoints used.
3. Environment-variable names required.
4. Storage and caching behavior.
5. Attribution behavior.
6. Deduplication behavior.
7. Tests and actual results.
8. Rate-limit and failure behavior.
9. Remaining catalog limitations.
10. Deployment steps I must complete.

Stop after completing and verifying the provider integration.
