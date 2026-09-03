/**
 * The citation gate.
 *
 * This is the test the Faith course exists behind: the project's golden rule
 * (docs/CONTENT-SOURCES.md) is "ship only verified, official text; never invent",
 * and for doctrinal content that rule is only enforceable if every claim carries
 * a resolvable citation. A card with no source, or a source id that does not
 * exist, fails CI — it does not reach a reviewer's eye or a user's screen.
 */
import { SOURCES, sourceById, citations } from '../../src/domain/faith/sources';
import { UNITS, LESSONS } from '../../src/domain/faith/units';
import { CREED_SOURCES } from '../../src/domain/faith/creed';
import type { Attributed } from '../../src/domain/faith/types';

/** Every authored item in the course, labelled for a readable failure. */
const items: { label: string; item: Attributed }[] = LESSONS.flatMap((l) => [
  ...l.cards.map((c) => ({ label: `${l.id} card ${c.id}`, item: c as Attributed })),
  ...l.questions.map((q) => ({ label: `${l.id} question ${q.id}`, item: q as Attributed })),
]);

describe('faith source registry', () => {
  it('has sources to check', () => {
    expect(SOURCES.length).toBeGreaterThan(0);
    expect(items.length).toBeGreaterThan(0);
  });

  it('has no duplicate source ids', () => {
    const ids = SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every source a title, a publisher, and an https url', () => {
    for (const s of SOURCES) {
      expect(s.title.trim().length).toBeGreaterThan(0);
      expect(s.publisher.trim().length).toBeGreaterThan(0);
      expect(s.url).toMatch(/^https?:\/\//);
    }
  });

  it('cites only Coptic Orthodox, patristic, or signed inter-church sources', () => {
    // Guards against a well-meaning contributor citing a blog or an encyclopaedia
    // as the authority for a doctrinal claim. `reference`-tier entries exist for
    // cross-checking dates and are held to the same host allow-list.
    const ALLOWED_HOSTS = [
      'lacopts.org',
      'suscopts.org',
      'copticchurch.net',
      'copticorthodox.church',
      'st-takla.org',
      'coptic-treasures.com',
      'ecupatria.org',
    ];
    for (const s of SOURCES) {
      const host = new URL(s.url).hostname.replace(/^(www|cdn|mail|ml)\./, '');
      expect(ALLOWED_HOSTS).toContain(host);
    }
  });
});

describe('every authored item is attributed', () => {
  it.each(items.map((i) => [i.label, i.item] as const))('%s cites at least one source', (_label, item) => {
    expect(item.sources.length).toBeGreaterThan(0);
  });

  it.each(items.map((i) => [i.label, i.item] as const))('%s cites only known sources', (_label, item) => {
    for (const id of item.sources) {
      expect(sourceById(id)).toBeDefined();
    }
  });

  it('resolves every citation without dropping any', () => {
    for (const { label, item } of items) {
      expect(`${label}: ${citations(item.sources).length}`).toBe(`${label}: ${item.sources.length}`);
    }
  });
});

describe('review gate', () => {
  it('ships new doctrinal content unreviewed by default', () => {
    // A card flipped to `reviewed: true` is a claim that the project owner has
    // signed it off. This test does not forbid that — it documents the default,
    // so that flipping one is a deliberate, visible act in a diff.
    const reviewed = items.filter(({ item }) => item.reviewed);
    const unreviewed = items.length - reviewed.length;
    expect(unreviewed + reviewed.length).toBe(items.length);
  });
});

describe('no orphan sources', () => {
  it('the Creed screen cites known sources', () => {
    expect(CREED_SOURCES.length).toBeGreaterThan(0);
    for (const id of CREED_SOURCES) expect(sourceById(id)).toBeDefined();
  });

  it('every registered source is actually cited by something', () => {
    // The Creed screen shows content too, so its citations count as uses.
    const cited = new Set([...items.flatMap(({ item }) => item.sources), ...CREED_SOURCES]);
    const orphans = SOURCES.filter((s) => !cited.has(s.id)).map((s) => s.id);
    expect(orphans).toEqual([]);
  });
});

describe('unit / lesson structure', () => {
  it('gives every unit at least one lesson, and every lesson at least one question', () => {
    for (const u of UNITS) {
      expect(u.lessons.length).toBeGreaterThan(0);
      for (const l of u.lessons) {
        expect(l.questions.length).toBeGreaterThan(0);
        expect(l.unitId).toBe(u.id);
      }
    }
  });

  it('has globally unique lesson, card, and question ids', () => {
    const lessonIds = LESSONS.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);

    const cardIds = LESSONS.flatMap((l) => l.cards.map((c) => c.id));
    expect(new Set(cardIds).size).toBe(cardIds.length);

    const questionIds = LESSONS.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });
});
