import {
  normalizeProviderProduct,
  dedupeProducts,
  NULL_PROVIDER,
  ProviderUnavailableError,
  getCatalogProvider,
  setCatalogProvider,
  resetCatalogProvider,
  type CatalogProvider,
} from '../src/catalog/providerAdapter';
import { searchProductsWithFallback } from '../src/search/searchProducts';
import type { Product } from '../src/types/product';

afterEach(() => {
  resetCatalogProvider();
});

describe('Provider adapter — default state', () => {
  it('ships with no provider configured', () => {
    expect(getCatalogProvider()).toBe(NULL_PROVIDER);
    expect(NULL_PROVIDER.status()).toBe('not_configured');
  });

  it('performs no lookups when not configured', async () => {
    await expect(NULL_PROVIDER.searchProducts('dior')).resolves.toEqual([]);
    await expect(NULL_PROVIDER.getByBarcode('000')).resolves.toBeNull();
    await expect(NULL_PROVIDER.getByProviderId('000')).resolves.toBeNull();
  });
});

describe('Provider normalization — honest provenance', () => {
  it('marks provider results as reported, never verified', () => {
    const product = normalizeProviderProduct(
      { providerProductId: 'p1', brand: 'Brand', name: 'Product' },
      'test_provider',
    );
    expect(product).not.toBeNull();
    expect(product!.provenance).toBe('provider');
    expect(product!.verificationStatus).toBe('provider_reported');
    expect(product!.verificationStatus).not.toBe('manufacturer_verified');
  });

  it('reports missing ingredients as unavailable, never as none (required test 17)', () => {
    const product = normalizeProviderProduct(
      { providerProductId: 'p1', brand: 'Brand', name: 'Product' },
      'test_provider',
    )!;
    expect(product.ingredientStatus).toBe('unavailable');
    expect(product.ingredientsRaw).toBeUndefined();
  });

  it('preserves original INCI text exactly when a source supplies it', () => {
    const raw = 'Aqua, Glycerin, Niacinamide';
    const product = normalizeProviderProduct(
      { providerProductId: 'p1', brand: 'Brand', name: 'Product', ingredientsRaw: raw },
      'test_provider',
    )!;
    expect(product.ingredientStatus).toBe('complete');
    expect(product.ingredientsRaw).toBe(raw);
  });

  it('treats whitespace-only ingredient text as unavailable', () => {
    const product = normalizeProviderProduct(
      { providerProductId: 'p1', brand: 'Brand', name: 'Product', ingredientsRaw: '   ' },
      'test_provider',
    )!;
    expect(product.ingredientStatus).toBe('unavailable');
  });

  it('never invents a size, image or URL', () => {
    const product = normalizeProviderProduct(
      { providerProductId: 'p1', brand: 'Brand', name: 'Product' },
      'test_provider',
    )!;
    expect(product.sizeLabel).toBeUndefined();
    expect(product.imageUrl).toBeUndefined();
    expect(product.productUrl).toBeUndefined();
  });

  it('rejects a record with no usable identity', () => {
    expect(normalizeProviderProduct({ providerProductId: 'p1' }, 'test')).toBeNull();
    expect(normalizeProviderProduct({ providerProductId: 'p1', brand: 'B' }, 'test')).toBeNull();
  });

  it('records provider provenance and a sync timestamp', () => {
    const product = normalizeProviderProduct(
      { providerProductId: 'abc', brand: 'Brand', name: 'Product' },
      'test_provider',
    )!;
    expect(product.providerName).toBe('test_provider');
    expect(product.providerProductId).toBe('abc');
    expect(product.lastSyncedAt).toBeDefined();
  });
});

describe('Deduplication across sources (required test 16)', () => {
  const base = {
    type: 'other' as const,
    typeLabel: '',
    provenance: 'provider' as const,
    ingredientStatus: 'unavailable' as const,
  };

  it('merges two records that share a barcode', () => {
    const a: Product = { ...base, id: 'a', brand: 'Brand', name: 'Product', barcode: '123' };
    const b: Product = { ...base, id: 'b', brand: 'Brand', name: 'Product', barcode: '123' };
    expect(dedupeProducts([a, b])).toHaveLength(1);
  });

  it('merges two records that share a brand and name', () => {
    const a: Product = { ...base, id: 'a', brand: 'CeraVe', name: 'Hydrating Cleanser' };
    const b: Product = { ...base, id: 'b', brand: 'cerave', name: 'hydrating cleanser' };
    expect(dedupeProducts([a, b])).toHaveLength(1);
  });

  it('keeps the richer record and fills gaps from the other', () => {
    const sparse: Product = { ...base, id: 'a', brand: 'Brand', name: 'Product', barcode: '1' };
    const rich: Product = {
      ...base,
      id: 'b',
      brand: 'Brand',
      name: 'Product',
      barcode: '1',
      ingredientStatus: 'complete',
      ingredientsRaw: 'Aqua',
      imageUrl: 'https://example.test/i.png',
    };
    const extra: Product = {
      ...base,
      id: 'c',
      brand: 'Brand',
      name: 'Product',
      barcode: '1',
      sizeLabel: '50 ml',
    };

    const [merged] = dedupeProducts([sparse, rich, extra]);
    expect(merged.ingredientsRaw).toBe('Aqua');
    expect(merged.imageUrl).toBe('https://example.test/i.png');
    // The size from the third record is not lost.
    expect(merged.sizeLabel).toBe('50 ml');
  });

  it('does not merge genuinely different products', () => {
    const a: Product = { ...base, id: 'a', brand: 'Brand', name: 'Product One' };
    const b: Product = { ...base, id: 'b', brand: 'Brand', name: 'Product Two' };
    expect(dedupeProducts([a, b])).toHaveLength(2);
  });
});

describe('Provider failure is graceful (required test 15)', () => {
  const failing: CatalogProvider = {
    name: 'failing_provider',
    status: () => 'available',
    async searchProducts() {
      throw new ProviderUnavailableError('failing_provider', 'Provider is unreachable');
    },
    async getByProviderId() {
      return null;
    },
    async getByBarcode() {
      return null;
    },
  };

  it('returns local results and an error message instead of throwing', async () => {
    const result = await searchProductsWithFallback('zzzzqqqq', {
      provider: failing,
    });
    expect(result.providerError).toBe('Provider is unreachable');
    expect(result.results).toEqual([]);
    expect(result.usedProvider).toBe(false);
  });

  it('does not consult a provider when local results are sufficient', async () => {
    let called = false;
    const spy: CatalogProvider = {
      ...failing,
      async searchProducts() {
        called = true;
        return [];
      },
    };
    const result = await searchProductsWithFallback('sun screen', { provider: spy });
    expect(called).toBe(false);
    expect(result.usedProvider).toBe(false);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('never reaches the network when no provider is configured', async () => {
    setCatalogProvider(NULL_PROVIDER);
    const result = await searchProductsWithFallback('zzzzqqqq');
    expect(result.usedProvider).toBe(false);
    expect(result.providerError).toBeNull();
  });

  it('merges provider results into the local catalog when one is configured', async () => {
    const working: CatalogProvider = {
      name: 'test_provider',
      status: () => 'available',
      async searchProducts() {
        return [
          {
            providerProductId: 'new-1',
            brand: 'Zzzz Labs',
            name: 'Zzzzqqqq Recovery Cream',
            typeLabel: 'moisturizer',
          },
        ];
      },
      async getByProviderId() {
        return null;
      },
      async getByBarcode() {
        return null;
      },
    };

    // A query with no local match at all, so the fallback actually engages.
    const result = await searchProductsWithFallback('Zzzz Labs Recovery', {
      provider: working,
    });
    expect(result.usedProvider).toBe(true);
    expect(result.results.some((r) => r.product.providerName === 'test_provider')).toBe(true);
    // Still not verified merely for appearing in results.
    const found = result.results.find((r) => r.product.providerName === 'test_provider')!;
    expect(found.product.verificationStatus).toBe('provider_reported');
    expect(found.product.ingredientStatus).toBe('unavailable');
  });

  it('discards a provider response for a superseded query', async () => {
    const signal = { aborted: true };
    const slow: CatalogProvider = {
      name: 'slow',
      status: () => 'available',
      async searchProducts() {
        return [{ providerProductId: 'x', brand: 'Late', name: 'Late Result' }];
      },
      async getByProviderId() {
        return null;
      },
      async getByBarcode() {
        return null;
      },
    };

    const result = await searchProductsWithFallback('zzzzqqqq', { provider: slow, signal });
    expect(result.results.every((r) => r.product.brand !== 'Late')).toBe(true);
  });
});
