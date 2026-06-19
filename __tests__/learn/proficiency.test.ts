/**
 * Proficiency ranks — fraction thresholds map onto the Seeker→Scholar ladder.
 */
import { proficiencyFor } from '../../src/domain/learn/proficiency';
import { LESSONS } from '../../src/domain/learn/course';

describe('proficiency ranks', () => {
  test('0 perfected → Seeker; all perfected → Scholar of Coptic', () => {
    expect(proficiencyFor(0).rank.title).toBe('Seeker');
    expect(proficiencyFor(LESSONS.length).rank.title).toBe('Scholar of Coptic');
  });

  test('the ladder climbs by fraction of lessons perfected', () => {
    const total = 100;
    expect(proficiencyFor(0, total).rank.key).toBe('seeker');
    expect(proficiencyFor(1, total).rank.key).toBe('catechumen');
    expect(proficiencyFor(25, total).rank.key).toBe('reader');
    expect(proficiencyFor(50, total).rank.key).toBe('chanter');
    expect(proficiencyFor(70, total).rank.key).toBe('cantor');
    expect(proficiencyFor(90, total).rank.key).toBe('scribe');
    expect(proficiencyFor(100, total).rank.key).toBe('scholar');
  });

  test('toNext counts lessons to the next rank, 0 at the top', () => {
    expect(proficiencyFor(0, 100).toNext).toBeGreaterThan(0);
    expect(proficiencyFor(0, 100).next?.key).toBe('catechumen');
    expect(proficiencyFor(100, 100).next).toBeNull();
    expect(proficiencyFor(100, 100).toNext).toBe(0);
  });
});
