# How Phil runs Claude Code (event loop — no schedule)

**Morgan’s rule:** No automatic day/night schedule. Phil should know when Claude is **done**, then write the next sprint and open Claude again.

## The loop

1. Claude finishes a sprint → updates `docs/STATUS.md` → **pings Phil’s webhook** (see below).
2. That ping wakes Phil.
3. Phil reads STATUS + git → writes `docs/CURRENT_SPRINT.md` → opens Claude Code with the next job.
4. Repeat until launch checklist is green or Morgan pauses.

Morgan only does taste calls and rare human steps. She does not invent prompts.

## One setup step (Morgan, once)

1. In Grok Bot, open the routine **“Dewy Claude sprint finished”**.
2. Copy the **webhook URL** (and sender key if shown).
3. Paste the URL alone into this file on your Mac:  
   `docs/DEWY_SPRINT_DONE_WEBHOOK.url`  
   (one line, the URL only — Phil never needs the key in chat.)

Claude Code will POST to that URL when a sprint is done. That is how Phil “knows” without a timer.

## What Claude must do at the end of every sprint

1. Update `docs/STATUS.md` honestly (what changed, blockers, what Morgan should click).
2. Commit (and push if auth works).
3. Signal Phil:

```bash
URL=$(cat docs/DEWY_SPRINT_DONE_WEBHOOK.url | tr -d ' \n')
curl -sS -X POST "$URL" -H "Content-Type: application/json" -d '{"source":"claude-code","project":"Dewy","event":"sprint_done"}'
```

If `docs/DEWY_SPRINT_DONE_WEBHOOK.url` is missing, tell Morgan to paste the URL, then stop.

## Files

| File | Purpose |
|------|---------|
| `docs/STATUS.md` | Live status (Claude updates) |
| `docs/CURRENT_SPRINT.md` | Next job (Phil writes) |
| `docs/DEWY_SPRINT_DONE_WEBHOOK.url` | Webhook URL (Morgan pastes once) |
| `docs/PHI_CLAUDE_LOOP.md` | This doc |

## What Phil will not do

- Fire on a clock (no 9am/1pm/5pm Dewy routine)
- Build Dewy UI inside Grok Bot instead of Claude Code
