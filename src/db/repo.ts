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

  // global key/value
  async getSetting(key: string): Promise<string | null> {
    return this.settingsMap.get(key) ?? null;
  }
  async setSetting(key: string, value: string): Promise<void> {
    this.settingsMap.set(key, value);
  }
}

let repo: Repo | null = null;

/** The active repository for this platform (SQLite on device, memory elsewhere). */
export function getRepo(): Repo {
  if (repo) return repo;
  if (Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos') {
    repo = new MemoryRepo();
  } else {
    // Lazy require so expo-sqlite is never loaded on web / in jest.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { SqliteRepo } = require('./sqliteRepo') as typeof import('./sqliteRepo');
      repo = new SqliteRepo();
    } catch {
      repo = new MemoryRepo();
    }
  }
  return repo;
}

/** Test/dev hook to force a specific repo. */
export function setRepo(r: Repo): void {
  repo = r;
}

export { normalizeEmail };
export type { DayStatus };
