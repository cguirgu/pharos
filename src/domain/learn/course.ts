/**
 * The Learn-Coptic course — pure structure + exercise generation + progress math.
 * Mirrors the reading-plan engine (src/domain/content/readingPlan.ts): the data
 * and math are pure and tested; the UI handles presentation and persistence.
 *
 * Units → Lessons → Exercises. Unit 1 teaches the alphabet (recognise the letter,
 * name it, sound it); Unit 2 reads/translates core liturgical words. Exercise
 * option order is DETERMINISTIC (seeded by the exercise key) so it is testable;
 * the player may re-shuffle for variety.
 */
import { ALPHABET, PHONETIC_LETTERS, type CopticLetter } from './alphabet';
import { WORD_UNITS, WORDS, type CopticWord } from './words';

export type ExerciseKind =
  | 'letter-name' // show glyph → choose its name
  | 'letter-sound' // show glyph → choose its sound
  | 'name-letter' // show name → choose the glyph
  | 'word-meaning' // show Coptic word → choose its English meaning
  | 'word-read' // show Coptic word → choose its reading (transliteration)
  | 'word-spell'; // show the meaning → BUILD the Coptic word from letter tiles

export interface Exercise {
  readonly key: string;
  readonly kind: ExerciseKind;
  /**
   * What to display as the question. For `name-letter` this is the letter's
   * NAME; for `word-spell` it is the English meaning (the learner builds the
   * Coptic); for every other kind it is the Coptic glyph/word.
   */
  readonly prompt: string;
  /** A scaffolding hint shown under the prompt (e.g. the transliteration for spelling). */
  readonly hint?: string;
  /** Audio key (letter id / word id) for the optional pronunciation clip. */
  readonly audioKey: string;
  /** The correct answer (a name/sound/word, or — for `word-spell` — the full Coptic word). */
  readonly answer: string;
  /** Four options including the answer (choice kinds); empty for `word-spell`. */
  readonly options: readonly string[];
  /** Shuffled letter tiles to build the word from (`word-spell` only). */
  readonly tiles?: readonly string[];
}

export type ItemKind = 'letter' | 'word';

export interface Lesson {
  readonly id: string;
  readonly unitId: string;
  readonly title: string;
  /** 1-based position across the whole course (for level/ordering). */
  readonly index: number;
  readonly itemKind: ItemKind;
  readonly itemIds: readonly string[];
}

export interface Unit {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly glyph: string;
  readonly lessonIds: readonly string[];
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

/** answer + up to 3 distinct distractors from `pool`, deterministically ordered. */
function makeOptions(answer: string, pool: readonly string[], key: string): string[] {
  const seed = hashSeed(key);
  const distractors = shuffle(
    pool.filter((p) => p !== answer),
    seed,
  ).slice(0, 3);
  return shuffle([answer, ...distractors], seed ^ 0x9e3779b9);
}

/** Letter tiles to spell `coptic`: its letters (with multiplicity) + 3 decoy letters, shuffled. */
function makeTiles(coptic: string, key: string): string[] {
  const letters = [...coptic];
  const used = new Set(letters);
  const decoyPool = ALPHABET.map((l) => l.lower).filter((c) => !used.has(c));
  const seed = hashSeed(key);
  const decoys = shuffle(decoyPool, seed).slice(0, 3);
  return shuffle([...letters, ...decoys], seed ^ 0x5bd1e995);
}

// --- course data -----------------------------------------------------------

/** Letters per level — kept small (~9 cards) so a level is a quick, varied win. */
const LETTER_LESSON_SIZE = 3;

function alphabetLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (let i = 0; i < ALPHABET.length; i += LETTER_LESSON_SIZE) {
    const group = ALPHABET.slice(i, i + LETTER_LESSON_SIZE);
    const n = lessons.length + 1;
    lessons.push({
      id: `alphabet-${n}`,
      unitId: 'alphabet',
      title: `Letters ${i + 1}–${i + group.length}`,
      index: n,
      itemKind: 'letter',
      itemIds: group.map((l) => l.id),
    });
  }
  return lessons;
}

/** Split the words into lessons of 3. */
const WORD_LESSON_SIZE = 3;

/** Build the lessons for one word unit (chunks of WORD_LESSON_SIZE), numbered from `startIndex`. */
function wordLessonsFor(unit: (typeof WORD_UNITS)[number], startIndex: number): Lesson[] {
  const lessons: Lesson[] = [];
  const lessonCount = Math.ceil(unit.words.length / WORD_LESSON_SIZE);
  for (let i = 0; i < unit.words.length; i += WORD_LESSON_SIZE) {
    const group = unit.words.slice(i, i + WORD_LESSON_SIZE);
    const part = lessons.length + 1;
    lessons.push({
      id: `${unit.id}-${part}`,
      unitId: unit.id,
      title: lessonCount > 1 ? `${unit.title} · ${part}` : unit.title,
      index: startIndex + part,
      itemKind: 'word',
      itemIds: group.map((w) => w.id),
    });
  }
  return lessons;
}

const ALPHABET_LESSONS = alphabetLessons();
const WORD_LESSONS: Lesson[] = [];
for (const unit of WORD_UNITS) {
  WORD_LESSONS.push(...wordLessonsFor(unit, ALPHABET_LESSONS.length + WORD_LESSONS.length));
}

export const LESSONS: readonly Lesson[] = [...ALPHABET_LESSONS, ...WORD_LESSONS];

export const UNITS: readonly Unit[] = [
  {
    id: 'alphabet',
    title: 'The Alphabet',
    subtitle: 'The 32 letters — recognise, name, and sound each one.',
    glyph: 'Ⲁ',
    lessonIds: ALPHABET_LESSONS.map((l) => l.id),
  },
  ...WORD_UNITS.map((u) => ({
    id: u.id,
    title: u.title,
    subtitle: u.subtitle,
    glyph: u.glyph,
    lessonIds: WORD_LESSONS.filter((l) => l.unitId === u.id).map((l) => l.id),
  })),
];

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function unitById(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

// --- exercise generation ---------------------------------------------------

function letterExercises(lesson: Lesson): Exercise[] {
  const namePool = ALPHABET.map((l) => l.name);
  const soundPool = PHONETIC_LETTERS.map((l) => l.sound);
  const glyphPool = ALPHABET.map((l) => l.upper);
  const letters = lesson.itemIds.map((id) => ALPHABET.find((x) => x.id === id) as CopticLetter);

  // Grouped by TYPE (not by letter) so a level interleaves — name them all,
  // then recognise them all, then sound them all — varied instead of repetitive.
  const names = letters.map((l) => ({
    key: `${lesson.id}:letter-name:${l.id}`,
    kind: 'letter-name' as const,
    prompt: l.lower,
    audioKey: l.id,
    answer: l.name,
    options: makeOptions(l.name, namePool, `${lesson.id}:letter-name:${l.id}`),
  }));
  const reverses = letters.map((l) => ({
    key: `${lesson.id}:name-letter:${l.id}`,
    kind: 'name-letter' as const,
    prompt: l.name,
    audioKey: l.id,
    answer: l.upper,
    options: makeOptions(l.upper, glyphPool, `${lesson.id}:name-letter:${l.id}`),
  }));
  const sounds = letters
    .filter((l) => l.sound) // skip the numeral-only Soou
    .map((l) => ({
      key: `${lesson.id}:letter-sound:${l.id}`,
      kind: 'letter-sound' as const,
      prompt: l.lower,
      audioKey: l.id,
      answer: l.sound,
      options: makeOptions(l.sound, soundPool, `${lesson.id}:letter-sound:${l.id}`),
    }));
  return [...names, ...reverses, ...sounds];
}

function wordExercises(lesson: Lesson): Exercise[] {
  const meaningPool = WORDS.map((w) => w.english);
  const readPool = WORDS.map((w) => w.translit);
  const words = lesson.itemIds.map((id) => WORDS.find((x) => x.id === id) as CopticWord);

  // Grouped by TYPE: meanings, then readings, then spellings (spelling last —
  // after the word has been seen). Interleaved across the level's words.
  const meanings = words.map((w) => ({
    key: `${lesson.id}:word-meaning:${w.id}`,
    kind: 'word-meaning' as const,
    prompt: w.coptic,
    audioKey: w.id,
    answer: w.english,
    options: makeOptions(w.english, meaningPool, `${lesson.id}:word-meaning:${w.id}`),
  }));
  const reads = words.map((w) => ({
    key: `${lesson.id}:word-read:${w.id}`,
    kind: 'word-read' as const,
    prompt: w.coptic,
    audioKey: w.id,
    answer: w.translit,
    options: makeOptions(w.translit, readPool, `${lesson.id}:word-read:${w.id}`),
  }));
  const spells: Exercise[] = words
    .filter((w) => !w.coptic.includes(' ')) // single words only (skip multi-word phrases)
    .map((w) => ({
      key: `${lesson.id}:word-spell:${w.id}`,
      kind: 'word-spell' as const,
      prompt: w.english,
      hint: w.translit,
      audioKey: w.id,
      answer: w.coptic,
      options: [],
      tiles: makeTiles(w.coptic, `${lesson.id}:word-spell:${w.id}`),
    }));
  return [...meanings, ...reads, ...spells];
}

/** All exercises for a lesson, in order. */
export function lessonExercises(lesson: Lesson): Exercise[] {
  return lesson.itemKind === 'letter' ? letterExercises(lesson) : wordExercises(lesson);
}

// --- progress / level math (derived; mirror readingPlan) -------------------

/** A lesson is complete once it has been finished at least once. */
export interface LessonResult {
  readonly correct: number;
  readonly total: number;
}

export function lessonPercent(result: LessonResult | undefined): number {
  if (!result || result.total <= 0) return 0;
  return Math.min(100, Math.round((result.correct / result.total) * 100));
}

/** A lesson is "perfected" (earns the crown) only with a flawless run. */
export function isLessonPerfect(result: LessonResult | undefined): boolean {
  return !!result && result.total > 0 && result.correct >= result.total;
}

/**
 * A lesson is "passed" — enough to UNLOCK the next — at ~90%: missing at most
 * 10% of exercises, but always forgiving at least one slip (so the short word
 * levels aren't forced to 100%). 100% additionally earns the crown.
 */
export function isLessonPassed(result: LessonResult | undefined): boolean {
  if (!result || result.total <= 0) return false;
  const allowed = Math.max(1, Math.floor(result.total * 0.1));
  return result.total - result.correct <= allowed;
}

/** Level = 1 + number of completed lessons (each lesson is a step). */
export function courseLevel(completedLessonCount: number): number {
  return 1 + completedLessonCount;
}

/** XP = 10 per correct answer across all completed lessons. */
export function xpFor(results: readonly LessonResult[]): number {
  return results.reduce((sum, r) => sum + r.correct * 10, 0);
}

/**
 * Whether a lesson is unlocked: the first lesson is always open; every other
 * needs the PREVIOUS lesson **passed** (≥90%). 100% on a level is a bonus crown,
 * not required to advance.
 */
export function isLessonUnlocked(lessonId: string, passedIds: ReadonlySet<string>): boolean {
  const idx = LESSONS.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return true;
  const prev = LESSONS[idx - 1]!;
  return passedIds.has(prev.id);
}
