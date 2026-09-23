import type { Product, ProductType } from '../types/product';
import { normalizeForMatch, joinedForm, tokenize } from './normalizeQuery';
import { detectAlias, typeForCanonical } from './synonyms';

/**
 * Query understanding.
 *
 * Turns a raw query into a structured intent: which part looks like a brand,
 * which part looks like a product type, and what is left over to match against
 * a product name. This is deterministic — no LLM, no embeddings.
 */

/** Levenshtein distance, iterative with two rows. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/**
 * Typo tolerance scaled to word length, so short words stay strict and long
 * words absorb a transposition or a dropped letter.
 */
export function fuzzyClose(a: string, b: string): boolean {
  if (!a || !b) return false;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 3) return dist === 0;
  if (maxLen <= 5) return dist <= 1;
  if (maxLen <= 9) return dist <= 2;
  return dist <= 3;
}

export interface BrandEntry {
  /** Display form, e.g. "CeraVe" */
  display: string;
  /** Normalized form, e.g. "cerave" */
  normalized: string;
  /** Whitespace-free form, e.g. "cerave" */
  joined: string;
}

/** Build the set of known brands from whatever catalog is in play. */
export function buildBrandIndex(catalog: Product[]): BrandEntry[] {
  const seen = new Map<string, BrandEntry>();
  for (const product of catalog) {
    const normalized = normalizeForMatch(product.brand);
    if (!normalized || seen.has(normalized)) continue;
    seen.set(normalized, {
      display: product.brand,
      normalized,
      joined: joinedForm(normalized),
    });
  }
  return Array.from(seen.values());
}

export type BrandConfidence = 'exact' | 'prefix' | 'fuzzy';

export interface BrandMatch {
  brand: BrandEntry;
  confidence: BrandConfidence;
  /** The normalized query text consumed by the brand match */
  matchedText: string;
}

/**
 * Find the brand a query is reaching for.
 *
 * Handles three real-world shapes:
 *   "dior ..."        exact brand token(s)
 *   "cera ve ..."     brand split across tokens ("cerave")
 *   "dio ..."         brand typed as a prefix
 */
export function detectBrand(normalizedQuery: string, brands: BrandEntry[]): BrandMatch | null {
  const tokens = tokenize(normalizedQuery);
  if (!tokens.length) return null;

  const candidates: BrandMatch[] = [];

  for (const brand of brands) {
    // Contiguous token spans, longest first, anchored anywhere in the query.
    for (let start = 0; start < tokens.length; start++) {
      for (let end = tokens.length; end > start; end--) {
        const span = tokens.slice(start, end);
        const spanText = span.join(' ');
        const spanJoined = joinedForm(spanText);

        if (spanText === brand.normalized || spanJoined === brand.joined) {
          candidates.push({ brand, confidence: 'exact', matchedText: spanText });
        }
      }
    }
  }

  if (candidates.length) {
    // Prefer the brand that consumed the most query text.
    candidates.sort((a, b) => b.matchedText.length - a.matchedText.length);
    return candidates[0];
  }

  // Brand embedded in a run-together token: "ceravecleanser" -> "cerave".
  for (const brand of brands) {
    if (brand.joined.length < 4) continue;
    for (const token of tokens) {
      if (token.length > brand.joined.length && token.startsWith(brand.joined)) {
        candidates.push({ brand, confidence: 'exact', matchedText: token });
      }
    }
  }

  if (candidates.length) {
    candidates.sort((a, b) => b.brand.joined.length - a.brand.joined.length);
    return candidates[0];
  }

  // Prefix: "dio" -> "dior". Require at least 3 characters so "d" matches nothing.
  for (const brand of brands) {
    for (const token of tokens) {
      if (token.length >= 3 && brand.joined.startsWith(token) && token.length < brand.joined.length) {
        candidates.push({ brand, confidence: 'prefix', matchedText: token });
      }
    }
  }

  if (candidates.length) {
    candidates.sort((a, b) => b.matchedText.length - a.matchedText.length);
    return candidates[0];
  }

  // Fuzzy: a genuine misspelling of a brand name.
  for (const brand of brands) {
    for (const token of tokens) {
      if (token.length >= 4 && fuzzyClose(token, brand.joined)) {
        candidates.push({ brand, confidence: 'fuzzy', matchedText: token });
      }
    }
  }

  if (candidates.length) {
    candidates.sort((a, b) => b.matchedText.length - a.matchedText.length);
    return candidates[0];
  }

  return null;
}

export type TypeConfidence = 'exact' | 'prefix' | 'fuzzy';

export interface TypeMatch {
  canonical: string;
  productType: ProductType | null;
  confidence: TypeConfidence;
  /** True for broad terms like "cream" that must not dominate ranking */
  weak: boolean;
  matchedText: string;
}

/**
 * All canonical terms, used for prefix and fuzzy type recovery.
 * Imported lazily to avoid a circular import at module load.
 */
function canonicalTerms(): string[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ALIASES_BY_LENGTH } = require('./synonyms') as {
    ALIASES_BY_LENGTH: string[];
  };
  return ALIASES_BY_LENGTH;
}

/**
 * Find the product type a query is reaching for, tolerating misspellings
 * ("moisterizer") and truncations ("moist").
 */
export function detectType(normalizedQuery: string): TypeMatch | null {
  const direct = detectAlias(normalizedQuery);
  if (direct) {
    return {
      canonical: direct.canonical,
      productType: typeForCanonical(direct.canonical),
      confidence: 'exact',
      weak: direct.weak,
      matchedText: direct.alias,
    };
  }

  const tokens = tokenize(normalizedQuery);
  const aliases = canonicalTerms();

  // Prefix: "moist" -> "moisturizer". Require 3+ characters.
  for (const token of tokens) {
    if (token.length < 3) continue;
    for (const alias of aliases) {
      const aliasJoined = joinedForm(alias);
      if (aliasJoined.startsWith(token) && token.length < aliasJoined.length) {
        const canonical = detectAlias(alias)?.canonical ?? alias;
        return {
          canonical,
          productType: typeForCanonical(canonical),
          confidence: 'prefix',
          weak: false,
          matchedText: token,
        };
      }
    }
  }

  // Fuzzy: "moisterizer" -> "moisturizer", "sunscren" -> "sunscreen".
  for (const token of tokens) {
    if (token.length < 4) continue;
    for (const alias of aliases) {
      const aliasJoined = joinedForm(alias);
      if (fuzzyClose(token, aliasJoined)) {
        const canonical = detectAlias(alias)?.canonical ?? alias;
        return {
          canonical,
          productType: typeForCanonical(canonical),
          confidence: 'fuzzy',
          weak: false,
          matchedText: token,
        };
      }
    }
  }

  // Head word of a multi-word alias: "oil" -> "facial oil", "serum" -> a serum
  // family. Deliberately weak so a broad word cannot outrank a specific result.
  for (const token of tokens) {
    if (token.length < 3) continue;
    for (const alias of aliases) {
      if (alias.includes(' ') && alias.split(' ').includes(token)) {
        const canonical = detectAlias(alias)?.canonical ?? alias;
        return {
          canonical,
          productType: typeForCanonical(canonical),
          confidence: 'prefix',
          weak: true,
          matchedText: token,
        };
      }
    }
  }

  return null;
}

export interface ParsedQuery {
  normalized: string;
  joined: string;
  tokens: string[];
  brand: BrandMatch | null;
  type: TypeMatch | null;
  /** Tokens not consumed by the brand or type match */
  residualTokens: string[];
}

export function parseQuery(normalizedQuery: string, catalog: Product[]): ParsedQuery {
  const brands = buildBrandIndex(catalog);
  const tokens = tokenize(normalizedQuery);
  const brand = detectBrand(normalizedQuery, brands);
  const type = detectType(normalizedQuery);

  const consumed = new Set<string>();
  if (brand) for (const t of tokenize(brand.matchedText)) consumed.add(t);
  if (type) for (const t of tokenize(type.matchedText)) consumed.add(t);

  const residualTokens = tokens.filter((t) => !consumed.has(t));

  return {
    normalized: normalizedQuery,
    joined: joinedForm(normalizedQuery),
    tokens,
    brand,
    type,
    residualTokens,
  };
}
