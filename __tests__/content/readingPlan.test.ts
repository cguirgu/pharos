import {
  FOUR_GOSPELS_90,
  planRef,
  dayNumberFor,
  progressPercent,
  planProgress,
  isPlanComplete,
} from '../../src/domain/content/readingPlan';
import type { CivilDate } from '../../src/domain/coptic';

const D = (m: number, d: number): CivilDate => ({ year: 2026, month: m, day: d });

describe('readingPlan — Four Gospels', () => {
  test('schedule covers all Gospel chapters (28+16+24+21 = 89)', () => {
    expect(FOUR_GOSPELS_90.schedule).toHaveLength(89);
  });

  test('planRef maps day → reference, including book rollovers', () => {
    expect(planRef(FOUR_GOSPELS_90, 1)).toEqual({ book: 'matthew', chapter: 1 });
    expect(planRef(FOUR_GOSPELS_90, 28)).toEqual({ book: 'matthew', chapter: 28 });
    expect(planRef(FOUR_GOSPELS_90, 29)).toEqual({ book: 'mark', chapter: 1 });
    expect(planRef(FOUR_GOSPELS_90, 89)).toEqual({ book: 'john', chapter: 21 });
    expect(planRef(FOUR_GOSPELS_90, 90)).toBeNull();
    expect(planRef(FOUR_GOSPELS_90, 0)).toBeNull();
  });

  test('dayNumberFor counts from the start date (clamped ≥ 1)', () => {
    expect(dayNumberFor(D(6, 1), D(6, 1))).toBe(1);
    expect(dayNumberFor(D(6, 1), D(6, 11))).toBe(11);
    expect(dayNumberFor(D(6, 10), D(6, 1))).toBe(1); // before start → clamped
  });

  test('progressPercent', () => {
    expect(progressPercent(0, 89)).toBe(0);
    expect(progressPercent(89, 89)).toBe(100);
    expect(progressPercent(45, 89)).toBe(51);
    expect(progressPercent(5, 0)).toBe(0);
  });

  test('planProgress snapshot', () => {
    const p = planProgress(FOUR_GOSPELS_90, D(6, 1), D(6, 29), 8);
    expect(p.dayNumber).toBe(29);
    expect(p.total).toBe(89);
    expect(p.todayRef).toEqual({ book: 'mark', chapter: 1 });
    expect(p.todayLabel).toBe('Mark 1');
    // day number never exceeds the total
    expect(planProgress(FOUR_GOSPELS_90, D(1, 1), D(12, 31), 0).dayNumber).toBe(89);
  });

  test('isPlanComplete is derived from kept-day count vs schedule length', () => {
    expect(isPlanComplete(FOUR_GOSPELS_90, 0)).toBe(false);
    expect(isPlanComplete(FOUR_GOSPELS_90, 88)).toBe(false);
    expect(isPlanComplete(FOUR_GOSPELS_90, 89)).toBe(true);
    expect(isPlanComplete(FOUR_GOSPELS_90, 90)).toBe(true);
  });
});
