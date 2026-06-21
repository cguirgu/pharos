/**
 * Auth store — Google sign-in and email/password via Supabase. When the backend
 * is configured (keys present) Google uses an ID token and email/password uses
 * Supabase Auth; a single signed-in user maps to a Supabase session + `profiles`
 * row. When NOT configured it falls back to the local device store (local dev
 * sign-in, and locally-hashed email/password accounts), so the app still runs in
 * Expo Go without keys. Either way, account changes drive every per-account store.
 */
import { create } from 'zustand';
import { getRepo, type Account, type JourneyStage } from '../db/repo';
import { isBackendConfigured } from '../lib/config';
import { validateCredentials, isValidEmail, type AuthErrorCode } from '../domain/auth/credentials';
import { hashPassword, verifyPassword, randomSalt } from '../platform/hash';
import { id } from '../platform/id';
import { starterPractices, type StarterKey } from '../db/seed';
import { useRule } from './rule';
import { useJournal } from './journal';
import { useReading } from './reading';
import { useOffices } from './offices';
import { useHighlights } from './highlights';
import { useLearning } from './learning';
import { useOnboarding } from './onboarding';
import { useClock } from './clock';
import type { OnboardingAnswers } from '../domain/onboarding';

const DEV_ACCOUNT_ID = 'dev-local';

/** Load all per-account data (rule + journal + reading + offices + highlights + learn). */
async function loadAccountData(accountId: string): Promise<void> {
  const today = useClock.getState().today;
  // Each load is isolated: one failing data source (e.g. a backend table that
  // isn't provisioned yet) must never reject the whole startup and hang the
  // splash. A failure degrades that one store to empty and is logged.
  const safe = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      console.warn(`[auth] loading ${label} failed; continuing`, e);
    }
  };
  await safe('rule', () => useRule.getState().load(accountId));
  await safe('journal', () => useJournal.getState().load(accountId));
  await safe('reading', () => useReading.getState().load(accountId, today));
  await safe('offices', () => useOffices.getState().load(accountId));
  await safe('highlights', () => useHighlights.getState().load(accountId));
  await safe('learn', () => useLearning.getState().load(accountId));
  await safe('onboarding', () => useOnboarding.getState().load(accountId));
}

/** Clear all per-account data (sign-out). */
function clearAccountData(): void {
  useRule.getState().clear();
  useJournal.getState().clear();
  useReading.getState().clear();
  useOffices.getState().clear();
  useHighlights.getState().clear();
  useLearning.getState().clear();
  useOnboarding.getState().clear();
}

export interface OnboardingInput {
  displayName: string;
  journeyStage: JourneyStage;
  selection: StarterKey[];
  /** The full questionnaire (goals, experience, reminder) — persisted per account. */
  answers: OnboardingAnswers;
}

interface AuthState {
  loaded: boolean;
  account: Account | null;
  signingIn: boolean;
  authError: string | null;
  /** Email awaiting a 6-digit confirmation code after sign-up (backend mode only). */
  pendingConfirmEmail: string | null;

  load: () => Promise<void>;
  clearError: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signUpWithPassword: (email: string, password: string) => Promise<boolean>;
  /** Verify the emailed 6-digit code; on success a session is established. */
  verifyEmailOtp: (email: string, token: string) => Promise<boolean>;
  /** Re-send the confirmation code to a pending email. */
  resendConfirmation: (email: string) => Promise<boolean>;
  /** Abandon the pending confirmation (e.g. to use a different email). */
  clearPendingConfirm: () => void;
  signInWithPassword: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  /** Permanently delete the account and all its data, then sign out. */
  deleteAccount: () => Promise<void>;
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

/** Map a Supabase Auth error message to one of our copy error codes (or pass it through). */
function mapSupabaseAuthError(message: string): AuthErrorCode | string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('already exists')) return 'email-taken';
  if (m.includes('password')) return 'weak-password';
  if (m.includes('valid email') || m.includes('invalid email')) return 'invalid-email';
  return message;
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
  pendingConfirmEmail: null,

  load: async () => {
    // CRITICAL: `loaded` must become true no matter what. app/index.tsx holds the
    // splash on `!loaded`, so any throw here (a backend hiccup, an unprovisioned
    // table) would otherwise hang the app forever. On failure we start signed-out.
    let account: Account | null = null;
    try {
      const repo = getRepo();
      await repo.init();
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
    } catch (e) {
      console.warn('[auth] load failed; starting signed-out', e);
      account = null;
    } finally {
      set({ loaded: true, account });
    }
  },

  clearError: () => set({ authError: null }),

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

  signUpWithPassword: async (email, password) => {
    const code = validateCredentials(email, password);
    if (code) {
      set({ authError: code });
      return false;
    }
    set({ signingIn: true, authError: null });
    try {
      if (isBackendConfigured()) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getSupabase } = require('../lib/supabase') as typeof import('../lib/supabase');
        const { data, error } = await getSupabase().auth.signUp({ email: email.trim(), password });
        if (error) {
          set({ authError: mapSupabaseAuthError(error.message) });
          return false;
        }
        if (!data.session || !data.user) {
          // Email confirmation is enabled: no session yet. Move to the in-app
          // code step rather than dead-ending on an error message.
          set({ pendingConfirmEmail: email.trim() });
          return false;
        }
        const account = await accountFromSupabase(data.user.id, data.user.email ?? null, null);
        clearAccountData();
        await loadAccountData(data.user.id);
        set({ account });
        return true;
      }
      // local fallback (no keys) — store a locally-hashed account on device
      const repo = getRepo();
      const existing = await repo.findAccountByEmail(email);
      if (existing) {
        set({ authError: 'email-taken' });
        return false;
      }
      const salt = randomSalt();
      const account: Account = {
        id: id(),
        email: email.trim(),
        passwordHash: hashPassword(password, salt),
        salt,
        createdAt: Date.now(),
        displayName: null,
        journeyStage: null,
        onboardingComplete: false,
      };
      await repo.createAccount(account);
      await repo.setSession(account.id);
      clearAccountData();
      await loadAccountData(account.id);
      set({ account });
      return true;
    } catch (e) {
      set({ authError: e instanceof Error ? e.message : 'Sign-up failed' });
      return false;
    } finally {
      set({ signingIn: false });
    }
  },

  verifyEmailOtp: async (email, token) => {
    const code = token.trim();
    if (code.length < 6) {
      set({ authError: 'invalid-code' });
      return false;
    }
    set({ signingIn: true, authError: null });
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getSupabase } = require('../lib/supabase') as typeof import('../lib/supabase');
      const { data, error } = await getSupabase().auth.verifyOtp({ email: email.trim(), token: code, type: 'email' });
      if (error || !data.user) {
        set({ authError: 'invalid-code' });
        return false;
      }
      const account = await accountFromSupabase(data.user.id, data.user.email ?? null, null);
      clearAccountData();
      await loadAccountData(data.user.id);
      set({ account, pendingConfirmEmail: null });
      return true;
    } catch (e) {
      set({ authError: e instanceof Error ? e.message : 'Sign-up failed' });
      return false;
    } finally {
      set({ signingIn: false });
    }
  },

  resendConfirmation: async (email) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getSupabase } = require('../lib/supabase') as typeof import('../lib/supabase');
      const { error } = await getSupabase().auth.resend({ type: 'signup', email: email.trim() });
      if (error) {
        set({ authError: mapSupabaseAuthError(error.message) });
        return false;
      }
      return true;
    } catch (e) {
      set({ authError: e instanceof Error ? e.message : 'Sign-up failed' });
      return false;
    }
  },

  clearPendingConfirm: () => set({ pendingConfirmEmail: null, authError: null }),

  signInWithPassword: async (email, password) => {
    if (!isValidEmail(email) || password.length === 0) {
      set({ authError: 'invalid-credentials' });
      return false;
    }
    set({ signingIn: true, authError: null });
    try {
      if (isBackendConfigured()) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getSupabase } = require('../lib/supabase') as typeof import('../lib/supabase');
        const { data, error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
        if (error || !data.user) {
          set({ authError: 'invalid-credentials' });
          return false;
        }
        const account = await accountFromSupabase(data.user.id, data.user.email ?? null, (data.user.user_metadata?.full_name as string) ?? null);
        clearAccountData();
        await loadAccountData(data.user.id);
        set({ account, pendingConfirmEmail: null });
        return true;
      }
      // local fallback — verify against the device-stored hash
      const repo = getRepo();
      const account = await repo.findAccountByEmail(email);
      if (!account || !verifyPassword(password, account.salt, account.passwordHash)) {
        set({ authError: 'invalid-credentials' });
        return false;
      }
      await repo.setSession(account.id);
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
      set({ account: null, pendingConfirmEmail: null });
    }
  },

  deleteAccount: async () => {
    const acc = get().account;
    if (!acc) return;
    try {
      if (isBackendConfigured()) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getSupabase } = require('../lib/supabase') as typeof import('../lib/supabase');
        const { googleSignOut } = require('../platform/googleAuth') as typeof import('../platform/googleAuth');
        // Service-role Edge Function deletes the auth user → ON DELETE CASCADE
        // removes every synced row; then end the local session.
        const { error } = await getSupabase().functions.invoke('delete-account');
        if (error) throw new Error(error.message);
        await getSupabase().auth.signOut();
        await googleSignOut();
      } else {
        await getRepo().deleteAccount(acc.id);
        await getRepo().setSession(null);
      }
    } finally {
      clearAccountData();
      set({ account: null });
    }
  },

  completeOnboarding: async ({ displayName, journeyStage, selection, answers }) => {
    const current = get().account;
    if (!current) return;
    const repo = getRepo();

    const practices = starterPractices(Date.now(), selection);
    for (const p of practices) await repo.upsertPractice(current.id, p);
    // Best-effort: persisting the questionnaire must not block finishing onboarding.
    try {
      await repo.saveOnboarding(current.id, answers, Date.now());
    } catch (e) {
      console.warn('[auth] saveOnboarding failed; continuing', e);
    }

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
