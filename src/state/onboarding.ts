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
    const answers = await getRepo().getOnboarding(accountId);
    set({ accountId, answers });
  },

  save: async (answers) => {
    const accountId = get().accountId;
    set({ answers });
    if (!accountId) return;
    await getRepo().saveOnboarding(accountId, answers, Date.now());
  },

  clear: () => set({ accountId: null, answers: null }),
}));
