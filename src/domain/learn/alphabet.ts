/**
 * The Coptic (Bohairic) alphabet — 32 letters, in the traditional order, with
 * the **Greco-Bohairic** pronunciation (the standard taught and sung in the
 * Coptic Orthodox Church today).
 *
 * ⚠️ ACCURACY: letter forms, names, and phonetic values are structural
 * linguistic facts (like book names / chapter counts) — safe to encode — but
 * every value here is cross-checked against authoritative Coptic references and
 * reviewed by the owner before release. Context-dependent letters carry `notes`.
 * Pronunciations are described in plain English (no IPA) for learners.
 *
 * Codepoints: the 25 Greek-derived letters (incl. the numeral Soou) are the
 * dedicated Coptic block (U+2C80–U+2CB1); the 7 Demotic letters are the
 * widely-used Coptic letters in the Greek-and-Coptic block (U+03E2–U+03EF).
 *
 * TODO(verify-content): owner (Coptic Orthodox) review of names + sounds.
 */

export interface CopticLetter {
  /** Stable ascii id, e.g. 'alpha'. */
  readonly id: string;
  /** 1-based position in the traditional order (1–32). */
  readonly order: number;
  readonly upper: string;
  readonly lower: string;
  /** The letter's name, e.g. 'Alpha', 'Vida', 'Shai'. */
  readonly name: string;
  /** Romanisation used when transcribing the letter, e.g. 'a', 'v', 'sh'. */
  readonly translit: string;
  /** Greco-Bohairic phonetic value in plain English; '' for the numeral Soou. */
  readonly sound: string;
  /** Context-dependent pronunciation rules, when they apply. */
  readonly notes?: string;
  /** The 7 Demotic (Egyptian-derived) letters that follow the Greek ones. */
  readonly demotic?: boolean;
}

export const ALPHABET: readonly CopticLetter[] = [
  { id: 'alpha', order: 1, upper: 'Ⲁ', lower: 'ⲁ', name: 'Alpha', translit: 'a', sound: 'a — as in “father”' },
  { id: 'vida', order: 2, upper: 'Ⲃ', lower: 'ⲃ', name: 'Vida', translit: 'v', sound: 'v — as in “van”', notes: '“b” at the end of a syllable, after a consonant, and in some names.' },
  { id: 'gamma', order: 3, upper: 'Ⲅ', lower: 'ⲅ', name: 'Gamma', translit: 'g', sound: 'g — hard, as in “go”', notes: 'Hard “g” before ⲉ ⲏ ⲓ ⲩ; “n” before ⲅ ⲕ ⲝ ⲭ; a soft “gh” before ⲁ ⲟ ⲱ. (ⲁⲅⲓⲟⲥ “agheeos” is a sung exception.)' },
  { id: 'dalda', order: 4, upper: 'Ⲇ', lower: 'ⲇ', name: 'Dalda', translit: 'd', sound: 'd — as in “day”', notes: 'Found mainly in words of Greek origin; softer “dh” (as in “this”) in some of them.' },
  { id: 'ei', order: 5, upper: 'Ⲉ', lower: 'ⲉ', name: 'Ei', translit: 'e', sound: 'e — short, as in “pen”' },
  { id: 'soou', order: 6, upper: 'Ⲋ', lower: 'ⲋ', name: 'Soou', translit: '', sound: '', notes: 'A numeral only (value 6) — it has no sound and is not used to spell words.' },
  { id: 'zeta', order: 7, upper: 'Ⲍ', lower: 'ⲍ', name: 'Zeta', translit: 'z', sound: 'z — as in “zoo”' },
  { id: 'eta', order: 8, upper: 'Ⲏ', lower: 'ⲏ', name: 'Eta', translit: 'ē', sound: 'ee — as in “see”' },
  { id: 'thita', order: 9, upper: 'Ⲑ', lower: 'ⲑ', name: 'Thita', translit: 'th', sound: 'th — as in “thin”', notes: 'Sounds “t” after ⲥ and in a few Coptic words.' },
  { id: 'yota', order: 10, upper: 'Ⲓ', lower: 'ⲓ', name: 'Yota', translit: 'i', sound: 'ee — as in “see”; or “y” as in “yes”' },
  { id: 'kappa', order: 11, upper: 'Ⲕ', lower: 'ⲕ', name: 'Kappa', translit: 'k', sound: 'k — as in “key”' },
  { id: 'lavla', order: 12, upper: 'Ⲗ', lower: 'ⲗ', name: 'Lavla', translit: 'l', sound: 'l — as in “lamp”' },
  { id: 'mey', order: 13, upper: 'Ⲙ', lower: 'ⲙ', name: 'Mey', translit: 'm', sound: 'm — as in “man”' },
  { id: 'ney', order: 14, upper: 'Ⲛ', lower: 'ⲛ', name: 'Ney', translit: 'n', sound: 'n — as in “net”' },
  { id: 'eksi', order: 15, upper: 'Ⲝ', lower: 'ⲝ', name: 'Eksi', translit: 'x', sound: 'ks — as in “box”' },
  { id: 'o', order: 16, upper: 'Ⲟ', lower: 'ⲟ', name: 'O', translit: 'o', sound: 'o — short, as in “lot”' },
  { id: 'pi', order: 17, upper: 'Ⲡ', lower: 'ⲡ', name: 'Pi', translit: 'p', sound: 'p — as in “pen”' },
  { id: 'ro', order: 18, upper: 'Ⲣ', lower: 'ⲣ', name: 'Ro', translit: 'r', sound: 'r — rolled, as in Italian' },
  { id: 'sima', order: 19, upper: 'Ⲥ', lower: 'ⲥ', name: 'Sima', translit: 's', sound: 's — as in “sun”' },
  { id: 'tav', order: 20, upper: 'Ⲧ', lower: 'ⲧ', name: 'Tav', translit: 't', sound: 't — as in “top”' },
  // NB: "Epsilon" is the traditional Coptic Orthodox name for Greek upsilon Ⲩ
  // (printed verbatim on copticchurch.net's chart) — NOT a typo for letter 5 (Ⲉ
  // "Ei"). The academic name is "He"; the Church form is used here on purpose.
  { id: 'epsilon', order: 21, upper: 'Ⲩ', lower: 'ⲩ', name: 'Epsilon', translit: 'u', sound: 'ee — alone; part of diphthongs ⲁⲩ “av”, ⲉⲩ “ev”, ⲟⲩ “oo”', notes: 'The Coptic name for Greek upsilon (also written Ua / He). ⲁⲩ/ⲉⲩ soften to “af”/“ef” before a voiceless letter.' },
  { id: 'phi', order: 22, upper: 'Ⲫ', lower: 'ⲫ', name: 'Phi', translit: 'f', sound: 'f — as in “fan”' },
  { id: 'khi', order: 23, upper: 'Ⲭ', lower: 'ⲭ', name: 'Khi', translit: 'k', sound: 'k — in Coptic words', notes: 'In Greek words: “sh” before ⲉ ⲏ ⲓ ⲩ (ⲭⲉⲣⲉ “shere”); a guttural “kh” before ⲁ ⲟ ⲱ and consonants (ⲭⲣⲓⲥⲧⲟⲥ “ekhristos”).' },
  { id: 'epsi', order: 24, upper: 'Ⲯ', lower: 'ⲯ', name: 'Epsi', translit: 'ps', sound: 'ps — as in “lapse”' },
  { id: 'omega', order: 25, upper: 'Ⲱ', lower: 'ⲱ', name: 'Omega', translit: 'ō', sound: 'oh — long, as in “go”' },
  { id: 'shai', order: 26, upper: 'Ϣ', lower: 'ϣ', name: 'Shai', translit: 'sh', sound: 'sh — as in “shore”', demotic: true },
  { id: 'fai', order: 27, upper: 'Ϥ', lower: 'ϥ', name: 'Fai', translit: 'f', sound: 'f — as in “fan”', demotic: true },
  { id: 'khai', order: 28, upper: 'Ϧ', lower: 'ϧ', name: 'Khai', translit: 'kh', sound: 'kh — a hard “h” from the throat (Arabic “kh”)', demotic: true },
  { id: 'hori', order: 29, upper: 'Ϩ', lower: 'ϩ', name: 'Hori', translit: 'h', sound: 'h — as in “house”', demotic: true },
  { id: 'janja', order: 30, upper: 'Ϫ', lower: 'ϫ', name: 'Janja', translit: 'j', sound: 'j — as in “judge”', notes: 'Also called Gangia. Hardens toward “g” before ⲉ ⲏ ⲓ ⲩ.', demotic: true },
  { id: 'cheema', order: 31, upper: 'Ϭ', lower: 'ϭ', name: 'Cheema', translit: 'ch', sound: 'ch — as in “church”', notes: 'Also called Shima.', demotic: true },
  { id: 'ti', order: 32, upper: 'Ϯ', lower: 'ϯ', name: 'Ti', translit: 'ti', sound: 'ti — one letter sounding “tee”', demotic: true },
];

/** Letters that spell words (everything except the numeral-only Soou). */
export const PHONETIC_LETTERS: readonly CopticLetter[] = ALPHABET.filter((l) => l.sound !== '');

export function letterById(id: string): CopticLetter | undefined {
  return ALPHABET.find((l) => l.id === id);
}
