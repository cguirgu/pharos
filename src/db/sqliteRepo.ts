/**
 * SqliteRepo — on-device persistence via expo-sqlite + Drizzle. DEVICE-ONLY:
 * loaded lazily by `getRepo()` so it never runs on web or in jest (where the
 * native module is absent). Not visually verifiable in the current
 * (no-Xcode/no-simulator) environment — covered by the MemoryRepo tests instead.
 *
 * Data is scoped per account: every practice/log/rest-day query filters by
 * `account_id`.
 */
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq, and } from 'drizzle-orm';
import * as s from './schema';
import { CREATE_SQL } from './schema';
import type { Repo, Account, JourneyStage, JournalEntry, ReadingEnrollment, HighlightFilter } from './repo';
import { normalizeEmail, matchesHighlightFilter } from './repo';
import type { Practice, PracticeLog, Cadence, Measure, Category, Kind, PracticeState, DayStatus, Reminder } from '../domain/rule';
import type { CivilDate } from '../domain/coptic';
import type { Highlight, HighlightAnchor, HighlightColor, HighlightSource } from '../domain/highlights';

const SESSION_KEY = 'session_account_id';
const SCHEMA_KEY = 'schema_version';
/** Bump whenever the table shapes change (forces a local rebuild). */
const SCHEMA_VERSION = 4;

function parseDateKey(key: string): CivilDate {
  const [y, m, d] = key.split('-').map(Number);
  return { year: y ?? 0, month: m ?? 1, day: d ?? 1 };
}
const toDateKey = (d: CivilDate) =>
  `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

type PracticeRow = typeof s.practices.$inferSelect;
type LogRow = typeof s.practiceLogs.$inferSelect;
type AccountRow = typeof s.accounts.$inferSelect;

function rowToPractice(r: PracticeRow): Practice {
  return {
    id: r.id,
    createdAt: r.createdAt,
    name: r.name,
    category: r.category as Category,
    kind: r.kind as Kind,
    cadence: JSON.parse(r.cadence) as Cadence,
    measure: r.measure as Measure,
    target: r.target ?? undefined,
    parts: r.parts ? (JSON.parse(r.parts) as string[]) : undefined,
    reminder: r.reminder ? (JSON.parse(r.reminder) as Reminder) : undefined,
    intention: r.intention ?? undefined,
    state: r.state as PracticeState,
    resumeOn: r.resumeOn ? parseDateKey(r.resumeOn) : undefined,
    sortOrder: r.sortOrder,
  };
}

function practiceToRow(accountId: string, p: Practice): PracticeRow {
  return {
    id: p.id,
    accountId,
    createdAt: p.createdAt,
    name: p.name,
    category: p.category,
    kind: p.kind,
    cadence: JSON.stringify(p.cadence),
    measure: p.measure,
    target: p.target ?? null,
    parts: p.parts ? JSON.stringify(p.parts) : null,
    reminder: p.reminder ? JSON.stringify(p.reminder) : null,
    intention: p.intention ?? null,
    state: p.state,
    resumeOn: p.resumeOn ? toDateKey(p.resumeOn) : null,
    sortOrder: p.sortOrder,
  };
}

function rowToLog(r: LogRow): PracticeLog {
  return {
    practiceId: r.practiceId,
    date: parseDateKey(r.date),
    status: r.status as DayStatus,
    value: r.value ?? undefined,
    parts: r.parts ? (JSON.parse(r.parts) as string[]) : undefined,
  };
}

function rowToAccount(r: AccountRow): Account {
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.passwordHash,
    salt: r.salt,
    createdAt: r.createdAt,
    displayName: r.displayName ?? null,
    journeyStage: (r.journeyStage as JourneyStage | null) ?? null,
    onboardingComplete: r.onboardingComplete === 1,
  };
}

function accountToRow(a: Account): AccountRow {
  return {
    id: a.id,
    email: normalizeEmail(a.email),
    passwordHash: a.passwordHash,
    salt: a.salt,
    createdAt: a.createdAt,
    displayName: a.displayName,
    journeyStage: a.journeyStage,
    onboardingComplete: a.onboardingComplete ? 1 : 0,
  };
}

type HighlightRow = typeof s.highlights.$inferSelect;

function rowToHighlight(r: HighlightRow): Highlight {
  return {
    id: r.id,
    anchor: JSON.parse(r.anchor) as HighlightAnchor,
    textSnapshot: r.textSnapshot,
    referenceLabel: r.referenceLabel,
    note: r.note ?? undefined,
    color: (r.color as HighlightColor | null) ?? undefined,
    label: r.label ?? undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function highlightToRow(accountId: string, h: Highlight): HighlightRow {
  return {
    accountId,
    id: h.id,
    source: h.anchor.source as HighlightSource,
    anchor: JSON.stringify(h.anchor),
    textSnapshot: h.textSnapshot,
    referenceLabel: h.referenceLabel,
    note: h.note ?? null,
    color: h.color ?? null,
    label: h.label ?? null,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  };
}

export class SqliteRepo implements Repo {
  private readonly native: SQLiteDatabase;
  private readonly db: ReturnType<typeof drizzle>;

  constructor() {
    this.native = openDatabaseSync('pharos.db');
    this.db = drizzle(this.native);
  }

  async init(): Promise<void> {
    this.native.execSync(CREATE_SQL);
    // Lightweight migration: if the stored schema version doesn't match (e.g. an
    // older build created the data tables before `account_id` existed), rebuild
    // the data tables. This is a local testbed, so wiping incompatible data is
    // acceptable; the `settings` table (and the version flag) is preserved.
    const ver = await this.getSetting(SCHEMA_KEY);
    if (ver !== String(SCHEMA_VERSION)) {
      this.native.execSync(`
        DROP TABLE IF EXISTS practices;
        DROP TABLE IF EXISTS practice_logs;
        DROP TABLE IF EXISTS rest_days;
        DROP TABLE IF EXISTS accounts;
        DROP TABLE IF EXISTS journal_entries;
        DROP TABLE IF EXISTS highlights;
        DROP TABLE IF EXISTS reading_plans;
        DROP TABLE IF EXISTS reading_progress;
        DROP TABLE IF EXISTS office_logs;
      `);
      this.native.execSync(CREATE_SQL);
      await this.setSetting(SCHEMA_KEY, String(SCHEMA_VERSION));
    }
  }

  // --- accounts & session ---
  async createAccount(account: Account): Promise<void> {
    this.db.insert(s.accounts).values(accountToRow(account)).run();
  }
  async findAccountByEmail(email: string): Promise<Account | null> {
    const row = this.db.select().from(s.accounts).where(eq(s.accounts.email, normalizeEmail(email))).get();
    return row ? rowToAccount(row) : null;
  }
  async getAccount(id: string): Promise<Account | null> {
    const row = this.db.select().from(s.accounts).where(eq(s.accounts.id, id)).get();
    return row ? rowToAccount(row) : null;
  }
  async listAccounts(): Promise<Account[]> {
    return this.db.select().from(s.accounts).all().map(rowToAccount).sort((a, b) => a.createdAt - b.createdAt);
  }
  async updateAccount(account: Account): Promise<void> {
    const row = accountToRow(account);
    this.db.update(s.accounts).set(row).where(eq(s.accounts.id, account.id)).run();
  }
  async getSession(): Promise<string | null> {
    return this.getSetting(SESSION_KEY);
  }
  async setSession(accountId: string | null): Promise<void> {
    if (accountId) await this.setSetting(SESSION_KEY, accountId);
    else this.db.delete(s.settings).where(eq(s.settings.key, SESSION_KEY)).run();
  }

  // --- per-account data ---
  async listPractices(accountId: string): Promise<Practice[]> {
    return this.db
      .select()
      .from(s.practices)
      .where(eq(s.practices.accountId, accountId))
      .all()
      .map(rowToPractice)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  async upsertPractice(accountId: string, p: Practice): Promise<void> {
    const row = practiceToRow(accountId, p);
    this.db.insert(s.practices).values(row).onConflictDoUpdate({ target: s.practices.id, set: row }).run();
  }
  async deletePractice(accountId: string, id: string): Promise<void> {
    this.db
      .delete(s.practiceLogs)
      .where(and(eq(s.practiceLogs.accountId, accountId), eq(s.practiceLogs.practiceId, id)))
      .run();
    this.db.delete(s.practices).where(and(eq(s.practices.accountId, accountId), eq(s.practices.id, id))).run();
  }
  async listLogs(accountId: string): Promise<PracticeLog[]> {
    return this.db.select().from(s.practiceLogs).where(eq(s.practiceLogs.accountId, accountId)).all().map(rowToLog);
  }
  async upsertLog(accountId: string, l: PracticeLog): Promise<void> {
    const row: LogRow = {
      accountId,
      practiceId: l.practiceId,
      date: toDateKey(l.date),
      status: l.status,
      value: l.value ?? null,
      parts: l.parts ? JSON.stringify(l.parts) : null,
    };
    this.db
      .insert(s.practiceLogs)
      .values(row)
      .onConflictDoUpdate({ target: [s.practiceLogs.practiceId, s.practiceLogs.date], set: row })
      .run();
  }
  async listRestDays(accountId: string): Promise<string[]> {
    return this.db
      .select()
      .from(s.restDays)
      .where(eq(s.restDays.accountId, accountId))
      .all()
      .map((r) => r.date);
  }
  async setRestDay(accountId: string, dateKey: string, on: boolean): Promise<void> {
    if (on) this.db.insert(s.restDays).values({ accountId, date: dateKey }).onConflictDoNothing().run();
    else
      this.db
        .delete(s.restDays)
        .where(and(eq(s.restDays.accountId, accountId), eq(s.restDays.date, dateKey)))
        .run();
  }

  // --- journal ---
  async listJournal(accountId: string): Promise<JournalEntry[]> {
    return this.db
      .select()
      .from(s.journalEntries)
      .where(eq(s.journalEntries.accountId, accountId))
      .all()
      .map((r) => ({
        id: r.id,
        date: parseDateKey(r.date),
        title: r.title,
        body: r.body,
        passageRef: r.passageRef ?? undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  async upsertJournal(accountId: string, entry: JournalEntry): Promise<void> {
    const row = {
      accountId,
      id: entry.id,
      date: toDateKey(entry.date),
      title: entry.title,
      body: entry.body,
      passageRef: entry.passageRef ?? null,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
    this.db
      .insert(s.journalEntries)
      .values(row)
      .onConflictDoUpdate({ target: [s.journalEntries.accountId, s.journalEntries.id], set: row })
      .run();
  }
  async deleteJournal(accountId: string, id: string): Promise<void> {
    this.db
      .delete(s.journalEntries)
      .where(and(eq(s.journalEntries.accountId, accountId), eq(s.journalEntries.id, id)))
      .run();
  }

  // --- highlights ---
  async listHighlights(accountId: string, filter?: HighlightFilter): Promise<Highlight[]> {
    // `source` narrows in SQL; the location fields (overlay-only, deferred UI) are
    // applied in JS against the parsed anchor via the shared matcher.
    const where = filter?.source
      ? and(eq(s.highlights.accountId, accountId), eq(s.highlights.source, filter.source))
      : eq(s.highlights.accountId, accountId);
    return this.db
      .select()
      .from(s.highlights)
      .where(where)
      .all()
      .map(rowToHighlight)
      .filter((h) => matchesHighlightFilter(h, filter))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  async upsertHighlight(accountId: string, h: Highlight): Promise<void> {
    const row = highlightToRow(accountId, h);
    this.db
      .insert(s.highlights)
      .values(row)
      .onConflictDoUpdate({ target: [s.highlights.accountId, s.highlights.id], set: row })
      .run();
  }
  async deleteHighlight(accountId: string, id: string): Promise<void> {
    this.db
      .delete(s.highlights)
      .where(and(eq(s.highlights.accountId, accountId), eq(s.highlights.id, id)))
      .run();
  }

  // --- reading plan ---
  async getEnrollment(accountId: string, planId: string): Promise<ReadingEnrollment | null> {
    const row = this.db
      .select()
      .from(s.readingPlans)
      .where(and(eq(s.readingPlans.accountId, accountId), eq(s.readingPlans.planId, planId)))
      .get();
    return row ? { planId: row.planId, startDate: parseDateKey(row.startDate), createdAt: row.createdAt } : null;
  }
  async enroll(accountId: string, enrollment: ReadingEnrollment): Promise<void> {
    this.db
      .insert(s.readingPlans)
      .values({
        accountId,
        planId: enrollment.planId,
        startDate: toDateKey(enrollment.startDate),
        createdAt: enrollment.createdAt,
      })
      .onConflictDoNothing()
      .run();
  }
  async listReadDays(accountId: string, planId: string): Promise<number[]> {
    return this.db
      .select()
      .from(s.readingProgress)
      .where(and(eq(s.readingProgress.accountId, accountId), eq(s.readingProgress.planId, planId)))
      .all()
      .map((r) => r.dayNumber)
      .sort((a, b) => a - b);
  }
  async markReadDay(accountId: string, planId: string, dayNumber: number, completedOn: string): Promise<void> {
    this.db
      .insert(s.readingProgress)
      .values({ accountId, planId, dayNumber, completedOn })
      .onConflictDoNothing()
      .run();
  }

  // --- offices ---
  async listOfficeLogs(accountId: string, dateKey: string): Promise<string[]> {
    return this.db
      .select()
      .from(s.officeLogs)
      .where(and(eq(s.officeLogs.accountId, accountId), eq(s.officeLogs.date, dateKey)))
      .all()
      .map((r) => r.officeKey);
  }
  async setOfficeLog(accountId: string, dateKey: string, officeKey: string, on: boolean): Promise<void> {
    if (on)
      this.db.insert(s.officeLogs).values({ accountId, date: dateKey, officeKey }).onConflictDoNothing().run();
    else
      this.db
        .delete(s.officeLogs)
        .where(
          and(eq(s.officeLogs.accountId, accountId), eq(s.officeLogs.date, dateKey), eq(s.officeLogs.officeKey, officeKey)),
        )
        .run();
  }
  async countOfficeLogs(accountId: string): Promise<number> {
    return this.db.select().from(s.officeLogs).where(eq(s.officeLogs.accountId, accountId)).all().length;
  }

  // --- global key/value ---
  async getSetting(key: string): Promise<string | null> {
    const row = this.db.select().from(s.settings).where(eq(s.settings.key, key)).get();
    return row?.value ?? null;
  }
  async setSetting(key: string, value: string): Promise<void> {
    this.db
      .insert(s.settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: s.settings.key, set: { value } })
      .run();
  }
}
