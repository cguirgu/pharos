/**
 * `commemorationLabel` + `notificationBody` — pure string shaping, exercised on
 * SYNTHETIC strings only so no bundled Synaxarium text appears in this file.
 */
import { commemorationLabel, notificationBody } from '../../src/domain/content/synaxarium';

describe('commemorationLabel', () => {
  test.each([
    ['drops a single trailing full stop', 'The Departure of St. Anonymous.', 'The Departure of St. Anonymous'],
    ['leaves an internal full stop alone', 'The Departure of St. A. B.', 'The Departure of St. A. B'],
    ['collapses runs of whitespace', 'The  Martyrdom\n of\tSt. Anonymous', 'The Martyrdom of St. Anonymous'],
    ['trims the ends', '  The Feast of Something  ', 'The Feast of Something'],
    ['passes a clean line through untouched', 'The Feast of Something', 'The Feast of Something'],
    ['leaves a trailing question mark', 'Who is this?', 'Who is this?'],
    ['handles an empty string', '', ''],
  ])('%s', (_label, input, expected) => {
    expect(commemorationLabel(input)).toBe(expected);
  });

  test('never reorders, adds, or drops words', () => {
    const words = 'The Commemoration of the Life giving Annunciation.';
    expect(commemorationLabel(words).split(' ')).toEqual(words.replace(/\.$/, '').split(' '));
  });
});

describe('notificationBody', () => {
  const long = `The Departure of St. Anonymous, the Fortieth Bishop of Somewhere, ${'and '.repeat(30)}the Confessor.`;

  test('passes a short line through unchanged (minus the full stop)', () => {
    expect(notificationBody('The Martyrdom of St. Anonymous.')).toBe('The Martyrdom of St. Anonymous');
  });

  test('truncates an over-long line to the cap', () => {
    expect(notificationBody(long).length).toBeLessThanOrEqual(111); // 110 + the ellipsis
    expect(notificationBody(long).endsWith('…')).toBe(true);
  });

  test('cuts at the last clause boundary inside the cap, never mid-word', () => {
    const out = notificationBody(long).replace(/…$/, '');
    expect(long.startsWith(out)).toBe(true); // a prefix of the source, nothing invented
    expect(out).toMatch(/\S$/); // no dangling space
    expect(long[out.length]).toMatch(/[\s,]/); // landed on a boundary, not mid-word
  });

  test('uses as much of the cap as a whole word allows', () => {
    const out = notificationBody(long, 45).replace(/…$/, '');
    expect(out.length).toBeGreaterThan(45 - 20); // not cut back further than one word
    expect(out.length).toBeLessThanOrEqual(45);
  });

  test('still truncates a single unbroken word', () => {
    const wall = 'x'.repeat(200);
    const out = notificationBody(wall);
    expect(out.length).toBe(111);
    expect(out.endsWith('…')).toBe(true);
  });

  test('respects a caller-supplied cap', () => {
    expect(notificationBody('The Martyrdom of St. Anonymous the Confessor', 20).length).toBeLessThanOrEqual(21);
  });

  test('never emits a newline', () => {
    expect(notificationBody('The Martyrdom\nof St. Anonymous')).not.toContain('\n');
  });
});
