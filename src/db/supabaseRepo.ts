/**
 * SupabaseRepo — online-first persistence against Supabase (Postgres + RLS).
 * Implements the same `Repo` interface as the local repos; rows are scoped by
 * `account_id` and additionally protected server-side by RLS (auth.uid()).
 * Device-only prefs (theme, notification config) live in AsyncStorage, never the
 * server. Accounts/session are handled by Supabase Auth (see src/state/auth.ts);
 * the account methods here map onto the `profiles` table.
 *
 * NOT verifiable in this environment (needs keys + a dev build) — owner-verified.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase } from '../lib/supabase';
import { matchesHighlightFilter } from './repo';
import type { Repo, Account, JourneyStage, JournalEntry, ReadingEnrollment, LearnLessonRecord, HighlightFilter } from './repo';
import type { Practice, PracticeLog } from '../domain/rule';
import type { CivilDate } from '../domain/coptic';
import type { Highlight } from '../domain/highlights';

type Row = Record<string, any>;

function parseDateKey(key: string): CivilDate {
  const [y, m, d] = key.split('-').map(Number);
  return { year: y ?? 0, month: m ?? 1, day: d ?? 1 };
}
const toDateKey = (d: CivilDate) =>
  `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

function unwrap<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// --- row ↔ domain mappers (snake_case columns) -----------------------------

const rowToPractice = (r: Row): Practice => ({
  id: r.id,
  createdAt: r.created_at,
  name: r.name,
  category: r.category,
  kind: r.kind,
  cadence: r.cadence,
  measure: r.measure,
  target: r.target ?? undefined,
  parts: r.parts ?? undefined,
  reminder: r.reminder ?? undefined,
  intention: r.intention ?? undefined,
  state: r.state,
  resumeOn: r.resume_on ? parseDateKey(r.resume_on) : undefined,
  sortOrder: r.sort_order,
});

const practiceToRow = (accountId: string, p: Practice): Row => ({
  id: p.id,
  account_id: accountId,
  created_at: p.createdAt,
  name: p.name,
  category: p.category,
  kind: p.kind,
  cadence: p.cadence,
  measure: p.measure,
  target: p.target ?? null,
  parts: p.parts ?? null,
  reminder: p.reminder ?? null,
  intention: p.intention ?? null,
  state: p.state,
  resume_on: p.resumeOn ? toDateKey(p.resumeOn) : null,
  sort_order: p.sortOrder,
});

const rowToLog = (r: Row): PracticeLog => ({
  practiceId: r.practice_id,
  date: parseDateKey(r.date),
  status: r.status,
  value: r.value ?? undefined,
  parts: r.parts ?? undefined,
});

const rowToJournal = (r: Row): JournalEntry => ({
  id: r.id,
  date: parseDateKey(r.date),
  title: r.title,
  body: r.body,
  passageRef: r.passage_ref ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const rowToHighlight = (r: Row): Highlight => ({
  id: r.id,
  anchor: r.anchor,
  textSnapshot: r.text_snapshot,
  referenceLabel: r.reference_label,
  note: r.note ?? undefined,
  color: r.color ?? undefined,
  label: r.label ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const rowToAccount = (r: Row): Account => ({
  id: r.id,
  email: r.email ?? '',
  passwordHash: '',
  salt: '',
  createdAt: r.created_at ? Date.parse(r.created_at) : 0,
  displayName: r.display_name ?? null,
  journeyStage: (r.journey_stage as JourneyStage | null) ?? null,
  onboardingComplete: !!r.onboarding_complete,
});

export class SupabaseRepo implements Repo {
  private get sb() {
    return getSupabase();
  }

  async init(): Promise<void> {
    // Schema is provisioned server-side (supabase/migrations); nothing to do.
  }

  // --- accounts & session (Supabase Auth + profiles) ---
  async createAccount(): Promise<void> {
    // The `profiles` row is seeded by the on-auth-user-created trigger.
  }
  async findAccountByEmail(): Promise<Account | null> {
    return null; // no email lookup in Google-only mode
  }
  async getAccount(id: string): Promise<Account | null> {
    const data = unwrap(await this.sb.from('profiles').select('*').eq('id', id).maybeSingle());
    return data ? rowToAccount(data) : null;
  }
  async listAccounts(): Promise<Account[]> {
    return []; // single signed-in user
  }
  async updateAccount(account: Account): Promise<void> {
    unwrap(
      await this.sb.from('profiles').upsert({
        id: account.id,
        email: account.email || null,
        display_name: account.displayName,
        journey_stage: account.journeyStage,
        onboarding_complete: account.onboardingComplete,
      }),
    );
  }
  async getSession(): Promise<string | null> {
    const { data } = await this.sb.auth.getSession();
    return data.session?.user.id ?? null;
  }
  async setSession(): Promise<void> {
    // Supabase manages the session (secure-store/AsyncStorage); nothing to do.
  }

  // --- rule ---
  async listPractices(accountId: string): Promise<Practice[]> {
    const data = unwrap(await this.sb.from('practices').select('*').eq('account_id', accountId));
    return (data ?? []).map(rowToPractice).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  async upsertPractice(accountId: string, p: Practice): Promise<void> {
    unwrap(await this.sb.from('practices').upsert(practiceToRow(accountId, p)));
  }
  async deletePractice(accountId: string, id: string): Promise<void> {
    unwrap(await this.sb.from('practice_logs').delete().eq('account_id', accountId).eq('practice_id', id));
    unwrap(await this.sb.from('practices').delete().eq('account_id', accountId).eq('id', id));
  }
  async listLogs(accountId: string): Promise<PracticeLog[]> {
    const data = unwrap(await this.sb.from('practice_logs').select('*').eq('account_id', accountId));
    return (data ?? []).map(rowToLog);
  }
  async upsertLog(accountId: string, l: PracticeLog): Promise<void> {
    unwrap(
      await this.sb.from('practice_logs').upsert({
        account_id: accountId,
        practice_id: l.practiceId,
        date: toDateKey(l.date),
        status: l.status,
        value: l.value ?? null,
        parts: l.parts ?? null,
      }),
    );
  }
  async listRestDays(accountId: string): Promise<string[]> {
    const data = unwrap(await this.sb.from('rest_days').select('date').eq('account_id', accountId));
    return (data ?? []).map((r: Row) => r.date);
  }
  async setRestDay(accountId: string, dateKey: string, on: boolean): Promise<void> {
    if (on) unwrap(await this.sb.from('rest_days').upsert({ account_id: accountId, date: dateKey }));
    else unwrap(await this.sb.from('rest_days').delete().eq('account_id', accountId).eq('date', dateKey));
  }

  // --- journal ---
  async listJournal(accountId: string): Promise<JournalEntry[]> {
    const data = unwrap(await this.sb.from('journal_entries').select('*').eq('account_id', accountId));
    return (data ?? []).map(rowToJournal).sort((a, b) => b.createdAt - a.createdAt);
  }
  async upsertJournal(accountId: string, entry: JournalEntry): Promise<void> {
    unwrap(
      await this.sb.from('journal_entries').upsert({
        account_id: accountId,
        id: entry.id,
        date: toDateKey(entry.date),
        title: entry.title,
        body: entry.body,
        passage_ref: entry.passageRef ?? null,
        created_at: entry.createdAt,
        updated_at: entry.updatedAt,
      }),
    );
  }
  async deleteJournal(accountId: string, id: string): Promise<void> {
    unwrap(await this.sb.from('journal_entries').delete().eq('account_id', accountId).eq('id', id));
  }

  // --- highlights ---
  async listHighlights(accountId: string, filter?: HighlightFilter): Promise<Highlight[]> {
    let q = this.sb.from('highlights').select('*').eq('account_id', accountId);
    if (filter?.source) q = q.eq('source', filter.source);
    const data = unwrap(await q);
    return (data ?? [])
      .map(rowToHighlight)
      .filter((h) => matchesHighlightFilter(h, filter))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  async upsertHighlight(accountId: string, h: Highlight): Promise<void> {
    unwrap(
      await this.sb.from('highlights').upsert({
        account_id: accountId,
        id: h.id,
        source: h.anchor.source,
        anchor: h.anchor,
        text_snapshot: h.textSnapshot,
        reference_label: h.referenceLabel,
        note: h.note ?? null,
        color: h.color ?? null,
        label: h.label ?? null,
        created_at: h.createdAt,
        updated_at: h.updatedAt,
      }),
    );
  }
  async deleteHighlight(accountId: string, id: string): Promise<void> {
    unwrap(await this.sb.from('highlights').delete().eq('account_id', accountId).eq('id', id));
  }

  // --- reading plan ---
  async getEnrollment(accountId: string, planId: string): Promise<ReadingEnrollment | null> {
    const data = unwrap(
      await this.sb.from('reading_plans').select('*').eq('account_id', accountId).eq('plan_id', planId).maybeSingle(),
    );
    return data ? { planId: data.plan_id, startDate: parseDateKey(data.start_date), createdAt: data.created_at } : null;
  }
  async enroll(accountId: string, enrollment: ReadingEnrollment): Promise<void> {
    unwrap(
      await this.sb.from('reading_plans').upsert(
        { account_id: accountId, plan_id: enrollment.planId, start_date: toDateKey(enrollment.startDate), created_at: enrollment.createdAt },
        { onConflict: 'account_id,plan_id', ignoreDuplicates: true },
      ),
    );
  }
  async listReadDays(accountId: string, planId: string): Promise<number[]> {
    const data = unwrap(
      await this.sb.from('reading_progress').select('day_number').eq('account_id', accountId).eq('plan_id', planId),
    );
    return (data ?? []).map((r: Row) => r.day_number).sort((a: number, b: number) => a - b);
  }
  async markReadDay(accountId: string, planId: string, dayNumber: number, completedOn: string): Promise<void> {
    unwrap(
      await this.sb.from('reading_progress').upsert(
        { account_id: accountId, plan_id: planId, day_number: dayNumber, completed_on: completedOn },
        { onConflict: 'account_id,plan_id,day_number', ignoreDuplicates: true },
      ),
    );
  }

  // --- offices ---
  async listOfficeLogs(accountId: string, dateKey: string): Promise<string[]> {
    const data = unwrap(await this.sb.from('office_logs').select('office_key').eq('account_id', accountId).eq('date', dateKey));
    return (data ?? []).map((r: Row) => r.office_key);
  }
  async setOfficeLog(accountId: string, dateKey: string, officeKey: string, on: boolean): Promise<void> {
    if (on) unwrap(await this.sb.from('office_logs').upsert({ account_id: accountId, date: dateKey, office_key: officeKey }));
    else
      unwrap(
        await this.sb.from('office_logs').delete().eq('account_id', accountId).eq('date', dateKey).eq('office_key', officeKey),
      );
  }
  async countOfficeLogs(accountId: string): Promise<number> {
    const res = await this.sb.from('office_logs').select('*', { count: 'exact', head: true }).eq('account_id', accountId);
    if (res.error) throw new Error(res.error.message);
    return res.count ?? 0;
  }

  // --- learn ---
  async listLearn(accountId: string): Promise<LearnLessonRecord[]> {
    const data = unwrap(await this.sb.from('learn_lessons').select('*').eq('account_id', accountId));
    return (data ?? []).map((r: Row) => ({ lessonId: r.lesson_id, completedOn: r.completed_on, correct: r.correct, total: r.total }));
  }
  async completeLesson(accountId: string, lessonId: string, correct: number, total: number, completedOn: string): Promise<void> {
    const prev = unwrap(
      await this.sb.from('learn_lessons').select('correct').eq('account_id', accountId).eq('lesson_id', lessonId).maybeSingle(),
    );
    const best = Math.max(correct, prev?.correct ?? 0); // never regress a lesson's best
    unwrap(
      await this.sb.from('learn_lessons').upsert({ account_id: accountId, lesson_id: lessonId, completed_on: completedOn, correct: best, total }),
    );
  }

  // --- device-local key/value (prefs only — never synced) ---
  async getSetting(key: string): Promise<string | null> {
    return AsyncStorage.getItem(`pref:${key}`);
  }
  async setSetting(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(`pref:${key}`, value);
  }
}
