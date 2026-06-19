/**
 * Reading-plan store — multi-plan enrollment + completed days, per account.
 *
 * Plans are OPT-IN: a plan is followed only after the user explicitly `start`s
 * it (no auto-enrollment). Accounts enrolled under the old auto-enroll behaviour
 * keep their stored enrollment, so they still see their plan as active.
 * Progress + completion math lives in the (tested) domain `readingPlan` engine.
 */
import { create } from 'zustand';
import { getRepo } from '../db/repo';
import type { CivilDate } from '../domain/coptic';
import { PLANS, planById, planProgress, isPlanComplete, type PlanProgress } from '../domain/content/readingPlan';
import { dateKey } from '../domain/rule';

/** One enrolled plan's local state. */
export interface PlanState {
  planId: string;
  startDate: CivilDate;
  completedDays: number[];
}

interface ReadingState {
  accountId: string | null;
  /** Enrolled plans only, keyed by planId. */
  plans: Record<string, PlanState>;

  /** Load every existing enrollment for the account (no auto-enroll). */
  load: (accountId: string, today: CivilDate) => Promise<void>;
  clear: () => void;
  /** Opt in to a plan, starting today. Idempotent. */
  start: (planId: string, today: CivilDate) => Promise<void>;
  markRead: (planId: string, dayNumber: number, today: CivilDate) => Promise<void>;
  progress: (planId: string, today: CivilDate) => PlanProgress | null;
  /** Total days kept across all enrolled plans (for marks/stats). */
  totalDaysKept: () => number;
}

export const useReading = create<ReadingState>((set, get) => ({
  accountId: null,
  plans: {},

  load: async (accountId, _today) => {
    const repo = getRepo();
    const plans: Record<string, PlanState> = {};
    for (const plan of PLANS) {
      const enrollment = await repo.getEnrollment(accountId, plan.id);
      if (!enrollment) continue; // opt-in: skip plans the user hasn't started
      const completedDays = await repo.listReadDays(accountId, plan.id);
      plans[plan.id] = { planId: plan.id, startDate: enrollment.startDate, completedDays };
    }
    set({ accountId, plans });
  },

  clear: () => set({ accountId: null, plans: {} }),

  start: async (planId, today) => {
    const accountId = get().accountId;
    if (!accountId || get().plans[planId] || !planById(planId)) return;
    const enrollment = { planId, startDate: today, createdAt: Date.now() };
    await getRepo().enroll(accountId, enrollment);
    set((st) => ({ plans: { ...st.plans, [planId]: { planId, startDate: today, completedDays: [] } } }));
  },

  markRead: async (planId, dayNumber, today) => {
    const accountId = get().accountId;
    const plan = get().plans[planId];
    if (!accountId || !plan || plan.completedDays.includes(dayNumber)) return;
    await getRepo().markReadDay(accountId, planId, dayNumber, dateKey(today));
    set((st) => ({
      plans: {
        ...st.plans,
        [planId]: {
          ...st.plans[planId]!,
          completedDays: [...st.plans[planId]!.completedDays, dayNumber].sort((a, b) => a - b),
        },
      },
    }));
  },

  progress: (planId, today) => {
    const state = get().plans[planId];
    const plan = planById(planId);
    if (!state || !plan) return null;
    return planProgress(plan, state.startDate, today, state.completedDays.length);
  },

  totalDaysKept: () =>
    Object.values(get().plans).reduce((n, p) => n + p.completedDays.length, 0),
}));

/** Re-export for screens that want to fork active/available/completed lists. */
export { isPlanComplete };
