/**
 * Auth store — local, multi-account, swappable. This is the seam where a real
 * backend (e.g. Supabase) would slot in later; for now everything is stored in
 * the device repo. Credentials are local/test-only (src/platform/hash.ts).
 *
 * On every account change it drives `useRule` (load that account's rule, or
 * clear on sign-out), keeping the two stores in sync.
 */
import { create } from 'zustand';
import { getRepo, type Account, type JourneyStage } from '../db/repo';
import { id } from '../platform/id';
import { makeSalt, hashPassword, verifyPassword } from '../platform/hash';
import { starterPractices, type StarterKey } from '../db/seed';
import { useRule } from './rule';
import { useJournal } from './journal';
import { useReading } from './reading';
import { useOffices } from './offices';
import { useClock } from './clock';

/** Load all per-account data (rule + journal + reading + offices). */
async function loadAccountData(accountId: string): Promise<void> {
  const today = useClock.getState().today;
  await useRule.getState().load(accountId);
  await useJournal.getState().load(accountId);
  await useReading.getState().load(accountId, today);
  await useOffices.getState().load(accountId);
}

/** Clear all per-account data (sign-out). */
function clearAccountData(): void {
  useRule.getState().clear();
  useJournal.getState().clear();
  useReading.getState().clear();
  useOffices.getState().clear();
}

export type AuthError = 'email-taken' | 'invalid-credentials' | 'invalid-email' | 'weak-password';
export type AuthResult = { ok: true; account: Account } | { ok: false; error: AuthError };

export interface OnboardingInput {
  displayName: string;
  journeyStage: JourneyStage;
  selection: StarterKey[];
}

interface AuthState {
  loaded: boolean;
  account: Account | null;
  accounts: Account[];

  load: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  switchAccount: (accountId: string) => Promise<void>;
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
}

const isEmail = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim());
const MIN_PASSWORD = 4; // local testbed minimum

export const useAuth = create<AuthState>((set, get) => ({
  loaded: false,
  account: null,
  accounts: [],

  load: async () => {
    const repo = getRepo();
    await repo.init();
    const accounts = await repo.listAccounts();
    const sessionId = await repo.getSession();
    const account = sessionId ? await repo.getAccount(sessionId) : null;
    if (account) await loadAccountData(account.id);
    set({ loaded: true, account, accounts });
  },

  refreshAccounts: async () => {
    set({ accounts: await getRepo().listAccounts() });
  },

  signUp: async (email, password) => {
    if (!isEmail(email)) return { ok: false, error: 'invalid-email' };
    if (password.length < MIN_PASSWORD) return { ok: false, error: 'weak-password' };
    const repo = getRepo();
    if (await repo.findAccountByEmail(email)) return { ok: false, error: 'email-taken' };

    const salt = makeSalt();
    const account: Account = {
      id: id(),
      email: email.trim().toLowerCase(),
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
    await loadAccountData(account.id); // empty data for the new account
    await get().refreshAccounts();
    set({ account });
    return { ok: true, account };
  },

  signIn: async (email, password) => {
    if (!isEmail(email)) return { ok: false, error: 'invalid-email' };
    const repo = getRepo();
    const account = await repo.findAccountByEmail(email);
    if (!account || !verifyPassword(password, account.salt, account.passwordHash)) {
      return { ok: false, error: 'invalid-credentials' };
    }
    await repo.setSession(account.id);
    await loadAccountData(account.id);
    set({ account });
    return { ok: true, account };
  },

  signOut: async () => {
    await getRepo().setSession(null);
    clearAccountData();
    set({ account: null });
  },

  switchAccount: async (accountId) => {
    const repo = getRepo();
    const account = await repo.getAccount(accountId);
    if (!account) return;
    await repo.setSession(account.id);
    await loadAccountData(account.id);
    set({ account });
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
    await get().refreshAccounts();
    set({ account: updated });
  },
}));
