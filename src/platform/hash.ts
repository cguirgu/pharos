/**
 * ⚠️ TEST-ONLY local password hashing. This is NOT cryptographically secure and
 * must never be relied on for real authentication. It exists so the local
 * multi-account testbed can store/verify passwords without a backend. When a
 * real backend (e.g. Supabase) is wired in, authentication moves server-side and
 * this module is deleted.
 *
 * Pure JS (no native dependency) so it runs in jest and on web unchanged.
 */

/** A random salt string. */
export function makeSalt(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/** FNV-1a 32-bit over a string → 8-char hex. */
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** Deterministic local "hash" of a password with its salt (test-only). */
export function hashPassword(password: string, salt: string): string {
  // A few mixing rounds — still not secure, just non-trivial for local storage.
  let acc = `${salt}:${password}:${salt}`;
  for (let i = 0; i < 8; i++) acc = fnv1a(acc) + fnv1a(acc.split('').reverse().join('') + i);
  return acc;
}

/** Constant-ish comparison (not timing-safe — test-only). */
export function verifyPassword(password: string, salt: string, hash: string): boolean {
  return hashPassword(password, salt) === hash;
}
