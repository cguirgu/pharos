/**
 * Small date helpers for the Rule engine. Weeks run Sun–Sat (PRD §4.2/4.4).
 */
import type { CivilDate } from '../coptic/types';
import { weekday, addDays, gregorianToJDN } from '../coptic/julian';

/** Stable "YYYY-MM-DD" key for map/equality use. */
export function dateKey(d: CivilDate): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

/**
 * Inverse of `dateKey`. Null on anything malformed — callers decide what to do
 * about a bad route param rather than silently landing on some arbitrary day.
 */
export function parseDateKey(key: string): CivilDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key ?? '');
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/** Sunday that starts the week containing `d`. */
export function weekStart(d: CivilDate): CivilDate {
  return addDays(d, -weekday(d));
}

/** First day of the month containing `d`. */
export function monthStart(d: CivilDate): CivilDate {
  return { year: d.year, month: d.month, day: 1 };
}

/** True when `a` and `b` fall in the same Sun–Sat week. */
export function sameWeek(a: CivilDate, b: CivilDate): boolean {
  return dateKey(weekStart(a)) === dateKey(weekStart(b));
}

/** True when `a` and `b` fall in the same calendar month. */
export function sameMonth(a: CivilDate, b: CivilDate): boolean {
  return a.year === b.year && a.month === b.month;
}

/** Re-exported for convenience. */
export { gregorianToJDN, addDays, weekday };
