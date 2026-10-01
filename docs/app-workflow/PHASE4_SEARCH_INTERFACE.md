# Phase 4 — Search Interface on Add Product To Cabinet

## Status: COMPLETE (verified 2026-10-01)

The interface exists on both surfaces and is now test-covered on both.

### Canonical surface — `design/dewy.html`
- Add Product → Search For A Product: combobox (`role="combobox"`,
  `aria-expanded`, `aria-activedescendant`), listbox results with
  `role="option"`, visible focus states, 44px touch targets.
- Keyboard: ArrowUp/ArrowDown move the active option, Enter runs the search
  or picks the active option, Escape clears then steps back.
- States: initial hint, no-results (names the query, suggests the brand
  alone), error with Try Again, result count announced to the live region.
- Every result row names provenance: "Dewy's List · No Ingredient Data" or
  "In Your Cabinet". Manual entry ("Add It By Hand") is always one tap away
  and saves as `MANUAL` / "Entered By You".
- Search runs on demand (Search button / Enter) and is synchronous and
  local, so a stale response can never replace a newer query's results; the
  shown results always carry the query they came from (`a.ran`).
- 2026-10-01: the browser's built-in search-cancel button is hidden so the
  app's single Clear control is the only one.

### Typed reference — `src/`
- `src/screens/AddProductToCabinetScreen.tsx` +
  `src/search/productSearchController.ts`: debounce, request-sequence
  stale-response rejection, loading/empty/no-results/error/retry, keyboard
  map, editable suggestions, manual fallback.

### Tests (actual results, 2026-10-01)
- `__tests__/ui/search.test.ts` — NEW: 29 tests driving the real HTML app in
  jsdom (canonical queries, ranking, robustness, states, keyboard, a11y).
- `__tests__/productSearchController.test.ts` — 25 tests (stale responses,
  keyboard, selection, manual fallback, provider failure).
- Full suite: `npx jest` → 22 suites, 359 passed.
- `npx tsc --noEmit` → clean. Formatter/linter: not configured in repo.
- Real-browser check (Chromium, 390×844 and 1280×800): search, results,
  low-confidence pick; screenshots captured; no app console errors.
