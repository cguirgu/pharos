import {
  gregorianToJDN,
  jdnToGregorian,
  weekday,
  addDays,
  diffDays,
  sameDay,
  inRange,
} from '../../src/domain/coptic';
import { julianToJDN } from '../../src/domain/coptic/julian';
import type { CivilDate } from '../../src/domain/coptic';

const D = (year: number, month: number, day: number): CivilDate => ({ year, month, day });

describe('JDN conversions', () => {
  test.each([
    [D(2000, 1, 1), 2451545], // J2000 epoch (noon)
    [D(2000, 1, 2), 2451546],
    [D(2024, 9, 12), 2460566],
    [D(2025, 9, 11), 2460930],
    [D(1970, 1, 1), 2440588],
  ])('gregorianToJDN(%o) = %i', (date, jdn) => {
    expect(gregorianToJDN(date)).toBe(jdn);
  });

  test('jdnToGregorian round-trips every day across 2024–2027', () => {
    let jdn = gregorianToJDN(D(2024, 1, 1));
    const end = gregorianToJDN(D(2027, 12, 31));
    for (; jdn <= end; jdn++) {
      expect(gregorianToJDN(jdnToGregorian(jdn))).toBe(jdn);
    }
  });

  test('julianToJDN: 13-day offset from Gregorian in the modern era', () => {
    // Julian lags Gregorian by 13 days (1900–2099): the Julian date with the
    // same numbers lands 13 days later, so its JDN is 13 larger.
    expect(julianToJDN(D(2026, 1, 1)) - gregorianToJDN(D(2026, 1, 1))).toBe(13);
  });
});

describe('weekday', () => {
  test.each([
    [D(2000, 1, 1), 6], // Saturday
    [D(2000, 1, 2), 0], // Sunday
    [D(2026, 4, 12), 0], // Pascha 2026 — a Sunday
    [D(2026, 6, 10), 3], // Wednesday
  ])('weekday(%o) = %i', (date, wd) => {
    expect(weekday(date)).toBe(wd);
  });

  test('all Paschas are Sundays', () => {
    // (spot-checked here; the engine derives movable feasts from this)
    expect(weekday(D(2024, 5, 5))).toBe(0);
    expect(weekday(D(2025, 4, 20))).toBe(0);
    expect(weekday(D(2027, 5, 2))).toBe(0);
  });
});

describe('date arithmetic', () => {
  test('addDays crosses month and year boundaries', () => {
    expect(addDays(D(2026, 2, 28), 1)).toEqual(D(2026, 3, 1));
    expect(addDays(D(2024, 2, 28), 1)).toEqual(D(2024, 2, 29)); // 2024 leap
    expect(addDays(D(2026, 12, 31), 1)).toEqual(D(2027, 1, 1));
    expect(addDays(D(2026, 1, 1), -1)).toEqual(D(2025, 12, 31));
  });

  test('diffDays is signed and consistent with addDays', () => {
    expect(diffDays(D(2026, 4, 12), D(2026, 4, 12))).toBe(0);
    expect(diffDays(D(2026, 1, 8), D(2026, 1, 1))).toBe(7);
    expect(diffDays(D(2026, 1, 1), D(2026, 1, 8))).toBe(-7);
  });

  test('sameDay / inRange', () => {
    expect(sameDay(D(2026, 6, 10), D(2026, 6, 10))).toBe(true);
    expect(sameDay(D(2026, 6, 10), D(2026, 6, 11))).toBe(false);
    expect(inRange(D(2026, 6, 10), D(2026, 6, 1), D(2026, 6, 30))).toBe(true);
    expect(inRange(D(2026, 7, 1), D(2026, 6, 1), D(2026, 6, 30))).toBe(false);
    expect(inRange(D(2026, 6, 1), D(2026, 6, 1), D(2026, 6, 30))).toBe(true); // inclusive
  });
});
