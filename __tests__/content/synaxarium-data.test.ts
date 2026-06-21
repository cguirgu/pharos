/**
 * Validates the ingested Synaxarium dataset + the `saintsOn` lookup by wiring the
 * real `content/synaxarium/synaxarium.json`. Asserts STRUCTURE only (key coverage,
 * non-empty fields) — never prints the text.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { setSynaxariumData, saintsOn, type SynaxariumDataset } from '../../src/domain/content/synaxarium';
import { CONTENT_LICENSED } from '../../src/content/flags';
import { toCoptic } from '../../src/domain/coptic';

const FILE = join(__dirname, '..', '..', 'content', 'synaxarium', 'synaxarium.json');
const hasData = existsSync(FILE);

(hasData ? describe : describe.skip)('Synaxarium ingested data', () => {
  beforeAll(() => {
    const payload = JSON.parse(readFileSync(FILE, 'utf8')) as SynaxariumDataset & { days: Record<string, unknown> };
    setSynaxariumData(payload);
  });
  afterAll(() => setSynaxariumData(null));

  test('covers the full Coptic year (≈ 366 days)', () => {
    const payload = JSON.parse(readFileSync(FILE, 'utf8'));
    expect(Object.keys(payload.days).length).toBeGreaterThanOrEqual(360);
    expect(payload.draft).toBe(true);
  });

  test('the dataset holds real lives; saintsOn withholds the draft life while unlicensed', () => {
    // Koiak 29 (Coptic Nativity) — a well-populated day.
    const payload = JSON.parse(readFileSync(FILE, 'utf8')) as { days: Record<string, { life: string }> };
    expect((payload.days['4-29']?.life.length ?? 0)).toBeGreaterThan(0); // dataset has real text

    const entries = saintsOn({ year: 1742, month: 4, day: 29, monthName: 'Koiak' });
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]!.feasts && entries[0]!.feasts.length).toBeGreaterThan(0);
    expect(entries[0]!.draft).toBe(true);
    // the unlicensed life is gated out of the lookup (feast name still resolves)
    if (!CONTENT_LICENSED) expect(entries[0]!.life).toBe('');
  });

  test('wires through a Gregorian date via the calendar engine', () => {
    const entries = saintsOn(toCoptic({ year: 2026, month: 1, day: 7 })); // Nativity
    expect(entries.length).toBeGreaterThan(0);
  });
});
