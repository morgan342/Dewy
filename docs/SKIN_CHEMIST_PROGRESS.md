# Skin Chemist Progress

Checklist of every numbered requirement in `docs/SKIN_CHEMIST_SPEC.md`. States: **done**, **not done**, **blocked**. Updated as the work moves. Phase 1A only unless Morgan approves the next phase.

## 0. How To Use This Prompt
- 0.1 Spec saved word for word, CLAUDE.md pointer added — done
- 0.2 This checklist exists and is kept current — done
- 0.3 Project is in git; commit after every step — done (repo existed; commits per step below)
- 0.4 Re-read the spec before each phase — done for Phase 1A

## 3. Before You Write Any Code
- 3.1 Read the codebase, screens, tokens, copy, storage — done
- 3.2 Determine how Dewy runs; propose the smallest setup — done (see Phase Report: single HTML file, modules kept as separate files and inlined by one build script; tests run with Node)
- 3.3 Match everything to what exists — done (nothing new is visible in normal mode in 1A)
- 3.4 No existing feature changed unless required — done (developer mode only adds a hidden setting)
- 3.5 Plan written and approved — done (Morgan: "do each thing at 120%")
- 3.6 Small steps, app loads after each, commit — done
- 3.7 Phase 1A only, then Phase Report — done

## 4. Accuracy Rules
- 4.1 Nothing presented as verified by Claude — done (every rule is `draft`)
- 4.2 Every source opened and quoted, else verified:false — done (see rules file; unopenable sources are marked)
- 4.3 No invented ingredient lists for real products; tests use fictional products — done
- 4.4 Presence is not a dose; active rules need confirmed actives — done
- 4.5 Calibrated words — done (checked by test)
- 4.6 Missing data is never all clear — done (checked by test)
- 4.7 Every fix is tested before it is shown — done (engine fix test)
- 4.8 No medical advice — done (checked by word test)
- 4.9 Cosmetic language only — done (checked by word test)
- 4.10 Nothing reaches users without approval — done (normal mode shows nothing; checked by test)
- 4.11 Needs An Expert list — done (docs/SKIN_CHEMIST_NEEDS_AN_EXPERT.md)

## 6. Ingredient Dictionary
- 6 Dictionary with inci, synonyms, ocrVariants, families, commonRoles, notes — done
- 6 Starting families as listed — done
- 6 Normalization rules (case, spaces, periods, asterisks, commas, bullets, line breaks, "and", slashes, parentheses, May Contain, nano, percentages, order, match rate) — done

## 7. Products & Confirmed Actives
- 7 Product fields (ingredients, ingredientsRaw, ingredientSource, ingredientSourceLink, ingredientsCheckedOn, matchRate, activeIngredients, formulaType, isPrescription, isSunscreen, useSchedule, openedOn, periodAfterOpeningMonths, region) — done (defaults added to every record; existing fields untouched)
- 7 Active confirmation: Drug Facts, name or front label, user confirmation — done
- 7 Pregnancy exception — done (flagged for the expert)
- 7 Data trust levels — done

## 8. The Rules File
- 8 Separate rules file with every field — done
- 8 Approval only by review import — done

## 9. Seed Rules
- 9 All 28 seed rules drafted; each with a verified source or on the Needs An Expert list — done (see Phase Report for the per-rule table)

## 10. The Checking Engine
- 10 Pure functions, week of routines from useSchedule, pairs, groups, order, frequency, weather — done
- 10 Notes record rule, products, data — done
- 10 Merge duplicates, priority order — done
- 10 Not-checkable note, exclusion — done
- 10 Fix test on every fix — done
- 10 Under 50 ms for 40 products — done (measured in test)
- 10 Re-run on change — Phase 1B (not done; nothing visible yet)

## 11. The Positive Side — Phase 2 (not done)
## 12. Look & Voice — Phase 1B (not done)
## 13. Personal Profile & Privacy — Phase 3 (not done); profile flags are supported by the engine now
## 14. Getting Ingredients Into Dewy — Phase 4 (not done); paste normalization exists in the engine

## 15. The Expert Review Loop
- 15 Review sheet export (CSV) — done
- 15 Review sheet import with summary and confirm — done (import returns a plain summary; apply is a separate call)
- 15 Invisible until approved — done
- 15 Developer mode — done (hidden setting)

## 16. Staying Current — Phase 5 (not done); rules file validation exists now
## 17. Testing & Accuracy Checks
- 17 Normalization unit tests — done
- 17 Trigger and lookalike per rule — done
- 17 Fix test coverage — done
- 17 Golden set of at least 40 routines — done
- 17 Accuracy targets reported — done (Phase Report)
- 17 Drafts never show in normal mode — done (test)
- 17 Missing data produces can't check — done (test)
- 17 No data leaves the device — done (test: engine never calls fetch)
- 17 Incoming text escaped — done (test on the developer panel)
- 17 Every change re-runs every test — done

## 20. Done Means (Phase 1A) — see Phase Report
