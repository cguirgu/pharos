/**
 * Release notes — the registry the "what's new" sheet reads.
 *
 * These are the checks that keep the sheet from lying: the newest entry must
 * match the version actually being shipped, and every "take me there" link must
 * point at a route that exists. A release entry whose route 404s is worse than
 * no entry at all.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { RELEASES, releaseFor, LATEST_RELEASE } from '../../src/content/releases';

const ROOT = join(__dirname, '..', '..');

/** The `version` string in app.config.ts — the one the sheet compares against. */
function configuredVersion(): string {
  const src = readFileSync(join(ROOT, 'app.config.ts'), 'utf8');
  const m = src.match(/^\s*version: '([^']+)',/m);
  if (!m) throw new Error('could not read version from app.config.ts');
  return m[1]!;
}

/** Every expo-router route the app defines, as router paths. */
function routes(dir = join(ROOT, 'app'), prefix = ''): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return routes(full, `${prefix}/${entry}`);
    if (!/\.tsx?$/.test(entry)) return [];
    const base = entry.replace(/\.tsx?$/, '');
    if (base === '_layout') return [];
    return [base === 'index' ? prefix || '/' : `${prefix}/${base}`];
  });
}

const ALL_ROUTES = routes();

describe('release registry', () => {
  it('is newest-first', () => {
    // The sheet takes RELEASES[0] as "latest"; ordering is load-bearing.
    const versions = RELEASES.map((r) => r.version);
    const sorted = [...versions].sort((a, b) => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < 3; i++) if ((pb[i] ?? 0) !== (pa[i] ?? 0)) return (pb[i] ?? 0) - (pa[i] ?? 0);
      return 0;
    });
    expect(versions).toEqual(sorted);
  });

  it('has no duplicate versions', () => {
    const v = RELEASES.map((r) => r.version);
    expect(new Set(v).size).toBe(v.length);
  });

  it('describes the version actually being shipped', () => {
    // If this fails, someone bumped app.config.ts without writing release notes
    // — and the update would ship with no "what's new" at all.
    expect(releaseFor(configuredVersion())).not.toBeNull();
    expect(LATEST_RELEASE!.version).toBe(configuredVersion());
  });

  it('uses semantic version strings', () => {
    for (const r of RELEASES) expect(r.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('every release is well formed', () => {
  it.each(RELEASES.map((r) => [r.version, r] as const))('%s has a headline and items', (_v, r) => {
    expect(r.headline.trim().length).toBeGreaterThan(10);
    expect(r.items.length).toBeGreaterThan(0);
  });

  it.each(RELEASES.flatMap((r) => r.items.map((i) => [`${r.version} · ${i.title}`, i] as const)))(
    '%s has a title and body',
    (_label, item) => {
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.body.trim().length).toBeGreaterThan(20);
    },
  );

  it('pairs every route with a label, and every label with a route', () => {
    for (const r of RELEASES) {
      for (const i of r.items) {
        expect(Boolean(i.route)).toBe(Boolean(i.routeLabel));
      }
    }
  });
});

describe('release links go somewhere real', () => {
  it('finds the app routes to check against', () => {
    expect(ALL_ROUTES.length).toBeGreaterThan(5);
  });

  const linked = RELEASES.flatMap((r) =>
    r.items.filter((i) => i.route).map((i) => [`${r.version} · ${i.title}`, i.route!] as const),
  );

  it.each(linked)('%s → %s exists', (_label, route) => {
    // '/(tabs)/faith' is defined by app/(tabs)/faith.tsx; dynamic segments are
    // compared by shape so '/faith/creed' matches its literal file.
    const normalised = route.replace(/\/$/, '');
    const matches = ALL_ROUTES.some((r) => {
      if (r === normalised) return true;
      const rp = r.split('/');
      const np = normalised.split('/');
      if (rp.length !== np.length) return false;
      return rp.every((seg, i) => seg === np[i] || /^\[.+\]$/.test(seg));
    });
    expect(`${route}: ${matches}`).toBe(`${route}: true`);
  });
});
