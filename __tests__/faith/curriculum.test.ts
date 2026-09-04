/**
 * The teaching design, held in place by tests.
 *
 * The first version of this course tested what was easy to test — where a pope
 * was exiled, how many bishops sat at a council, which year an apparition began.
 * All true, all cited, and all forgettable without loss. These tests encode the
 * correction: every unit declares what a learner must walk away holding, every
 * question declares whether it is load-bearing, and the cumulative reviews drill
 * the load-bearing ones with spacing and interleaving.
 */
import { UNITS, LESSONS } from '../../src/domain/faith/units';
import { isReviewLesson, REVIEW_LESSON_IDS } from '../../src/domain/faith/review';
import { READY_LESSONS, isLessonUnlocked, isLessonReady } from '../../src/domain/faith/course';

const authoredQuestions = LESSONS.filter((l) => !isReviewLesson(l.id)).flatMap((l) =>
  l.questions.map((q) => [`${l.id}:${q.id}`, q] as const),
);

describe('backward design — every unit states what it is for', () => {
  it.each(UNITS.map((u) => [u.id, u] as const))('%s declares its enduring understandings', (_id, unit) => {
    expect(unit.essentials.length).toBeGreaterThan(0);
    for (const e of unit.essentials) expect(e.trim().length).toBeGreaterThan(20);
  });
});

describe('every question declares how load-bearing it is', () => {
  it.each(authoredQuestions)('%s has a tier', (_label, q) => {
    expect(['core', 'support']).toContain(q.tier);
  });

  it('every unit carries at least two core questions', () => {
    // A unit with no core questions would contribute nothing to the reviews,
    // which means nothing in it would ever be revisited.
    for (const unit of UNITS) {
      const core = unit.lessons
        .filter((l) => !isReviewLesson(l.id))
        .flatMap((l) => l.questions.filter((q) => q.tier === 'core'));
      expect(`${unit.id}: ${core.length}`).toBe(`${unit.id}: ${Math.max(core.length, 2)}`);
    }
  });

  it('carries at least one core question per stated understanding', () => {
    // Not a semantic check — no test can prove a question tests a given
    // understanding. But a unit promising four things while drilling two is a
    // promise it demonstrably cannot keep, and that IS catchable. This caught a
    // real gap in Unit VI, whose essentials named something no question asked.
    for (const unit of UNITS) {
      const core = unit.lessons
        .filter((l) => !isReviewLesson(l.id))
        .flatMap((l) => l.questions.filter((q) => q.tier === 'core')).length;
      expect(`${unit.id}: ${core} core for ${unit.essentials.length} essentials`).toBe(
        `${unit.id}: ${Math.max(core, unit.essentials.length)} core for ${unit.essentials.length} essentials`,
      );
    }
  });

  it('keeps the course majority-core — support is seasoning, not substance', () => {
    const core = authoredQuestions.filter(([, q]) => q.tier === 'core').length;
    expect(core / authoredQuestions.length).toBeGreaterThan(0.6);
  });
});

describe('cumulative reviews', () => {
  const reviews = LESSONS.filter((l) => isReviewLesson(l.id));

  it('exist at every declared act boundary', () => {
    expect(reviews.map((l) => l.id).sort()).toEqual([...REVIEW_LESSON_IDS].sort());
  });

  it('are retrieval, not re-reading — no teaching cards', () => {
    for (const r of reviews) expect(r.cards).toEqual([]);
  });

  it('draw only core questions', () => {
    const coreIds = new Set(
      LESSONS.filter((l) => !isReviewLesson(l.id)).flatMap((l) =>
        l.questions.filter((q) => q.tier === 'core').map((q) => q.id),
      ),
    );
    for (const r of reviews) {
      for (const q of r.questions) {
        const original = q.id.replace(new RegExp(`^review-${r.unitId}-`), '');
        expect(coreIds.has(original)).toBe(true);
      }
    }
  });

  it('interleave — consecutive questions come from different units', () => {
    // Blocked practice (all of unit A, then all of unit B) is markedly weaker
    // than interleaved practice, so this is a property worth enforcing.
    for (const r of reviews) {
      const unitOf = (qid: string) => qid.replace(new RegExp(`^review-${r.unitId}-`), '').split('-')[0];
      const units = r.questions.map((q) => unitOf(q.id));
      const runs = units.filter((u, i) => i > 0 && u === units[i - 1]).length;
      expect(`${r.id} same-unit adjacencies: ${runs}`).toBe(`${r.id} same-unit adjacencies: 0`);
    }
  });

  it('space the material — a review never repeats a question inside itself', () => {
    for (const r of reviews) {
      const ids = r.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('keep question ids globally unique despite reusing the questions', () => {
    const all = LESSONS.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
  });

  it('sit at the end of their unit, so the act closes on retrieval', () => {
    for (const r of reviews) {
      const unit = UNITS.find((u) => u.id === r.unitId)!;
      expect(unit.lessons[unit.lessons.length - 1]!.id).toBe(r.id);
    }
  });

  it('are reachable in the normal unlock order', () => {
    const passed = new Set<string>();
    for (const l of READY_LESSONS) {
      expect(isLessonUnlocked(l.id, passed)).toBe(true);
      passed.add(l.id);
    }
    for (const id of REVIEW_LESSON_IDS) expect(passed.has(id)).toBe(true);
  });
});

describe('the trivia that prompted this redesign is gone', () => {
  // Named explicitly so a future contributor re-adding one has to argue with a
  // test rather than with a reviewer's memory.
  const prompts = authoredQuestions.map(([, q]) => q.prompt.toLowerCase());
  const banned = [
    'where was pope dioscorus exiled',
    'how many bishops',
    "origen's hexapla",
    'which monastic settlement',
    'the apparitions at zeitoun began in',
    'which successor of st. mark',
  ];
  it.each(banned)('no longer asks: %s', (fragment) => {
    expect(prompts.some((p) => p.includes(fragment))).toBe(false);
  });
});

describe('the shipped course is never empty', () => {
  // The failure this guards against, measured once and never again: with the
  // review gate closed and no card approved, the course yielded 0 ready lessons
  // and 0 of 9 units with content — the Faith tab rendered as an empty screen,
  // which is an App Review guideline 2.1 (App Completeness) risk.
  //
  // This asserts the course AS CONFIGURED, so it fails either way round: if the
  // bypass is off and content is unreviewed, or if a unit is ever emptied. It
  // will also fail while authoring a new unreviewed card with the bypass off —
  // which is the correct signal, not a nuisance: it means content exists that
  // users cannot see.
  it('renders at least one lesson in every unit', () => {
    for (const unit of UNITS) {
      const ready = unit.lessons.filter(isLessonReady).length;
      expect(`${unit.id}: ${ready} ready`).toBe(`${unit.id}: ${Math.max(ready, 1)} ready`);
    }
  });

  it('leaves no lesson unreachable', () => {
    expect(READY_LESSONS.length).toBe(LESSONS.length);
  });
});
