/**
 * Push-token registration — the device half of release announcements.
 *
 * This is the ONLY place the app talks to a remote notification service. Every
 * other cue in the app is a local scheduled notification that never leaves the
 * phone, which is why this file is small and deliberately fenced:
 *
 *  • It does nothing at all unless the user has opted in (guideline 4.5.4).
 *  • It writes to `push_tokens` with the ANON key. That table has no select
 *    policy, so this client can register and unregister a token but can never
 *    read anyone's — including its own.
 *  • Failure is always silent and non-blocking. A device that cannot register
 *    simply does not get announcements; nothing in the app should break, and
 *    the user should never see an error about a feature they opted into.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getSupabase } from '../lib/supabase';
import { APP_VERSION } from '../lib/config';
import { ensurePermission } from './notifications';

/** The EAS project id, which getExpoPushTokenAsync needs to mint a token. */
function projectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId;
}

/**
 * Ask the OS for a push token. Returns null when permission is refused, when
 * running somewhere tokens cannot be minted (Expo Go, simulator), or on any
 * error — all of which are ordinary, not exceptional.
 */
export async function getPushToken(): Promise<string | null> {
  try {
    if (!(await ensurePermission())) return null;
    const id = projectId();
    if (!id) return null;
    const res = await Notifications.getExpoPushTokenAsync({ projectId: id });
    return res.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Record this device as opted in. Upserts, so re-registering after a token
 * rotation or a version bump refreshes the row rather than duplicating it.
 * Returns the token on success, null if nothing was stored.
 */
export async function registerPushToken(accountId: string | null): Promise<string | null> {
  const token = await getPushToken();
  if (!token) return null;
  try {
    // Throws on a local-only build with no backend keys — caught below.
    const sb = getSupabase();
    const { error } = await sb.from('push_tokens').upsert(
      {
        token,
        // Only ever a real auth user id; the guest sentinel is not one.
        account_id: accountId,
        platform: Platform.OS,
        app_version: APP_VERSION,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' },
    );
    if (error) return null;
    return token;
  } catch {
    return null;
  }
}

/**
 * The opt-out. Deletes this device's row so it stops receiving announcements.
 * Best-effort: if the delete fails the local switch still goes off, and the row
 * is cleaned up the next time the device registers or the send script prunes.
 */
export async function unregisterPushToken(token: string | null): Promise<void> {
  if (!token) return;
  try {
    const sb = getSupabase();
    await sb.from('push_tokens').delete().eq('token', token);
  } catch {
    // Silent by design — see the header.
  }
}
