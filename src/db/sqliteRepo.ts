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
import type { Repo, Account, JourneyStage, JournalEntry, ReadingEnrollment, LearnLessonRecord, HighlightFilter, AccountExport, QuestionRepoFilter } from './repo';
import { normalizeEmail, matchesHighlightFilter } from './repo';
import { safeJsonParse } from './json';
import type { OnboardingAnswers } from '../domain/onboarding';
import type { Practice, PracticeLog, Cadence, Measure, Category, Kind, PracticeState, DayStatus, Reminder } from '../domain/rule';
import type { CivilDate } from '../domain/coptic';
import type { Highlight, HighlightAnchor, HighlightColor, HighlightSource } from '../domain/highlights';
import type { Citation, CitationSource } from '../domain/citation';
// `Report` is aliased: the DOM lib declares a global of that name.
import type {
  Answer,
  ModerationState,
  ModerationStatus,
  PostKind,
  Question,
  QuestionTopic,
  Report as QuestionReport,
  ReportReason,
  Vote,
} from '../domain/questions';

const SESSION_KEY = 'session_account_id';
const SCHEMA_KEY = 'schema_version';
/** Bump whenever the table shapes change (forces a local rebuild). */
const SCHEMA_VERSION = 7;

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
    cadence: safeJsonParse<Cadence>(r.cadence, { type: 'daily' }, 'cadence'),
    measure: r.measure as Measure,
    target: r.target ?? undefined,
    parts: r.parts ? safeJsonParse<string[] | undefined>(r.parts, undefined, 'practice.parts') : undefined,
    reminder: r.reminder ? safeJsonParse<Reminder | undefined>(r.reminder, undefined, 'reminder') : undefined,
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
    parts: r.parts ? safeJsonParse<string[] | undefined>(r.parts, undefined, 'log.parts') : undefined,
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

/** A harmless, in-range anchor used when a stored anchor JSON is unparseable. */
function fallbackAnchor(source: string): HighlightAnchor {
  return source === 'scripture'
    ? { source: 'scripture', book: 'matthew', chapter: 1, startVerse: 1, startOffset: 0, endVerse: 1, endOffset: 0 }
    : { source: 'synaxarium', copticMonth: 1, copticDay: 1, startOffset: 0, endOffset: 0 };
}


// --- questions ---------------------------------------------------------------
// Moderation lives in four flat columns (so `mod_status` is filterable in SQL);
// these two helpers are the only place that shape is assembled/disassembled.

type QuestionRow = typeof s.questions.$inferSelect;
type AnswerRow = typeof s.answers.$inferSelect;
type VoteRow = typeof s.postVotes.$inferSelect;
type ReportRow = typeof s.postReports.$inferSelect;

function rowToModeration(r: {
  modStatus: string;
  modReportCount: number;
  modReasons: string;
  modReviewedAt: number | null;
}): ModerationState {
  return {
    status: r.modStatus as ModerationStatus,
    reportCount: r.modReportCount,
    reasons: safeJsonParse<ReportReason[]>(r.modReasons, [], 'moderation.reasons'),
    reviewedAt: r.modReviewedAt ?? null,
  };
}

function rowToQuestion(r: QuestionRow): Question {
  return {
    id: r.id,
    author: {
      accountId: r.authorAccountId,
      isAnonymous: r.isAnonymous === 1,
      // Belt and braces: never surface a name on an anonymous row, even if one
      // somehow got written.
      displayName: r.isAnonymous === 1 ? null : (r.authorDisplayName ?? null),
    },
    title: r.title,
    body: r.body,
    citation: r.citation ? safeJsonParse<Citation | null>(r.citation, null, 'question.citation') : null,
    topics: safeJsonParse<QuestionTopic[]>(r.topics, [], 'question.topics'),
    bestAnswerId: r.bestAnswerId ?? null,
    moderation: rowToModeration(r),
    affirmations: r.affirmations,
    answerCount: r.answerCount,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function questionToRow(q: Question): QuestionRow {
  return {
    id: q.id,
    authorAccountId: q.author.accountId,
    isAnonymous: q.author.isAnonymous ? 1 : 0,
    authorDisplayName: q.author.isAnonymous ? null : (q.author.displayName ?? null),
    title: q.title,
    body: q.body,
    topics: JSON.stringify(q.topics),
    citation: q.citation ? JSON.stringify(q.citation) : null,
    citationSource: (q.citation?.anchor.source as CitationSource | undefined) ?? null,
    bestAnswerId: q.bestAnswerId,
    modStatus: q.moderation.status,
    modReportCount: q.moderation.reportCount,
    modReasons: JSON.stringify(q.moderation.reasons),
    modReviewedAt: q.moderation.reviewedAt,
    affirmations: q.affirmations,
    answerCount: q.answerCount,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

function rowToAnswer(r: AnswerRow): Answer {
  return {
    id: r.id,
    questionId: r.questionId,
    parentAnswerId: r.parentAnswerId ?? null,
    author: {
      accountId: r.authorAccountId,
      isAnonymous: r.isAnonymous === 1,
      displayName: r.isAnonymous === 1 ? null : (r.authorDisplayName ?? null),
    },
    body: r.body,
    affirmations: r.affirmations,
    moderation: rowToModeration(r),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function answerToRow(a: Answer): AnswerRow {
  return {
    id: a.id,
    questionId: a.questionId,
    parentAnswerId: a.parentAnswerId,
    authorAccountId: a.author.accountId,
    isAnonymous: a.author.isAnonymous ? 1 : 0,
    authorDisplayName: a.author.isAnonymous ? null : (a.author.displayName ?? null),
    body: a.body,
    modStatus: a.moderation.status,
    modReportCount: a.moderation.reportCount,
    modReasons: JSON.stringify(a.moderation.reasons),
    modReviewedAt: a.moderation.reviewedAt,
    affirmations: a.affirmations,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

function rowToHighlight(r: HighlightRow): Highlight {
  return {
    id: r.id,
    anchor: safeJsonParse<HighlightAnchor>(r.anchor, fallbackAnchor(r.source), 'highlight.anchor'),
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
        DROP TABLE IF EXISTS learn_lessons;
        DROP TABLE IF EXISTS questions;
        DROP TABLE IF EXISTS answers;
        DROP TABLE IF EXISTS post_votes;
        DROP TABLE IF EXISTS post_reports;
        DROP TABLE IF EXISTS onboarding_answers;
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

  // --- learn ---
  async listLearn(accountId: string): Promise<LearnLessonRecord[]> {
    return this.db
      .select()
      .from(s.learnLessons)
      .where(eq(s.learnLessons.accountId, accountId))
      .all()
      .map((r) => ({ lessonId: r.lessonId, completedOn: r.completedOn, correct: r.correct, total: r.total }));
  }
  async completeLesson(accountId: string, lessonId: string, correct: number, total: number, completedOn: string): Promise<void> {
    const prev = this.db
      .select()
      .from(s.learnLessons)
      .where(and(eq(s.learnLessons.accountId, accountId), eq(s.learnLessons.lessonId, lessonId)))
      .get();
    // Keep the best score so re-doing a lesson never regresses progress.
    const best = Math.max(correct, prev?.correct ?? 0);
    this.db
      .insert(s.learnLessons)
      .values({ accountId, lessonId, completedOn, correct: best, total })
      .onConflictDoUpdate({
        target: [s.learnLessons.accountId, s.learnLessons.lessonId],
        set: { completedOn, correct: best, total },
      })
      .run();
  }

  // --- onboarding answers ---
  async getOnboarding(accountId: string): Promise<OnboardingAnswers | null> {
    const row = this.db
      .select()
      .from(s.onboardingAnswers)
      .where(eq(s.onboardingAnswers.accountId, accountId))
      .get();
    if (!row) return null;
    return safeJsonParse<OnboardingAnswers | null>(row.answers, null, 'onboarding.answers');
  }
  async saveOnboarding(accountId: string, answers: OnboardingAnswers, completedAt: number): Promise<void> {
    this.db
      .insert(s.onboardingAnswers)
      .values({ accountId, answers: JSON.stringify(answers), completedAt })
      .onConflictDoUpdate({
        target: s.onboardingAnswers.accountId,
        set: { answers: JSON.stringify(answers), completedAt },
      })
      .run();
  }

  // --- account deletion & export ---
  async deleteAccount(accountId: string): Promise<void> {
    this.db.delete(s.practices).where(eq(s.practices.accountId, accountId)).run();
    this.db.delete(s.practiceLogs).where(eq(s.practiceLogs.accountId, accountId)).run();
    this.db.delete(s.restDays).where(eq(s.restDays.accountId, accountId)).run();
    this.db.delete(s.journalEntries).where(eq(s.journalEntries.accountId, accountId)).run();
    this.db.delete(s.highlights).where(eq(s.highlights.accountId, accountId)).run();
    this.db.delete(s.readingPlans).where(eq(s.readingPlans.accountId, accountId)).run();
    this.db.delete(s.readingProgress).where(eq(s.readingProgress.accountId, accountId)).run();
    this.db.delete(s.officeLogs).where(eq(s.officeLogs.accountId, accountId)).run();
    this.db.delete(s.learnLessons).where(eq(s.learnLessons.accountId, accountId)).run();
    this.db.delete(s.onboardingAnswers).where(eq(s.onboardingAnswers.accountId, accountId)).run();
    this.db.delete(s.accounts).where(eq(s.accounts.id, accountId)).run();
  }

  async exportAccountData(accountId: string): Promise<AccountExport> {
    const acc = await this.getAccount(accountId);
    const readingPlans = this.db
      .select()
      .from(s.readingPlans)
      .where(eq(s.readingPlans.accountId, accountId))
      .all()
      .map((r) => ({ planId: r.planId, startDate: parseDateKey(r.startDate), createdAt: r.createdAt }));
    const readingProgress = this.db
      .select()
      .from(s.readingProgress)
      .where(eq(s.readingProgress.accountId, accountId))
      .all()
      .map((r) => ({ planId: r.planId, dayNumber: r.dayNumber, completedOn: r.completedOn }));
    const officeLogs = this.db
      .select()
      .from(s.officeLogs)
      .where(eq(s.officeLogs.accountId, accountId))
      .all()
      .map((r) => ({ date: r.date, officeKey: r.officeKey }));
    return {
      exportedAt: 0, // stamped by the caller
      profile: {
        id: accountId,
        email: acc?.email ?? '',
        displayName: acc?.displayName ?? null,
        journeyStage: acc?.journeyStage ?? null,
        createdAt: acc?.createdAt ?? 0,
        onboardingComplete: acc?.onboardingComplete ?? false,
      },
      onboarding: await this.getOnboarding(accountId),
      practices: await this.listPractices(accountId),
      practiceLogs: await this.listLogs(accountId),
      restDays: await this.listRestDays(accountId),
      journal: await this.listJournal(accountId),
      highlights: await this.listHighlights(accountId),
      readingPlans,
      readingProgress,
      officeLogs,
      learn: await this.listLearn(accountId),
      questions: await this.listQuestions({ authorAccountId: accountId, includeHidden: true }),
      answers: await this.listAnswersByAuthor(accountId),
    };
  }

  // --- questions (cross-account: no accountId key) ---
  async listQuestions(filter?: QuestionRepoFilter): Promise<Question[]> {
    const clauses = [];
    if (filter?.authorAccountId) clauses.push(eq(s.questions.authorAccountId, filter.authorAccountId));
    if (filter?.citationSource) clauses.push(eq(s.questions.citationSource, filter.citationSource));
    const where = clauses.length === 0 ? undefined : clauses.length === 1 ? clauses[0] : and(...clauses);
    const rows = where ? this.db.select().from(s.questions).where(where).all() : this.db.select().from(s.questions).all();
    return rows
      .map(rowToQuestion)
      .filter((q) => (filter?.includeHidden ? true : q.moderation.status !== 'removed'))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  async getQuestion(id: string): Promise<Question | null> {
    const row = this.db.select().from(s.questions).where(eq(s.questions.id, id)).get();
    return row ? rowToQuestion(row) : null;
  }
  async upsertQuestion(q: Question): Promise<void> {
    const row = questionToRow(q);
    this.db.insert(s.questions).values(row).onConflictDoUpdate({ target: s.questions.id, set: row }).run();
  }
  async deleteQuestion(id: string): Promise<void> {
    this.db.delete(s.answers).where(eq(s.answers.questionId, id)).run();
    this.db.delete(s.questions).where(eq(s.questions.id, id)).run();
  }

  async listAnswers(questionId: string): Promise<Answer[]> {
    return this.db
      .select()
      .from(s.answers)
      .where(eq(s.answers.questionId, questionId))
      .all()
      .map(rowToAnswer)
      .sort((a, b) => a.createdAt - b.createdAt);
  }
  async listAnswersByAuthor(authorAccountId: string): Promise<Answer[]> {
    return this.db
      .select()
      .from(s.answers)
      .where(eq(s.answers.authorAccountId, authorAccountId))
      .all()
      .map(rowToAnswer);
  }
  async upsertAnswer(a: Answer): Promise<void> {
    const row = answerToRow(a);
    this.db.insert(s.answers).values(row).onConflictDoUpdate({ target: s.answers.id, set: row }).run();
  }
  async deleteAnswer(id: string): Promise<void> {
    this.db.delete(s.answers).where(eq(s.answers.id, id)).run();
  }

  async listVotes(voterAccountId: string): Promise<Vote[]> {
    return this.db
      .select()
      .from(s.postVotes)
      .where(eq(s.postVotes.voterAccountId, voterAccountId))
      .all()
      .map((r: VoteRow) => ({
        targetType: r.targetType as PostKind,
        targetId: r.targetId,
        voterAccountId: r.voterAccountId,
        createdAt: r.createdAt,
      }));
  }
  async setVote(vote: Vote, on: boolean): Promise<void> {
    const match = and(
      eq(s.postVotes.targetType, vote.targetType),
      eq(s.postVotes.targetId, vote.targetId),
      eq(s.postVotes.voterAccountId, vote.voterAccountId),
    );
    if (!on) {
      this.db.delete(s.postVotes).where(match).run();
      return;
    }
    this.db
      .insert(s.postVotes)
      .values({
        targetType: vote.targetType,
        targetId: vote.targetId,
        voterAccountId: vote.voterAccountId,
        createdAt: vote.createdAt,
      })
      .onConflictDoNothing()
      .run();
  }

  async listReports(targetId: string): Promise<QuestionReport[]> {
    return this.db
      .select()
      .from(s.postReports)
      .where(eq(s.postReports.targetId, targetId))
      .all()
      .map((r: ReportRow) => ({
        id: r.id,
        targetType: r.targetType as PostKind,
        targetId: r.targetId,
        reporterAccountId: r.reporterAccountId,
        reason: r.reason as ReportReason,
        note: r.note ?? undefined,
        createdAt: r.createdAt,
      }));
  }
  async addReport(report: QuestionReport): Promise<void> {
    this.db
      .insert(s.postReports)
      .values({
        id: report.id,
        targetType: report.targetType,
        targetId: report.targetId,
        reporterAccountId: report.reporterAccountId,
        reason: report.reason,
        note: report.note ?? null,
        createdAt: report.createdAt,
      })
      .onConflictDoNothing()
      .run();
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
