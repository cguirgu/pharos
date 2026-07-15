/**
 * Persistence repository — the boundary the state layer talks to.
 *
 * Data is **scoped per account**: practices, logs, rest-days, journal entries,
 * reading progress, and office logs all live under an `accountId`, so multiple
 * local accounts are fully isolated. Accounts and the active session live
 * alongside them.
 *
 * Two implementations:
 *  - `MemoryRepo`  — fully in-memory; used in tests and on web, and as a safe
 *    fallback. 100% verifiable without a device.
 *  - `SqliteRepo`  — expo-sqlite + Drizzle, for on-device persistence across
 *    relaunch. Device-only (lazy-loaded), so it isn't imported on web/in jest.
 *
 * `getRepo()` picks the right one for the platform.
 */
import { Platform } from 'react-native';
import type { Practice, PracticeLog, DayStatus } from '../domain/rule';
import type { CivilDate } from '../domain/coptic';
import { isScripture, type Highlight, type HighlightSource } from '../domain/highlights';
import type { BookId } from '../domain/content/bible';
import type { OnboardingAnswers } from '../domain/onboarding';

/** Where the user is on the journey (onboarding §1). */
export type JourneyStage = 'grew-up' | 'returning' | 'exploring';

/** A local account. Credentials are local/test-only (see src/platform/hash.ts). */
export interface Account {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
  displayName: string | null;
  journeyStage: JourneyStage | null;
  onboardingComplete: boolean;
}

export interface JournalEntry {
  id: string;
  date: CivilDate;
  title: string;
  body: string;
  passageRef?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReadingEnrollment {
  planId: string;
  startDate: CivilDate;
  createdAt: number;
}

export interface LearnLessonRecord {
  lessonId: string;
  completedOn: string; // YYYY-MM-DD
  correct: number;
  total: number;
}

/** A full, portable snapshot of one account's data (for the in-app export). */
export interface AccountExport {
  exportedAt: number;
  /** Profile only — never the password hash/salt. */
  profile: {
    id: string;
    email: string;
    displayName: string | null;
    journeyStage: JourneyStage | null;
    createdAt: number;
    onboardingComplete: boolean;
  };
  onboarding: OnboardingAnswers | null;
  practices: Practice[];
  practiceLogs: PracticeLog[];
  restDays: string[];
  journal: JournalEntry[];
  highlights: Highlight[];
  readingPlans: ReadingEnrollment[];
  readingProgress: { planId: string; dayNumber: number; completedOn?: string }[];
  officeLogs: { date: string; officeKey: string }[];
  learn: LearnLessonRecord[];
}

/** Optional narrowing for highlight queries (used by the reader overlay). */
export interface HighlightFilter {
  source?: HighlightSource;
  book?: BookId; // scripture
  chapter?: number; // scripture
  copticMonth?: number; // synaxarium
  copticDay?: number; // synaxarium
}

export interface Repo {
  init(): Promise<void>;

  // --- accounts & session ---
  createAccount(account: Account): Promise<void>;
  findAccountByEmail(email: string): Promise<Account | null>;
  getAccount(id: string): Promise<Account | null>;
  listAccounts(): Promise<Account[]>;
  updateAccount(account: Account): Promise<void>;
  /** Remove the account row and every per-account row it owns (local delete). */
  deleteAccount(accountId: string): Promise<void>;
  /** Gather a full, portable snapshot of one account's data. */
  exportAccountData(accountId: string): Promise<AccountExport>;
  getSession(): Promise<string | null>;
  setSession(accountId: string | null): Promise<void>;

  // --- per-account: rule ---
  listPractices(accountId: string): Promise<Practice[]>;
  upsertPractice(accountId: string, p: Practice): Promise<void>;
  deletePractice(accountId: string, id: string): Promise<void>;
  listLogs(accountId: string): Promise<PracticeLog[]>;
  upsertLog(accountId: string, l: PracticeLog): Promise<void>;
  listRestDays(accountId: string): Promise<string[]>;
  setRestDay(accountId: string, dateKey: string, on: boolean): Promise<void>;

  // --- per-account: journal ---
  listJournal(accountId: string): Promise<JournalEntry[]>;
  upsertJournal(accountId: string, entry: JournalEntry): Promise<void>;
  deleteJournal(accountId: string, id: string): Promise<void>;

  // --- per-account: highlights ---
  listHighlights(accountId: string, filter?: HighlightFilter): Promise<Highlight[]>;
  upsertHighlight(accountId: string, h: Highlight): Promise<void>;
  deleteHighlight(accountId: string, id: string): Promise<void>;

  // --- per-account: reading plan ---
  getEnrollment(accountId: string, planId: string): Promise<ReadingEnrollment | null>;
  enroll(accountId: string, enrollment: ReadingEnrollment): Promise<void>;
  listReadDays(accountId: string, planId: string): Promise<number[]>;
  markReadDay(accountId: string, planId: string, dayNumber: number, completedOn: string): Promise<void>;

  // --- per-account: offices prayed ---
  listOfficeLogs(accountId: string, dateKey: string): Promise<string[]>;
  setOfficeLog(accountId: string, dateKey: string, officeKey: string, on: boolean): Promise<void>;
  countOfficeLogs(accountId: string): Promise<number>;

  // --- per-account: learn ---
  listLearn(accountId: string): Promise<LearnLessonRecord[]>;
  completeLesson(accountId: string, lessonId: string, correct: number, total: number, completedOn: string): Promise<void>;

  // --- per-account: onboarding answers ---
  getOnboarding(accountId: string): Promise<OnboardingAnswers | null>;
  saveOnboarding(accountId: string, answers: OnboardingAnswers, completedAt: number): Promise<void>;

  // --- global key/value ---
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
}

const SESSION_KEY = 'session_account_id';
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const logKey = (l: { practiceId: string; date: CivilDate }) =>
  `${l.practiceId}|${l.date.year}-${l.date.month}-${l.date.day}`;

/** Whether a highlight matches an optional filter (shared by both repos). */
export function matchesHighlightFilter(h: Highlight, filter?: HighlightFilter): boolean {
  if (!filter) return true;
  if (filter.source && h.anchor.source !== filter.source) return false;
  // A scripture-location filter implies scripture-only; a coptic-date filter implies synaxarium-only.
  if (filter.book != null || filter.chapter != null) {
    if (!isScripture(h.anchor)) return false;
    if (filter.book != null && h.anchor.book !== filter.book) return false;
    if (filter.chapter != null && h.anchor.chapter !== filter.chapter) return false;
  }
  if (filter.copticMonth != null || filter.copticDay != null) {
    if (isScripture(h.anchor)) return false;
    if (filter.copticMonth != null && h.anchor.copticMonth !== filter.copticMonth) return false;
    if (filter.copticDay != null && h.anchor.copticDay !== filter.copticDay) return false;
  }
  return true;
}

/** In-memory repository (tests, web, fallback). Data isolated per account. */
export class MemoryRepo implements Repo {
  private accounts = new Map<string, Account>();
  private practices = new Map<string, Map<string, Practice>>();
  private logs = new Map<string, Map<string, PracticeLog>>();
  private rest = new Map<string, Set<string>>();
  private journal = new Map<string, Map<string, JournalEntry>>();
  private highlights = new Map<string, Map<string, Highlight>>();
  private enrollments = new Map<string, Map<string, ReadingEnrollment>>();
  private readDays = new Map<string, Map<string, Set<number>>>(); // account → plan → days
  private offices = new Map<string, Set<string>>(); // account → "dateKey|officeKey"
  private learn = new Map<string, Map<string, LearnLessonRecord>>(); // account → lesson → record
  private onboarding = new Map<string, OnboardingAnswers>(); // account → answers
  private settingsMap = new Map<string, string>();

  async init(): Promise<void> {}

  private bucket<V>(m: Map<string, Map<string, V>>, accountId: string): Map<string, V> {
    let b = m.get(accountId);
    if (!b) m.set(accountId, (b = new Map()));
    return b;
  }
  private setBucket(m: Map<string, Set<string>>, accountId: string): Set<string> {
    let b = m.get(accountId);
    if (!b) m.set(accountId, (b = new Set()));
    return b;
  }

  // accounts & session
  async createAccount(account: Account): Promise<void> {
    this.accounts.set(account.id, { ...account, email: normalizeEmail(account.email) });
  }
  async findAccountByEmail(email: string): Promise<Account | null> {
    const e = normalizeEmail(email);
    for (const a of this.accounts.values()) if (a.email === e) return a;
    return null;
  }
  async getAccount(id: string): Promise<Account | null> {
    return this.accounts.get(id) ?? null;
  }
  async listAccounts(): Promise<Account[]> {
    return [...this.accounts.values()].sort((a, b) => a.createdAt - b.createdAt);
  }
  async updateAccount(account: Account): Promise<void> {
    this.accounts.set(account.id, { ...account, email: normalizeEmail(account.email) });
  }
  async getSession(): Promise<string | null> {
    return this.settingsMap.get(SESSION_KEY) ?? null;
  }
  async setSession(accountId: string | null): Promise<void> {
    if (accountId) this.settingsMap.set(SESSION_KEY, accountId);
    else this.settingsMap.delete(SESSION_KEY);
  }

  // rule data
  async listPractices(accountId: string): Promise<Practice[]> {
    return [...this.bucket(this.practices, accountId).values()].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  async upsertPractice(accountId: string, p: Practice): Promise<void> {
    this.bucket(this.practices, accountId).set(p.id, p);
  }
  async deletePractice(accountId: string, id: string): Promise<void> {
    this.bucket(this.practices, accountId).delete(id);
    const logs = this.bucket(this.logs, accountId);
    for (const [k, v] of logs) if (v.practiceId === id) logs.delete(k);
  }
  async listLogs(accountId: string): Promise<PracticeLog[]> {
    return [...this.bucket(this.logs, accountId).values()];
  }
  async upsertLog(accountId: string, l: PracticeLog): Promise<void> {
    this.bucket(this.logs, accountId).set(logKey(l), l);
  }
  async listRestDays(accountId: string): Promise<string[]> {
    return [...this.setBucket(this.rest, accountId)];
  }
  async setRestDay(accountId: string, dateKey: string, on: boolean): Promise<void> {
    const b = this.setBucket(this.rest, accountId);
    if (on) b.add(dateKey);
    else b.delete(dateKey);
  }

  // journal
  async listJournal(accountId: string): Promise<JournalEntry[]> {
    return [...this.bucket(this.journal, accountId).values()].sort((a, b) => b.createdAt - a.createdAt);
  }
  async upsertJournal(accountId: string, entry: JournalEntry): Promise<void> {
    this.bucket(this.journal, accountId).set(entry.id, entry);
  }
  async deleteJournal(accountId: string, id: string): Promise<void> {
    this.bucket(this.journal, accountId).delete(id);
  }

  // highlights
  async listHighlights(accountId: string, filter?: HighlightFilter): Promise<Highlight[]> {
    return [...this.bucket(this.highlights, accountId).values()]
      .filter((h) => matchesHighlightFilter(h, filter))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  async upsertHighlight(accountId: string, h: Highlight): Promise<void> {
    this.bucket(this.highlights, accountId).set(h.id, h);
  }
  async deleteHighlight(accountId: string, id: string): Promise<void> {
    this.bucket(this.highlights, accountId).delete(id);
  }

  // reading plan
  async getEnrollment(accountId: string, planId: string): Promise<ReadingEnrollment | null> {
    return this.bucket(this.enrollments, accountId).get(planId) ?? null;
  }
  async enroll(accountId: string, enrollment: ReadingEnrollment): Promise<void> {
    this.bucket(this.enrollments, accountId).set(enrollment.planId, enrollment);
  }
  async listReadDays(accountId: string, planId: string): Promise<number[]> {
    return [...(this.bucket(this.readDays, accountId).get(planId) ?? new Set<number>())].sort((a, b) => a - b);
  }
  async markReadDay(accountId: string, planId: string, dayNumber: number): Promise<void> {
    const plans = this.bucket(this.readDays, accountId);
    let days = plans.get(planId);
    if (!days) plans.set(planId, (days = new Set()));
    days.add(dayNumber);
  }

  // offices
  async listOfficeLogs(accountId: string, dateKey: string): Promise<string[]> {
    const b = this.setBucket(this.offices, accountId);
    return [...b].filter((k) => k.startsWith(`${dateKey}|`)).map((k) => k.split('|')[1]!);
  }
  async setOfficeLog(accountId: string, dateKey: string, officeKey: string, on: boolean): Promise<void> {
    const b = this.setBucket(this.offices, accountId);
    const k = `${dateKey}|${officeKey}`;
    if (on) b.add(k);
    else b.delete(k);
  }
  async countOfficeLogs(accountId: string): Promise<number> {
    return this.setBucket(this.offices, accountId).size;
  }

  // learn
  async listLearn(accountId: string): Promise<LearnLessonRecord[]> {
    return [...this.bucket(this.learn, accountId).values()];
  }
  async completeLesson(accountId: string, lessonId: string, correct: number, total: number, completedOn: string): Promise<void> {
    const b = this.bucket(this.learn, accountId);
    const prev = b.get(lessonId);
    // Keep the best score so re-doing a lesson never regresses progress.
    b.set(lessonId, { lessonId, completedOn, total, correct: Math.max(correct, prev?.correct ?? 0) });
  }

  // onboarding answers
  async getOnboarding(accountId: string): Promise<OnboardingAnswers | null> {
    return this.onboarding.get(accountId) ?? null;
  }
  async saveOnboarding(accountId: string, answers: OnboardingAnswers): Promise<void> {
    this.onboarding.set(accountId, answers);
  }

  // account deletion & export
  async deleteAccount(accountId: string): Promise<void> {
    this.accounts.delete(accountId);
    this.practices.delete(accountId);
    this.logs.delete(accountId);
    this.rest.delete(accountId);
    this.journal.delete(accountId);
    this.highlights.delete(accountId);
    this.enrollments.delete(accountId);
    this.readDays.delete(accountId);
    this.offices.delete(accountId);
    this.learn.delete(accountId);
    this.onboarding.delete(accountId);
  }

  async exportAccountData(accountId: string): Promise<AccountExport> {
    const acc = this.accounts.get(accountId);
    const enrollments = [...this.bucket(this.enrollments, accountId).values()];
    const readDays = this.bucket(this.readDays, accountId);
    const readingProgress: AccountExport['readingProgress'] = [];
    for (const [planId, days] of readDays) for (const dayNumber of days) readingProgress.push({ planId, dayNumber });
    const officeLogs = [...this.setBucket(this.offices, accountId)].map((k) => {
      const [date, officeKey] = k.split('|');
      return { date: date!, officeKey: officeKey! };
    });
    return {
      exportedAt: 0, // stamped by the caller (no clock in the repo)
      profile: {
        id: accountId,
        email: acc?.email ?? '',
        displayName: acc?.displayName ?? null,
        journeyStage: acc?.journeyStage ?? null,
        createdAt: acc?.createdAt ?? 0,
        onboardingComplete: acc?.onboardingComplete ?? false,
      },
      onboarding: this.onboarding.get(accountId) ?? null,
      practices: [...this.bucket(this.practices, accountId).values()],
      practiceLogs: [...this.bucket(this.logs, accountId).values()],
      restDays: [...this.setBucket(this.rest, accountId)],
      journal: [...this.bucket(this.journal, accountId).values()],
      highlights: [...this.bucket(this.highlights, accountId).values()],
      readingPlans: enrollments,
      readingProgress,
      officeLogs,
      learn: [...this.bucket(this.learn, accountId).values()],
    };
  }

  // global key/value
  async getSetting(key: string): Promise<string | null> {
    return this.settingsMap.get(key) ?? null;
  }
  async setSetting(key: string, value: string): Promise<void> {
    this.settingsMap.set(key, value);
  }
}

let repo: Repo | null = null;
let localRepo: Repo | null = null;

/**
 * The guest account. Guests never touch the backend: their data lives in the
 * LOCAL repo (SQLite on device) even when Supabase is configured, honoring the
 * privacy policy's "without signing in, your content never leaves your device".
 */
export const GUEST_ACCOUNT_ID = 'guest-local';

function makeLocalRepo(): Repo {
  if (Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos') {
    return new MemoryRepo();
  }
  // Lazy require so expo-sqlite is never loaded on web / in jest.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SqliteRepo } = require('./sqliteRepo') as typeof import('./sqliteRepo');
    return new SqliteRepo();
  } catch {
    return new MemoryRepo();
  }
}

/**
 * The on-device repository, for data that must never reach the backend (the
 * guest account). When the backend isn't configured this IS the active repo,
 * so dev/tests keep a single store for both session and data.
 */
export function getLocalRepo(): Repo {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { isBackendConfigured } = require('../lib/config') as typeof import('../lib/config');
    if (!isBackendConfigured()) return getRepo();
  } catch {
    return getRepo();
  }
  if (!localRepo) localRepo = makeLocalRepo();
  return localRepo;
}

/**
 * The active repository. Supabase when configured (online-first, RLS-scoped),
 * otherwise the local store (SQLite on device, memory on web/tests) — so the app
 * still runs in Expo Go / dev without backend keys.
 *
 * Pass the owning `accountId` for per-account data: the guest account is
 * dispatched to the local repo, everything else to the default.
 */
export function getRepo(accountId?: string): Repo {
  if (accountId === GUEST_ACCOUNT_ID) return getLocalRepo();
  if (repo) return repo;
  // Lazy require so the Supabase client (and its native deps) load only when needed.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { isBackendConfigured } = require('../lib/config') as typeof import('../lib/config');
    if (isBackendConfigured()) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { SupabaseRepo } = require('./supabaseRepo') as typeof import('./supabaseRepo');
      repo = new SupabaseRepo();
      return repo;
    }
  } catch {
    // fall through to the local repo
  }
  repo = makeLocalRepo();
  return repo;
}

/** Test/dev hook to force a specific repo. */
export function setRepo(r: Repo): void {
  repo = r;
  localRepo = r;
}

export { normalizeEmail };
export type { DayStatus };
