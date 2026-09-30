Dewy Skin Chemist Master Prompt V2 Last Updated September 30, 2026

Copy everything below this line into Claude Code, opened in the folder that holds the Dewy app.



Build The Dewy Skin Chemist
0. How To Use This Prompt
   1. This prompt is long on purpose. Save it word for word as docs/SKIN_CHEMIST_SPEC.md in the project. Add one line to CLAUDE.md (create it if missing): "The Skin Chemist spec is in docs/SKIN_CHEMIST_SPEC.md. Re-read it before every phase."
   2. Keep a checklist in docs/SKIN_CHEMIST_PROGRESS.md of every numbered requirement below, marked done, not done, or blocked. Update it as you work.
   3. If the folder is not a git repository, initialize one and commit the current app before changing anything. Commit after every step with a plain-English message, so any step can be undone.
   4. Re-read the spec before each phase. Long work drifts; the spec wins over your memory of it.
1. The Goal
Dewy is a premium skincare ritual app. Its promise: "You own great skincare. Dewy shows you how to use it right."

The Skin Chemist is the intelligence behind that promise. For the exact products in each user's cabinet, it tells them:

   * How to get more out of them: the right order, the right time of day, the right amount, the right technique, and the expert tips most people never hear.
   * What to watch for: which products may pill, irritate, or weaken each other, and exactly what to do about it.

Most of the value is in the first part. Dewy is not a warning machine. It is the calm expert standing at your vanity.
What Success Looks Like
   * Accurate: every note a user sees is approved by a qualified expert (a cosmetic chemist or board-certified dermatologist) and backed by a verified source.
   * Never confidently wrong: when Dewy lacks data, it says so. It never implies "all clear" when it could not check.
   * Personal: notes name the user's own products, not generic advice.
   * Calm: on average, one note or fewer per routine. Safety always comes first.
   * Trusted over time: users can see why, see the source, and report a mistake in a few taps.
Accuracy Targets (Recommended Defaults, Morgan Can Change)
   * Zero safety misses on the test set.
   * Zero cases of "all clear" shown when data is missing.
   * At least 95% agreement between the engine's output and the expert's expected output on the test set before public launch.
   * Average notes per routine on the test set at or below 1.
2. Build On What Already Exists
Dewy already has parts of this. Read them first and extend them. Do not build parallel versions.

   * The product records (the PRODUCTS data) already have confidence (for example SAMPLE), active, morningEligible, eveningEligible, category, lines (how to apply), and why. Extend these fields; do not replace them.
   * Dewy already fetches local humidity and temperature from Open-Meteo and shows humidity-based suggestions. Reuse this for climate-aware tips.
   * Dewy already has a feature that answers questions about two specific products, and it currently says it holds no ingredient data and will not guess. When both products are checkable, the Skin Chemist powers that answer. When they are not, keep the current honest message.
   * Dewy already contains statements that it holds no ingredient data and makes no safety or compatibility claims. Update each one so it stays true: it applies to products without checkable ingredients. Do not delete the honesty; make it precise.
   * Dewy has a sample cabinet clearly labeled as example products. Keep that label.
   * Dewy builds screens from HTML strings and has an escape helper. Every piece of user-entered, photo-read, or database text must pass through that escape helper before it reaches the page.
   * Dewy stores data in the browser (localStorage) today.
3. Before You Write Any Code
   1. Read the entire codebase. Learn every screen (Home, Cabinet, Routine, Profile), the design tokens, colors, type, spacing, card styles, motion, copy style, and how data is stored.
   2. Determine how Dewy runs today. It may be a single HTML file published as a Claude artifact. If so, tell me in plain words what that limits (for example: loading files from other websites, camera access, running tests) and propose the smallest setup that works: for example, keeping the source in separate files with a simple build step that still outputs one HTML file, and running tests with Node. Do not move Dewy to a new platform (for example a native iPhone app) without my approval.
   3. Match everything you add to what exists. No new colors, fonts, card styles, icons, or tones of voice.
   4. Do not change any existing feature unless this task requires it. If it does, tell me first.
   5. Write me a plan (see Section 5 for format) and wait for my approval.
   6. Build in small steps. After each step, confirm the app loads and every existing screen still works. Commit.
   7. Work only on the phase I approve. When done, stop and give me the Phase Report (Section 19).
4. Accuracy Rules (Non-Negotiable)
   1. You are not the expert. Everything you write about chemistry or skin is a draft for an expert to approve. Never present your own knowledge as verified.
   2. Verify every source. For each source, open the link and copy the exact sentence that supports the rule into quote. If you cannot open it (no web access, paywall, dead link), set verified: false. A rule with no verified source cannot be marked ready for review. Never invent a title, author, study, or link.
   3. Never invent ingredient lists for real products. Not for samples, not for tests. Real brand products get ingredients only from their label, the brand, or an openly licensed database, with the source recorded. Test data uses clearly fictional products (for example "Test Gel Serum A").
   4. Presence is not a dose. An ingredient appearing on a label does not mean it is doing its job in that product. Citric acid and lactic acid are often only pH adjusters. Salicylic acid can be a small helper ingredient. Retinyl palmitate and ascorbic acid can appear in tiny amounts. Rules about actives fire only when the product's active is confirmed (Section 7), never from a name match alone.
   5. Calibrated words only. "May pill," "can sting," "often irritates." Never "will."
   6. Missing data is never "all clear." A product that cannot be checked produces a "Dewy can't check this one yet" note and is excluded from all other rules.
   7. Every fix is tested before it is shown. Before suggesting a fix, re-run the engine on the routine as it would look after the fix. If the fix creates a new note of the same or higher tier, choose another fix, or say "Ask your dermatologist how to fit these together."
   8. No medical advice. Never diagnose. Never tell anyone to stop, change, or combine a prescription. Medical questions go to their doctor or dermatologist.
   9. Cosmetic language only. Never say a product or routine "treats," "cures," "heals," or "prevents" a condition (acne, rosacea, eczema, and others). Say "helps skin look," "supports," or "may help."
   10. Nothing reaches users without expert approval. Draft and unreviewed rules show only in developer mode.
   11. When unsure, leave it out and add it to the "Needs An Expert" list with the exact question to ask.
5. How Morgan Works With You
I am the founder, not an engineer. I make decisions quickly when they are clear.

   * Write to me in plain English. No code, file paths, or technical terms unless I ask. If a technical term is unavoidable, explain it in one short sentence.
   * Keep every plan and report under one page. Use short bullets.
   * Never ask me a technical question I cannot answer. Make the technical choice yourself and tell me what you chose and why in one line.
   * For every decision you need from me, give your recommended answer and the main tradeoff, so I can reply "yes" or pick another option.
   * Ask for no more than three decisions at a time.
   * If you are blocked, keep going on everything that is not blocked and list the blocker in your report.

Plan Format: What I will build. What changes in the existing app. What I am unsure about. Decisions for Morgan (with my recommendation). Roughly how many steps.
6. Ingredient Dictionary
One data file is the single source of truth for ingredients.

Each ingredient has:

   * inci: the official INCI name.
   * synonyms: every other name it appears under (for example "Water," "Aqua," "Eau," "Aqua/Water/Eau"), older names, and common misspellings.
   * ocrVariants: likely photo misreads (for example "Dimethlcone").
   * families: one or more families.
   * commonRoles: what it usually does in formulas (for example active, ph_adjuster, preservative, antioxidant, thickener, solvent, emollient). Used to avoid false alarms.
   * notes: optional plain-English note.

Starting families (add more only with a verified source):

   * retinoid_otc: retinol, retinal (retinaldehyde), retinyl palmitate, retinyl retinoate, hydroxypinacolone retinoate, adapalene (available over the counter in the US at 0.1%).
   * retinoid_rx: tretinoin, tazarotene, trifarotene.
   * aha: glycolic acid, lactic acid, mandelic acid, citric acid, malic acid, tartaric acid. (Lactic and citric acid are often only pH adjusters; see Section 7.)
   * bha: salicylic acid, betaine salicylate, willow bark extract (weak evidence as an exfoliant).
   * pha: gluconolactone, lactobionic acid.
   * benzoyl_peroxide.
   * vitamin_c_laa: ascorbic acid.
   * vitamin_c_derivative: sodium ascorbyl phosphate, magnesium ascorbyl phosphate, ascorbyl glucoside, tetrahexyldecyl ascorbate, 3-O-ethyl ascorbic acid, ascorbyl tetraisopalmitate.
   * niacinamide.
   * copper_peptide: copper tripeptide-1.
   * hydroquinone.
   * azelaic_acid.
   * mineral_uv_filter: zinc oxide, titanium dioxide.
   * chemical_uv_filter: avobenzone, octinoxate, octisalate, homosalate, octocrylene, and others as sourced.
   * silicone: dimethicone, cyclopentasiloxane, cyclohexasiloxane, dimethicone crosspolymer, dimethicone/vinyl dimethicone crosspolymer, phenyl trimethicone, trimethylsiloxysilicate, amodimethicone.
   * gel_thickener: carbomer, acrylates/C10-30 alkyl acrylate crosspolymer, sodium polyacrylate, xanthan gum, hydroxyethylcellulose, sclerotium gum, ammonium acryloyldimethyltaurate/VP copolymer.
   * film_former: PVP, VP/VA copolymer, acrylates copolymer, polyquaternium family, pullulan.
   * humectant: glycerin, hyaluronic acid, sodium hyaluronate, butylene glycol, propanediol.
   * occlusive: petrolatum, mineral oil, lanolin, dimethicone (also silicone).
   * emollient: squalane, shea butter, caprylic/capric triglyceride, and others as sourced.
   * oil: plant oils as listed.
   * physical_exfoliant: jojoba beads, rice powder, walnut shell powder, and similar.
   * fragrance: parfum, fragrance, and listed fragrance allergens (linalool, limonene, geraniol, citronellol, and others as sourced).
   * essential_oil.

Normalization:

   * Ignore case, extra spaces, trailing periods, and asterisks.
   * Split on commas, bullets, and line breaks; handle "and."
   * Treat slashes ("Aqua/Water/Eau") and parentheses ("Water (Aqua)") as one ingredient.
   * Detect "May Contain" or "+/-" sections (colorants) and mark those as possibly present.
   * Strip "nano" and "(nano)"; store any printed percentage.
   * Keep the original order.
   * Record the match rate: the share of the product's ingredients that matched the dictionary.

What ingredient order does and does not tell you:

   * On US and EU cosmetic labels, ingredients above 1% appear from highest to lowest amount. Ingredients at 1% or less can appear in any order.
   * Dewy never knows exact amounts unless printed. Position is a weak hint only. Never present a guess about amount as fact.
7. Products & Confirmed Actives
Extend the existing product records (do not replace them) with:

   * ingredients: ordered, normalized list.
   * ingredientsRaw: exactly what was provided.
   * ingredientSource: label_photo, pasted, open_beauty_facts, brand_official, or none.
   * ingredientSourceLink: when there is one.
   * ingredientsCheckedOn: date.
   * matchRate.
   * activeIngredients: a list of confirmed actives, each with family, percent (if known), and confirmedBy. This is what active rules read.
   * formulaType: best guess of the base (water_based, silicone_based, oil_based, balm, unknown) with the reason. Used only for texture rules.
   * isPrescription, isSunscreen.
   * useSchedule: when the user actually uses it (every morning, every night, specific days, or a number of nights per week). Default: every day in the routine it is in.
   * openedOn and periodAfterOpeningMonths (the "12M" open jar symbol), optional.
   * region: where bought, optional (formulas can differ by country).

How an active is confirmed (any one is enough):

   1. Drug Facts panel: US sunscreens and many acne products are over-the-counter drugs and print "Active Ingredients" with percentages. Read these directly. This is the most reliable data Dewy will get.
   2. The product name or front label states it: for example "10% Glycolic Acid," "Retinol 0.3%," "Vitamin C Serum."
   3. The user confirms it: when an ingredient that is often an active appears in the first half of the list, ask one simple question, for example "Is this an exfoliating product?" Save the answer.

Ingredients that appear only as likely helpers (for example citric acid near the end of the list) do not count as actives.

Safety exception: for the pregnancy rule (SAFE-001), any retinoid anywhere in the list triggers the gentle note, because being cautious costs little there. Mark this as a decision for the expert to confirm.

Data trust levels:

   * Match rate 90% or higher: checkable.
   * 70% to 89%: checkable; notes say "Dewy read most of this label."
   * Below 70%, or no ingredients: not checkable. Show "Dewy can't check this one yet" with a way to add or fix the ingredients.
8. The Rules File
One rules file, separate from the code.

Each rule has:

   * id (for example PILL-001), version, status (draft, ready_for_review, approved, retired).
   * tier: safety, effectiveness, irritation, texture, order, tip.
   * type: pilling, irritation, weakens, timing, order, storage, technique, climate, myth, optimize.
   * when: the exact conditions as data (not free text). Supports: confirmed active families; texture families and their position; same routine; same day; AM or PM; step order; product counts; useSchedule (for weekly frequency); profile flags; weather (humidity, UV index if available).
   * exceptions: conditions that cancel the rule (for example products prescribed together).
   * likelihood: may or often.
   * headline: under 10 words.
   * explanation: under 30 words, plain English.
   * fix: under 30 words, one clear action.
   * alternateFixes: used when the main fix fails the fix test (Section 4, rule 7).
   * sources: each with title, author or organization, year, link, quote, and verified.
   * evidence: A clinical study or regulator, B textbook or expert consensus, C manufacturer guidance, D anecdotal. Evidence D may only be approved as a tip and is labeled as one.
   * reviewedBy, reviewedOn, reviewExpiresOn (12 months later). Expired rules stop showing and return to ready_for_review.
   * changelog.

Approval is recorded only by importing the expert's completed review sheet (Section 15). You never set a rule to approved yourself.
9. Seed Rules (All Start As Draft)
Find and verify a source for each. If you cannot, move it to "Needs An Expert."
Pilling & Texture
   * PILL-001: A product with a gel thickener in its first half, followed by a silicone-heavy product (silicone in the first five ingredients). May pill. Fix: let the first layer dry fully, use less, press the next layer in instead of rubbing.
   * PILL-002: Mineral sunscreen applied over a rich cream or balm. May pill. Fix: wait until the cream absorbs, then press sunscreen on.
   * PILL-003: Three or more products in one routine each with a film former or gel thickener in the first half. May pill. Fix: fewer layers, or wait between them.
   * PILL-004: Water-based product applied after an oil or balm. May bead up and absorb poorly. Fix: water-based products before oils.
Irritation
   * IRR-001: Retinoid plus confirmed AHA or BHA in the same routine. Can irritate. Fix: different nights (requires useSchedule).
   * IRR-002: Retinoid plus benzoyl peroxide in the same routine. Can irritate. Exceptions: products that combine them by design, products the user marks as prescribed together, and adapalene (verify). Prescribed products get "Follow your prescriber's directions."
   * IRR-003: Two or more exfoliating families (confirmed AHA, confirmed BHA, physical exfoliant) in one routine. Can over-exfoliate. Fix: one exfoliant per routine.
   * IRR-004: L-ascorbic acid plus confirmed AHA or BHA in one routine, for users who mark sensitive skin. May sting. Evidence may be weak; flag for expert.
   * IRR-005: Exfoliating actives on more days per week than the expert's limit. The limit is a decision for the expert.
Weakens
   * WEAK-001: Benzoyl peroxide with tretinoin in the same routine. Benzoyl peroxide can break down tretinoin. Do not apply this to adapalene without a verified source. Prescribed combinations follow the prescriber.
   * WEAK-002: Copper peptides with L-ascorbic acid. Often repeated, evidence may be weak. Draft only with a verified source; otherwise "Needs An Expert."
Timing
   * TIME-001: Retinoid in the morning routine. Many retinoids break down in sunlight. Fix: move to night (run the fix test).
   * TIME-002: Vitamin C in the morning under sunscreen is a good fit. A suggestion, never a warning.
   * TIME-003: Uses a confirmed AHA, BHA, or retinoid, and has no sunscreen in the morning routine. Reminder that daily sunscreen matters. (The FDA has recommended a sunburn alert on AHA cosmetics; verify and cite.)
Order
   * ORDER-001: Thinnest to thickest.
   * ORDER-002: Sunscreen is the last skincare step in the morning, before makeup.
   * ORDER-003: Oils after water-based serums; occlusives last at night.
   * ORDER-004: Hyaluronic acid on slightly damp skin, followed by moisturizer.
Safety (Always Outranks Everything)
   * SAFE-001: Pregnant, trying, or breastfeeding setting on, and any retinoid present: "Retinoids are commonly avoided during pregnancy and breastfeeding. Please check with your doctor." Nothing more without expert approval.
   * SAFE-002: Any prescription product: never suggest changing its use. Notes about it end with "Follow your prescriber's directions."
   * SAFE-003: User reports burning, swelling, hives, or blistering: "Stop using the new product and contact a doctor or dermatologist." Do not guess which product caused it.
Storage & Freshness
   * STORE-001: L-ascorbic acid product past its period after opening, or the user says it turned dark orange or brown: likely oxidized and weaker.
   * STORE-002: Any product past its period after opening: gentle reminder.
Climate (Uses Existing Weather)
   * CLIM-001: Low humidity and a hyaluronic acid product with no moisturizer after it: seal it in with a moisturizer. Verify the source and the humidity threshold.
   * CLIM-002: High UV index (if the weather service provides it) and the user uses exfoliating actives or retinoids: sunscreen reminder. Verify.
Technique Tips
   * TIP-001: Pea-size amount of retinol for the whole face, on dry skin.
   * TIP-002: Bring retinol and moisturizer to the ears, neck, and chest, the spots most people skip. Do not claim it prevents sagging.
   * TIP-003: Most people apply much less sunscreen than tested amounts. Give the verified amount guide for face and neck.
   * TIP-004: Start retinoids a few nights a week and build up.
   * TIP-005: Patch test a new active before using it on the whole face.
Myth Busters
   * MYTH-001: Vitamin C and niacinamide can be used together.
   * MYTH-002: Vitamin C and retinol do not "cancel each other out." The reasons to split them are timing and irritation.
10. The Checking Engine
   * Small, pure functions in their own module. Input: routines, products, profile, weather, approved rules. Output: a ranked list of notes. No network needed to check.
   * A "routine" is one AM or PM session on a given day, built from each product's useSchedule. Check every day of a typical week.
   * Check every pair, every group for count rules, step order, weekly frequency, and weather rules.
   * Each note records which rule fired, which products caused it, and the data behind it.
   * Merge duplicates: if several rules point at the same products and the same fix, show one note.
   * Priority: safety, effectiveness, irritation, texture, order, tip. Within a tier, higher evidence first, then the rule that involves more of the user's products.
   * Not-checkable products produce one "can't check yet" note and are excluded from other rules.
   * Run the fix test (Section 4, rule 7) on every fix.
   * Speed: a 40-product cabinet checks in under 50 milliseconds on a phone.
   * Re-run whenever products, routines, schedules, profile, weather, or rules change.
11. The Positive Side: Getting More From What You Own
This is the heart of Dewy. Build it with the same care as the warnings.

   * Optimize My Routine: a gentle suggestion showing the user's routine arranged as a chemist would (order, AM or PM, which nights), with each change explained in one line. The user accepts all, some, or none. Nothing changes without their tap. Every suggested arrangement must pass the full engine with no new notes.
   * Your Secrets: approved tips personalized to the user's products. Example: "Your glycolic essence and your retinol work best apart. Keep the essence in the morning and the retinol at night."
   * Put It To Use: if a product in the cabinet is not in any routine, suggest where it fits, if it passes the engine.
   * Right Amount & Technique: show the approved amount and technique tip inside the step when the user begins their routine.
   * Skin Secrets section: reachable from Home and Profile. Approved tips and myth busters, personalized where possible.
12. Look & Voice
   * Routine screen: at most one note at a time, above the "Begin" button, as a quiet card in Dewy's existing style. No red, no warning icons, no exclamation points. Safety notes use the same calm style with clearer words.
   * Every note has: headline, fix, "Why," "Got It," and "Something Wrong?"
   * "Why": the explanation, the products involved, the evidence in plain words ("Backed by clinical research," "Dermatologist consensus," "Expert tip"), the sources, and who reviewed it and when. Show the reviewer's name only with their written permission; otherwise "Reviewed by a board-certified dermatologist" or "Reviewed by a cosmetic chemist."
   * "Got It" hides that note for 30 days unless the routine changes. Safety notes return each time the routine opens, as one line.
   * "Something Wrong?" offers a few taps (not true for me, wrong product, confusing) and an optional note. Store it for review.
   * Keep the existing lines: "Guidance, not a rule. Not medical advice." and "If skin reacts, stop and see a clinician."
   * Copy: match the existing app. Buttons and labels in Title Case. Short sentences. No em dashes anywhere in app copy. Explain any chemical name.
   * Accessibility: meaning in words, never color alone; screen-reader friendly; respect reduced motion.

Voice examples:

   * Good: "These two may pill. Wait a minute after your serum, then press your moisturizer in."
   * Good: "Your retinol works best at night. Sunlight can weaken it."
   * Bad: "WARNING: Incompatible ingredients detected!"
   * Bad: "This combination causes irritation." (too certain)
   * Bad: "Helps treat acne." (medical claim)
13. Personal Profile & Privacy
Optional "Your Skin" section in Profile. Every field optional and off by default, each with one line explaining why Dewy asks:

   * Skin type: dry, oily, combination, normal, not sure.
   * Sensitive skin: yes, no, not sure.
   * Pregnant, trying, or breastfeeding: one private toggle.
   * Uses prescription skincare: yes or no, and which products.
   * Skin concerns the user chooses to share (for example rosacea, eczema, acne): used only to add "ask your dermatologist" wording, never to diagnose.

Privacy:

   * All profile, schedule, and feedback data stays on the device. Never send it anywhere.
   * Before any feature sends profile, feedback, or health-related data to a server, stop and tell me. Health privacy laws (for example Washington's My Health My Data Act and California privacy law) may apply and a lawyer must review it first.
   * Add "Delete My Skin Profile," which fully clears it.
   * Age: decision for Morgan (recommended: 18 and older until a lawyer advises).
14. Getting Ingredients Into Dewy
   * Paste: parse, then show the list for the user to confirm.
   * Label photo: read the text on the device (for example with Tesseract.js, if the runtime allows). Always show the result to confirm and correct before saving. Look specifically for a Drug Facts "Active Ingredients" panel. Never send photos off the device without my approval.
   * Open Beauty Facts lookup by barcode or name: follow its Open Database License, credit it in the app, record the link, and ask the user to confirm the list matches their label (entries can be outdated).
   * Brand official lists: support later, marked brand_official.
   * Do not scrape INCIDecoder, Skinsort, CosDNA, retailer sites, or any source without an open license.
   * All incoming text is untrusted: pass it through the escape helper and never run it as code.
   * Reformulation check: ingredients checked more than 12 months ago prompt a gentle "re-scan your label."
15. The Expert Review Loop
   * Review sheet export: a spreadsheet file (CSV) with one row per rule: id, version, headline, explanation, fix, when (in plain words), exceptions, evidence, sources with quotes, and blank columns for Decision (Approve, Edit, Reject), Edited Text, Reviewer Name, Credential, Date, Notes.
   * Review sheet import: reads the completed sheet, shows me a plain summary of what will change, and applies it only after I confirm. Approved rules get reviewedBy, reviewedOn, and reviewExpiresOn. Edits create a new version. Everything is logged in the changelog.
   * Before any expert has reviewed anything: the Skin Chemist is invisible in the normal app. Only "can't check yet" style honesty and existing features show. Decision for Morgan (recommended: stay invisible until at least 20 rules are approved, including all safety rules).
   * Developer mode (hidden setting): shows drafts, which rule fired and why, match rates, the test set results, and a "copy debug report" button.
16. Staying Current
   * Design the app to load the approved rules file from a web address I will provide, with a bundled copy as the fallback so Dewy works offline. On open, check for a newer version. Validate it completely; if anything is wrong, keep the last good version. If the current runtime cannot load outside files, tell me and keep the bundled copy for now.
   * New draft rules (from my monthly research scan) are added by hand or script to the rules file as drafts and go through the review sheet like every other rule.
   * After-routine feedback: one optional question, "Anything pill or sting today?" with None, Pilled, Stung, Skip. Stored on the device with the products used. Feedback never changes a rule automatically. It appears in developer mode and in the review export as "user reports" for the expert.
17. Testing & Accuracy Checks
   * Unit tests for normalization: synonyms, slashes, parentheses, "May Contain," OCR variants, case, percentages, Drug Facts panels.
   * For every rule: at least one routine that should trigger it and one close lookalike that should not (for example citric acid as a pH adjuster must not trigger exfoliant rules).
   * Fix test coverage: every fix and alternate fix is proven not to create a new note of equal or higher tier.
   * Golden test set: at least 40 realistic routines using fictional products, each with the expected notes. Export it with the review sheet so the expert confirms the expected answers.
   * Report the accuracy targets from Section 1 in every Phase Report: safety misses, false "all clear," agreement rate, average notes per routine.
   * Prove that draft, unreviewed, and expired rules never show in normal mode.
   * Prove that missing or poorly matched ingredients produce "can't check yet," never silence.
   * Prove that no profile, schedule, or feedback data leaves the device.
   * Prove that all incoming text is escaped.
   * Every change re-runs every test.
18. Phases
One phase at a time. Stop after each for my approval.

   * Phase 1A (Invisible Engine): runtime check and setup, spec and progress files, git, ingredient dictionary, normalization, product fields, confirmed actives, rules file with seed drafts and verified sources, checking engine with fix test, golden test set, all tests, developer mode, review sheet export and import. Nothing new visible in the normal app.
   * Phase 1B (Visible Basics): useSchedule, Routine note with "Why," "Got It," "Something Wrong?," the "can't check yet" state, the two-product answer upgrade, and the corrected honesty statements. All still hidden until rules are approved (Section 15).
   * Phase 2 (Getting More From What You Own): Optimize My Routine, Your Secrets, Put It To Use, amount and technique tips, Skin Secrets section, climate tips.
   * Phase 3 (Your Skin): profile, privacy controls, safety tier behavior.
   * Phase 4 (Ingredient Entry): paste, label photo with Drug Facts reading, Open Beauty Facts, confirm step, reformulation check.
   * Phase 5 (Staying Current): remote rules loading, review expiry, after-routine feedback.

Start with Phase 1A only.
19. Phase Report
Under one page, plain English:

   1. What you built.
   2. What changed in the existing app, and why.
   3. Tests: how many, all passing or not.
   4. Accuracy targets: safety misses, false "all clear," agreement rate (or "awaiting expert"), average notes per routine.
   5. Rules: count by status, and each rule's headline, fix, evidence, and whether its sources are verified.
   6. Needs An Expert: each item with the exact question to ask.
   7. Decisions For Morgan: up to three, each with your recommendation.
   8. Anything that could confuse a user or look off-brand.
   9. What is next.
20. Done Means (Phase 1A)
   * docs/SKIN_CHEMIST_SPEC.md, docs/SKIN_CHEMIST_PROGRESS.md, and the CLAUDE.md pointer exist, and the project is in git with a commit per step.
   * The ingredient dictionary, normalization, product fields, confirmed actives logic, and rules file exist.
   * Every seed rule either has a verified source with a quote or is on the "Needs An Expert" list.
   * The engine passes every test, including the fix test and the lookalike tests.
   * The golden test set exists with at least 40 routines.
   * The review sheet exports and imports correctly (tested with a sample completed sheet).
   * Developer mode shows drafts; the normal app looks and works exactly as before.
   * You have given me the Phase Report.
