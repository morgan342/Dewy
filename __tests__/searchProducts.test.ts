import { searchProducts } from '../src/search/searchProducts';
import { normalizeQuery } from '../src/search/normalizeQuery';
import { FIXTURE_PRODUCTS } from '../src/data/fixtures/products';

function ids(query: string): string[] {
  return searchProducts(query).results.map((r) => r.product.id);
}

function brands(query: string): string[] {
  return searchProducts(query).results.map((r) => r.product.brand);
}

function types(query: string): string[] {
  return searchProducts(query).results.map((r) => r.product.type);
}

describe('normalizeQuery', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeQuery('  Dior   cream  ').normalized).toBe('dior cream');
  });

  it('lowercases for matching and preserves original', () => {
    const q = normalizeQuery('DiOr');
    expect(q.normalized).toBe('dior');
    expect(q.original).toBe('DiOr');
  });

  it('strips diacritics for matching', () => {
    expect(normalizeQuery('Crème').normalized).toBe('creme');
  });
});

describe('searchProducts — Prompt 3 fixtures', () => {
  it('1. “Dior Moisterizer” returns Dior moisturizers', () => {
    const resultIds = ids('Dior Moisterizer');
    expect(resultIds.some((id) => id.startsWith('fix-dior'))).toBe(true);
    expect(types('Dior Moisterizer').some((t) => t === 'moisturizer')).toBe(true);
    expect(brands('Dior Moisterizer')[0]).toBe('Dior');
  });

  it('2. “dio moist” returns Dior moisturizers', () => {
    const top = searchProducts('dio moist').results[0];
    expect(top?.product.brand).toBe('Dior');
    expect(top?.product.type).toBe('moisturizer');
  });

  it('3. “Dior skin cream” returns Dior moisturizers', () => {
    const result = searchProducts('Dior skin cream').results;
    expect(result.some((r) => r.product.brand === 'Dior' && r.product.type === 'moisturizer')).toBe(
      true,
    );
  });

  it('4. “ceravecleanser” matches CeraVe cleanser', () => {
    const top = searchProducts('ceravecleanser').results[0];
    expect(top?.product.brand).toBe('CeraVe');
    expect(top?.product.type).toBe('cleanser');
  });

  it('5. “cera ve cleanser” matches CeraVe cleanser', () => {
    const top = searchProducts('cera ve cleanser').results[0];
    expect(top?.product.brand).toBe('CeraVe');
    expect(top?.product.type).toBe('cleanser');
  });

  it('6. “makeup wipes” returns makeup-remover / cleansing-wipe products', () => {
    expect(types('makeup wipes')).toContain('makeup_wipes');
  });

  it('7. “make up remover” returns makeup-removal products', () => {
    expect(types('make up remover')).toContain('makeup_wipes');
  });

  it('8. “lash serum” returns eyelash-serum products', () => {
    expect(types('lash serum')).toContain('lash_serum');
  });

  it('9. “eyelash growth serum” returns eyelash-serum products', () => {
    expect(types('eyelash growth serum')).toContain('lash_serum');
  });

  it('10. “sun screen” returns sunscreen', () => {
    expect(types('sun screen')).toContain('sunscreen');
  });

  it('11. “vit c serum” returns vitamin C serum', () => {
    expect(types('vit c serum')).toContain('vitamin_c_serum');
  });

  it('12. “lip sleeping mask” returns relevant lip products', () => {
    expect(types('lip sleeping mask')).toContain('lip_mask');
  });

  it('13. Extra spaces do not change results', () => {
    expect(ids('  makeup   wipes  ')).toEqual(ids('makeup wipes'));
  });

  it('14. Capitalization does not change results', () => {
    expect(ids('Sun Screen')).toEqual(ids('sun screen'));
  });

  it('15. Exact matches rank above fuzzy matches', () => {
    const exact = searchProducts('Lip Sleeping Mask').results[0];
    expect(exact?.product.type).toBe('lip_mask');
    expect(exact?.score).toBeGreaterThanOrEqual(500);
  });

  it('16. Correct-brand matches rank above unrelated products', () => {
    const ranked = searchProducts('Dior moisturizer').results;
    expect(ranked[0]?.product.brand).toBe('Dior');
    const genericIndex = ranked.findIndex((r) => r.product.brand === 'Generic Lab');
    const diorIndex = ranked.findIndex((r) => r.product.brand === 'Dior');
    if (genericIndex >= 0 && diorIndex >= 0) {
      expect(diorIndex).toBeLessThan(genericIndex);
    }
  });

  it('17. Weak fuzzy matches do not overwhelm stronger exact results', () => {
    const ranked = searchProducts('CeraVe Hydrating Facial Cleanser').results;
    expect(ranked[0]?.product.id).toBe('fix-cerave-cleanser');
  });

  it('18. Empty or whitespace-only query is handled safely', () => {
    expect(searchProducts('').results).toEqual([]);
    expect(searchProducts('   ').results).toEqual([]);
  });

  it('uses fixture catalog by default', () => {
    expect(FIXTURE_PRODUCTS.every((p) => p.isFixture)).toBe(true);
    expect(searchProducts('sunscreen').results.length).toBeGreaterThan(0);
  });
});
