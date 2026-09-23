import { searchProducts } from '../src/search/searchProducts';
import { parseQuery } from '../src/search/parseQuery';
import { FIXTURE_PRODUCTS } from '../src/data/fixtures/products';
import { suggestRoutine } from '../src/search/routineSuggestion';

function results(query: string) {
  return searchProducts(query).results;
}
function types(query: string): string[] {
  return results(query).map((r) => r.product.type);
}
function brands(query: string): string[] {
  return results(query).map((r) => r.product.brand);
}
function ids(query: string): string[] {
  return results(query).map((r) => r.product.id);
}

describe('Query understanding', () => {
  it('separates brand intent from product-type intent', () => {
    const parsed = parseQuery('dior moisturizer', FIXTURE_PRODUCTS);
    expect(parsed.brand?.brand.display).toBe('Dior');
    expect(parsed.type?.canonical).toBe('moisturizer');
  });

  it('recognizes a brand typed as a prefix', () => {
    const parsed = parseQuery('dio moist', FIXTURE_PRODUCTS);
    expect(parsed.brand?.brand.display).toBe('Dior');
    expect(parsed.brand?.confidence).toBe('prefix');
  });

  it('recognizes a brand split across tokens', () => {
    const parsed = parseQuery('cera ve cleanser', FIXTURE_PRODUCTS);
    expect(parsed.brand?.brand.display).toBe('CeraVe');
  });

  it('recognizes a brand run together with a product type', () => {
    const parsed = parseQuery('ceravecleanser', FIXTURE_PRODUCTS);
    expect(parsed.brand?.brand.display).toBe('CeraVe');
  });

  it('recovers a misspelled product type', () => {
    const parsed = parseQuery('moisterizer', FIXTURE_PRODUCTS);
    expect(parsed.type?.canonical).toBe('moisturizer');
  });
});

describe('Required search behavior', () => {
  it('1. “Dior Moisterizer” returns Dior moisturizers', () => {
    expect(brands('Dior Moisterizer')[0]).toBe('Dior');
    expect(types('Dior Moisterizer')).toContain('moisturizer');
  });

  it('2. “dio moist” returns Dior moisturizers', () => {
    const top = results('dio moist')[0];
    expect(top.product.brand).toBe('Dior');
    expect(top.product.type).toBe('moisturizer');
  });

  it('3. “ceravecleanser” matches CeraVe Cleanser', () => {
    const top = results('ceravecleanser')[0];
    expect(top.product.brand).toBe('CeraVe');
    expect(top.product.type).toBe('cleanser');
  });

  it('4. “cera ve cleanser” matches CeraVe Cleanser', () => {
    const top = results('cera ve cleanser')[0];
    expect(top.product.brand).toBe('CeraVe');
  });

  it('5. “makeup wipes” returns wipe products', () => {
    expect(types('makeup wipes')).toContain('makeup_wipes');
  });

  it('5b. “cleansing cloths” reaches the same family', () => {
    expect(types('cleansing cloths')).toContain('makeup_wipes');
  });

  it('5c. “make up remover” reaches makeup-removal products', () => {
    const t = types('make up remover');
    expect(t.some((x) => x === 'makeup_wipes' || x === 'makeup_remover')).toBe(true);
  });

  it('6. “lash serum” returns eyelash serums', () => {
    expect(types('lash serum')).toContain('lash_serum');
  });

  it('6b. “eyelash growth serum” returns eyelash serums', () => {
    expect(types('eyelash growth serum')).toContain('lash_serum');
  });

  it('7. “sun screen” returns sunscreen', () => {
    expect(types('sun screen')).toContain('sunscreen');
  });

  it('7b. “spf” and “sunblock” reach sunscreen', () => {
    expect(types('spf')).toContain('sunscreen');
    expect(types('sunblock')).toContain('sunscreen');
  });

  it('8. Extra spaces and capitalization do not change results', () => {
    expect(ids('  MAKEUP   Wipes  ')).toEqual(ids('makeup wipes'));
    expect(ids('Sun Screen')).toEqual(ids('sun screen'));
  });

  it('8b. Hyphens and punctuation do not change results', () => {
    expect(ids('make-up wipes')).toEqual(ids('makeup wipes'));
  });

  it('8c. Diacritics are ignored for matching', () => {
    expect(searchProducts('Crème').queryNormalized).toBe('creme');
  });

  it('9. Exact matches rank above fuzzy matches', () => {
    const ranked = results('Hydrating Facial Cleanser');
    expect(ranked[0].product.id).toBe('fix-cerave-cleanser');
    expect(ranked[0].score).toBeGreaterThanOrEqual(800);
  });

  it('10. Correct-brand results rank above unrelated products', () => {
    const ranked = results('Dior moisturizer');
    expect(ranked[0].product.brand).toBe('Dior');
    const dior = ranked.findIndex((r) => r.product.brand === 'Dior');
    const other = ranked.findIndex((r) => r.product.brand !== 'Dior');
    if (other >= 0) expect(dior).toBeLessThan(other);
  });

  it('10b. A broad word does not outrank a specific product', () => {
    // "cream" is deliberately weak; an exact product name must win.
    const exact = results('Prestige Soft Cream')[0];
    expect(exact.product.id).toBe('fix-dior-cream');
  });
});

describe('Unconventional and inclusive catalog coverage', () => {
  const cases: Array<[string, string]> = [
    ['coconut oil', 'facial_oil'],
    ['micellar water', 'makeup_remover'],
    ['toner', 'toner'],
    ['essence', 'essence'],
    ['face mist', 'mist'],
    ['hyaluronic serum', 'hydrating_serum'],
    ['vit c serum', 'vitamin_c_serum'],
    ['retinol', 'retinol_treatment'],
    ['spot treatment', 'acne_treatment'],
    ['sheet mask', 'mask'],
    ['eye cream', 'eye_cream'],
    ['lip balm', 'lip_balm'],
    ['lip sleeping mask', 'lip_mask'],
    ['brow serum', 'brow_serum'],
    ['primer', 'primer'],
    ['setting spray', 'setting_spray'],
    ['foundation', 'foundation'],
    ['mascara', 'mascara'],
    ['scalp serum', 'scalp_treatment'],
    ['body lotion', 'body_care'],
    ['gua sha', 'beauty_tool'],
    ['cleansing balm', 'cleanser'],
  ];

  it.each(cases)('“%s” reaches the %s family', (query, expectedType) => {
    expect(types(query)).toContain(expectedType);
  });
});

describe('Ingredient honesty (required test 17)', () => {
  it('never reports ingredients as available when we do not have them', () => {
    for (const product of FIXTURE_PRODUCTS) {
      expect(product.ingredientStatus).toBe('unavailable');
      expect(product.ingredientsRaw).toBeUndefined();
    }
  });

  it('never invents a size or an image', () => {
    for (const product of FIXTURE_PRODUCTS) {
      expect(product.sizeLabel).toBeUndefined();
      expect(product.imageUrl).toBeUndefined();
    }
  });

  it('never marks a fixture as verified', () => {
    for (const product of FIXTURE_PRODUCTS) {
      expect(product.provenance).toBe('fixture');
      expect(product.verificationStatus).toBe('unverified');
    }
  });
});

describe('No-result experience', () => {
  it('offers alternative wording rather than a dead end', () => {
    const result = searchProducts('moisturizerr');
    if (result.results.length === 0) {
      expect(result.suggestions.length).toBeGreaterThan(0);
    }
  });

  it('returns an empty, safe result for blank input', () => {
    expect(searchProducts('').results).toEqual([]);
    expect(searchProducts('   ').results).toEqual([]);
    expect(searchProducts('   ').suggestions).toEqual([]);
  });
});

describe('Routine classification stays separate from product type', () => {
  it('maps a product type to a routine step without conflating them', () => {
    const sunscreen = FIXTURE_PRODUCTS.find((p) => p.type === 'sunscreen')!;
    const suggestion = suggestRoutine(sunscreen);
    expect(suggestion.category).toBe('Protect');
    expect(suggestion.whenToUse).toBe('Morning');
    expect(sunscreen.type).toBe('sunscreen');
  });

  it('routes makeup-remover wipes to Cleanse, not Finish', () => {
    const wipes = FIXTURE_PRODUCTS.find((p) => p.type === 'makeup_wipes')!;
    expect(suggestRoutine(wipes).category).toBe('Cleanse');
  });

  it('asks for confirmation when the type is unknown', () => {
    const suggestion = suggestRoutine({
      id: 'x',
      brand: 'Unknown',
      name: 'Mystery Jar',
      type: 'other',
      typeLabel: '',
      provenance: 'user_entered',
      ingredientStatus: 'unavailable',
    });
    expect(suggestion.needsConfirmation).toBe(true);
    expect(suggestion.confidence).toBe('low');
  });

  it('makes no medical, safety or compatibility claim', () => {
    const banned = /safe|unsafe|allerg|pregnan|diagnos|treat(s|ment of)|cure|contraindicat/i;
    for (const product of FIXTURE_PRODUCTS) {
      expect(suggestRoutine(product).rationale).not.toMatch(banned);
    }
  });
});
