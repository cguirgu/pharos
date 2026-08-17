/**
 * The two-tier day model (`synaxariumDay`) against the real ingested dataset.
 *
 * Asserts STRUCTURE only — coverage, counts, emptiness, uniqueness — and never
 * prints or asserts a literal commemoration or life, so no bundled Synaxarium
 * text lands in this file. Skips itself when the dataset is absent.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  setSynaxariumData,
  synaxariumDay,
  commemorationsOn,
  primaryCommemoration,
  saintsOn,
  hasLife,
  type SynaxariumDataset,
} from '../../src/domain/content/synaxarium';
import { CONTENT_LICENSED, SYNAXARIUM_NAMES } from '../../src/content/flags';
import { isCopticLeapYear, toCoptic } from '../../src/domain/coptic';
import type { CopticDate } from '../../src/domain/coptic';

const FILE = join(__dirname, '..', '..', 'content', 'synaxarium', 'synaxarium.json');
const hasData = existsSync(FILE);
/** The dataset only reaches the domain while the tier-1 flag is on. */
const tier1 = hasData && SYNAXARIUM_NAMES;

/** A Coptic date literal; `monthName` is irrelevant to the lookup. */
const K = (month: number, day: number): CopticDate => ({ year: 1742, month, day, monthName: '' });

(tier1 ? describe : describe.skip)('synaxariumDay (ingested dataset)', () => {
  beforeAll(() => {
    setSynaxariumData(JSON.parse(readFileSync(FILE, 'utf8')) as SynaxariumDataset);
  });
  afterAll(() => setSynaxariumData(null));

  test('every day of the Coptic year resolves at least one commemoration', () => {
    const missing: string[] = [];
    for (let m = 1; m <= 13; m++) {
      const days = m === 13 ? (isCopticLeapYear(1742) ? 6 : 5) : 30;
      for (let d = 1; d <= days; d++) {
        if (commemorationsOn(K(m, d)).length === 0) missing.push(`${m}-${d}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('commemoration labels are single-line, trimmed, and carry no trailing stop', () => {
    for (let m = 1; m <= 13; m++) {
      for (let d = 1; d <= (m === 13 ? 5 : 30); d++) {
        for (const c of commemorationsOn(K(m, d))) {
          expect(c.length).toBeGreaterThan(0);
          expect(c).not.toContain('\n');
          expect(c).toBe(c.trim());
          expect(c.endsWith('.')).toBe(false);
        }
      }
    }
  });

  test('multi-commemoration days surface every line, not just the first', () => {
    // Thout 1 (Nayrouz) carries several commemorations in the source.
    const day = synaxariumDay(K(1, 1));
    expect(day).not.toBeNull();
    expect(day!.commemorations.length).toBeGreaterThan(1);
    expect(new Set(day!.commemorations).size).toBe(day!.commemorations.length);
    expect(primaryCommemoration(K(1, 1))).toBe(day!.commemorations[0]);
  });

  test('a good number of days carry more than one commemoration', () => {
    let multi = 0;
    for (let m = 1; m <= 13; m++) {
      for (let d = 1; d <= (m === 13 ? 5 : 30); d++) {
        if (commemorationsOn(K(m, d)).length > 1) multi++;
      }
    }
    expect(multi).toBeGreaterThan(100);
  });

  test('saintsOn stays a one-entry-per-day adapter over synaxariumDay', () => {
    const entries = saintsOn(K(1, 1));
    expect(entries).toHaveLength(1);
    expect(entries[0]!.feasts).toEqual(synaxariumDay(K(1, 1))!.commemorations);
    expect(entries[0]!.name).toBe(primaryCommemoration(K(1, 1)));
  });

  test('wires through a Gregorian date via the calendar engine', () => {
    expect(commemorationsOn(toCoptic({ year: 2026, month: 1, day: 7 })).length).toBeGreaterThan(0);
  });

  test('the life is withheld in the shipped flag state', () => {
    if (CONTENT_LICENSED) return;
    for (let m = 1; m <= 13; m++) {
      for (let d = 1; d <= (m === 13 ? 5 : 30); d++) {
        const day = synaxariumDay(K(m, d));
        expect(day!.life).toBe('');
        expect(hasLife(day)).toBe(false);
      }
    }
  });
});

describe('synaxariumDay (no dataset loaded)', () => {
  beforeAll(() => setSynaxariumData(null));

  test('falls back to the project-authored seeds, and is null elsewhere', () => {
    expect(commemorationsOn(K(1, 1)).length).toBeGreaterThan(0); // a seeded feast
    expect(synaxariumDay(K(2, 14))).toBeNull(); // no seed, no dataset
    expect(primaryCommemoration(K(2, 14))).toBeNull();
    expect(saintsOn(K(2, 14))).toEqual([]);
  });
});

/**
 * The tier-1 kill switch. If the translators ever object to the wording of the
 * commemoration lines themselves, `SYNAXARIUM_NAMES = false` must degrade the
 * app to the project's own seeded feasts without crashing and without leaving a
 * single line of third-party wording anywhere. Asserted here in whichever state
 * the flag currently holds, so the claim is checked rather than merely written
 * down — and so an emergency flip does not also turn the suite red.
 */
(hasData ? describe : describe.skip)('the SYNAXARIUM_NAMES kill switch', () => {
  beforeAll(() => setSynaxariumData(JSON.parse(readFileSync(FILE, 'utf8')) as SynaxariumDataset));
  afterAll(() => setSynaxariumData(null));

  const seeded = K(1, 1); // Nayrouz — present in the seeds AND in the dataset
  const datasetOnly = K(2, 14); // an ordinary day, in the dataset but never seeded

  if (SYNAXARIUM_NAMES) {
    test('ON: the dataset is read, so ordinary days resolve too', () => {
      expect(commemorationsOn(seeded).length).toBeGreaterThan(0);
      expect(commemorationsOn(datasetOnly).length).toBeGreaterThan(0);
    });
  } else {
    test('OFF: the dataset is ignored entirely — ordinary days go quiet', () => {
      expect(synaxariumDay(datasetOnly)).toBeNull();
      expect(primaryCommemoration(datasetOnly)).toBeNull();
      expect(saintsOn(datasetOnly)).toEqual([]);
    });

    test('OFF: seeded feasts still render, so the app is not left blank', () => {
      const day = synaxariumDay(seeded);
      expect(day).not.toBeNull();
      expect(day!.commemorations.length).toBeGreaterThan(0);
    });

    test('OFF: what renders is the project’s own wording, not the dataset’s', () => {
      const raw = JSON.parse(readFileSync(FILE, 'utf8')) as { days: Record<string, { feasts: string[] }> };
      const fromDataset = new Set((raw.days['1-1']?.feasts ?? []).map((s) => s.replace(/\.$/, '')));
      for (const c of commemorationsOn(seeded)) expect(fromDataset.has(c)).toBe(false);
    });
  }
});
