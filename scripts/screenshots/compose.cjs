/**
 * Compose App Store screenshots from real captures.
 *
 * Takes the raw screens captured by `capture.cjs` and frames each one under a
 * caption, at Apple's 6.9" size (1320x2868). The device screen is inset and
 * rounded so the caption has room to breathe, and the whole thing is painted in
 * the app's own palette so the listing looks continuous with the product.
 *
 * These are REAL screens of the running app, not mockups — the only additions
 * are the caption and the surround. That matters: App Store screenshots have to
 * show the app as it actually is.
 *
 * Usage:  node scripts/screenshots/compose.cjs <capturesDir> <outDir>
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const W = 1320;
const H = 2868;

// The app's own codex palette (src/ui/theme.ts).
const INK = '#0C1020';
const INK_2 = '#141A2E';
const GOLD = '#C9A84A';
const GOLD_HI = '#E3C77A';
const PARCH = '#F2E8D5';

/** caption: the promise. sub: the detail. file: the raw capture. */
const SHOTS = [
  { file: '2-faith.png', caption: 'Learn the faith,\nnot just the language', sub: 'Nine units on where the Church began and what it confesses' },
  { file: '3-faith-lesson.png', caption: 'Every claim shows\nits source', sub: 'Tap any citation and read the original — diocesan sites, the Synaxarium, the Fathers' },
  { file: '5-creed.png', caption: 'The Creed assembles\nas you learn it', sub: 'Finish a unit, unseal a clause — earn the whole confession' },
  { file: '1-today.png', caption: 'The day, as the\nChurch keeps it', sub: 'Fasts, feasts, and the saint remembered today' },
  { file: '6-coptic.png', caption: 'Read the tongue\nof the hymns', sub: 'The alphabet, the sounds, and the words of the liturgy' },
  { file: '8-rule.png', caption: 'A rule of life\nyou can actually keep', sub: 'Small and steady. The lamp is tended, not stormed' },
  { file: '7-word.png', caption: 'The whole Bible,\noffline', sub: 'Read, highlight, and keep what speaks to you' },
];

const page = (dataUri, caption, sub) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Spectral:wght@400&display=swap">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${W}px; height:${H}px; }
  body {
    background:
      radial-gradient(120% 60% at 50% 0%, ${INK_2} 0%, ${INK} 62%),
      ${INK};
    display:flex; flex-direction:column; align-items:center;
    font-family:'Cormorant Garamond', Georgia, serif;
    overflow:hidden;
  }
  .cap { padding: 118px 92px 0; text-align:center; }
  h1 {
    font-size: 104px; line-height:1.06; font-weight:600; color:${PARCH};
    letter-spacing:-0.5px; white-space:pre-line;
  }
  .rule { width:132px; height:2px; background:${GOLD}; margin:38px auto 30px; opacity:.85; }
  p {
    font-family:'Spectral', Georgia, serif; font-size:37px; line-height:1.45;
    color:#B9AE99; max-width:1000px; margin:0 auto;
  }
  .device {
    margin-top:64px; width:1000px; border-radius:56px; overflow:hidden;
    border:3px solid rgba(201,168,74,.42);
    box-shadow: 0 44px 120px rgba(0,0,0,.72), 0 0 0 1px rgba(255,255,255,.04);
    background:${INK};
  }
  .device img { display:block; width:100%; }
</style></head><body>
  <div class="cap">
    <h1>${caption}</h1>
    <div class="rule"></div>
    <p>${sub}</p>
  </div>
  <div class="device"><img src="${dataUri}"></div>
</body></html>`;

(async () => {
  // Defaults match capture.cjs, so `npm run screenshots` works with no args.
  const base = path.join(process.cwd(), '.screenshots');
  const inDir = process.argv[2] || path.join(base, 'captures');
  const outDir = process.argv[3] || path.join(base, 'appstore');
  if (!fs.existsSync(inDir)) {
    console.error(`no captures in ${inDir} — run capture.cjs first`);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();

  let n = 0;
  for (const shot of SHOTS) {
    const src = path.join(inDir, shot.file);
    if (!fs.existsSync(src)) {
      console.warn('missing capture, skipping:', shot.file);
      continue;
    }
    const dataUri = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
    await p.setContent(page(dataUri, shot.caption, shot.sub), { waitUntil: 'networkidle' });
    await p.waitForTimeout(700); // let the webfonts settle before painting
    n += 1;
    const out = path.join(outDir, `${String(n).padStart(2, '0')}-${shot.file}`);
    await p.screenshot({ path: out });
    console.log('composed', path.basename(out));
  }
  await b.close();
  console.log(`\n${n} App Store screenshots at ${W}x${H} (6.9") in ${outDir}`);
})();
