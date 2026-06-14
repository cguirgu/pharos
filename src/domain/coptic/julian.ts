/**
 * Julian Day Number (JDN) conversions and civil-date arithmetic.
 *
 * The JDN is an integer day count that makes calendar conversion and date
 * arithmetic exact and timezone-free. Everything in the engine routes through
 * here. Formulas are the standard ones from Meeus / "Calendrical Calculations"
 * and are verified by `__tests__/coptic/julian.test.ts`.
 */
import type { CivilDate } from './types';

/** Gregorian civil date → Julian Day Number (at noon). */
export function gregorianToJDN(d: CivilDate): number {
  const a = Math.floor((14 - d.month) / 12);
  const y = d.year + 4800 - a;
  const m = d.month + 12 * a - 3;
  return (
    d.day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** Julian Day Number → Gregorian civil date. */
export function jdnToGregorian(jdn: number): CivilDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

/** Julian (Old Style) civil date → Julian Day Number. */
export function julianToJDN(d: CivilDate): number {
  const a = Math.floor((14 - d.month) / 12);
  const y = d.year + 4800 - a;
  const m = d.month + 12 * a - 3;
  return d.day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
}

/** Day of week. 0 = Sunday … 6 = Saturday. */
export function weekday(d: CivilDate): number {
  return (gregorianToJDN(d) + 1) % 7;
}

/** Add `n` days (may be negative) to a Gregorian date. */
export function addDays(d: CivilDate, n: number): CivilDate {
  return jdnToGregorian(gregorianToJDN(d) + n);
}

/** Whole-day difference `a - b` (positive when `a` is later). */
export function diffDays(a: CivilDate, b: CivilDate): number {
  return gregorianToJDN(a) - gregorianToJDN(b);
}

/** Structural equality of two civil dates. */
export function sameDay(a: CivilDate, b: CivilDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/** True when `d` falls in `[start, end]` inclusive. */
export function inRange(d: CivilDate, start: CivilDate, end: CivilDate): boolean {
  const j = gregorianToJDN(d);
  return j >= gregorianToJDN(start) && j <= gregorianToJDN(end);
}
