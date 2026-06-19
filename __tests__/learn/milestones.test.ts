/**
 * Milestones — derived from passed lessons; the array order is the timeline.
 */
import { evaluateMilestones, nextMilestone, MILESTONE_COUNT } from '../../src/domain/learn/milestones';
import { LESSONS } from '../../src/domain/learn/course';

const allLessonIds = new Set(LESSONS.map((l) => l.id));
const passedUnits = (unitIds: string[]) => new Set(LESSONS.filter((l) => unitIds.includes(l.unitId)).map((l) => l.id));

describe('learn milestones', () => {
  test('nothing earned with no progress; the first one up is "first-lesson"', () => {
    const all = evaluateMilestones(new Set());
    expect(all.every((m) => !m.earned)).toBe(true);
    expect(nextMilestone(new Set())!.key).toBe('first-lesson');
  });

  test('every milestone is earned once the whole course is passed; nothing left to unlock', () => {
    const all = evaluateMilestones(allLessonIds);
    expect(all.every((m) => m.earned)).toBe(true);
    expect(all).toHaveLength(MILESTONE_COUNT);
    expect(nextMilestone(allLessonIds)).toBeNull();
  });

  test('the bridge milestone is earned by passing all the "sounds" lessons', () => {
    const passed = passedUnits(['sounds']);
    const earned = new Set(evaluateMilestones(passed).filter((m) => m.earned).map((m) => m.key));
    expect(earned.has('sounds-complete')).toBe(true);
    expect(earned.has('words-complete')).toBe(false);
  });

  test('the timeline is ordered as a journey (alphabet → sounds → words → vocab → course)', () => {
    const keys = evaluateMilestones(new Set()).map((m) => m.key);
    const order = (k: string) => keys.indexOf(k);
    expect(order('alphabet-complete')).toBeLessThan(order('sounds-complete'));
    expect(order('sounds-complete')).toBeLessThan(order('words-complete'));
    expect(order('words-complete')).toBeLessThan(order('vocab-complete'));
    expect(order('vocab-complete')).toBeLessThan(order('course-complete'));
  });
});
