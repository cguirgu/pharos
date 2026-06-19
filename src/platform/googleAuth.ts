/**
 * Native Google Sign-In → Supabase session. The native module is required
 * LAZILY (inside the functions) so merely importing this file never touches the
 * native binary — the app still loads in Expo Go when unconfigured; these
 * functions only run in configured (dev/EAS build) mode.
 */
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '../lib/config';
import { getSupabase } from '../lib/supabase';

let configured = false;

function googleModule() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
}

function ensureConfigured(): void {
  if (configured) return;
  googleModule().GoogleSignin.configure({
    iosClientId: GOOGLE_IOS_CLIENT_ID ?? undefined,
    webClientId: GOOGLE_WEB_CLIENT_ID ?? undefined,
  });
  configured = true;
}

export type GoogleResult = { ok: true; userId: string } | { ok: false; error: string };

/** Open the native Google sheet, then exchange the ID token for a Supabase session. */
export async function signInWithGoogle(): Promise<GoogleResult> {
  try {
    ensureConfigured();
    const { GoogleSignin } = googleModule();
    await GoogleSignin.hasPlayServices();
    const resp = await GoogleSignin.signIn();
    if (resp.type !== 'success') return { ok: false, error: 'cancelled' };
    const idToken = resp.data.idToken;
    if (!idToken) return { ok: false, error: 'No ID token from Google' };
    const { data, error } = await getSupabase().auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) return { ok: false, error: error.message };
    const userId = data.user?.id;
    if (!userId) return { ok: false, error: 'No session returned' };
    return { ok: true, userId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Google sign-in failed' };
  }
}

export async function googleSignOut(): Promise<void> {
  try {
    ensureConfigured();
    await googleModule().GoogleSignin.signOut();
  } catch {
    // best-effort
  }
}
