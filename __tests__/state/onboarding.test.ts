/**
 * Onboarding store + repo round-trip (MemoryRepo): answers persist per account,
 * load back, and clear on sign-out.
 */
import { useOnboarding } from '../../src/state/onboarding';
import { MemoryRepo, setRepo, getRepo } from '../../src/db/repo';
import type { OnboardingAnswers } from '../../src/domain/onboarding';

const ANSWERS: OnboardingAnswers = {
  goals: ['coptic', 'fasts'],
  experience: 'new',
  reminder: { partOfDay: 'evening', time: '20:00' },
};

beforeEach(() => {
  setRepo(new MemoryRepo());
  useOnboarding.getState().clear();
});

test('save persists answers to the repo for the loaded account', async () => {
  await useOnboarding.getState().load('acc-1'); // sets accountId, no prior answers
  expect(useOnboarding.getState().answers).toBeNull();

  await useOnboarding.getState().save(ANSWERS);
  expect(useOnboarding.getState().answers).toEqual(ANSWERS);
  expect(await getRepo().getOnboarding('acc-1')).toEqual(ANSWERS);
});

test('load restores previously saved answers', async () => {
  await getRepo().saveOnboarding('acc-2', ANSWERS, 123);
  await useOnboarding.getState().load('acc-2');
  expect(useOnboarding.getState().answers).toEqual(ANSWERS);
});

test('answers are isolated per account', async () => {
  await getRepo().saveOnboarding('acc-1', ANSWERS, 1);
  await useOnboarding.getState().load('acc-2');
  expect(useOnboarding.getState().answers).toBeNull();
});

test('clear empties the store', async () => {
  await useOnboarding.getState().load('acc-1');
  await useOnboarding.getState().save(ANSWERS);
  useOnboarding.getState().clear();
  expect(useOnboarding.getState().accountId).toBeNull();
  expect(useOnboarding.getState().answers).toBeNull();
});
