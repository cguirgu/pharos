/**
 * Reading-plan store — enrollment + completed days for the MVP plan, per account.
 * Progress math lives in the (tested) domain `readingPlan` engine.
 */
import { create } from 'zustand';
import { getRepo } from '../db/repo';
import type { CivilDate } from '../domain/coptic';
import { FOUR_GOSPELS_90, planProgress, type PlanProgress } from '../domain/content/readingPlan';
import { dateKey } from '../domain/rule';

const PLAN = FOUR_GOSPELS_90;

interface ReadingState {
  accountId: string | null;
  startDate: CivilDate | null;
  completedDays: number[];

  /** Load (enrolling on first use, with `today` as the start date). */
  load: (accountId: string, today: CivilDate) => Promise<void>;
  clear: () => void;
  markRead: (dayNumber: number, today: CivilDate) => Promise<void>;
  progress: (today: CivilDate) => PlanProgress | null;
}

export const useReading = create<ReadingState>((set, get) => ({
  accountId: null,
  startDate: null,
  completedDays: [],

  load: async (accountId, today) => {
    const repo = getRepo();
    let enrollment = await repo.getEnrollment(accountId, PLAN.id);
    if (!enrollment) {
      enrollment = { planId: PLAN.id, startDate: today, createdAt: Date.now() };
      await repo.enroll(accountId, enrollment);
    }
    const completedDays = await repo.listReadDays(accountId, PLAN.id);
    set({ accountId, startDate: enrollment.startDate, completedDays });
  },

  clear: () => set({ accountId: null, startDate: null, completedDays: [] }),

  markRead: async (dayNumber, today) => {
    const accountId = get().accountId;
    if (!accountId || get().completedDays.includes(dayNumber)) return;
    await getRepo().markReadDay(accountId, PLAN.id, dayNumber, dateKey(today));
    set((st) => ({ completedDays: [...st.completedDays, dayNumber].sort((a, b) => a - b) }));
  },

  progress: (today) => {
    const start = get().startDate;
    if (!start) return null;
    return planProgress(PLAN, start, today, get().completedDays.length);
  },
}));
