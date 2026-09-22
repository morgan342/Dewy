import type { NormalizedQuery } from '../types/product';

/**
 * Strip diacritics for matching while callers keep original display text.
 */
export function stripDiacritics(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalize punctuation/hyphens to spaces for matching.
 */
function normalizePunctuation(input: string): string {
  return input
    .replace(/[''`´]/g, '')
    .replace(/[_\-–—/\\.,;:!?()[\]{}]+/g, ' ')
    .replace(/&/g, ' and ');
}

/**
 * Collapse whitespace and lowercase for matching.
 * Preserves original on NormalizedQuery.original.
 */
export function normalizeForMatch(input: string): string {
  return stripDiacritics(normalizePunctuation(input))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split into tokens; also emit a joined form helper for ceravecleanser-style queries.
 */
export function tokenize(normalized: string): string[] {
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
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
