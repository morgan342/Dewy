import type { NormalizedQuery } from '../types/product';

/**
 * Query normalization.
 *
 * The user's original text is always preserved on `original` for display,
 * analytics and debugging. Everything else here produces a separate matching
 * form and must never be written back into a stored product name.
 */

/** Strip diacritics for matching while callers keep original display text. */
export function stripDiacritics(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Normalize punctuation and hyphens to spaces for matching. */
function normalizePunctuation(input: string): string {
  return input
    .replace(/['’'`´]/g, '')
    .replace(/[_\-–—/\\.,;:!?()[\]{}"«»]+/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' ');
}

/** Collapse whitespace and lowercase for matching. */
export function normalizeForMatch(input: string): string {
  return stripDiacritics(normalizePunctuation(input))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Conservative singularization so "wipes" matches "wipe" and "cloths" matches
 * "cloth". Deliberately small — this is not a general English stemmer.
 */
export function singularize(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('ses') || token.endsWith('xes') || token.endsWith('zes')) {
    return token.slice(0, -2);
  }
  if (token.endsWith('s') && !token.endsWith('ss') && !token.endsWith('us')) {
    return token.slice(0, -1);
  }
  return token;
}

/** Both the token and its singular form, de-duplicated. */
export function tokenVariants(token: string): string[] {
  const singular = singularize(token);
  return singular === token ? [token] : [token, singular];
}

export function tokenize(normalized: string): string[] {
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
}

/** Whitespace-free form, for "ceravecleanser" style input. */
export function joinedForm(normalized: string): string {
  return normalized.replace(/\s+/g, '');
}

export function normalizeQuery(raw: string): NormalizedQuery {
  const original = raw;
  const normalized = normalizeForMatch(raw);
  const tokens = tokenize(normalized);
  return { original, normalized, tokens };
}

export function isEmptyQuery(query: NormalizedQuery): boolean {
  return query.normalized.length === 0;
}
