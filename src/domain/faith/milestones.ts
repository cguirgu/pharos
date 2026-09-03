/**
 * Faith milestones — derived from the set of PASSED lessons (never stored), so
 * they recompute from progress. One per unit, plus the openers and the finish.
 *
 * Deliberately worded as things you can now *do* rather than things you have
 * collected: "Tell miaphysite from monophysite" beats "Completed Unit IV".
 */
import { READY_LESSONS, UNITS, isLessonReady } from './course';

export interface FaithMilestone {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly earned: boolean;
  readonly glyph?: string;
}

function unitLessonIds(unitId: string): string[] {
  const unit = UNITS.find((u) => u.id === unitId);
  return unit ? unit.lessons.filter(isLessonReady).map((l) => l.id) : [];
}

function unitDone(unitId: string, passed: ReadonlySet<string>): boolean {
  const ids = unitLessonIds(unitId);
  return ids.length > 0 && ids.every((id) => passed.has(id));
}

/** Ordered as a journey — the array order is the timeline. */
export function evaluateFaithMilestones(passed: ReadonlySet<string>): FaithMilestone[] {
  const total = READY_LESSONS.length;
  return [
    {
      key: 'first',
      name: 'The first question',
      description: 'Pass your first lesson',
      earned: passed.size >= 1,
      glyph: 'Ⲁ',
    },
    {
      key: 'origins',
      name: 'Name the founder',
      description: 'Learn where the Church began — and why the year is uncertain',
      earned: unitDone('origins', passed),
      glyph: 'Ⲙ',
    },
    {
      key: 'martyrs',
      name: 'Count from the worst year',
      description: 'Understand the Era of the Martyrs',
      earned: unitDone('martyrs', passed),
      glyph: 'Ⲧ',
    },
    {
      key: 'councils',
      name: 'Three councils',
      description: 'Say what Nicaea, Constantinople and Ephesus each settled',
      earned: unitDone('councils', passed),
      glyph: 'Ⲅ',
    },
    {
      key: 'chalcedon',
      name: 'Miaphysite, not monophysite',
      description: 'Explain the parting of 451 — and what is still open',
      earned: unitDone('chalcedon', passed),
      glyph: 'Ⲇ',
    },
    {
      key: 'doctrine',
      name: 'What we believe',
      description: 'The Incarnation, salvation, the saints, the seven mysteries',
      earned: unitDone('doctrine', passed),
      glyph: 'Ⲑ',
    },
    {
      key: 'worship',
      name: 'How we pray',
      description: 'Three liturgies, seven hours, and why we fast',
      earned: unitDone('worship', passed),
      glyph: 'Ⲗ',
    },
    {
      key: 'fathers',
      name: 'Our fathers',
      description: 'Athanasius, Cyril, Anthony, Pachomius',
      earned: unitDone('fathers', passed),
      glyph: 'Ⲫ',
    },
    {
      key: 'today',
      name: 'The Church now',
      description: 'The altar lot, and the popes of the last century',
      earned: unitDone('today', passed),
      glyph: 'Ⲡ',
    },
    {
      key: 'mystery',
      name: 'Held in silence',
      description: 'Tell the defined from the undefined from the disputed',
      earned: unitDone('mystery', passed),
      glyph: 'Ⲱ',
    },
    {
      key: 'creed',
      name: 'The whole Creed',
      description: 'Unseal every clause of the Creed',
      earned: total > 0 && READY_LESSONS.every((l) => passed.has(l.id)),
      glyph: '☩',
    },
  ];
}

/** The next milestone still to earn, or null if all are earned. */
export function nextFaithMilestone(passed: ReadonlySet<string>): FaithMilestone | null {
  return evaluateFaithMilestones(passed).find((m) => !m.earned) ?? null;
}

/** Milestones newly earned by passing `lessonId` — for the celebration. */
export function faithMilestonesEarnedBy(lessonId: string, passedAfter: ReadonlySet<string>): FaithMilestone[] {
  const before = new Set(passedAfter);
  before.delete(lessonId);
  const prior = new Set(evaluateFaithMilestones(before).filter((m) => m.earned).map((m) => m.key));
  return evaluateFaithMilestones(passedAfter).filter((m) => m.earned && !prior.has(m.key));
}

/** Total milestones for display (the denominator). */
export const FAITH_MILESTONE_COUNT = evaluateFaithMilestones(new Set()).length;
