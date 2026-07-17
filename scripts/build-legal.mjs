/**
 * Emit the public legal pages from the canonical source (src/content/legal.ts)
 * into web/legal/** so they can be hosted and pasted into the App Store privacy
 * field.
 *
 *   node scripts/build-legal.mjs
 *
 * Re-run after editing src/content/legal.ts. The app screens read the same source,
 * so the in-app text and the hosted pages can never drift.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = path.join(root, 'src/content/legal.ts');
const outDir = path.join(root, 'web/legal');

// Transpile the (self-contained) TS source to JS in memory, then import it.
const js = ts.transpileModule(fs.readFileSync(srcPath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const tmp = path.join(root, 'web', `.legal.tmp.${Date.now()}.mjs`);
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, js);
const { PRIVACY, TERMS, LEGAL_META } = await import(pathToFileURL(tmp));
fs.rmSync(tmp);

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderDoc(doc, selfPath) {
  const other = selfPath === 'privacy' ? ['terms', 'Terms of Service'] : ['privacy', 'Privacy Policy'];
  const sections = doc.sections
    .map((s) => {
      const body = (s.body || []).map((p) => `      <p>${esc(p)}</p>`).join('\n');
      const list = s.bullets?.length
        ? `      <ul>\n${s.bullets.map((b) => `        <li>${esc(b)}</li>`).join('\n')}\n      </ul>`
        : '';
      return `      <h2>${esc(s.heading)}</h2>\n${body}${list ? '\n' + list : ''}`;
    })
    .join('\n');
  const intro = doc.intro.map((p) => `      <p class="lead">${esc(p)}</p>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index,follow" />
  <title>${esc(doc.title)} — ${esc(LEGAL_META.appName)}</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; background: #0C1020; color: #ECE4D2;
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.6; -webkit-font-smoothing: antialiased;
    }
    .wrap { max-width: 720px; margin: 0 auto; padding: 56px 24px 96px; }
    header { display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
      border-bottom: 1px solid rgba(201,168,74,0.22); padding-bottom: 20px; margin-bottom: 28px; }
    .brand { font-size: 13px; letter-spacing: 0.32em; text-transform: uppercase; color: #C9A84A; }
    nav a { color: #B7AE96; text-decoration: none; font-size: 13px; }
    nav a:hover { color: #C9A84A; }
    h1 { font-size: 30px; margin: 8px 0 2px; color: #E7CE84; }
    .updated { color: #7C745F; font-size: 13px; margin: 0 0 24px; }
    h2 { font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; color: #C9A84A;
      margin: 34px 0 8px; }
    p { color: #B7AE96; margin: 10px 0; }
    p.lead { color: #ECE4D2; }
    ul { color: #B7AE96; margin: 8px 0 0; padding-left: 20px; }
    li { margin: 6px 0; }
    a { color: #C9A84A; }
    footer { margin-top: 56px; padding-top: 20px; border-top: 1px solid rgba(201,168,74,0.22);
      color: #7C745F; font-size: 13px; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <span class="brand">${esc(LEGAL_META.appName)}</span>
      <nav><a href="../${other[0]}/">${esc(other[1])}</a></nav>
    </header>
    <main>
      <h1>${esc(doc.title)}</h1>
      <p class="updated">Effective ${esc(LEGAL_META.effectiveDate)}</p>
${intro}
${sections}
    </main>
    <footer>© ${esc(LEGAL_META.appName)} · ${esc(LEGAL_META.contactEmail)}</footer>
  </div>
</body>
</html>
`;
}

function renderIndex() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Legal — ${esc(LEGAL_META.appName)}</title>
<style>body{margin:0;background:#0C1020;color:#ECE4D2;font-family:Georgia,serif;line-height:1.6}
.wrap{max-width:720px;margin:0 auto;padding:64px 24px}.brand{font-size:13px;letter-spacing:.32em;text-transform:uppercase;color:#C9A84A}
h1{color:#E7CE84}a{color:#C9A84A;display:block;margin:14px 0;font-size:18px}</style></head>
<body><div class="wrap"><div class="brand">${esc(LEGAL_META.appName)}</div><h1>Legal</h1>
<a href="./privacy/">Privacy Policy →</a><a href="./terms/">Terms of Service →</a></div></body></html>
`;
}

const pages = [
  ['privacy', renderDoc(PRIVACY, 'privacy')],
  ['terms', renderDoc(TERMS, 'terms')],
];
for (const [name, html] of pages) {
  const dir = path.join(outDir, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('wrote', path.relative(root, path.join(dir, 'index.html')));
}
fs.writeFileSync(path.join(outDir, 'index.html'), renderIndex());
console.log('wrote', path.relative(root, path.join(outDir, 'index.html')));
