/**
 * Supabase endpoint validation.
 *
 * Everything crossing this client is sensitive — session tokens, the user's
 * rule and journal, and (since release announcements) push tokens. A plaintext
 * endpoint would send all of it in the clear, so `getSupabase()` refuses one.
 *
 * The IPv6 case has its own test because the first version of this check was
 * wrong: `new URL('http://[::1]:…').hostname` keeps the brackets, so comparing
 * against a bare '::1' never matched and a valid local endpoint was rejected.
 */
import { isSecureEndpoint } from '../../src/lib/endpoint';

describe('isSecureEndpoint', () => {
  it('allows https anywhere', () => {
    expect(isSecureEndpoint('https://uigbajzmyguozxzfdhjy.supabase.co')).toBe(true);
    expect(isSecureEndpoint('https://example.com/path?q=1')).toBe(true);
  });

  it('allows http only on loopback, for local development', () => {
    expect(isSecureEndpoint('http://localhost:54321')).toBe(true);
    expect(isSecureEndpoint('http://127.0.0.1:54321')).toBe(true);
  });

  it('allows the bracketed IPv6 loopback', () => {
    // URL.hostname returns "[::1]" WITH brackets — the regression this guards.
    expect(new URL('http://[::1]:54321').hostname).toBe('[::1]');
    expect(isSecureEndpoint('http://[::1]:54321')).toBe(true);
  });

  it('is case-insensitive about the host', () => {
    expect(isSecureEndpoint('http://LOCALHOST:54321')).toBe(true);
  });

  it('rejects plaintext to anywhere else', () => {
    expect(isSecureEndpoint('http://evil.com')).toBe(false);
    expect(isSecureEndpoint('http://192.168.1.10:54321')).toBe(false);
    // Not loopback — one digit from it, which is exactly how this slips through.
    expect(isSecureEndpoint('http://[::2]:54321')).toBe(false);
    expect(isSecureEndpoint('http://localhost.evil.com')).toBe(false);
  });

  it('rejects non-http protocols and malformed input', () => {
    for (const url of ['ftp://x', 'file:///etc/passwd', 'javascript:alert(1)', 'nonsense', '']) {
      expect(isSecureEndpoint(url)).toBe(false);
    }
  });
});
