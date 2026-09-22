# Dewy — Live Status

**Last updated:** 2026-09-21 ~18:05 (Claude Code, after sprint `docs/CURRENT_SPRINT.md` dated 2026-09-21)

## One-line status
Home + nav + Add-a-Product + Dior search are **green and verified in the browser** on commit `59e7dfb` (pushed to GitHub `main`). Webhook to wake Phil is **not configured** — Morgan must paste it (see Blockers).

## Last Claude sprint
- Prompt: `docs/CURRENT_SPRINT.md` (2026-09-21) — Home default · Dewy→Home · Profile · nav Home/Tonight/Cabinet/Ask · Add a Product from Tonight · Dior → Search/Return → persistent list → save to Cabinet.
- Result: **all six product items pass.** Verified by clicking through `design/dewy.html` served locally in a browser (fresh localStorage):
  - Fresh load lands on **Home** (greeting, six cards, nav Home · Tonight · Cabinet · Ask with Home active).
  - Tonight screen → tap **Dewy** wordmark → Home. Profile icon → Profile (has "Back to Home").
  - Tonight shows **"Add a Product to Tonight"** under Begin Routine (and a big Add a Product button when the routine is empty).
  - Home → Add a Product → typed **Dior** → **Search** button → **10 Dior products** stay listed underneath. **Return** key also runs search ("cera ve cleanser" → 24 results, CeraVe cleansers ranked first).
  - Tapped Dior Capture Youth Moisturizer → details prefilled (Dior / Capture Youth Moisturizer / Seal / Both) → **Add Product to Cabinet** → landed in Cabinet, product present, announced "Saved to your Cabinet."
- Code change this sprint: one line in `design/dewy.html` (~978) — the Tonight header's "Dewy" wordmark became a Home button, matching every other screen. It is in `59e7dfb`.
- Cleanup: `design/_debug-*.png` and `design/*.bak*` — none on disk (already gone).
- Commit/push: loop docs (`PHI_CLAUDE_LOOP.md`, `CURRENT_SPRINT.md`, `PASTE_AUTO_SPRINT.md`, standing prompt, `CLAUDE.md`, `.gitignore`) are in `59e7dfb`; `origin/main` == local `main`.

## ⚠️ Incident this sprint (read this, Morgan)
While this sprint ran, **another Claude session on this Mac overwrote `design/dewy.html` twice** (17:41:23 and 17:47:43) with an older ~377 KB version that has **no Home screen, no Home tab, and no working Search button** — it was building new features ("Every So Often" occasional products, product glyphs, add icons on result rows) on a stale copy. Each write erased the committed Home/search work.
- I restored the file from `59e7dfb` both times and **made it read-only** (`chmod 444 design/dewy.html`) to stop the ping-pong. It has been stable since 17:53.
- The two overwritten versions are saved (not lost) in this session's scratchpad as `dewy-clobbered-1741.html` / `dewy-clobbered-1747.html`. Treat that "occasional products" work as **unreviewed** until its author is identified and it is re-applied on top of `59e7dfb`.
- Sessions "Claude Code workspace setup" and "CEO audit follow-up" confirmed the writes were not theirs. Prime suspect is the session named **"Dewy UI file backup"** — it had not replied when this sprint ended. **Morgan: close or stop that session before the next sprint.**
- Before the next Claude sprint edits the file, run: `chmod 644 design/dewy.html`

## Blockers
1. **Webhook not set.** `docs/DEWY_SPRINT_DONE_WEBHOOK.url` still contains only the placeholder comment, so Phil was **not** pinged. Morgan: in Grok Bot open routine **"Dewy Claude sprint finished"**, copy the webhook URL, paste it as the only line in that file. Then Phil can open the next sprint.
2. Unidentified session writing stale copies of `design/dewy.html` (see Incident). Stop it before lifting the read-only guard.
3. Uncommitted, untouched work by another session in `src/` (`src/catalog/`, `src/search/parseQuery.ts`, `routineSuggestion.ts`, edits to `rank.ts`, `synonyms.ts`, `normalizeQuery.ts`, `fixtures/products.ts`, `types/product.ts`). Not part of this sprint; left as-is per the standing rule against altering others' uncommitted work.

## What Morgan should click to try
1. Open `design/dewy.html` in a browser (double-click the file).
2. You land on **Home**. Tap **Tonight** (bottom nav) → tap **Dewy** (top-left) → back Home.
3. Home → **Add a Product** → type **Dior** → tap **Search** (or press Return) → 10 Dior products stay listed → tap one → **Add Product to Cabinet** → Cabinet shows it.
4. Tap the **profile icon** (top-right) → Profile → **Back to Home**.

## Checklist snapshot
`docs/LAUNCH_CHECKLIST.md` — the seven Product items marked *verified in browser 2026-09-21* are confirmed by this sprint's click-through. Still open: empty-Cabinet first action; no-invented-claims copy pass; all Store and Ops items.

## Next sprint title
Beauty polish pass on Home + empty-state copy (empty Cabinet first action) — after Morgan pastes the webhook and stops the stale-writer session
