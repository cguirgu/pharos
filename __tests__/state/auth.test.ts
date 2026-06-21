/**
 * Auth store tests (MemoryRepo, unconfigured = local dev path): the single
 * signed-in user, session restore, onboarding, and per-account data wiring.
 * (Google/Supabase paths require keys + a device and are owner-verified.)
 */
import { useAuth } from '../../src/state/auth';
import { useRule } from '../../src/state/rule';
import { useOnboarding } from '../../src/state/onboarding';
import { MemoryRepo, setRepo } from '../../src/db/repo';
import type { OnboardingAnswers } from '../../src/domain/onboarding';

const ANSWERS: OnboardingAnswers = {
  goals: ['prayer', 'word'],
  experience: 'some',
  reminder: { partOfDay: 'morning', time: '07:00' },
};

beforeEach(async () => {
  setRepo(new MemoryRepo());
  useRule.getState().clear();
  await useAuth.getState().load();
});

const auth = () => useAuth.getState();

test('starts loaded and signed out', () => {
  expect(auth().loaded).toBe(true);
  expect(auth().account).toBeNull();
});

test('sign-in opens a session, not yet onboarded', async () => {
  const ok = await auth().signInWithGoogle();
  expect(ok).toBe(true);
  expect(auth().account).not.toBeNull();
  expect(auth().account?.onboardingComplete).toBe(false);
});

test('the session is restored on a fresh load', async () => {
  await auth().signInWithGoogle();
  await auth().load(); // simulate relaunch against the same repo
  expect(auth().account).not.toBeNull();
});

test('completeOnboarding writes the profile and creates the chosen rule', async () => {
  await auth().signInWithGoogle();
  await auth().completeOnboarding({ displayName: 'Mina', journeyStage: 'returning', selection: ['agpeya', 'word'], answers: ANSWERS });
  const acc = auth().account!;
  expect(acc.displayName).toBe('Mina');
  expect(acc.journeyStage).toBe('returning');
  expect(acc.onboardingComplete).toBe(true);
  expect(useRule.getState().practices.map((p) => p.name)).toEqual(['Pray the Agpeya', 'Read the Word']);
  // the questionnaire is persisted and loaded into its store
  expect(useOnboarding.getState().answers).toEqual(ANSWERS);
});

test('sign-out clears data; signing back in restores it', async () => {
  await auth().signInWithGoogle();
  await auth().completeOnboarding({ displayName: 'A', journeyStage: 'returning', selection: ['agpeya'], answers: ANSWERS });
  expect(useRule.getState().practices).toHaveLength(1);

  await auth().signOut();
  expect(auth().account).toBeNull();
  expect(useRule.getState().practices).toHaveLength(0);

  await auth().signInWithGoogle();
  expect(useRule.getState().practices).toHaveLength(1); // same account, data persisted
});

test('email/password sign-up opens a session for a new account', async () => {
  const ok = await auth().signUpWithPassword('mina@example.com', 'pa55word');
  expect(ok).toBe(true);
  expect(auth().account?.email).toBe('mina@example.com');
  expect(auth().account?.onboardingComplete).toBe(false);
  expect(auth().authError).toBeNull();
});

test('sign-up rejects invalid credentials with the matching error code', async () => {
  expect(await auth().signUpWithPassword('not-an-email', 'pa55word')).toBe(false);
  expect(auth().authError).toBe('invalid-email');
  expect(await auth().signUpWithPassword('mina@example.com', '12')).toBe(false);
  expect(auth().authError).toBe('weak-password');
  expect(auth().account).toBeNull();
});

test('sign-up refuses a duplicate email (case-insensitive)', async () => {
  await auth().signUpWithPassword('mina@example.com', 'pa55word');
  await auth().signOut();
  const ok = await auth().signUpWithPassword('MINA@example.com', 'different');
  expect(ok).toBe(false);
  expect(auth().authError).toBe('email-taken');
});

test('sign-in verifies the password and restores the account', async () => {
  await auth().signUpWithPassword('mina@example.com', 'pa55word');
  await auth().signOut();
  expect(auth().account).toBeNull();

  expect(await auth().signInWithPassword('mina@example.com', 'wrong')).toBe(false);
  expect(auth().authError).toBe('invalid-credentials');

  const ok = await auth().signInWithPassword('mina@example.com', 'pa55word');
  expect(ok).toBe(true);
  expect(auth().account?.email).toBe('mina@example.com');
});

test('password account persists its rule across sign-out and back in', async () => {
  await auth().signUpWithPassword('mina@example.com', 'pa55word');
  await auth().completeOnboarding({ displayName: 'Mina', journeyStage: 'exploring', selection: ['agpeya'], answers: ANSWERS });
  expect(useRule.getState().practices).toHaveLength(1);

  await auth().signOut();
  expect(useRule.getState().practices).toHaveLength(0);

  await auth().signInWithPassword('mina@example.com', 'pa55word');
  expect(useRule.getState().practices).toHaveLength(1);
  expect(auth().account?.displayName).toBe('Mina');
});
