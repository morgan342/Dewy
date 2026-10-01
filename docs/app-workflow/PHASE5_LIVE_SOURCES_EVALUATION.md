# Phase 5 — Live Product-Data Sources, Read-Only Evaluation

**Date:** 2026-10-01 · **Status:** COMPLETE (evaluation only — nothing installed, no accounts created, no terms accepted, no production code changed)

This phase follows `05_prompt-evaluate-live-sources.md`. It is an evaluation
written from the repository audit, the implemented product schema
(`src/types/product.ts`), and general knowledge of the provider landscape.
**Every external detail below (pricing, rate limits, terms) must be verified
against the provider's current documentation before approval** — provider
terms change faster than any written summary.

## 1. What the app already has

- Deterministic local search over a built-in list (`design/dewy.html` `CATALOG`,
  ~200 entries) and typed fixtures (`src/data/fixtures/products.ts`).
- A provider seam that is deliberately empty: `src/catalog/providerAdapter.ts`
  ships `NULL_PROVIDER` (no network I/O, reports `not_configured`).
- Honest provenance fields on every record (`provenance`,
  `verificationStatus`, `ingredientStatus`) and a manual-entry path labeled
  user-entered.
- `__tests__/noClientSecrets.test.ts` fails the build if a credential ever
  reaches client code.

## 2. Candidate sources

### A. Open Beauty Facts (openbeautyfacts.org)
Community-maintained open database of cosmetics, sister project of Open Food
Facts.

- **Fields:** name, brand, barcode, ingredient text, images, categories.
- **Coverage:** broad but uneven; strongest for mass-market European and US
  products; unconventional items (wipes, coconut oil, lash serums) appear but
  inconsistently. Recently launched products appear only after a volunteer
  scans them.
- **Ingredients:** present for many records but community-transcribed —
  must map to `ingredientStatus: 'unverified'`, never `'complete'`.
- **Auth / pricing:** open API, no credential, no fee (verify current rate
  guidance; bulk use is expected to go through data dumps, not API hammering).
- **Licensing:** Open Database License (ODbL) — attribution required and
  share-alike obligations on redistributed data. Needs a licensing review
  before we cache or re-serve records.
- **Server use:** yes; no secret to protect, but we would still proxy
  server-side to control volume and normalize honestly.
- **Risks:** data quality and duplicates (community entry), patchy freshness.

### B. Open Food Facts
Mostly food; some personal care overlap only. **Not a fit.**

### C. Commercial barcode databases (e.g. UPC lookup services)
General-merchandise barcode APIs.

- Paid tiers, API keys, commercial terms; caching/storage typically
  restricted; beauty-specific depth (ingredients, variants) is weak.
- **Verdict:** cost and terms without the beauty depth we need. Not
  recommended now.

### D. Retailer / affiliate feeds (Sephora, Ulta via affiliate networks)
- Require affiliate accounts and approval; terms built for link monetization,
  not catalog storage; ingredient data inconsistent; storage and display
  restrictions common.
- **Verdict:** revisit only if Dewy ever wants shopping links. Not for the
  catalog of record.

### E. Brand feeds
No general, legitimate, cross-brand feed exists. Per-brand partnerships are a
business-development effort, not an engineering phase.

### F. Manual + community-curated catalog (what we control)
Morgan-approved additions to the built-in list, plus user manual entry.

- Deterministic, zero cost, zero credentials, honest provenance, exactly the
  products Dewy's audience owns.
- Scales with editorial effort, not automatically.

### G. Hybrid (recommended shape, already the architecture)
Local index first → optional server-side provider fallback → normalize into
the internal schema with provenance → dedupe → upsert when legally permitted →
manual entry always available. This is what `docs/CATALOG_SOURCE.md` already
specifies and what the `NULL_PROVIDER` seam was built for.

## 3. Honest limitation

No search system can return a new product that is absent from every connected
catalog. Whatever is chosen, the manual path remains the floor, and recently
launched products may only exist as user-entered records.

## 4. Conclusions

- **A. Recommendation:** keep the local deterministic catalog as the product
  of record. If any live source is added, trial **Open Beauty Facts only**,
  server-side, as a fallback behind the existing seam, with results labeled
  unverified and ingredient data labeled unverified.
- **B. Expected gaps:** niche/new/luxury products patchy in OBF; ingredient
  reliability never better than "community transcribed".
- **C. Recurring costs:** $0 for OBF; hosting for a small server-side proxy
  (needed anyway before any provider).
- **D. Credentials:** none for OBF reads (environment names reserved in
  `docs/CATALOG_SOURCE.md` if a keyed provider is ever chosen).
- **E. Legal review:** ODbL attribution + share-alike review **required**
  before caching or redistributing OBF data.
- **F. Buildable without credentials:** everything currently built, plus an
  OBF adapter in a sandbox branch behind the seam, tested only against
  recorded local fixtures (no ordinary test calls the live API).
- **G. The exact decision Morgan must approve:**
  1. Whether to integrate Open Beauty Facts as a server-side fallback
     (includes: standing up a small server, accepting OBF/ODbL terms, the
     licensing review in E), **or**
  2. Stay local + manual only (no new approval needed; feature remains fully
     functional and honest).

Until one of those is approved, phases 6 (connect catalog) and 7
(freshness/sync) remain blocked by design.
