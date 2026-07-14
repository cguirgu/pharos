/**
 * Per-account repo dispatch, production mode (backend configured): the guest
 * account must resolve to a LOCAL repo — never the Supabase repo — so guest
 * data stays on device. This is the only unit covering the configured branch;
 * everything else runs unconfigured, where both paths share one store.
 */
jest.mock('../../src/lib/config', () => ({ isBackendConfigured: () => true }));
jest.mock('../../src/db/supabaseRepo', () => ({ SupabaseRepo: class SupabaseRepoStub {} }));

import { getRepo, getLocalRepo, setRepo, MemoryRepo, GUEST_ACCOUNT_ID } from '../../src/db/repo';

test('the guest account is dispatched to a local repo, others to the backend', () => {
  const backend = getRepo();
  const guest = getRepo(GUEST_ACCOUNT_ID);
  expect(backend.constructor.name).toBe('SupabaseRepoStub');
  expect(guest).not.toBe(backend);
  expect(guest).toBeInstanceOf(MemoryRepo); // jest has no sqlite; the local pick falls back
  expect(getRepo('some-supabase-uid')).toBe(backend);
  // stable instances on repeat calls
  expect(getRepo(GUEST_ACCOUNT_ID)).toBe(guest);
  expect(getLocalRepo()).toBe(guest);
});

test('setRepo overrides both the default and the local repo (test hook)', () => {
  const injected = new MemoryRepo();
  setRepo(injected);
  expect(getRepo()).toBe(injected);
  expect(getRepo(GUEST_ACCOUNT_ID)).toBe(injected);
});
