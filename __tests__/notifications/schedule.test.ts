import { nextTriggers, buildSchedule, type ScheduleContext } from '../../src/domain/notifications/schedule';
import { DEFAULT_CONFIG, normalizeConfig, type NotificationConfig } from '../../src/domain/notifications/types';
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

describe('buildSchedule (configurable channels)', () => {
  const ctx: ScheduleContext = { practices: [], logsByPractice: {}, hasReadingPlan: false };
  const allOff: NotificationConfig = normalizeConfig(
    Object.fromEntries(Object.keys(DEFAULT_CONFIG).map((k) => [k, { enabled: false, time: '09:00' }])),
  );
  const on = (over: Partial<Record<keyof NotificationConfig, { enabled: boolean; time?: string }>>): NotificationConfig =>
    normalizeConfig({ ...allOff, ...over });

  test('everything off → nothing scheduled', () => {
    expect(buildSchedule(allOff, ctx, FROM, 7)).toHaveLength(0);
  });

  test('a daily channel (learn) fires once per day at its time', () => {
    const s = buildSchedule(on({ learn: { enabled: true, time: '19:30' } }), ctx, FROM, 7);
    expect(s).toHaveLength(7);
    expect(s.every((n) => n.channel === 'learn' && n.time === '19:30')).toBe(true);
  });

  test('reading only fires while following a plan', () => {
    const cfg = on({ reading: { enabled: true } });
    expect(buildSchedule(cfg, { ...ctx, hasReadingPlan: false }, FROM, 7)).toHaveLength(0);
    expect(buildSchedule(cfg, { ...ctx, hasReadingPlan: true }, FROM, 7)).toHaveLength(7);
  });

  test('fast channel only on fast days (Wed/Fri in this ordinary week)', () => {
    const s = buildSchedule(on({ fast: { enabled: true } }), ctx, FROM, 7);
    expect(s).toHaveLength(2);
    expect(s.every((n) => n.channel === 'fast')).toBe(true);
  });

  test('practices channel merges per-practice due-day reminders', () => {
    const p = practice({ id: 'daily', cadence: { type: 'daily' } });
    const s = buildSchedule(on({ practices: { enabled: true } }), { ...ctx, practices: [p] }, FROM, 7);
    expect(s.filter((n) => n.channel === 'practices')).toHaveLength(7);
  });

  test('soonest-first ordering and a hard cap', () => {
    const s = buildSchedule(on({ learn: { enabled: true } }), ctx, FROM, 30, 5);
    expect(s).toHaveLength(5); // capped
    // ascending by date
    expect(s.map((n) => n.date.day)).toEqual([5, 6, 7, 8, 9]);
  });
});
