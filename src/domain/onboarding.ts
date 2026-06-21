/**
 * Onboarding — the pure shape of the first-run questionnaire and the logic that
 * turns answers into (a) a starter rule and (b) the ordered run of screens.
 *
 * Kept free of React/DB so it is fully testable (mirrors src/domain/learn/*).
 * The screen list interleaves questions with goal "preview" interstitials, so a
 * learner who picks "Learn Coptic" is shown what the app offers for it next.
 */
import type { StarterKey } from '../db/seed';

/** What brought the user here today (framed as goals; each maps to a feature). */
export type GoalKey = 'fasts' | 'prayer' | 'word' | 'saints' | 'coptic' | 'journal';

/** How settled the daily rhythm already is — tunes copy + starter defaults. */
export type ExperienceLevel = 'new' | 'some' | 'rooted';

export type PartOfDay = 'morning' | 'noon' | 'evening';

export interface ReminderChoice {
  readonly partOfDay: PartOfDay;
  /** "HH:MM" (24h, local). */
  readonly time: string;
}

/** The full questionnaire, persisted per account. */
export interface OnboardingAnswers {
  readonly goals: GoalKey[];
  readonly experience: ExperienceLevel | null;
  readonly reminder: ReminderChoice | null;
}

export const ALL_GOALS: readonly GoalKey[] = ['fasts', 'prayer', 'word', 'coptic', 'saints', 'journal'];

/** A default time for each part of the day (used when the user picks a preset). */
export const PART_OF_DAY_TIME: Record<PartOfDay, string> = {
  morning: '07:00',
  noon: '12:00',
  evening: '20:00',
};

/**
 * Goal → starter practice. 'coptic' is intentionally absent: it's the Learn tab,
 * not a rule practice. 'prayer' lights the Agpeya; 'saints' the Synaxarium life.
 */
export const GOAL_TO_STARTER: Partial<Record<GoalKey, StarterKey>> = {
  fasts: 'fasts',
  prayer: 'agpeya',
  word: 'word',
  saints: 'saint',
  journal: 'journal',
};

/** Pre-seed the starter selection from the chosen goals (deduped, in goal order). */
export function startersForGoals(goals: readonly GoalKey[]): StarterKey[] {
  const out: StarterKey[] = [];
  for (const g of goals) {
    const starter = GOAL_TO_STARTER[g];
    if (starter && !out.includes(starter)) out.push(starter);
  }
  return out;
}

/** How many goal previews we show before moving on, so a maximalist pick stays tight. */
export const MAX_PREVIEWS = 3;

export type Screen =
  | { kind: 'name-journey' }
  | { kind: 'goals' }
  | { kind: 'experience' }
  | { kind: 'preview'; goal: GoalKey }
  | { kind: 'rule' }
  | { kind: 'reminder' }
  | { kind: 'notify' };

/**
 * The ordered screens for the current answers: name/journey → goals → experience
 * → a preview per chosen goal (capped) → rule → reminder → notify.
 */
export function buildSequence(answers: OnboardingAnswers): Screen[] {
  const previews: Screen[] = answers.goals
    .slice(0, MAX_PREVIEWS)
    .map((goal) => ({ kind: 'preview', goal }));
  return [
    { kind: 'name-journey' },
    { kind: 'goals' },
    { kind: 'experience' },
    ...previews,
    { kind: 'rule' },
    { kind: 'reminder' },
    { kind: 'notify' },
  ];
}

/** The screen kinds that count toward the progress bar (previews don't). */
const PROGRESS_KINDS: ReadonlySet<Screen['kind']> = new Set([
  'name-journey',
  'goals',
  'experience',
  'rule',
  'reminder',
  'notify',
]);

export function isProgressScreen(screen: Screen): boolean {
  return PROGRESS_KINDS.has(screen.kind);
}

/** Fraction (0..1) of question-screens completed at `cursor` over `sequence`. */
export function progressFraction(sequence: readonly Screen[], cursor: number): number {
  const total = sequence.filter(isProgressScreen).length;
  if (total <= 0) return 0;
  const done = sequence.slice(0, cursor).filter(isProgressScreen).length;
  return Math.min(1, done / total);
}
