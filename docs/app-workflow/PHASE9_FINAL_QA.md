# Phase 9 — Final QA Audit, Intelligent Product Search

**Date:** 2026-10-01 · **Auditor:** Claude Code session (protocol run, phase
gates waived by Morgan on 2026-10-01; approval gates for providers, schema,
and paid services still respected)

## 1. Final architecture
- Canonical UI: `design/dewy.html` — on-device deterministic search over the
  built-in `CATALOG` (tiered ranker: exact brand+name > brand+type > exact
  name > brand+partial > synonym > fuzzy; bands 100 apart so a lower tier can
  never outrank a higher one).
- Typed reference: `src/search/*` (normalize → parse → rank → controller) +
  `src/catalog/providerAdapter.ts` (`NULL_PROVIDER`, no network).
- Routine suggestions: one mapping table per surface; search ranking never
  consumes routine classification.
- No LLM anywhere in retrieval, ranking, or ingredient handling.

## 2. Files changed this session
- `design/dewy.html` — PHRASE_SYN fix (see below), `KINDS_UNSURE`
  low-confidence ask, details-screen note, native search-cancel button
  hidden, test seam exposes the search engine, dead `qsayT` removed.
- `__tests__/ui/search.test.ts` (new, 29 tests), `__tests__/routineSuggestion.test.ts` (new, 12 tests).
- Docs: PHASE4/5/8/9 reports, STATUS.md.

## 3. Defect found and fixed
**Two canonical queries returned nothing in the HTML app**: "makeup wipes"
and "lash serum". `PHRASE_SYN` values containing spaces ("cleansing wipes")
could never match the one-word-per-token index, so the whole query was
rejected. Values are now single-word token lists; a comment in the file
states the constraint. Proven by the new test suite (red before, green after).

## 4. Search quality — all canonical checks pass (automated, deterministic)
"Dior Moisterizer", "dio moist", "Dior skin cream", "ceravecleanser",
"cera ve cleanser", "makeup wipes", "make up remover", "lash serum",
"eyelash growth serum", "coconut oil", "vit c serum", "sun screen",
"lip sleeping mask" — plus: exact above fuzzy, correct brand above
unrelated, whitespace/caps/punctuation/joined-word invariance, empty and
whitespace-only queries safe. Verified independently in `src` suites and in
the HTML app (`__tests__/ui/search.test.ts`).

## 5. Commands run and actual results
- `npx jest` → 22 suites, **359 passed**, 0 failed.
- `npx tsc --noEmit` → clean.
- `node --check` on both inline script blocks of `design/dewy.html` → OK.
- `node scripts/build-chemist.js` → idempotent (no diff beyond this
  session's edits).
- Real browser (Chromium 390×844, 1280×800): full search → pick →
  details flow; screenshots delivered to Morgan; no app console errors (one
  `ERR_CERT_AUTHORITY_INVALID` from the sandbox's TLS proxy blocking the
  optional weather geocoding call — environmental, not an app defect).
- `npm audit` → 18 pre-existing vulnerabilities (1 critical) — **all in the
  Expo/Jest dev toolchain**, none shipped (the app is one HTML file with no
  runtime npm dependency). Fixing requires lockfile changes → needs approval.
- Formatter/linter/E2E: not configured in this repository.
- Production build: not applicable to the HTML app; Expo build not run (no
  change to Expo runtime code).

## 6. Security and safety
- No API keys, secrets, or env values in client code
  (`__tests__/noClientSecrets.test.ts` passes). No new external requests
  added. Input is inert: all rendered query text goes through `esc()`.
- No invented products, ingredients, sizes, SPF or barcode data; every
  result row labels provenance; ingredient data is uniformly "No Ingredient
  Data"; missing data never becomes a compatibility conclusion (Review Your
  Products still refuses pairing verdicts).
- No medical/safety claims added; rationale copy is test-screened.

## 7. Known limitations
- Catalog is a built-in list (~200 products); no live provider (blocked on
  the Phase 5 decision, by design).
- Search runs on demand (button/Enter) in the HTML app rather than
  live-as-you-type; the typed controller supports debounced as-you-type for
  when a provider lands.
- Suggested-vs-user-chosen is not stored on the record (schema change —
  needs approval).

## 8. Rollback
Single commit on a feature branch; revert the commit or don't merge it.
No migrations, no env changes, no deployment steps.

## 9. Remaining blockers to "production ready"
None for the local feature. A live catalog remains gated on Morgan's Phase 5
decision (`PHASE5_LIVE_SOURCES_EVALUATION.md`, section 4G).
