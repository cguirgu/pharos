/**
 * Learn store (MemoryRepo): completion persists, level/XP derive, best score
 * kept on redo, and per-account isolation.
 */
import { useLearning } from '../../src/state/learning';
import { MemoryRepo, setRepo } from '../../src/db/repo';
import { LESSONS } from '../../src/domain/learn/course';
import type { CivilDate } from '../../src/domain/coptic';

const TODAY: CivilDate = { year: 2026, month: 6, day: 18 };
const L1 = LESSONS[0]!.id;

beforeEach(() => {
  setRepo(new MemoryRepo());
  useLearning.getState().clear();
});

describe('learn store', () => {
  test('completeLesson persists and derives level + XP', async () => {
    await useLearning.getState().load('a');
    expect(useLearning.getState().level()).toBe(1);
    expect(useLearning.getState().totalXp()).toBe(0);

    await useLearning.getState().completeLesson(L1, 8, 10, TODAY);
    expect(useLearning.getState().completedIds().has(L1)).toBe(true);
    expect(useLearning.getState().level()).toBe(2); // 1 + 1 completed
    expect(useLearning.getState().totalXp()).toBe(80); // 8 correct * 10

    // persisted: reload from the repo
    await useLearning.getState().load('a');
    expect(useLearning.getState().lessons[L1]).toMatchObject({ correct: 8, total: 10 });
    expect(useLearning.getState().lessons[L1]!.completedOn.length).toBeGreaterThan(0);
  });

  test('passedIds is ≥90%; perfectedIds only 100% (the crown)', async () => {
    await useLearning.getState().load('a');
    await useLearning.getState().completeLesson(L1, 9, 10, TODAY); // 90% — passes, no crown
    expect(useLearning.getState().passedIds().has(L1)).toBe(true);
    expect(useLearning.getState().perfectedIds().has(L1)).toBe(false);
    await useLearning.getState().completeLesson(L1, 10, 10, TODAY); // flawless — crown
    expect(useLearning.getState().perfectedIds().has(L1)).toBe(true);
  });

  test('a sub-90% lesson does not unlock the next', async () => {
    await useLearning.getState().load('a');
    await useLearning.getState().completeLesson(L1, 5, 10, TODAY); // 50%
    expect(useLearning.getState().passedIds().has(L1)).toBe(false);
  });

  test('re-doing a lesson keeps the best score', async () => {
    await useLearning.getState().load('a');
    await useLearning.getState().completeLesson(L1, 5, 10, TODAY);
    await useLearning.getState().completeLesson(L1, 9, 10, TODAY);
    expect(useLearning.getState().lessons[L1]!.correct).toBe(9);
    await useLearning.getState().completeLesson(L1, 3, 10, TODAY); // worse → keeps 9
    expect(useLearning.getState().lessons[L1]!.correct).toBe(9);
  });

  test('progress is isolated per account', async () => {
    setRepo(new MemoryRepo());
    await useLearning.getState().load('a');
    await useLearning.getState().completeLesson(L1, 10, 10, TODAY);
    await useLearning.getState().load('b');
    expect(useLearning.getState().lessons).toEqual({});
  });
});
