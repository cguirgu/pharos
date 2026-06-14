/**
 * The "You" stats ledger (PRD §5.6): streak · total prayers · % Wed-Fri kept.
 * Pure; computed from logs.
 *
 * Definitions (flagged where a judgement call):
 *  - streak       — the global flame (consecutive complete days).
 *  - totalPrayers — kept/part logs on prayer-category practices + offices prayed.
 *  - wedFriPercent — over the scan window, of due Wed/Fri days on fast-oriented
 *    practices that have closed, the share kept/part.
 *    TODO(verify): confirm the intended denominator with the owner.
 */
import type { CivilDate } from './coptic';
import { addDays, weekday, gregorianToJDN } from './coptic';
import type { Practice, PracticeLog } from './rule';
import { isDueOn, effectiveStatus, dateKey, globalFlame } from './rule';

export interface YouStats {
  readonly streak: number;
  readonly totalPrayers: number;
  readonly wedFriPercent: number;
}

export interface StatsContext {
  readonly practices: readonly Practice[];
  readonly logsByPractice: Readonly<Record<string, readonly PracticeLog[]>>;
  readonly restDays: ReadonlySet<string>;
  /** Count of offices marked prayed (from office_logs). */
  readonly officeCompletions: number;
  readonly today: CivilDate;
  readonly since?: CivilDate;
}

const isKept = (s: string) => s === 'kept' || s === 'part';
const isFastPractice = (p: Practice) => p.category === 'fast' || p.cadence.type === 'fastDays';

export function youStats(ctx: StatsContext): YouStats {
  const active = ctx.practices.filter((p) => p.state === 'active');
  const streak = globalFlame(active, ctx.logsByPractice, { today: ctx.today, restDays: ctx.restDays });

  // total prayers — kept/part logs on prayer practices, plus offices prayed
  let totalPrayers = ctx.officeCompletions;
  for (const p of active.filter((x) => x.category === 'prayer')) {
    for (const l of ctx.logsByPractice[p.id] ?? []) if (isKept(l.status)) totalPrayers++;
  }

  // % Wed/Fri kept on fast-oriented practices
  const since = ctx.since ?? addDays(ctx.today, -400);
  let wfDue = 0;
  let wfKept = 0;
  const fastPractices = active.filter(isFastPractice);
  for (let j = gregorianToJDN(since); j < gregorianToJDN(ctx.today); j++) {
    const date = addDays(since, j - gregorianToJDN(since));
    const wd = weekday(date);
    if (wd !== 3 && wd !== 5) continue;
    for (const p of fastPractices) {
      const logs = ctx.logsByPractice[p.id] ?? [];
      if (!isDueOn(p, date, logs)) continue;
      wfDue++;
      const log = logs.find((l) => dateKey(l.date) === dateKey(date));
      if (isKept(effectiveStatus(log, date, ctx.today))) wfKept++;
    }
  }
  const wedFriPercent = wfDue === 0 ? 0 : Math.round((wfKept / wfDue) * 100);

  return { streak, totalPrayers, wedFriPercent };
}

export interface FlameCell {
  readonly date: CivilDate;
  readonly complete: boolean;
  readonly isToday: boolean;
}

/** A `weeks`×7 (Sun–Sat) grid of complete-day cells, ending this week. */
export function flameGrid(ctx: StatsContext, weeks = 4): FlameCell[][] {
  const active = ctx.practices.filter((p) => p.state === 'active');
  const startOfThisWeek = addDays(ctx.today, -((gregorianToJDN(ctx.today) + 1) % 7));
  const gridStart = addDays(startOfThisWeek, -7 * (weeks - 1));

  const dayComplete = (date: CivilDate): boolean => {
    if (ctx.restDays.has(dateKey(date))) return true;
    let due = 0;
    let kept = 0;
    for (const p of active) {
      const logs = ctx.logsByPractice[p.id] ?? [];
      if (!isDueOn(p, date, logs)) continue;
      due++;
      const log = logs.find((l) => dateKey(l.date) === dateKey(date));
      if (isKept(effectiveStatus(log, date, ctx.today))) kept++;
    }
    return due === 0 || kept === due;
  };

  const out: FlameCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const row: FlameCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(gridStart, w * 7 + d);
      const isFuture = gregorianToJDN(date) > gregorianToJDN(ctx.today);
      row.push({
        date,
        complete: !isFuture && dayComplete(date),
        isToday: dateKey(date) === dateKey(ctx.today),
      });
    }
    out.push(row);
  }
  return out;
}
