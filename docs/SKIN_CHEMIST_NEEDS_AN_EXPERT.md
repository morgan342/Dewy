# Skin Chemist: Needs An Expert

Items the engine cannot decide and Claude must not decide. Each has the exact question to ask a cosmetic chemist or board-certified dermatologist. Updated 2026-09-30 (Phase 1A).

## Rules Without A Verified Source (cannot be marked ready for review)

- **WEAK-002 Copper peptides and pure vitamin C.** No source could be found. Question: Is there evidence that copper tripeptide-1 and L-ascorbic acid weaken each other when layered? If not, should this rule be rejected?
- **TIP-001 Pea-size amount of retinol.** No opened source states a pea-size amount for the whole face (MedlinePlus says "a thin layer"). Question: What amount and application surface do you recommend for over-the-counter retinol, and is "pea-size, on dry skin" accurate?
- **SAFE-003 Stop and contact a doctor.** The FDA safety communication on serious reactions to topical acne products could not be opened on 2026-09-30 (the links returned errors). Question: Please confirm the wording, and provide a source you accept for "burning, swelling, hives, or blistering: stop and contact a doctor."

## Rules With A Source, But A Claim Or Threshold The Source Does Not Cover

- **PILL-001, PILL-002, PILL-003 Pilling mechanisms.** The fixes rest on the Cleveland Clinic layering advice (verified). The mechanisms (gel thickener plus silicone, mineral sunscreen over balm, three film-formers) are unsourced. Question: Do you agree these are common pilling causes, and is the "wait, use less, press" fix right?
- **IRR-002 Adapalene exception.** Epiduo shows adapalene and benzoyl peroxide exist as an approved combination. Question: Should two separate over-the-counter products (adapalene gel plus a benzoyl peroxide wash) still get an irritation note?
- **IRR-004 Pure vitamin C plus acid stinging on sensitive skin.** The source establishes that L-ascorbic acid works at low pH; the stinging claim is unsourced. Question: Is this note warranted, and only for people who mark sensitive skin?
- **IRR-005 Weekly exfoliation limit.** The AAD says "the more aggressive the exfoliation, the less often it needs to be done" but gives no number. Question: What maximum days per week of leave-on AHA or BHA should trigger a note? (Until set, this rule cannot fire.)
- **WEAK-001 Benzoyl peroxide and tretinoin.** MedlinePlus advises against combining without a doctor; it does not state the oxidation mechanism. Question: Is "benzoyl peroxide can break tretinoin down" accurate as written, and does it apply to modern microsphere or encapsulated tretinoin?
- **STORE-001 Oxidized vitamin C.** Instability is sourced; the colour change (dark orange or brown) as a sign is not. Question: Is colour change a reliable sign, and what open period should we assume for L-ascorbic acid when the jar symbol is missing?
- **CLIM-001 Low humidity and hyaluronic acid.** The Harvard source supports sealing with a moisturizer; the "draws water from skin in dry air" mechanism and the humidity threshold are not sourced. Question: Is the mechanism accurate, and below what relative humidity should the note appear? (Until set, this rule cannot fire.)
- **CLIM-002 UV index threshold.** The EPA advises protection from UV index 3 upward and calls 6 to 7 "High". The engine uses 6. Question: Should the note appear from 3, 6, or another value?
- **SAFE-001 Pregnancy exception.** Fires on any retinoid anywhere in the list, including retinyl palmitate near the end. Question: Is that the right level of caution, and is the wording "Retinoids are commonly avoided during pregnancy and breastfeeding. Please check with your doctor." acceptable?
- **MYTH-001 Origin story.** The safety of using niacinamide and vitamin C together is sourced; the "old warning came from hot lab conditions" explanation is not. Question: Is that explanation accurate, or should the note simply say they can be used together?
- **MYTH-002 "Do not cancel out."** The timing advice is sourced. Question: Is "they do not cancel each other out" accurate as a plain statement?
- **TIP-002 Neck and chest.** The source supports a lower strength on the neck and sunscreen on neck and chest. Question: Is "bring retinol and moisturizer to the neck and chest" the right advice for everyone?
- **Evidence D as a tip.** PILL-001 to PILL-003, IRR-004, TIP-001 and WEAK-002 are evidence D. The spec allows evidence D to be approved only as a tip. Question: Should any of these be re-tiered as tips, or rejected?

## Engine Decisions For The Expert

- **Fix test strictness.** The spec blocks a fix that creates a note of the same or higher tier. The engine also blocks any fix that creates a new irritation or safety note, even when the original note ranks higher (for example, moving a morning retinol to the evening next to an acid). Question: Do you agree a fix should never create a new irritation note?
- **Confirmed actives.** An active counts only from a Drug Facts panel, the product name or front label, a printed percentage in the list, or the user's answer. A retinoid or acid that appears only in the list never fires an active rule. Question: Are there cases where list position alone should count?
- **Formula type.** Water in the first three ingredients means water-based; two oils with no water means oil-based; petrolatum or wax first means balm; two silicones or a silicone first means silicone-based. Used only for texture and order rules. Question: Any corrections?

## Decisions For Morgan (not the expert)

- Minimum age (recommended 18 and older until a lawyer advises).
- Stay invisible until at least 20 rules are approved, including all safety rules (recommended).
- Whether the weather source (Open-Meteo) may be switched on. It is built and off.
