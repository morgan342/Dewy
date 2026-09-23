# Design Reference Review — Érra Atelier (Behance)

Source: https://www.behance.net/gallery/248801341/Luxury-Fashion-E-commerce-Branding-Website-Design
Reviewed: 2026-09-23 · Lens: Mike Matas (objects feel physical, one thing at a time, the interface disappears behind the content).
Status: **Review only. Nothing in `design/dewy.html` was changed.** Morgan taste-gates anything below.

Reference only. Do not copy Érra's photography, serif wordmark, layouts, or copy. Dewy keeps its own tokens, IBM Plex, and the nine-color set.

---

## What Érra Gets Right (Matas Reading)

1. **The product is the interface.** Every screen is 80% object, 20% type. Chrome is a thin hairline nav and small caps labels. Nothing competes with the thing you came to see.
2. **Product tiles are quiet, uniform, and physical.** Warm off-white plinth (#f2f1ec-ish), object centered with generous air, caption underneath in two lines: name, then one fact. No borders, no shadows, no badges fighting for attention. The plinth *is* the shelf.
3. **One hero, then supporting cast.** Home leads with a single full-bleed moment and a single line of copy. Grids come after, never first.
4. **Editorial asymmetry only on discovery.** The "about" and "journal" boards use offset images and negative space. The shop grid and product page are strict, calm, and legible. This is exactly Dewy's rule (asymmetry on discovery, structure on execution).
5. **Metadata as a physical label.** The woven clothing label ("MEDIUM SIZE / ÉRRA ATELIER / Dry clean only") is the strongest Matas moment in the set: data presented as a tactile object you'd find on the garment, not a spec table.
6. **Type does one job per level.** Big serif wordmark for identity only. Small tracked caps for section labels. Plain sans for everything else. Three roles, never mixed.
7. **The product page answers in order.** Name, price, image, variants, size, one black CTA, then tabs (Description / Size & Fit / Material / Care). One action visible. Everything else is a tap away.
8. **Whitespace is the luxury signal.** Rails of 25–35% blank canvas around content, not padding tricks.

## Where Érra Is Wrong For Dewy

- Black and dark-brown palette, fashion coldness. Dewy is Porcelain Ivory, warm, feminine, soft.
- Serif display wordmark. Dewy is locked to IBM Plex; a serif would break the approved font set.
- It sells. Dewy organizes what you already own. No prices, no "Add to Cart", no "You may also like" feeds (that would violate the one-recommendation rule).
- Mobile boards are just the desktop cropped. Dewy is mobile-first and the routine screens must stay calm and structured.

## Proposed Dewy Edits (For Morgan's Yes / No / "More Editorial")

Each is small, lives in `design/dewy.html`, and keeps the locked look.

| # | Edit | Where | Érra principle |
|---|------|-------|----------------|
| A | **Cabinet tile plinth.** Give every product tile a uniform Buttermilk-tinted plinth, object centered with more air, two-line caption (Name / one fact such as "AM · PM" or "Opened Jun"). Remove any tile borders. | Your Cabinet gallery | 2, 8 |
| B | **Home hero = one object.** Home opens with tonight's first product as a single large visual and one sentence, then the routine list. No grid above the fold. | Home | 3 |
| C | **Product label card.** On the product sheet, render the key facts (Step, Time Of Day, Opened, Source: Verified / User-Entered) as a small stacked label, mono type, like a woven tag. Keeps AI/inferred fields visibly labeled and editable. | Product sheet | 5 |
| D | **Section labels in small tracked caps.** Use `.t-meta` at 11px, letter-spacing .12em, Dried Plum, for "Tonight", "Your Cabinet", "Every So Often". Body stays as is. | All screens | 6 |
| E | **Product sheet action order.** Name, then image, then Step and Time Of Day chips (editable), then one primary button ("Add To Tonight" or "Save To Cabinet"), then collapsible Details / Directions / Notes. One CTA visible at a time. | Product sheet | 7 |
| F | **Discovery asymmetry, execution calm.** Allow one offset image plus short line on Journal / Ask surfaces only. Tonight and Morning routine lists stay a strict single column. | Journal, Ask | 4 |
| G | **Hairline nav.** Thin 1px Soft Silver rule under the top bar, wordmark left, profile right, nothing else. Bottom nav unchanged. | Top bar | 1 |

Recommended first batch if Morgan says yes: **A, C, D** (visible, low-risk, no behavior change). B and E touch Home and the sheet flow and should be a named sprint.

## What Not To Do

- No black screens, no dark mode as identity.
- No serif wordmark, no Pamore, no Canva fonts.
- No price, cart, or shop-the-look patterns.
- No copying Érra imagery or the "ER" monogram idea.
