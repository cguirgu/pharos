import { evaluateMarks, type MarkKey } from '../src/domain/marks';
import { addDays } from '../src/domain/coptic';
import type { Practice, PracticeLog } from '../src/domain/rule';
import type { CivilDate } from '../src/domain/coptic';

const TODAY: CivilDate = { year: 2026, month: 10, day: 20 };

const daily = (id: string, category: Practice['category'] = 'prayer'): Practice => ({
  id, createdAt: 0, name: id, category, kind: 'custom',
  cadence: { type: 'daily' }, measure: 'binary', state: 'active', sortOrder: 0,
});

const keptRun = (id: string, endInclusive: CivilDate, count: number): PracticeLog[] =>
  Array.from({ length: count }, (_, i) => ({
    practiceId: id,
    date: addDays(endInclusive, -(count - 1 - i)),
    status: 'kept' as const,
  }));

const find = (marks: ReturnType<typeof evaluateMarks>, key: MarkKey) => marks.find((m) => m.key === key)!;

describe('Marks (PRD §5.6)', () => {
  test('14 consecutive kept days earns First light, A full week, and Flame of xiv', () => {
    const p = daily('p1');
    const marks = evaluateMarks({
      practices: [p],
      logsByPractice: { p1: keptRun('p1', TODAY, 14) },
      restDays: new Set(),
      journalCount: 0,
      planDaysCompleted: 0,
      today: TODAY,
      since: addDays(TODAY, -30),
    });
    expect(find(marks, 'first-light').earned).toBe(true);
    expect(find(marks, 'first-light').earnedOn).toEqual(addDays(TODAY, -13));
    expect(find(marks, 'a-full-week').earned).toBe(true);
    expect(find(marks, 'a-full-week').earnedOn).toEqual(addDays(TODAY, -7));
    expect(find(marks, 'flame-of-xiv').earned).toBe(true);
    expect(find(marks, 'flame-of-xiv').earnedOn).toEqual(TODAY);
  });

  test('13 consecutive kept days: A full week earned, Flame of xiv NOT yet', () => {
    const marks = evaluateMarks({
      practices: [daily('p1')],
      logsByPractice: { p1: keptRun('p1', TODAY, 13) },
      restDays: new Set(),
      journalCount: 0,
      planDaysCompleted: 0,
      today: TODAY,
      since: addDays(TODAY, -30),
    });
    expect(find(marks, 'a-full-week').earned).toBe(true);
    expect(find(marks, 'flame-of-xiv').earned).toBe(false);
    expect(find(marks, 'flame-of-xiv').earnedOn).toBeNull();
  });

  test('First fast: first Wed/Fri kept on a fast practice', () => {
    const fast = { ...daily('f1', 'fast'), cadence: { type: 'fastDays' } as const };
    // 2026-10-07 is a Wednesday in ordinary time → a fast day.
    const log: PracticeLog = { practiceId: 'f1', date: { year: 2026, month: 10, day: 7 }, status: 'kept' };
    const marks = evaluateMarks({
      practices: [fast],
      logsByPractice: { f1: [log] },
      restDays: new Set(),
      journalCount: 0,
      planDaysCompleted: 0,
      today: TODAY,
      since: { year: 2026, month: 10, day: 1 },
    });
    expect(find(marks, 'first-fast').earned).toBe(true);
    expect(find(marks, 'first-fast').earnedOn).toEqual({ year: 2026, month: 10, day: 7 });
  });

  test('Gospel reader (7 plan days) and Seven reflections (7 journal entries) are count-gated', () => {
    const base = {
      practices: [daily('p1')],
      logsByPractice: { p1: [] as PracticeLog[] },
      restDays: new Set<string>(),
      today: TODAY,
      since: addDays(TODAY, -10),
    };
    const under = evaluateMarks({ ...base, journalCount: 6, planDaysCompleted: 6 });
    expect(find(under, 'gospel-reader').earned).toBe(false);
    expect(find(under, 'seven-reflections').earned).toBe(false);
    const over = evaluateMarks({ ...base, journalCount: 7, planDaysCompleted: 7 });
    expect(find(over, 'gospel-reader').earned).toBe(true);
    expect(find(over, 'seven-reflections').earned).toBe(true);
  });

  test('a fresh account has earned nothing', () => {
    const marks = evaluateMarks({
      practices: [daily('p1')],
      logsByPractice: {},
      restDays: new Set(),
      journalCount: 0,
      planDaysCompleted: 0,
      today: TODAY,
      since: addDays(TODAY, -10),
    });
    expect(marks.every((m) => !m.earned)).toBe(true);
    expect(marks).toHaveLength(6);
  });
});
