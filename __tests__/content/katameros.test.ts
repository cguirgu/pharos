import { parseKatameros, readingLabel, type KatamerosResponse } from '../../src/domain/content/katameros';

// References-only fixture mirroring the katameros.app API shape — NO verse text.
const SAMPLE: KatamerosResponse = {
  sections: [
    {
      title: 'Vespers',
      subSections: [
        {
          title: 'Psalm & Gospel',
          readings: [
            { passages: [{ bookTranslation: 'Psalms', bookId: 19, chapter: 32, ref: '32:11', verses: [{ number: 11 }] }] },
            { passages: [{ bookTranslation: 'Matthew', bookId: 40, chapter: 5, verses: [{ number: 1 }, { number: 2 }, { number: 12 }] }] },
          ],
        },
      ],
    },
    {
      title: 'Liturgy',
      subSections: [
        { title: 'Pauline', readings: [{ passages: [{ bookTranslation: 'Romans', chapter: 8, verses: [{ number: 1 }] }] }] },
      ],
    },
  ],
};

describe('parseKatameros (references only)', () => {
  test('flattens sections → readings → passages into references', () => {
    const { refs } = parseKatameros(SAMPLE);
    expect(refs).toHaveLength(3);
    expect(refs[0]).toMatchObject({ book: 'Psalms', chapter: 32, fromVerse: 11, toVerse: 11, slot: 'Vespers · Psalm & Gospel' });
    expect(refs[1]).toMatchObject({ book: 'Matthew', chapter: 5, fromVerse: 1, toVerse: 12 });
    expect(refs[2]).toMatchObject({ book: 'Romans', chapter: 8, slot: 'Liturgy · Pauline' });
  });

  test('never carries verse text — references only', () => {
    const { refs } = parseKatameros(SAMPLE);
    for (const r of refs) expect(Object.keys(r)).not.toContain('text');
  });

  test('readingLabel formats single verses and ranges', () => {
    expect(readingLabel({ book: 'Psalms', chapter: 32, fromVerse: 11, toVerse: 11 })).toBe('Psalms 32:11');
    expect(readingLabel({ book: 'Matthew', chapter: 5, fromVerse: 1, toVerse: 12 })).toBe('Matthew 5:1–12');
    expect(readingLabel({ book: 'John', chapter: 3 })).toBe('John 3');
  });

  test('empty/odd responses degrade gracefully', () => {
    expect(parseKatameros({}).refs).toEqual([]);
    expect(parseKatameros({ sections: [{ subSections: [] }] }).refs).toEqual([]);
  });
});
