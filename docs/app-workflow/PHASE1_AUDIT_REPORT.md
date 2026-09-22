# Phase 1 — Repository Audit Report

Date: 2026-09-21 17:06 PT  
Scope: `/Users/cheerdiva8me.com/Desktop/Dewy`  
Mode: READ-ONLY inspection (no implementation edits in this phase)

## Answers (1–18)

1. **Framework / language / package manager:** Expo ~52 + React Native 0.76 + React 18.3 + TypeScript. npm (`package.json` / `package-lock.json`).
2. **Database / ORM / migrations:** None yet. In-memory TypeScript types + fixture array only.
3. **Add Product to Cabinet:** `src/screens/AddProductToCabinetScreen.tsx` (entry via `App.tsx`). Local React state for Brand, Product Name, Category, When to Use.
4. **Brand / Product Name state:** `useState` strings in `AddProductToCabinetScreen`; Quiet Matches can fill both from search.
5. **Models:** `src/types/product.ts` — Product, ProductCategory (Cleanse/Treat/Seal/Finish/Protect), WhenToUse (Morning/Evening/Both), ProductType. No Cabinet persistence model, no routine engine, no ingredient model.
6. **Product catalog:** Development/test fixtures only — `src/data/fixtures/products.ts` (`isFixture: true`). Not a live catalog.
7. **External APIs:** None. No beauty/barcode/retailer provider.
8. **Reusable search:** Yes — `src/search/` (`normalizeQuery`, `synonyms`, `rank`, `searchProducts`). Local deterministic search; no LLM.
9. **Env vars:** No `.env` files. No `process.env` / `EXPO_PUBLIC_*` usage found in `src/`.
10. **Jobs / cron / queues:** None.
11. **Analytics:** None.
12. **Design system:** `src/theme/tokens.ts` — full DUEY nine-color set + spacing/radii/typography. Docs: `docs/DESIGN_CRAFT_BLUEPRINT.md`, Product Studio master prompt (Oura-inspired craft, not Oura clone), `Founder-Decisions.md`. Visual refs: `~/Desktop/DUEY`.
13. **Accessibility:** Partial — some `accessibilityLabel` / `accessibilityRole` / `accessibilityLiveRegion` on Cabinet screen. Not a full a11y system yet.
14. **Testing:** Jest + ts-jest. `__tests__/searchProducts.test.ts` (22 tests). No E2E (Detox/Maestro/Playwright) yet.
15. **Commands:** `npm start` / `npm run ios` / `npm run android` / `npm run typecheck` / `npm test` / `npm run test:search`. No dedicated lint/format scripts. No production web build (Expo app).
16. **Hosting / deploy:** Expo app config only (`app.json`, iOS bundle `com.dewy.app`). No EAS/CI config in repo.
17. **Instruction docs:** `CLAUDE.md`, `README.md`, `README-APP.md`, `docs/*`, `docs/app-workflow/*`, `.claude/agents/*`.
18. **Uncommitted work (do not discard):** Many untracked/modified files — Expo scaffold, `src/`, tests, `docs/app-workflow/`, `CLAUDE.md` modified, install tarball under `docs/app-workflow-install/`. Treat as precious in-progress work.

## A. Architecture summary
Fresh iOS-first Expo TypeScript app living beside Dewy constitution docs. Core loop started: Add Product to Cabinet UI + local fixture search. No backend, no persistence, no live catalog.

## B. Files likely involved next
- `src/screens/AddProductToCabinetScreen.tsx`
- `src/search/*`
- `src/data/fixtures/products.ts`
- `src/theme/tokens.ts`
- `src/types/product.ts`
- `App.tsx`
- `__tests__/searchProducts.test.ts`

## C. Reuse
- DUEY tokens + craft docs
- Local search foundation + passing tests
- Cabinet field model (Brand, Product Name, Category, When to Use)
- Founder locks (iOS-first, US, freemium, safety boundaries)

## D. Missing
- Persistent Cabinet storage
- Full accessible search combobox UX (Prompt 4 depth)
- Live product provider
- Ingredient data model (honest empty/partial states only — no invention)
- E2E tests, lint/format pipeline, EAS deploy
- Routine suggestion mapping layer (beyond fixture hints)

## E. Risks
- Fixture brand/product names are test data — must stay labeled fixtures, never “verified.”
- Uncommitted tree is large; careless commits could mix docs + app.
- No phone run verified in this phase (Simulator/Expo Go not launched here).

## F. Decisions needing Morgan approval
- Install any new material dependency
- Any paid catalog/search vendor
- Committing / GitHub push
- Whether Phase 2 is architecture plan only, or jump to UI polish of search (still gated)

## G. Blocking questions
None for planning. For shipping to a phone: confirm Xcode / Expo Go available when we reach a run phase.

## H. Smallest safe next implementation
**Phase 2 — Architecture plan only** (no code), using `docs/app-workflow/02_prompt-architecture-plan.md`, then Phase 3/4 only after you say so.

## Commands run (this phase)
- Inventory: `find`, `git status`, read `package.json` / `app.json` / `src/**`
- `npm run typecheck` → **PASS**
- `npm test` → **22/22 PASS**
- Not run: Expo Simulator, E2E, lint (no lint script), production/EAS build
