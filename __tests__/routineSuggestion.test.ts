/**
 * Prompt 8 — routine step and time-of-day suggestions.
 *
 * Product type ("what it is") stays separate from routine step ("where it
 * goes"). The mapping lives in one maintainable table
 * (src/search/routineSuggestion.ts); everything it returns is a suggestion,
 * never a verdict, and never a medical claim.
 */
import { suggestRoutine } from '../src/search/routineSuggestion';
import type { Product, ProductType } from '../src/types/product';

function product(type: ProductType, extra: Partial<Product> = {}): Product {
  return {
    id: 'test-' + type,
    brand: 'Test Brand',
    name: 'Test ' + type,
    type,
    typeLabel: type.replace(/_/g, ' '),
    provenance: 'fixture',
    ingredientStatus: 'unavailable',
    ...extra,
  };
}

describe('Type-to-step mapping', () => {
  it('cleanser → Cleanse', () => {
    const s = suggestRoutine(product('cleanser'));
    expect(s.category).toBe('Cleanse');
    expect(s.confidence).toBe('high');
  });

  it('makeup-remover wipes → Cleanse, Evening', () => {
    const s = suggestRoutine(product('makeup_wipes'));
    expect(s.category).toBe('Cleanse');
    expect(s.whenToUse).toBe('Evening');
  });

  it('hydrating serum → Treat, Both', () => {
    const s = suggestRoutine(product('hydrating_serum'));
    expect(s.category).toBe('Treat');
    expect(s.whenToUse).toBe('Both');
  });

  it('vitamin C serum → Treat, Morning', () => {
    const s = suggestRoutine(product('vitamin_c_serum'));
    expect(s.category).toBe('Treat');
    expect(s.whenToUse).toBe('Morning');
  });

  it('moisturizer → Seal, Both', () => {
    const s = suggestRoutine(product('moisturizer'));
    expect(s.category).toBe('Seal');
    expect(s.whenToUse).toBe('Both');
    expect(s.confidence).toBe('high');
  });

  it('sunscreen → Protect, Morning', () => {
    const s = suggestRoutine(product('sunscreen'));
    expect(s.category).toBe('Protect');
    expect(s.whenToUse).toBe('Morning');
    expect(s.confidence).toBe('high');
  });

  it('retinol → Treat, Evening', () => {
    const s = suggestRoutine(product('retinol_treatment'));
    expect(s.category).toBe('Treat');
    expect(s.whenToUse).toBe('Evening');
  });
});

describe('Low confidence asks instead of assuming', () => {
  it('an unknown type is never force-classified', () => {
    const s = suggestRoutine(product('other'));
    expect(s.category).toBeNull();
    expect(s.confidence).toBe('low');
    expect(s.needsConfirmation).toBe(true);
  });

  it('an ambiguous product (exfoliant) is flagged for confirmation', () => {
    const s = suggestRoutine(product('exfoliant'));
    expect(s.needsConfirmation).toBe(true);
    expect(s.confidence).toBe('low');
  });

  it('a high-confidence type does not nag for confirmation', () => {
    expect(suggestRoutine(product('cleanser')).needsConfirmation).toBe(false);
  });
});

describe('Known data wins over the guess table', () => {
  it('a record that carries its own category and time keeps them', () => {
    const s = suggestRoutine(
      product('moisturizer', { categories: ['Treat'], whenToUse: 'Evening' })
    );
    expect(s.category).toBe('Treat');
    expect(s.whenToUse).toBe('Evening');
  });
});

describe('Suggestions stay suggestions', () => {
  it('every rationale is plain guidance, never a medical or safety claim', () => {
    const types: ProductType[] = [
      'cleanser', 'moisturizer', 'sunscreen', 'exfoliant', 'vitamin_c_serum', 'other',
    ];
    for (const t of types) {
      const s = suggestRoutine(product(t));
      expect(s.rationale).not.toMatch(/safe|cure|treat(s|ed|ment of)|diagnos|prescri|medical|allerg/i);
      expect(s.rationale.length).toBeGreaterThan(0);
    }
  });
});
