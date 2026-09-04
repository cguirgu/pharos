/**
 * The Faith course's content model — pure data shapes, no React, no DB.
 *
 * A UNIT holds LESSONS; a lesson holds an ordered mix of TEACHING cards (shown,
 * never scored) and QUESTIONS (scored). Unlike the Coptic-language course —
 * where exercises are *generated* from the alphabet and word tables — every
 * card here is AUTHORED, because doctrine cannot be permuted into a quiz
 * without changing what it says.
 *
 * Two fields carry the project's content discipline into the type system:
 *   `sources`  — ids into `src/domain/faith/sources.ts`; never empty.
 *   `reviewed` — false until the project owner (Coptic Orthodox) signs the card
 *                off. `visibleCards`/`visibleQuestions` drop unreviewed content
 *                unless FAITH_SHOW_UNREVIEWED is on.
 */

/** Every authored item cites its sources and records its review state. */
export interface Attributed {
  /** Ids into SOURCES. Must be non-empty — asserted by the structural test. */
  readonly sources: readonly string[];
  /** Owner (Coptic Orthodox) sign-off. New content ships as `false`. */
  readonly reviewed: boolean;
}

/**
 * A teaching card. `body` is the lesson text; `pull` is an optional short line
 * held out as a rubric (a date, a name, a formula) that the questions test.
 */
export interface TeachCard extends Attributed {
  readonly id: string;
  readonly heading: string;
  readonly body: string;
  readonly pull?: string;
  /** A Coptic letter or mark for the card's shoulder. */
  readonly glyph?: string;
}

export type QuestionKind =
  /** Four options, one right. */
  | 'choice'
  /** A claim to accept or reject — `answer` is 'True' or 'False'. */
  | 'truefalse'
  /** Put 3–5 events in order — `answer` is the correct sequence. */
  | 'order'
  /**
   * The honest one. Given a question the Church has been asked, say whether it
   * is DEFINED (the Church has settled it), HELD IN MYSTERY (deliberately left
   * undefined), or DISPUTED (genuinely still open between churches, or between
   * our own sources). This is the kind that carries Unit IX.
   */
  | 'standing';

/** The three answers a `standing` question can take. */
export const STANDINGS = ['Defined', 'Held in mystery', 'Still disputed'] as const;
export type Standing = (typeof STANDINGS)[number];

/**
 * How load-bearing a question is.
 *
 * `core`    — one of the things a learner MUST walk away holding. Core questions
 *             are the only ones drawn into the cumulative review lessons, so
 *             they are the ones that get spaced retrieval practice.
 * `support` — true, cited, worth meeting once, but not something the course will
 *             drill. Detail that colours in a core idea.
 *
 * The rule that keeps this honest: if forgetting the answer would leave the
 * learner's grasp of the faith intact, it is `support`, not `core`. A date, a
 * place name, or a count is almost never core.
 */
export type QuestionTier = 'core' | 'support';

export interface Question extends Attributed {
  readonly id: string;
  readonly kind: QuestionKind;
  readonly tier: QuestionTier;
  readonly prompt: string;
  /** The correct answer, verbatim as it appears in `options`. */
  readonly answer: string;
  /**
   * Options as authored. For 'truefalse' and 'standing' these are supplied by
   * the engine; for 'choice' and 'order' they must be given here (an 'order'
   * question lists its events, and `answer` is them joined by ' → ').
   */
  readonly options?: readonly string[];
  /** Shown after answering — the *why*, which is the part worth remembering. */
  readonly explain: string;
}

export interface FaithLesson {
  readonly id: string;
  readonly unitId: string;
  readonly title: string;
  readonly cards: readonly TeachCard[];
  readonly questions: readonly Question[];
}

export interface FaithUnit {
  readonly id: string;
  /** Roman numeral shown on the path. */
  readonly numeral: string;
  readonly title: string;
  readonly subtitle: string;
  readonly glyph: string;
  /**
   * The enduring understandings — what the learner can say, and say *why*, once
   * the unit is done. These are authored FIRST and the questions written
   * backwards from them (Wiggins & McTighe, backward design), so nothing gets
   * tested merely because it is easy to test. Shown at the head of the unit.
   */
  readonly essentials: readonly string[];
  readonly lessons: readonly FaithLesson[];
  /**
   * The clause of the Creed this unit unseals (see `creed.ts`). Completing the
   * unit reveals it on the Faith home screen — the Creed assembles as you learn.
   */
  readonly creedClauseId: string;
}
