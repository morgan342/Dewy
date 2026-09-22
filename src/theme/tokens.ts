/**
 * Dewy design tokens — full DUEY Color System.csv
 * Soft, feminine, elevated, calm, editorial. Never clinical or generic SaaS.
 * Craft bar: Oura-level restraint and clarity — Dewy palette and voice, not Oura cosplay.
 * See docs/DESIGN_CRAFT_BLUEPRINT.md
 */

export const colors = {
  /** Powder Blue — deliberate branded fields: icon, morning, launch, shelf (not everywhere) */
  powderBlue: '#A5BDE1',
  /** Porcelain Ivory — primary app surface / calm canvas */
  porcelainIvory: '#F7F6D7',
  /** Buttermilk — step numbers, helpful cues, morning light, small highlights */
  buttermilk: '#FFF1B5',
  /** Dried Plum — core ink, wordmark, type, navigation, structure */
  driedPlum: '#6E1E3B',
  /** Cherry Licorice — rare “lipstick” action: start, next, completion, saved */
  cherryLicorice: '#A10808',
  /** Milkshake Pink — skin notes, memory, personal states (not general decoration) */
  milkshakePink: '#EDCCCC',
  /** Old Burgundy — night mode, completion, depth, intimate editorial */
  oldBurgundy: '#43302E',
  /** Olive Note — rare seasonal / category interruption */
  oliveNote: '#B9B560',
  /** Soft Silver — tiny hardware, dividers, mirror-edge (never metallic gradient) */
  softSilver: '#C8C5C1',
  /** Field fill — nested cream inside porcelain */
  fieldFill: '#FBF9E8',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  label: {
    fontSize: 15,
    fontWeight: '500' as const,
    letterSpacing: 0.4,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  link: {
    fontSize: 15,
    fontWeight: '400' as const,
    textDecorationLine: 'underline' as const,
  },
  cta: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  screen: {
    background: colors.porcelainIvory,
    ink: colors.driedPlum,
    border: colors.driedPlum,
    divider: colors.softSilver,
    fieldBackground: colors.fieldFill,
    primaryAction: colors.cherryLicorice,
    cue: colors.buttermilk,
    note: colors.milkshakePink,
    morning: colors.powderBlue,
    night: colors.oldBurgundy,
    seasonal: colors.oliveNote,
  },
} as const;

export type Theme = typeof theme;
