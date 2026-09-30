/* Dewy Skin Chemist: the golden test set. Spec Section 17.
   Every product here is fictional ("Test ... A"). Ingredient lists are
   invented for testing and describe no real product. Expected notes are the
   engine author's expectation and await the expert's confirmation. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.DewyChemist = root.DewyChemist || {}; root.DewyChemist.golden = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function P(id, name, category, ingredientsRaw, extra) {
    var o = { id: id, brand: 'Test', productName: name, category: category, ingredientsRaw: ingredientsRaw, ingredientSource: ingredientsRaw ? 'pasted' : 'none' };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }

  var PRODUCTS = {
    gelA: P('gelA', 'Gel Serum A', 'TREAT', 'Water, Glycerin, Carbomer, Panthenol, Sodium Hyaluronate, Phenoxyethanol, Sodium Hydroxide'),
    siliconeB: P('siliconeB', 'Silicone Primer B', 'FINISH', 'Dimethicone, Cyclopentasiloxane, Dimethicone Crosspolymer, Water, Tocopheryl Acetate'),
    retinolC: P('retinolC', 'Retinol 0.5% Night Serum C', 'TREAT', 'Water, Glycerin, Squalane, Retinol, Cetearyl Alcohol, Carbomer, Phenoxyethanol'),
    glycolicD: P('glycolicD', '10% Glycolic Acid Toner D', 'TREAT', 'Water, Glycolic Acid, Glycerin, Butylene Glycol, Sodium Hydroxide, Phenoxyethanol'),
    salicylicE: P('salicylicE', '2% Salicylic Acid Cleanser E', 'CLEANSE', 'Water, Cocamidopropyl Betaine, Salicylic Acid, Glycerin, Sodium Chloride, Phenoxyethanol'),
    bpoF: P('bpoF', 'Benzoyl Peroxide 5% Wash F', 'CLEANSE', 'Active ingredient: Benzoyl Peroxide 5% Acne medication. Inactive ingredients: Water, Glycerin, Carbomer, Sodium Hydroxide'),
    vitcG: P('vitcG', 'Vitamin C 15% Serum G', 'TREAT', 'Water, Ascorbic Acid, Propanediol, Glycerin, Ferulic Acid, Tocopherol, Phenoxyethanol'),
    niacinH: P('niacinH', 'Niacinamide 10% Serum H', 'TREAT', 'Water, Niacinamide, Zinc PCA, Glycerin, Carbomer, Phenoxyethanol'),
    sunI: P('sunI', 'Mineral Sunscreen SPF 40 I', 'PROTECT', 'Drug Facts. Active ingredients: Zinc Oxide 18% Sunscreen. Inactive ingredients: Water, Caprylic/Capric Triglyceride, Glycerin, Cetearyl Alcohol, Dimethicone, Phenoxyethanol'),
    balmJ: P('balmJ', 'Rich Balm J', 'SEAL', 'Petrolatum, Beeswax, Lanolin, Squalane, Tocopherol'),
    oilK: P('oilK', 'Face Oil K', 'FINISH', 'Squalane, Jojoba Oil, Rosehip Oil, Tocopherol'),
    haL: P('haL', 'Hyaluronic Serum L', 'TREAT', 'Water, Sodium Hyaluronate, Glycerin, Panthenol, Phenoxyethanol'),
    moistM: P('moistM', 'Daily Moisturizer M', 'SEAL', 'Water, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Glyceryl Stearate, Phenoxyethanol'),
    tretN: P('tretN', 'Tretinoin 0.025% Cream N', 'TREAT', 'Tretinoin 0.025%, Water, Stearic Acid, Isopropyl Myristate, Glycerin', { isPrescription: true }),
    copperO: P('copperO', 'Copper Peptide Serum O', 'TREAT', 'Water, Glycerin, Copper Tripeptide-1, Sodium Hyaluronate, Phenoxyethanol'),
    scrubP: P('scrubP', 'Polishing Scrub P', 'CLEANSE', 'Water, Juglans Regia Shell Powder, Glycerin, Cocamidopropyl Betaine, Xanthan Gum, Phenoxyethanol'),
    mysteryQ: P('mysteryQ', 'Mystery Cream Q', 'SEAL', ''),
    partialR: P('partialR', 'Partial Cream R', 'SEAL', 'Water, Glycerin, Cetearyl Alcohol, Squalane, Fictionium Root Extract, Phenoxyethanol, Made-Up Polymer 12, Tocopherol, Panthenol, Unlisted Blossom Water'),
    citricS: P('citricS', 'Soothing Toner S', 'TREAT', 'Water, Glycerin, Panthenol, Allantoin, Phenoxyethanol, Citric Acid'),
    adapaleneT: P('adapaleneT', 'Adapalene 0.1% Gel T', 'TREAT', 'Adapalene 0.1%, Water, Carbomer, Propylene Glycol, Phenoxyethanol'),
    filmU: P('filmU', 'Setting Essence U', 'FINISH', 'Water, PVP, Glycerin, Acrylates Copolymer, Phenoxyethanol'),
    chemSunV: P('chemSunV', 'Daily Sunscreen SPF 30 V', 'PROTECT', 'Active ingredients: Avobenzone 3%, Octisalate 5%, Octocrylene 7%. Inactive ingredients: Water, Glycerin, Cetearyl Alcohol, Phenoxyethanol'),
    retinylW: P('retinylW', 'Soft Night Cream W', 'SEAL', 'Water, Glycerin, Cetearyl Alcohol, Squalane, Phenoxyethanol, Retinyl Palmitate'),
    sapX: P('sapX', 'Vitamin C Cream X', 'SEAL', 'Water, Glycerin, Sodium Ascorbyl Phosphate, Cetearyl Alcohol, Phenoxyethanol'),
    gelA2: P('gelA2', 'Gel Essence A2', 'TREAT', 'Water, Xanthan Gum, Glycerin, Betaine, Phenoxyethanol'),
    lacticY: P('lacticY', 'Lactic Acid 5% Serum Y', 'TREAT', 'Water, Lactic Acid, Glycerin, Sodium Hyaluronate, Sodium Hydroxide, Phenoxyethanol'),
    oldVitcZ: P('oldVitcZ', 'Vitamin C 20% Serum Z', 'TREAT', 'Water, Ascorbic Acid, Propanediol, Glycerin, Phenoxyethanol', { openedOn: '2025-01-01', periodAfterOpeningMonths: 6 }),
    oldCreamZ2: P('oldCreamZ2', 'Comfort Cream Z2', 'SEAL', 'Water, Glycerin, Cetearyl Alcohol, Squalane, Phenoxyethanol', { openedOn: '2025-01-01', periodAfterOpeningMonths: 12 })
  };

  function pick(ids) { return ids.map(function (id) { return PRODUCTS[id]; }); }

  /* Each case: id, title, products, routines, profile, weather, today,
     expect (warning notes that must appear, by rule id),
     expectNot (rule ids that must not appear),
     expectTips (tip or positive notes that must appear),
     expectCantCheck (product ids). Warnings are notes with tier other than tip and not positive. */
  var CASES = [
    { id: 'G01', title: 'Gel serum then silicone primer', products: pick(['gelA', 'siliconeB']), routines: { am: ['gelA', 'siliconeB'], pm: [] }, expect: ['PILL-001'], expectNot: ['IRR-001', 'TIME-001'] },
    { id: 'G02', title: 'Silicone first, then gel: no pill note, but the order note', products: pick(['gelA', 'siliconeB']), routines: { am: ['siliconeB', 'gelA'], pm: [] }, expect: ['ORDER-001'], expectNot: ['PILL-001'] },
    { id: 'G03', title: 'Retinol and glycolic same night', products: pick(['retinolC', 'glycolicD', 'moistM']), routines: { am: [], pm: ['glycolicD', 'retinolC', 'moistM'] }, expect: ['IRR-001', 'TIME-003'], expectNot: ['TIME-001'], expectTips: ['TIP-002', 'TIP-004'] },
    { id: 'G04', title: 'Retinol and glycolic on different nights', products: pick(['retinolC', 'glycolicD', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['glycolicD', 'retinolC', 'moistM'] }, schedules: { retinolC: { days: ['mon', 'wed', 'fri'] }, glycolicD: { days: ['tue', 'thu', 'sat'] } }, expect: [], expectNot: ['IRR-001', 'TIME-003'] },
    { id: 'G05', title: 'Retinol in the morning', products: pick(['retinolC', 'moistM', 'sunI']), routines: { am: ['retinolC', 'moistM', 'sunI'], pm: [] }, expect: ['TIME-001'], expectNot: ['TIME-003', 'ORDER-002'] },
    { id: 'G06', title: 'Prescription tretinoin in the morning: no move suggestion', products: pick(['tretN', 'moistM', 'sunI']), routines: { am: ['tretN', 'moistM', 'sunI'], pm: [] }, expect: [], expectNot: ['TIME-001'] },
    { id: 'G07', title: 'Tretinoin plus benzoyl peroxide wash', products: pick(['tretN', 'bpoF', 'moistM', 'sunI']), routines: { am: ['bpoF', 'moistM', 'sunI'], pm: ['bpoF', 'tretN', 'moistM'] }, expect: ['WEAK-001', 'IRR-002'], expectNot: [] },
    { id: 'G08', title: 'Adapalene plus benzoyl peroxide: exception', products: pick(['adapaleneT', 'bpoF', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['bpoF', 'adapaleneT', 'moistM'] }, expect: [], expectNot: ['IRR-002', 'WEAK-001'] },
    { id: 'G09', title: 'Two acids in one routine', products: pick(['glycolicD', 'salicylicE', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['salicylicE', 'glycolicD', 'moistM'] }, expect: ['IRR-003'], expectNot: [] },
    { id: 'G10', title: 'Acid plus scrub in one routine', products: pick(['scrubP', 'glycolicD', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['scrubP', 'glycolicD', 'moistM'] }, expect: ['IRR-003'], expectNot: [] },
    { id: 'G11', title: 'Citric acid at the end is not an exfoliant', products: pick(['citricS', 'glycolicD', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['citricS', 'glycolicD', 'moistM'] }, expect: [], expectNot: ['IRR-003'] },
    { id: 'G12', title: 'Pure vitamin C with acid, sensitive skin', products: pick(['vitcG', 'glycolicD', 'moistM', 'sunI']), routines: { am: ['vitcG', 'glycolicD', 'moistM', 'sunI'], pm: [] }, profile: { sensitive: true }, expect: ['IRR-004'], expectNot: [] },
    { id: 'G13', title: 'Pure vitamin C with acid, not sensitive', products: pick(['vitcG', 'glycolicD', 'moistM', 'sunI']), routines: { am: ['vitcG', 'glycolicD', 'moistM', 'sunI'], pm: [] }, profile: { sensitive: false }, expect: [], expectNot: ['IRR-004'] },
    { id: 'G14', title: 'Copper peptides with pure vitamin C', products: pick(['copperO', 'vitcG', 'moistM', 'sunI']), routines: { am: ['vitcG', 'copperO', 'moistM', 'sunI'], pm: [] }, expect: ['WEAK-002'], expectNot: [] },
    { id: 'G15', title: 'Vitamin C in the morning: positive', products: pick(['vitcG', 'moistM', 'sunI']), routines: { am: ['vitcG', 'moistM', 'sunI'], pm: [] }, expect: [], expectTips: ['TIME-002'], expectNot: ['IRR-004'] },
    { id: 'G16', title: 'Acid user with no morning sunscreen', products: pick(['glycolicD', 'moistM']), routines: { am: ['moistM'], pm: ['glycolicD', 'moistM'] }, expect: ['TIME-003'], expectNot: [] },
    { id: 'G17', title: 'Acid user with morning sunscreen', products: pick(['glycolicD', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['glycolicD', 'moistM'] }, expect: [], expectNot: ['TIME-003'] },
    { id: 'G18', title: 'Sunscreen before moisturizer', products: pick(['sunI', 'moistM']), routines: { am: ['sunI', 'moistM'], pm: [] }, expect: ['ORDER-002'], expectNot: [] },
    { id: 'G19', title: 'Sunscreen last, primer after is fine', products: pick(['moistM', 'sunI', 'siliconeB']), routines: { am: ['moistM', 'sunI', 'siliconeB'], pm: [] }, expect: [], expectNot: ['ORDER-002'] },
    { id: 'G20', title: 'Oil before a water-based serum', products: pick(['oilK', 'haL', 'moistM']), routines: { am: [], pm: ['oilK', 'haL', 'moistM'] }, expect: ['PILL-004'], expectNot: [] },
    { id: 'G21', title: 'Water-based serum then oil', products: pick(['haL', 'moistM', 'oilK']), routines: { am: [], pm: ['haL', 'moistM', 'oilK'] }, expect: [], expectNot: ['PILL-004', 'ORDER-001', 'ORDER-003', 'ORDER-004'] },
    { id: 'G22', title: 'Hyaluronic acid with nothing after it', products: pick(['haL']), routines: { am: [], pm: ['haL'] }, expect: [], expectTips: ['ORDER-004'], expectNot: [] },
    { id: 'G23', title: 'Hyaluronic acid followed by moisturizer', products: pick(['haL', 'moistM']), routines: { am: [], pm: ['haL', 'moistM'] }, expect: [], expectNot: ['ORDER-004'] },
    { id: 'G24', title: 'Pregnant with retinol in the routine', products: pick(['retinolC', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['retinolC', 'moistM'] }, profile: { pregnant: true }, expect: ['SAFE-001'], expectNot: [] },
    { id: 'G25', title: 'Pregnant, retinyl palmitate near the end of a cream', products: pick(['retinylW', 'sunI']), routines: { am: ['sunI'], pm: ['retinylW'] }, profile: { pregnant: true }, expect: ['SAFE-001'], expectNot: ['TIME-001'] },
    { id: 'G26', title: 'Not pregnant, retinyl palmitate near the end: no note', products: pick(['retinylW', 'sunI']), routines: { am: ['retinylW', 'sunI'], pm: ['retinylW'] }, profile: {}, expect: [], expectNot: ['SAFE-001', 'TIME-001'] },
    { id: 'G27', title: 'Reported burning and swelling', products: pick(['moistM']), routines: { am: ['moistM'], pm: ['moistM'] }, profile: { reportedSymptoms: ['burning', 'swelling'] }, expect: ['SAFE-003'], expectNot: [] },
    { id: 'G28', title: 'Vitamin C past its open period', products: pick(['oldVitcZ', 'moistM', 'sunI']), routines: { am: ['oldVitcZ', 'moistM', 'sunI'], pm: [] }, today: '2026-09-30', expect: ['STORE-001'], expectTips: ['STORE-002'], expectNot: [] },
    { id: 'G29', title: 'Cream past its open period', products: pick(['oldCreamZ2']), routines: { am: ['oldCreamZ2'], pm: ['oldCreamZ2'] }, today: '2026-09-30', expect: [], expectTips: ['STORE-002'], expectNot: ['STORE-001'] },
    { id: 'G30', title: 'High UV day with acids', products: pick(['glycolicD', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['glycolicD', 'moistM'] }, weather: { humidity: 50, uvIndex: 8 }, expect: [], expectTips: ['CLIM-002'], expectNot: [] },
    { id: 'G31', title: 'Low UV day with acids', products: pick(['glycolicD', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['glycolicD', 'moistM'] }, weather: { humidity: 50, uvIndex: 2 }, expect: [], expectNot: ['CLIM-002'] },
    { id: 'G32', title: 'Dry air: threshold not set, so no note', products: pick(['haL']), routines: { am: ['haL'], pm: [] }, weather: { humidity: 15 }, expect: [], expectNot: ['CLIM-001'] },
    { id: 'G33', title: 'A product with no ingredients cannot be checked', products: pick(['mysteryQ', 'retinolC']), routines: { am: [], pm: ['retinolC', 'mysteryQ'] }, expect: ['TIME-003'], expectNot: [], expectCantCheck: ['mysteryQ'] },
    { id: 'G34', title: 'A partly read label is checkable and says so', products: pick(['partialR', 'glycolicD']), routines: { am: [], pm: ['glycolicD', 'partialR'] }, expect: ['TIME-003'], expectNot: [], expectCantCheck: [] },
    { id: 'G35', title: 'Three film-forming layers', products: pick(['gelA', 'gelA2', 'filmU']), routines: { am: ['gelA', 'gelA2', 'filmU'], pm: [] }, expect: ['PILL-003'], expectNot: [] },
    { id: 'G36', title: 'Two film-forming layers only', products: pick(['gelA', 'filmU']), routines: { am: ['gelA', 'filmU'], pm: [] }, expect: [], expectNot: ['PILL-003'] },
    { id: 'G37', title: 'Mineral sunscreen over a balm', products: pick(['balmJ', 'sunI']), routines: { am: ['balmJ', 'sunI'], pm: [] }, expect: ['PILL-002'], expectNot: ['ORDER-002'] },
    { id: 'G38', title: 'Vitamin C and niacinamide together: positive', products: pick(['vitcG', 'niacinH', 'moistM', 'sunI']), routines: { am: ['vitcG', 'niacinH', 'moistM', 'sunI'], pm: [] }, expect: [], expectTips: ['MYTH-001'], expectNot: [] },
    { id: 'G39', title: 'Vitamin C morning, retinol night: positive', products: pick(['vitcG', 'retinolC', 'moistM', 'sunI']), routines: { am: ['vitcG', 'moistM', 'sunI'], pm: ['retinolC', 'moistM'] }, expect: [], expectTips: ['MYTH-002', 'TIME-002'], expectNot: ['IRR-001', 'TIME-001'] },
    { id: 'G40', title: 'A calm, complete routine', products: pick(['haL', 'moistM', 'sunI', 'niacinH']), routines: { am: ['niacinH', 'moistM', 'sunI'], pm: ['haL', 'moistM'] }, expect: [], expectNot: ['ORDER-002', 'ORDER-004', 'TIME-003'] },
    { id: 'G41', title: 'Vitamin C derivative with acid, sensitive skin: no sting note', products: pick(['sapX', 'glycolicD', 'sunI']), routines: { am: ['glycolicD', 'sapX', 'sunI'], pm: [] }, profile: { sensitive: true }, expect: [], expectNot: ['IRR-004'] },
    { id: 'G42', title: 'Lactic acid named on the front counts as an acid', products: pick(['lacticY', 'retinolC', 'moistM', 'sunI']), routines: { am: ['moistM', 'sunI'], pm: ['lacticY', 'retinolC', 'moistM'] }, expect: ['IRR-001'], expectNot: [] }
  ];

  /* Apply per-case schedules to copies of the products. */
  function materialize(c) {
    var prods = c.products.map(function (p) { var o = {}; for (var k in p) o[k] = p[k]; if (c.schedules && c.schedules[p.id]) o.useSchedule = c.schedules[p.id]; return o; });
    return { products: prods, routines: c.routines, profile: c.profile || {}, weather: c.weather || null, today: c.today || '2026-09-30' };
  }

  return { products: PRODUCTS, cases: CASES, materialize: materialize };
}));
