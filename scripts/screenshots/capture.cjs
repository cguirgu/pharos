const { chromium } = require('playwright');
const OUT = process.env.CLAUDE_JOB_DIR + '/tmp/shots2';
require('fs').mkdirSync(OUT, { recursive: true });
// App Store 6.9" (iPhone 16 Pro Max) is 1320x2868 -> 440x956 CSS at DPR 3.
const VIEW = { width: 440, height: 956 };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: VIEW, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  const guest = p.getByText('CONTINUE WITHOUT AN ACCOUNT', { exact: false }).first();
  if (await guest.count()) { await guest.click(); await p.waitForTimeout(1500); }

  const shot = async (name) => {
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/${name}.png` });
    console.log('captured', name);
  };
  const go = async (route, name) => {
    await p.goto('http://localhost:8099' + route, { waitUntil: 'networkidle' });
    await p.waitForTimeout(2600);
    await shot(name);
  };

  await go('/today', '1-today');
  await go('/faith', '2-faith');

  // Into the first Faith lesson — the teaching card with its source citation.
  await p.goto('http://localhost:8099/faith', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2600);
  const lesson = p.getByText('Egypt Before the Church', { exact: false }).first();
  if (await lesson.count()) { await lesson.click().catch(() => {}); await p.waitForTimeout(2200); }
  await shot('3-faith-lesson');

  // Advance to a question to show the quiz + explanation.
  for (const label of ['GO ON', 'Go on']) {
    const el = p.getByText(label, { exact: false }).first();
    if (await el.count() && await el.isVisible().catch(() => false)) {
      await el.click().catch(() => {}); await p.waitForTimeout(1400);
      const el2 = p.getByText(label, { exact: false }).first();
      if (await el2.count() && await el2.isVisible().catch(() => false)) { await el2.click().catch(() => {}); await p.waitForTimeout(1400); }
      break;
    }
  }
  await shot('4-faith-question');

  await go('/faith/creed', '5-creed');
  await go('/coptic', '6-coptic');
  await go('/word', '7-word');
  await go('/rule', '8-rule');
  await go('/you', '9-you');

  await b.close();
})();
