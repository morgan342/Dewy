export type ProductCategory = 'Cleanse' | 'Treat' | 'Seal' | 'Finish' | 'Protect';

export type WhenToUse = 'Morning' | 'Evening' | 'Both';

export type ProductType =
  | 'moisturizer'
  | 'cleanser'
  | 'makeup_wipes'
  | 'lash_serum'
  | 'facial_oil'
  | 'sunscreen'
  | 'vitamin_c_serum'
  | 'lip_mask'
  | 'other';

/** Where the product record came from — never treat fixtures as verified live catalog */
export type ProductProvenance = 'fixture' | 'user_entered' | 'provider';

/** Honest ingredient availability — never invent lists */
export type IngredientStatus = 'complete' | 'partial' | 'unavailable' | 'unverified';

export interface Product {
  id: string;
  brand: string;
  name: string;
  type: ProductType;
  /** Optional short type label for search (cosmetic routine language only) */
  typeLabel: string;
  categories?: ProductCategory[];
  whenToUse?: WhenToUse;
  /** Development/test fixture marker (legacy); prefer provenance */
  isFixture?: boolean;
  provenance: ProductProvenance;
  ingredientStatus: IngredientStatus;
}

export interface NormalizedQuery {
  /** Original user input, preserved for display/debug */
  original: string;
  /** Normalized form used for matching */
  normalized: string;
  /** Tokens after synonym expansion */
  tokens: string[];
}

export interface RankedProduct {
  product: Product;
  score: number;
  matchReason: string;
}
