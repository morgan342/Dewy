/* Normalization and confirmed-actives tests. Every product here is fictional. */
const dict = require('../../src/chemist/dictionary');
const nz = require('../../src/chemist/normalize');
const act = require('../../src/chemist/actives');

describe('ingredient dictionary', () => {
  test('resolves synonyms, case, spacing, trailing periods and asterisks', () => {
    expect(dict.lookup('Aqua')!.inci).toBe('Water');
    expect(dict.lookup('  water.  ')!.inci).toBe('Water');
    expect(dict.lookup('GLYCERIN*')!.inci).toBe('Glycerin');
    expect(dict.lookup('Vitamin B3')!.inci).toBe('Niacinamide');
  });
  test('resolves OCR misreads', () => {
    expect(dict.lookup('Dimethlcone')!.inci).toBe('Dimethicone');
    expect(dict.lookup('Retlnol')!.inci).toBe('Retinol');
  });
  test('every entry has at least one role and a family list', () => {
    for (const e of dict.entries) {
      expect(Array.isArray(e.families)).toBe(true);
      expect(e.commonRoles.length).toBeGreaterThan(0);
    }
  });
});

describe('normalize', () => {
  test('slashes and parentheses stay one ingredient; order is kept', () => {
    const r = nz.normalize('Aqua/Water/Eau, Glycerin, Water (Aqua), Dimethicone');
    expect(r.items.map((i: any) => i.inci)).toEqual(['Water', 'Glycerin', 'Water', 'Dimethicone']);
    expect(r.items.map((i: any) => i.position)).toEqual([0, 1, 2, 3]);
  });
  test('splits on commas, bullets, line breaks, semicolons and a bare "and"', () => {
    const r = nz.normalize('Water • Glycerin\nCarbomer; Phenoxyethanol and Ethylhexylglycerin');
    expect(r.items.map((i: any) => i.inci)).toEqual(['Water', 'Glycerin', 'Carbomer', 'Phenoxyethanol', 'Ethylhexylglycerin']);
  });
  test('May Contain and +/- sections are marked possibly present and excluded from the match rate', () => {
    const r = nz.normalize('Water, Glycerin, Squalane. May Contain: Mica, Iron Oxides');
    const mc = r.items.filter((i: any) => i.mayContain).map((i: any) => i.inci);
    expect(mc).toEqual(['Mica', 'Iron Oxides']);
    expect(r.matchRate).toBe(1);
    const r2 = nz.normalize('Water, Glycerin +/- Titanium Dioxide');
    expect(r2.items[2].mayContain).toBe(true);
  });
  test('strips nano and stores printed percentages', () => {
    const r = nz.normalize('Zinc Oxide (nano) 12%, Water, Niacinamide 5%');
    expect(r.items[0].inci).toBe('Zinc Oxide');
    expect(r.items[0].nano).toBe(true);
    expect(r.items[0].percent).toBe(12);
    expect(r.items[2].percent).toBe(5);
  });
  test('match rate reflects unknown names', () => {
    const r = nz.normalize('Water, Glycerin, Fictionium Extract, Made-Up Polymer');
    expect(r.matchRate).toBe(0.5);
    expect(nz.trust(r.matchRate, true)).toBe('not_checkable');
    expect(nz.trust(0.75, true)).toBe('checkable_partial');
    expect(nz.trust(0.95, true)).toBe('checkable');
    expect(nz.trust(1, false)).toBe('not_checkable');
  });
  test('reads a Drug Facts panel: actives with percentages come first', () => {
    const r = nz.normalize('Drug Facts\nActive ingredients: Zinc Oxide 18.6% Sunscreen, Titanium Dioxide 4% Sunscreen\nInactive ingredients: Water, Caprylic/Capric Triglyceride, Glycerin');
    expect(r.drugFacts.actives.map((a: any) => [a.name, a.percent])).toEqual([['Zinc Oxide', 18.6], ['Titanium Dioxide', 4]]);
    expect(r.items[0].inci).toBe('Zinc Oxide');
    expect(r.items[0].percent).toBe(18.6);
    expect(r.items[2].inci).toBe('Water');
  });
});

describe('confirmed actives', () => {
  const list = (s: string) => nz.normalize(s).items;
  test('citric acid near the end never counts as an active', () => {
    const p = { productName: 'Test Gel Serum A', ingredients: list('Water, Glycerin, Niacinamide, Carbomer, Phenoxyethanol, Citric Acid') };
    const a = act.confirmedActives(p);
    expect(a.some((x: any) => x.family === 'aha')).toBe(false);
  });
  test('the product name confirms an active and picks up a printed strength', () => {
    const p = { productName: 'Test Retinol 0.3% Night Serum', ingredients: list('Water, Glycerin, Retinol, Carbomer') };
    const a = act.confirmedActives(p);
    expect(a).toEqual([{ family: 'retinoid_otc', inci: 'Retinol', percent: 0.3, confirmedBy: 'front_label' }]);
  });
  test('a Drug Facts panel confirms sunscreen filters', () => {
    const n = nz.normalize('Active ingredients: Zinc Oxide 20% Sunscreen. Inactive ingredients: Water, Squalane');
    const a = act.confirmedActives({ productName: 'Test Mineral Lotion', ingredients: n.items, drugFacts: n.drugFacts });
    expect(a[0]).toMatchObject({ family: 'mineral_uv_filter', inci: 'Zinc Oxide', percent: 20, confirmedBy: 'drug_facts' });
  });
  test('the user can confirm; a helper acid in the first half raises one question', () => {
    const p: any = { productName: 'Test Toner B', ingredients: list('Water, Glycolic Acid, Glycerin, Butylene Glycol, Phenoxyethanol, Citric Acid') };
    expect(act.confirmedActives(p)).toEqual([]);
    const qs = act.questionsToAsk(p);
    expect(qs).toEqual([{ family: 'aha', inci: 'Glycolic Acid', question: 'Is this an exfoliating product?' }]);
    p.userConfirmed = [{ family: 'aha', yes: true }];
    expect(act.confirmedActives(p)[0]).toMatchObject({ family: 'aha', confirmedBy: 'user' });
  });
  test('"Vitamin C" on the front resolves to a derivative when the list says so', () => {
    const p = { productName: 'Test Vitamin C Cream', ingredients: list('Water, Glycerin, Sodium Ascorbyl Phosphate, Cetearyl Alcohol') };
    expect(act.confirmedActives(p)[0].family).toBe('vitamin_c_derivative');
  });
  test('formula type is a guess with a reason, never a claim', () => {
    expect(act.formulaType(list('Water, Glycerin, Carbomer')).type).toBe('water_based');
    expect(act.formulaType(list('Dimethicone, Cyclopentasiloxane, Water')).type).toBe('silicone_based');
    expect(act.formulaType(list('Petrolatum, Beeswax, Lanolin')).type).toBe('balm');
    expect(act.formulaType(list('Squalane, Jojoba Oil, Tocopherol')).type).toBe('oil_based');
    expect(act.formulaType([]).type).toBe('unknown');
  });
});
