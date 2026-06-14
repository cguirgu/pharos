/**
 * Marks (badges) — the MVP set of 6, computed from history (PRD §5.6).
 * Earned marks are never stored; they are derived so they can never drift from
 * the underlying logs. Earn conditions are taken verbatim from the PRD.
 */
import type { CivilDate } from './coptic';
import { addDays, diffDays, weekday, gregorianToJDN } from './coptic';
import type { Practice, PracticeLog } from './rule';
import { isDueOn, effectiveStatus, dateKey } from './rule';

export type MarkKey =
  | 'first-light'
  | 'flame-of-xiv'
  | 'first-fast'
  | 'gospel-reader'
  | 'seven-reflections'
  | 'a-full-week';

export interface Mark {
  readonly key: MarkKey;
  readonly name: string;
  readonly earned: boolean;
  /** The day it was earned (when datable), else null. */
  readonly earnedOn: CivilDate | null;
}

export const MARK_NAMES: Record<MarkKey, string> = {
  'first-light': 'First light',
  'flame-of-xiv': 'Flame of xiv',
  'first-fast': 'First fast',
  'gospel-reader': 'Gospel reader',
  'seven-reflections': 'Seven reflections',
  'a-full-week': 'A full week',
};

export interface MarkContext {
  readonly practices: readonly Practice[];
  readonly logsByPractice: Readonly<Record<string, readonly PracticeLog[]>>;
  readonly restDays: ReadonlySet<string>;
  readonly journalCount: number;
  readonly planDaysCompleted: number;
  readonly today: CivilDate;
  /** Earliest day to scan; defaults to 400 days before today. */
  readonly since?: CivilDate;
}

const isKept = (s: string) => s === 'kept' || s === 'part';

/** Per-day facts derived once and reused by several marks. */
interface DayFacts {
  date: CivilDate;
  dueCount: number;
  keptCount: number;
  complete: boolean; // flame definition: rest day, or every due kept/part (vacuous if none due)
  allKept: boolean; // a real all-kept day (due > 0 and all kept)
  fastKeptOnWedFri: boolean;
}

function scan(ctx: MarkContext): DayFacts[] {
  const active = ctx.practices.filter((p) => p.state === 'active');
  const since = ctx.since ?? addDays(ctx.today, -400);
  const out: DayFacts[] = [];
  for (let j = gregorianToJDN(since); j <= gregorianToJDN(ctx.today); j++) {
    const date = addDays(since, j - gregorianToJDN(since));
    const key = dateKey(date);
    const wd = weekday(date);
    let dueCount = 0;
    let keptCount = 0;
    let fastKeptOnWedFri = false;
    for (const p of active) {
      const logs = ctx.logsByPractice[p.id] ?? [];
      if (!isDueOn(p, date, logs)) continue;
      dueCount++;
      const log = logs.find((l) => dateKey(l.date) === key);
      const status = effectiveStatus(log, date, ctx.today);
      if (isKept(status)) {
        keptCount++;
        if ((wd === 3 || wd === 5) && (p.category === 'fast' || p.cadence.type === 'fastDays')) {
          fastKeptOnWedFri = true;
        }
      }
    }
    const rest = ctx.restDays.has(key);
    const complete = rest || dueCount === 0 || keptCount === dueCount;
    out.push({
      date,
      dueCount,
      keptCount,
      complete,
      allKept: dueCount > 0 && keptCount === dueCount,
      fastKeptOnWedFri,
    });
  }
  return out;
}

/** The longest run of `complete` days, and the date it first reached `threshold`. */
function runReached(days: DayFacts[], threshold: number): CivilDate | null {
  let run = 0;
  for (const d of days) {
    run = d.complete ? run + 1 : 0;
    if (run >= threshold) return d.date;
  }
  return null;
}

/** Evaluate all six marks for the given context. */
export function evaluateMarks(ctx: MarkContext): Mark[] {
  const days = scan(ctx);

  const firstAllKept = days.find((d) => d.allKept)?.date ?? null;
  const week = runReached(days, 7);
  const fourteen = runReached(days, 14);
  const firstFast = days.find((d) => d.fastKeptOnWedFri)?.date ?? null;

  const mk = (key: MarkKey, earnedOn: CivilDate | null, earned = earnedOn !== null): Mark => ({
    key,
    name: MARK_NAMES[key],
    earned,
    earnedOn,
  });

  return [
    mk('first-light', firstAllKept),
    mk('a-full-week', week),
    mk('flame-of-xiv', fourteen),
    mk('first-fast', firstFast),
    mk('gospel-reader', null, ctx.planDaysCompleted >= 7),
    mk('seven-reflections', null, ctx.journalCount >= 7),
  ];
}
