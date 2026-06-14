/**
 * Liturgical season / fast-span detection.
 *
 * Movable seasons are computed as offsets from Orthodox Pascha; fixed-date
 * fasts (Dormition, Nativity) from Gregorian anchors. Boundaries follow PRD §3.
 *
 * TODO(verify-liturgical): exact Apostles' Fast end (Feast of Sts Peter & Paul,
 * Epip 5) is taken as a fixed 12 July for 1900–2099. The Dormition Fast fish
 * allowance is a widespread custom, modelled as a flag. See TESTING.md.
 */
import type { CivilDate, SeasonInfo } from './types';
import { addDays, inRange, diffDays } from './julian';
import { orthodoxPascha } from './pascha';

const NAMES: Record<SeasonInfo['key'], string> = {
  nineveh: 'Fast of Nineveh',
  'great-lent': 'The Great Fast',
  'holy-fifty': 'The Holy Fifty',
  apostles: "Apostles' Fast",
  dormition: "St Mary's Fast",
  'nativity-fast': 'The Nativity Fast',
};

/** The liturgical season owning `date`, or null for ordinary time. */
export function seasonOn(date: CivilDate): SeasonInfo | null {
  const pascha = orthodoxPascha(date.year);

  // --- Movable seasons, anchored on this year's Pascha ---
  // Fast of Nineveh: Mon–Wed, two weeks before Great Lent's Monday (P-55).
  // NB PRD §3 says "15 days before Lent" which lands on a Sunday and conflicts
  // with its own "Mon–Wed"; the Mon–Wed reality (P-69..P-67) is authoritative.
  // TODO(verify-liturgical): confirm Nineveh anchoring with the owner.
  const ninevehStart = addDays(pascha, -69);
  const ninevehEnd = addDays(pascha, -67);
  if (inRange(date, ninevehStart, ninevehEnd)) {
    return season('nineveh', diffDays(date, ninevehStart) + 1, 3);
  }

  const lentStart = addDays(pascha, -55);
  const lentEnd = addDays(pascha, -1);
  if (inRange(date, lentStart, lentEnd)) {
    const inHolyWeek = inRange(date, addDays(pascha, -7), lentEnd);
    return { ...season('great-lent', diffDays(date, lentStart) + 1, 55), inHolyWeek };
  }

  const fiftyStart = pascha;
  const fiftyEnd = addDays(pascha, 49);
  if (inRange(date, fiftyStart, fiftyEnd)) {
    return season('holy-fifty', diffDays(date, fiftyStart) + 1, 50);
  }

  const apStart = addDays(pascha, 50);
  const apEnd: CivilDate = { year: date.year, month: 7, day: 11 }; // eve of Sts Peter & Paul
  if (diffDays(apEnd, apStart) >= 0 && inRange(date, apStart, apEnd)) {
    return season('apostles', diffDays(date, apStart) + 1, diffDays(apEnd, apStart) + 1);
  }

  // --- Fixed-date fasts ---
  const dormStart: CivilDate = { year: date.year, month: 8, day: 7 };
  const dormEnd: CivilDate = { year: date.year, month: 8, day: 21 };
  if (inRange(date, dormStart, dormEnd)) {
    return season('dormition', diffDays(date, dormStart) + 1, 15);
  }

  return nativityFastOn(date);
}

/** The Nativity (Advent) Fast spans 25 Nov → 6 Jan, so it crosses the year. */
function nativityFastOn(date: CivilDate): SeasonInfo | null {
  // Started this year (25 Nov → 31 Dec).
  const startThis: CivilDate = { year: date.year, month: 11, day: 25 };
  const endThis: CivilDate = { year: date.year, month: 12, day: 31 };
  if (inRange(date, startThis, endThis)) {
    return season('nativity-fast', diffDays(date, startThis) + 1, 43);
  }
  // Started last year (1 Jan → 6 Jan).
  const startPrev: CivilDate = { year: date.year - 1, month: 11, day: 25 };
  const endPrev: CivilDate = { year: date.year, month: 1, day: 6 };
  if (inRange(date, { year: date.year, month: 1, day: 1 }, endPrev)) {
    return season('nativity-fast', diffDays(date, startPrev) + 1, 43);
  }
  return null;
}

function season(key: SeasonInfo['key'], dayNumber: number, total: number): SeasonInfo {
  return { key, name: NAMES[key], dayNumber, total };
}

/** True when `date` is a strict Paramon (eve of Nativity or Theophany). */
export function isParamon(date: CivilDate): boolean {
  // Eve of the Nativity (7 Jan) and of Theophany (19 Jan).
  // TODO(verify-liturgical): Paramon can run 1–2 days; modelled as the single eve.
  return (
    (date.month === 1 && date.day === 6) || (date.month === 1 && date.day === 18)
  );
}
