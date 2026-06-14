/**
 * Ingest the Coptic Synaxarium from randogoth/coptic-synaxarium (Codeberg) into
 * the app's content format, keyed by Coptic month/day.
 *
 * Source: https://codeberg.org/randogoth/coptic-synaxarium (stated "free to use").
 * The English text derives from a translation by St. George Coptic Orthodox
 * Church, Chicago. ⚠️ The underlying translation's copyright is NOT formally
 * cleared — entries are marked `draft: true`; confirm permission before release
 * (see docs/CONTENT-SOURCES.md). No text is printed by this script.
 *
 * Output: content/synaxarium/synaxarium.json  →  { "<month>-<day>": { feasts, life } }
 * Run:  node scripts/ingest-synaxarium.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SRC = 'https://codeberg.org/randogoth/coptic-synaxarium/raw/branch/master/synaxarium_coptic.json';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'synaxarium');

// Source month spellings (in order) → Coptic month number 1–13.
const MONTHS = ['Tout', 'Baba', 'Hator', 'Kiahk', 'Toba', 'Amshir', 'Baramhat', 'Baramouda', 'Bashans', 'Paona', 'Epep', 'Mesra', 'Nasie'];

/** Strip HTML to readable plain text (paragraphs → blank lines). */
function stripHtml(html) {
  return String(html)
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(`${res.status} ${SRC}`);
  const src = await res.json();

  const out = {};
  let count = 0;
  for (const [key, entry] of Object.entries(src)) {
    const m = key.match(/^(\d+)\s+(.+)$/);
    if (!m) continue;
    const day = Number(m[1]);
    const monthIdx = MONTHS.indexOf(m[2].trim());
    if (monthIdx < 0) {
      console.warn('unknown month:', m[2]);
      continue;
    }
    const month = monthIdx + 1;
    out[`${month}-${day}`] = {
      feasts: Array.isArray(entry.feasts) ? entry.feasts : [],
      life: stripHtml(entry.description ?? ''),
    };
    count++;
  }

  const payload = {
    source: 'randogoth/coptic-synaxarium (Codeberg)',
    attribution: 'English translation: St. George Coptic Orthodox Church, Chicago',
    draft: true,
    days: out,
  };
  await writeFile(join(OUT, 'synaxarium.json'), JSON.stringify(payload));
  console.log(`Done: ${count} days → content/synaxarium/synaxarium.json`);
}

main().catch((e) => {
  console.error('Ingest failed:', e);
  process.exit(1);
});
