# PASTE INTO CLAUDE CODE — upload Dewy to GitHub

Treat `docs/CLAUDE_CODE_STANDING_PROMPT.md` as still in force.

**Goal:** Put the full Dewy desktop project on GitHub so Claude Code and Phil can use one source of truth.

**Remote already exists:** `origin` → `https://github.com/morgan342/Dewy.git` (branch `main`).

**Do this now:**

1. Update `.gitignore` to also ignore:
   - `design/_debug-*.png`
   - `design/*.bak-*`
   - `design/dewy.html.bak*`
   - keep ignoring `node_modules/`, `.expo/`, `.DS_Store`, logs, coverage

2. Stage everything needed for the app + docs (do **not** stage ignored debug/bak files or `node_modules`):
   - `design/dewy.html`
   - `CLAUDE.md`, `README.md`, `README-APP.md`
   - `docs/**` (including standing prompts, app-workflow, design blueprint, founder decisions)
   - `.claude/agents/**`
   - Expo scaffold: `src/`, `App.tsx`, `app.json`, `package.json`, `package-lock.json`, configs, `__tests__/`, `assets/`
   - `.gitignore`

3. Commit with message:
   `Add Dewy live UI, Claude standing prompts, app-workflow docs, and Expo scaffold`

4. Push to `origin main`.
   - If auth fails, stop and tell Morgan exactly one click path to finish login (no token paste into chat).
   - Do not force-push.

5. Reply with:
   - GitHub URL
   - What was committed (short list)
   - What was left out on purpose
   - Next sprint title (one line)

Do not redesign the app in this sprint. Upload only.
