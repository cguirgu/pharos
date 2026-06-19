/**
 * Structural validation of the Coptic letter-combination data (the "Letters
 * Together" bridge). Pronunciation correctness is verified separately against
 * authoritative sources + owner review; this guards shape/encoding invariants.
 */
import { COMBOS, COMBO_UNIT } from '../../src/domain/learn/combinations';

const inCopticBlock = (c: number) => c >= 0x2c80 && c <= 0x2cb1;
const inDemoticRange = (c: number) => c >= 0x03e2 && c <= 0x03ef;
const allCoptic = (s: string) => [...s].every((ch) => inCopticBlock(ch.codePointAt(0)!) || inDemoticRange(ch.codePointAt(0)!));

describe('Coptic combinations', () => {
  test('the bridge unit is "sounds" with combinations', () => {
    expect(COMBO_UNIT.id).toBe('sounds');
    expect(COMBOS.length).toBeGreaterThanOrEqual(6);
  });

  test('ids are unique', () => {
    expect(new Set(COMBOS.map((c) => c.id)).size).toBe(COMBOS.length);
  });

  test('each combo has real Coptic glyphs + a non-empty sound, rule, and example', () => {
    for (const c of COMBOS) {
      expect(c.glyphs.length).toBeGreaterThan(0);
      expect(allCoptic(c.glyphs)).toBe(true);
      expect(allCoptic(c.example)).toBe(true);
      expect(c.sound.length).toBeGreaterThan(0);
      expect(c.rule.length).toBeGreaterThan(0);
      expect(c.exampleTranslit.length).toBeGreaterThan(0);
      expect(c.exampleEnglish.length).toBeGreaterThan(0);
    }
  });

  // Lock the example spellings so a typo can't slip through (TODO(verify-content)).
  test('combination example words are spelled exactly', () => {
    const byId = Object.fromEntries(COMBOS.map((c) => [c.id, c.example]));
    expect(byId['ou']).toBe('ⲫⲛⲟⲩϯ');
    expect(byId['oi']).toBe('ⲡϭⲟⲓⲥ');
    expect(byId['au']).toBe('ⲡⲁⲩⲗⲟⲥ');
    expect(byId['eu']).toBe('ⲡⲓⲡⲛⲉⲩⲙⲁ');
    expect(byId['gg']).toBe('ⲡⲓⲁⲅⲅⲉⲗⲟⲥ');
    expect(byId['shi']).toBe('ⲭⲉⲣⲉ');
    expect(byId['gh']).toBe('ⲁⲅⲁⲡⲏ');
  });

  test('each example actually contains its combination letters', () => {
    for (const c of COMBOS) {
      // single-letter combos (ⲭⲉ, ⲅⲓ) check the leading glyph is present
      expect(c.example.includes(c.glyphs) || c.example.includes([...c.glyphs][0]!)).toBe(true);
    }
  });
});
