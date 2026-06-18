/**
 * Reading-plan engine — generic day→reference scheduling (pure, tested).
 *
 * The "Four Gospels in 90 days" plan ships as a *structural reading schedule*
 * (an ordering of book/chapter references — not scripture content). It is
 * flagged for reconciliation with the authoritative Coptic **Katameros**
 * lectionary, which the owner supplies.
 *
 * TODO(verify-content): reconcile the schedule with the official Katameros.
 */
import type { CivilDate } from '../coptic';
import { diffDays } from '../coptic';
import type { BookId, ScriptureRef } from './bible';
import { BOOKS, refLabel } from './bible';

export interface ReadingPlan {
  readonly id: string;
  readonly name: string;
  /** Ordered references, one per plan day. */
  readonly schedule: readonly ScriptureRef[];
  /** Marks the schedule as awaiting reconciliation with the Katameros. */
  readonly draft: boolean;
}

/** Build a sequential chapter schedule across the given books, in order. */
function chaptersOf(books: readonly BookId[]): ScriptureRef[] {
  const out: ScriptureRef[] = [];
  for (const book of books) {
    for (let c = 1; c <= BOOKS[book].chapters; c++) out.push({ book, chapter: c });
  }
  return out;
}

/** The MVP plan (PRD §5.4): the four Gospels, one chapter a day (~89 days). */
export const FOUR_GOSPELS_90: ReadingPlan = {
  id: 'four-gospels-90',
  name: 'The Four Gospels',
  schedule: chaptersOf(['matthew', 'mark', 'luke', 'john']),
  draft: true,
};

export const PLANS: readonly ReadingPlan[] = [FOUR_GOSPELS_90];

export function planById(id: string): ReadingPlan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** The reference for a 1-based plan day, or null if out of range. */
export function planRef(plan: ReadingPlan, day: number): ScriptureRef | null {
  if (day < 1 || day > plan.schedule.length) return null;
  return plan.schedule[day - 1] ?? null;
}

/** 1-based day number for `today` given a start date (clamped to ≥ 1). */
export function dayNumberFor(startDate: CivilDate, today: CivilDate): number {
  return Math.max(1, diffDays(today, startDate) + 1);
}

export function progressPercent(completedDays: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completedDays / total) * 100));
}

/**
 * Whether the plan is finished — every scheduled day has been kept. Derived
 * (no stored completion flag): completion is just "kept days ≥ schedule length".
 * `completedDays` is the count of distinct days marked read.
 */
export function isPlanComplete(plan: ReadingPlan, completedDays: number): boolean {
  return plan.schedule.length > 0 && completedDays >= plan.schedule.length;
}

export interface PlanProgress {
  readonly dayNumber: number;
  readonly total: number;
  readonly percent: number;
  readonly todayRef: ScriptureRef | null;
  readonly todayLabel: string;
}

/** Progress snapshot for display (PRD §5.4 card). */
export function planProgress(
  plan: ReadingPlan,
  startDate: CivilDate,
  today: CivilDate,
  completedDays: number,
): PlanProgress {
  const total = plan.schedule.length;
  const dayNumber = Math.min(dayNumberFor(startDate, today), total);
  const todayRef = planRef(plan, dayNumber);
  return {
    dayNumber,
    total,
    percent: progressPercent(completedDays, total),
    todayRef,
    todayLabel: todayRef ? refLabel(todayRef) : '—',
  };
}
