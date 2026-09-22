/**
 * Controlled beauty-domain aliases (Prompt 3).
 * Matching only — does not invent ingredient lists or medical claims.
 */

const SYNONYM_GROUPS: string[][] = [
  ['moisturizer', 'moisturiser', 'hydrator', 'face cream', 'skin cream', 'cream'],
  ['makeup remover', 'make up remover', 'make-up remover'],
  ['makeup wipes', 'make up wipes', 'remover wipes', 'cleansing wipes', 'cleansing cloths'],
  ['lash serum', 'eyelash serum', 'eyelash growth serum'],
  ['spf', 'sunscreen', 'sun screen', 'sunblock'],
  ['vitamin c', 'vit c', 'ascorbic acid'],
  ['hyaluronic acid', 'ha', 'sodium hyaluronate'],
  ['cleanser', 'face wash', 'cleansing gel', 'cleansing balm'],
  ['toner', 'essence', 'facial essence'],
  ['facial oil', 'face oil', 'beauty oil', 'coconut oil'],
  ['lip sleeping mask', 'lip mask', 'overnight lip mask'],
];

/** Map each alias → canonical key (first term in group) */
const ALIAS_TO_CANONICAL = new Map<string, string>();

for (const group of SYNONYM_GROUPS) {
  const canonical = group[0];
  for (const term of group) {
    ALIAS_TO_CANONICAL.set(term, canonical);
  }
}

export function expandSynonyms(normalizedQuery: string): string[] {
  const expansions = new Set<string>([normalizedQuery]);

  for (const [alias, canonical] of ALIAS_TO_CANONICAL) {
    if (normalizedQuery.includes(alias)) {
      expansions.add(normalizedQuery.replace(alias, canonical));
      expansions.add(canonical);
      const group = SYNONYM_GROUPS.find((g) => g[0] === canonical) ?? [];
      for (const term of group) {
        expansions.add(term);
      }
    }
  }

  // Also: if query tokens match a multi-word alias when joined
  const joined = normalizedQuery.replace(/\s+/g, '');
  for (const [alias] of ALIAS_TO_CANONICAL) {
    const aliasJoined = alias.replace(/\s+/g, '');
    if (joined.includes(aliasJoined) || aliasJoined.includes(joined)) {
      const canonical = ALIAS_TO_CANONICAL.get(alias)!;
      expansions.add(canonical);
    }
  }

  return Array.from(expansions);
}

export function canonicalTypeForQuery(normalizedQuery: string): string | null {
  for (const [alias, canonical] of ALIAS_TO_CANONICAL) {
    if (
      normalizedQuery.includes(alias) ||
      normalizedQuery.replace(/\s+/g, '') === alias.replace(/\s+/g, '')
    ) {
      return canonical;
    }
  }
  return null;
}

export { SYNONYM_GROUPS, ALIAS_TO_CANONICAL };
