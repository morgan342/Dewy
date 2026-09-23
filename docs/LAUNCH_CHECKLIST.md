# Dewy — Launch Checklist

Mark items only when verified in the running app (not “code exists”).

## Product (must be green before TestFlight)

- [x] Home is the default screen *(verified in browser 2026-09-21)*
- [x] Tapping **Dewy** returns Home *(verified in browser 2026-09-21)*
- [x] Profile icon opens Profile *(verified in browser 2026-09-21)*
- [x] Bottom nav: Home · Cabinet · Routine · Discover · Profile *(verified in browser 2026-09-22; replaces the 2026-09-21 four-tab nav — Ask lives under Discover as Review Your Products)*
- [x] From Tonight: obvious **Add a Product** *(verified in browser 2026-09-21)*
- [x] Search: type brand (e.g. Dior) → Search or Return → list stays underneath (≥3 when catalog has them) *(verified: “Dior” → 10 results, Search button and Return both work)*
- [x] Picking/saving a product adds it to Cabinet automatically *(verified: Dior Capture Youth Moisturizer saved to Cabinet)*
- [x] Empty Cabinet has a clear first action *(verified in browser 2026-09-22: "Your Cabinet Is Empty" silhouette + single "Add Product" button; Home suggestion also points to Add Product)*
- [x] No invented ingredient/medical claims in UI copy *(verified in browser 2026-09-22: Ingredient Review is a fixed "Needs More Information" state, sample directions are labelled "From Dewy’s Sample Records · Not Verified", unknown directions show "Check Product Directions", answers carry an Information Completeness line; `__tests__/ui/directions.test.ts` and `advisor.test.ts` guard it)*
- [x] Add Product by hand: photo optional, Name/Brand/Category/When, confirm "Add To Your Cabinet", validation keeps entries *(verified in browser 2026-09-22)*
- [x] Product Detail: Notes, Routine Placement, Pause/Finished/Delete with confirm and undo *(verified in browser 2026-09-22)*
- [x] Routine: Step X Of Y, Next by name, Back/Skip/Pause, Edit Routine with Move Up/Move Down/Remove/Add From Cabinet, "Evening Routine Complete" *(verified in browser 2026-09-22)*
- [x] One suggestion at a time on Home with Why This Appeared, Not Now, Undo *(verified in browser 2026-09-22)*
- [ ] Reduce Motion checked on a real device (System Settings → Accessibility) — jsdom test covers the helper only

## Store (before App Store submit)

- [ ] App name + subtitle locked
- [ ] Screenshots (6.7" + 6.1")
- [ ] Privacy Policy URL live
- [ ] Support URL live
- [ ] Age rating questionnaire answered
- [ ] Apple Developer account + bundle ID
- [ ] TestFlight internal build

## Ops

- [ ] GitHub `main` matches Desktop/Dewy (no secret debug dumps)
- [ ] Claude Code standing prompt obeyed every session
