/**
 * Guards the project's first house rule (README + docs/ARCHITECTURE.md):
 *
 *   `src/domain` is pure TypeScript — it imports nothing from react/react-native/
 *   expo, and it never calls `new Date()`.
 *
 * The liturgical and Rule engines have to be provable on any date with `npm test`
 * alone, so today is injected (src/domain/coptic/clock.ts) and the one real system
 * clock lives in src/platform. This test makes a violation a CI failure a
 * contributor can see and fix themselves, instead of something a reviewer has to
 * catch by eye.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const DOMAIN_DIR = join(__dirname, '..', '..', 'src', 'domain');

/** Every .ts/.tsx file under src/domain, as paths relative to src/domain. */
function domainFiles(dir = DOMAIN_DIR, prefix = ''): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(full).isDirectory()) return domainFiles(full, rel);
    return /\.tsx?$/.test(entry) ? [rel] : [];
  });
}

const FORBIDDEN_MODULES = /from\s+['"](react|react-native|react-dom|expo|expo-[\w-]+|@expo\/[\w-]+|@react-native[\w/-]*)['"]/;
const FORBIDDEN_REQUIRE = /require\(\s*['"](react|react-native|react-dom|expo|expo-[\w-]+|@expo\/[\w-]+|@react-native[\w/-]*)['"]\s*\)/;
const NEW_DATE = /new\s+Date\s*\(/;

const files = domainFiles();

describe('src/domain purity', () => {
  it('finds domain source files to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s imports nothing from react/react-native/expo', (file) => {
    const source = readFileSync(join(DOMAIN_DIR, file), 'utf8');
    expect(source).not.toMatch(FORBIDDEN_MODULES);
    expect(source).not.toMatch(FORBIDDEN_REQUIRE);
  });

  it.each(files)('%s never calls new Date()', (file) => {
    const source = readFileSync(join(DOMAIN_DIR, file), 'utf8');
    // Strip comments first: the rule is about executed code, and several files
    // legitimately mention `new Date()` while explaining why they don't call it.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(NEW_DATE);
  });
});
