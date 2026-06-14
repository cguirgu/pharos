/**
 * Auth store tests (MemoryRepo): account creation, sign-in, session restore,
 * onboarding, and per-account data isolation — the multi-account testbed logic.
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

test('sign-up creates an account, opens a session, and is not yet onboarded', async () => {
  const res = await auth().signUp('Mina@Example.com', 'lamp1');
  expect(res.ok).toBe(true);
  const acc = auth().account!;
  expect(acc.email).toBe('mina@example.com'); // normalized
  expect(acc.onboardingComplete).toBe(false);
  expect(auth().accounts).toHaveLength(1);
});

test('rejects duplicate email, bad email, and weak password', async () => {
  await auth().signUp('a@x.com', 'lamp1');
  expect(await auth().signUp('A@x.com', 'other')).toEqual({ ok: false, error: 'email-taken' });
  expect(await auth().signUp('nope', 'lamp1')).toEqual({ ok: false, error: 'invalid-email' });
  expect(await auth().signUp('b@x.com', 'no')).toEqual({ ok: false, error: 'weak-password' });
});

test('sign-in verifies the password', async () => {
  await auth().signUp('a@x.com', 'lamp1');
  await auth().signOut();
  expect(await auth().signIn('a@x.com', 'wrong')).toEqual({ ok: false, error: 'invalid-credentials' });
  const res = await auth().signIn('a@x.com', 'lamp1');
  expect(res.ok).toBe(true);
  expect(auth().account?.email).toBe('a@x.com');
});

test('session is restored on a fresh load', async () => {
  await auth().signUp('a@x.com', 'lamp1');
  // Simulate app relaunch: reload from the same repo.
  await auth().load();
  expect(auth().account?.email).toBe('a@x.com');
});

test('completeOnboarding writes the profile and creates the chosen rule', async () => {
  await auth().signUp('a@x.com', 'lamp1');
  await auth().completeOnboarding({
    displayName: 'Mina',
    journeyStage: 'returning',
    selection: ['agpeya', 'word'],
  });
  const acc = auth().account!;
  expect(acc.displayName).toBe('Mina');
  expect(acc.journeyStage).toBe('returning');
  expect(acc.onboardingComplete).toBe(true);
  expect(useRule.getState().practices.map((p) => p.name)).toEqual(['Pray the Agpeya', 'Read the Word']);
});

test('accounts are fully isolated', async () => {
  const a = await auth().signUp('a@x.com', 'lamp1');
  expect(a.ok).toBe(true);
  await auth().completeOnboarding({ displayName: 'A', journeyStage: 'returning', selection: ['agpeya'] });
  expect(useRule.getState().practices).toHaveLength(1);
  const accAId = a.ok ? a.account.id : '';

  await auth().signOut();
  expect(useRule.getState().practices).toHaveLength(0);

  await auth().signUp('b@x.com', 'lamp2');
  expect(useRule.getState().practices).toHaveLength(0); // fresh account, empty rule
  await auth().completeOnboarding({ displayName: 'B', journeyStage: 'exploring', selection: ['word', 'fasts'] });
  expect(useRule.getState().practices).toHaveLength(2);

  await auth().switchAccount(accAId); // back to A
  expect(useRule.getState().practices.map((p) => p.name)).toEqual(['Pray the Agpeya']);
});
