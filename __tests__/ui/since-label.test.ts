/**
 * sinceLabel — the quiet, unnumbered sense of when used on question and answer
 * bylines. `now` is an argument, so this is deterministic.
 */
import { sinceLabel } from '../../src/ui/format';

const DAY = 86_400_000;
const NOW = 1_700_000_000_000;
const daysAgo = (n: number) => NOW - n * DAY;

describe('sinceLabel', () => {
  it('names the near days', () => {
    expect(sinceLabel(NOW, NOW)).toBe('today');
    expect(sinceLabel(daysAgo(1), NOW)).toBe('yesterday');
    expect(sinceLabel(daysAgo(3), NOW)).toBe('3 days ago');
    expect(sinceLabel(daysAgo(6), NOW)).toBe('6 days ago');
  });

  it('rounds out to weeks, months and years', () => {
    expect(sinceLabel(daysAgo(8), NOW)).toBe('last week');
    expect(sinceLabel(daysAgo(21), NOW)).toBe('3 weeks ago');
    expect(sinceLabel(daysAgo(40), NOW)).toBe('last month');
    expect(sinceLabel(daysAgo(200), NOW)).toBe('6 months ago');
    expect(sinceLabel(daysAgo(400), NOW)).toBe('last year');
    expect(sinceLabel(daysAgo(1000), NOW)).toBe('2 years ago');
  });

  it('treats a future timestamp as today rather than going negative', () => {
    // Clock skew must never render "-1 days ago".
    expect(sinceLabel(NOW + 5 * DAY, NOW)).toBe('today');
  });
});
