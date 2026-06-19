/**
 * Learn store — per-account lesson completion + derived level/XP. Mirrors the
 * reading store; progress math lives in the (tested) domain `course` engine.
 */
import { create } from 'zustand';
import { getRepo } from '../db/repo';
import type { CivilDate } from '../domain/coptic';
import { dateKey } from '../domain/rule';
import { courseLevel, xpFor, isLessonPassed, isLessonPerfect, type LessonResult } from '../domain/learn/course';

export interface LessonRecord {
  completedOn: string;
  correct: number;
  total: number;
}

interface LearnState {
  accountId: string | null;
  /** Completed lessons, keyed by lessonId (best score kept). */
  lessons: Record<string, LessonRecord>;

  load: (accountId: string) => Promise<void>;
  clear: () => void;
  completeLesson: (lessonId: string, correct: number, total: number, today: CivilDate) => Promise<void>;
  /** Lessons attempted at least once. */
  completedIds: () => Set<string>;
  /** Lessons passed (≥90%) — unlocks the next level; drives ranks + milestones. */
  passedIds: () => Set<string>;
  /** Lessons scored 100% (a flawless run) — earns the bonus crown. */
  perfectedIds: () => Set<string>;
  level: () => number;
  totalXp: () => number;
}

export const useLearning = create<LearnState>((set, get) => ({
  accountId: null,
  lessons: {},

  load: async (accountId) => {
    const records = await getRepo().listLearn(accountId);
    const lessons: Record<string, LessonRecord> = {};
    for (const r of records) lessons[r.lessonId] = { completedOn: r.completedOn, correct: r.correct, total: r.total };
    set({ accountId, lessons });
  },

  clear: () => set({ accountId: null, lessons: {} }),

  completeLesson: async (lessonId, correct, total, today) => {
    const accountId = get().accountId;
    if (!accountId) return;
    const best = Math.max(correct, get().lessons[lessonId]?.correct ?? 0);
    const on = dateKey(today);
    await getRepo().completeLesson(accountId, lessonId, correct, total, on);
    set((st) => ({ lessons: { ...st.lessons, [lessonId]: { completedOn: on, correct: best, total } } }));
  },

  completedIds: () => new Set(Object.keys(get().lessons)),
  passedIds: () => {
    const out = new Set<string>();
    for (const [id, r] of Object.entries(get().lessons)) if (isLessonPassed(r)) out.add(id);
    return out;
  },
  perfectedIds: () => {
    const out = new Set<string>();
    for (const [id, r] of Object.entries(get().lessons)) if (isLessonPerfect(r)) out.add(id);
    return out;
  },
  level: () => courseLevel(Object.keys(get().lessons).length),
  totalXp: () =>
    xpFor(Object.values(get().lessons).map((l): LessonResult => ({ correct: l.correct, total: l.total }))),
}));
