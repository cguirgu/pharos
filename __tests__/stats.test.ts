import { youStats, flameGrid } from '../src/domain/stats';
import { addDays } from '../src/domain/coptic';
import type { Practice, PracticeLog } from '../src/domain/rule';
import type { CivilDate } from '../src/domain/coptic';

const TODAY: CivilDate = { year: 2026, month: 10, day: 20 };

const daily = (id: string, category: Practice['category']): Practice => ({
  id, createdAt: 0, name: id, category, kind: 'custom',
  cadence: { type: 'daily' }, measure: 'binary', state: 'active', sortOrder: 0,
});
const keptRun = (id: string, count: number): PracticeLog[] =>
  Array.from({ length: count }, (_, i) => ({ practiceId: id, date: addDays(TODAY, -(count - 1 - i)), status: 'kept' as const }));

describe('youStats', () => {
  test('streak, total prayers, and offices feed the ledger', () => {
    const prayer = daily('pray', 'prayer');
    const s = youStats({
      practices: [prayer],
      logsByPractice: { pray: keptRun('pray', 5) },
      restDays: new Set(),
      officeCompletions: 3,
      today: TODAY,
      since: addDays(TODAY, -20),
    });
    expect(s.streak).toBe(5);
    expect(s.totalPrayers).toBe(8); // 5 kept prayer logs + 3 offices
  });

  test('% Wed/Fri counts only fast-practice due days', () => {
    const fast = { ...daily('fast', 'fast'), cadence: { type: 'fastDays' } as const };
    // 2026-10-07 (Wed) kept, 2026-10-09 (Fri) missed → 1 of 2 = 50% so far this window
    const s = youStats({
      practices: [fast],
      logsByPractice: { fast: [{ practiceId: 'fast', date: { year: 2026, month: 10, day: 7 }, status: 'kept' }] },
      restDays: new Set(),
      officeCompletions: 0,
      today: { year: 2026, month: 10, day: 12 },
      since: { year: 2026, month: 10, day: 5 },
    });
    expect(s.wedFriPercent).toBe(50);
  });
});

describe('flameGrid', () => {
  test('is 4×7 and marks complete days', () => {
    const grid = flameGrid({
      practices: [daily('p', 'prayer')],
      logsByPractice: { p: keptRun('p', 3) },
      restDays: new Set(),
      officeCompletions: 0,
      today: TODAY,
    }, 4);
    expect(grid).toHaveLength(4);
    grid.forEach((w) => expect(w).toHaveLength(7));
    const todays = grid.flat().filter((c) => c.isToday);
    expect(todays).toHaveLength(1);
    expect(todays[0]!.complete).toBe(true);
  });
});
