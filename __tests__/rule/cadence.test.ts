import { isDueOn, cadenceSummary } from '../../src/domain/rule';
import type { Practice, PracticeLog, Cadence } from '../../src/domain/rule';
import type { CivilDate } from '../../src/domain/coptic';

const D = (m: number, d: number): CivilDate => ({ year: 2026, month: m, day: d });

function practice(cadence: Cadence, over: Partial<Practice> = {}): Practice {
  return {
    id: 'p1',
    createdAt: 0,
    name: 'Test',
    category: 'prayer',
    kind: 'custom',
    cadence,
    measure: 'binary',
    state: 'active',
    sortOrder: 0,
    ...over,
  };
}

const kept = (date: CivilDate): PracticeLog => ({ practiceId: 'p1', date, status: 'kept' });

describe('cadence: due-today (PRD §4.2)', () => {
  test('every day', () => {
    const p = practice({ type: 'daily' });
    expect(isDueOn(p, D(6, 10))).toBe(true);
    expect(isDueOn(p, D(1, 1))).toBe(true);
  });

  test('certain weekdays (Wed & Fri)', () => {
    const p = practice({ type: 'weekdays', days: [3, 5] });
    expect(isDueOn(p, D(6, 10))).toBe(true); // Wed
    expect(isDueOn(p, D(6, 12))).toBe(true); // Fri
    expect(isDueOn(p, D(6, 11))).toBe(false); // Thu
    expect(isDueOn(p, D(6, 13))).toBe(false); // Sat
  });

  test('on fast days — follows the calendar engine', () => {
    const p = practice({ type: 'fastDays' });
    expect(isDueOn(p, D(6, 10))).toBe(true); // Apostles' Fast Wednesday
    expect(isDueOn(p, D(4, 29))).toBe(false); // Holy Fifty Wednesday — no fast
    expect(isDueOn(p, D(2, 16))).toBe(true); // Great Lent Monday
  });

  test('during a season only', () => {
    const p = practice({ type: 'season', season: 'great-lent' });
    expect(isDueOn(p, D(2, 16))).toBe(true); // in Lent
    expect(isDueOn(p, D(6, 10))).toBe(false); // Apostles' Fast, not Lent
  });

  test('N times per week — due until the quota is met (week Sun–Sat)', () => {
    const p = practice({ type: 'timesPerWeek', n: 3 });
    // Week of Sun 2026-06-07 … Sat 2026-06-13.
    const logs = [kept(D(6, 7)), kept(D(6, 8)), kept(D(6, 9))];
    expect(isDueOn(p, D(6, 9), [kept(D(6, 7)), kept(D(6, 8))])).toBe(true); // 2 < 3
    expect(isDueOn(p, D(6, 10), logs)).toBe(false); // quota met (3)
    expect(isDueOn(p, D(6, 14), logs)).toBe(true); // next week resets
    expect(isDueOn(p, D(6, 10), [])).toBe(true); // nothing logged → due
  });

  test('once a week / once a month — due until done in the period', () => {
    const week = practice({ type: 'perPeriod', period: 'week' });
    const month = practice({ type: 'perPeriod', period: 'month' });
    const wlog = [kept(D(6, 8))];
    expect(isDueOn(week, D(6, 9), wlog)).toBe(false); // already done this week
    expect(isDueOn(week, D(6, 14), wlog)).toBe(true); // new week
    const mlog = [kept(D(6, 3))];
    expect(isDueOn(month, D(6, 20), mlog)).toBe(false); // done this month
    expect(isDueOn(month, D(7, 1), mlog)).toBe(true); // new month
  });

  test('inactive practices are never due', () => {
    expect(isDueOn(practice({ type: 'daily' }, { state: 'paused' }), D(6, 10))).toBe(false);
    expect(isDueOn(practice({ type: 'daily' }, { state: 'archived' }), D(6, 10))).toBe(false);
  });
});

describe('cadenceSummary', () => {
  test.each<[Cadence, string]>([
    [{ type: 'daily' }, 'Every day'],
    [{ type: 'weekdays', days: [3, 5] }, 'Wed · Fri'],
    [{ type: 'timesPerWeek', n: 3 }, '3× a week'],
    [{ type: 'fastDays' }, 'On fast days'],
    [{ type: 'perPeriod', period: 'week' }, 'Once a week'],
    [{ type: 'perPeriod', period: 'month' }, 'Once a month'],
  ])('%o → %s', (c, s) => {
    expect(cadenceSummary(c)).toBe(s);
  });
});
