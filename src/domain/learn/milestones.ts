/**
 * Learn milestones — earned by reaching thresholds in the course. Derived from
 * the set of completed lessons (never stored), so they recompute from progress.
 */
import { LESSONS, UNITS } from './course';

export interface LearnMilestone {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly earned: boolean;
  /** A Coptic mark for the timeline node. */
  readonly glyph?: string;
}

/** The four original liturgical-word units. */
const CORE_WORD_UNITS = ['words', 'names', 'liturgy', 'praise'];

/**
 * The units drawn straight from the prayers the Church prays — the last stretch
 * of the path, after the vocabulary units. Exported so the course tests and the
 * milestone grouping stay in one place.
 */
export const PRAYER_UNITS = [
  'lords-prayer', 'trisagion', 'creed', 'offering',
  'church', 'pascha', 'repentance', 'soul', 'hours',
];

function unitLessonIds(unitId: string): string[] {
  return LESSONS.filter((l) => l.unitId === unitId).map((l) => l.id);
}

function lessonIdsForUnits(unitIds: readonly string[]): string[] {
  return LESSONS.filter((l) => unitIds.includes(l.unitId)).map((l) => l.id);
}

function countDone(ids: readonly string[], done: ReadonlySet<string>): number {
  return ids.filter((id) => done.has(id)).length;
}

/** Milestones are earned by PASSING lessons (≥90%), matching the unlock gate. */
export function evaluateMilestones(passed: ReadonlySet<string>): LearnMilestone[] {
  const alphabet = unitLessonIds('alphabet');
  const sounds = unitLessonIds('sounds');
  const coreWords = lessonIdsForUnits(CORE_WORD_UNITS);
  const newVocab = LESSONS.filter(
    (l) =>
      l.itemKind === 'word' &&
      !CORE_WORD_UNITS.includes(l.unitId) &&
      !PRAYER_UNITS.includes(l.unitId),
  ).map((l) => l.id);
  const lordsPrayer = unitLessonIds('lords-prayer');
  const prayers = lessonIdsForUnits(PRAYER_UNITS);

  const alphaDone = countDone(alphabet, passed);
  const soundsDone = countDone(sounds, passed);
  const coreDone = countDone(coreWords, passed);
  const vocabDone = countDone(newVocab, passed);
  const lordsPrayerDone = countDone(lordsPrayer, passed);
  const prayersDone = countDone(prayers, passed);

  // Ordered as a journey — the array order is the timeline.
  return [
    { key: 'first-lesson', name: 'First steps', description: 'Pass your first lesson', earned: passed.size >= 1, glyph: 'Ⲁ' },
    { key: 'alphabet-half', name: 'Half the alphabet', description: 'Reach the middle of the alphabet', earned: alphaDone >= Math.ceil(alphabet.length / 2), glyph: 'Ⲓ' },
    { key: 'alphabet-complete', name: 'The whole alphabet', description: 'Learn all 32 letters', earned: alphabet.length > 0 && alphaDone === alphabet.length, glyph: 'Ϯ' },
    { key: 'sounds-complete', name: 'Letters that blend', description: 'Master how the letters sound together', earned: sounds.length > 0 && soundsDone === sounds.length, glyph: 'Ⲩ' },
    { key: 'first-word', name: 'First holy word', description: 'Read your first liturgical word', earned: coreDone >= 1, glyph: 'Ⲃ' },
    { key: 'words-half', name: 'Words of worship', description: 'Learn half of the liturgical words', earned: coreWords.length > 0 && coreDone >= Math.ceil(coreWords.length / 2), glyph: 'Ⲅ' },
    { key: 'words-complete', name: 'The holy words', description: 'Learn every word of the liturgy', earned: coreWords.length > 0 && coreDone === coreWords.length, glyph: 'Ⲇ' },
    { key: 'vocab-grow', name: 'A wider tongue', description: 'Learn half of the extended vocabulary', earned: newVocab.length > 0 && vocabDone >= Math.ceil(newVocab.length / 2), glyph: 'Ⲏ' },
    { key: 'vocab-complete', name: 'Words of the feast', description: 'Learn all the extended vocabulary', earned: newVocab.length > 0 && vocabDone === newVocab.length, glyph: 'Ⲙ' },
    { key: 'lords-prayer-complete', name: 'The prayer He taught', description: 'Read the words of the Lord’s Prayer', earned: lordsPrayer.length > 0 && lordsPrayerDone === lordsPrayer.length, glyph: 'Ⲛ' },
    { key: 'prayers-half', name: 'Into the prayers', description: 'Reach the middle of the prayers of the Church', earned: prayers.length > 0 && prayersDone >= Math.ceil(prayers.length / 2), glyph: 'Ⲡ' },
    { key: 'prayers-complete', name: 'The prayers of the Church', description: 'Learn every word drawn from the prayers of the Church', earned: prayers.length > 0 && prayersDone === prayers.length, glyph: 'Ⲱ' },
    { key: 'course-complete', name: 'A reader of Coptic', description: 'Complete the whole course', earned: passed.size >= LESSONS.length, glyph: '☩' },
  ];
}

/** The next milestone still to earn (the "Next to unlock" node), or null if all are earned. */
export function nextMilestone(passed: ReadonlySet<string>): LearnMilestone | null {
  return evaluateMilestones(passed).find((m) => !m.earned) ?? null;
}

/** Milestones newly earned by passing `lessonId` (for the celebration). */
export function milestonesEarnedBy(lessonId: string, passedAfter: ReadonlySet<string>): LearnMilestone[] {
  const before = new Set(passedAfter);
  before.delete(lessonId);
  const prior = new Set(evaluateMilestones(before).filter((m) => m.earned).map((m) => m.key));
  return evaluateMilestones(passedAfter).filter((m) => m.earned && !prior.has(m.key));
}

/** Total milestones for display (the denominator). */
export const MILESTONE_COUNT = evaluateMilestones(new Set()).length;

/** Unit completion summary, for the Learn home header. */
export function unitsSummary(completed: ReadonlySet<string>) {
  return UNITS.map((u) => {
    const ids = unitLessonIds(u.id);
    return { id: u.id, title: u.title, done: countDone(ids, completed), total: ids.length };
  });
}
