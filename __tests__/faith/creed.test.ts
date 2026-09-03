/**
 * The Creed seal — the course's signature reward. A clause unseals only when
 * every lesson of its unit is passed, and the mapping from units to clauses has
 * to stay total and one-to-one, or a learner finishes the course with a clause
 * they can never open.
 */
import { CREED_CLAUSES, clauseById, clauseForUnit, creedSeal, unsealedCount, clausesUnsealedBy } from '../../src/domain/faith/creed';
import { UNITS, READY_LESSONS, isLessonReady } from '../../src/domain/faith/course';
import { evaluateFaithMilestones, nextFaithMilestone, FAITH_MILESTONE_COUNT } from '../../src/domain/faith/milestones';
import { faithRankFor, FAITH_RANKS } from '../../src/domain/faith/ranks';

const allPassed = new Set(READY_LESSONS.map((l) => l.id));
const unitLessons = (unitId: string) =>
  UNITS.find((u) => u.id === unitId)!.lessons.filter(isLessonReady).map((l) => l.id);

describe('creed mapping', () => {
  test('has no duplicate clause ids and is ordered 1..N', () => {
    const ids = CREED_CLAUSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CREED_CLAUSES.map((c) => c.order)).toEqual(CREED_CLAUSES.map((_, i) => i + 1));
  });

  test('every unit names an existing clause, and no two units share one', () => {
    const claimed = UNITS.map((u) => u.creedClauseId);
    for (const id of claimed) expect(clauseById(id)).toBeDefined();
    expect(new Set(claimed).size).toBe(claimed.length);
  });

  test('every clause is claimed by some unit — none is unreachable', () => {
    const claimed = new Set(UNITS.map((u) => u.creedClauseId));
    expect(CREED_CLAUSES.filter((c) => !claimed.has(c.id)).map((c) => c.id)).toEqual([]);
  });

  test('clauseForUnit resolves for every unit', () => {
    for (const u of UNITS) expect(clauseForUnit(u.id)!.id).toBe(u.creedClauseId);
  });

  test('every clause carries a title, a gist, and a council', () => {
    for (const c of CREED_CLAUSES) {
      expect(c.title.trim().length).toBeGreaterThan(0);
      expect(c.gist.trim().length).toBeGreaterThan(0);
      expect(c.council.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('unsealing', () => {
  test('nothing is unsealed at the start; everything is at the end', () => {
    expect(unsealedCount(new Set())).toBe(0);
    expect(unsealedCount(allPassed)).toBe(CREED_CLAUSES.length);
    expect(creedSeal(allPassed).every((c) => c.unsealed)).toBe(true);
  });

  test('a partly-finished unit unseals nothing', () => {
    const ids = unitLessons(UNITS[0]!.id);
    const partial = new Set(ids.slice(0, ids.length - 1));
    expect(unsealedCount(partial)).toBe(0);
  });

  test('finishing the first unit unseals exactly its clause', () => {
    const passed = new Set(unitLessons(UNITS[0]!.id));
    const unsealed = creedSeal(passed).filter((c) => c.unsealed);
    expect(unsealed).toHaveLength(1);
    expect(unsealed[0]!.id).toBe(UNITS[0]!.creedClauseId);
  });

  test('clausesUnsealedBy fires only on the lesson that completes the unit', () => {
    const ids = unitLessons(UNITS[0]!.id);
    const last = ids[ids.length - 1]!;
    expect(clausesUnsealedBy(last, new Set(ids)).map((c) => c.id)).toEqual([UNITS[0]!.creedClauseId]);
    // An earlier lesson in the same unit unseals nothing on its own.
    expect(clausesUnsealedBy(ids[0]!, new Set([ids[0]!]))).toEqual([]);
  });

  test('a sealed clause still names the unit that opens it', () => {
    for (const c of creedSeal(new Set())) {
      expect(c.unitTitle.trim().length).toBeGreaterThan(0);
      expect(UNITS.some((u) => u.id === c.unitId)).toBe(true);
    }
  });
});

describe('milestones', () => {
  test('nothing earned with no progress; everything at the end', () => {
    expect(evaluateFaithMilestones(new Set()).every((m) => !m.earned)).toBe(true);
    const all = evaluateFaithMilestones(allPassed);
    expect(all.every((m) => m.earned)).toBe(true);
    expect(all).toHaveLength(FAITH_MILESTONE_COUNT);
    expect(nextFaithMilestone(allPassed)).toBeNull();
  });

  test('the first milestone up is the first question', () => {
    expect(nextFaithMilestone(new Set())!.key).toBe('first');
  });

  test('finishing the Chalcedon unit earns its milestone and not a later one', () => {
    const earned = new Set(
      evaluateFaithMilestones(new Set(unitLessons('chalcedon'))).filter((m) => m.earned).map((m) => m.key),
    );
    expect(earned.has('chalcedon')).toBe(true);
    expect(earned.has('mystery')).toBe(false);
    expect(earned.has('creed')).toBe(false);
  });
});

describe('ranks', () => {
  test('starts at Inquirer and tops out at Keeper of the Faith', () => {
    expect(faithRankFor(0).rank.key).toBe('inquirer');
    expect(faithRankFor(READY_LESSONS.length).rank.key).toBe('keeper');
    expect(faithRankFor(READY_LESSONS.length).next).toBeNull();
  });

  test('one perfected lesson is enough to leave Inquirer', () => {
    expect(faithRankFor(1).rank.key).toBe('hearer');
  });

  test('ranks ascend and every rung is reachable', () => {
    const fractions = FAITH_RANKS.map((r) => r.minFraction);
    expect(fractions).toEqual([...fractions].sort((a, b) => a - b));
    const reached = new Set(
      Array.from({ length: READY_LESSONS.length + 1 }, (_, n) => faithRankFor(n).rank.key),
    );
    expect(FAITH_RANKS.filter((r) => !reached.has(r.key)).map((r) => r.key)).toEqual([]);
  });

  test('toNext is always at least one lesson below the top', () => {
    for (let n = 0; n < READY_LESSONS.length; n++) {
      expect(faithRankFor(n).toNext).toBeGreaterThanOrEqual(1);
    }
  });
});
