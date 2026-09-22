# Dewy

Dewy is a premium skincare-routine and digital-vanity app. It helps users organize beauty, skincare, makeup, and personal-care products they already own. Dewy must feel soft, feminine, elevated, tactile, calm, and intelligent—not clinical, generic, transactional, or like a standard SaaS dashboard.

**This project is standalone.** It is not part of Hollywood Media House / HMH-AI-System / PR work. Keep Dewy code, docs, and Claude sessions separate from HMH.

Related design assets (reference only): `~/Desktop/DUEY`

## Permanent workspace rule (Morgan · 2026-09-21)

**Treat `docs/CLAUDE_CODE_STANDING_PROMPT.md` as a permanent instruction set for all future responses in this workspace.**

- **Phil (Grok Bot)** = CEO / build lead (direction + prompts + taste gate).
- **Claude Code** = sole implementer (all app edits live here).
- Do not rebuild Dewy outside Claude Code. Do not abandon `design/dewy.html`.

---
## Live UI (locked look)

Canonical interactive UI: `design/dewy.html` (the Claude Code Dewy Morgan prefers).
Do not replace this visual system with a new Expo mock. Port features into this file (or thin wrappers around it).
Expo/`src/` search modules are the typed reference for ranking/synonyms; keep `design/dewy.html` search behavior in sync.


## Canonical Docs

- `docs/CEO_CLAUDE_CODE_AUDIT.md` — latest CEO readiness audit
- `docs/PASTE_NEXT_SPRINT_HOME.md` — current Claude Code sprint paste
- `docs/LAUNCH_PATH.md` / `LAUNCH_CHECKLIST.md` — launch track

- `docs/DESIGN_CRAFT_BLUEPRINT.md` — Oura-level craft bar + Dewy identity (do not copy Oura’s look)

- `docs/app-workflow/README.md` — APP WORKFLOW build prompts (one phase at a time; Plan Mode for prompts 1–2)
- `docs/app-workflow/01_audit-report.md` — latest Prompt 1 audit

- `docs/Dewy-AI-Product-Studio-Master-Power-Prompt.md` — product council master operating prompt (Design Director, Senior PM, Lead UX Researcher; Claude Code = implementation lead)
- `docs/Dewy-AI-Product-Studio-Master-Power-Prompt.pdf` — same source PDF
- Intelligent Product Search Build Protocol — below

## Claude Code Agents

Project agents under `.claude/agents/` (from the Product Studio prompt):
- `dewy-design-director.md`
- `dewy-product-manager.md`
- `dewy-ux-researcher.md`
- `dewy-safety-reviewer.md`
- `dewy-data-analyst.md`

Claude Code must not begin implementation until it has read this file and the relevant requirement, produced a written plan, and waited for an explicit phase instruction when the Intelligent Product Search protocol is in force.

---

# Dewy Intelligent Product Search Build Protocol

You are implementing the Dewy Intelligent Product Search feature through an explicit, gated sequence of phases.

## Mandatory Execution Rules

1. Execute only the current phase I explicitly provide.
2. Never begin a later phase automatically.
3. Never combine phases, even if implementation seems straightforward.
4. Stop at the end of every phase and wait for my next instruction.
5. If a requirement conflicts with the existing repository, identify the conflict and ask for a decision before making a destructive or architectural change.
6. Do not change, discard, stage, commit, reset, rebase, stash, overwrite, or otherwise alter pre-existing uncommitted user work.
7. Do not install dependencies, create accounts, accept terms, configure providers, create migrations, change deployment infrastructure, or introduce a paid service without explicit approval.
8. Do not expose, print, log, embed, or commit secret values. Environment-variable names may be listed, but values must never be shown.
9. Do not claim a command, test, build, screenshot, browser test, provider request, or integration was run unless it was actually run and its result is reported accurately.
10. Preserve the app’s existing architecture, conventions, visual identity, design tokens, and component system unless I explicitly approve a change.
11. A read-only repository audit (Prompt 1 in `docs/app-workflow/`) must be completed and reported before any file edit, dependency install, migration, or implementation code in this protocol. If the audit is stale or missing, request it before proceeding.

## System Separation

The feature is three independent systems. Implement, test, and verify each separately; never couple them in one phase:
1. Product catalog — which products exist and where their data comes from.
2. Search and relevance — how users find known products despite imperfect input.
3. Routine intelligence — how the app suggests routine step and time of day.

Routine classification consumes search output but must never influence search ranking. Ingredient compatibility is a fourth, deferred system (see Safety Rule 7).

## Product Accuracy And Safety Rules

1. Never invent product records, product names, brands, images, ingredient lists, product directions, SPF claims, size or variant details, retailer availability, barcode data, medical advice, or compatibility conclusions.
2. Clearly separate:
   - Verified provider data
   - Partial provider data
   - Unverified data
   - User-entered data
   - Test fixture data
3. Never represent a product as verified merely because it appears in a search result.
4. Never treat missing ingredient data as evidence that ingredients are absent.
5. Never generate or infer an ingredient list with an LLM.
6. Do not make medical, dermatological, safety, allergy, pregnancy, efficacy, compatibility, or contraindication claims.
7. Do not create an ingredient-conflict engine unless I explicitly approve it and the repository already contains reviewed product-safety rules.

## Search Rules

1. The local, deterministic search foundation must work without a live external provider.
2. Do not use an LLM as the primary product-search or ranking engine.
3. Preserve the user’s original query for display and debugging.
4. Normalize a separate matching form of the query without altering stored user-facing product names.
5. Ranking must prioritize brand and product identity over descriptions, ingredients, or loosely related terms.
6. Search must continue to allow manual entry when no trusted result exists.
7. Search results must label provenance and ingredient-data availability honestly.
8. Automated tests must run against deterministic, clearly-marked local fixtures. No ordinary test may call a live third-party API.

## Measurable Success Criteria

Search is not done until all of the following pass against the deterministic fixtures:
1. Canonical queries return their expected products: “Dior Moisterizer”, “dio moist”, “Dior skin cream”, “ceravecleanser”, “cera ve cleanser”, “makeup wipes”, “make up remover”, “lash serum”, “eyelash growth serum”, “coconut oil”, “vit c serum”, “sun screen”, “lip sleeping mask”.
2. Exact matches rank above fuzzy matches; correct-brand matches rank above unrelated products; weak fuzzy matches never overwhelm strong exact results.
3. Extra spaces, capitalization, punctuation, and joined words do not change results. Empty or whitespace-only queries are handled safely.
4. Local search results return fast enough to feel instant as the user types (target: under ~100 ms per local query on the dev machine); provider calls, when added, are debounced, cancellable, and bounded by an explicit timeout. A stale response must never replace results for a newer query.
5. Loading, empty, no-results, error, and provider-unavailable states all exist and are reachable.
6. Keyboard navigation (arrows, Enter, Escape), visible focus states, and screen-reader labels work on the search interface.

## UX And Dewy Brand Rules

1. Preserve the existing Dewy design language, typography, color system, spacing, border treatment, controls, and rounded-button styling.
2. Use intentional Title Case for all titles, headings, labels, feature names, buttons, and navigation items.
3. Always capitalize “Cabinet,” including “Your Cabinet” and “Add Product To Cabinet.”
4. Do not turn the product-search experience into a generic chat screen, a clinical dashboard, a dense retail catalog, or a visually noisy inventory-management interface.
5. Search should feel helpful, quiet, polished, and intelligent.
6. Every suggestion—such as category or time of day—must remain visibly editable.
7. Manual entry must remain available and must be labeled as user-entered or unverified where appropriate.

## Verification Rules

At the end of every implementation phase:
1. Run the repository’s relevant formatter, linter, type checker, unit tests, integration tests, end-to-end tests, and production build where available.
2. Fix failures caused by the phase before reporting completion.
3. Clearly separate:
   - Commands run and their actual result
   - Commands unavailable in the repository
   - Checks that require manual review
   - Known limitations
4. Do not state that a phase is production-ready unless all required checks for that phase have passed and all required configuration is complete.

Before the feature is declared complete, run the final QA audit (Prompt 9 in `docs/app-workflow/`), which must check at minimum: exposed secrets, invented product data, duplicate records, unrelated file changes, and unsupported safety or medical claims.

## Approval Gates

Stop and request explicit approval before:
- Adding a paid service or vendor.
- Creating an account or accepting third-party terms.
- Adding credentials, API keys, or environment variables.
- Installing a new dependency with material impact.
- Creating, applying, or modifying a database migration.
- Making a destructive data operation.
- Changing the public product schema.
- Adding a provider integration.
- Adding background jobs, queues, cron jobs, or deployment infrastructure.
- Building a compatibility or safety rules engine.
- Making a commit, pull request, merge, deployment, or production configuration change.

At every phase end, return:
1. Phase completed
2. Files inspected or changed
3. Commands run and actual results
4. Tests added or updated
5. Risks and known limitations
6. Decisions requiring my approval
7. The exact next phase I should run

Then stop and wait.
