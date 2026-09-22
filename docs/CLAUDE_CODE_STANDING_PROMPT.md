# Dewy — Permanent Claude Code Instruction Set

**Treat this as a permanent instruction set for all future responses in this workspace.**

Read this file at the start of every Dewy session. Do not wait to be asked again.

---

## Who does what

| Role | Who | Does |
|------|-----|------|
| CEO / build lead | **Phil (Grok Bot)** + Morgan | Direction, sequence, taste yes/no, prompts |
| Implementer | **You (Claude Code)** | All code, all UI edits, all search/nav/home work in this repo |
| Taste | **Morgan only** | Visual yes / no / “more editorial” |

You build. Phil writes what to build next. Morgan only makes taste calls and rare human steps (logins, paid services, commits when asked).

**Do not tell Morgan to go back to Grok Bot to “just edit the HTML yourself.”** You edit `design/dewy.html` (and related docs) here.

---

## Canonical product

- **App:** Dewy — premium skincare-routine + digital vanity (Cabinet). Soft, feminine, elevated, calm, editorial. Not clinical. Not SaaS.
- **Locked live UI:** `design/dewy.html` — this is the look Morgan already likes. **Never replace it with a new Expo mock or a redesign from scratch.**
- **Design refs:** `~/Desktop/DUEY` (colors, craft). Full nine-color set. Oura-level *craft* (calm, sparse, one focus) — not Oura’s black look.
- **Docs:** `CLAUDE.md`, `docs/DESIGN_CRAFT_BLUEPRINT.md`, `docs/Dewy-AI-Product-Studio-Master-Power-Prompt.md`

---

## Hard product rules

1. Never invent product / ingredient / medical / safety data.
2. Local deterministic search first — no LLM as primary search.
3. No paid APIs, secrets, commits, or dependency installs unless Morgan explicitly approves in chat.
4. Preserve Dewy voice, tokens, and visual system unless Morgan taste-approves a change.
5. Keep explanations short; Morgan gets overwhelmed by long dumps. Prefer working software + a 3-bullet status.

---

## UX Morgan locked (must ship)

### Navigation / Home (priority — she is frustrated)

- Real **Home** screen (not dumping her on Tonight’s routine).
- Tap **“Dewy”** wordmark → Home.
- Tap **profile** → Profile.
- Bottom nav clear like a simple website: **Home · Tonight (or Morning) · Cabinet · Ask** (Journal reachable from Home or Profile).
- Adding a product from **Tonight/Routine** must be obvious — **do not** require hunting through Cabinet first.
- Anything added is **saved to Cabinet automatically**.

### Product search (must feel stupid-simple)

- Search bar + **Search** button (and Return/Enter).
- Type a brand (e.g. **Dior**) → Search → **list of products stays underneath** (aim for several matches, not one flash).
- Tap a result to select — no constant retyping.
- Brand-only queries must work (typing “Dior” alone shows Dior products).
- Do not make search cleverer than it needs to be.

---

## How you work each turn

1. Read `CLAUDE.md` + this file.
2. State in ≤5 lines what you will change.
3. Edit `design/dewy.html` (and docs if needed).
4. Verify in browser or by reading the result — report what Morgan should click.
5. Stop. Wait for Phil’s next prompt or Morgan’s taste call (“yes” / “no” / “more editorial”).

If Phil pastes a follow-up prompt, treat it as the current sprint. Still obey this permanent set.

---

## Immediate build order (run now unless Phil overrides)

1. **Home + nav** — Home default; Dewy → Home; profile works; bottom nav Home / Tonight / Cabinet / Ask.
2. **Add product from Tonight** — clear control; search → results list → pick → saved to Cabinet.
3. **Search** — brand-only + Search/Enter → persistent results (≥3 when catalog has them).
4. Only then continue Intelligent Product Search phases from `CLAUDE.md` / `docs/app-workflow/` if Phil says so.

---

## Status format when you finish a sprint

1. What changed (paths)
2. What Morgan should click to try it
3. What’s still open
4. Exact next sprint title (one line)

## End of every sprint (required — wakes Phil)

There is **no timed schedule**. Phil only continues when you signal done.

1. Update `docs/STATUS.md` honestly.
2. Commit your work (push if possible).
3. If `docs/DEWY_SPRINT_DONE_WEBHOOK.url` contains a real `https://` URL, POST to it:

```bash
URL=$(grep -E '^https://' docs/DEWY_SPRINT_DONE_WEBHOOK.url | head -1 | tr -d ' \n')
curl -sS -X POST "$URL" -H "Content-Type: application/json" -d '{"source":"claude-code","project":"Dewy","event":"sprint_done"}'
```

4. If there is no URL yet, tell Morgan: paste the webhook from Grok Bot routine **Dewy Claude sprint finished** into `docs/DEWY_SPRINT_DONE_WEBHOOK.url`, then stop.

Do not start the next sprint yourself unless `docs/CURRENT_SPRINT.md` already contains it and Phil opened you for that.

