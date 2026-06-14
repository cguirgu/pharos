/**
 * Lazy loaders for the bundled public-domain KJV books that the app can navigate
 * (the Gospels + Psalms). Each `require` is evaluated only when the book is first
 * opened, so the JSON is parsed on demand. Add more books here as the reader
 * gains a full book picker. Data: `content/bible/kjv/` (see scripts/ingest-kjv.mjs).
 */
import type { BookId } from '../domain/content/bible';

type Loaded = { chapters: { chapter: number; verses: { n: number; text: string }[] }[] };

export const kjvLoaders: Partial<Record<BookId, () => Loaded>> = {
  matthew: () => require('../../content/bible/kjv/matthew.json'),
  mark: () => require('../../content/bible/kjv/mark.json'),
  luke: () => require('../../content/bible/kjv/luke.json'),
  john: () => require('../../content/bible/kjv/john.json'),
  psalms: () => require('../../content/bible/kjv/psalms.json'),
};
