import { nextTriggers } from '../../src/domain/notifications/schedule';
import type { Practice } from '../../src/domain/rule';
import type { CivilDate } from '../../src/domain/coptic';

const FROM: CivilDate = { year: 2026, month: 10, day: 5 }; // Monday

function practice(over: Partial<Practice> & Pick<Practice, 'id' | 'cadence'>): Practice {
  return {
    createdAt: 0, name: over.id, category: 'prayer', kind: 'custom', measure: 'binary',
    state: 'active', sortOrder: 0, reminder: { time: '06:00', enabled: true },
    ...over,
  };
}

describe('nextTriggers (PRD §5.7 — due days only)', () => {
  test('a daily reminder fires every day in the window', () => {
    const p = practice({ id: 'daily', cadence: { type: 'daily' } });
    expect(nextTriggers([p], {}, FROM, 7)).toHaveLength(7);
  });

  test('a weekday reminder fires only on chosen weekdays', () => {
    const p = practice({ id: 'wf', cadence: { type: 'weekdays', days: [3, 5] } }); // Wed & Fri
    const t = nextTriggers([p], {}, FROM, 7); // 10-05 Mon … 10-11 Sun
    expect(t).toHaveLength(2); // Wed 10-07, Fri 10-09
    expect(t.map((x) => x.date.day).sort()).toEqual([7, 9]);
    expect(t.every((x) => x.time === '06:00')).toBe(true);
  });

  test('a fast-day reminder follows the calendar (Wed/Fri in ordinary time)', () => {
    const p = practice({ id: 'fast', cadence: { type: 'fastDays' } });
    expect(nextTriggers([p], {}, FROM, 7)).toHaveLength(2);
  });

  test('disabled reminders, paused practices, and no-reminder practices are excluded', () => {
    const off = practice({ id: 'off', cadence: { type: 'daily' }, reminder: { time: '06:00', enabled: false } });
    const paused = practice({ id: 'paused', cadence: { type: 'daily' }, state: 'paused' });
    const none = { ...practice({ id: 'none', cadence: { type: 'daily' } }), reminder: undefined };
    expect(nextTriggers([off, paused, none], {}, FROM, 7)).toHaveLength(0);
  });
});
