/**
 * The Ordo — a month of liturgical days, derived entirely from the (tested)
 * calendar engine (PRD §5.3). Pure; no content.
 */
import type { CivilDate, CopticDate, Feast, FastLevel, SeasonInfo } from './coptic';
import { getDayInfo, gregorianToJDN, sameDay } from './coptic';

export interface OrdoDay {
  readonly date: CivilDate;
  readonly coptic: CopticDate;
  readonly weekday: number;
  readonly feast: Feast | null;
  readonly season: SeasonInfo | null;
  readonly fastLevel: FastLevel;
  readonly isToday: boolean;
}

/** Number of days in a Gregorian month. */
export function daysInMonth(year: number, month: number): number {
  const start = gregorianToJDN({ year, month, day: 1 });
  const nextMonth = month === 12 ? { year: year + 1, month: 1, day: 1 } : { year, month: month + 1, day: 1 };
  return gregorianToJDN(nextMonth) - start;
}

/** Every day of the given Gregorian month as an `OrdoDay`. */
export function monthGrid(year: number, month: number, today?: CivilDate): OrdoDay[] {
  const n = daysInMonth(year, month);
  const out: OrdoDay[] = [];
  for (let day = 1; day <= n; day++) {
    const date: CivilDate = { year, month, day };
    const info = getDayInfo(date);
    out.push({
      date,
      coptic: info.coptic,
      weekday: info.weekday,
      feast: info.feast,
      season: info.season,
      fastLevel: info.fast.level,
      isToday: today ? sameDay(date, today) : false,
    });
  }
  return out;
}
