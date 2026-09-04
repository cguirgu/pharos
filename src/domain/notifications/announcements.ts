/**
 * Release announcements — the one notification channel that is REMOTE.
 *
 * Every other channel in this app is a local, scheduled cue. This one is a push
 * sent from a server when a new version ships, which puts it squarely under
 * App Store Review **guideline 4.5.4**:
 *
 *   "Push Notifications ... should not be used for promotions or direct
 *    marketing purposes unless customers have explicitly opted in to receive
 *    them via consent language displayed in your app's UI, and you provide a
 *    method in your app for a user to opt out from receiving such messages."
 *
 * A "we shipped a new feature" push is promotional. So the design is fixed by
 * that rule, not by preference:
 *
 *   1. **Off by default.** `DEFAULT_ANNOUNCEMENTS.enabled` is false. Silence is
 *      the state a user who has never been asked must be left in.
 *   2. **Explicit consent language, in the UI.** `CONSENT_TEXT` below is shown
 *      beside the switch — it says what will be sent and how often, before the
 *      switch is touched. It is not buried in a privacy policy.
 *   3. **An opt-out in the app.** The same switch, always reachable from the
 *      reminders screen. Turning it off deletes the stored token.
 *
 * Pure module: no React, no network. The token lifecycle lives in
 * `src/platform/pushToken.ts`, the storage in Supabase (`push_tokens`).
 */

/** Persisted per device, alongside the local notification config. */
export interface AnnouncementConfig {
  /** True only after a deliberate opt-in. Never defaulted true. */
  readonly enabled: boolean;
  /** The Expo push token last registered, or null when opted out. */
  readonly token: string | null;
}

export const DEFAULT_ANNOUNCEMENTS: AnnouncementConfig = { enabled: false, token: null };

/** The title shown on the reminders screen. */
export const ANNOUNCEMENTS_TITLE = 'New features';

/**
 * The consent language guideline 4.5.4 requires to be displayed in the UI.
 * Shown next to the switch, before it is turned on — it must state plainly what
 * is being agreed to, and be honest about frequency.
 */
export const CONSENT_TEXT =
  'Get a notification when a new version of the app adds something — a few times a year at most, and never anything else. No daily prompts, no marketing, and nothing shared with anyone. You can turn this off here at any time.';

/** Shown once the switch is on, so the opt-out is never hidden. */
export const OPTED_IN_TEXT = 'On. Turn this off any time and your device is removed from the list.';

/** Merge a stored (possibly absent or partial) config onto the default. */
export function normalizeAnnouncements(
  stored: Partial<AnnouncementConfig> | null | undefined,
): AnnouncementConfig {
  return {
    enabled: stored?.enabled === true,
    // A token is only meaningful while opted in; drop it otherwise so a stale
    // token can never be left behind by a partial write.
    token: stored?.enabled === true && typeof stored?.token === 'string' ? stored.token : null,
  };
}

/** Whether this device should currently be registered to receive pushes. */
export function shouldRegister(config: AnnouncementConfig): boolean {
  return config.enabled;
}

/** Whether the stored token needs writing to the backend (opted in, and changed). */
export function needsSync(config: AnnouncementConfig, freshToken: string | null): boolean {
  if (!config.enabled) return false;
  if (!freshToken) return false;
  return config.token !== freshToken;
}
