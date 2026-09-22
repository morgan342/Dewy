import type { Product, RankedProduct } from '../types/product';
import { FIXTURE_PRODUCTS } from '../data/fixtures/products';
import { normalizeQuery, isEmptyQuery } from './normalizeQuery';
import { rankProducts } from './rank';

export interface SearchOptions {
  /** Override catalog (defaults to development fixtures) */
  catalog?: Product[];
  limit?: number;
}

export interface SearchResult {
  queryOriginal: string;
  queryNormalized: string;
  results: RankedProduct[];
}

/**
 * Local deterministic product search — no paid APIs, no LLM.
 */
export function searchProducts(rawQuery: string, options: SearchOptions = {}): SearchResult {
  const catalog = options.catalog ?? FIXTURE_PRODUCTS;
  const limit = options.limit ?? 20;
  const nq = normalizeQuery(rawQuery);

  if (isEmptyQuery(nq)) {
    return { queryOriginal: nq.original, queryNormalized: nq.normalized, results: [] };
  }

  const ranked = rankProducts(nq.normalized, catalog).slice(0, limit);
  return {
    queryOriginal: nq.original,
    queryNormalized: nq.normalized,
    results: ranked,
  };
}

export { normalizeQuery, rankProducts };
