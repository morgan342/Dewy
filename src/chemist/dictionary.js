/* Dewy Skin Chemist: ingredient dictionary.
   The single source of truth for ingredient names, families, and usual roles.
   Nothing here is a claim about any real product. Families follow the spec
   (docs/SKIN_CHEMIST_SPEC.md, Section 6). Add a family only with a verified
   source recorded in the rules file. Plain CommonJS so Node tests and the
   browser bundle read the same file. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.DewyChemist = root.DewyChemist || {}; root.DewyChemist.dictionary = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* i(inci, families, roles, synonyms, ocrVariants, notes) */
  function i(inci, families, roles, synonyms, ocr, notes) {
    return { inci: inci, families: families || [], commonRoles: roles || [], synonyms: synonyms || [], ocrVariants: ocr || [], notes: notes || '' };
  }

  var ENTRIES = [
    /* base and solvents */
    i('Water', ['solvent'], ['solvent'], ['Aqua', 'Eau', 'Aqua/Water/Eau', 'Water/Aqua/Eau', 'Aqua (Water)', 'Water (Aqua)', 'Purified Water', 'Deionized Water'], ['Aqva', 'Woter']),
    i('Alcohol Denat.', ['solvent'], ['solvent'], ['Alcohol Denat', 'Denatured Alcohol', 'SD Alcohol 40', 'SD Alcohol 40-B', 'Alcohol'], ['Alcohol Denet']),
    i('Butylene Glycol', ['humectant'], ['humectant', 'solvent'], ['1,3-Butylene Glycol', 'Butanediol'], ['Butylene Glyco']),
    i('Propanediol', ['humectant'], ['humectant', 'solvent'], ['1,3-Propanediol', 'Propane-1,3-diol'], []),
    i('Propylene Glycol', ['humectant'], ['humectant', 'solvent'], ['1,2-Propanediol'], ['Propylene Glyco']),
    i('Glycerin', ['humectant'], ['humectant'], ['Glycerol', 'Glycerine', 'Vegetable Glycerin'], ['Glycerln', 'Giycerin']),
    i('Pentylene Glycol', ['humectant'], ['humectant', 'solvent', 'preservative'], [], []),
    i('Hyaluronic Acid', ['humectant'], ['humectant'], ['Hyaluronan'], ['Hyaluronlc Acid']),
    i('Sodium Hyaluronate', ['humectant'], ['humectant'], ['Hyaluronic Acid Sodium Salt', 'Sodium Hyaluronate Crosspolymer', 'Hydrolyzed Hyaluronic Acid', 'Hydrolyzed Sodium Hyaluronate', 'Sodium Acetylated Hyaluronate'], ['Sodium Hyaluronat', 'Sodlum Hyaluronate']),
    i('Panthenol', ['humectant'], ['humectant', 'skin_conditioning'], ['D-Panthenol', 'Pro-Vitamin B5', 'Provitamin B5', 'Dexpanthenol'], []),
    i('Urea', ['humectant'], ['humectant'], [], []),
    i('Betaine', ['humectant'], ['humectant'], ['Trimethylglycine'], []),
    i('Allantoin', [], ['skin_conditioning'], [], ['Allantoln']),
    i('Sodium PCA', ['humectant'], ['humectant'], ['Sodium Pyrrolidone Carboxylate'], []),
    i('Trehalose', ['humectant'], ['humectant'], [], []),

    /* retinoids */
    i('Retinol', ['retinoid_otc'], ['active'], ['Vitamin A', 'Retinol (Vitamin A)'], ['Retlnol', 'Retino1'], 'Over-the-counter retinoid. Strength is rarely printed.'),
    i('Retinal', ['retinoid_otc'], ['active'], ['Retinaldehyde', 'Retinaldehyde (Retinal)'], ['Retlnal']),
    i('Retinyl Palmitate', ['retinoid_otc'], ['active', 'antioxidant'], ['Vitamin A Palmitate', 'Retinyl Palmitate (Vitamin A)'], ['Retinyl Palmltate'], 'Often present in tiny amounts. Not a confirmed active by name alone.'),
    i('Retinyl Retinoate', ['retinoid_otc'], ['active'], [], []),
    i('Hydroxypinacolone Retinoate', ['retinoid_otc'], ['active'], ['HPR', 'Granactive Retinoid'], []),
    i('Adapalene', ['retinoid_otc'], ['active'], [], ['Adapaiene'], 'Available over the counter in the US at 0.1%.'),
    i('Tretinoin', ['retinoid_rx'], ['active'], ['Retinoic Acid', 'All-Trans Retinoic Acid'], ['Tretlnoin']),
    i('Tazarotene', ['retinoid_rx'], ['active'], [], []),
    i('Trifarotene', ['retinoid_rx'], ['active'], [], []),

    /* alpha hydroxy acids */
    i('Glycolic Acid', ['aha'], ['active', 'ph_adjuster'], ['Hydroxyacetic Acid'], ['Glycollc Acid', 'Giycolic Acid']),
    i('Lactic Acid', ['aha'], ['active', 'ph_adjuster', 'humectant'], ['L-Lactic Acid'], ['Lactlc Acid'], 'Often only a pH adjuster or humectant.'),
    i('Mandelic Acid', ['aha'], ['active'], [], ['Mandellc Acid']),
    i('Citric Acid', ['aha'], ['ph_adjuster', 'chelating'], [], ['Cltric Acid'], 'Almost always a pH adjuster. Never an active by name alone.'),
    i('Malic Acid', ['aha'], ['ph_adjuster', 'active'], [], []),
    i('Tartaric Acid', ['aha'], ['ph_adjuster', 'active'], [], []),
    /* beta hydroxy acids */
    i('Salicylic Acid', ['bha'], ['active', 'preservative'], ['2-Hydroxybenzoic Acid'], ['Sallcylic Acid', 'Salicyclic Acid'], 'Can be a small helper ingredient. Confirm before treating as an active.'),
    i('Betaine Salicylate', ['bha'], ['active'], [], []),
    i('Salix Alba Bark Extract', ['bha'], ['skin_conditioning'], ['Willow Bark Extract', 'Salix Alba (Willow) Bark Extract', 'White Willow Bark Extract'], [], 'Weak evidence as an exfoliant.'),
    /* poly hydroxy acids */
    i('Gluconolactone', ['pha'], ['active', 'humectant'], [], []),
    i('Lactobionic Acid', ['pha'], ['active', 'humectant'], [], []),

    i('Benzoyl Peroxide', ['benzoyl_peroxide'], ['active'], [], ['Benzoyl Peroxlde', 'Benzoyi Peroxide']),

    /* vitamin C */
    i('Ascorbic Acid', ['vitamin_c_laa'], ['active', 'antioxidant', 'ph_adjuster'], ['L-Ascorbic Acid', 'Vitamin C', 'Ascorbic Acid (Vitamin C)'], ['Ascorblc Acid', 'Ascorbic Acld'], 'Can appear in tiny amounts as an antioxidant.'),
    i('Sodium Ascorbyl Phosphate', ['vitamin_c_derivative'], ['active', 'antioxidant'], ['SAP'], []),
    i('Magnesium Ascorbyl Phosphate', ['vitamin_c_derivative'], ['active', 'antioxidant'], ['MAP'], []),
    i('Ascorbyl Glucoside', ['vitamin_c_derivative'], ['active', 'antioxidant'], [], []),
    i('Tetrahexyldecyl Ascorbate', ['vitamin_c_derivative'], ['active', 'antioxidant'], ['THD Ascorbate', 'Ascorbyl Tetraisopalmitate'], []),
    i('3-O-Ethyl Ascorbic Acid', ['vitamin_c_derivative'], ['active', 'antioxidant'], ['Ethyl Ascorbic Acid', 'Ethylated Ascorbic Acid'], []),
    i('Ascorbyl Palmitate', ['vitamin_c_derivative'], ['antioxidant'], [], [], 'Usually an antioxidant for the formula, not a skin active.'),

    i('Niacinamide', ['niacinamide'], ['active', 'skin_conditioning'], ['Nicotinamide', 'Vitamin B3', 'Niacinamide (Vitamin B3)'], ['Niacinamlde', 'Nlacinamide']),
    i('Copper Tripeptide-1', ['copper_peptide'], ['active'], ['GHK-Cu', 'Copper Peptide'], []),
    i('Hydroquinone', ['hydroquinone'], ['active'], [], []),
    i('Azelaic Acid', ['azelaic_acid'], ['active'], [], ['Azelalc Acid']),

    /* uv filters */
    i('Zinc Oxide', ['mineral_uv_filter'], ['active'], ['Zinc Oxide (Nano)'], ['Zlnc Oxide']),
    i('Titanium Dioxide', ['mineral_uv_filter'], ['active', 'colorant'], ['Titanium Dioxide (Nano)', 'CI 77891'], ['Titanlum Dioxide'], 'Also a white pigment. As a sunscreen active it appears in Drug Facts.'),
    i('Avobenzone', ['chemical_uv_filter'], ['active'], ['Butyl Methoxydibenzoylmethane'], []),
    i('Octinoxate', ['chemical_uv_filter'], ['active'], ['Ethylhexyl Methoxycinnamate', 'Octyl Methoxycinnamate'], []),
    i('Octisalate', ['chemical_uv_filter'], ['active'], ['Ethylhexyl Salicylate', 'Octyl Salicylate'], []),
    i('Homosalate', ['chemical_uv_filter'], ['active'], [], []),
    i('Octocrylene', ['chemical_uv_filter'], ['active'], [], ['Octocryiene']),
    i('Oxybenzone', ['chemical_uv_filter'], ['active'], ['Benzophenone-3'], []),

    /* silicones */
    i('Dimethicone', ['silicone', 'occlusive'], ['emollient', 'occlusive', 'film_former'], ['Polydimethylsiloxane', 'PDMS'], ['Dimethlcone', 'Dlmethicone']),
    i('Cyclopentasiloxane', ['silicone'], ['emollient', 'solvent'], ['D5'], ['Cyclopentasiioxane']),
    i('Cyclohexasiloxane', ['silicone'], ['emollient', 'solvent'], ['D6'], []),
    i('Dimethicone Crosspolymer', ['silicone'], ['thickener', 'film_former'], [], []),
    i('Dimethicone/Vinyl Dimethicone Crosspolymer', ['silicone'], ['thickener', 'film_former'], ['Dimethicone / Vinyl Dimethicone Crosspolymer'], []),
    i('Phenyl Trimethicone', ['silicone'], ['emollient'], [], []),
    i('Trimethylsiloxysilicate', ['silicone', 'film_former'], ['film_former'], [], []),
    i('Amodimethicone', ['silicone'], ['conditioning'], [], []),
    i('Cyclomethicone', ['silicone'], ['emollient', 'solvent'], [], []),

    /* gel thickeners */
    i('Carbomer', ['gel_thickener'], ['thickener'], ['Carbopol', 'Carbomer 940', 'Carbomer 980'], ['Carborner']),
    i('Acrylates/C10-30 Alkyl Acrylate Crosspolymer', ['gel_thickener'], ['thickener'], ['Acrylates / C10-30 Alkyl Acrylate Crosspolymer'], []),
    i('Sodium Polyacrylate', ['gel_thickener'], ['thickener'], [], []),
    i('Xanthan Gum', ['gel_thickener'], ['thickener'], [], ['Xanthan Gurn']),
    i('Hydroxyethylcellulose', ['gel_thickener'], ['thickener'], ['Hydroxyethyl Cellulose'], []),
    i('Sclerotium Gum', ['gel_thickener'], ['thickener'], [], []),
    i('Ammonium Acryloyldimethyltaurate/VP Copolymer', ['gel_thickener'], ['thickener'], ['Ammonium Acryloyldimethyltaurate / VP Copolymer'], []),
    i('Sodium Acrylate/Sodium Acryloyldimethyl Taurate Copolymer', ['gel_thickener'], ['thickener'], [], []),
    i('Hydroxypropyl Methylcellulose', ['gel_thickener'], ['thickener'], ['Hypromellose'], []),

    /* film formers */
    i('PVP', ['film_former'], ['film_former'], ['Polyvinylpyrrolidone'], []),
    i('VP/VA Copolymer', ['film_former'], ['film_former'], ['VP / VA Copolymer'], []),
    i('Acrylates Copolymer', ['film_former'], ['film_former'], [], []),
    i('Polyquaternium-7', ['film_former'], ['film_former', 'conditioning'], [], []),
    i('Polyquaternium-10', ['film_former'], ['film_former', 'conditioning'], [], []),
    i('Pullulan', ['film_former'], ['film_former'], [], []),
    i('Polyurethane-35', ['film_former'], ['film_former'], [], []),

    /* occlusives, emollients, oils */
    i('Petrolatum', ['occlusive'], ['occlusive'], ['Petroleum Jelly', 'White Petrolatum', 'Vaseline'], ['Petrolaturn']),
    i('Mineral Oil', ['occlusive'], ['occlusive', 'emollient'], ['Paraffinum Liquidum', 'Paraffinum Liquidum (Mineral Oil)', 'Liquid Paraffin'], []),
    i('Lanolin', ['occlusive'], ['occlusive', 'emollient'], [], ['Lanolln']),
    i('Beeswax', ['occlusive'], ['occlusive', 'thickener'], ['Cera Alba', 'Cera Alba (Beeswax)'], []),
    i('Squalane', ['emollient', 'oil'], ['emollient'], [], ['Squaiane', 'Squalene'], 'Squalene (with an e) is the unsaturated form; labels sometimes confuse the two.'),
    i('Butyrospermum Parkii Butter', ['emollient'], ['emollient', 'occlusive'], ['Shea Butter', 'Butyrospermum Parkii (Shea) Butter', 'Butyrospermum Parkii (Shea Butter)'], []),
    i('Caprylic/Capric Triglyceride', ['emollient'], ['emollient'], ['Caprylic / Capric Triglyceride', 'Fractionated Coconut Oil'], ['Caprylic/Caprlc Triglyceride']),
    i('Cetearyl Alcohol', ['emollient'], ['emollient', 'thickener', 'emulsifier'], [], []),
    i('Cetyl Alcohol', ['emollient'], ['emollient', 'thickener'], [], []),
    i('Stearic Acid', ['emollient'], ['emollient', 'thickener', 'emulsifier'], [], []),
    i('Glyceryl Stearate', [], ['emulsifier'], [], []),
    i('Isopropyl Myristate', ['emollient'], ['emollient'], [], []),
    i('Jojoba Oil', ['oil'], ['emollient'], ['Simmondsia Chinensis Seed Oil', 'Simmondsia Chinensis (Jojoba) Seed Oil'], []),
    i('Argan Oil', ['oil'], ['emollient'], ['Argania Spinosa Kernel Oil', 'Argania Spinosa (Argan) Kernel Oil'], []),
    i('Rosehip Oil', ['oil'], ['emollient'], ['Rosa Canina Fruit Oil', 'Rosa Canina Seed Oil'], []),
    i('Sunflower Seed Oil', ['oil'], ['emollient'], ['Helianthus Annuus Seed Oil', 'Helianthus Annuus (Sunflower) Seed Oil'], []),
    i('Coconut Oil', ['oil'], ['emollient'], ['Cocos Nucifera Oil', 'Cocos Nucifera (Coconut) Oil'], []),
    i('Olive Oil', ['oil'], ['emollient'], ['Olea Europaea Fruit Oil', 'Olea Europaea (Olive) Fruit Oil'], []),
    i('Marula Oil', ['oil'], ['emollient'], ['Sclerocarya Birrea Seed Oil'], []),
    i('Grape Seed Oil', ['oil'], ['emollient'], ['Vitis Vinifera Seed Oil', 'Vitis Vinifera (Grape) Seed Oil'], []),

    /* physical exfoliants */
    i('Jojoba Esters', ['physical_exfoliant'], ['exfoliant'], ['Jojoba Beads', 'Hydrogenated Jojoba Oil'], []),
    i('Oryza Sativa Powder', ['physical_exfoliant'], ['exfoliant'], ['Rice Powder', 'Oryza Sativa (Rice) Powder', 'Rice Bran Powder'], []),
    i('Juglans Regia Shell Powder', ['physical_exfoliant'], ['exfoliant'], ['Walnut Shell Powder', 'Juglans Regia (Walnut) Shell Powder'], []),
    i('Silica', ['physical_exfoliant'], ['exfoliant', 'thickener', 'absorbent'], ['Hydrated Silica'], [], 'Silica is also a texture ingredient. It counts as an exfoliant only when the product says it scrubs.'),
    i('Cellulose', ['physical_exfoliant'], ['exfoliant', 'thickener'], ['Microcrystalline Cellulose'], []),

    /* fragrance and allergens */
    i('Parfum', ['fragrance'], ['fragrance'], ['Fragrance', 'Fragrance (Parfum)', 'Parfum (Fragrance)', 'Perfume', 'Aroma'], ['Parfurn']),
    i('Linalool', ['fragrance'], ['fragrance'], [], ['Linalooi']),
    i('Limonene', ['fragrance'], ['fragrance'], ['D-Limonene'], ['Lirnonene']),
    i('Geraniol', ['fragrance'], ['fragrance'], [], []),
    i('Citronellol', ['fragrance'], ['fragrance'], [], []),
    i('Citral', ['fragrance'], ['fragrance'], [], []),
    i('Eugenol', ['fragrance'], ['fragrance'], [], []),
    i('Benzyl Alcohol', ['fragrance'], ['preservative', 'fragrance', 'solvent'], [], []),
    i('Benzyl Benzoate', ['fragrance'], ['fragrance', 'solvent'], [], []),
    i('Hexyl Cinnamal', ['fragrance'], ['fragrance'], ['Hexyl Cinnamaldehyde'], []),
    i('Coumarin', ['fragrance'], ['fragrance'], [], []),
    i('Lavandula Angustifolia Oil', ['essential_oil', 'fragrance'], ['fragrance'], ['Lavender Oil', 'Lavandula Angustifolia (Lavender) Oil'], []),
    i('Citrus Aurantium Dulcis Peel Oil', ['essential_oil', 'fragrance'], ['fragrance'], ['Sweet Orange Peel Oil', 'Citrus Aurantium Dulcis (Orange) Peel Oil'], []),
    i('Melaleuca Alternifolia Leaf Oil', ['essential_oil', 'fragrance'], ['fragrance', 'active'], ['Tea Tree Oil', 'Melaleuca Alternifolia (Tea Tree) Leaf Oil'], []),
    i('Mentha Piperita Oil', ['essential_oil', 'fragrance'], ['fragrance'], ['Peppermint Oil', 'Mentha Piperita (Peppermint) Oil'], []),
    i('Eucalyptus Globulus Leaf Oil', ['essential_oil', 'fragrance'], ['fragrance'], ['Eucalyptus Oil'], []),
    i('Rosa Damascena Flower Oil', ['essential_oil', 'fragrance'], ['fragrance'], ['Rose Oil', 'Rosa Damascena (Rose) Flower Oil'], []),

    /* preservatives, chelators, antioxidants, others (roles matter for false-alarm control) */
    i('Phenoxyethanol', [], ['preservative'], [], ['Phenoxyethanoi']),
    i('Ethylhexylglycerin', [], ['preservative', 'skin_conditioning'], [], []),
    i('Sodium Benzoate', [], ['preservative'], [], []),
    i('Potassium Sorbate', [], ['preservative'], [], []),
    i('Methylparaben', [], ['preservative'], [], []),
    i('Propylparaben', [], ['preservative'], [], []),
    i('Chlorphenesin', [], ['preservative'], [], []),
    i('Caprylyl Glycol', [], ['preservative', 'humectant'], [], []),
    i('Disodium EDTA', [], ['chelating'], ['Disodium Edetate'], []),
    i('Tetrasodium EDTA', [], ['chelating'], [], []),
    i('Sodium Hydroxide', [], ['ph_adjuster'], ['Caustic Soda'], ['Sodium Hydroxlde']),
    i('Triethanolamine', [], ['ph_adjuster'], ['TEA'], []),
    i('Aminomethyl Propanol', [], ['ph_adjuster'], [], []),
    i('Sodium Citrate', [], ['ph_adjuster', 'chelating'], [], []),
    i('Tocopherol', [], ['antioxidant'], ['Vitamin E', 'Tocopherol (Vitamin E)', 'D-Alpha Tocopherol'], ['Tocopheroi']),
    i('Tocopheryl Acetate', [], ['antioxidant'], ['Vitamin E Acetate'], []),
    i('Ferulic Acid', [], ['antioxidant'], [], []),
    i('BHT', [], ['antioxidant'], ['Butylated Hydroxytoluene'], []),
    i('Polysorbate 20', [], ['emulsifier'], [], []),
    i('Polysorbate 80', [], ['emulsifier'], [], []),
    i('PEG-100 Stearate', [], ['emulsifier'], [], []),
    i('Lecithin', [], ['emulsifier'], [], []),
    i('Ceramide NP', [], ['skin_conditioning'], ['Ceramide 3'], []),
    i('Ceramide AP', [], ['skin_conditioning'], ['Ceramide 6 II'], []),
    i('Ceramide EOP', [], ['skin_conditioning'], ['Ceramide 1'], []),
    i('Cholesterol', [], ['skin_conditioning'], [], []),
    i('Phytosphingosine', [], ['skin_conditioning'], [], []),
    i('Aloe Barbadensis Leaf Juice', [], ['skin_conditioning'], ['Aloe Vera', 'Aloe Barbadensis Leaf Extract', 'Aloe Vera Leaf Juice'], []),
    i('Camellia Sinensis Leaf Extract', [], ['antioxidant', 'skin_conditioning'], ['Green Tea Extract', 'Camellia Sinensis (Green Tea) Leaf Extract'], []),
    i('Centella Asiatica Extract', [], ['skin_conditioning'], ['Cica', 'Centella Asiatica Leaf Extract'], []),
    i('Bisabolol', [], ['skin_conditioning'], ['Alpha-Bisabolol'], []),
    i('Palmitoyl Tripeptide-1', [], ['active'], [], []),
    i('Palmitoyl Tetrapeptide-7', [], ['active'], [], []),
    i('Acetyl Hexapeptide-8', [], ['active'], ['Argireline'], []),
    i('Kojic Acid', [], ['active'], [], []),
    i('Arbutin', [], ['active'], ['Alpha-Arbutin'], []),
    i('Tranexamic Acid', [], ['active'], [], []),
    i('Bakuchiol', [], ['active'], [], [], 'Not a retinoid. Do not file it under a retinoid family.'),
    i('Caffeine', [], ['skin_conditioning'], [], []),
    i('Zinc PCA', [], ['skin_conditioning'], [], []),
    i('Sodium Chloride', [], ['thickener'], ['Salt'], []),
    i('Talc', [], ['absorbent'], [], []),
    i('Mica', [], ['colorant'], ['CI 77019'], []),
    i('Iron Oxides', [], ['colorant'], ['CI 77491', 'CI 77492', 'CI 77499', 'Iron Oxide'], []),
    i('Sodium Lauryl Sulfate', [], ['surfactant'], ['SLS'], []),
    i('Sodium Laureth Sulfate', [], ['surfactant'], ['SLES'], []),
    i('Cocamidopropyl Betaine', [], ['surfactant'], [], []),
    i('Sodium Cocoyl Isethionate', [], ['surfactant'], [], []),
    i('Decyl Glucoside', [], ['surfactant'], [], []),
    i('Coco-Glucoside', [], ['surfactant'], [], []),
    i('Sodium Hydroxymethylglycinate', [], ['preservative'], [], []),
    i('Dipropylene Glycol', ['humectant'], ['humectant', 'solvent'], [], []),
    i('Glycol Distearate', [], ['opacifier'], [], []),
    i('Hydrogenated Polyisobutene', ['emollient'], ['emollient'], [], []),
    i('Isohexadecane', ['emollient'], ['emollient', 'solvent'], [], []),
    i('C12-15 Alkyl Benzoate', ['emollient'], ['emollient'], [], []),
    i('Ethylhexyl Palmitate', ['emollient'], ['emollient'], [], []),
    i('Polyglyceryl-3 Diisostearate', [], ['emulsifier'], [], [])
  ];

  /* families that count as "actives" for rules; everything else is texture or role */
  var ACTIVE_FAMILIES = ['retinoid_otc', 'retinoid_rx', 'aha', 'bha', 'pha', 'benzoyl_peroxide', 'vitamin_c_laa', 'vitamin_c_derivative', 'niacinamide', 'copper_peptide', 'hydroquinone', 'azelaic_acid', 'mineral_uv_filter', 'chemical_uv_filter'];
  var EXFOLIANT_FAMILIES = ['aha', 'bha', 'physical_exfoliant'];
  var RETINOID_FAMILIES = ['retinoid_otc', 'retinoid_rx'];
  var SUNSCREEN_FAMILIES = ['mineral_uv_filter', 'chemical_uv_filter'];
  var FAMILY_LABEL = {
    retinoid_otc: 'a retinoid', retinoid_rx: 'a prescription retinoid', aha: 'an alpha hydroxy acid (an exfoliating acid)', bha: 'a beta hydroxy acid (salicylic acid, an exfoliating acid)',
    pha: 'a polyhydroxy acid (a gentle exfoliating acid)', benzoyl_peroxide: 'benzoyl peroxide', vitamin_c_laa: 'pure vitamin C (L-ascorbic acid)', vitamin_c_derivative: 'a vitamin C derivative',
    niacinamide: 'niacinamide (vitamin B3)', copper_peptide: 'a copper peptide', hydroquinone: 'hydroquinone', azelaic_acid: 'azelaic acid', mineral_uv_filter: 'a mineral sunscreen filter',
    chemical_uv_filter: 'a chemical sunscreen filter', silicone: 'a silicone', gel_thickener: 'a gel thickener', film_former: 'a film former', humectant: 'a humectant (draws in water)',
    occlusive: 'an occlusive (seals water in)', emollient: 'an emollient (softens)', oil: 'an oil', physical_exfoliant: 'a physical scrub', fragrance: 'fragrance', essential_oil: 'an essential oil', solvent: 'a solvent'
  };

  /* lookup index built once: every name form -> entry */
  function norm(s) {
    return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim().replace(/[.*†‡]+$/g, '').replace(/\s*\(\s*/g, ' (').replace(/\s*\)\s*/g, ') ').replace(/\s+/g, ' ').trim();
  }
  var INDEX = {};
  ENTRIES.forEach(function (e) {
    [e.inci].concat(e.synonyms, e.ocrVariants).forEach(function (n) { INDEX[norm(n)] = e; });
  });
  function lookup(name) { return INDEX[norm(name)] || null; }
  function byInci(inci) { for (var k = 0; k < ENTRIES.length; k++) if (ENTRIES[k].inci === inci) return ENTRIES[k]; return null; }

  return {
    entries: ENTRIES, index: INDEX, lookup: lookup, byInci: byInci, norm: norm,
    ACTIVE_FAMILIES: ACTIVE_FAMILIES, EXFOLIANT_FAMILIES: EXFOLIANT_FAMILIES, RETINOID_FAMILIES: RETINOID_FAMILIES,
    SUNSCREEN_FAMILIES: SUNSCREEN_FAMILIES, FAMILY_LABEL: FAMILY_LABEL
  };
}));
