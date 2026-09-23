import type { Product, ProductCategory, ProductType, WhenToUse } from '../types/product';

/**
 * Routine classification.
 *
 * Product type ("moisturizer") is deliberately separate from routine step
 * ("Seal"). This module maps one to the other so Dewy can *suggest* a starting
 * point. Everything it returns is a suggestion the user can change.
 *
 * This is not a safety or compatibility engine. It makes no claim about
 * ingredients, interactions, irritation, or whether two products may be used
 * together.
 */

export type SuggestionConfidence = 'high' | 'medium' | 'low';

export interface RoutineSuggestion {
  category: ProductCategory | null;
  whenToUse: WhenToUse | null;
  confidence: SuggestionConfidence;
  /** Plain-language reason shown to the user, never a medical claim */
  rationale: string;
  /** True when Dewy should ask rather than assume */
  needsConfirmation: boolean;
}

interface TypeRule {
  category: ProductCategory;
  whenToUse: WhenToUse;
  confidence: SuggestionConfidence;
}

/**
 * Maintainable mapping table. Confidence reflects how reliably the product type
 * alone determines the routine step.
 */
const TYPE_RULES: Partial<Record<ProductType, TypeRule>> = {
  cleanser: { category: 'Cleanse', whenToUse: 'Both', confidence: 'high' },
  makeup_wipes: { category: 'Cleanse', whenToUse: 'Evening', confidence: 'high' },
  makeup_remover: { category: 'Cleanse', whenToUse: 'Evening', confidence: 'high' },

  toner: { category: 'Treat', whenToUse: 'Both', confidence: 'medium' },
  essence: { category: 'Treat', whenToUse: 'Both', confidence: 'medium' },
  vitamin_c_serum: { category: 'Treat', whenToUse: 'Morning', confidence: 'medium' },
  hydrating_serum: { category: 'Treat', whenToUse: 'Both', confidence: 'medium' },
  retinol_treatment: { category: 'Treat', whenToUse: 'Evening', confidence: 'medium' },
  acne_treatment: { category: 'Treat', whenToUse: 'Evening', confidence: 'low' },
  exfoliant: { category: 'Treat', whenToUse: 'Evening', confidence: 'low' },
  mask: { category: 'Treat', whenToUse: 'Evening', confidence: 'low' },
  lash_serum: { category: 'Treat', whenToUse: 'Evening', confidence: 'medium' },
  brow_serum: { category: 'Treat', whenToUse: 'Evening', confidence: 'medium' },
  scalp_treatment: { category: 'Treat', whenToUse: 'Evening', confidence: 'low' },
  eye_cream: { category: 'Treat', whenToUse: 'Both', confidence: 'medium' },

  moisturizer: { category: 'Seal', whenToUse: 'Both', confidence: 'high' },
  facial_oil: { category: 'Seal', whenToUse: 'Evening', confidence: 'medium' },
  lip_mask: { category: 'Seal', whenToUse: 'Evening', confidence: 'medium' },
  lip_balm: { category: 'Seal', whenToUse: 'Both', confidence: 'medium' },
  body_care: { category: 'Seal', whenToUse: 'Both', confidence: 'low' },

  sunscreen: { category: 'Protect', whenToUse: 'Morning', confidence: 'high' },

  primer: { category: 'Finish', whenToUse: 'Morning', confidence: 'medium' },
  setting_spray: { category: 'Finish', whenToUse: 'Morning', confidence: 'medium' },
  foundation: { category: 'Finish', whenToUse: 'Morning', confidence: 'medium' },
  concealer: { category: 'Finish', whenToUse: 'Morning', confidence: 'medium' },
  mascara: { category: 'Finish', whenToUse: 'Morning', confidence: 'medium' },
  lip_color: { category: 'Finish', whenToUse: 'Morning', confidence: 'medium' },
  mist: { category: 'Finish', whenToUse: 'Both', confidence: 'low' },

  beauty_tool: { category: 'Treat', whenToUse: 'Evening', confidence: 'low' },
};

const RATIONALE: Record<ProductCategory, string> = {
  Cleanse: 'Products like this usually start a routine.',
  Treat: 'Products like this usually sit between cleansing and moisturizing.',
  Seal: 'Products like this usually come near the end of a routine.',
  Finish: 'Products like this usually go on last.',
  Protect: 'Sunscreen is usually the final morning step.',
};

/**
 * Suggest a routine step and time of day for a product.
 *
 * A product record that already carries its own categories wins over the type
 * table — we never override known data with a guess. When the product type is
 * unknown, Dewy asks instead of pretending certainty.
 */
export function suggestRoutine(product: Product): RoutineSuggestion {
  // Prefer data already on the record.
  const recordCategory = product.categories?.[0] ?? null;
  const recordWhen = product.whenToUse ?? null;
  const rule = TYPE_RULES[product.type];

  if (recordCategory && recordWhen) {
    return {
      category: recordCategory,
      whenToUse: recordWhen,
      confidence: rule?.confidence ?? 'medium',
      rationale: RATIONALE[recordCategory],
      needsConfirmation: (rule?.confidence ?? 'medium') === 'low',
    };
  }

  if (rule) {
    return {
      category: rule.category,
      whenToUse: rule.whenToUse,
      confidence: rule.confidence,
      rationale: RATIONALE[rule.category],
      needsConfirmation: rule.confidence === 'low',
    };
  }

  // Unknown type. Ask rather than guess from the name alone.
  return {
    category: recordCategory,
    whenToUse: recordWhen,
    confidence: 'low',
    rationale: 'Dewy is not sure where this belongs. Choose what fits your routine.',
    needsConfirmation: true,
  };
}

export { TYPE_RULES };
