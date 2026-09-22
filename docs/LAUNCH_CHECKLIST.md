# Dewy — Launch Checklist

Mark items only when verified in the running app (not “code exists”).

## Product (must be green before TestFlight)

- [x] Home is the default screen *(verified in browser 2026-09-21)*
- [x] Tapping **Dewy** returns Home *(verified in browser 2026-09-21)*
- [x] Profile icon opens Profile *(verified in browser 2026-09-21)*
- [x] Bottom nav: Home · Tonight/Morning · Cabinet · Ask *(verified in browser 2026-09-21)*
- [x] From Tonight: obvious **Add a Product** *(verified in browser 2026-09-21)*
- [x] Search: type brand (e.g. Dior) → Search or Return → list stays underneath (≥3 when catalog has them) *(verified: “Dior” → 10 results, Search button and Return both work)*
- [x] Picking/saving a product adds it to Cabinet automatically *(verified: Dior Capture Youth Moisturizer saved to Cabinet)*
- [ ] Empty Cabinet has a clear first action
- [ ] No invented ingredient/medical claims in UI copy

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
