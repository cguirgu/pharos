const { chromium } = require('playwright');
// Every option label the onboarding flow offers, across all screens.
const OPTIONS = [
  'I grew up in the Church', 'Keep the fasts & feasts', 'New to it', 'Some experience',
  'It is part of my life', 'Pray the hours', 'Read the Word daily',
  'Yes, remind me', 'Not now', 'Morning', 'Evening', 'A few minutes',
  'Pray the Agpeya', 'Keep the fasts', 'A saint each day',
];
async function onboard(p) {
  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(4000);
  const guest = p.getByText('CONTINUE WITHOUT AN ACCOUNT', { exact: false }).first();
  if (await guest.count()) { await guest.click(); await p.waitForTimeout(1200); }
  for (let step = 0; step < 25 && p.url().includes('onboarding'); step++) {
    for (const label of OPTIONS) {
      const el = p.getByText(label, { exact: false }).first();
      if (await el.count() > 0 && await el.isVisible().catch(() => false)) {
        await el.click().catch(() => {}); await p.waitForTimeout(300); break;
      }
    }
    for (const i of await p.locator('input').all()) {
      if (await i.isVisible().catch(() => false) && !(await i.inputValue().catch(() => 'x'))) {
        await i.fill('Tina').catch(() => {}); await p.waitForTimeout(200);
      }
    }
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(300);
    const before = await p.evaluate(() => document.body.innerText.slice(0, 150));
    for (const label of ['CONTINUE', 'BEGIN', 'DONE', 'NEXT', 'SKIP', 'ENTER', 'START', 'SET', 'KEEP', 'LIGHT THE LAMP']) {
      const el = p.getByText(label, { exact: false }).first();
      if (await el.count() > 0 && await el.isVisible().catch(() => false)) {
        await el.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(1300); break;
      }
    }
    // Deliberately no early break on unchanged text: some screens legitimately
    // look the same after a toggle, and bailing early left onboarding unfinished.
  }
  // Belt and braces — the last screen's button is distinctive, so if we are
  // still here, press it directly until the flow leaves onboarding.
  for (let i = 0; i < 4 && p.url().includes('onboarding'); i++) {
    const el = p.getByText('LIGHT THE LAMP', { exact: false }).first();
    if (!(await el.count())) break;
    await el.click({ timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(1800);
  }
  return p.url();
}
module.exports = { onboard };
if (require.main === module) {
  (async () => {
    const b = await chromium.launch();
    const p = await (await b.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 })).newPage();
    console.log('ended at', await onboard(p));
    console.log((await p.evaluate(() => document.body.innerText.replace(/\n+/g, ' | ').slice(0, 300))));
    await b.close();
  })();
}
