/**
 * Auth store — Google sign-in via Supabase. When the backend is configured
 * (keys present) it signs in with Google and a single signed-in user maps to a
 * Supabase session + `profiles` row. When NOT configured it falls back to a
 * local dev sign-in against the device store, so the app still runs in Expo Go
 * without keys. Either way, account changes drive every per-account store.
 */
import { create } from 'zustand';
import { getRepo, type Account, type JourneyStage } from '../db/repo';
import { isBackendConfigured } from '../lib/config';
import { starterPractices, type StarterKey } from '../db/seed';
import { useRule } from './rule';
import { useJournal } from './journal';
import { useReading } from './reading';
import { useOffices } from './offices';
import { useHighlights } from './highlights';
import { useLearning } from './learning';
import { useClock } from './clock';

const DEV_ACCOUNT_ID = 'dev-local';

/** Load all per-account data (rule + journal + reading + offices + highlights + learn). */
async function loadAccountData(accountId: string): Promise<void> {
  const today = useClock.getState().today;
  await useRule.getState().load(accountId);
  await useJournal.getState().load(accountId);
  await useReading.getState().load(accountId, today);
  await useOffices.getState().load(accountId);
  await useHighlights.getState().load(accountId);
  await useLearning.getState().load(accountId);
}

/** Clear all per-account data (sign-out). */
function clearAccountData(): void {
  useRule.getState().clear();
  useJournal.getState().clear();
  useReading.getState().clear();
  useOffices.getState().clear();
  useHighlights.getState().clear();
  useLearning.getState().clear();
}

export interface OnboardingInput {
  displayName: string;
  journeyStage: JourneyStage;
  selection: StarterKey[];
}

interface AuthState {
  loaded: boolean;
  account: Account | null;
  signingIn: boolean;
  authError: string | null;

  load: () => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
}

/** Build the app Account from the Supabase session user (profile row, or a fallback). */
async function accountFromSupabase(userId: string, email: string | null, name: string | null): Promise<Account> {
  const profile = await getRepo().getAccount(userId);
  if (profile) return profile;
  return {
    id: userId,
    email: email ?? '',
    passwordHash: '',
    salt: '',
    createdAt: Date.now(),
    displayName: name,
    journeyStage: null,
    onboardingComplete: false,
  };
}

/** Ensure (and return) the single local dev account for the unconfigured fallback. */
async function ensureDevAccount(): Promise<Account> {
  const repo = getRepo();
  let account = await repo.getAccount(DEV_ACCOUNT_ID);
  if (!account) {
    account = {
      id: DEV_ACCOUNT_ID,
      email: 'dev@local',
      passwordHash: '',
      salt: '',
      createdAt: Date.now(),
      displayName: null,
      journeyStage: null,
      onboardingComplete: false,
    };
    await repo.createAccount(account);
  }
  return account;
}

export const useAuth = create<AuthState>((set, get) => ({
  loaded: false,
  account: null,
  signingIn: false,
  authError: null,

  load: async () => {
    const repo = getRepo();
    await repo.init();
    let account: Account | null = null;
    if (isBackendConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getSupabase } = require('../lib/supabase') as typeof import('../lib/supabase');
      const { data } = await getSupabase().auth.getSession();
      const user = data.session?.user;
      if (user) {
        account = await accountFromSupabase(user.id, user.email ?? null, (user.user_metadata?.full_name as string) ?? null);
        await loadAccountData(user.id);
      }
    } else {
      const sessionId = await repo.getSession();
      account = sessionId ? await repo.getAccount(sessionId) : null;
      if (account) await loadAccountData(account.id);
    }
    set({ loaded: true, account });
  },

  signInWithGoogle: async () => {
    set({ signingIn: true, authError: null });
    try {
      if (isBackendConfigured()) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { signInWithGoogle } = require('../platform/googleAuth') as typeof import('../platform/googleAuth');
        const { getSupabase } = require('../lib/supabase') as typeof import('../lib/supabase');
        const res = await signInWithGoogle();
        if (!res.ok) {
          set({ authError: res.error === 'cancelled' ? null : res.error });
          return false;
        }
        const { data } = await getSupabase().auth.getUser();
        const account = await accountFromSupabase(res.userId, data.user?.email ?? null, (data.user?.user_metadata?.full_name as string) ?? null);
        clearAccountData();
        await loadAccountData(res.userId);
        set({ account });
        return true;
      }
      // dev fallback (no keys) — one local account, no real auth
      const account = await ensureDevAccount();
      await getRepo().setSession(account.id);
      clearAccountData();
      await loadAccountData(account.id);
      set({ account });
      return true;
    } catch (e) {
      set({ authError: e instanceof Error ? e.message : 'Sign-in failed' });
      return false;
    } finally {
      set({ signingIn: false });
    }
  },

  signOut: async () => {
    try {
      if (isBackendConfigured()) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getSupabase } = require('../lib/supabase') as typeof import('../lib/supabase');
        const { googleSignOut } = require('../platform/googleAuth') as typeof import('../platform/googleAuth');
        await getSupabase().auth.signOut();
        await googleSignOut();
      } else {
        await getRepo().setSession(null);
      }
    } finally {
      clearAccountData();
      set({ account: null });
    }
  },

  completeOnboarding: async ({ displayName, journeyStage, selection }) => {
    const current = get().account;
    if (!current) return;
    const repo = getRepo();

    const practices = starterPractices(Date.now(), selection);
    for (const p of practices) await repo.upsertPractice(current.id, p);

    const updated: Account = {
      ...current,
      displayName: displayName.trim() || null,
      journeyStage,
      onboardingComplete: true,
    };
    await repo.updateAccount(updated);
    await loadAccountData(current.id);
    set({ account: updated });
  },
}));
