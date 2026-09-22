import type { Product, RankedProduct } from '../types/product';
import { normalizeForMatch } from './normalizeQuery';
import { expandSynonyms, canonicalTypeForQuery } from './synonyms';

/** Simple Levenshtein for typo tolerance on short strings */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

function fuzzyClose(a: string, b: string): boolean {
  if (!a || !b) return false;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 4) return dist <= 1;
  if (maxLen <= 8) return dist <= 2;
  return dist <= 3;
}

function productSearchBlob(product: Product): {
  brand: string;
  name: string;
  typeLabel: string;
  full: string;
  joined: string;
} {
  const brand = normalizeForMatch(product.brand);
  const name = normalizeForMatch(product.name);
  const typeLabel = normalizeForMatch(product.typeLabel);
  const full = `${brand} ${name} ${typeLabel}`.trim();
  const joined = full.replace(/\s+/g, '');
  return { brand, name, typeLabel, full, joined };
}

/**
 * Deterministic ranking (Prompt 3 priority):
 * 1. Exact brand + exact product name
 * 2. Exact brand + exact product type
 * 3. Exact product name
 * 4. Brand + prefix/partial
 * 5. Controlled alias/synonym
 * 6. Typo-tolerant
 */
export function scoreProduct(queryNormalized: string, product: Product): RankedProduct | null {
  if (!queryNormalized) return null;

  const q = queryNormalized;
  const qJoined = q.replace(/\s+/g, '');
  const expansions = expandSynonyms(q);
  const typeHint = canonicalTypeForQuery(q);
  const p = productSearchBlob(product);

  let score = 0;
  let matchReason = '';

  const brandExact = q.includes(p.brand) || qJoined.includes(p.brand.replace(/\s+/g, ''));
  const nameExact = q === p.name || q.includes(p.name);
  const typeExact =
    q.includes(p.typeLabel) ||
    (typeHint !== null &&
      (p.typeLabel.includes(typeHint) || typeHint.includes(p.typeLabel.split(' ')[0])));

  // 1. Exact brand + exact product name
  if (brandExact && nameExact) {
    score = 1000;
    matchReason = 'exact_brand_and_name';
  }
  // 2. Exact brand + exact product type
  else if (brandExact && typeExact) {
    score = 900;
    matchReason = 'exact_brand_and_type';
  }
  // 3. Exact product name
  else if (nameExact || q === p.full) {
    score = 800;
    matchReason = 'exact_name';
  }
  // 4. Brand + prefix / partial
  else if (
    brandExact &&
    (p.name.startsWith(q.replace(p.brand, '').trim()) ||
      p.name.includes(q.replace(p.brand, '').trim()) ||
      qJoined.includes(p.joined.slice(0, Math.min(qJoined.length, p.joined.length))) ||
      p.joined.includes(qJoined))
  ) {
    score = 700;
    matchReason = 'brand_partial';
  } else if (brandExact && qJoined.includes(p.brand.replace(/\s+/g, ''))) {
    // brand present with some leftover tokens that partially hit name/type
    const rest = q.replace(p.brand, '').trim();
    if (!rest || p.name.includes(rest) || p.typeLabel.includes(rest) || fuzzyClose(rest, p.name.split(' ')[0] ?? '')) {
      score = 680;
      matchReason = 'brand_partial';
    }
  }

  // 5. Synonym / alias
  if (score < 600) {
    for (const exp of expansions) {
      if (
        p.typeLabel.includes(exp) ||
        exp.includes(p.typeLabel) ||
        p.full.includes(exp) ||
        p.joined.includes(exp.replace(/\s+/g, ''))
      ) {
        const synonymScore = brandExact ? 650 : 550;
        if (synonymScore > score) {
          score = synonymScore;
          matchReason = 'synonym';
        }
        break;
      }
    }
  }

  // Joined forms (ceravecleanser)
  if (score < 500 && (p.joined.includes(qJoined) || qJoined.includes(p.joined) || qJoined.includes((p.brand + p.typeLabel).replace(/\s+/g, '')))) {
    score = Math.max(score, brandExact ? 720 : 520);
    matchReason = matchReason || 'joined';
  }

  // 6. Typo-tolerant
  if (score < 400) {
    const qTokens = q.split(' ').filter(Boolean);
    const nameTokens = p.name.split(' ').filter(Boolean);
    let typoHits = 0;
    for (const qt of qTokens) {
      if (fuzzyClose(qt, p.brand) || nameTokens.some((nt) => fuzzyClose(qt, nt)) || fuzzyClose(qt, p.typeLabel)) {
        typoHits += 1;
      }
      // moisturizer / moisterizer
      if (fuzzyClose(qt, 'moisturizer') && p.typeLabel.includes('moistur')) typoHits += 1;
    }
    if (typoHits > 0) {
      score = Math.max(score, 300 + typoHits * 50 + (brandExact ? 100 : 0));
      matchReason = matchReason || 'typo';
    }
  }

  // Special: "dio moist" style prefix brand + type fragment
  if (score < 700) {
    const qTokens = q.split(' ').filter(Boolean);
    if (qTokens.length >= 1) {
      const brandPrefix = p.brand.startsWith(qTokens[0]) || fuzzyClose(qTokens[0], p.brand.slice(0, Math.max(3, qTokens[0].length)));
      const typeFrag = qTokens.slice(1).join(' ');
      if (
        brandPrefix &&
        typeFrag &&
        (p.typeLabel.includes(typeFrag) ||
          p.name.includes(typeFrag) ||
          fuzzyClose(typeFrag, 'moist') ||
          p.typeLabel.startsWith(typeFrag) ||
          'moisturizer'.startsWith(typeFrag))
      ) {
        if (p.typeLabel.includes('moistur') || p.name.includes('moist') || typeFrag.length >= 3) {
          score = Math.max(score, 750);
          matchReason = 'brand_prefix_type';
        }
      }
    }
  }

  if (score <= 0) return null;
  return { product, score, matchReason };
}

export function rankProducts(queryNormalized: string, products: Product[]): RankedProduct[] {
  const ranked: RankedProduct[] = [];
  for (const product of products) {
    const result = scoreProduct(queryNormalized, product);
    if (result) ranked.push(result);
  }
  return ranked.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
}
