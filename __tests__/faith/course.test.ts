/**
 * The Faith course engine — step generation, answer shapes, and progress math.
 *
 * The answer-shape tests matter more here than in the Coptic course: those
 * exercises are GENERATED (a letter's name is always among the options because
 * the generator put it there), while these are AUTHORED, so an answer that is
 * not among its own options is a typo waiting to make a question unanswerable.
 */
import {
  LESSONS,
  UNITS,
  READY_LESSONS,
  lessonById,
  lessonSteps,
  gradedCount,
  isGraded,
  isCorrect,
  isLessonPassed,
  isLessonPerfect,
  isLessonUnlocked,
  lessonPercent,
  courseLevel,
  xpFor,
  unitsSummary,
  storageKey,
  isFaithKey,
  lessonIdFromKey,
  ORDER_SEP,
} from '../../src/domain/faith/course';
import { STANDINGS } from '../../src/domain/faith/types';

const allPassed = new Set(READY_LESSONS.map((l) => l.id));

describe('course shape', () => {
  test('there are lessons, and each belongs to a unit in order', () => {
    expect(LESSONS.length).toBeGreaterThan(0);
    expect(LESSONS).toEqual(UNITS.flatMap((u) => u.lessons));
  });

  test('lessonById round-trips every lesson', () => {
    for (const l of LESSONS) expect(lessonById(l.id)).toBe(l);
  });

  test('unitsSummary counts every ready lesson exactly once', () => {
    const summed = unitsSummary(new Set()).reduce((n, u) => n + u.total, 0);
    expect(summed).toBe(READY_LESSONS.length);
  });
});

describe('authored answers are well formed', () => {
  const questions = LESSONS.flatMap((l) => l.questions.map((q) => [`${l.id}:${q.id}`, q] as const));

  test.each(questions)('%s — a true/false answer is True or False', (_label, q) => {
    if (q.kind !== 'truefalse') return;
    expect(['True', 'False']).toContain(q.answer);
  });

  test.each(questions)('%s — a standing answer is one of the three standings', (_label, q) => {
    if (q.kind !== 'standing') return;
    expect(STANDINGS as readonly string[]).toContain(q.answer);
  });

  test.each(questions)('%s — a choice answer is among its own options', (_label, q) => {
    if (q.kind !== 'choice') return;
    expect(q.options).toBeDefined();
    expect(q.options!.length).toBeGreaterThanOrEqual(2);
    expect(q.options).toContain(q.answer);
    expect(new Set(q.options).size).toBe(q.options!.length);
  });

  test.each(questions)('%s — an order answer is exactly its events, joined', (_label, q) => {
    if (q.kind !== 'order') return;
    expect(q.options).toBeDefined();
    expect(q.options!.length).toBeGreaterThanOrEqual(3);
    // The authored answer must be a permutation of the events, joined by the
    // separator the player builds with — otherwise it can never be matched.
    expect(q.answer.split(ORDER_SEP).slice().sort()).toEqual(q.options!.slice().sort());
  });

  test.each(questions)('%s — every question explains itself', (_label, q) => {
    expect(q.explain.trim().length).toBeGreaterThan(0);
  });
});

describe('steps', () => {
  test('teaching cards come before questions in every lesson', () => {
    for (const lesson of LESSONS) {
      const steps = lessonSteps(lesson);
      const lastTeach = steps.map((s) => s.kind).lastIndexOf('teach');
      const firstQuestion = steps.findIndex((s) => s.kind !== 'teach');
      if (lastTeach >= 0 && firstQuestion >= 0) expect(lastTeach).toBeLessThan(firstQuestion);
    }
  });

  test('only questions are graded, and gradedCount matches', () => {
    for (const lesson of LESSONS) {
      const steps = lessonSteps(lesson);
      expect(steps.filter(isGraded).every((s) => s.kind !== 'teach')).toBe(true);
      expect(gradedCount(steps)).toBe(steps.filter((s) => s.kind !== 'teach').length);
    }
  });

  test('every generated question step still contains its own answer', () => {
    for (const lesson of LESSONS) {
      for (const step of lessonSteps(lesson)) {
        if (step.kind === 'teach' || step.kind === 'order') continue;
        expect(step.options).toContain(step.answer);
      }
    }
  });

  test('an order step offers every event as a tile', () => {
    for (const lesson of LESSONS) {
      for (const step of lessonSteps(lesson)) {
        if (step.kind !== 'order') continue;
        expect(step.tiles!.slice().sort()).toEqual(step.answer.split(ORDER_SEP).slice().sort());
      }
    }
  });

  test('option order is deterministic across calls', () => {
    const lesson = LESSONS[0]!;
    expect(lessonSteps(lesson)).toEqual(lessonSteps(lesson));
  });

  test('true/false and standing options keep their natural order', () => {
    // Shuffling a scale would cost the learner the distinction being taught.
    for (const lesson of LESSONS) {
      for (const step of lessonSteps(lesson)) {
        if (step.kind === 'truefalse') expect(step.options).toEqual(['True', 'False']);
        if (step.kind === 'standing') expect(step.options).toEqual(STANDINGS);
      }
    }
  });

  test('isCorrect ignores surrounding whitespace but not content', () => {
    const step = lessonSteps(LESSONS[0]!).find((s) => s.kind !== 'teach')!;
    expect(isCorrect(step, ` ${step.answer} `)).toBe(true);
    expect(isCorrect(step, `${step.answer} x`)).toBe(false);
  });
});

describe('progress math', () => {
  test('percent, pass and perfect', () => {
    expect(lessonPercent(undefined)).toBe(0);
    expect(lessonPercent({ correct: 3, total: 4 })).toBe(75);
    expect(isLessonPerfect({ correct: 4, total: 4 })).toBe(true);
    expect(isLessonPerfect({ correct: 3, total: 4 })).toBe(false);
    // Always forgives at least one slip, so a short lesson is not forced to 100%.
    expect(isLessonPassed({ correct: 3, total: 4 })).toBe(true);
    expect(isLessonPassed({ correct: 2, total: 4 })).toBe(false);
    expect(isLessonPassed(undefined)).toBe(false);
    // A wrong-only run never passes, however short the lesson. Before this,
    // `total - correct <= max(1, ...)` let a single-question lesson through on
    // zero correct answers, silently unlocking the next lesson.
    expect(isLessonPassed({ correct: 0, total: 1 })).toBe(false);
    expect(isLessonPassed({ correct: 0, total: 9 })).toBe(false);
    expect(isLessonPassed({ correct: 1, total: 1 })).toBe(true);
  });

  test('level counts attempts; xp is 10 per correct answer', () => {
    expect(courseLevel(0)).toBe(1);
    expect(courseLevel(7)).toBe(8);
    expect(xpFor([{ correct: 3, total: 4 }, { correct: 2, total: 2 }])).toBe(50);
  });
});

describe('unlocking', () => {
  test('the first ready lesson is always open and the second is not', () => {
    expect(isLessonUnlocked(READY_LESSONS[0]!.id, new Set())).toBe(true);
    expect(isLessonUnlocked(READY_LESSONS[1]!.id, new Set())).toBe(false);
  });

  test('passing a lesson opens exactly the next one', () => {
    const passed = new Set([READY_LESSONS[0]!.id]);
    expect(isLessonUnlocked(READY_LESSONS[1]!.id, passed)).toBe(true);
    expect(isLessonUnlocked(READY_LESSONS[2]!.id, passed)).toBe(false);
  });

  test('every lesson is reachable by passing them in order', () => {
    const passed = new Set<string>();
    for (const lesson of READY_LESSONS) {
      expect(isLessonUnlocked(lesson.id, passed)).toBe(true);
      passed.add(lesson.id);
    }
    expect(passed).toEqual(allPassed);
  });

  test('an unknown lesson id is never unlocked', () => {
    expect(isLessonUnlocked('no-such-lesson', allPassed)).toBe(false);
  });
});

describe('storage keys', () => {
  test('faith keys are namespaced and round-trip', () => {
    for (const lesson of LESSONS) {
      const key = storageKey(lesson.id);
      expect(isFaithKey(key)).toBe(true);
      expect(lessonIdFromKey(key)).toBe(lesson.id);
    }
  });

  test('a Coptic-course lesson id is not mistaken for a faith key', () => {
    // The two courses share the learn_lessons table; this is the seam that
    // keeps their level, XP and rank from bleeding into each other.
    expect(isFaithKey('alphabet-1')).toBe(false);
    expect(isFaithKey('words-2')).toBe(false);
  });
});
