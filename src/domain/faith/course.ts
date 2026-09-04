/**
 * The Faith course engine — pure structure, step generation, and progress math.
 * Mirrors `src/domain/learn/course.ts` so the two courses behave identically to
 * a learner, and differs only where doctrine forces it:
 *
 *   • Steps are AUTHORED, not generated. A doctrinal claim cannot be permuted
 *     into a quiz the way a letter's name can.
 *   • Every step carries its `sources`, and the player shows them. This is the
 *     only course in the app where the citation is part of the teaching.
 *   • Content is REVIEW-GATED: unreviewed cards are withheld unless
 *     FAITH_SHOW_UNREVIEWED is on (src/content/flags.ts).
 *
 * Option order is DETERMINISTIC (seeded by the step key) so it is testable —
 * the same seeded-shuffle approach as the Coptic course.
 */
import { FAITH_SHOW_UNREVIEWED } from '../../content/flags';
import { STANDINGS, type FaithLesson, type Question, type TeachCard } from './types';
import { LESSONS, UNITS, lessonById, unitById, unitForLesson } from './units';

export { LESSONS, UNITS, lessonById, unitById, unitForLesson };

/**
 * Faith lessons share the `learn_lessons` table with the Coptic course, so
 * their ids are namespaced on the way to storage. Nothing in this file uses the
 * prefixed form — it exists at the persistence boundary only (src/state/faith.ts).
 */
export const FAITH_KEY_PREFIX = 'faith:';

export function storageKey(lessonId: string): string {
  return `${FAITH_KEY_PREFIX}${lessonId}`;
}

export function isFaithKey(key: string): boolean {
  return key.startsWith(FAITH_KEY_PREFIX);
}

export function lessonIdFromKey(key: string): string {
  return key.slice(FAITH_KEY_PREFIX.length);
}

// --- deterministic seeded shuffle (pure; no Math.random) -------------------

function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// --- review gate -----------------------------------------------------------

/** A card/question is shown when it is owner-reviewed, or the dev flag is on. */
export function isVisible(item: { readonly reviewed: boolean }): boolean {
  return item.reviewed || FAITH_SHOW_UNREVIEWED;
}

export function visibleCards(lesson: FaithLesson): readonly TeachCard[] {
  return lesson.cards.filter(isVisible);
}

export function visibleQuestions(lesson: FaithLesson): readonly Question[] {
  return lesson.questions.filter(isVisible);
}

/**
 * A lesson is playable when the review gate leaves it at least one question.
 * A lesson with cards but no questions would be unscoreable — and could never
 * be passed, which would wall off the rest of the course.
 */
export function isLessonReady(lesson: FaithLesson): boolean {
  return visibleQuestions(lesson).length > 0;
}

/** The lessons a learner can actually reach, in course order. */
export const READY_LESSONS: readonly FaithLesson[] = LESSONS.filter(isLessonReady);

// --- steps -----------------------------------------------------------------

export type StepKind = 'teach' | 'choice' | 'truefalse' | 'order' | 'standing';

export interface Step {
  readonly key: string;
  readonly kind: StepKind;
  /** Teaching cards: the heading. Questions: the prompt. */
  readonly prompt: string;
  /** Teaching cards only: the lesson text. */
  readonly body?: string;
  /** Teaching cards only: the held-out line (a date, a name, a formula). */
  readonly pull?: string;
  /** Teaching cards only: a Coptic mark for the shoulder. */
  readonly glyph?: string;
  /** Questions: the correct answer. Empty for teaching cards. */
  readonly answer: string;
  /** Questions: the choices, in deterministic order. Empty for teaching cards. */
  readonly options: readonly string[];
  /** 'order' questions: the events to be sequenced, shuffled. */
  readonly tiles?: readonly string[];
  /** Questions: shown after answering — the reason, which is the part that sticks. */
  readonly explain?: string;
  /** Source ids for this step. Always non-empty. */
  readonly sources: readonly string[];
  /** False while the card is awaiting owner review (dev builds only). */
  readonly reviewed: boolean;
}

const TRUE_FALSE = ['True', 'False'] as const;

/** Separator joining an 'order' question's events into its answer string. */
export const ORDER_SEP = ' → ';

function questionStep(lesson: FaithLesson, q: Question): Step {
  const key = `${lesson.id}:${q.id}`;
  const seed = hashSeed(key);

  if (q.kind === 'truefalse') {
    // Kept in their natural order — True/False reads wrong reversed.
    return { key, kind: q.kind, prompt: q.prompt, answer: q.answer, options: TRUE_FALSE, explain: q.explain, sources: q.sources, reviewed: q.reviewed };
  }
  if (q.kind === 'standing') {
    // Also fixed: the three standings are a scale, and shuffling them would
    // cost the learner the very distinction the question is teaching.
    return { key, kind: q.kind, prompt: q.prompt, answer: q.answer, options: STANDINGS, explain: q.explain, sources: q.sources, reviewed: q.reviewed };
  }
  if (q.kind === 'order') {
    const events = q.options ?? [];
    return {
      key,
      kind: q.kind,
      prompt: q.prompt,
      answer: q.answer,
      options: [],
      tiles: shuffle(events, seed),
      explain: q.explain,
      sources: q.sources,
      reviewed: q.reviewed,
    };
  }
  return {
    key,
    kind: 'choice',
    prompt: q.prompt,
    answer: q.answer,
    options: shuffle(q.options ?? [], seed),
    explain: q.explain,
    sources: q.sources,
    reviewed: q.reviewed,
  };
}

/**
 * A lesson's steps, in order: TEACH first, then the questions. Teaching before
 * testing is the whole pedagogy of the unit — you cannot be asked what Chalcedon
 * decided until you have been told.
 */
export function lessonSteps(lesson: FaithLesson): Step[] {
  const teach: Step[] = visibleCards(lesson).map((c) => ({
    key: `${lesson.id}:${c.id}`,
    kind: 'teach' as const,
    prompt: c.heading,
    body: c.body,
    pull: c.pull,
    glyph: c.glyph,
    answer: '',
    options: [],
    sources: c.sources,
    reviewed: c.reviewed,
  }));
  return [...teach, ...visibleQuestions(lesson).map((q) => questionStep(lesson, q))];
}

/** A teaching card is shown but never scored; every question counts. */
export function isGraded(step: Step): boolean {
  return step.kind !== 'teach';
}

/** Number of scored steps in a lesson (the denominator for pass/perfect). */
export function gradedCount(steps: readonly Step[]): number {
  return steps.filter(isGraded).length;
}

/** Whether a submitted answer is correct. `order` answers are joined by ORDER_SEP. */
export function isCorrect(step: Step, given: string): boolean {
  return given.trim() === step.answer.trim();
}

// --- progress / level math (derived; mirrors the Coptic course) -------------

export interface LessonResult {
  readonly correct: number;
  readonly total: number;
}

export function lessonPercent(result: LessonResult | undefined): number {
  if (!result || result.total <= 0) return 0;
  return Math.min(100, Math.round((result.correct / result.total) * 100));
}

/** A flawless run — earns the lamp. */
export function isLessonPerfect(result: LessonResult | undefined): boolean {
  return !!result && result.total > 0 && result.correct >= result.total;
}

/**
 * Passed — enough to unlock the next lesson — at ~90%: at most 10% missed, but
 * always forgiving at least one slip, so a short two-question lesson is not
 * silently forced to 100%.
 */
export function isLessonPassed(result: LessonResult | undefined): boolean {
  if (!result || result.total <= 0) return false;
  // At least one right answer is always required. Without this, the "forgive
  // one slip" allowance means a single-question lesson passes on zero correct
  // — you could tap the wrong answer and still unlock the next lesson.
  if (result.correct <= 0) return false;
  const allowed = Math.max(1, Math.floor(result.total * 0.1));
  return result.total - result.correct <= allowed;
}

/** Level = 1 + lessons attempted. */
export function courseLevel(completedLessonCount: number): number {
  return 1 + completedLessonCount;
}

/** XP = 10 per correct answer, matching the Coptic course so the two compare. */
export function xpFor(results: readonly LessonResult[]): number {
  return results.reduce((sum, r) => sum + r.correct * 10, 0);
}

/**
 * Unlock: the first ready lesson is always open; each later one needs the
 * PREVIOUS READY lesson passed. Walking `READY_LESSONS` rather than `LESSONS`
 * matters — if the review gate withholds a lesson entirely, the path must close
 * over the gap instead of dead-ending on a lesson nobody can play.
 */
export function isLessonUnlocked(lessonId: string, passedIds: ReadonlySet<string>): boolean {
  const idx = READY_LESSONS.findIndex((l) => l.id === lessonId);
  if (idx < 0) return false;
  if (idx === 0) return true;
  return passedIds.has(READY_LESSONS[idx - 1]!.id);
}

/** Per-unit completion, for the Faith home header. */
export function unitsSummary(passed: ReadonlySet<string>) {
  return UNITS.map((u) => {
    const ids = u.lessons.filter(isLessonReady).map((l) => l.id);
    return {
      id: u.id,
      numeral: u.numeral,
      title: u.title,
      done: ids.filter((id) => passed.has(id)).length,
      total: ids.length,
    };
  });
}
