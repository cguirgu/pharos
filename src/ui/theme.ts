/**
 * Pharos design tokens — the single source of truth for the "codex" visual
 * language. Values transcribed verbatim from handoff/DESIGN-SPEC.md §2.
 *
 * Hard rules (CLAUDE.md §4): never inline hex in screens; sharp corners
 * everywhere (`radius.none`); no emoji; no system-default UI.
 *
 * This file is UI-token data only and is intentionally free of any
 * react/react-native import so it can be referenced from anywhere.
 */

/** Colour palette — "the codex". */
export const K = {
  bg: '#0C1020', // oxford ink — app background
  bg2: '#0E1426', // sheet background
  panel: 'rgba(201,168,74,0.04)',
  gold: '#C9A84A', // primary accent
  goldHi: '#E7CE84', // gold highlight (active text, big numerals)
  rubric: '#B8453A', // liturgical vermilion (fast banners)
  rubricHi: '#C56A56', // rubricated headers
  feast: '#7FBF9A', // feast accents
  parch: '#ECE4D2', // warm parchment — primary text
  ink2: '#B7AE96', // secondary text (warm taupe)
  ink3: '#7C745F', // dim text
  rule: 'rgba(201,168,74,0.22)', // ornamental gold hairline
  ruleDim: 'rgba(236,228,210,0.10)', // structural hairline
  /** Solid button text on gold. */
  onGold: '#1A1303',
  /** Selected-row wash range (DESIGN-SPEC §2). */
  selWashLo: 'rgba(201,168,74,0.05)',
  selWashHi: 'rgba(201,168,74,0.12)',
} as const;

/**
 * Exact loaded font-family names (each weight is a distinct family with custom
 * fonts in RN). These strings match the keys registered via `useFonts` in
 * `app/_layout.tsx` from the @expo-google-fonts packages.
 */
export const font = {
  /** Cormorant Garamond — display / headlines / numerals. */
  display: 'CormorantGaramond_600SemiBold',
  displayMed: 'CormorantGaramond_500Medium',
  displayBold: 'CormorantGaramond_700Bold',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  /** Spectral — body and ALL-CAPS labels. */
  body: 'Spectral_400Regular',
  bodyMed: 'Spectral_500Medium',
  caps: 'Spectral_600SemiBold',
  bodyItalic: 'Spectral_400Regular_Italic',
  /** Noto Sans Coptic ornament glyphs — falls back to display until bundled. */
  coptic: 'CormorantGaramond_600SemiBold',
} as const;

/** Sharp corners everywhere. */
export const radius = { none: 0 } as const;

/** Hairline weights. */
export const hairline = { thin: 1 } as const;

/** Page / component spacing. */
export const space = {
  page: 26, // Folio page padding
  register: 13, // Register vertical padding
  gap: 14, // Register gap
} as const;

export type Palette = typeof K;
