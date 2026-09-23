# Dewy

Soft, feminine, elevated cosmetic routine app — **iOS first**, US only, freemium.

This folder is the Expo (React Native) + TypeScript app. Product docs, `CLAUDE.md`, and `.claude/agents` live alongside and must stay.

## Design voice

- **Surface:** Porcelain Ivory `#F7F6D7`
- **Ink:** Dried Plum `#6E1E3B`
- **Primary action:** Cherry Licorice `#A10808`
- **Cues:** Buttermilk `#FFF1B5`
- **Notes:** Milkshake Pink `#EDCCCC`
- **Dividers:** Soft Silver `#C8C5C1`

Calm, editorial, warm — never clinical, never generic SaaS. Title Case labels. Always capitalize **Cabinet**.

## How to run (Mac)

From this project folder (Desktop/Dewy after install):

```bash
npm install
npx expo start
```

Then press `i` for iOS Simulator, or scan the QR code with Expo Go on a US-region iPhone.

Useful checks:

```bash
npm run typecheck
npm test
npm run test:ui
```

`npm test` runs everything: the Node search suites and the `__tests__/ui/*.test.ts` suites, which load
`design/dewy.html` (the canonical live UI) into jsdom via `__tests__/helpers/loadDewy.ts` and drive it
with real clicks and input events. The HTML has no build step; its only syntax check is:

```bash
awk '/^<script>$/{f=1;next}/^<\/script>$/{f=0}f' design/dewy.html | node --check /dev/stdin
```

To look at it in a browser, serve the folder (`python3 -m http.server 4173`) and open
`http://127.0.0.1:4173/design/dewy.html` — `file://` blocks localStorage in some browsers.

Data model assumptions (HTML app): all state lives in `localStorage` key `dewy.v3` (a `dewy.v2` store
is read and upgraded, never deleted); product directions are source-aware (`directionsSource`,
`directionsVerified`, `directionsConflict`) and sample directions are always labelled as unverified;
there is no ingredient data and none is inferred; routines are ordered lists per time of day
(`S.routine.am` / `S.routine.pm`) once edited, otherwise the built-in plan; the only photos stored are
the person's own. Known MVP limits: no lint/format/build scripts exist yet; the Expo screen in `src/`
is a typed reference for search, not the shipped UI.

## What’s in this scaffold

- `src/screens/AddProductToCabinetScreen.tsx` — Brand, Product Name, Category (Cleanse/Treat/Seal/Finish/Protect), When to Use (Morning/Evening/Both), Add Product to Cabinet
- `src/search/` — local deterministic search (normalize, synonyms, rank) — **no paid APIs, no LLM search**
- `src/data/fixtures/products.ts` — development fixtures for search tests
- `src/theme/tokens.ts` — Color System tokens

## TactileCardStack (design/dewy.html)

Dewy's reusable card-stack primitive. One hero card with the next card beneath it; every moving thing
is a transform or opacity, geometry is measured once on touch-down, and no layout is read per frame.

- **API:** `TactileCardStack(root, { hasNext, hasPrev, onBrowse(dir), onSave(), onDismiss() })` → `{ state, destroy() }`.
  `root` holds `.stack-hero` (the card), optional `.stack-next`, `.stack-rail.right` (save destination, named),
  `.stack-rail.left` (dismiss). Omit `onSave`/`onDismiss` to disable a direction; it is then resisted, not refused.
- **States (logical, separate from presentation):** `idle → pressed → draggingVertical | draggingHorizontal → thresholdPreview →
  saving | dismissing | advancing → settled`, with `returning` on cancel. `undoAvailable` is the host's (`S.ui.stackUndo`, 6 s).
- **Thresholds (`STACK_TOKENS`):** up 30 % / down 25 % of card travel, save/dismiss 35 %, "ready" preview at 25 %; velocity 900 px/s
  (1100 px/s for dismiss); axis lock after 10 px at 1.2× dominance; over-pull `r = d·a/(a+|d|)`, `a = 120`.
- **Motion (`SPRINGS`):** `cardLift` 420/32/1, `card` (settle) 300/24/1, `pageReturn` 520/42/1 (no overshoot), `edge` 240/18/1.
  Touch-down compresses to `.985` in 90 ms; drag lifts to `1.025`. `prefersReduced()` turns every spring into an immediate
  state change, removes the lift and the next-card parallax.
- **Haptics:** `Haptics.threshold / commit / boundary` over `tick()`; one cue per threshold crossing, one on commit, one on a
  bounded pull, none during drag or on cancel. Works with no vibration support.
- **Accessibility:** the card is a focusable `role="group"` with a label that names the gestures and the buttons; keyboard
  Up/Down browse, Right or S save, Left or N dismiss; the visible buttons (Mark Complete, Skip, Back, Pause, Edit Routine)
  do everything the gestures do; outcomes are announced through the live region.
- **Host today:** the Routine step card — right rail = Mark Complete, left rail = Not Now (a skip, never a deletion), vertical =
  peek at other steps without changing the current one. Demo: `design/dewy.html?demo=stack`.
- **Tests:** `__tests__/ui/cardStack.test.ts` (thresholds, resistance, presets, compression, lift, single haptic, commit, undo,
  cancel, velocity commit, browse/peek, keyboard, Reduce Motion, inner taps, last-step undo).

## Founder lock

iOS first · US only · freemium · cosmetic routine (no medical claims)
