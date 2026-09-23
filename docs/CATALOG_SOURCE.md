# Dewy — Catalog Source

## Now

- Typed fixtures in `src/data/fixtures/products.ts` for Expo search and tests.
- Built-in list inside `design/dewy.html` (`CATALOG`) for the HTML prototype.
- Everything is clearly marked non-live and non-verified.
- **No provider is configured.** `src/catalog/providerAdapter.ts` ships a
  `NULL_PROVIDER` that performs no network I/O and reports `not_configured`.

### What the fixtures deliberately do not contain

- No ingredient lists. Every fixture reports `ingredientStatus: 'unavailable'`,
  which means "we do not have this data" — never "this product has none".
- No sizes, variants, SPF values, images or retailer URLs. These fields are left
  undefined rather than guessed.
- Records added for product-type breadth use neutral sample brand names, so no
  claim is made about a real-world product.

## Search architecture

Local-first and deterministic. The order is:

1. Normalize the query (`src/search/normalizeQuery.ts`) — the user's original
   text is always preserved for display, analytics and debugging.
2. Parse intent (`src/search/parseQuery.ts`) — separate brand from product type.
3. Rank (`src/search/rank.ts`) — brand and product identity outrank descriptions.
4. Only if local results are insufficient, consult a provider — currently none.

No LLM and no embeddings are used for retrieval or ranking.

## Later (needs founder approval)

Adding a live catalog crosses several approval gates at once: a paid vendor,
third-party terms, credentials, and a provider integration. Nothing below is
wired up.

### Where credentials would live

A provider implementation **must** run server-side. This repository currently has
no server, so adding one is part of that approval.

Client bundles must never contain a credential. `__tests__/noClientSecrets.test.ts`
enforces this: it fails the build if client code hard-codes a key or reads a
secret-shaped environment variable.

### Environment variable names a server implementation would read

Names only. Values must never be committed, printed or logged.

| Variable | Purpose |
|---|---|
| `DEWY_CATALOG_PROVIDER` | Which approved provider to use |
| `DEWY_CATALOG_API_BASE_URL` | Provider base URL |
| `DEWY_CATALOG_API_KEY` | Server-side credential — never exposed to the client |
| `DEWY_CATALOG_RATE_LIMIT_PER_MIN` | Client-side throttle to respect provider limits |
| `DEWY_CATALOG_SYNC_ENABLED` | Whether scheduled refresh runs |

### Freshness strategy when a provider is approved

- Search the local index first; fall back to the provider only when local
  results are insufficient.
- Normalize, merge and deduplicate provider results (`dedupeProducts`).
- Upsert newly discovered products and stamp `lastSyncedAt` and provenance.
- Prefer a provider change feed or webhook; otherwise a scheduled refresh plus
  the on-demand fallback.
- Respect provider rate limits, licensing and terms. No scraping.

### Honest limitation

A product released very recently will only appear if the underlying provider has
already indexed it. No search algorithm can retrieve a product that is absent
from every catalog it can reach. The manual-entry path exists for exactly this
case, and manually added products are labeled user-entered and unverified.

## Never

- Never invent products, brands, ingredients, sizes or barcode data.
- Never treat a search result as verified.
- Never generate or infer an ingredient list with an LLM.
- Never use an LLM as the primary catalog or ranking engine.
