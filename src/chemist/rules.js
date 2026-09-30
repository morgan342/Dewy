/* Dewy Skin Chemist: the rules file. Data, not code. Spec Sections 8 and 9.
   Every rule starts as a draft. Nothing here is approved: approval is
   recorded only by importing an expert's completed review sheet.
   Sources were opened on 2026-09-30 and the supporting sentence copied
   into `quote`. A source that could not be opened is verified:false.
   Copy in headline/explanation/fix is calibrated and cosmetic only. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.DewyChemist = root.DewyChemist || {}; root.DewyChemist.rules = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CHECKED = '2026-09-30';
  function src(title, by, year, link, quote, verified) { return { title: title, author: by, year: year, link: link, quote: quote, verified: !!verified, openedOn: verified ? CHECKED : null }; }

  /* sources opened this session */
  var S = {
    fdaAha: src('Alpha Hydroxy Acids', 'U.S. Food and Drug Administration', 2022, 'https://www.fda.gov/cosmetics/cosmetic-ingredients/alpha-hydroxy-acids',
      'Sunburn Alert: This product contains an alpha hydroxy acid (AHA) that may increase your skin\'s sensitivity to the sun and particularly the possibility of sunburn. Use a sunscreen, wear protective clothing, and limit sun exposure while using this product and for a week afterwards.', true),
    fdaAhaSun: src('Alpha Hydroxy Acids', 'U.S. Food and Drug Administration', 2022, 'https://www.fda.gov/cosmetics/cosmetic-ingredients/alpha-hydroxy-acids',
      'If you are using AHAs, it is advisable to use sun protection.', true),
    aadSunscreenAmount: src('How to apply sunscreen', 'American Academy of Dermatology', 2024, 'https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-apply-sunscreen',
      'When applying sunscreen to your face, use at least 1 teaspoon (about the amount needed to cover the length of your index and middle fingers).', true),
    aadSunscreenLittle: src('How to apply sunscreen', 'American Academy of Dermatology', 2024, 'https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-apply-sunscreen',
      'People who get sunburned usually didn\'t reapply, used too little sunscreen, or used an expired sunscreen.', true),
    aadRetinoidNight: src('Retinoid or retinol?', 'American Academy of Dermatology', 2024, 'https://www.aad.org/public/everyday-care/skin-care-secrets/anti-aging/retinoid-retinol',
      'use it only at night and always using sun protection during the day', true),
    aadRetinoidStart: src('Retinoid or retinol?', 'American Academy of Dermatology', 2024, 'https://www.aad.org/public/everyday-care/skin-care-secrets/anti-aging/retinoid-retinol',
      'use the least-intense retinoid formula they can find, and use it every other night to start, slowly building up', true),
    aadExfoliateSensitive: src('How to safely exfoliate at home', 'American Academy of Dermatology', 2024, 'https://www.aad.org/skin-care-secrets/safely-exfoliate-at-home',
      'Some medications and even over-the-counter products may cause your skin to be more sensitive or peel, such as prescription retinoid creams or products containing retinol or benzoyl peroxide.', true),
    aadExfoliateWorsen: src('How to safely exfoliate at home', 'American Academy of Dermatology', 2024, 'https://www.aad.org/skin-care-secrets/safely-exfoliate-at-home',
      'Exfoliating while using these products may worsen dry skin or even cause acne breakouts.', true),
    aadExfoliateOver: src('How to safely exfoliate at home', 'American Academy of Dermatology', 2024, 'https://www.aad.org/skin-care-secrets/safely-exfoliate-at-home',
      'Be careful not to over-exfoliate, as this could lead to skin that is red and irritated.', true),
    aadExfoliateOften: src('How to safely exfoliate at home', 'American Academy of Dermatology', 2024, 'https://www.aad.org/skin-care-secrets/safely-exfoliate-at-home',
      'How often you exfoliate depends on your skin type and exfoliation method. Generally, the more aggressive the exfoliation, the less often it needs to be done.', true),
    aadTest: src('How to test skin care products', 'American Academy of Dermatology', 2024, 'https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products',
      'Apply the product to a test spot twice daily for seven to 10 days.', true),
    aadTestSpot: src('How to test skin care products', 'American Academy of Dermatology', 2024, 'https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products',
      'Choose a quarter-sized spot on your skin where the product won\'t be rubbed or washed away, such as the underside of your arm or the bend of your elbow.', true),
    aadOrder: src('Should I apply my skin care products in a certain order?', 'American Academy of Dermatology', 2024, 'https://www.aad.org/public/everyday-care/skin-care-basics/care/apply-skin-care-certain-order',
      'Apply moisturizer and/or sunscreen. ... Apply makeup, if desired.', true),
    aadDamp: src('Dermatologists\' top tips for relieving dry skin', 'American Academy of Dermatology', 2024, 'https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin',
      'Apply your moisturizer when your skin is still damp after taking a shower or bath', true),
    ccOrder: src('How To Order Your Skin Care Routine', 'Cleveland Clinic (Sean McGregor, DO)', 2025, 'https://health.clevelandclinic.org/proper-skin-care-product-order',
      'Your skin care routine should be ordered from lightest to heaviest (or thinnest to thickest).', true),
    ccOrderSunscreen: src('How To Order Your Skin Care Routine', 'Cleveland Clinic (Sean McGregor, DO)', 2025, 'https://health.clevelandclinic.org/proper-skin-care-product-order',
      'Morning, step 4: Sunscreen', true),
    ccRetinolNight: src('How To Order Your Skin Care Routine', 'Cleveland Clinic (Sean McGregor, DO)', 2025, 'https://health.clevelandclinic.org/proper-skin-care-product-order',
      'At night, use retinols and retinoids instead of a serum. These vitamin A derivatives can become deactivated and cause irritation when exposed to sunlight.', true),
    ccVitCMorning: src('What Can Vitamin C Do for Your Skin?', 'Cleveland Clinic (Melissa Piliang, MD)', 2022, 'https://health.clevelandclinic.org/vitamin-c-serum',
      'Studies show that when you combine vitamin C with sunscreen, you get even better sun protection.', true),
    ccNeck: src('Neck Wrinkles? Here\'s What Can Help', 'Cleveland Clinic (Shilpi Khetarpal, MD)', 2024, 'https://health.clevelandclinic.org/the-best-skin-care-ingredients-for-your-neck',
      'Apply a broad-spectrum sunscreen with SPF 30 or higher to your face, neck, chest and any other exposed skin.', true),
    ccNeckRetinol: src('Neck Wrinkles? Here\'s What Can Help', 'Cleveland Clinic (Shilpi Khetarpal, MD)', 2024, 'https://health.clevelandclinic.org/the-best-skin-care-ingredients-for-your-neck',
      'Start with a lower-strength retinol for a few weeks, applying it as part of your nighttime routine every other day.', true),
    harvardHA: src('Hyaluronic acid for skin: Benefits, how to use it, and side effects', 'Harvard Health (Jennifer Cook; reviewed by Abigail Waldman, MD)', 2026, 'https://www.health.harvard.edu/medications-and-treatments/hyaluronic-acid-for-skin-benefits-how-to-use-it-and-side-effects',
      'Apply the serum to damp skin. Wet or damp skin gives hyaluronic acid the water it needs to pull into your skin from the environment.', true),
    harvardHASeal: src('Hyaluronic acid for skin: Benefits, how to use it, and side effects', 'Harvard Health (Jennifer Cook; reviewed by Abigail Waldman, MD)', 2026, 'https://www.health.harvard.edu/medications-and-treatments/hyaluronic-acid-for-skin-benefits-how-to-use-it-and-side-effects',
      'Follow up immediately with a moisturizer that contains an occlusive ingredient to seal in moisture.', true),
    medlineTret: src('Tretinoin Topical', 'MedlinePlus, U.S. National Library of Medicine', 2025, 'https://medlineplus.gov/druginfo/meds/a682437.html',
      'Do not use any other topical medications, especially benzoyl peroxide, hair removers, salicylic acid (wart remover), and dandruff shampoos containing sulfur or resorcinol unless your doctor directs you to do so.', true),
    medlineTretNight: src('Tretinoin Topical', 'MedlinePlus, U.S. National Library of Medicine', 2025, 'https://medlineplus.gov/druginfo/meds/a682437.html',
      'Use tretinoin daily at bedtime.', true),
    medlineTretSun: src('Tretinoin Topical', 'MedlinePlus, U.S. National Library of Medicine', 2025, 'https://medlineplus.gov/druginfo/meds/a682437.html',
      'plan to avoid unnecessary or prolonged exposure to sunlight or ultraviolet light (tanning beds and sunlamps). Wear protective clothing, sunglasses, and sunscreen, especially over the treated areas.', true),
    medlineTretPreg: src('Tretinoin Topical', 'MedlinePlus, U.S. National Library of Medicine', 2025, 'https://medlineplus.gov/druginfo/meds/a682437.html',
      'tell your doctor if you are pregnant, plan to become pregnant, or are breastfeeding. If you become pregnant while using tretinoin, call your doctor.', true),
    mtbTret: src('Topical Tretinoin', 'MotherToBaby (Organization of Teratology Information Specialists)', 2024, 'https://mothertobaby.org/fact-sheets/tretinoin-retin-a/',
      'It has generally been recommended not to use tretinoin in pregnancy.', true),
    mtbTretBf: src('Topical Tretinoin', 'MotherToBaby (Organization of Teratology Information Specialists)', 2024, 'https://mothertobaby.org/fact-sheets/tretinoin-retin-a/',
      'Be sure to talk to your healthcare provider about all of your breastfeeding questions.', true),
    epiduo: src('Differin Epiduo Acne Gel (adapalene 0.1% and benzoyl peroxide 2.5%) Drug Facts', 'Galderma Laboratories, via DailyMed (U.S. National Library of Medicine)', 2026, 'https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=ae3f8cd9-9046-4b69-b80f-3e9d4468ba7f&type=display',
      'Adapalene 0.1% (retinoid) and Benzoyl Peroxide 2.5%', true),
    epiduoOne: src('Differin Epiduo Acne Gel (adapalene 0.1% and benzoyl peroxide 2.5%) Drug Facts', 'Galderma Laboratories, via DailyMed (U.S. National Library of Medicine)', 2026, 'https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=ae3f8cd9-9046-4b69-b80f-3e9d4468ba7f&type=display',
      'only one topical acne medication at a time', true),
    pmcVitC2017: src('The Roles of Vitamin C in Skin Health', 'Pullar, Carr, Vissers; Nutrients', 2017, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5579659/',
      'A great deal of effort has been put into the development of ascorbic acid derivatives for the purpose of topical application. Such derivatives need to ensure stabilization of the molecule from oxidation.', true),
    pmcVitCTopical: src('Topical Vitamin C and the Skin: Mechanisms of Action and Clinical Applications', 'Al-Niaimi, Chiang; Journal of Clinical and Aesthetic Dermatology', 2017, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5605218/',
      'L-ascorbic acid is a hydrophilic and unstable molecule, hence the poor penetration into the skin.', true),
    pmcVitCPhoto: src('Topical Vitamin C and the Skin: Mechanisms of Action and Clinical Applications', 'Al-Niaimi, Chiang; Journal of Clinical and Aesthetic Dermatology', 2017, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5605218/',
      'Vitamin C has been shown to protect against photoaging, ultraviolet-induced immunosuppression, and photocarcinogenesis.', true),
    pmcNiacVitC: src('The Combination of Niacinamide, Vitamin C, and PDRN Mitigates Melanogenesis by Modulating Nicotinamide Nucleotide Transhydrogenase', 'Park et al.; Molecules', 2022, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9370691/',
      'Since the topical use of vitamin C and nicotinamide has also shown excellent safety, we thought that their combination (NVP-mix) could be used safely as a therapeutic for hyperpigmentation.', true),
    fdaShelf: src('Shelf Life and Expiration Dating of Cosmetics', 'U.S. Food and Drug Administration', 2022, 'https://www.fda.gov/cosmetics/cosmetics-labeling/shelf-life-and-expiration-dating-cosmetics',
      'Over time, cosmetics start to degrade or break down for a number of reasons.', true),
    epaUv: src('UV Index Scale', 'U.S. Environmental Protection Agency', 2024, 'https://www.epa.gov/sunsafety/uv-index-scale-0',
      'Protection needed. Seek shade during late morning through mid-afternoon. When outside, generously apply broad-spectrum SPF-15 or higher sunscreen on exposed skin, and wear protective clothing, a wide-brimmed hat, and sunglasses.', true),
    /* not opened: the link returned an error on 2026-09-30 */
    fdaAcneHyper: src('FDA Drug Safety Communication: FDA warns of rare but serious hypersensitivity reactions with certain over-the-counter topical acne products', 'U.S. Food and Drug Administration', 2014, 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-drug-safety-communication-fda-warns-rare-serious-hypersensitivity-reactions-certain-over-counter',
      '', false),
    acog: src('Skin Conditions During Pregnancy', 'American College of Obstetricians and Gynecologists', 2022, 'https://www.acog.org/womens-health/faqs/skin-conditions-during-pregnancy', '', false)
  };

  /* Tunable numbers the expert must set. null means "not set": a rule that
     needs it does not fire, and the report lists it under Needs An Expert. */
  var PARAMS = {
    maxExfoliantDaysPerWeek: null,     /* IRR-005 */
    lowHumidityPercent: null,          /* CLIM-001 */
    highUvIndex: 6,                    /* CLIM-002: EPA labels 6 to 7 "High"; EPA advises protection from 3 up */
    gotItDays: 30
  };

  function rule(o) {
    o.version = o.version || 1;
    o.status = 'draft';
    o.likelihood = o.likelihood || 'may';
    o.alternateFixes = o.alternateFixes || [];
    o.exceptions = o.exceptions || [];
    o.reviewedBy = null; o.reviewedOn = null; o.reviewExpiresOn = null;
    o.changelog = [{ on: CHECKED, by: 'Claude Code (draft)', note: 'Drafted from the Skin Chemist spec. Awaiting expert review.' }];
    return o;
  }

  var RET = ['retinoid_otc', 'retinoid_rx'];
  var EXF = ['aha', 'bha'];
  var HA = ['Hyaluronic Acid', 'Sodium Hyaluronate'];

  var RULES = [
    /* ---------------- Pilling and texture ---------------- */
    rule({ id: 'PILL-001', tier: 'texture', type: 'pilling', evidence: 'D',
      headline: 'These two may pill', explanation: 'A gel layer followed by a silicone-heavy layer can roll into little bits when rubbed.',
      fix: 'Let the first layer dry fully. Use less. Press the next layer in instead of rubbing.',
      when: { kind: 'adjacent', first: { familyInFirstHalf: 'gel_thickener' }, then: { familyInFirstN: { family: 'silicone', n: 5 } }, sameRoutine: true },
      fixOp: 'wait_and_press', alternateFixes: [{ text: 'Try the silicone product first, then the gel.', op: 'swap_pair' }],
      sources: [S.ccOrder], expertNote: 'No verified source names gel thickener plus silicone as a pilling cause. The fix rests on general layering advice.' }),
    rule({ id: 'PILL-002', tier: 'texture', type: 'pilling', evidence: 'D',
      headline: 'Sunscreen over a rich cream may pill', explanation: 'A mineral sunscreen laid over a rich cream or balm can ball up before it settles.',
      fix: 'Wait until the cream absorbs, then press the sunscreen on.',
      when: { kind: 'adjacent', first: { formulaType: ['balm', 'oil_based'], category: 'SEAL' }, then: { active: ['mineral_uv_filter'] }, sameRoutine: true },
      fixOp: 'wait_and_press', sources: [S.ccOrder], expertNote: 'Mechanism unsourced; the fix rests on general layering advice.' }),
    rule({ id: 'PILL-003', tier: 'texture', type: 'pilling', evidence: 'D',
      headline: 'Several film-forming layers may pill', explanation: 'Three or more products that form a film can build up on the skin and roll.',
      fix: 'Use fewer layers tonight, or wait a minute between them.',
      when: { kind: 'count', where: { familyInFirstHalfAny: ['film_former', 'gel_thickener'] }, min: 3, sameRoutine: true },
      fixOp: 'wait_and_press', sources: [S.ccOrder], expertNote: 'Mechanism unsourced; the fix rests on general layering advice.' }),
    rule({ id: 'PILL-004', tier: 'texture', type: 'pilling', evidence: 'B',
      headline: 'Water-based after oil may not sink in', explanation: 'A watery product on top of an oil or balm can bead up and absorb poorly.',
      fix: 'Put the water-based product on first, then the oil.',
      when: { kind: 'adjacent', first: { formulaType: ['oil_based', 'balm'] }, then: { formulaType: ['water_based'], isSunscreen: false }, sameRoutine: true },
      fixOp: 'reorder_thin_to_thick', sources: [S.ccOrder] }),

    /* ---------------- Irritation ---------------- */
    rule({ id: 'IRR-001', tier: 'irritation', type: 'irritation', evidence: 'B', likelihood: 'often',
      headline: 'Retinoid and exfoliating acid together can irritate', explanation: 'Both can make skin more sensitive. Used in the same routine they may sting or peel.',
      fix: 'Use them on different nights.',
      when: { kind: 'pair', a: { active: RET }, b: { active: EXF }, sameRoutine: true },
      exceptions: [{ prescribedTogether: true }],
      fixOp: 'separate_nights', alternateFixes: [{ text: 'Keep the acid in the morning and the retinoid at night.', op: 'move_b_to_am' }],
      sources: [S.aadExfoliateSensitive, S.aadExfoliateWorsen] }),
    rule({ id: 'IRR-002', tier: 'irritation', type: 'irritation', evidence: 'B', likelihood: 'often',
      headline: 'Retinoid and benzoyl peroxide together can irritate', explanation: 'Each can make skin more sensitive. Together in one routine they may sting or peel.',
      fix: 'Use them at different times of day, or on different nights.',
      when: { kind: 'pair', a: { active: RET, notInci: ['Adapalene'] }, b: { active: ['benzoyl_peroxide'] }, sameRoutine: true, notSameProduct: true },
      exceptions: [{ prescribedTogether: true }, { combinedByDesign: true }, { adapalene: 'Adapalene with benzoyl peroxide exists as an approved combination; the expert decides whether separate products need this note.' }],
      fixOp: 'separate_nights', alternateFixes: [{ text: 'Benzoyl peroxide in the morning, the retinoid at night.', op: 'move_b_to_am' }],
      sources: [S.aadExfoliateSensitive, S.medlineTret, S.epiduo, S.epiduoOne] }),
    rule({ id: 'IRR-003', tier: 'irritation', type: 'irritation', evidence: 'B',
      headline: 'Two exfoliants in one routine can over-exfoliate', explanation: 'Stacking exfoliating acids or a scrub can leave skin red and irritated.',
      fix: 'One exfoliant per routine.',
      when: { kind: 'count', where: { activeAny: ['aha', 'bha'], orFamily: 'physical_exfoliant' }, distinctFamilies: true, min: 2, sameRoutine: true },
      fixOp: 'separate_nights', sources: [S.aadExfoliateOver, S.aadExfoliateOften] }),
    rule({ id: 'IRR-004', tier: 'irritation', type: 'irritation', evidence: 'D',
      headline: 'Pure vitamin C with an acid may sting', explanation: 'On skin you have marked sensitive, pure vitamin C alongside an exfoliating acid may sting.',
      fix: 'Keep the vitamin C in the morning and the acid at night.',
      when: { kind: 'pair', a: { active: ['vitamin_c_laa'] }, b: { active: EXF }, sameRoutine: true, profile: { sensitive: true } },
      fixOp: 'move_b_to_pm', alternateFixes: [{ text: 'Use them on different days.', op: 'separate_nights' }],
      sources: [S.pmcVitCTopical], expertNote: 'The source establishes L-ascorbic acid works at low pH; the stinging claim itself is unsourced.' }),
    rule({ id: 'IRR-005', tier: 'irritation', type: 'irritation', evidence: 'B',
      headline: 'Exfoliating more days than skin may like', explanation: 'Exfoliating acids on too many days a week can leave skin red and irritated.',
      fix: 'Give skin a rest between acid days.',
      when: { kind: 'week', product: { active: EXF }, daysPerWeekOver: 'param:maxExfoliantDaysPerWeek' },
      fixOp: 'reduce_days', sources: [S.aadExfoliateOver, S.aadExfoliateOften], expertNote: 'The weekly limit is the expert\'s decision; until it is set this rule cannot fire.' }),

    /* ---------------- Weakens ---------------- */
    rule({ id: 'WEAK-001', tier: 'effectiveness', type: 'weakens', evidence: 'B',
      headline: 'Benzoyl peroxide may weaken tretinoin', explanation: 'Benzoyl peroxide is an oxidizer and can break tretinoin down when they are applied together.',
      fix: 'Follow your prescriber\'s directions. If they have not said, ask whether to use them at different times.',
      when: { kind: 'pair', a: { inciAny: ['Tretinoin'] }, b: { active: ['benzoyl_peroxide'] }, sameRoutine: true, notSameProduct: true },
      exceptions: [{ prescribedTogether: true }],
      fixOp: 'none', sources: [S.medlineTret], expertNote: 'MedlinePlus advises against combining without a doctor; it does not state the oxidation mechanism. Do not extend to adapalene.' }),
    rule({ id: 'WEAK-002', tier: 'effectiveness', type: 'weakens', evidence: 'D',
      headline: 'Copper peptides and pure vitamin C', explanation: 'A widely repeated claim says they weaken each other. Dewy has no verified source for it.',
      fix: 'Ask your dermatologist how to fit these together.',
      when: { kind: 'pair', a: { active: ['copper_peptide'] }, b: { active: ['vitamin_c_laa'] }, sameRoutine: true },
      fixOp: 'none', sources: [], expertNote: 'No verified source. Stays draft until an expert supplies one or rejects the rule.' }),

    /* ---------------- Timing ---------------- */
    rule({ id: 'TIME-001', tier: 'effectiveness', type: 'timing', evidence: 'B', likelihood: 'often',
      headline: 'Your retinoid works best at night', explanation: 'Many retinoids break down in sunlight and can irritate in daylight.',
      fix: 'Move it to your evening routine.',
      when: { kind: 'session', product: { active: RET }, session: 'am' },
      exceptions: [{ isPrescription: true, note: 'Follow your prescriber\'s directions.' }],
      fixOp: 'move_to_pm', sources: [S.aadRetinoidNight, S.ccRetinolNight, S.medlineTretNight] }),
    rule({ id: 'TIME-002', tier: 'tip', type: 'timing', evidence: 'B',
      headline: 'Vitamin C in the morning is a good fit', explanation: 'Under sunscreen, vitamin C backs up your sun protection.',
      fix: 'Keep it in the morning, before sunscreen.',
      when: { kind: 'session', product: { active: ['vitamin_c_laa', 'vitamin_c_derivative'] }, session: 'am', positive: true },
      fixOp: 'none', sources: [S.ccVitCMorning, S.pmcVitCPhoto] }),
    rule({ id: 'TIME-003', tier: 'effectiveness', type: 'timing', evidence: 'A',
      headline: 'Daily sunscreen matters with these', explanation: 'Exfoliating acids and retinoids can make skin more sensitive to the sun.',
      fix: 'Add a sunscreen as the last step of your morning.',
      when: { kind: 'missing', product: { active: RET.concat(EXF) }, session: 'am', missing: { isSunscreen: true } },
      fixOp: 'none', sources: [S.fdaAha, S.fdaAhaSun, S.medlineTretSun, S.aadRetinoidNight] }),

    /* ---------------- Order ---------------- */
    rule({ id: 'ORDER-001', tier: 'order', type: 'order', evidence: 'B',
      headline: 'Thinnest to thickest', explanation: 'Light, watery layers go on first and richer ones after.',
      fix: 'Move the thinner product before the thicker one.',
      when: { kind: 'order', rule: 'thin_to_thick' },
      fixOp: 'reorder_thin_to_thick', sources: [S.ccOrder] }),
    rule({ id: 'ORDER-002', tier: 'order', type: 'order', evidence: 'B',
      headline: 'Sunscreen goes last in the morning', explanation: 'Sunscreen is the final skincare step, before makeup.',
      fix: 'Move sunscreen to the end of your morning routine.',
      when: { kind: 'order', rule: 'sunscreen_last', session: 'am' },
      fixOp: 'move_sunscreen_last', sources: [S.ccOrderSunscreen, S.aadOrder] }),
    rule({ id: 'ORDER-003', tier: 'order', type: 'order', evidence: 'B',
      headline: 'Oils and balms after water-based steps', explanation: 'Oils and occlusives go over watery serums so the serums can sink in first.',
      fix: 'Move the oil or balm after your serums.',
      when: { kind: 'order', rule: 'oils_after_water' },
      fixOp: 'reorder_thin_to_thick', sources: [S.ccOrder, S.harvardHASeal] }),
    rule({ id: 'ORDER-004', tier: 'tip', type: 'technique', evidence: 'B',
      headline: 'Hyaluronic acid likes damp skin', explanation: 'On slightly damp skin it has water to hold. A moisturizer after seals it in.',
      fix: 'Apply it to damp skin, then follow with your moisturizer.',
      when: { kind: 'missingAfter', product: { inciAny: HA, familyInFirstHalfAny: ['humectant'] }, after: { category: 'SEAL' } },
      fixOp: 'moisturizer_after', sources: [S.harvardHA, S.harvardHASeal, S.aadDamp] }),

    /* ---------------- Safety ---------------- */
    rule({ id: 'SAFE-001', tier: 'safety', type: 'irritation', evidence: 'B',
      headline: 'Retinoids and pregnancy', explanation: 'Retinoids are commonly avoided during pregnancy and breastfeeding. Please check with your doctor.',
      fix: 'Please check with your doctor.',
      when: { kind: 'profile', flag: 'pregnant', product: { familyAnywhereAny: RET } },
      fixOp: 'none', sources: [S.mtbTret, S.mtbTretBf, S.medlineTretPreg, S.acog],
      expertNote: 'Fires on any retinoid anywhere in the list, not only confirmed actives. Expert to confirm this exception.' }),
    rule({ id: 'SAFE-002', tier: 'safety', type: 'irritation', evidence: 'B',
      headline: 'Follow your prescriber\'s directions', explanation: 'Dewy never suggests changing how a prescription product is used.',
      fix: 'Follow your prescriber\'s directions.',
      when: { kind: 'policy', appliesTo: { isPrescription: true } },
      fixOp: 'none', sources: [S.medlineTret] }),
    rule({ id: 'SAFE-003', tier: 'safety', type: 'irritation', evidence: 'B', likelihood: 'often',
      headline: 'Stop and contact a doctor', explanation: 'Burning, swelling, hives, or blistering need a doctor or dermatologist, not a guess about which product caused it.',
      fix: 'Stop using the new product and contact a doctor or dermatologist.',
      when: { kind: 'symptom', any: ['burning', 'swelling', 'hives', 'blistering'] },
      fixOp: 'none', sources: [S.fdaAcneHyper], expertNote: 'The FDA safety communication could not be opened on 2026-09-30 (link errors). Needs a verified source before review.' }),

    /* ---------------- Storage and freshness ---------------- */
    rule({ id: 'STORE-001', tier: 'effectiveness', type: 'storage', evidence: 'A',
      headline: 'Your vitamin C may have weakened', explanation: 'Pure vitamin C is unstable. Past its open period, or once dark orange or brown, it has likely oxidized.',
      fix: 'Consider a fresh bottle, and keep it closed and out of light.',
      when: { kind: 'product', product: { active: ['vitamin_c_laa'] }, any: [{ pastPAO: true }, { oxidizedReported: true }] },
      fixOp: 'none', sources: [S.pmcVitCTopical, S.pmcVitC2017], expertNote: 'The colour-change sign is unsourced; the instability is sourced.' }),
    rule({ id: 'STORE-002', tier: 'tip', type: 'storage', evidence: 'A',
      headline: 'Past its open period', explanation: 'Cosmetics degrade over time once opened.',
      fix: 'Check the texture and smell. Consider replacing it.',
      when: { kind: 'product', product: {}, any: [{ pastPAO: true }] },
      fixOp: 'none', sources: [S.fdaShelf] }),

    /* ---------------- Climate ---------------- */
    rule({ id: 'CLIM-001', tier: 'tip', type: 'climate', evidence: 'B',
      headline: 'Dry air today. Seal your hyaluronic acid in', explanation: 'In dry air a humectant has less water to pull from. A moisturizer over it keeps the water in.',
      fix: 'Follow the hyaluronic acid with a moisturizer.',
      when: { kind: 'weather', humidityBelow: 'param:lowHumidityPercent', product: { inciAny: HA }, notFollowedBy: { category: 'SEAL' } },
      fixOp: 'moisturizer_after', sources: [S.harvardHASeal], expertNote: 'The humidity threshold and the "draws water from skin" mechanism are for the expert to confirm.' }),
    rule({ id: 'CLIM-002', tier: 'tip', type: 'climate', evidence: 'A',
      headline: 'Strong sun today. Sunscreen matters', explanation: 'With exfoliating acids or retinoids in use, sun protection matters more on high UV days.',
      fix: 'Apply sunscreen generously before going out.',
      when: { kind: 'weather', uvIndexAtLeast: 'param:highUvIndex', product: { active: RET.concat(EXF) } },
      fixOp: 'none', sources: [S.epaUv, S.fdaAhaSun] }),

    /* ---------------- Technique tips ---------------- */
    rule({ id: 'TIP-001', tier: 'tip', type: 'technique', evidence: 'D',
      headline: 'A pea-size amount of retinol is enough', explanation: 'A pea-size amount covers the whole face. Apply it to dry skin.',
      fix: 'Pea-size, on dry skin.',
      when: { kind: 'product', product: { active: RET } },
      fixOp: 'none', sources: [], expertNote: 'No opened source states pea-size for the face. MedlinePlus says "a thin layer". Needs an expert.' }),
    rule({ id: 'TIP-002', tier: 'tip', type: 'technique', evidence: 'B',
      headline: 'Bring it to the neck and chest', explanation: 'Most people stop at the jaw. Use a gentler strength on the neck.',
      fix: 'Take retinol and moisturizer down to the neck and chest, gently.',
      when: { kind: 'product', product: { active: RET } },
      fixOp: 'none', sources: [S.ccNeck, S.ccNeckRetinol] }),
    rule({ id: 'TIP-003', tier: 'tip', type: 'technique', evidence: 'B',
      headline: 'Most people use too little sunscreen', explanation: 'For the face, at least a teaspoon. Reapply every two hours outdoors.',
      fix: 'About a teaspoon for the face and neck.',
      when: { kind: 'product', product: { isSunscreen: true } },
      fixOp: 'none', sources: [S.aadSunscreenAmount, S.aadSunscreenLittle] }),
    rule({ id: 'TIP-004', tier: 'tip', type: 'technique', evidence: 'B',
      headline: 'Start retinoids slowly', explanation: 'Every other night to start, then build up as skin allows.',
      fix: 'A few nights a week at first.',
      when: { kind: 'product', product: { active: ['retinoid_otc'] } },
      fixOp: 'none', sources: [S.aadRetinoidStart, S.ccNeckRetinol] }),
    rule({ id: 'TIP-005', tier: 'tip', type: 'technique', evidence: 'B',
      headline: 'Patch test a new active first', explanation: 'A small spot twice a day for a week or so shows how your skin takes it.',
      fix: 'Test a quarter-size spot on your inner arm for seven to ten days.',
      when: { kind: 'product', product: { activeAny: ['retinoid_otc', 'aha', 'bha', 'benzoyl_peroxide', 'vitamin_c_laa'], newWithinDays: 14 } },
      fixOp: 'none', sources: [S.aadTest, S.aadTestSpot] }),

    /* ---------------- Myth busters (positive) ---------------- */
    rule({ id: 'MYTH-001', tier: 'tip', type: 'myth', evidence: 'A',
      headline: 'Vitamin C and niacinamide can go together', explanation: 'The old warning came from unstable, hot lab conditions. Together on skin they have shown good safety.',
      fix: 'Nothing to change.',
      when: { kind: 'pair', a: { active: ['vitamin_c_laa', 'vitamin_c_derivative'] }, b: { active: ['niacinamide'] }, sameRoutine: true, positive: true },
      fixOp: 'none', sources: [S.pmcNiacVitC], expertNote: 'The "hot lab conditions" origin story is unsourced; the safety of the combination is sourced.' }),
    rule({ id: 'MYTH-002', tier: 'tip', type: 'myth', evidence: 'B',
      headline: 'Vitamin C and retinol do not cancel out', explanation: 'The reason to split them is timing and irritation, not a chemical clash. Vitamin C in the morning, retinol at night.',
      fix: 'Vitamin C in the morning, retinol at night.',
      when: { kind: 'pair', a: { active: ['vitamin_c_laa', 'vitamin_c_derivative'] }, b: { active: RET }, sameDay: true, positive: true },
      fixOp: 'none', sources: [S.ccRetinolNight, S.ccVitCMorning], expertNote: 'The "do not cancel out" wording is the expert\'s to confirm.' })
  ];

  var TIER_RANK = { safety: 0, effectiveness: 1, irritation: 2, texture: 3, order: 4, tip: 5 };
  var EVIDENCE_RANK = { A: 0, B: 1, C: 2, D: 3 };

  /* Validate a rules file (bundled or downloaded). Returns [] when clean. */
  function validate(rules) {
    var errs = [];
    if (!Array.isArray(rules)) return ['Rules must be a list.'];
    var ids = {};
    rules.forEach(function (r, k) {
      var where = 'Rule ' + (r && r.id ? r.id : '#' + k) + ': ';
      if (!r || typeof r !== 'object') { errs.push(where + 'not an object'); return; }
      if (!/^[A-Z]+-\d{3}$/.test(r.id || '')) errs.push(where + 'bad id');
      if (ids[r.id]) errs.push(where + 'duplicate id'); ids[r.id] = 1;
      if (['draft', 'ready_for_review', 'approved', 'retired'].indexOf(r.status) < 0) errs.push(where + 'bad status');
      if (!(r.tier in TIER_RANK)) errs.push(where + 'bad tier');
      if (!(r.evidence in EVIDENCE_RANK)) errs.push(where + 'bad evidence');
      if (!r.when || !r.when.kind) errs.push(where + 'missing when');
      if (!r.headline || r.headline.split(/\s+/).length > 10) errs.push(where + 'headline missing or over 10 words');
      if (!r.explanation || r.explanation.split(/\s+/).length > 30) errs.push(where + 'explanation missing or over 30 words');
      if (!r.fix || r.fix.split(/\s+/).length > 30) errs.push(where + 'fix missing or over 30 words');
      if (!Array.isArray(r.sources)) errs.push(where + 'sources missing');
      if (r.status === 'approved' && (!r.reviewedBy || !r.reviewedOn || !r.reviewExpiresOn)) errs.push(where + 'approved without reviewer or dates');
      if (r.status === 'approved' && r.evidence === 'D' && r.tier !== 'tip') errs.push(where + 'evidence D may only be approved as a tip');
      if (r.status === 'ready_for_review' && !(r.sources || []).some(function (s) { return s.verified; })) errs.push(where + 'ready for review without a verified source');
    });
    return errs;
  }

  return { rules: RULES, params: PARAMS, sources: S, validate: validate, TIER_RANK: TIER_RANK, EVIDENCE_RANK: EVIDENCE_RANK, checkedOn: CHECKED };
}));
