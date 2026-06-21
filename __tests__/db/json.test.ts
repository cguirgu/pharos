/**
 * safeJsonParse — corrupt persisted/remote JSON must degrade to a fallback, never
 * throw (a thrown parse on a stored row would crash startup). See src/db/json.ts.
 */
import { safeJsonParse } from '../../src/db/json';

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

test('parses valid JSON', () => {
  expect(safeJsonParse('{"type":"daily"}', { type: 'x' })).toEqual({ type: 'daily' });
  expect(safeJsonParse('[1,2,3]', [])).toEqual([1, 2, 3]);
});

test('returns the fallback (silently) for null/undefined/empty input', () => {
  expect(safeJsonParse(null, 'fb')).toBe('fb');
  expect(safeJsonParse(undefined, 'fb')).toBe('fb');
  expect(safeJsonParse('', 'fb')).toBe('fb');
  expect(warn).not.toHaveBeenCalled();
});

test('returns the fallback and logs for malformed JSON', () => {
  const fb = { type: 'daily' as const };
  expect(safeJsonParse('{not json', fb, 'cadence')).toBe(fb);
  expect(warn).toHaveBeenCalled();
});
