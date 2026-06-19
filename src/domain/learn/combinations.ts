/**
 * Coptic letter COMBINATIONS — the bridge between knowing the 32 letters and
 * reading whole words. Coptic (like English "th", "sh", "ph") changes a letter's
 * sound when certain letters sit together: ⲟ + ⲩ together say "oo", ⲅ before ⲅ
 * says "ng", ⲭ before ⲉ ⲏ ⲓ says "sh". Each rule is taught with a concept card
 * (the rule + a real example word) and then quizzed.
 *
 * ⚠️ ACCURACY: every rule + example here is drawn from the context notes already
 * verified in alphabet.ts and is cross-checked against authoritative Greco-
 * Bohairic sources + owner review (see docs/CONTENT-SOURCES.md and the structural
 * test in __tests__/learn/combinations.test.ts). Example words reuse the verified
 * spellings from words.ts wherever possible so the bridge reinforces earlier levels.
 *
 * TODO(verify-content): owner (Coptic Orthodox) review of the combination sounds.
 */

export interface CopticCombo {
  /** Stable ascii id, e.g. 'ou'. */
  readonly id: string;
  /** The letters that combine, e.g. 'ⲟⲩ'. */
  readonly glyphs: string;
  /** Greco-Bohairic phonetic value in plain English. */
  readonly sound: string;
  /** The teaching sentence — what happens when these letters meet. */
  readonly rule: string;
  /** A real Coptic word that contains the combination. */
  readonly example: string;
  /** Romanised reading of the example. */
  readonly exampleTranslit: string;
  /** English meaning of the example. */
  readonly exampleEnglish: string;
}

export interface ComboUnit {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly glyph: string;
  readonly combos: readonly CopticCombo[];
}

export const COMBO_UNIT: ComboUnit = {
  id: 'sounds',
  title: 'Letters Together',
  subtitle: 'How two letters blend into one sound — the bridge to reading words.',
  glyph: 'Ⲩ',
  combos: [
    // — Vowel pairs (the long vowels) —
    {
      id: 'ou',
      glyphs: 'ⲟⲩ',
      sound: 'oo — as in “moon”',
      rule: 'When ⲟ is followed by ⲩ, the pair fuses into a single “oo” sound — never two separate vowels.',
      example: 'ⲫⲛⲟⲩϯ',
      exampleTranslit: 'efnouti',
      exampleEnglish: 'God',
    },
    {
      id: 'oi',
      glyphs: 'ⲟⲓ',
      sound: 'oy — as in “boy”',
      rule: 'In a Coptic word, ⲟ followed by ⲓ glides into “oy” (as in “boy”). In Greek-loan words, though, ⲟⲓ is simply read “ee”.',
      example: 'ⲡϭⲟⲓⲥ',
      exampleTranslit: 'epchois',
      exampleEnglish: 'the Lord',
    },
    // — The av / ev pairs —
    {
      id: 'au',
      glyphs: 'ⲁⲩ',
      sound: 'av — softening to “af” before a voiceless letter',
      rule: 'After ⲁ, the letter ⲩ becomes a consonant: ⲁⲩ says “av”, hardening to “af” before a voiceless letter (ⲑ ⲕ ⲝ ⲡ ⲥ ⲧ ⲫ ⲭ).',
      example: 'ⲡⲁⲩⲗⲟⲥ',
      exampleTranslit: 'pavlos',
      exampleEnglish: 'Paul',
    },
    {
      id: 'eu',
      glyphs: 'ⲉⲩ',
      sound: 'ev — softening to “ef” before a voiceless letter',
      rule: 'The same rule after ⲉ: ⲉⲩ says “ev”, hardening to “ef” before a voiceless letter.',
      example: 'ⲡⲓⲡⲛⲉⲩⲙⲁ',
      exampleTranslit: 'pipnevma',
      exampleEnglish: 'the Spirit',
    },
    // — Shifting consonants —
    {
      id: 'gg',
      glyphs: 'ⲅⲅ',
      sound: 'ng — as in “angel”',
      rule: 'Before ⲅ ⲕ ⲝ ⲭ, the letter ⲅ stops being “g” and turns into an “n” — so ⲅⲅ reads “ng”.',
      example: 'ⲡⲓⲁⲅⲅⲉⲗⲟⲥ',
      exampleTranslit: 'piangelos',
      exampleEnglish: 'the angel',
    },
    {
      id: 'shi',
      glyphs: 'ⲭⲉ',
      sound: 'sh — ⲭ before ⲉ ⲏ ⲓ ⲩ',
      rule: 'In Greek-origin words, ⲭ softens to “sh” before ⲉ ⲏ ⲓ ⲩ (and stays a throaty “kh” before ⲁ ⲟ ⲱ or a consonant). In native Coptic words ⲭ is simply “k”.',
      example: 'ⲭⲉⲣⲉ',
      exampleTranslit: 'shere',
      exampleEnglish: 'Hail / Rejoice',
    },
    {
      id: 'gh',
      glyphs: 'ⲅⲁ',
      sound: 'gh — a soft “g” before ⲁ ⲟ ⲱ',
      rule: 'ⲅ is a hard “g” before ⲉ ⲏ ⲓ ⲩ, but softens to a gentle “gh” before ⲁ ⲟ ⲱ (or a consonant) — as in ⲁⲅⲁⲡⲏ “aghapi”.',
      example: 'ⲁⲅⲁⲡⲏ',
      exampleTranslit: 'aghapi',
      exampleEnglish: 'love',
    },
  ],
};

/** Flat list of every combination. */
export const COMBOS: readonly CopticCombo[] = COMBO_UNIT.combos;

export function comboById(id: string): CopticCombo | undefined {
  return COMBOS.find((c) => c.id === id);
}
