/**
 * Ingest the PUBLIC-DOMAIN King James Version into the app's content format.
 *
 * Source: https://github.com/aruljohn/Bible-kjv (MIT code; KJV text is public
 * domain). KJV is the historically-approved Coptic Orthodox English translation,
 * so it is a legally-clean default. See docs/CONTENT-SOURCES.md.
 *
 * Output: content/bible/kjv/<Book>.json  (normalized) + index.json (manifest).
 * Normalized schema:  { id, book, chapters: [ { chapter, verses: [ {n, text} ] } ] }
 *
 * Run:  node scripts/ingest-kjv.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAW = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'bible', 'kjv');

/** Stable id from a book name: "1 Samuel" → "1samuel", "Song of Solomon" → "songofsolomon". */
const toId = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

async function getJson(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const books = await getJson(`${RAW}/Books.json`); // array of book names
  console.log(`Books: ${books.length}`);

  const manifest = [];
  for (const name of books) {
    // Repo filenames strip spaces: "1 Samuel" → "1Samuel.json".
    const raw = await getJson(`${RAW}/${name.replace(/\s+/g, '')}.json`);
    const chapters = raw.chapters.map((c) => ({
      chapter: Number(c.chapter),
      verses: c.verses.map((v) => ({ n: Number(v.verse), text: v.text })),
    }));
    const id = toId(name);
    const out = { id, book: name, chapters };
    await writeFile(join(OUT, `${id}.json`), JSON.stringify(out));
    manifest.push({ id, book: name, chapters: chapters.length });
    process.stdout.write(`· ${name} (${chapters.length})\n`);
  }

  await writeFile(
    join(OUT, 'index.json'),
    JSON.stringify({ version: 'kjv', name: 'King James Version', license: 'public-domain', books: manifest }, null, 2),
  );
  console.log(`\nDone: ${manifest.length} books → content/bible/kjv/`);
}

main().catch((e) => {
  console.error('Ingest failed:', e);
  process.exit(1);
});
