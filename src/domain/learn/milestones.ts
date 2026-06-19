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
}

function unitLessonIds(unitId: string): string[] {
  return LESSONS.filter((l) => l.unitId === unitId).map((l) => l.id);
}

function countDone(ids: readonly string[], done: ReadonlySet<string>): number {
  return ids.filter((id) => done.has(id)).length;
}

/** Milestones are earned by PASSING lessons (≥90%), matching the unlock gate. */
export function evaluateMilestones(passed: ReadonlySet<string>): LearnMilestone[] {
  const alphabet = unitLessonIds('alphabet');
  const wordLessonIds = LESSONS.filter((l) => l.itemKind === 'word').map((l) => l.id);
  const alphaDone = countDone(alphabet, passed);
  const wordsDone = countDone(wordLessonIds, passed);

  return [
    { key: 'first-lesson', name: 'First steps', description: 'Pass your first lesson', earned: passed.size >= 1 },
    { key: 'alphabet-half', name: 'Half the alphabet', description: 'Reach the middle of the alphabet', earned: alphaDone >= Math.ceil(alphabet.length / 2) },
    { key: 'alphabet-complete', name: 'The whole alphabet', description: 'Learn all 32 letters', earned: alphabet.length > 0 && alphaDone === alphabet.length },
    { key: 'first-word', name: 'First holy word', description: 'Read your first liturgical word', earned: wordsDone >= 1 },
    { key: 'words-half', name: 'Words of worship', description: 'Learn half of the liturgical words', earned: wordLessonIds.length > 0 && wordsDone >= Math.ceil(wordLessonIds.length / 2) },
    { key: 'words-complete', name: 'The holy words', description: 'Learn every liturgical word in the course', earned: wordLessonIds.length > 0 && wordsDone === wordLessonIds.length },
    { key: 'course-complete', name: 'A reader of Coptic', description: 'Complete the whole course', earned: passed.size >= LESSONS.length },
  ];
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
