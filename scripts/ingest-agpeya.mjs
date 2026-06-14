/**
 * Ingest the FULL Agpeya from coptic.io into the app's content model.
 * (The project owner has confirmed permission to use the coptic.io APIs.)
 *
 * Normalizes each canonical hour into ordered sections of renderable blocks
 * (text · rubric · verses), with the midnight prayer's three watches as their
 * own sections. Output: content/agpeya/hours/<office>.json + index.json.
 *
 * Run:  node scripts/ingest-agpeya.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API = 'https://api.coptic.io/api/agpeya';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'agpeya', 'hours');

// my office key → coptic.io hour id
const MAP = { matins: 'midnight', prime: 'prime', terce: 'terce', sext: 'sext', none: 'none', vespers: 'vespers', compline: 'compline' };

const get = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

const text = (s) => (typeof s === 'string' && s.trim() ? [{ type: 'text', text: s }] : []);
const textBlocks = (content) => (Array.isArray(content) ? content.flatMap(text) : []);
const versesBlock = (obj) =>
  obj && Array.isArray(obj.verses)
    ? [{ type: 'verses', reference: obj.reference ?? null, verses: obj.verses.map((v) => ({ n: v.num, text: v.text })) }]
    : [];

let sid = 0;
const section = (kind, title, blocks) => ({ id: `${kind}-${sid++}`, kind, title, blocks: blocks.filter(Boolean) });

function psalmsSection(psalmsIntro, psalms) {
  const blocks = [...text(psalmsIntro)];
  for (const p of psalms ?? []) blocks.push(...versesBlock(p));
  return section('psalms', 'The Psalms', blocks);
}
function gospelSection(g) {
  return section('gospel', 'The Gospel', [...(g?.rubric ? [{ type: 'rubric', text: g.rubric }] : []), ...versesBlock(g)]);
}

function normalize(key, d) {
  sid = 0;
  const sections = [];
  if (d.introduction) sections.push(section('introduction', 'Introduction', text(d.introduction)));
  if (d.opening) sections.push(section('opening', 'Opening Prayer', textBlocks(d.opening.content)));
  if (d.thanksgiving) sections.push(section('thanksgiving', d.thanksgiving.title || 'Thanksgiving', textBlocks(d.thanksgiving.content)));
  if (d.introductoryPsalm) sections.push(section('psalm50', d.introductoryPsalm.title || 'Psalm 50', versesBlock(d.introductoryPsalm)));

  if (Array.isArray(d.watches)) {
    for (const w of d.watches) {
      const label = (suffix) => [w.name, suffix].filter(Boolean).join(' · ');
      const psBlocks = [...text(w.psalmsIntro), ...(w.psalms ?? []).flatMap(versesBlock)];
      if (psBlocks.length) sections.push(section('psalms', label(w.theme ? `The Psalms — ${w.theme}` : 'The Psalms'), psBlocks));
      const goBlocks = [...(w.gospel?.rubric ? [{ type: 'rubric', text: w.gospel.rubric }] : []), ...versesBlock(w.gospel)];
      if (goBlocks.length) sections.push(section('gospel', label('The Gospel'), goBlocks));
      if (w.litanies) sections.push(section('litanies', label('Litanies'), textBlocks(w.litanies.content)));
      if (w.closing) sections.push(section('conclusion', label('Conclusion'), textBlocks(w.closing.content)));
    }
  } else {
    sections.push(psalmsSection(d.psalmsIntro, d.psalms));
    sections.push(gospelSection(d.gospel));
    if (d.litanies) sections.push(section('litanies', d.litanies.title || 'Litanies', textBlocks(d.litanies.content)));
    if (d.lordsPrayer) sections.push(section('lordsPrayer', d.lordsPrayer.title || "The Lord's Prayer", textBlocks(d.lordsPrayer.content)));
  }

  if (d.closing) sections.push(section('conclusion', d.closing.title || 'Conclusion', textBlocks(d.closing.content)));

  return { key, name: d.name, englishName: d.englishName, time: d.traditionalTime, sections };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const index = [];
  for (const [key, hour] of Object.entries(MAP)) {
    const d = await get(`${API}/${hour}`);
    const norm = normalize(key, d);
    await writeFile(join(OUT, `${key}.json`), JSON.stringify(norm));
    index.push({ key, name: norm.name, sections: norm.sections.length });
    process.stdout.write(`· ${key}: ${norm.sections.length} sections\n`);
  }
  await writeFile(
    join(OUT, 'index.json'),
    JSON.stringify({ source: 'coptic.io (used with permission)', offices: index }, null, 2),
  );
  console.log('Done → content/agpeya/hours/');
}

main().catch((e) => {
  console.error('Ingest failed:', e);
  process.exit(1);
});
