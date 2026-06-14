/**
 * Ingest the Agpeya per-hour SCRIPTURE REFERENCES (which Psalms + Gospel each
 * hour prays) from coptic.io — **references only**, never the prayer prose.
 *
 * Rationale: coptic.io's prayer TEXT ships with no source/license, so we do not
 * redistribute it. The per-hour scripture *references* are factual structure;
 * we render the verses from our public-domain KJV. The non-scripture prayers
 * (litanies, etc.) remain placeholders pending a permitted Agpeya source.
 * (See docs/CONTENT-SOURCES.md.)
 *
 * Output: content/agpeya/references.json  →  { <office>: { psalm50, psalms[], gospels[] } }
 * Run:  node scripts/ingest-agpeya-refs.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API = 'https://api.coptic.io/api/agpeya';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'agpeya');

// my office key → coptic.io hour id
const MAP = { matins: 'midnight', prime: 'prime', terce: 'terce', sext: 'sext', none: 'none', vespers: 'vespers', compline: 'compline' };

const get = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};
const ref = (x) => (x && typeof x.reference === 'string' ? x.reference : null);
const psalmRefs = (arr) => (Array.isArray(arr) ? arr.map(ref).filter(Boolean) : []);

async function main() {
  await mkdir(OUT, { recursive: true });
  const out = {};
  for (const [office, hour] of Object.entries(MAP)) {
    const d = await get(`${API}/${hour}`);
    if (Array.isArray(d.watches)) {
      // Midnight → Matins: combine the three watches.
      const psalms = [];
      const gospels = [];
      for (const w of d.watches) {
        psalms.push(...psalmRefs(w.psalms));
        if (ref(w.gospel)) gospels.push(ref(w.gospel));
      }
      out[office] = { psalm50: ref(d.introductoryPsalm), psalms, gospels };
    } else {
      out[office] = {
        psalm50: ref(d.introductoryPsalm),
        psalms: psalmRefs(d.psalms),
        gospels: ref(d.gospel) ? [ref(d.gospel)] : [],
      };
    }
    process.stdout.write(`· ${office}: ${out[office].psalms.length} psalms, ${out[office].gospels.length} gospel(s)\n`);
  }

  await writeFile(
    join(OUT, 'references.json'),
    JSON.stringify(
      { source: 'coptic.io (references/structure only; verse text rendered from KJV)', draft: true, offices: out },
      null,
      2,
    ),
  );
  console.log('Done → content/agpeya/references.json');
}

main().catch((e) => {
  console.error('Ingest failed:', e);
  process.exit(1);
});
