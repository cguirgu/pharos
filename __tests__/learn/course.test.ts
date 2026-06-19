/**
 * Course structure + exercise generation + progress math (pure).
 */
import {
  UNITS,
  LESSONS,
  lessonExercises,
  lessonById,
  lessonPercent,
  isLessonPerfect,
  isLessonPassed,
  courseLevel,
  xpFor,
  isLessonUnlocked,
  gradedCount,
} from '../../src/domain/learn/course';
import { ALPHABET } from '../../src/domain/learn/alphabet';
import { WORDS } from '../../src/domain/learn/words';

describe('course structure', () => {
  test('alphabet unit + sounds bridge + word units; alphabet covers all 32 letters; word lessons cover all words', () => {
    expect(UNITS[0]!.id).toBe('alphabet');
    expect(UNITS.map((u) => u.id)).toEqual([
      'alphabet', 'sounds', 'words', 'names', 'liturgy', 'praise',
      'faith', 'light', 'saints', 'kingdom', 'praises2', 'responses', 'feasts',
    ]);
    const alphaIds = LESSONS.filter((l) => l.unitId === 'alphabet').flatMap((l) => l.itemIds);
    expect(alphaIds).toEqual(ALPHABET.map((l) => l.id));
    const wordIds = LESSONS.filter((l) => l.itemKind === 'word').flatMap((l) => l.itemIds);
    expect(wordIds).toEqual(WORDS.map((w) => w.id));
  });

  test('the "sounds" bridge sits between the alphabet and the words', () => {
    const ids = UNITS.map((u) => u.id);
    expect(ids.indexOf('alphabet')).toBeLessThan(ids.indexOf('sounds'));
    expect(ids.indexOf('sounds')).toBeLessThan(ids.indexOf('words'));
    // and there are exactly 3 bridge lessons + 7 new vocab lessons = 10 new levels
    expect(LESSONS.filter((l) => l.unitId === 'sounds')).toHaveLength(3);
    const newVocab = ['faith', 'light', 'saints', 'kingdom', 'praises2', 'responses', 'feasts'];
    expect(LESSONS.filter((l) => newVocab.includes(l.unitId))).toHaveLength(7);
  });

  test('every unit declares a glyph and its lessons exist', () => {
    for (const u of UNITS) {
      expect(u.glyph.length).toBeGreaterThan(0);
      expect(u.lessonIds.length).toBeGreaterThan(0);
      for (const id of u.lessonIds) expect(LESSONS.find((l) => l.id === id)).toBeTruthy();
    }
  });

  test('lesson indices are 1..N across the course', () => {
    expect(LESSONS.map((l) => l.index)).toEqual(LESSONS.map((_, i) => i + 1));
  });
});

describe('exercise generation', () => {
  test('every CHOICE exercise has 4 distinct options including the answer', () => {
    for (const lesson of LESSONS) {
      const exercises = lessonExercises(lesson);
      expect(exercises.length).toBeGreaterThan(0);
      for (const ex of exercises) {
        if (ex.kind === 'word-spell') continue; // spelling uses tiles, not options
        if (ex.kind === 'concept') continue; // teaching card, not a question
        expect(ex.options).toHaveLength(4);
        expect(new Set(ex.options).size).toBe(4); // distinct
        expect(ex.options).toContain(ex.answer);
      }
    }
  });

  test('word-spell tiles contain every target letter (with multiplicity) + decoys, no spaces', () => {
    const spells = LESSONS.flatMap(lessonExercises).filter((e) => e.kind === 'word-spell');
    expect(spells.length).toBeGreaterThan(0);
    for (const ex of spells) {
      const target = [...ex.answer];
      expect(target).not.toContain(' ');
      const tiles = [...(ex.tiles ?? [])];
      // every target letter is present, counting duplicates
      for (const letter of new Set(target)) {
        const need = target.filter((c) => c === letter).length;
        const have = tiles.filter((c) => c === letter).length;
        expect(have).toBeGreaterThanOrEqual(need);
      }
      expect(tiles.length).toBeGreaterThan(target.length); // has decoys
      expect(tiles).not.toContain(' ');
    }
  });

  test('multi-word phrases (e.g. Kyrie eleison) get no spelling exercise', () => {
    const all = LESSONS.flatMap(lessonExercises);
    expect(all.find((e) => e.kind === 'word-spell' && e.key.endsWith(':kyrie-eleison'))).toBeUndefined();
  });

  test('generation is deterministic (stable option + tile order)', () => {
    const a = lessonExercises(lessonById('words-1')!);
    const b = lessonExercises(lessonById('words-1')!);
    expect(a.map((e) => [...e.options, ...(e.tiles ?? [])])).toEqual(b.map((e) => [...e.options, ...(e.tiles ?? [])]));
  });

  test('each bridge lesson leads with a concept (teaching) card', () => {
    for (const lesson of LESSONS.filter((l) => l.itemKind === 'combo')) {
      expect(lessonExercises(lesson)[0]!.kind).toBe('concept');
    }
  });

  test('concept cards are not graded; combo questions have 4 distinct options', () => {
    const combos = LESSONS.filter((l) => l.itemKind === 'combo').flatMap(lessonExercises);
    const concepts = combos.filter((e) => e.kind === 'concept');
    expect(concepts.length).toBeGreaterThan(0);
    for (const lesson of LESSONS.filter((l) => l.itemKind === 'combo')) {
      const exs = lessonExercises(lesson);
      // graded count excludes the concept cards
      expect(gradedCount(exs)).toBe(exs.filter((e) => e.kind !== 'concept').length);
      expect(gradedCount(exs)).toBeLessThan(exs.length);
    }
    for (const ex of combos.filter((e) => e.kind === 'combo-sound' || e.kind === 'combo-read')) {
      expect(ex.options).toHaveLength(4);
      expect(new Set(ex.options).size).toBe(4);
      expect(ex.options).toContain(ex.answer);
    }
  });

  test('the numeral Soou gets no sound exercise', () => {
    const all = LESSONS.flatMap(lessonExercises);
    expect(all.find((e) => e.kind === 'letter-sound' && e.key.endsWith(':soou'))).toBeUndefined();
  });

  test('levels are short — no lesson exceeds ~12 cards', () => {
    for (const lesson of LESSONS) {
      expect(lessonExercises(lesson).length).toBeLessThanOrEqual(12);
    }
  });

  test('exercises are interleaved by type, not grouped per item', () => {
    // The first alphabet level should lead with the name questions for each of
    // its letters, not three exercises for the first letter in a row.
    const ex = lessonExercises(lessonById('alphabet-1')!);
    expect(ex[0]!.kind).toBe('letter-name');
    expect(ex[1]!.kind).toBe('letter-name');
  });
});

describe('progress math', () => {
  test('lessonPercent', () => {
    expect(lessonPercent(undefined)).toBe(0);
    expect(lessonPercent({ correct: 0, total: 0 })).toBe(0);
    expect(lessonPercent({ correct: 5, total: 10 })).toBe(50);
    expect(lessonPercent({ correct: 10, total: 10 })).toBe(100);
  });

  test('courseLevel + xpFor', () => {
    expect(courseLevel(0)).toBe(1);
    expect(courseLevel(3)).toBe(4);
    expect(xpFor([{ correct: 8, total: 10 }, { correct: 12, total: 12 }])).toBe(200);
  });

  test('isLessonPerfect needs a flawless run', () => {
    expect(isLessonPerfect(undefined)).toBe(false);
    expect(isLessonPerfect({ correct: 9, total: 10 })).toBe(false);
    expect(isLessonPerfect({ correct: 10, total: 10 })).toBe(true);
    expect(isLessonPerfect({ correct: 0, total: 0 })).toBe(false);
  });

  test('isLessonPassed = ~90%, always forgiving at least one slip', () => {
    expect(isLessonPassed(undefined)).toBe(false);
    // short word level (9 exercises): one mistake forgiven, two is too many
    expect(isLessonPassed({ correct: 9, total: 9 })).toBe(true);
    expect(isLessonPassed({ correct: 8, total: 9 })).toBe(true);
    expect(isLessonPassed({ correct: 7, total: 9 })).toBe(false);
    // longer alphabet level (24): up to two misses
    expect(isLessonPassed({ correct: 22, total: 24 })).toBe(true);
    expect(isLessonPassed({ correct: 21, total: 24 })).toBe(false);
    // 10: one miss = 90%
    expect(isLessonPassed({ correct: 9, total: 10 })).toBe(true);
    expect(isLessonPassed({ correct: 8, total: 10 })).toBe(false);
  });

  test('lesson unlock: first is open; later needs the previous PASSED (≥90%)', () => {
    const first = LESSONS[0]!.id;
    const second = LESSONS[1]!.id;
    expect(isLessonUnlocked(first, new Set())).toBe(true);
    expect(isLessonUnlocked(second, new Set())).toBe(false);
    expect(isLessonUnlocked(second, new Set([first]))).toBe(true);
  });
});
