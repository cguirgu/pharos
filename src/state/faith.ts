/**
 * Faith store — per-account lesson completion for the theology course.
 *
 * Shares the `learn_lessons` table with the Coptic course rather than adding a
 * second one: the row is keyed by a free-form `lessonId`, so namespacing Faith
 * ids with `faith:` gives the new course persistence, account scoping, export,
 * deletion, and Supabase sync with no schema change and no migration. The two
 * stores each filter the shared list to their own keys — see the matching
 * filter in `learning.ts`, which must stay in step with this one.
 */
import { create } from 'zustand';
import { getRepo } from '../db/repo';
import type { CivilDate } from '../domain/coptic';
import { dateKey } from '../domain/rule';
import {
  courseLevel,
  isFaithKey,
  isLessonPassed,
  isLessonPerfect,
  lessonIdFromKey,
  storageKey,
  xpFor,
  type LessonResult,
} from '../domain/faith/course';

export interface FaithLessonRecord {
  completedOn: string;
  correct: number;
  total: number;
}

interface FaithState {
  accountId: string | null;
  /** Completed lessons, keyed by the UNPREFIXED lessonId (best score kept). */
  lessons: Record<string, FaithLessonRecord>;

  load: (accountId: string) => Promise<void>;
  clear: () => void;
  completeLesson: (lessonId: string, correct: number, total: number, today: CivilDate) => Promise<void>;
  /** Lessons attempted at least once. */
  completedIds: () => Set<string>;
  /** Lessons passed (≥90%) — unlocks the next, unseals the Creed, drives ranks. */
  passedIds: () => Set<string>;
  /** Lessons scored 100% — earns the lamp. */
  perfectedIds: () => Set<string>;
  level: () => number;
  totalXp: () => number;
}

export const useFaith = create<FaithState>((set, get) => ({
  accountId: null,
  lessons: {},

  load: async (accountId) => {
    const records = await getRepo(accountId).listLearn(accountId);
    const lessons: Record<string, FaithLessonRecord> = {};
    for (const r of records) {
      if (!isFaithKey(r.lessonId)) continue;
      lessons[lessonIdFromKey(r.lessonId)] = {
        completedOn: r.completedOn,
        correct: r.correct,
        total: r.total,
      };
    }
    set({ accountId, lessons });
  },

  clear: () => set({ accountId: null, lessons: {} }),

  completeLesson: async (lessonId, correct, total, today) => {
    const accountId = get().accountId;
    if (!accountId) return;
    const best = Math.max(correct, get().lessons[lessonId]?.correct ?? 0);
    const on = dateKey(today);
    await getRepo(accountId).completeLesson(accountId, storageKey(lessonId), correct, total, on);
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
