/**
 * Endpoint safety predicate.
 *
 * Deliberately its own module with ZERO imports. It began life inside
 * `supabase.ts`, which cannot be loaded in a test run — that file reaches
 * AsyncStorage's native module through the session storage — so the check that
 * decides whether the app will talk to a plaintext endpoint could not be
 * tested. A security predicate that cannot be tested is not much of one.
 */

/**
 * True for https anywhere, or http against a loopback host so a local
 * `supabase start` still works.
 *
 * The IPv6 form is the subtle one: `new URL('http://[::1]:54321').hostname`
 * returns `"[::1]"` — brackets included. Comparing that against a bare `'::1'`
 * silently never matches, which rejected a valid local endpoint.
 */
export function isSecureEndpoint(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol === 'https:') return true;
    if (protocol !== 'http:') return false;
    const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return false;
  }
}
