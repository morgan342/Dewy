export type ProductCategory = 'Cleanse' | 'Treat' | 'Seal' | 'Finish' | 'Protect';

export type WhenToUse = 'Morning' | 'Evening' | 'Both';

/**
 * Product type is the *what it is* label. It is deliberately separate from
 * ProductCategory, which is the *where it goes in a routine* step.
 * Inclusive of conventional and unconventional beauty products.
 */
export type ProductType =
  | 'moisturizer'
  | 'cleanser'
  | 'makeup_wipes'
  | 'makeup_remover'
  | 'lash_serum'
  | 'brow_serum'
  | 'facial_oil'
  | 'sunscreen'
  | 'vitamin_c_serum'
  | 'hydrating_serum'
  | 'retinol_treatment'
  | 'acne_treatment'
  | 'exfoliant'
  | 'toner'
  | 'essence'
  | 'mist'
  | 'mask'
  | 'lip_mask'
  | 'lip_balm'
  | 'lip_color'
  | 'eye_cream'
  | 'primer'
  | 'setting_spray'
  | 'foundation'
  | 'concealer'
  | 'mascara'
  | 'scalp_treatment'
  | 'body_care'
  | 'beauty_tool'
  | 'other';

/**
 * Where the record came from. Never treat fixtures or user entries as a
 * verified live catalog.
 */
export type ProductProvenance = 'fixture' | 'user_entered' | 'provider';

/**
 * Honest verification status. A product is NOT verified merely because it
 * appeared in a search result.
 */
export type VerificationStatus = 'unverified' | 'provider_reported' | 'manufacturer_verified';

/**
 * Honest ingredient availability. Missing data is never evidence that
 * ingredients are absent, and is never filled in by inference.
 */
export type IngredientStatus = 'complete' | 'partial' | 'unavailable' | 'unverified';

export interface Product {
  id: string;
  brand: string;
  name: string;
  type: ProductType;
  /** Short type label used for matching (cosmetic routine language only) */
  typeLabel: string;
  /** Extra matching terms: nicknames, former names, common shorthand */
  aliases?: string[];
  categories?: ProductCategory[];
  whenToUse?: WhenToUse;

  /** Development/test fixture marker (legacy); prefer provenance */
  isFixture?: boolean;
  provenance: ProductProvenance;
  ingredientStatus: IngredientStatus;
  verificationStatus?: VerificationStatus;

  /** Provider provenance — populated only by a real adapter, never guessed */
  providerName?: string;
  providerProductId?: string;
  barcode?: string;

  /**
   * Size / variant text. Left undefined unless a source actually supplied it.
   * Never inferred from a product name.
   */
  sizeLabel?: string;
  imageUrl?: string;
  productUrl?: string;
  /** Market the record describes. Launch market is US only. */
  market?: string;

  /**
   * Original INCI text exactly as supplied by a source. Never generated.
   * Absent field means "we do not have it", not "there are none".
   */
  ingredientsRaw?: string;
  ingredientsNormalized?: string[];

  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt?: string;
}

export interface NormalizedQuery {
  /** Original user input, preserved verbatim for display, analytics and debugging */
  original: string;
  /** Normalized form used for matching only */
  normalized: string;
  /** Tokens of the normalized form */
  tokens: string[];
}

export type MatchReason =
  | 'exact_brand_and_name'
  | 'exact_brand_and_type'
  | 'exact_name'
  | 'brand_partial'
  | 'brand_prefix_type'
  | 'joined'
  | 'synonym'
  | 'typo'
  | 'token_overlap';

export interface RankedProduct {
  product: Product;
  score: number;
  matchReason: MatchReason | string;
}
