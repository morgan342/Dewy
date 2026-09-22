# Phase 2 — Architecture Plan (Intelligent Product Search)

Date: 2026-09-21 17:08 PT  
Based on: Phase 1 audit (`PHASE1_AUDIT_REPORT.md`)  
Mode: PLANNING ONLY — no implementation in this phase

---

## Layers

### 1. Product catalog
- **Now:** `FIXTURE_PRODUCTS` in `src/data/fixtures/products.ts` (marked `isFixture: true`).
- **Near-term:** Keep fixtures as the only catalog for local search. Add `provenance: 'fixture' | 'user_entered' | 'provider'` on the Product type when coding begins.
- **Later (needs approval):** Server-side provider adapter; never browser keys.
- **Not now:** Paid search services, scraping, inventing ingredients.

### 2. Search and relevance
- **Reuse existing stack:** TypeScript modules in `src/search/` — sufficient without Meilisearch/Algolia/Typesense for v1.
- **Flow:** raw query → `normalizeQuery` (keep `original`) → synonym expansion → `rankProducts` → `searchProducts` results.
- **Ranking priority (locked):**
  1. Exact brand + exact product name  
  2. Exact brand + product type  
  3. Exact product name  
  4. Brand + prefix/partial  
  5. Controlled synonym  
  6. Typo-tolerant / fuzzy  
  7. Semantic — **deferred** (not needed; do not add embeddings)
- **Entity split:** tokenize brand-like first token(s) vs type-like remainder (e.g. “Dior” + “Moisterizer”).
- **No LLM** as primary retrieval.

### 3. Product selection interface
- **Screen:** `AddProductToCabinetScreen.tsx`
- **Target UX (Phase 4):** Accessible search combobox; Quiet Matches → full results list; select fills Brand + Product Name; suggest Category / When to Use (editable); manual add path labeled Unverified / User-Entered.
- **Visual:** Full DUEY nine-color tokens; Oura-level craft (calm, one focus); never generic SaaS.

### 4. Routine classification
- Keep **product type** separate from **routine step** (Cleanse / Treat / Seal / Finish / Protect).
- Central mapping module later (Phase 8). Until then: optional hints from fixture `categories` / `whenToUse` only; always editable; low confidence → ask user.

### 5. Ingredient intelligence
- **Deferred.** No conflict engine. Track availability as Complete / Partial / Unavailable / Unverified when data exists. Never invent lists with an LLM.

---

## Stack decision

**Recommended: stay on Expo + in-app TypeScript search (current).**

| Alternative | Verdict |
|-------------|---------|
| PostgreSQL / Typesense / Meilisearch / Algolia | Not needed for fixture-scale catalog; adds cost, ops, privacy surface |
| LLM ranking | Forbidden as primary; harms determinism and tests |

Why current stack wins: already implements normalize / synonyms / rank / 22 passing tests; zero new vendors; matches “smallest reliable.”

---

## Plan checklist (1–18)

1. **Architecture:** Expo RN/TS client; local deterministic search; fixtures → later provider adapter behind a clean interface.
2. **Files to create/modify (later phases):**
   - Modify: `AddProductToCabinetScreen.tsx`, `src/types/product.ts`, `src/search/rank.ts` (entity split polish), `src/theme/tokens.ts` (as needed)
   - Create: `src/search/ProductSearchCombobox.tsx` (or equivalent), `src/cabinet/types.ts` (persistence later), `__tests__/AddProductToCabinet*.tsx` when test harness allows
   - Do not touch: uncommitted user work outside this feature; no secret files
3. **DB / index:** None for Phase 3–4. Future: AsyncStorage/SQLite for Cabinet only after approval of schema.
4. **Internal product schema:** Extend `Product` with `provenance`, `ingredientStatus?: 'complete'|'partial'|'unavailable'|'unverified'`, optional `providerId` — no fake ingredients.
5. **Normalization flow:** trim → collapse space → casefold → punct/hyphen → strip diacritics for match → tokens → synonym expand → rank. Keep `original` untouched.
6. **Ranking rules:** As locked list above; brand/name/type outweigh description (no description field yet).
7. **Synonyms:** Keep `synonyms.ts` groups (moisturizer/moisturiser, wipes, lash serum, SPF, vit C, HA, cleanser, toner, oils, lip mask). Expand carefully; never drown exact matches.
8. **Dedup:** By normalized brand+name key; later provider IDs. Fixtures must remain distinct from user-entered.
9. **UI states:** Idle, typing/loading (local = sync instant), results, no-results + manual add, error (rare for local), clear selection.
10. **A11y:** Combobox pattern — labels, roles, focus rings, Escape/Enter/arrows, screen-reader names for Cabinet actions.
11. **Offline / provider-unavailable:** Local search always works offline. Provider states only after a provider exists.
12. **Tests:** Keep Jest search suite; add UI selection/manual-add tests when RN Testing Library is approved as a dependency (material dep = ask). Until then, keep unit tests on search pure functions.
13. **Security:** No API keys; fixtures only; no logging of secrets.
14. **Provenance:** Always surface fixture vs user-entered vs provider.
15. **Rollback:** Feature is additive modules; revert by removing combobox wiring and keeping prior fields.
16. **Implementation phases (aligned to APP WORKFLOW):**
    - Phase 3: Harden local search foundation + tests (mostly done — gap-fill only)
    - Phase 4: Search UI on Add Product to Cabinet
    - Phase 5: Evaluate live sources (read-only)
    - Phase 6+: Provider only after explicit vendor approval
    - Phase 8: Routine suggestions mapping
    - Phase 9–10: QA + commit (commit still needs ask)
17. **Verification commands:** `npm run typecheck` · `npm test` · later `npx expo start` for visual QA
18. **Still needs Morgan approval:** paid vendor; new material dependencies (e.g. RN Testing Library if added); commits/deploy; ingredient-conflict engine

---

## How example queries are handled (with current foundation)

| Query | Mechanism |
|-------|-----------|
| Dior Moisterizer | Synonym moisturiser/moisturizer + brand Dior → Dior moisturizers |
| dio moist | Fuzzy/partial brand + type prefix |
| Dior skin cream | Synonym skin cream → moisturizer + brand |
| ceravecleanser | Joined-token / spacing normalization → CeraVe cleanser |
| cera ve cleanser | Spacing + brand aliasing |
| makeup wipes / make up remover | Synonym groups |
| lash serum / eyelash growth serum | Synonym group |
| coconut oil | Synonym facial oil group |
| vit c serum | Synonym vitamin c |
| sun screen | Synonym SPF/sunscreen |
| lip sleeping mask | Synonym lip mask group |

Fixtures already cover: Dior moisturizer(s), CeraVe cleanser, makeup wipes, lash serum, coconut oil, sunscreen, vit C serum, lip sleeping mask.

---

## A–E Ending

**A. Single recommended architecture:** Expo + local TypeScript search + labeled fixtures; provider adapter later.

**B. Why smallest reliable:** Already green tests; no new infra; matches iOS-first founder lock.

**C. First coding phase (Phase 3):** Gap-fill search foundation only — provenance fields, entity-aware ranking polish if needed, ensure all Prompt 3 tests remain green. No paid services.

**D. Deferred:** Live catalog, paid search, ingredient engine, Cabinet persistence, EAS, semantic/LLM retrieval, commits.

**E. Blocking decisions before implementation:** **None** for Phase 3–4. (Paid provider blocked until Phase 5–6 decision.)

---

## Phase 2 status
COMPLETE — plan only. No application code changed in this phase.
