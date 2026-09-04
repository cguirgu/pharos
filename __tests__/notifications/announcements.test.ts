/**
 * Release announcements — the opt-in rules.
 *
 * This is the app's only REMOTE notification channel, and the only promotional
 * one, so App Store guideline 4.5.4 governs it: promotional pushes need an
 * explicit opt-in "via consent language displayed in your app's UI" and an
 * in-app way out. These tests pin the parts of that which are checkable in
 * code — chiefly that silence is the default and that a token never outlives
 * consent.
 */
import {
  DEFAULT_ANNOUNCEMENTS,
  normalizeAnnouncements,
  shouldRegister,
  needsSync,
  CONSENT_TEXT,
  OPTED_IN_TEXT,
  ANNOUNCEMENTS_TITLE,
} from '../../src/domain/notifications/announcements';

describe('the default is silence', () => {
  it('ships opted out, with no token', () => {
    expect(DEFAULT_ANNOUNCEMENTS).toEqual({ enabled: false, token: null });
  });

  it('treats missing or empty stored config as opted out', () => {
    expect(normalizeAnnouncements(null)).toEqual({ enabled: false, token: null });
    expect(normalizeAnnouncements(undefined)).toEqual({ enabled: false, token: null });
    expect(normalizeAnnouncements({})).toEqual({ enabled: false, token: null });
  });

  it('never infers consent from a truthy-ish value', () => {
    // Only a literal `true` counts as opting in — anything else is a bug or a
    // corrupted write, and must not be read as permission to push.
    for (const v of ['true', 1, 'yes', {}, []] as unknown[]) {
      expect(normalizeAnnouncements({ enabled: v as boolean })).toEqual({ enabled: false, token: null });
    }
  });
});

describe('a token never outlives consent', () => {
  it('drops a stored token when not opted in', () => {
    // Guards a partial write leaving a live token behind after an opt-out.
    expect(normalizeAnnouncements({ enabled: false, token: 'ExponentPushToken[abc]' })).toEqual({
      enabled: false,
      token: null,
    });
  });

  it('keeps the token while opted in', () => {
    expect(normalizeAnnouncements({ enabled: true, token: 'ExponentPushToken[abc]' })).toEqual({
      enabled: true,
      token: 'ExponentPushToken[abc]',
    });
  });

  it('opted in without a token yet is valid — registration may still be pending', () => {
    expect(normalizeAnnouncements({ enabled: true })).toEqual({ enabled: true, token: null });
  });

  it('ignores a non-string token', () => {
    expect(normalizeAnnouncements({ enabled: true, token: 42 as unknown as string })).toEqual({
      enabled: true,
      token: null,
    });
  });
});

describe('registration follows consent', () => {
  it('only registers when opted in', () => {
    expect(shouldRegister({ enabled: true, token: null })).toBe(true);
    expect(shouldRegister({ enabled: false, token: null })).toBe(false);
    expect(shouldRegister({ enabled: false, token: 'ExponentPushToken[abc]' })).toBe(false);
  });

  it('syncs a fresh token only while opted in, and only when it changed', () => {
    const on = { enabled: true, token: 'old' };
    expect(needsSync(on, 'new')).toBe(true);
    expect(needsSync(on, 'old')).toBe(false);
    expect(needsSync(on, null)).toBe(false);
    expect(needsSync({ enabled: false, token: null }, 'new')).toBe(false);
  });
});

describe('the consent language exists and says what it must', () => {
  it('states what will be sent, and how often', () => {
    // 4.5.4 asks for consent language, not a bare switch. If someone trims this
    // to "Get notifications", the compliance argument goes with it.
    expect(CONSENT_TEXT.length).toBeGreaterThan(80);
    expect(CONSENT_TEXT.toLowerCase()).toContain('new version');
    expect(CONSENT_TEXT.toLowerCase()).toMatch(/year|often|rarely/);
  });

  it('promises no other use, and names the way out', () => {
    expect(CONSENT_TEXT.toLowerCase()).toContain('turn this off');
    expect(OPTED_IN_TEXT.toLowerCase()).toContain('turn this off');
  });

  it('has a title for the switch', () => {
    expect(ANNOUNCEMENTS_TITLE.trim().length).toBeGreaterThan(0);
  });
});
