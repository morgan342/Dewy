# Phase 8 — Routine Step And Time-Of-Day Suggestions

## Status: COMPLETE (verified 2026-10-01)

### Mapping architecture
One maintainable table per surface, no conditionals scattered through views:
- `src/search/routineSuggestion.ts` — `TYPE_RULES` maps `ProductType` →
  `{category, whenToUse, confidence}`; returns a `RoutineSuggestion` with a
  plain-language rationale and `needsConfirmation` for low confidence.
  Record-carried categories always win over the table; unknown types ask
  instead of guessing.
- `design/dewy.html` — `KINDS` maps catalog kind → `[category, timeOfDay]`;
  new `KINDS_UNSURE` (2026-10-01) mirrors the low-confidence rules:
  Exfoliant, Acne Treatment, Sleeping Mask, Body Lotion are no longer
  auto-assigned. Picking one leaves Category and When unset, announces that
  Dewy is not sure, and the details screen says so in place. The existing
  required-category validation is the "ask".

### Behavior guarantees
- Product type stays separate from routine step on both surfaces.
- Every suggestion is visible and editable before saving; the user's choice
  is what gets stored, and a product data refresh never overwrites it (the
  HTML app stores the chosen values on the record; the catalog is read-only).
- No medical claims anywhere in rationale copy (test-enforced).

### Tests (actual results, 2026-10-01)
- `__tests__/routineSuggestion.test.ts` — NEW: 12 tests (cleanser→Cleanse,
  wipes→Cleanse/Evening, serums→Treat, moisturizer→Seal, sunscreen→Protect,
  Morning/Evening/Both, unknown and ambiguous types ask, record data wins,
  no medical language).
- `__tests__/ui/search.test.ts` — low-confidence pick flow in the real app;
  editable category and time-of-day after a pick.
- `__tests__/productSearchController.test.ts` — suggestions editable,
  overrides preserved, low-confidence flagged.

### Known taxonomy gaps
- `mist`, `scalp_treatment`, `beauty_tool` exist only in the typed schema;
  the HTML catalog has no such products yet.
- "Store whether the final value came from the suggestion or the user" is
  not recorded: the HTML product record has no field for it, and adding one
  is a schema change that needs Morgan's approval (left as a decision).
