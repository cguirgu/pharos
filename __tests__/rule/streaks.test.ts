import {
  practiceStreak,
  practiceStats,
  historyGrid,
  globalFlame,
  dateKey,
} from '../../src/domain/rule';
import type { Practice, PracticeLog, DayStatus, Cadence } from '../../src/domain/rule';
import type { CivilDate } from '../../src/domain/coptic';

const D = (m: number, d: number): CivilDate => ({ year: 2026, month: m, day: d });

function practice(id: string, cadence: Cadence): Practice {
  return {
    id,
    createdAt: 0,
    name: id,
    category: 'prayer',
    kind: 'custom',
    cadence,
    measure: 'binary',
    state: 'active',
    sortOrder: 0,
  };
}
const log = (id: string, date: CivilDate, status: DayStatus): PracticeLog => ({
  practiceId: id,
  date,
  status,
});

const TODAY = D(6, 15); // Monday

describe('practiceStreak (PRD §4.4)', () => {
  const daily = practice('p1', { type: 'daily' });

  test('counts kept/part back from today; today-open is pending (not counted)', () => {
    const logs = [
      log('p1', D(6, 10), 'kept'),
      log('p1', D(6, 11), 'kept'),
      log('p1', D(6, 12), 'part'), // part preserves the streak
      log('p1', D(6, 13), 'kept'),
      log('p1', D(6, 14), 'kept'),
    ];
    expect(practiceStreak(daily, logs, { today: TODAY, since: D(6, 1) })).toBe(5);
  });

  test('a missed due day breaks the streak', () => {
    const logs = [log('p1', D(6, 13), 'kept'), log('p1', D(6, 14), 'kept')];
    // 6/12 is due (daily) with no log → missed → break after 2.
    expect(practiceStreak(daily, logs, { today: TODAY, since: D(6, 1) })).toBe(2);
  });

  test('a completion today extends the streak', () => {
    const logs = [
      log('p1', D(6, 13), 'kept'),
      log('p1', D(6, 14), 'kept'),
      log('p1', TODAY, 'kept'),
    ];
    expect(practiceStreak(daily, logs, { today: TODAY, since: D(6, 1) })).toBe(3);
  });

  test('non-due days are skipped (weekday cadence)', () => {
    const wf = practice('p1', { type: 'weekdays', days: [3, 5] }); // Wed & Fri
    const logs = [log('p1', D(6, 10), 'kept'), log('p1', D(6, 12), 'kept')]; // Wed, Fri
    // 6/5 (Fri) is the next due day back and has no log → missed → break at 2.
    expect(practiceStreak(wf, logs, { today: TODAY, since: D(6, 1) })).toBe(2);
  });
});

describe('practiceStats', () => {
  test('keptPercent counts only resolved due days', () => {
    const daily = practice('p1', { type: 'daily' });
    const logs = [
      log('p1', D(6, 10), 'kept'),
      log('p1', D(6, 11), 'kept'),
      log('p1', D(6, 12), 'part'),
      log('p1', D(6, 13), 'kept'),
      // 6/14 missed; 6/15 (today) open → excluded
    ];
    const s = practiceStats(daily, logs, { today: TODAY, since: D(6, 10) });
    expect(s).toEqual({ dueDays: 5, keptDays: 3, partDays: 1, missedDays: 1, keptPercent: 60 });
  });
});

describe('historyGrid', () => {
  test('is 4 rows × 7 columns with exactly one "today" cell', () => {
    const daily = practice('p1', { type: 'daily' });
    const grid = historyGrid(daily, [log('p1', TODAY, 'kept')], TODAY);
    expect(grid).toHaveLength(4);
    grid.forEach((row) => expect(row).toHaveLength(7));
    const todays = grid.flat().filter((c) => c.isToday);
    expect(todays).toHaveLength(1);
    expect(todays[0]!.status).toBe('kept');
  });

  test('non-due days are blank (weekday cadence)', () => {
    const wf = practice('p1', { type: 'weekdays', days: [3, 5] });
    const cells = historyGrid(wf, [], TODAY).flat();
    const due = cells.filter((c) => c.due);
    expect(due.every((c) => c.status !== null)).toBe(true);
    expect(cells.filter((c) => !c.due).every((c) => c.status === null)).toBe(true);
  });
});

describe('globalFlame (the flame, PRD §4.5)', () => {
  const p1 = practice('p1', { type: 'daily' });
  const p2 = practice('p2', { type: 'daily' });
  const logs = {
    p1: [
      log('p1', D(6, 12), 'kept'),
      log('p1', D(6, 13), 'kept'),
      log('p1', D(6, 14), 'kept'),
      log('p1', TODAY, 'kept'),
    ],
    p2: [
      log('p2', D(6, 12), 'kept'),
      log('p2', D(6, 13), 'kept'),
      log('p2', D(6, 14), 'kept'),
      // p2 not done today → today incomplete but pending
    ],
  };

  test('every-practice-kept days count; today incomplete is pending', () => {
    expect(globalFlame([p1, p2], logs, { today: TODAY, since: D(6, 1) })).toBe(3);
  });

  test('a Rest Day keeps the flame lit', () => {
    const restDays = new Set([dateKey(D(6, 11))]);
    // 6/11 has no completions → would break, but it is a declared Rest Day.
    expect(globalFlame([p1, p2], logs, { today: TODAY, since: D(6, 1), restDays })).toBe(4);
  });

  test('paused practices do not drag the flame down', () => {
    const paused = practice('p2', { type: 'daily' });
    const pausedP2: Practice = { ...paused, state: 'paused' };
    // With p2 paused (never due), only p1 matters; p1 is kept 6/12–6/15.
    expect(globalFlame([p1, pausedP2], logs, { today: TODAY, since: D(6, 1) })).toBe(4);
  });
});
