/**
 * Credential validation for the email/password auth flow. Pure domain logic
 * (no I/O), shared by the auth store regardless of backend. The error codes line
 * up with `copy.auth.errors` so screens can render a human message per code.
 */

/** Known credential failure codes (keys of copy.auth.errors). */
export type AuthErrorCode = 'invalid-email' | 'weak-password' | 'email-taken' | 'invalid-credentials';

/** Minimum password length (matches copy: "Use at least eight characters."). */
export const MIN_PASSWORD_LENGTH = 8;

// One @, a non-empty local part, a domain label, and a TLD of 2+ chars
// (rejects "a@b.c"). Kept simple; the server (Supabase Auth) is the final word.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

/**
 * Validate a sign-up / sign-in pair. Returns the first failing code, or null
 * when both fields are acceptable. Email is checked before password.
 */
export function validateCredentials(email: string, password: string): AuthErrorCode | null {
  if (!isValidEmail(email)) return 'invalid-email';
  if (!isValidPassword(password)) return 'weak-password';
  return null;
}
