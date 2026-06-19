/**
 * Auth store tests (MemoryRepo, unconfigured = local dev path): the single
 * signed-in user, session restore, onboarding, and per-account data wiring.
 * (Google/Supabase paths require keys + a device and are owner-verified.)
 */
import { useAuth } from '../../src/state/auth';
import { useRule } from '../../src/state/rule';
import { MemoryRepo, setRepo } from '../../src/db/repo';

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
  await auth().completeOnboarding({ displayName: 'Mina', journeyStage: 'returning', selection: ['agpeya', 'word'] });
  const acc = auth().account!;
  expect(acc.displayName).toBe('Mina');
  expect(acc.journeyStage).toBe('returning');
  expect(acc.onboardingComplete).toBe(true);
  expect(useRule.getState().practices.map((p) => p.name)).toEqual(['Pray the Agpeya', 'Read the Word']);
});

test('sign-out clears data; signing back in restores it', async () => {
  await auth().signInWithGoogle();
  await auth().completeOnboarding({ displayName: 'A', journeyStage: 'returning', selection: ['agpeya'] });
  expect(useRule.getState().practices).toHaveLength(1);

  await auth().signOut();
  expect(auth().account).toBeNull();
  expect(useRule.getState().practices).toHaveLength(0);

  await auth().signInWithGoogle();
  expect(useRule.getState().practices).toHaveLength(1); // same account, data persisted
});
