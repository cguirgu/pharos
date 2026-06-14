/**
 * Orthodox Pascha (Resurrection) for a given Gregorian year.
 *
 * Computed with the **Julian computus** (Meeus's algorithm) — this yields the
 * date in the *Julian* calendar, which is then converted to the Gregorian
 * calendar exactly via JDN. This is the same date as Eastern Orthodox Easter.
 *
 * Verified anchors (PRD §3): 2024 = 5 May, 2025 = 20 Apr, 2026 = 12 Apr,
 * 2027 = 2 May.
 */
import type { CivilDate } from './types';
import { julianToJDN, jdnToGregorian } from './julian';

/** Orthodox Pascha as a Gregorian civil date for the given Gregorian year. */
export function orthodoxPascha(year: number): CivilDate {
  // Meeus Julian algorithm → Julian-calendar month/day.
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const f = d + e + 114;
  const julianMonth = Math.floor(f / 31); // 3 = March, 4 = April
  const julianDay = (f % 31) + 1;

  // Convert the Julian date to Gregorian.
  const jdn = julianToJDN({ year, month: julianMonth, day: julianDay });
  return jdnToGregorian(jdn);
}
