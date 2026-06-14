/**
 * The calendar engine's public entry point: everything the rest of the app
 * needs to know about a single civil day, in one call.
 */
import type { CivilDate, DayInfo } from './types';
import { weekday } from './julian';
import { toCoptic } from './copticDate';
import { orthodoxPascha } from './pascha';
import { seasonOn } from './seasons';
import { feastsOn, primaryFeast } from './feasts';
import { fastingOn } from './fasting';

/** The complete liturgical reading for `date`. */
export function getDayInfo(date: CivilDate): DayInfo {
  return {
    gregorian: date,
    coptic: toCoptic(date),
    weekday: weekday(date),
    pascha: orthodoxPascha(date.year),
    season: seasonOn(date),
    feast: primaryFeast(date),
    feasts: feastsOn(date),
    fast: fastingOn(date),
  };
}

/** True when `date` is any kind of fast day (level !== 'none'). */
export function isFastDay(date: CivilDate): boolean {
  return fastingOn(date).level !== 'none';
}
