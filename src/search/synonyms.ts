/**
 * Controlled beauty-domain alias and synonym system.
 *
 * This is a *matching* vocabulary only. It never invents an ingredient list,
 * never asserts what is in a formula, and never makes a safety claim. When an
 * ingredient word such as "hyaluronic" appears here it maps the user's search
 * language to a product-type family — it does not state that any product
 * actually contains that ingredient.
 */

import type { ProductType } from '../types/product';

/**
 * Each group's first entry is the canonical term. Every other entry is an
 * accepted way a real user might type it.
 */
const SYNONYM_GROUPS: string[][] = [
  // Moisturizers
  [
    'moisturizer',
    'moisturiser',
    'moisturizing cream',
    'hydrator',
    'face cream',
    'skin cream',
    'facial cream',
    'day cream',
    'night cream',
    'cream',
    'lotion',
    'emulsion',
  ],
  // Cleansers
  [
    'cleanser',
    'face wash',
    'facial cleanser',
    'facewash',
    'cleansing gel',
    'cleansing balm',
    'cleansing cream',
    'cleansing oil',
    'foaming cleanser',
    'gel cleanser',
    'wash',
  ],
  // Makeup removal — liquids and balms
  [
    'makeup remover',
    'make up remover',
    'make-up remover',
    'cleansing remover',
    'micellar water',
    'micellar',
    'eye makeup remover',
    'makeup dissolver',
  ],
  // Makeup removal — wipes and cloths
  [
    'makeup wipes',
    'make up wipes',
    'makeup remover wipes',
    'remover wipes',
    'cleansing wipes',
    'cleansing cloths',
    'face wipes',
    'facial wipes',
    'cleansing towelettes',
    'towelettes',
    'makeup towelettes',
  ],
  // Lash and brow
  [
    'lash serum',
    'eyelash serum',
    'eyelash growth serum',
    'lash growth serum',
    'lash conditioning serum',
    'eyelash conditioner',
  ],
  ['brow serum', 'eyebrow serum', 'brow growth serum', 'eyebrow growth serum'],
  // Sun protection
  [
    'sunscreen',
    'spf',
    'sun screen',
    'sunblock',
    'sun block',
    'sun cream',
    'suncream',
    'uv protection',
    'mineral sunscreen',
    'chemical sunscreen',
  ],
  // Vitamin C
  ['vitamin c serum', 'vitamin c', 'vit c', 'vitc', 'ascorbic acid', 'l ascorbic acid'],
  // Hydrating serum family
  [
    'hydrating serum',
    'hyaluronic acid',
    'hyaluronic',
    'hyaluronic serum',
    'ha serum',
    'sodium hyaluronate',
    'hydrating essence',
  ],
  // Retinoids
  [
    'retinol',
    'retinoid',
    'vitamin a',
    'retinol serum',
    'retinal',
    'retinyl',
    'retinol cream',
  ],
  // Acne
  [
    'acne treatment',
    'spot treatment',
    'blemish treatment',
    'pimple cream',
    'acne cream',
    'salicylic acid',
    'benzoyl peroxide',
    'bha',
    'pimple patch',
    'acne patch',
  ],
  // Exfoliants
  [
    'exfoliant',
    'exfoliator',
    'chemical exfoliant',
    'aha',
    'glycolic acid',
    'lactic acid',
    'peeling solution',
    'scrub',
    'face scrub',
  ],
  // Toner / essence
  ['toner', 'facial toner', 'tonic', 'astringent'],
  ['essence', 'facial essence', 'treatment essence'],
  // Mists
  ['mist', 'face mist', 'facial mist', 'setting mist', 'hydrating mist', 'rose water'],
  // Masks
  [
    'mask',
    'face mask',
    'facial mask',
    'sheet mask',
    'clay mask',
    'sleeping mask',
    'overnight mask',
    'mud mask',
  ],
  // Lip
  ['lip sleeping mask', 'lip mask', 'overnight lip mask', 'lip treatment'],
  ['lip balm', 'lip butter', 'chapstick', 'lip conditioner', 'lip salve'],
  ['lip color', 'lipstick', 'lip gloss', 'lip tint', 'lip stain', 'lip oil'],
  // Eye
  ['eye cream', 'eye gel', 'under eye cream', 'eye treatment', 'eye serum'],
  // Oils
  [
    'facial oil',
    'face oil',
    'beauty oil',
    'coconut oil',
    'jojoba oil',
    'rosehip oil',
    'argan oil',
    'squalane oil',
    'marula oil',
    'castor oil',
  ],
  // Makeup prep and set
  ['primer', 'face primer', 'makeup primer', 'base primer', 'pore primer'],
  ['setting spray', 'finishing spray', 'makeup setting spray', 'fixing spray'],
  // Complexion makeup
  ['foundation', 'base makeup', 'skin tint', 'bb cream', 'cc cream', 'tinted moisturizer'],
  ['concealer', 'under eye concealer', 'spot concealer', 'color corrector'],
  ['mascara', 'lash mascara', 'volumizing mascara', 'lengthening mascara'],
  // Scalp / hairline — can interact with facial skincare
  [
    'scalp treatment',
    'scalp serum',
    'hairline treatment',
    'scalp exfoliant',
    'dandruff treatment',
    'scalp oil',
  ],
  // Body
  ['body care', 'body lotion', 'body cream', 'body oil', 'body butter', 'hand cream'],
  // Tools
  [
    'beauty tool',
    'facial roller',
    'jade roller',
    'gua sha',
    'cleansing brush',
    'led mask',
    'facial steamer',
  ],
];

/**
 * Canonical term -> the product type family it indicates.
 * Used to bias ranking toward the right product family, never to assert facts.
 */
const CANONICAL_TO_TYPE: Record<string, ProductType> = {
  moisturizer: 'moisturizer',
  cleanser: 'cleanser',
  'makeup remover': 'makeup_remover',
  'makeup wipes': 'makeup_wipes',
  'lash serum': 'lash_serum',
  'brow serum': 'brow_serum',
  sunscreen: 'sunscreen',
  'vitamin c serum': 'vitamin_c_serum',
  'hydrating serum': 'hydrating_serum',
  retinol: 'retinol_treatment',
  'acne treatment': 'acne_treatment',
  exfoliant: 'exfoliant',
  toner: 'toner',
  essence: 'essence',
  mist: 'mist',
  mask: 'mask',
  'lip sleeping mask': 'lip_mask',
  'lip balm': 'lip_balm',
  'lip color': 'lip_color',
  'eye cream': 'eye_cream',
  'facial oil': 'facial_oil',
  primer: 'primer',
  'setting spray': 'setting_spray',
  foundation: 'foundation',
  concealer: 'concealer',
  mascara: 'mascara',
  'scalp treatment': 'scalp_treatment',
  'body care': 'body_care',
  'beauty tool': 'beauty_tool',
};

/** alias -> canonical term */
const ALIAS_TO_CANONICAL = new Map<string, string>();
for (const group of SYNONYM_GROUPS) {
  const canonical = group[0];
  for (const term of group) {
    // Longer, more specific aliases win when two groups share a term.
    if (!ALIAS_TO_CANONICAL.has(term)) {
      ALIAS_TO_CANONICAL.set(term, canonical);
    }
  }
}

/** All alias terms, longest first, so "lip sleeping mask" beats "mask". */
const ALIASES_BY_LENGTH = Array.from(ALIAS_TO_CANONICAL.keys()).sort(
  (a, b) => b.length - a.length,
);

/**
 * Terms that are too generic to be allowed to pull in a whole family on their
 * own. They still match, but only weakly, so a broad synonym cannot overwhelm
 * an exact result.
 */
const WEAK_TERMS = new Set(['cream', 'wash', 'gel', 'lotion', 'oil', 'mask', 'scrub', 'spray']);

export function isWeakTerm(term: string): boolean {
  return WEAK_TERMS.has(term);
}

export function canonicalFor(term: string): string | null {
  return ALIAS_TO_CANONICAL.get(term) ?? null;
}

export function typeForCanonical(canonical: string): ProductType | null {
  return CANONICAL_TO_TYPE[canonical] ?? null;
}

/**
 * Find the most specific alias present in a normalized query.
 * Returns the canonical term, the alias that matched, and the matched span.
 */
export function detectAlias(
  normalizedQuery: string,
): { canonical: string; alias: string; weak: boolean } | null {
  const q = normalizedQuery;
  const qJoined = q.replace(/\s+/g, '');

  for (const alias of ALIASES_BY_LENGTH) {
    if (q.includes(alias)) {
      return {
        canonical: ALIAS_TO_CANONICAL.get(alias)!,
        alias,
        weak: isWeakTerm(alias),
      };
    }
  }

  // Joined forms: "sunscreen" typed as "sun screen" is handled above, but
  // "sunscreen" typed as one word against a spaced alias is handled here.
  for (const alias of ALIASES_BY_LENGTH) {
    const aliasJoined = alias.replace(/\s+/g, '');
    if (aliasJoined.length >= 4 && qJoined.includes(aliasJoined)) {
      return {
        canonical: ALIAS_TO_CANONICAL.get(alias)!,
        alias,
        weak: isWeakTerm(alias),
      };
    }
  }

  return null;
}

/**
 * Expand a normalized query into controlled alternative matching forms.
 * Expansion is bounded — it never returns the entire vocabulary.
 */
export function expandSynonyms(normalizedQuery: string): string[] {
  const expansions = new Set<string>([normalizedQuery]);
  const detected = detectAlias(normalizedQuery);

  if (detected) {
    expansions.add(detected.canonical);
    expansions.add(normalizedQuery.replace(detected.alias, detected.canonical));
    const group = SYNONYM_GROUPS.find((g) => g[0] === detected.canonical) ?? [];
    for (const term of group) expansions.add(term);
  }

  return Array.from(expansions);
}

/** Canonical product-type term implied by a query, if any. */
export function canonicalTypeForQuery(normalizedQuery: string): string | null {
  return detectAlias(normalizedQuery)?.canonical ?? null;
}

/** Product type family implied by a query, if any. */
export function productTypeForQuery(normalizedQuery: string): ProductType | null {
  const canonical = canonicalTypeForQuery(normalizedQuery);
  return canonical ? typeForCanonical(canonical) : null;
}

export { SYNONYM_GROUPS, ALIAS_TO_CANONICAL, ALIASES_BY_LENGTH, CANONICAL_TO_TYPE };
