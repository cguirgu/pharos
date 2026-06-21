/**
 * Drizzle schema — the typed source of truth for local persistence
 * (TECH-STACK §0). Union/array fields (cadence, parts, reminder) are stored as
 * JSON text and (de)serialised in the repository layer.
 *
 * Data is scoped per account: practices/logs/rest-days carry an `account_id`.
 * Credentials on `accounts` are local/test-only (see src/platform/hash.ts).
 */
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  salt: text('salt').notNull(),
  createdAt: integer('created_at').notNull(),
  displayName: text('display_name'),
  journeyStage: text('journey_stage'),
  onboardingComplete: integer('onboarding_complete').notNull(), // 0 | 1
});

export const practices = sqliteTable('practices', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  createdAt: integer('created_at').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  kind: text('kind').notNull(),
  cadence: text('cadence').notNull(), // JSON
  measure: text('measure').notNull(),
  target: integer('target'),
  parts: text('parts'), // JSON array
  reminder: text('reminder'), // JSON
  intention: text('intention'),
  state: text('state').notNull(),
  resumeOn: text('resume_on'), // YYYY-MM-DD
  sortOrder: integer('sort_order').notNull(),
});

export const practiceLogs = sqliteTable(
  'practice_logs',
  {
    accountId: text('account_id').notNull(),
    practiceId: text('practice_id').notNull(),
    date: text('date').notNull(), // YYYY-MM-DD
    status: text('status').notNull(),
    value: integer('value'),
    parts: text('parts'), // JSON array
  },
  (t) => ({ pk: primaryKey({ columns: [t.practiceId, t.date] }) }),
);

export const restDays = sqliteTable(
  'rest_days',
  {
    accountId: text('account_id').notNull(),
    date: text('date').notNull(), // YYYY-MM-DD
  },
  (t) => ({ pk: primaryKey({ columns: [t.accountId, t.date] }) }),
);

export const journalEntries = sqliteTable('journal_entries', {
  accountId: text('account_id').notNull(),
  id: text('id').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  title: text('title').notNull(),
  body: text('body').notNull(),
  passageRef: text('passage_ref'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.accountId, t.id] }) }));

export const highlights = sqliteTable('highlights', {
  accountId: text('account_id').notNull(),
  id: text('id').notNull(),
  source: text('source').notNull(), // 'scripture' | 'synaxarium' (filterable)
  anchor: text('anchor').notNull(), // JSON HighlightAnchor
  textSnapshot: text('text_snapshot').notNull(),
  referenceLabel: text('reference_label').notNull(),
  note: text('note'),
  color: text('color'),
  label: text('label'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.accountId, t.id] }) }));

export const readingPlans = sqliteTable('reading_plans', {
  accountId: text('account_id').notNull(),
  planId: text('plan_id').notNull(),
  startDate: text('start_date').notNull(), // YYYY-MM-DD
  createdAt: integer('created_at').notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.accountId, t.planId] }) }));

export const readingProgress = sqliteTable('reading_progress', {
  accountId: text('account_id').notNull(),
  planId: text('plan_id').notNull(),
  dayNumber: integer('day_number').notNull(),
  completedOn: text('completed_on').notNull(), // YYYY-MM-DD
}, (t) => ({ pk: primaryKey({ columns: [t.accountId, t.planId, t.dayNumber] }) }));

export const officeLogs = sqliteTable('office_logs', {
  accountId: text('account_id').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  officeKey: text('office_key').notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.accountId, t.date, t.officeKey] }) }));

export const learnLessons = sqliteTable('learn_lessons', {
  accountId: text('account_id').notNull(),
  lessonId: text('lesson_id').notNull(),
  completedOn: text('completed_on').notNull(), // YYYY-MM-DD
  correct: integer('correct').notNull(),
  total: integer('total').notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.accountId, t.lessonId] }) }));

export const onboardingAnswers = sqliteTable('onboarding_answers', {
  accountId: text('account_id').primaryKey(),
  answers: text('answers').notNull(), // JSON OnboardingAnswers
  completedAt: integer('completed_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

/** Raw DDL mirroring the schema, run once at startup (lightweight migration). */
export const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
  salt TEXT NOT NULL, created_at INTEGER NOT NULL, display_name TEXT, journey_stage TEXT,
  onboarding_complete INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS practices (
  id TEXT PRIMARY KEY NOT NULL, account_id TEXT NOT NULL, created_at INTEGER NOT NULL, name TEXT NOT NULL,
  category TEXT NOT NULL, kind TEXT NOT NULL, cadence TEXT NOT NULL, measure TEXT NOT NULL,
  target INTEGER, parts TEXT, reminder TEXT, intention TEXT, state TEXT NOT NULL,
  resume_on TEXT, sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS practice_logs (
  account_id TEXT NOT NULL, practice_id TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL,
  value INTEGER, parts TEXT,
  PRIMARY KEY (practice_id, date)
);
CREATE TABLE IF NOT EXISTS rest_days (
  account_id TEXT NOT NULL, date TEXT NOT NULL,
  PRIMARY KEY (account_id, date)
);
CREATE TABLE IF NOT EXISTS journal_entries (
  account_id TEXT NOT NULL, id TEXT NOT NULL, date TEXT NOT NULL, title TEXT NOT NULL,
  body TEXT NOT NULL, passage_ref TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (account_id, id)
);
CREATE TABLE IF NOT EXISTS highlights (
  account_id TEXT NOT NULL, id TEXT NOT NULL, source TEXT NOT NULL, anchor TEXT NOT NULL,
  text_snapshot TEXT NOT NULL, reference_label TEXT NOT NULL, note TEXT, color TEXT, label TEXT,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY (account_id, id)
);
CREATE TABLE IF NOT EXISTS reading_plans (
  account_id TEXT NOT NULL, plan_id TEXT NOT NULL, start_date TEXT NOT NULL, created_at INTEGER NOT NULL,
  PRIMARY KEY (account_id, plan_id)
);
CREATE TABLE IF NOT EXISTS reading_progress (
  account_id TEXT NOT NULL, plan_id TEXT NOT NULL, day_number INTEGER NOT NULL, completed_on TEXT NOT NULL,
  PRIMARY KEY (account_id, plan_id, day_number)
);
CREATE TABLE IF NOT EXISTS office_logs (
  account_id TEXT NOT NULL, date TEXT NOT NULL, office_key TEXT NOT NULL,
  PRIMARY KEY (account_id, date, office_key)
);
CREATE TABLE IF NOT EXISTS learn_lessons (
  account_id TEXT NOT NULL, lesson_id TEXT NOT NULL, completed_on TEXT NOT NULL,
  correct INTEGER NOT NULL, total INTEGER NOT NULL,
  PRIMARY KEY (account_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS onboarding_answers (
  account_id TEXT PRIMARY KEY NOT NULL, answers TEXT NOT NULL, completed_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
`;
