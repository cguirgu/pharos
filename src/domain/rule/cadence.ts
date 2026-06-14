/**
 * "Is this practice due on this day?" — the six cadence rules (PRD §4.2).
 *
 * The calendar-aware cadences (`fastDays`, `season`) consult the pure Coptic
 * engine directly. The accrual cadences (`timesPerWeek`, `perPeriod`) need the
 * practice's own logs to know whether the quota is already met.
 */
import type { CivilDate } from '../coptic/types';
import { weekday } from '../coptic/julian';
import { isFastDay } from '../coptic/calendar';
import { seasonOn } from '../coptic/seasons';
import type { Practice, PracticeLog } from './types';
import { dateKey, sameWeek, sameMonth, gregorianToJDN } from './dates';

const isCompletion = (s: PracticeLog['status']): boolean => s === 'kept' || s === 'part';

/** Completions in the same week as `date`, strictly before `date`. */
function metThisWeekBefore(logs: readonly PracticeLog[], date: CivilDate): number {
  const j = gregorianToJDN(date);
  return logs.filter(
    (l) => isCompletion(l.status) && sameWeek(l.date, date) && gregorianToJDN(l.date) < j,
  ).length;
}

/** Whether the practice was already completed earlier in `date`'s period. */
function metThisPeriodBefore(
  logs: readonly PracticeLog[],
  date: CivilDate,
  period: 'week' | 'month',
): boolean {
  const j = gregorianToJDN(date);
  const inPeriod = period === 'week' ? sameWeek : sameMonth;
  return logs.some(
    (l) => isCompletion(l.status) && inPeriod(l.date, date) && gregorianToJDN(l.date) < j,
  );
}

/**
 * Is `practice` due on `date`?
 * Inactive (paused/archived) practices are never due. `logs` are this
 * practice's logs (only consulted by accrual cadences).
 */
export function isDueOn(
  practice: Practice,
  date: CivilDate,
  logs: readonly PracticeLog[] = [],
): boolean {
  if (practice.state !== 'active') return false;

  const c = practice.cadence;
  switch (c.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return c.days.includes(weekday(date));
    case 'fastDays':
      return isFastDay(date);
    case 'season':
      return seasonOn(date)?.key === c.season;
    case 'timesPerWeek':
      return metThisWeekBefore(logs, date) < c.n;
    case 'perPeriod':
      return !metThisPeriodBefore(logs, date, c.period);
  }
}

/** A short human summary of a cadence (UI copy lives in src/ui/copy.ts). */
export function cadenceSummary(c: Practice['cadence']): string {
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  switch (c.type) {
    case 'daily':
      return 'Every day';
    case 'weekdays':
      return c.days.map((d) => DAY[d]).join(' · ');
    case 'timesPerWeek':
      return `${c.n}× a week`;
    case 'fastDays':
      return 'On fast days';
    case 'perPeriod':
      return c.period === 'week' ? 'Once a week' : 'Once a month';
    case 'season':
      return `During ${c.season}`;
  }
}

/** Build a date→log index for a practice (handy for callers). */
export function indexLogs(logs: readonly PracticeLog[]): Map<string, PracticeLog> {
  const m = new Map<string, PracticeLog>();
  for (const l of logs) m.set(dateKey(l.date), l);
  return m;
}
