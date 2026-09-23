import type { Product, RankedProduct } from '../types/product';
import { FIXTURE_PRODUCTS } from '../data/fixtures/products';
import { normalizeQuery, isEmptyQuery, normalizeForMatch } from './normalizeQuery';
import { rankProducts } from './rank';
import { parseQuery } from './parseQuery';
import { ALIASES_BY_LENGTH } from './synonyms';
import {
  getCatalogProvider,
  normalizeProviderProduct,
  dedupeProducts,
  ProviderUnavailableError,
  type CatalogProvider,
} from '../catalog/providerAdapter';

export interface SearchOptions {
  /** Override catalog (defaults to development fixtures) */
  catalog?: Product[];
  limit?: number;
}

export interface SearchResult {
  /** The user's text, preserved verbatim for display, analytics and debugging */
  queryOriginal: string;
  /** The separate matching form */
  queryNormalized: string;
  results: RankedProduct[];
  /** Alternative wordings offered when nothing strong came back */
  suggestions: string[];
}

/**
 * Local deterministic product search.
 *
 * No LLM, no embeddings, no network. This is the foundation and it works with
 * no external provider configured.
 */
export function searchProducts(rawQuery: string, options: SearchOptions = {}): SearchResult {
  const catalog = options.catalog ?? FIXTURE_PRODUCTS;
  const limit = options.limit ?? 20;
  const nq = normalizeQuery(rawQuery);

  if (isEmptyQuery(nq)) {
    return {
      queryOriginal: nq.original,
      queryNormalized: nq.normalized,
      results: [],
      suggestions: [],
    };
  }

  const ranked = rankProducts(nq.normalized, catalog);
  const deduped = dedupeRanked(ranked).slice(0, limit);

  return {
    queryOriginal: nq.original,
    queryNormalized: nq.normalized,
    results: deduped,
    suggestions: deduped.length === 0 ? suggestAlternatives(nq.normalized, catalog) : [],
  };
}

/** Collapse duplicate products while keeping the best-ranked instance. */
function dedupeRanked(ranked: RankedProduct[]): RankedProduct[] {
  const best = new Map<string, RankedProduct>();
  for (const entry of ranked) {
    const key = entry.product.barcode
      ? `barcode:${entry.product.barcode}`
      : `name:${entry.product.brand.toLowerCase()}|${entry.product.name.toLowerCase()}`;
    const existing = best.get(key);
    if (!existing || entry.score > existing.score) best.set(key, entry);
  }
  return Array.from(best.values()).sort(
    (a, b) =>
      b.score - a.score ||
      a.product.brand.localeCompare(b.product.brand) ||
      a.product.name.localeCompare(b.product.name),
  );
}

/**
 * Offer alternative wordings when a search finds nothing.
 * Suggestions are drawn from the known brand list and the controlled alias
 * vocabulary — never invented, never a product claim.
 */
export function suggestAlternatives(normalizedQuery: string, catalog: Product[]): string[] {
  const parsed = parseQuery(normalizedQuery, catalog);
  const out: string[] = [];

  if (parsed.brand) out.push(parsed.brand.brand.display);
  if (parsed.type) out.push(parsed.type.canonical);

  // Closest alias terms by shared prefix, so "moistur" offers "moisturizer".
  if (out.length === 0) {
    const first = parsed.tokens[0] ?? '';
    if (first.length >= 3) {
      for (const alias of ALIASES_BY_LENGTH) {
        if (alias.startsWith(first) || first.startsWith(alias.slice(0, 3))) {
          out.push(alias);
          if (out.length >= 3) break;
        }
      }
    }
  }

  // Nearest known brand, for a badly misspelled brand name.
  const stem = parsed.tokens[0]?.slice(0, 3);
  if (out.length === 0 && stem) {
    const brands = new Set(catalog.map((p) => p.brand));
    for (const brand of brands) {
      if (normalizeForMatch(brand).startsWith(stem)) {
        out.push(brand);
        if (out.length >= 3) break;
      }
    }
  }

  return Array.from(new Set(out)).slice(0, 3);
}

export interface ExternalSearchResult extends SearchResult {
  /** True when the provider was consulted and answered */
  usedProvider: boolean;
  providerError: string | null;
}

/**
 * Local-first search with an optional external fallback.
 *
 * Order of operations:
 *   1. Search the local index.
 *   2. Only if local results are insufficient, consult the provider.
 *   3. Normalize, merge and deduplicate anything it returns.
 *
 * With no provider configured (the current state) this behaves exactly like
 * `searchProducts` and never touches the network.
 */
export async function searchProductsWithFallback(
  rawQuery: string,
  options: SearchOptions & {
    provider?: CatalogProvider;
    minLocalResults?: number;
    signal?: { aborted: boolean };
  } = {},
): Promise<ExternalSearchResult> {
  const local = searchProducts(rawQuery, options);
  const minLocal = options.minLocalResults ?? 1;
  const provider = options.provider ?? getCatalogProvider();

  if (local.results.length >= minLocal || provider.status() === 'not_configured') {
    return { ...local, usedProvider: false, providerError: null };
  }

  try {
    const raw = await provider.searchProducts(local.queryOriginal, {
      limit: options.limit ?? 20,
      signal: options.signal,
    });
    if (options.signal?.aborted) {
      return { ...local, usedProvider: false, providerError: null };
    }

    const normalized = raw
      .map((r) => normalizeProviderProduct(r, provider.name))
      .filter((p): p is Product => p !== null);

    if (normalized.length === 0) {
      return { ...local, usedProvider: true, providerError: null };
    }

    const catalog = options.catalog ?? FIXTURE_PRODUCTS;
    const merged = dedupeProducts([...catalog, ...normalized]);
    const rescored = searchProducts(rawQuery, { ...options, catalog: merged });

    return { ...rescored, usedProvider: true, providerError: null };
  } catch (error) {
    const message =
      error instanceof ProviderUnavailableError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Provider request failed';
    // Local results still stand. A provider failure degrades, never crashes.
    return { ...local, usedProvider: false, providerError: message };
  }
}

export { normalizeQuery, rankProducts, parseQuery };
