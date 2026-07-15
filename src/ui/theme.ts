/**
 * Coptic Daily Companion design tokens — the source of truth for the "codex" visual language.
 *
 * Two on-brand palettes (dark oxford-ink and warm-parchment light) share the
 * same gold / vermilion / feast accents; only the surfaces and inks invert.
 * Colours are consumed through the theme store (`src/state/theme.ts`) +
 * `useStyles`/`useThemeColors` (`src/ui/useStyles.ts`) so a runtime switch
 * restyles the whole app. `K` is kept as a back-compat alias = the dark palette.
 *
 * Hard rules (CLAUDE.md §4): never inline hex in screens (use palette tokens);
 * sharp corners everywhere (`radius.none`); no emoji; no system-default UI.
 *
 * This file is UI-token data only — intentionally free of any react/react-native
 * import so it can be referenced from anywhere (including the store + module scope).
 */

/** The four user-pickable highlight colours (see `HighlightColor` in @domain/highlights). */
export interface HighlightSwatch {
  readonly gold: string;
  readonly rubric: string;
  readonly sky: string;
  readonly sage: string;
}

/** A complete colour theme. Layout tokens (font/space/radius) are NOT themed. */
export interface Palette {
  readonly bg: string;
  readonly bg2: string;
  readonly panel: string;
  readonly gold: string;
  readonly goldHi: string;
  readonly rubric: string;
  readonly rubricHi: string;
  readonly feast: string;
  /** Primary text colour (the parchment ink). */
  readonly parch: string;
  readonly ink2: string;
  readonly ink3: string;
  readonly rule: string;
  readonly ruleDim: string;
  /** Solid-button text on a gold fill. */
  readonly onGold: string;
  readonly selWashLo: string;
  readonly selWashHi: string;
  /** Solid swatch / underline per highlight colour. */
  readonly highlightInk: HighlightSwatch;
  /** Translucent background laid behind highlighted text. */
  readonly highlightWash: HighlightSwatch;
  /** Top-of-page vignette, as a fading stack of band colours. */
  readonly vignetteBands: readonly string[];
  /** Status-bar content style for this theme. */
  readonly barStyle: 'light' | 'dark';
}

/** A fading band stack (top → transparent) for the page vignette. */
function vignette(r: number, g: number, b: number, max: number): string[] {
  return Array.from({ length: 11 }, (_, i) => `rgba(${r},${g},${b},${(max * (1 - i / 11)).toFixed(3)})`);
}

/** Dark — oxford ink. The original codex (DESIGN-SPEC.md §2). */
export const darkPalette: Palette = {
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
  onGold: '#1A1303',
  selWashLo: 'rgba(201,168,74,0.05)',
  selWashHi: 'rgba(201,168,74,0.12)',
  highlightInk: { gold: '#C9A84A', rubric: '#B8453A', sky: '#6FA8C7', sage: '#7FBF9A' },
  highlightWash: {
    gold: 'rgba(201,168,74,0.18)',
    rubric: 'rgba(184,69,58,0.18)',
    sky: 'rgba(111,168,199,0.18)',
    sage: 'rgba(127,191,154,0.16)',
  },
  vignetteBands: vignette(201, 168, 74, 0.05),
  barStyle: 'light',
};

/** Light — warm parchment. Same accents on cream paper with oxford-ink text. */
export const lightPalette: Palette = {
  bg: '#F4EEE0', // warm cream paper
  bg2: '#EDE5D3', // faintly deeper sheet
  panel: 'rgba(154,126,46,0.06)',
  gold: '#A8842F', // deepened gold — reads as text/hairline on cream, still the fill
  goldHi: '#846A1F', // richer/darker gold = emphasis on light
  rubric: '#A8392E', // vermilion, deepened for cream contrast
  rubricHi: '#B8453A',
  feast: '#3E7D5B', // deepened feast green
  parch: '#241C0D', // oxford-ink text on parchment
  ink2: '#5A5142', // secondary ink
  ink3: '#8A8270', // dim ink
  rule: 'rgba(154,126,46,0.30)', // gold hairline on cream
  ruleDim: 'rgba(26,19,3,0.12)', // structural ink hairline
  onGold: '#1A1303',
  selWashLo: 'rgba(154,126,46,0.06)',
  selWashHi: 'rgba(154,126,46,0.14)',
  highlightInk: { gold: '#A8842F', rubric: '#A8392E', sky: '#3E72A0', sage: '#3E7D5B' },
  highlightWash: {
    gold: 'rgba(168,132,47,0.20)',
    rubric: 'rgba(168,57,46,0.16)',
    sky: 'rgba(62,114,160,0.16)',
    sage: 'rgba(62,125,91,0.16)',
  },
  vignetteBands: vignette(154, 126, 46, 0.035),
  barStyle: 'dark',
};

/**
 * Back-compat default palette (= dark). Any module not yet converted to the
 * theme hook keeps compiling and renders dark. New code should read the palette
 * via `useThemeColors()` / `useStyles()` instead.
 */
export const K = darkPalette;

/** Standalone highlight maps (dark) — kept for any unconverted consumer. */
export const highlightInk = darkPalette.highlightInk;
export const highlightWash = darkPalette.highlightWash;

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
  /** Noto Sans Coptic — accurate Coptic letterforms (bundled in app/_layout). */
  coptic: 'NotoSansCoptic_400Regular',
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
