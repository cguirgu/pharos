#!/usr/bin/env node
/**
 * Send a release announcement to everyone who opted in.
 *
 * Reads `push_tokens` with the SERVICE-ROLE key (the table has no select policy,
 * so nothing else can read it) and posts to Expo's push service in batches.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/announce.mjs --version 1.2.0 [--dry-run] [--yes]
 *
 * The message is NOT typed on the command line — it comes from the matching
 * entry in `src/content/releases.ts`, so the push, the in-app "what's new"
 * sheet, and the App Store notes cannot drift apart. `--version` just picks
 * which entry to send.
 *
 * Safety:
 *  • Dry-run by default in spirit: it always prints the exact message and the
 *    recipient count and waits for confirmation unless `--yes` is passed.
 *  • Devices already running the target version are skipped — telling someone
 *    about a feature they already have is noise.
 *  • Tokens Expo reports as dead (DeviceNotRegistered) are pruned automatically.
 *
 * ⚠️ The service-role key bypasses RLS entirely. Keep it out of the repo, out
 * of app config, and out of EAS build env. It belongs in your shell for the
 * minute it takes to run this, and nowhere else.
 */
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH = 100; // Expo's documented maximum per request

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const die = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

/**
 * Pull the release out of src/content/releases.ts without a TypeScript build:
 * the file is a plain literal, so the fields can be read directly. Keeping this
 * dependency-free means the script runs from a clean checkout.
 */
function readRelease(version) {
  const src = readFileSync(new URL('../src/content/releases.ts', import.meta.url), 'utf8');
  const start = src.indexOf(`version: '${version}'`);
  if (start === -1) return null;
  const headline = /headline:\s*\n?\s*'((?:[^'\\]|\\.)*)'/.exec(src.slice(start));
  if (!headline) return null;
  return { version, headline: headline[1].replace(/\\'/g, "'") };
}

async function main() {
  const version = value('version');
  if (!version) die('missing --version (e.g. --version 1.2.0)');

  const release = readRelease(version);
  if (!release) die(`no entry for ${version} in src/content/releases.ts — add the release notes first`);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) die('set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment');

  // Read every opted-in device except those already on this version.
  const res = await fetch(
    `${url}/rest/v1/push_tokens?select=token,app_version&app_version=not.eq.${encodeURIComponent(version)}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) die(`could not read push_tokens (${res.status}): ${await res.text()}`);
  const rows = await res.json();
  const tokens = [...new Set(rows.map((r) => r.token).filter(Boolean))];

  const title = `New in ${version}`;
  const body = release.headline;

  console.log('\n  ┌─ Release announcement ────────────────────────────');
  console.log(`  │ Title      ${title}`);
  console.log(`  │ Body       ${body}`);
  console.log(`  │ Recipients ${tokens.length} device(s) not already on ${version}`);
  console.log('  └───────────────────────────────────────────────────\n');

  if (tokens.length === 0) {
    console.log('Nobody to notify. Done.\n');
    return;
  }
  if (flag('dry-run')) {
    console.log('Dry run — nothing sent.\n');
    return;
  }
  if (!flag('yes')) {
    const rl = createInterface({ input: stdin, output: stdout });
    const answer = await rl.question(`Send to ${tokens.length} device(s)? [y/N] `);
    rl.close();
    if (answer.trim().toLowerCase() !== 'y') return console.log('Cancelled.\n');
  }

  const dead = [];
  let sent = 0;
  for (let i = 0; i < tokens.length; i += BATCH) {
    const slice = tokens.slice(i, i + BATCH);
    const payload = slice.map((to) => ({
      to,
      title,
      body,
      sound: 'default',
      // The app can read this to jump straight to the what's-new sheet.
      data: { kind: 'release', version },
    }));
    const push = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip, deflate' },
      body: JSON.stringify(payload),
    });
    if (!push.ok) {
      console.error(`  batch ${i / BATCH + 1} failed (${push.status}): ${await push.text()}`);
      continue;
    }
    const { data = [] } = await push.json();
    data.forEach((ticket, n) => {
      if (ticket.status === 'ok') sent += 1;
      else if (ticket.details?.error === 'DeviceNotRegistered') dead.push(slice[n]);
      else console.error(`  ${slice[n]}: ${ticket.message ?? ticket.status}`);
    });
    console.log(`  batch ${Math.floor(i / BATCH) + 1}: ${slice.length} queued`);
  }

  // Prune tokens Expo says are gone, so the list does not rot over time.
  if (dead.length) {
    const q = dead.map((t) => `"${t}"`).join(',');
    await fetch(`${url}/rest/v1/push_tokens?token=in.(${encodeURIComponent(q)})`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    }).catch(() => {});
    console.log(`  pruned ${dead.length} dead token(s)`);
  }

  console.log(`\n✔ ${sent} notification(s) accepted by Expo.\n`);
}

main().catch((e) => die(e.message));
