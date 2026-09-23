import type { Product, RankedProduct } from '../types/product';
import { normalizeForMatch, joinedForm, tokenVariants } from './normalizeQuery';
import { parseQuery, fuzzyClose, levenshtein, type ParsedQuery } from './parseQuery';
import { expandSynonyms } from './synonyms';

/**
 * Deterministic ranking.
 *
 * Brand and product identity outweigh descriptions and loose term overlap.
 * Tiers, highest first:
 *
 *   1000  exact brand + exact product name
 *    900  exact brand + product type
 *    800  exact product name
 *    700  brand + prefix / partial
 *    600  alias / synonym
 *    500  typo-tolerant / fuzzy
 *    300  weak token overlap (last resort)
 */

export const TIER = {
  BRAND_AND_NAME: 1000,
  BRAND_AND_TYPE: 900,
  NAME: 800,
  BRAND_PARTIAL: 700,
  SYNONYM: 600,
  FUZZY: 500,
  OVERLAP: 300,
} as const;

interface ProductIndex {
  brand: string;
  brandJoined: string;
  name: string;
  nameJoined: string;
  typeLabel: string;
  aliases: string[];
  full: string;
  fullJoined: string;
  nameTokens: string[];
}

function indexProduct(product: Product): ProductIndex {
  const brand = normalizeForMatch(product.brand);
  const name = normalizeForMatch(product.name);
  const typeLabel = normalizeForMatch(product.typeLabel);
  const aliases = (product.aliases ?? []).map(normalizeForMatch);
  const full = `${brand} ${name} ${typeLabel}`.trim();
  return {
    brand,
    brandJoined: joinedForm(brand),
    name,
    nameJoined: joinedForm(name),
    typeLabel,
    aliases,
    full,
    fullJoined: joinedForm(full),
    nameTokens: name.split(' ').filter(Boolean),
  };
}

/** Does this product belong to the product-type family the query asked for? */
function matchesType(parsed: ParsedQuery, product: Product, idx: ProductIndex): boolean {
  if (!parsed.type) return false;
  if (parsed.type.productType && product.type === parsed.type.productType) return true;

  const canonical = parsed.type.canonical;
  if (idx.typeLabel.includes(canonical) || canonical.includes(idx.typeLabel)) return true;

  // Alias terms from the same family appearing in the product's own labels.
  for (const expansion of expandSynonyms(canonical)) {
    if (!expansion) continue;
    if (idx.typeLabel.includes(expansion) || idx.aliases.some((a) => a.includes(expansion))) {
      return true;
    }
  }
  return false;
}

/** Fraction of residual query tokens that appear in the product name. */
function residualCoverage(parsed: ParsedQuery, idx: ProductIndex): number {
  if (!parsed.residualTokens.length) return 1;
  let hits = 0;
  for (const token of parsed.residualTokens) {
    const variants = tokenVariants(token);
    const hit = variants.some(
      (v) =>
        idx.name.includes(v) ||
        idx.typeLabel.includes(v) ||
        idx.aliases.some((a) => a.includes(v)) ||
        idx.nameTokens.some((nt) => nt.startsWith(v) || fuzzyClose(v, nt)),
    );
    if (hit) hits += 1;
  }
  return hits / parsed.residualTokens.length;
}

export function scoreProduct(parsed: ParsedQuery, product: Product): RankedProduct | null {
  if (!parsed.normalized) return null;

  const idx = indexProduct(product);
  const q = parsed.normalized;
  const qJoined = parsed.joined;

  const brandMatched = parsed.brand !== null && parsed.brand.brand.normalized === idx.brand;
  const brandConfidence = brandMatched ? parsed.brand!.confidence : null;
  const typeMatched = matchesType(parsed, product, idx);

  // A product name the user actually typed, in full.
  const nameExact =
    idx.name.length > 0 && (q === idx.name || q.includes(idx.name) || qJoined.includes(idx.nameJoined));

  const coverage = residualCoverage(parsed, idx);

  let score = 0;
  let matchReason = '';

  if (brandMatched && nameExact) {
    score = TIER.BRAND_AND_NAME;
    matchReason = 'exact_brand_and_name';
  } else if (brandMatched && typeMatched) {
    score = TIER.BRAND_AND_TYPE;
    matchReason = 'exact_brand_and_type';
  } else if (nameExact) {
    score = TIER.NAME;
    matchReason = 'exact_name';
  } else if (brandMatched && coverage > 0) {
    // Brand is right and the rest of the query points at this product.
    score = TIER.BRAND_PARTIAL + Math.round(coverage * 50);
    matchReason = parsed.type ? 'brand_prefix_type' : 'brand_partial';
  } else if (typeMatched) {
    // Right family, no brand named. Broad terms score lower so a generic word
    // cannot outrank a specific result.
    score = parsed.type?.weak ? TIER.SYNONYM - 150 : TIER.SYNONYM;
    matchReason = 'synonym';
    if (coverage < 1) score -= Math.round((1 - coverage) * 100);
  } else if (brandMatched) {
    // Brand named but nothing else lines up — keep it, ranked low.
    score = TIER.FUZZY - 100;
    matchReason = 'brand_partial';
  }

  // Run-together input matched against the product's own joined form.
  if (score < TIER.BRAND_PARTIAL && qJoined.length >= 6) {
    if (idx.fullJoined.includes(qJoined) || qJoined.includes(idx.nameJoined)) {
      score = Math.max(score, brandMatched ? TIER.BRAND_PARTIAL : TIER.SYNONYM);
      matchReason = matchReason || 'joined';
    }
  }

  // Typo tolerance against brand and name tokens.
  //
  // A fuzzy hit on a single token of a longer query is not enough — that is how
  // "Zzzz Labs Recovery" ends up matching "Makeup Remover". Require the fuzzy
  // match to account for a real share of what the user typed.
  if (score < TIER.FUZZY) {
    let typoHits = 0;
    for (const token of parsed.tokens) {
      if (token.length < 4) continue;
      if (
        fuzzyClose(token, idx.brandJoined) ||
        idx.nameTokens.some((nt) => fuzzyClose(token, nt))
      ) {
        typoHits += 1;
      }
    }
    // Count only tokens long enough to be fuzzy-matched at all, so that
    // "make up wipes" and "makeup wipes" face the same threshold.
    const significantTokens = parsed.tokens.filter((t) => t.length >= 4).length;
    const requiredHits = Math.max(1, Math.ceil(significantTokens / 2));
    if (typoHits >= requiredHits) {
      score = Math.max(score, TIER.FUZZY - 100 + typoHits * 40);
      matchReason = matchReason || 'typo';
    }
  }

  if (score <= 0) return null;

  // Small tie-breakers: prefer records with an image and with real provenance,
  // so an equally-relevant richer record surfaces first. Never large enough to
  // reorder tiers.
  if (product.imageUrl) score += 2;
  if (product.provenance === 'provider') score += 1;

  return { product, score, matchReason: matchReason || 'token_overlap' };
}

export function rankProducts(queryNormalized: string, products: Product[]): RankedProduct[] {
  if (!queryNormalized) return [];
  const parsed = parseQuery(queryNormalized, products);

  const ranked: RankedProduct[] = [];
  for (const product of products) {
    const result = scoreProduct(parsed, product);
    if (result) ranked.push(result);
  }

  return ranked.sort(
    (a, b) =>
      b.score - a.score ||
      a.product.brand.localeCompare(b.product.brand) ||
      a.product.name.localeCompare(b.product.name),
  );
}

export { levenshtein, fuzzyClose, parseQuery };
