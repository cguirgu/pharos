/**
 * Inline emphasis parsing.
 *
 * This exists because the running app was showing "say what makes it
 * *apostolic*" with the asterisks visible — authored markdown emphasis being
 * rendered literally by React Native's <Text>. Found by screenshotting the app,
 * not by any test, which is why the parser now has its own.
 */
import { parseEmphasis, hasEmphasis } from '../../src/ui/Emphasis';

const plain = (s: string) => parseEmphasis(s).map((r) => r.text).join('');

describe('parseEmphasis', () => {
  it('leaves unmarked text alone', () => {
    expect(parseEmphasis('a plain sentence')).toEqual([{ text: 'a plain sentence', emphasis: 'none' }]);
  });

  it('reads *single* as italic', () => {
    expect(parseEmphasis('the term *Theotokos* guards it')).toEqual([
      { text: 'the term ', emphasis: 'none' },
      { text: 'Theotokos', emphasis: 'italic' },
      { text: ' guards it', emphasis: 'none' },
    ]);
  });

  it('reads **double** as strong, not as two italics', () => {
    expect(parseEmphasis('**one nature out of two**')).toEqual([
      { text: 'one nature out of two', emphasis: 'strong' },
    ]);
  });

  it('handles both forms in one string', () => {
    const runs = parseEmphasis('**Arius** denied it; *Eutyches* blended it');
    expect(runs.map((r) => r.emphasis)).toEqual(['strong', 'none', 'italic', 'none']);
  });

  it('handles several emphases of the same kind', () => {
    const runs = parseEmphasis('*a* and *b* and *c*');
    expect(runs.filter((r) => r.emphasis === 'italic').map((r) => r.text)).toEqual(['a', 'b', 'c']);
  });

  it('never drops or duplicates text', () => {
    // The property that matters most: whatever the markers, the words survive.
    for (const s of [
      'plain',
      '*one*',
      '**two**',
      'a *b* c **d** e',
      'an unmatched * asterisk',
      'a ** dangling pair',
      '*',
      '',
    ]) {
      expect(plain(s)).toBe(s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*\n]+)\*/g, '$1'));
    }
  });

  it('leaves an unmatched marker visible rather than eating it', () => {
    expect(parseEmphasis('5 * 3 = 15')).toEqual([{ text: '5 * 3 = 15', emphasis: 'none' }]);
  });

  it('does not run emphasis across a line break', () => {
    const runs = parseEmphasis('a *start\nend* b');
    expect(runs.every((r) => r.emphasis === 'none')).toBe(true);
  });

  it('reports whether a string carries emphasis at all', () => {
    expect(hasEmphasis('nothing here')).toBe(false);
    expect(hasEmphasis('a *word*')).toBe(true);
    expect(hasEmphasis('5 * 3')).toBe(false);
  });
});
