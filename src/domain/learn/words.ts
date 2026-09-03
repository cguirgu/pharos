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

  // ───────────────────────────────────────────────────────────────────────────
  // The prayers of the Church (9 units · 27 words). Every word below is taken
  // from a text the Church actually prays — the Lord's Prayer, the Trisagion,
  // the Creed, the Liturgy — or is the plain Bohairic lemma for a word of the
  // faith. Each spelling was cross-checked against BOTH an independent
  // Coptic-script witness of the prayer text AND the Bohairic dictionary entry
  // for the word (see docs/CONTENT-SOURCES.md).
  // TODO(verify-content): owner (Coptic Orthodox) review of glosses + sounds.
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'lords-prayer',
    title: 'The Lord’s Prayer',
    subtitle: 'The words the Lord Himself taught us to pray.',
    glyph: 'Ⲛ',
    // Straight from ⲡⲉⲛⲓⲱⲧ ⲉⲧϧⲉⲛ ⲛⲓⲫⲏⲟⲩⲓ — “Our Father who art in the heavens”.
    // ⲧⲉⲕⲙⲉⲧⲟⲩⲣⲟ and ⲡⲉⲛⲱⲓⲕ re-use ⲙⲉⲧⲟⲩⲣⲟ / ⲱⲓⲕ from the other levels.
    words: [
      { id: 'peniot', coptic: 'ⲡⲉⲛⲓⲱⲧ', translit: 'peniōt', sound: 'pen-YOHT', english: 'Our Father' },
      { id: 'nifioui', coptic: 'ⲛⲓⲫⲏⲟⲩⲓ', translit: 'nifēoui', sound: 'ni-FEE-oo-i', english: 'the heavens' },
      { id: 'pekran', coptic: 'ⲡⲉⲕⲣⲁⲛ', translit: 'pekran', sound: 'pek-RAN', english: 'Your name' },
      { id: 'tekmetouro', coptic: 'ⲧⲉⲕⲙⲉⲧⲟⲩⲣⲟ', translit: 'tekmetouro', sound: 'tek-met-OO-ro', english: 'Your kingdom' },
      { id: 'penoik', coptic: 'ⲡⲉⲛⲱⲓⲕ', translit: 'penōik', sound: 'pen-OH-ik', english: 'our bread' },
      { id: 'pikahi', coptic: 'ⲡⲓⲕⲁϩⲓ', translit: 'pikahi', sound: 'pi-KA-hi', english: 'the earth' },
    ],
  },
  {
    id: 'trisagion',
    title: 'The Trisagion',
    subtitle: 'The three holies — sung at every prayer of the Church.',
    glyph: 'Ⲝ',
    // Greek sung in Coptic letters. Multi-word, so these are read and
    // translated rather than spelled from tiles.
    words: [
      { id: 'agios-o-theos', coptic: 'ⲁⲅⲓⲟⲥ ⲟ ⲑⲉⲟⲥ', translit: 'agios o theos', sound: 'a-GHEE-os o THE-os', english: 'Holy God' },
      { id: 'agios-ischyros', coptic: 'ⲁⲅⲓⲟⲥ ⲓⲥⲭⲩⲣⲟⲥ', translit: 'agios ischyros', sound: 'a-GHEE-os ees-SHEE-ros', english: 'Holy Mighty' },
      { id: 'agios-athanatos', coptic: 'ⲁⲅⲓⲟⲥ ⲁⲑⲁⲛⲁⲧⲟⲥ', translit: 'agios athanatos', sound: 'a-GHEE-os a-tha-NA-tos', english: 'Holy Immortal' },
    ],
  },
  {
    id: 'creed',
    title: 'The Creed',
    subtitle: 'What the Church confesses together.',
    glyph: 'Ⲟ',
    words: [
      { id: 'tennahti', coptic: 'ⲧⲉⲛⲛⲁϩϯ', translit: 'tennahti', sound: 'ten-NAH-ti', english: 'We believe' },
      { id: 'pipantokrator', coptic: 'ⲡⲓⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ', translit: 'pipantokratōr', sound: 'pi-pan-to-KRA-tor', english: 'the Almighty' },
      { id: 'logos', coptic: 'ⲗⲟⲅⲟⲥ', translit: 'logos', sound: 'LO-ghos', english: 'the Word' },
    ],
  },
  {
    id: 'offering',
    title: 'The Holy Offering',
    subtitle: 'What is set upon the altar.',
    glyph: 'Ⲡ',
    words: [
      { id: 'oik', coptic: 'ⲱⲓⲕ', translit: 'ōik', sound: 'OH-ik', english: 'bread' },
      { id: 'afot', coptic: 'ⲁⲫⲟⲧ', translit: 'afot', sound: 'A-fot', english: 'cup' },
      { id: 'esnof', coptic: 'ⲥⲛⲟϥ', translit: 'esnof', sound: 'es-NOF', english: 'blood' },
    ],
  },
  {
    id: 'church',
    title: 'In the Church',
    subtitle: 'Those who stand and serve before the Lord.',
    glyph: 'Ⲣ',
    words: [
      { id: 'ouib', coptic: 'ⲟⲩⲏⲃ', translit: 'ouēb', sound: 'oo-EEB', english: 'priest' },
      { id: 'diakon', coptic: 'ⲇⲓⲁⲕⲱⲛ', translit: 'diakōn', sound: 'di-a-KOHN', english: 'deacon / servant' },
      { id: 'laos', coptic: 'ⲗⲁⲟⲥ', translit: 'laos', sound: 'LA-os', english: 'people' },
    ],
  },
  {
    id: 'pascha',
    title: 'Pascha & Resurrection',
    subtitle: 'The passing-over and the rising of the Lord.',
    glyph: 'Ⲥ',
    words: [
      { id: 'paskha', coptic: 'ⲡⲁⲥⲭⲁ', translit: 'paskha', sound: 'PAS-kha', english: 'Pascha — the Passover' },
      { id: 'anastasis', coptic: 'ⲁⲛⲁⲥⲧⲁⲥⲓⲥ', translit: 'anastasis', sound: 'a-NA-sta-sis', english: 'resurrection' },
      // NB: id is `shai-feast`, not `shai` — that key belongs to the LETTER Ϣ
      // (audio clips are keyed by letter/word id in the same namespace).
      { id: 'shai-feast', coptic: 'ϣⲁⲓ', translit: 'shai', sound: 'SHA-i', english: 'feast' },
    ],
  },
  {
    id: 'repentance',
    title: 'Prayer & Repentance',
    subtitle: 'The turning back of the heart.',
    glyph: 'Ⲧ',
    words: [
      { id: 'eshlil', coptic: 'ϣⲗⲏⲗ', translit: 'eshlēl', sound: 'esh-LEEL', english: 'to pray' },
      { id: 'metania', coptic: 'ⲙⲉⲧⲁⲛⲟⲓⲁ', translit: 'metanoia', sound: 'me-TA-nee-a', english: 'repentance' },
      { id: 'novi', coptic: 'ⲛⲟⲃⲓ', translit: 'nobi', sound: 'NO-vi', english: 'sin' },
    ],
  },
  {
    id: 'soul',
    title: 'Soul & Body',
    subtitle: 'What the Lord made, and what He saves.',
    glyph: 'Ⲫ',
    words: [
      { id: 'romi', coptic: 'ⲣⲱⲙⲓ', translit: 'rōmi', sound: 'ROH-mi', english: 'man / human being' },
      { id: 'psyshi', coptic: 'ⲯⲩⲭⲏ', translit: 'psychē', sound: 'psee-SHEE', english: 'soul' },
      { id: 'soma', coptic: 'ⲥⲱⲙⲁ', translit: 'sōma', sound: 'SOH-ma', english: 'body' },
    ],
  },
  {
    id: 'hours',
    title: 'Words of the Hours',
    subtitle: 'The vocabulary of the Agpeya.',
    glyph: 'Ⲱ',
    words: [
      { id: 'psalmos', coptic: 'ⲯⲁⲗⲙⲟⲥ', translit: 'psalmos', sound: 'PSAL-mos', english: 'psalm' },
      { id: 'tovh', coptic: 'ⲧⲱⲃϩ', translit: 'tōbh', sound: 'TOHVH', english: 'to entreat / pray to' },
      { id: 'ounou', coptic: 'ⲟⲩⲛⲟⲩ', translit: 'ounou', sound: 'oo-NOO', english: 'hour' },
    ],
  },
];

/** Flat list of every word, across all units. */
export const WORDS: readonly CopticWord[] = WORD_UNITS.flatMap((u) => u.words);

export function wordById(id: string): CopticWord | undefined {
  return WORDS.find((w) => w.id === id);
}
