import type { Product, IngredientStatus, VerificationStatus } from '../types/product';

/**
 * Product provider adapter seam.
 *
 * The app talks to this interface, never to a vendor SDK directly, so a catalog
 * provider can be added, swapped or removed without touching the UI.
 *
 * NOTHING IN THIS FILE CALLS AN EXTERNAL SERVICE.
 * No provider is configured, no account exists, no credentials are present.
 * Wiring a real provider is an approval gate (paid vendor / third-party terms /
 * credentials / provider integration) and is deliberately left undone.
 *
 * When a provider is approved, its implementation must live server-side. Client
 * bundles must never contain an API key. The environment-variable *names* a
 * server implementation would read are documented in docs/CATALOG_SOURCE.md.
 */

export type ProviderStatus = 'not_configured' | 'available' | 'unavailable' | 'error';

export interface ProviderSearchOptions {
  limit?: number;
  /** Cooperative cancellation for superseded queries */
  signal?: { aborted: boolean };
}

/** The raw shape a provider returns, before normalization. */
export interface RawProviderProduct {
  providerProductId: string;
  brand?: string;
  name?: string;
  barcode?: string;
  typeLabel?: string;
  imageUrl?: string;
  productUrl?: string;
  sizeLabel?: string;
  market?: string;
  /** Original INCI text exactly as supplied. Never generated. */
  ingredientsRaw?: string;
}

export interface CatalogProvider {
  readonly name: string;
  status(): ProviderStatus;
  searchProducts(query: string, options?: ProviderSearchOptions): Promise<RawProviderProduct[]>;
  getByProviderId(id: string): Promise<RawProviderProduct | null>;
  getByBarcode(barcode: string): Promise<RawProviderProduct | null>;
}

export class ProviderUnavailableError extends Error {
  readonly providerName: string;
  constructor(providerName: string, message?: string) {
    super(message ?? `${providerName} is unavailable`);
    this.name = 'ProviderUnavailableError';
    this.providerName = providerName;
  }
}

/**
 * Normalize a provider record into Dewy's internal schema.
 *
 * Provenance rules enforced here:
 *  - A provider result is `provider_reported`, never `manufacturer_verified`.
 *    Appearing in a search result does not make a product verified.
 *  - Ingredients are 'complete' only when the provider actually supplied text.
 *    Absent text means 'unavailable' — never 'none'.
 *  - Missing size, image or URL stay undefined. Nothing is inferred.
 */
export function normalizeProviderProduct(
  raw: RawProviderProduct,
  providerName: string,
  now: string = new Date().toISOString(),
): Product | null {
  const brand = raw.brand?.trim();
  const name = raw.name?.trim();

  // Without a brand and a name there is no product identity worth storing.
  if (!brand || !name) return null;

  const hasIngredients = typeof raw.ingredientsRaw === 'string' && raw.ingredientsRaw.trim().length > 0;
  const ingredientStatus: IngredientStatus = hasIngredients ? 'complete' : 'unavailable';
  const verificationStatus: VerificationStatus = 'provider_reported';

  return {
    id: `${providerName}:${raw.providerProductId}`,
    brand,
    name,
    type: 'other',
    typeLabel: raw.typeLabel?.trim() ?? '',
    provenance: 'provider',
    ingredientStatus,
    verificationStatus,
    providerName,
    providerProductId: raw.providerProductId,
    barcode: raw.barcode,
    sizeLabel: raw.sizeLabel,
    imageUrl: raw.imageUrl,
    productUrl: raw.productUrl,
    market: raw.market,
    ingredientsRaw: hasIngredients ? raw.ingredientsRaw : undefined,
    createdAt: now,
    updatedAt: now,
    lastSyncedAt: now,
  };
}

/**
 * Deduplicate across sources.
 *
 * Barcode is the strongest identity signal; brand + name is the fallback.
 * When two records describe the same product, the one carrying more usable
 * data wins, and richer fields are merged in rather than dropped.
 */
export function dedupeProducts(products: Product[]): Product[] {
  const byKey = new Map<string, Product>();

  const identity = (p: Product): string =>
    p.barcode
      ? `barcode:${p.barcode}`
      : `name:${p.brand.trim().toLowerCase()}|${p.name.trim().toLowerCase()}`;

  const richness = (p: Product): number => {
    let score = 0;
    if (p.ingredientStatus === 'complete') score += 4;
    else if (p.ingredientStatus === 'partial') score += 2;
    if (p.imageUrl) score += 2;
    if (p.barcode) score += 2;
    if (p.sizeLabel) score += 1;
    if (p.verificationStatus === 'manufacturer_verified') score += 3;
    else if (p.verificationStatus === 'provider_reported') score += 1;
    return score;
  };

  for (const product of products) {
    const key = identity(product);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, product);
      continue;
    }

    const winner = richness(product) > richness(existing) ? product : existing;
    const other = winner === product ? existing : product;

    // Merge fields the winner is missing. Never overwrite present data.
    byKey.set(key, {
      ...winner,
      imageUrl: winner.imageUrl ?? other.imageUrl,
      barcode: winner.barcode ?? other.barcode,
      sizeLabel: winner.sizeLabel ?? other.sizeLabel,
      productUrl: winner.productUrl ?? other.productUrl,
      ingredientsRaw: winner.ingredientsRaw ?? other.ingredientsRaw,
    });
  }

  return Array.from(byKey.values());
}

/**
 * The default provider: explicitly not configured.
 * It never performs I/O and always reports its absence honestly.
 */
export const NULL_PROVIDER: CatalogProvider = {
  name: 'none',
  status: () => 'not_configured',
  async searchProducts() {
    return [];
  },
  async getByProviderId() {
    return null;
  },
  async getByBarcode() {
    return null;
  },
};

let activeProvider: CatalogProvider = NULL_PROVIDER;

export function getCatalogProvider(): CatalogProvider {
  return activeProvider;
}

/** Test seam. Production wiring requires founder approval. */
export function setCatalogProvider(provider: CatalogProvider): void {
  activeProvider = provider;
}

export function resetCatalogProvider(): void {
  activeProvider = NULL_PROVIDER;
}
