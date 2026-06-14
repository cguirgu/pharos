/**
 * Feast detection.
 *
 * Two kinds:
 *  - **Fixed** feasts, keyed by Coptic month/day (they drift slowly against the
 *    Gregorian calendar, so we test the Coptic date, never a hardcoded Gregorian
 *    one). Includes the monthly commemorations.
 *  - **Movable** feasts, computed as offsets from Pascha.
 *
 * `lordFeast` marks a Feast of the Lord; `major` marks one of the Seven Major
 * Feasts of the Lord, which break the Wednesday/Friday fast.
 *
 * TODO(verify-liturgical): minor Feasts of the Lord (incl. the two Feasts of
 * the Cross) also break the Wed/Fri fast by some uses. We take the safer
 * (stricter) default and do NOT break the fast for them; see TESTING.md.
 * TODO(verify-liturgical): the monthly day-29 commemoration is suppressed during
 * Great Lent by custom — modelled here, flagged for the owner to confirm.
 */
import type { CivilDate, CopticDate, Feast } from './types';
import { sameDay, addDays, inRange } from './julian';
import { toCoptic } from './copticDate';
import { orthodoxPascha } from './pascha';

interface FixedFeast {
  key: string;
  name: string;
  copticMonth: number;
  copticDay: number;
  lordFeast: boolean;
  major: boolean;
}

const FIXED_FEASTS: readonly FixedFeast[] = [
  { key: 'nayrouz', name: 'Nayrouz — Coptic New Year', copticMonth: 1, copticDay: 1, lordFeast: false, major: false },
  { key: 'cross-tout', name: 'Feast of the Cross', copticMonth: 1, copticDay: 17, lordFeast: true, major: false },
  { key: 'nativity', name: 'The Nativity of the Lord', copticMonth: 4, copticDay: 29, lordFeast: true, major: true },
  { key: 'theophany', name: 'Theophany (the Baptism of the Lord)', copticMonth: 5, copticDay: 11, lordFeast: true, major: true },
  { key: 'cross-paremhat', name: 'Feast of the Cross', copticMonth: 7, copticDay: 10, lordFeast: true, major: false },
  { key: 'annunciation', name: 'The Annunciation', copticMonth: 7, copticDay: 29, lordFeast: true, major: true },
];

/** Monthly commemorations (every Coptic month) — minor feasts. */
const MONTHLY: Record<number, { key: string; name: string }> = {
  12: { key: 'st-michael', name: 'Archangel Michael (monthly)' },
  21: { key: 'st-mary', name: 'St Mary (monthly)' },
  29: { key: 'lordly-commemoration', name: 'Annunciation · Nativity · Resurrection (monthly)' },
};

interface MovableFeast {
  key: string;
  name: string;
  offset: number; // days from Pascha
  lordFeast: boolean;
  major: boolean;
}

const MOVABLE_FEASTS: readonly MovableFeast[] = [
  { key: 'palm-sunday', name: 'Palm Sunday (the Entry into Jerusalem)', offset: -7, lordFeast: true, major: true },
  { key: 'pascha', name: 'The Resurrection (Pascha)', offset: 0, lordFeast: true, major: true },
  { key: 'ascension', name: 'The Ascension of the Lord', offset: 39, lordFeast: true, major: true },
  { key: 'pentecost', name: 'Pentecost', offset: 49, lordFeast: true, major: true },
];

/** All feasts falling on `date`, highest-precedence first. */
export function feastsOn(date: CivilDate): Feast[] {
  const coptic = toCoptic(date);
  const pascha = orthodoxPascha(date.year);
  const out: Feast[] = [];

  // Movable first — Pascha and the Seven Majors take precedence in display.
  for (const m of MOVABLE_FEASTS) {
    if (sameDay(date, addDays(pascha, m.offset))) {
      out.push({ key: m.key, name: m.name, lordFeast: m.lordFeast, major: m.major });
    }
  }

  // Fixed feasts of the Lord.
  for (const f of FIXED_FEASTS) {
    if (coptic.month === f.copticMonth && coptic.day === f.copticDay) {
      out.push({ key: f.key, name: f.name, lordFeast: f.lordFeast, major: f.major });
    }
  }

  // Monthly commemorations (skip day 29 when it is already a great fixed feast,
  // and — per custom — during Great Lent).
  const monthly = MONTHLY[coptic.day];
  if (monthly && !out.some((o) => o.key === monthly.key)) {
    const alreadyMajor = out.some((o) => o.major);
    const inLent = isWithinGreatLent(date, pascha);
    if (!(coptic.day === 29 && (alreadyMajor || inLent))) {
      out.push({ key: monthly.key, name: monthly.name, lordFeast: false, major: false });
    }
  }

  return out;
}

/** The single most significant feast on `date`, or null. */
export function primaryFeast(date: CivilDate): Feast | null {
  return feastsOn(date)[0] ?? null;
}

/** True when `date` is one of the Seven Major Feasts of the Lord. */
export function isMajorLordFeast(date: CivilDate): boolean {
  return feastsOn(date).some((f) => f.major);
}

/** Helper used to suppress the day-29 commemoration during the Great Fast. */
function isWithinGreatLent(date: CivilDate, pascha: CivilDate): boolean {
  return inRange(date, addDays(pascha, -55), addDays(pascha, -1));
}

/** The two fixed Cross feasts and Nativity/Theophany as Coptic-date constants. */
export { FIXED_FEASTS, MOVABLE_FEASTS };
export type { CopticDate };
