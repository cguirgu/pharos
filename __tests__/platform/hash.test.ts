/**
 * Pure-TS SHA-256 + local password hashing. The SHA-256 is checked against the
 * standard NIST test vectors so we trust it for the local-only credential path.
 */
import { sha256, hashPassword, verifyPassword, randomSalt } from '../../src/platform/hash';

test('sha256 matches known vectors', () => {
  expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  expect(sha256('The quick brown fox jumps over the lazy dog')).toBe(
    'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
  );
});

test('sha256 handles a multi-block (>55 byte) and unicode input', () => {
  // 'a' * 1000 — known vector
  expect(sha256('a'.repeat(1000))).toBe('41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3');
  // Coptic wordmark — non-ASCII, must encode as UTF-8 without throwing
  expect(sha256('ⲡⲓⲫⲁⲣⲟⲥ')).toHaveLength(64);
});

test('hashPassword is deterministic per (password, salt) and salt-sensitive', () => {
  const h1 = hashPassword('correct horse', 'salt-a');
  const h2 = hashPassword('correct horse', 'salt-a');
  const h3 = hashPassword('correct horse', 'salt-b');
  expect(h1).toBe(h2);
  expect(h1).not.toBe(h3);
  expect(h1).toHaveLength(64);
});

test('verifyPassword accepts the right password and rejects the wrong one', () => {
  const salt = randomSalt();
  const hash = hashPassword('s3cret!', salt);
  expect(verifyPassword('s3cret!', salt, hash)).toBe(true);
  expect(verifyPassword('s3cret', salt, hash)).toBe(false);
  expect(verifyPassword('s3cret!', randomSalt(), hash)).toBe(false);
});

test('randomSalt returns a fresh 32-hex-char value', () => {
  const a = randomSalt();
  const b = randomSalt();
  expect(a).toMatch(/^[0-9a-f]{32}$/);
  expect(a).not.toBe(b);
});
