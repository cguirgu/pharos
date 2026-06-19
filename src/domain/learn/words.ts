/**
 * Liturgical words, grouped into units, for read → translate → pronounce
 * practice. Each is a word of every Coptic Orthodox liturgy, with a universal
 * English gloss (not taken from any copyrighted translation) and Greco-Bohairic
 * pronunciation.
 *
 * ⚠️ ACCURACY: spellings, glosses, and pronunciations are cross-checked against
 * authoritative Coptic sources + owner-reviewed (see docs/CONTENT-SOURCES.md and
 * the exact-spelling regression test in __tests__/learn/alphabet.test.ts).
 */

export interface CopticWord {
  readonly id: string;
  readonly coptic: string;
  /** Romanised reading. */
  readonly translit: string;
  /** Plain pronunciation guide (syllables; stress capitalised). */
  readonly sound: string;
  /** Universal English meaning. */
  readonly english: string;
}

export interface WordUnit {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly glyph: string;
  readonly words: readonly CopticWord[];
}

export const WORD_UNITS: readonly WordUnit[] = [
  {
    id: 'words',
    title: 'Holy Words',
    subtitle: 'The words said in every liturgy.',
    glyph: 'Ⲃ',
    words: [
      { id: 'amen', coptic: 'ⲁⲙⲏⲛ', translit: 'amēn', sound: 'a-MEEN', english: 'Amen — “so be it”' },
      { id: 'alleluia', coptic: 'ⲁⲗⲗⲏⲗⲟⲩⲓⲁ', translit: 'allēlouia', sound: 'al-lee-LOO-ya', english: 'Alleluia — “praise the Lord”' },
      { id: 'agios', coptic: 'ⲁⲅⲓⲟⲥ', translit: 'agios', sound: 'a-GHEE-os', english: 'Holy' },
      { id: 'kyrie-eleison', coptic: 'ⲕⲩⲣⲓⲉ ⲉⲗⲉⲏⲥⲟⲛ', translit: 'kyrie eleēson', sound: 'KEE-ree-eh e-LEE-son', english: 'Lord, have mercy' },
      { id: 'doxa', coptic: 'ⲇⲟⲝⲁ', translit: 'doxa', sound: 'DOK-sa', english: 'Glory' },
      { id: 'pikhristos', coptic: 'ⲡⲓⲭⲣⲓⲥⲧⲟⲥ', translit: 'pikhristos', sound: 'pi-EKH-ree-stos', english: 'the Christ' },
    ],
  },
  {
    id: 'names',
    title: 'Holy Names',
    subtitle: 'The Father, the Son, and the Holy Spirit.',
    glyph: 'Ⲅ',
    // NB: the divine titles use the WEAK definite article on purpose — ⲫⲓⲱⲧ
    // (the Father), ⲡϣⲏⲣⲓ (the Son), ⲫⲛⲟⲩϯ (God). Do NOT "fix" them to the strong
    // forms (ⲡⲓⲓⲱⲧ / ⲡⲓϣⲏⲣⲓ / ⲡⲓⲛⲟⲩϯ), which mean an ordinary father/son/god.
    words: [
      { id: 'efiot', coptic: 'ⲫⲓⲱⲧ', translit: 'efiōt', sound: 'ef-YOHT', english: 'the Father' },
      { id: 'epshiri', coptic: 'ⲡϣⲏⲣⲓ', translit: 'epshiri', sound: 'ep-SHEE-ri', english: 'the Son' },
      { id: 'pipnevma', coptic: 'ⲡⲓⲡⲛⲉⲩⲙⲁ', translit: 'pipnevma', sound: 'pip-NEV-ma', english: 'the Spirit' },
      { id: 'efnouti', coptic: 'ⲫⲛⲟⲩϯ', translit: 'efnouti', sound: 'ef-NOO-ti', english: 'God' },
      { id: 'epchois', coptic: 'ⲡϭⲟⲓⲥ', translit: 'epchois', sound: 'ep-CHOICE', english: 'the Lord' },
      { id: 'iisous', coptic: 'ⲓⲏⲥⲟⲩⲥ', translit: 'iēsous', sound: 'ee-SOOS', english: 'Jesus' },
    ],
  },
  {
    id: 'liturgy',
    title: 'Words of the Liturgy',
    subtitle: 'What is named again and again in the church.',
    glyph: 'Ⲇ',
    words: [
      { id: 'maria', coptic: 'ⲙⲁⲣⲓⲁ', translit: 'maria', sound: 'ma-REE-a', english: 'Mary' },
      { id: 'pioou', coptic: 'ⲡⲓⲱⲟⲩ', translit: 'pioou', sound: 'pi-OH-oo', english: 'the glory' },
      { id: 'tiekklisia', coptic: 'ϯⲉⲕⲕⲗⲏⲥⲓⲁ', translit: 'tiekklēsia', sound: 'ti-ek-klee-SEE-a', english: 'the Church' },
      { id: 'pievangelion', coptic: 'ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ', translit: 'pievangelion', sound: 'pi-ev-ang-GEH-li-on', english: 'the Gospel' },
      { id: 'piangelos', coptic: 'ⲡⲓⲁⲅⲅⲉⲗⲟⲥ', translit: 'piangelos', sound: 'pi-ang-GEH-los', english: 'the angel' },
      { id: 'tihirini', coptic: 'ϯϩⲓⲣⲏⲛⲏ', translit: 'tihirēnē', sound: 'ti-hi-REE-ni', english: 'the peace' },
    ],
  },
  {
    id: 'praise',
    title: 'Words of Praise',
    subtitle: 'How the hymns lift up the Lord.',
    glyph: 'Ⲉ',
    words: [
      { id: 'shere', coptic: 'ⲭⲉⲣⲉ', translit: 'shere', sound: 'SHE-re', english: 'Hail / Rejoice' },
      { id: 'esmou', coptic: 'ⲥⲙⲟⲩ', translit: 'esmou', sound: 'es-MOO', english: 'Bless' },
      { id: 'tenouosht', coptic: 'ⲧⲉⲛⲟⲩⲱϣⲧ', translit: 'tenouōsht', sound: 'ten-oo-OSHT', english: 'We worship' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Extended vocabulary (7 units · 21 words). Same accuracy discipline as above:
  // TODO(verify-content): owner (Coptic Orthodox) review of spellings, glosses,
  // and Greco-Bohairic pronunciations. Exact spellings are locked in
  // __tests__/learn/alphabet.test.ts so any correction is a single guarded edit.
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'faith',
    title: 'Words of Faith',
    subtitle: 'Mercy, love, and faith — the heart of every prayer.',
    glyph: 'Ⲍ',
    words: [
      { id: 'nai', coptic: 'ⲛⲁⲓ', translit: 'nai', sound: 'NA-i', english: 'mercy / have mercy' },
      { id: 'agapi', coptic: 'ⲁⲅⲁⲡⲏ', translit: 'agapē', sound: 'a-GHA-pi', english: 'love' },
      { id: 'pistis', coptic: 'ⲡⲓⲥⲧⲓⲥ', translit: 'pistis', sound: 'PIS-tis', english: 'faith' },
    ],
  },
  {
    id: 'light',
    title: 'Light & Life',
    subtitle: 'What the Lord gives to the world.',
    glyph: 'Ⲏ',
    words: [
      { id: 'ouoini', coptic: 'ⲟⲩⲱⲓⲛⲓ', translit: 'ouōini', sound: 'oo-OH-ee-ni', english: 'light' },
      { id: 'onkh', coptic: 'ⲱⲛϧ', translit: 'ōnkh', sound: 'OHNKH', english: 'life' },
      { id: 'sotir', coptic: 'ⲥⲱⲧⲏⲣ', translit: 'sōtēr', sound: 'soh-TEER', english: 'Saviour' },
    ],
  },
  {
    id: 'saints',
    title: 'The Holy Ones',
    subtitle: 'The cloud of witnesses named in the church.',
    glyph: 'Ⲑ',
    words: [
      { id: 'apostolos', coptic: 'ⲁⲡⲟⲥⲧⲟⲗⲟⲥ', translit: 'apostolos', sound: 'a-PO-sto-los', english: 'apostle' },
      { id: 'martyros', coptic: 'ⲙⲁⲣⲧⲩⲣⲟⲥ', translit: 'martyros', sound: 'mar-TI-ros', english: 'martyr' },
      { id: 'ethouab', coptic: 'ⲉⲑⲟⲩⲁⲃ', translit: 'ethouab', sound: 'eth-oo-AB', english: 'holy / saint' },
    ],
  },
  {
    id: 'kingdom',
    title: 'Heaven & Kingdom',
    subtitle: 'Where the prayers are lifted.',
    glyph: 'Ⲓ',
    words: [
      { id: 'tfe', coptic: 'ⲧⲫⲉ', translit: 'tfe', sound: 'et-FEH', english: 'the heaven' },
      { id: 'metouro', coptic: 'ⲙⲉⲧⲟⲩⲣⲟ', translit: 'metouro', sound: 'met-OO-ro', english: 'kingdom' },
      { id: 'stavros', coptic: 'ⲥⲧⲁⲩⲣⲟⲥ', translit: 'stavros', sound: 'es-TAV-ros', english: 'the cross' },
    ],
  },
  {
    id: 'praises2',
    title: 'Songs of Praise',
    subtitle: 'How the people lift up their voice.',
    glyph: 'Ⲕ',
    words: [
      { id: 'tenhos', coptic: 'ⲧⲉⲛϩⲱⲥ', translit: 'tenhōs', sound: 'ten-HOHS', english: 'we praise' },
      { id: 'axios', coptic: 'ⲁⲝⲓⲟⲥ', translit: 'axios', sound: 'AK-si-os', english: 'worthy' },
      { id: 'osanna', coptic: 'ⲱⲥⲁⲛⲛⲁ', translit: 'ōsanna', sound: 'oh-SAN-na', english: 'Hosanna' },
    ],
  },
  {
    id: 'responses',
    title: 'Words We Reply',
    subtitle: 'The answers the people give in the prayers.',
    glyph: 'Ⲗ',
    words: [
      { id: 'alithos', coptic: 'ⲁⲗⲏⲑⲱⲥ', translit: 'alēthōs', sound: 'a-lee-THOHS', english: 'truly' },
      { id: 'palin', coptic: 'ⲡⲁⲗⲓⲛ', translit: 'palin', sound: 'PA-lin', english: 'again' },
      { id: 'doxa-si', coptic: 'ⲇⲟⲝⲁ ⲥⲓ', translit: 'doxa si', sound: 'DOK-sa see', english: 'Glory to You' },
    ],
  },
  {
    id: 'feasts',
    title: 'Word of the Feast',
    subtitle: 'The joy proclaimed on the great days.',
    glyph: 'Ⲙ',
    words: [
      { id: 'aftonf', coptic: 'ⲁϥⲧⲱⲛϥ', translit: 'aftōnf', sound: 'af-TOHNF', english: 'He is risen' },
      { id: 'emmanouil', coptic: 'ⲉⲙⲙⲁⲛⲟⲩⲏⲗ', translit: 'emmanouēl', sound: 'em-ma-noo-EEL', english: 'Emmanuel' },
      { id: 'piouro', coptic: 'ⲡⲓⲟⲩⲣⲟ', translit: 'piouro', sound: 'pi-OO-ro', english: 'the King' },
    ],
  },
];

/** Flat list of every word, across all units. */
export const WORDS: readonly CopticWord[] = WORD_UNITS.flatMap((u) => u.words);

export function wordById(id: string): CopticWord | undefined {
  return WORDS.find((w) => w.id === id);
}
