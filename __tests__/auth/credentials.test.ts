/** Credential validation → error codes shared with copy.auth.errors. */
import { isValidEmail, isValidPassword, validateCredentials } from '../../src/domain/auth/credentials';

test('isValidEmail accepts ordinary addresses and trims surrounding space', () => {
  expect(isValidEmail('mina@example.com')).toBe(true);
  expect(isValidEmail('  mina@example.com  ')).toBe(true);
  expect(isValidEmail('mina+tag@sub.example.co')).toBe(true);
});

test('isValidEmail rejects malformed addresses', () => {
  for (const bad of ['', 'mina', 'mina@', '@example.com', 'mina@example', 'a b@example.com', 'a@b.c', 'a@@b.com']) {
    expect(isValidEmail(bad)).toBe(false);
  }
});

test('isValidPassword enforces the eight-character minimum', () => {
  expect(isValidPassword('1234')).toBe(false);
  expect(isValidPassword('1234567')).toBe(false);
  expect(isValidPassword('12345678')).toBe(true);
});

test('validateCredentials returns the first failing code, email first', () => {
  expect(validateCredentials('nope', '123')).toBe('invalid-email');
  expect(validateCredentials('mina@example.com', '123')).toBe('weak-password');
  expect(validateCredentials('mina@example.com', 'longenough')).toBeNull();
});
