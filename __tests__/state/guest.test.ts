/**
 * Guest mode (App Review 5.1.1(v)): "Continue without an account" opens a local
 * guest session with full per-account data, restored across relaunch, isolated
 * from real accounts, and never migrated on sign-up (the rows stay on device).
 * (MemoryRepo, unconfigured: getRepo(GUEST_ACCOUNT_ID) is the same store.)
 */
import { useAuth } from '../../src/state/auth';
import { useRule } from '../../src/state/rule';
import { useJournal } from '../../src/state/journal';
import { useOnboarding } from '../../src/state/onboarding';
import { MemoryRepo, setRepo, getRepo, GUEST_ACCOUNT_ID } from '../../src/db/repo';
import type { OnboardingAnswers } from '../../src/domain/onboarding';

const ANSWERS: OnboardingAnswers = {
  goals: ['prayer', 'word'],
  experience: 'some',
  reminder: { partOfDay: 'morning', time: '07:00' },
};

const DATE = { year: 2026, month: 7, day: 14 };

beforeEach(async () => {
  setRepo(new MemoryRepo());
  useRule.getState().clear();
  await useAuth.getState().load();
});

const auth = () => useAuth.getState();

test('continueAsGuest opens a guest session, not yet onboarded', async () => {
  const ok = await auth().continueAsGuest();
  expect(ok).toBe(true);
  expect(auth().account?.id).toBe(GUEST_ACCOUNT_ID);
  expect(auth().account?.onboardingComplete).toBe(false);
  expect(auth().authError).toBeNull();
});

test('the guest session is restored on a fresh load', async () => {
  await auth().continueAsGuest();
  await auth().load(); // simulate relaunch against the same repo
  expect(auth().account?.id).toBe(GUEST_ACCOUNT_ID);
});

test('load stays signed out when no guest session exists', async () => {
  expect(auth().loaded).toBe(true);
  expect(auth().account).toBeNull();
});

test('completeOnboarding as guest writes the profile and creates the chosen rule', async () => {
  await auth().continueAsGuest();
  await auth().completeOnboarding({ displayName: 'Mina', journeyStage: 'exploring', selection: ['agpeya', 'word'], answers: ANSWERS });
  const acc = auth().account!;
  expect(acc.id).toBe(GUEST_ACCOUNT_ID);
  expect(acc.displayName).toBe('Mina');
  expect(acc.onboardingComplete).toBe(true);
  expect(useRule.getState().practices.map((p) => p.name)).toEqual(['Pray the Agpeya', 'Read the Word']);
  expect(useOnboarding.getState().answers).toEqual(ANSWERS);
});

test('guest data is isolated from a new account and preserved (no migration)', async () => {
  await auth().continueAsGuest();
  await auth().completeOnboarding({ displayName: 'Guest', journeyStage: 'exploring', selection: ['agpeya'], answers: ANSWERS });
  await useJournal.getState().save({ date: DATE, title: 'Kept the vigil', body: 'A quiet evening.' });
  expect(useJournal.getState().entries).toHaveLength(1);

  // Sign up for a real account: the stores now show that account's (empty) data…
  const ok = await auth().signUpWithPassword('mina@example.com', 'pa55word');
  expect(ok).toBe(true);
  expect(auth().account?.id).not.toBe(GUEST_ACCOUNT_ID);
  expect(useRule.getState().practices).toHaveLength(0);
  expect(useJournal.getState().entries).toHaveLength(0);

  // …while the guest rows remain on the device under the guest id.
  expect(await getRepo(GUEST_ACCOUNT_ID).listJournal(GUEST_ACCOUNT_ID)).toHaveLength(1);
  expect(await getRepo(GUEST_ACCOUNT_ID).listPractices(GUEST_ACCOUNT_ID)).toHaveLength(1);
});

test('sign-out ends the guest session for good', async () => {
  await auth().continueAsGuest();
  await auth().signOut();
  expect(auth().account).toBeNull();

  await auth().load(); // relaunch: the cleared marker must not resurrect the guest
  expect(auth().account).toBeNull();
});

test('a returning guest resumes their previous data', async () => {
  await auth().continueAsGuest();
  await auth().completeOnboarding({ displayName: 'Guest', journeyStage: 'exploring', selection: ['agpeya'], answers: ANSWERS });
  await auth().signOut();

  await auth().continueAsGuest();
  expect(auth().account?.onboardingComplete).toBe(true);
  expect(useRule.getState().practices).toHaveLength(1);
});
