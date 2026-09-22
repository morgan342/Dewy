export { normalizeQuery, normalizeForMatch, isEmptyQuery } from './normalizeQuery';
export { expandSynonyms, canonicalTypeForQuery } from './synonyms';
export { rankProducts, scoreProduct, levenshtein } from './rank';
export { searchProducts } from './searchProducts';
export type { SearchOptions, SearchResult } from './searchProducts';
