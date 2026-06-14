import { monthGrid, daysInMonth } from '../src/domain/ordo';
import { getDayInfo } from '../src/domain/coptic';

describe('Ordo month grid', () => {
  test('daysInMonth handles leap years and month lengths', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  test('grid covers the whole month and mirrors the calendar engine', () => {
    const grid = monthGrid(2026, 4, { year: 2026, month: 4, day: 12 });
    expect(grid).toHaveLength(30);
    // every day's fast level + feast matches getDayInfo
    for (const d of grid) {
      const info = getDayInfo(d.date);
      expect(d.fastLevel).toBe(info.fast.level);
      expect(d.feast?.key ?? null).toBe(info.feast?.key ?? null);
      expect(d.coptic).toEqual(info.coptic);
    }
    // Pascha 2026 = 12 Apr, flagged today, feast = pascha
    const pascha = grid.find((d) => d.date.day === 12)!;
    expect(pascha.isToday).toBe(true);
    expect(pascha.feast?.key).toBe('pascha');
    // a Holy-Fifty day has no fast
    expect(pascha.fastLevel).toBe('none');
  });
});
