/**
 * Gregorian ↔ Coptic (Anno Martyrum) calendar conversion.
 *
 * The Coptic year has 12 months of 30 days plus a 13th "little month"
 * (Pi Kogi Enavot) of 5 days — 6 in a Coptic leap year (year mod 4 === 3,
 * the year preceding a Julian leap year). The era counts from the accession
 * of Diocletian: 1 Thout 1 AM = 29 Aug 284 (Julian).
 *
 * The epoch constant below is verified against the published anchors in
 * PRD §3: 1 Thout 1742 AM = 11 Sep 2025; 1 Thout 1741 AM = 11 Sep 2024.
 * (See the note in TESTING.md about the PRD's "Sept 12, 2024" example.)
 */
import type { CivilDate, CopticDate } from './types';
import { gregorianToJDN, jdnToGregorian } from './julian';

/** JDN of 1 Thout 1 AM. */
const COPTIC_EPOCH = 1825030;

export const COPTIC_MONTHS = [
  'Thout',
  'Paopi',
  'Hathor',
  'Koiak',
  'Tobi',
  'Meshir',
  'Paremhat',
  'Paremoude',
  'Pashons',
  'Paoni',
  'Epip',
  'Mesori',
  'Pi Kogi Enavot',
] as const;

/** A Coptic year is leap (Pi Kogi Enavot has 6 days) when `year % 4 === 3`. */
export function isCopticLeapYear(year: number): boolean {
  return ((year % 4) + 4) % 4 === 3;
}

/** JDN of a Coptic year/month/day. */
export function copticToJDN(year: number, month: number, day: number): number {
  return COPTIC_EPOCH - 1 + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day;
}

/** JDN → Coptic date. */
export function copticFromJDN(jdn: number): CopticDate {
  const year = Math.floor((4 * (jdn - COPTIC_EPOCH) + 1463) / 1461);
  const startOfYear = copticToJDN(year, 1, 1);
  const month = Math.floor((jdn - startOfYear) / 30) + 1;
  const day = jdn - copticToJDN(year, month, 1) + 1;
  return { year, month, day, monthName: COPTIC_MONTHS[month - 1] ?? '' };
}

/** Gregorian civil date → Coptic date. */
export function toCoptic(d: CivilDate): CopticDate {
  return copticFromJDN(gregorianToJDN(d));
}

/** Coptic year/month/day → Gregorian civil date. */
export function fromCoptic(year: number, month: number, day: number): CivilDate {
  return jdnToGregorian(copticToJDN(year, month, day));
}

/** Number of days in a Coptic month (30, or 5/6 for the 13th). */
export function copticMonthLength(year: number, month: number): number {
  if (month <= 12) return 30;
  return isCopticLeapYear(year) ? 6 : 5;
}
