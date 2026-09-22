# Phase 3 — Local Search Foundation

## Status: COMPLETE

### Strategy
Local deterministic search only (`src/search/*`). No LLM. No paid APIs. Fixtures labeled `provenance: 'fixture'` with `ingredientStatus: 'unavailable'` (honest — no invented ingredient lists).

### Files changed
- `src/types/product.ts` — added `ProductProvenance`, `IngredientStatus`, required `provenance` + `ingredientStatus`
- `src/data/fixtures/products.ts` — all fixtures tagged provenance/ingredientStatus

### Already present (verified)
- `normalizeQuery.ts`, `synonyms.ts`, `rank.ts`, `searchProducts.ts`
- `__tests__/searchProducts.test.ts` — Prompt 3 cases 1–18

### Commands run
- `npm run typecheck` → PASS
- `npm test` → 22/22 PASS
- Formatter/linter: not configured in repo (unavailable)
- Production/EAS build: not run this phase
- E2E: unavailable

### Deviations
None material. Foundation was largely pre-built in scaffold; this phase added provenance honesty fields.

### Known limitations
- Catalog is fixtures only
- No live provider
- No ingredient data (correctly marked unavailable)
- No RN Testing Library UI tests yet (would be a new dependency)

### Next phase
Phase 4 — Search UI on Add Product to Cabinet
