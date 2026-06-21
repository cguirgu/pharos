/**
 * Onboarding store — the per-account questionnaire answers. Loaded on sign-in
 * (so the rest of the app can personalise from goals) and saved when onboarding
 * finishes. Mirrors src/state/learning.ts (load / save / clear).
 */
import { create } from 'zustand';
import { getRepo } from '../db/repo';
import type { OnboardingAnswers } from '../domain/onboarding';

interface OnboardingState {
  accountId: string | null;
  answers: OnboardingAnswers | null;
  load: (accountId: string) => Promise<void>;
  save: (answers: OnboardingAnswers) => Promise<void>;
  clear: () => void;
}

export const useOnboarding = create<OnboardingState>((set, get) => ({
  accountId: null,
  answers: null,

  load: async (accountId) => {
    // Resilient: a read failure (e.g. a backend missing the onboarding_answers
    // table) must never block app startup — degrade to "no answers yet".
    let answers: OnboardingAnswers | null = null;
    try {
      answers = await getRepo().getOnboarding(accountId);
    } catch (e) {
      console.warn('[onboarding] load failed; continuing without answers', e);
    }
    set({ accountId, answers });
  },

  save: async (answers) => {
    const accountId = get().accountId;
    set({ answers });
    if (!accountId) return;
    // Persistence is best-effort — a failure here must not break onboarding.
    try {
      await getRepo().saveOnboarding(accountId, answers, Date.now());
    } catch (e) {
      console.warn('[onboarding] save failed; answers kept in memory only', e);
    }
  },

  clear: () => set({ accountId: null, answers: null }),
}));
