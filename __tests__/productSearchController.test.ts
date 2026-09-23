import { ProductSearchController } from '../src/search/productSearchController';
import { searchProducts } from '../src/search/searchProducts';
import type { SearchResult } from '../src/search/searchProducts';
import { FIXTURE_PRODUCTS } from '../src/data/fixtures/products';
import type { Product } from '../src/types/product';

/** Build a controller backed by the real local search. */
function realController() {
  return new ProductSearchController({ minChars: 2 });
}

function findFixture(id: string): Product {
  const product = FIXTURE_PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error(`fixture ${id} missing`);
  return product;
}

const emptyResult = (query: string): SearchResult => ({
  queryOriginal: query,
  queryNormalized: query,
  results: [],
  suggestions: [],
});

describe('ProductSearchController — searching from the page', () => {
  it('searches as the user types and opens the results panel', async () => {
    const c = realController();
    await c.setQuery('Dior Moisterizer');

    const state = c.getState();
    expect(state.status).toBe('results');
    expect(state.isOpen).toBe(true);
    expect(state.results.length).toBeGreaterThan(0);
    expect(state.results[0].product.brand).toBe('Dior');
  });

  it('preserves the user’s original text verbatim', async () => {
    const c = realController();
    await c.setQuery('  DiOr   Moisterizer ');
    expect(c.getState().query).toBe('  DiOr   Moisterizer ');
  });

  it('stays idle below the minimum character count', async () => {
    const c = realController();
    await c.setQuery('d');
    expect(c.getState().status).toBe('idle');
    expect(c.getState().isOpen).toBe(false);
  });

  it('reports no_results and offers a manual path for nonsense input', async () => {
    const c = realController();
    await c.setQuery('zzzzqqqqxxxx');
    expect(c.getState().status).toBe('no_results');
  });
});

describe('ProductSearchController — stale responses (required test 11)', () => {
  it('a slow earlier response cannot replace a newer query’s results', async () => {
    const slowProduct = findFixture('fix-generic-gel');
    const fastProduct = findFixture('fix-sunscreen');

    let releaseSlow: (() => void) | null = null;
    const slowGate = new Promise<void>((resolve) => {
      releaseSlow = resolve;
    });

    const controller = new ProductSearchController({
      minChars: 1,
      searchFn: async (query) => {
        if (query === 'slow') {
          await slowGate;
          return {
            queryOriginal: 'slow',
            queryNormalized: 'slow',
            results: [{ product: slowProduct, score: 500, matchReason: 'exact_name' }],
            suggestions: [],
          };
        }
        return {
          queryOriginal: query,
          queryNormalized: query,
          results: [{ product: fastProduct, score: 900, matchReason: 'exact_name' }],
          suggestions: [],
        };
      },
    });

    // Start the slow query, then supersede it with a fast one.
    const slowPromise = controller.setQuery('slow');
    const fastPromise = controller.setQuery('fast');
    await fastPromise;

    expect(controller.getState().results[0].product.id).toBe('fix-sunscreen');

    // Now let the stale request finish. It must be discarded.
    releaseSlow!();
    await slowPromise;

    expect(controller.getState().results).toHaveLength(1);
    expect(controller.getState().results[0].product.id).toBe('fix-sunscreen');
  });

  it('marks the superseded request as aborted so work can stop early', async () => {
    const seen: Array<{ aborted: boolean }> = [];
    const controller = new ProductSearchController({
      minChars: 1,
      searchFn: (query, signal) => {
        seen.push(signal);
        return emptyResult(query);
      },
    });

    await controller.setQuery('one');
    await controller.setQuery('two');

    expect(seen[0].aborted).toBe(true);
    expect(seen[1].aborted).toBe(false);
  });
});

describe('ProductSearchController — keyboard navigation (accessibility)', () => {
  it('arrow keys move the active option and wrap at both ends', async () => {
    const c = realController();
    await c.setQuery('oil');
    const count = c.getState().results.length;
    expect(count).toBeGreaterThan(1);

    expect(c.getState().highlightIndex).toBe(0);
    c.handleKey('ArrowDown');
    expect(c.getState().highlightIndex).toBe(1);
    c.handleKey('ArrowUp');
    expect(c.getState().highlightIndex).toBe(0);
    // Wrap backwards from the first option to the last.
    c.handleKey('ArrowUp');
    expect(c.getState().highlightIndex).toBe(count - 1);
    // And forwards back to the first.
    c.handleKey('ArrowDown');
    expect(c.getState().highlightIndex).toBe(0);
  });

  it('Home and End jump to the first and last option', async () => {
    const c = realController();
    await c.setQuery('oil');
    const count = c.getState().results.length;

    c.handleKey('End');
    expect(c.getState().highlightIndex).toBe(count - 1);
    c.handleKey('Home');
    expect(c.getState().highlightIndex).toBe(0);
  });

  it('Enter selects the active option', async () => {
    const c = realController();
    await c.setQuery('lip sleeping mask');
    const expected = c.getState().results[0].product;

    const consumed = c.handleKey('Enter');
    expect(consumed).toBe(true);
    expect(c.getState().selected?.id).toBe(expected.id);
  });

  it('Escape closes the panel without selecting anything', async () => {
    const c = realController();
    await c.setQuery('cleanser');
    expect(c.getState().isOpen).toBe(true);

    const consumed = c.handleKey('Escape');
    expect(consumed).toBe(true);
    expect(c.getState().isOpen).toBe(false);
    expect(c.getState().selected).toBeNull();
  });

  it('reports unhandled keys so the caller can let them through', async () => {
    const c = realController();
    await c.setQuery('cleanser');
    expect(c.handleKey('a')).toBe(false);
  });
});

describe('ProductSearchController — selection populates the form (required test 12)', () => {
  it('fills brand, product name and internal id from the chosen record', async () => {
    const c = realController();
    await c.setQuery('CeraVe Hydrating Facial Cleanser');
    c.selectIndex(0);

    const { form, selected } = c.getState();
    expect(selected?.id).toBe('fix-cerave-cleanser');
    expect(form.brand).toBe('CeraVe');
    expect(form.productName).toBe('Hydrating Facial Cleanser');
    expect(form.productId).toBe('fix-cerave-cleanser');
    expect(form.userEntered).toBe(false);
  });

  it('closes the panel and leaves a clear path back to search', async () => {
    const c = realController();
    await c.setQuery('sun screen');
    c.selectIndex(0);
    expect(c.getState().isOpen).toBe(false);

    c.clearSelection();
    expect(c.getState().selected).toBeNull();
    expect(c.getState().form.productName).toBe('');
    expect(c.getState().query).toBe('');
  });
});

describe('ProductSearchController — suggestions stay editable (required test 13)', () => {
  it('suggests a routine category and time of day that the user can change', async () => {
    const c = realController();
    await c.setQuery('sun screen');
    c.selectIndex(0);

    // Sunscreen suggests Protect / Morning.
    expect(c.getState().form.categories).toEqual(['Protect']);
    expect(c.getState().form.whenToUse).toEqual(['Morning']);
    expect(c.getState().suggestionEdited).toBe(false);

    // The user overrides both.
    c.toggleCategory('Protect');
    c.toggleCategory('Treat');
    c.toggleWhenToUse('Morning');
    c.toggleWhenToUse('Evening');

    expect(c.getState().form.categories).toEqual(['Treat']);
    expect(c.getState().form.whenToUse).toEqual(['Evening']);
    expect(c.getState().suggestionEdited).toBe(true);
  });

  it('lets the user overwrite an auto-filled brand and name', async () => {
    const c = realController();
    await c.setQuery('lip sleeping mask');
    c.selectIndex(0);

    c.setBrand('My Own Brand');
    c.setProductName('My Own Name');

    expect(c.getState().form.brand).toBe('My Own Brand');
    expect(c.getState().form.productName).toBe('My Own Name');
  });

  it('flags low-confidence suggestions for confirmation instead of assuming', async () => {
    const c = realController();
    await c.setQuery('gua sha');
    c.selectIndex(0);

    const suggestion = c.getState().routineSuggestion;
    expect(suggestion).not.toBeNull();
    expect(suggestion!.confidence).toBe('low');
    expect(suggestion!.needsConfirmation).toBe(true);
  });
});

describe('ProductSearchController — manual entry fallback (required test 14)', () => {
  it('offers manual entry after a search finds nothing', async () => {
    const c = realController();
    await c.setQuery('zzzzqqqqxxxx');
    expect(c.getState().status).toBe('no_results');

    c.enterManualMode();
    const { form, manualMode } = c.getState();
    expect(manualMode).toBe(true);
    expect(form.userEntered).toBe(true);
    expect(form.productId).toBeNull();
  });

  it('seeds the manual form with what the user already typed', async () => {
    const c = realController();
    await c.setQuery('my indie balm');
    c.enterManualMode();
    expect(c.getState().form.productName).toBe('my indie balm');
  });

  it('never marks a manually entered product as verified', async () => {
    const c = realController();
    await c.setQuery('zzzzqqqqxxxx');
    c.enterManualMode();
    expect(c.getState().selected).toBeNull();
    expect(c.getState().form.userEntered).toBe(true);
  });

  it('allows submitting once a product name exists', async () => {
    const c = realController();
    c.enterManualMode(false);
    expect(c.canSubmit()).toBe(false);
    c.setProductName('Hand Cream');
    expect(c.canSubmit()).toBe(true);
  });
});

describe('ProductSearchController — provider failure (required test 15)', () => {
  it('shows an error state instead of throwing', async () => {
    const controller = new ProductSearchController({
      minChars: 1,
      searchFn: async () => {
        throw new Error('Provider timed out');
      },
    });

    await expect(controller.setQuery('dior')).resolves.toBeUndefined();

    const state = controller.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBe('Provider timed out');
    expect(state.results).toEqual([]);
  });

  it('can retry after an error and recover', async () => {
    let shouldFail = true;
    const controller = new ProductSearchController({
      minChars: 1,
      searchFn: (query) => {
        if (shouldFail) throw new Error('Provider timed out');
        return searchProducts(query);
      },
    });

    await controller.setQuery('sun screen');
    expect(controller.getState().status).toBe('error');

    shouldFail = false;
    await controller.retry();
    expect(controller.getState().status).toBe('results');
    expect(controller.getState().error).toBeNull();
  });

  it('keeps the manual path available while in an error state', async () => {
    const controller = new ProductSearchController({
      minChars: 1,
      searchFn: () => {
        throw new Error('offline');
      },
    });
    await controller.setQuery('dior');
    controller.enterManualMode();
    expect(controller.getState().manualMode).toBe(true);
  });
});

describe('ProductSearchController — alternative wording', () => {
  it('applying a suggestion runs a new search', async () => {
    const c = realController();
    await c.setQuery('moisturizer');
    expect(c.getState().results.length).toBeGreaterThan(0);

    await c.useSuggestion('cleanser');
    expect(c.getState().query).toBe('cleanser');
    expect(c.getState().results.some((r) => r.product.type === 'cleanser')).toBe(true);
  });
});

describe('ProductSearchController — subscribers', () => {
  it('notifies subscribers and can be unsubscribed', async () => {
    const c = realController();
    let calls = 0;
    const unsubscribe = c.subscribe(() => {
      calls += 1;
    });
    await c.setQuery('dior');
    expect(calls).toBeGreaterThan(0);

    const seen = calls;
    unsubscribe();
    await c.setQuery('cerave');
    expect(calls).toBe(seen);
  });
});
