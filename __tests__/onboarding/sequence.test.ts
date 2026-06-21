/**
 * Onboarding domain — screen sequencing + goal→starter mapping (pure).
 */
import {
  buildSequence,
  startersForGoals,
  progressFraction,
  MAX_PREVIEWS,
  GOAL_TO_STARTER,
  type OnboardingAnswers,
  type GoalKey,
} from '../../src/domain/onboarding';

const answers = (goals: GoalKey[]): OnboardingAnswers => ({ goals, experience: null, reminder: null });

describe('startersForGoals', () => {
  test('maps goals to their starter practices, in order, deduped', () => {
    expect(startersForGoals(['prayer', 'word', 'fasts'])).toEqual(['agpeya', 'word', 'fasts']);
  });

  test('"coptic" maps to no practice (it is the Learn tab)', () => {
    expect(GOAL_TO_STARTER.coptic).toBeUndefined();
    expect(startersForGoals(['coptic'])).toEqual([]);
    expect(startersForGoals(['coptic', 'journal'])).toEqual(['journal']);
  });

  test('empty goals yield no starters', () => {
    expect(startersForGoals([])).toEqual([]);
  });
});

describe('buildSequence', () => {
  test('orders name → goals → experience → previews → rule → reminder → notify', () => {
    const seq = buildSequence(answers(['coptic']));
    expect(seq.map((s) => s.kind)).toEqual([
      'name-journey', 'goals', 'experience', 'preview', 'rule', 'reminder', 'notify',
    ]);
    expect(seq.find((s) => s.kind === 'preview')).toEqual({ kind: 'preview', goal: 'coptic' });
  });

  test('a preview per chosen goal, capped at MAX_PREVIEWS', () => {
    const seq = buildSequence(answers(['fasts', 'prayer', 'word', 'coptic', 'saints', 'journal']));
    const previews = seq.filter((s) => s.kind === 'preview');
    expect(previews).toHaveLength(MAX_PREVIEWS);
    // previews follow the chosen-goal order
    expect(previews.map((p) => (p as { goal: GoalKey }).goal)).toEqual(['fasts', 'prayer', 'word']);
  });

  test('no goals → no previews', () => {
    const seq = buildSequence(answers([]));
    expect(seq.some((s) => s.kind === 'preview')).toBe(false);
  });
});

describe('progressFraction', () => {
  test('previews do not advance the progress bar; questions do', () => {
    const seq = buildSequence(answers(['coptic'])); // 6 question screens + 1 preview
    // cursor 0 = nothing done
    expect(progressFraction(seq, 0)).toBe(0);
    // at the end, all question screens are behind us
    expect(progressFraction(seq, seq.length)).toBe(1);
    // the preview screen (index 3) does not bump the fraction past the 3 questions before it
    expect(progressFraction(seq, 3)).toBeCloseTo(3 / 6);
    expect(progressFraction(seq, 4)).toBeCloseTo(3 / 6); // crossing the preview adds nothing
  });
});
