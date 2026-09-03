/**
 * Structural validation of the Coptic alphabet + word data. (Pronunciation
 * *correctness* is verified separately against authoritative sources + owner
 * review; this guards shape/encoding invariants.)
 */
import { ALPHABET, PHONETIC_LETTERS } from '../../src/domain/learn/alphabet';
import { WORDS } from '../../src/domain/learn/words';

const cp = (s: string) => s.codePointAt(0)!;
// Greek-derived Coptic letters live in the Coptic block; the 7 Demotic letters
// are the Coptic letters in the Greek-and-Coptic block.
const inCopticBlock = (c: number) => c >= 0x2c80 && c <= 0x2cb1;
const inDemoticRange = (c: number) => c >= 0x03e2 && c <= 0x03ef;

describe('Coptic alphabet', () => {
  test('has exactly 32 letters in order 1..32', () => {
    expect(ALPHABET).toHaveLength(32);
    expect(ALPHABET.map((l) => l.order)).toEqual(Array.from({ length: 32 }, (_, i) => i + 1));
  });

  test('exactly 7 Demotic letters, after the 25 Greek-derived', () => {
    const demotic = ALPHABET.filter((l) => l.demotic);
    expect(demotic).toHaveLength(7);
    expect(demotic.map((l) => l.id)).toEqual(['shai', 'fai', 'khai', 'hori', 'janja', 'cheema', 'ti']);
  });

  test('ids and names are unique', () => {
    expect(new Set(ALPHABET.map((l) => l.id)).size).toBe(32);
    expect(new Set(ALPHABET.map((l) => l.name)).size).toBe(32);
  });

  test('every glyph is a real Coptic codepoint (upper + lower)', () => {
    for (const l of ALPHABET) {
      const ok = (c: number) => inCopticBlock(c) || inDemoticRange(c);
      expect(ok(cp(l.upper))).toBe(true);
      expect(ok(cp(l.lower))).toBe(true);
      // upper and lower differ by one codepoint within the same pair
      expect(cp(l.lower) - cp(l.upper)).toBe(1);
    }
  });

  // The authoritative guard: each letter must be the EXACT official Unicode
  // codepoint for that Coptic letter (catches any wrong/lookalike character).
  // Coptic block U+2C80+ for the 25 Greek-derived; U+03E2+ for the 7 Demotic.
  test('each letter is its exact Unicode codepoint (no lookalikes)', () => {
    const EXPECTED: Record<string, number> = {
      alpha: 0x2c80, vida: 0x2c82, gamma: 0x2c84, dalda: 0x2c86, ei: 0x2c88,
      soou: 0x2c8a, zeta: 0x2c8c, eta: 0x2c8e, thita: 0x2c90, yota: 0x2c92,
      kappa: 0x2c94, lavla: 0x2c96, mey: 0x2c98, ney: 0x2c9a, eksi: 0x2c9c,
      o: 0x2c9e, pi: 0x2ca0, ro: 0x2ca2, sima: 0x2ca4, tav: 0x2ca6,
      epsilon: 0x2ca8, phi: 0x2caa, khi: 0x2cac, epsi: 0x2cae, omega: 0x2cb0,
      shai: 0x03e2, fai: 0x03e4, khai: 0x03e6, hori: 0x03e8, janja: 0x03ea,
      cheema: 0x03ec, ti: 0x03ee,
    };
    for (const l of ALPHABET) {
      expect(cp(l.upper)).toBe(EXPECTED[l.id]);
      expect(cp(l.lower)).toBe(EXPECTED[l.id]! + 1);
    }
  });

  test('every letter has a transliteration + sound, except the numeral Soou', () => {
    for (const l of ALPHABET) {
      if (l.id === 'soou') {
        expect(l.sound).toBe('');
        continue;
      }
      expect(l.translit.length).toBeGreaterThan(0);
      expect(l.sound.length).toBeGreaterThan(0);
    }
    // PHONETIC_LETTERS excludes Soou
    expect(PHONETIC_LETTERS).toHaveLength(31);
    expect(PHONETIC_LETTERS.find((l) => l.id === 'soou')).toBeUndefined();
  });
});

describe('Coptic words', () => {
  test('each word has Coptic text, transliteration, sound, and an English gloss', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(4);
    for (const w of WORDS) {
      expect(w.coptic.length).toBeGreaterThan(0);
      expect(w.translit.length).toBeGreaterThan(0);
      expect(w.sound.length).toBeGreaterThan(0);
      expect(w.english.length).toBeGreaterThan(0);
      // Coptic text is actually Coptic (first char in a Coptic range)
      const c = w.coptic.codePointAt(0)!;
      expect(inCopticBlock(c) || inDemoticRange(c)).toBe(true);
    }
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(WORDS.length);
  });

  // Exact spellings, verified against authoritative liturgical sources
  // (the Trisagion for Agios, Wiktionary, Coptic prayer texts). Locks the
  // letter sequence so a future typo can't slip through.
  test('liturgical spellings are exactly correct', () => {
    const byId = Object.fromEntries(WORDS.map((w) => [w.id, w.coptic]));
    // Holy Words
    expect(byId['amen']).toBe('ⲁⲙⲏⲛ');
    expect(byId['alleluia']).toBe('ⲁⲗⲗⲏⲗⲟⲩⲓⲁ');
    expect(byId['agios']).toBe('ⲁⲅⲓⲟⲥ');
    expect(byId['kyrie-eleison']).toBe('ⲕⲩⲣⲓⲉ ⲉⲗⲉⲏⲥⲟⲛ');
    expect(byId['doxa']).toBe('ⲇⲟⲝⲁ');
    expect(byId['pikhristos']).toBe('ⲡⲓⲭⲣⲓⲥⲧⲟⲥ');
    // Holy Names (weak-article divine titles — verified intentional)
    expect(byId['efiot']).toBe('ⲫⲓⲱⲧ');
    expect(byId['epshiri']).toBe('ⲡϣⲏⲣⲓ');
    expect(byId['pipnevma']).toBe('ⲡⲓⲡⲛⲉⲩⲙⲁ');
    expect(byId['efnouti']).toBe('ⲫⲛⲟⲩϯ');
    expect(byId['epchois']).toBe('ⲡϭⲟⲓⲥ');
    expect(byId['iisous']).toBe('ⲓⲏⲥⲟⲩⲥ');
    // Words of the Liturgy
    expect(byId['maria']).toBe('ⲙⲁⲣⲓⲁ');
    expect(byId['pioou']).toBe('ⲡⲓⲱⲟⲩ');
    expect(byId['tiekklisia']).toBe('ϯⲉⲕⲕⲗⲏⲥⲓⲁ');
    expect(byId['pievangelion']).toBe('ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ');
    expect(byId['piangelos']).toBe('ⲡⲓⲁⲅⲅⲉⲗⲟⲥ');
    expect(byId['tihirini']).toBe('ϯϩⲓⲣⲏⲛⲏ');
    // Words of Praise
    expect(byId['shere']).toBe('ⲭⲉⲣⲉ');
    expect(byId['esmou']).toBe('ⲥⲙⲟⲩ');
    expect(byId['tenouosht']).toBe('ⲧⲉⲛⲟⲩⲱϣⲧ');
    // Extended vocabulary (TODO(verify-content): owner review) — Words of Faith
    expect(byId['nai']).toBe('ⲛⲁⲓ');
    expect(byId['agapi']).toBe('ⲁⲅⲁⲡⲏ');
    expect(byId['pistis']).toBe('ⲡⲓⲥⲧⲓⲥ');
    // Light & Life
    expect(byId['ouoini']).toBe('ⲟⲩⲱⲓⲛⲓ');
    expect(byId['onkh']).toBe('ⲱⲛϧ');
    expect(byId['sotir']).toBe('ⲥⲱⲧⲏⲣ');
    // The Holy Ones
    expect(byId['apostolos']).toBe('ⲁⲡⲟⲥⲧⲟⲗⲟⲥ');
    expect(byId['martyros']).toBe('ⲙⲁⲣⲧⲩⲣⲟⲥ');
    expect(byId['ethouab']).toBe('ⲉⲑⲟⲩⲁⲃ');
    // Heaven & Kingdom
    expect(byId['tfe']).toBe('ⲧⲫⲉ');
    expect(byId['metouro']).toBe('ⲙⲉⲧⲟⲩⲣⲟ');
    expect(byId['stavros']).toBe('ⲥⲧⲁⲩⲣⲟⲥ');
    // Songs of Praise
    expect(byId['tenhos']).toBe('ⲧⲉⲛϩⲱⲥ');
    expect(byId['axios']).toBe('ⲁⲝⲓⲟⲥ');
    expect(byId['osanna']).toBe('ⲱⲥⲁⲛⲛⲁ');
    // Words We Reply
    expect(byId['alithos']).toBe('ⲁⲗⲏⲑⲱⲥ');
    expect(byId['palin']).toBe('ⲡⲁⲗⲓⲛ');
    expect(byId['doxa-si']).toBe('ⲇⲟⲝⲁ ⲥⲓ');
    // Word of the Feast
    expect(byId['aftonf']).toBe('ⲁϥⲧⲱⲛϥ');
    expect(byId['emmanouil']).toBe('ⲉⲙⲙⲁⲛⲟⲩⲏⲗ');
    expect(byId['piouro']).toBe('ⲡⲓⲟⲩⲣⲟ');
    // The Lord's Prayer — the words as they stand in ϫⲉ ⲡⲉⲛⲓⲱⲧ ⲉⲧϧⲉⲛ ⲛⲓⲫⲏⲟⲩⲓ
    expect(byId['peniot']).toBe('ⲡⲉⲛⲓⲱⲧ');
    expect(byId['nifioui']).toBe('ⲛⲓⲫⲏⲟⲩⲓ');
    expect(byId['pekran']).toBe('ⲡⲉⲕⲣⲁⲛ');
    expect(byId['tekmetouro']).toBe('ⲧⲉⲕⲙⲉⲧⲟⲩⲣⲟ');
    expect(byId['penoik']).toBe('ⲡⲉⲛⲱⲓⲕ');
    expect(byId['pikahi']).toBe('ⲡⲓⲕⲁϩⲓ');
    // The Trisagion (Greek sung in Coptic letters; no djinkim in our data)
    expect(byId['agios-o-theos']).toBe('ⲁⲅⲓⲟⲥ ⲟ ⲑⲉⲟⲥ');
    expect(byId['agios-ischyros']).toBe('ⲁⲅⲓⲟⲥ ⲓⲥⲭⲩⲣⲟⲥ');
    expect(byId['agios-athanatos']).toBe('ⲁⲅⲓⲟⲥ ⲁⲑⲁⲛⲁⲧⲟⲥ');
    // The Creed
    expect(byId['tennahti']).toBe('ⲧⲉⲛⲛⲁϩϯ');
    expect(byId['pipantokrator']).toBe('ⲡⲓⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ');
    expect(byId['logos']).toBe('ⲗⲟⲅⲟⲥ');
    // The Holy Offering
    expect(byId['oik']).toBe('ⲱⲓⲕ');
    expect(byId['afot']).toBe('ⲁⲫⲟⲧ');
    expect(byId['esnof']).toBe('ⲥⲛⲟϥ');
    // In the Church
    expect(byId['ouib']).toBe('ⲟⲩⲏⲃ');
    expect(byId['diakon']).toBe('ⲇⲓⲁⲕⲱⲛ');
    expect(byId['laos']).toBe('ⲗⲁⲟⲥ');
    // Pascha & Resurrection
    expect(byId['paskha']).toBe('ⲡⲁⲥⲭⲁ');
    expect(byId['anastasis']).toBe('ⲁⲛⲁⲥⲧⲁⲥⲓⲥ');
    expect(byId['shai-feast']).toBe('ϣⲁⲓ');
    // Prayer & Repentance
    expect(byId['eshlil']).toBe('ϣⲗⲏⲗ');
    expect(byId['metania']).toBe('ⲙⲉⲧⲁⲛⲟⲓⲁ');
    expect(byId['novi']).toBe('ⲛⲟⲃⲓ');
    // Soul & Body
    expect(byId['romi']).toBe('ⲣⲱⲙⲓ');
    expect(byId['psyshi']).toBe('ⲯⲩⲭⲏ');
    expect(byId['soma']).toBe('ⲥⲱⲙⲁ');
    // Words of the Hours
    expect(byId['psalmos']).toBe('ⲯⲁⲗⲙⲟⲥ');
    expect(byId['tovh']).toBe('ⲧⲱⲃϩ');
    expect(byId['ounou']).toBe('ⲟⲩⲛⲟⲩ');
  });

  // Words are written in LOWERCASE Coptic throughout (the lesson player styles
  // them); an uppercase or Greek lookalike would render wrong and break the
  // spelling tiles, which are cut from the lowercase alphabet.
  test('every word is spelled in lowercase Coptic letters (plus spaces)', () => {
    const lower = new Set<number>();
    for (let c = 0x2c81; c <= 0x2cb1; c += 2) lower.add(c);
    for (let c = 0x03e3; c <= 0x03ef; c += 2) lower.add(c);
    for (const w of WORDS) {
      for (const ch of w.coptic) {
        if (ch === ' ') continue;
        expect({ id: w.id, ch, ok: lower.has(ch.codePointAt(0)!) }).toEqual({ id: w.id, ch, ok: true });
      }
    }
  });

  // Audio clips are keyed by letter id AND word id in one namespace
  // (src/content/coptic-audio.gen.ts), so the two id sets must never overlap —
  // e.g. the word ϣⲁⲓ "feast" is `shai-feast`, since `shai` is the letter Ϣ.
  test('no word id collides with a letter id', () => {
    const letterIds = new Set(ALPHABET.map((l) => l.id));
    const collisions = WORDS.map((w) => w.id).filter((id) => letterIds.has(id));
    expect(collisions).toEqual([]);
  });
});
