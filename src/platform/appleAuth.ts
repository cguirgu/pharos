/**
 * Native Sign in with Apple → Supabase session. Offered alongside Google to
 * satisfy App Review Guideline 4.8 (an equivalent privacy-preserving login).
 *
 * The native module is required LAZILY so importing this file never touches the
 * native binary (the app still loads in Expo Go / unconfigured, where Apple
 * sign-in simply isn't offered). Functions never throw to the UI.
 */
import { getSupabase } from '../lib/supabase';

function appleModule() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('expo-apple-authentication') as typeof import('expo-apple-authentication');
}

/** Whether native Sign in with Apple is available (iOS 13+, real/dev build). */
export async function isAppleAuthAvailable(): Promise<boolean> {
  try {
    return await appleModule().isAvailableAsync();
  } catch {
    return false;
  }
}

export type AppleResult = { ok: true; userId: string } | { ok: false; error: string };

/** Present the Apple sheet, then exchange the identity token for a Supabase session. */
export async function signInWithApple(): Promise<AppleResult> {
  try {
    const AppleAuthentication = appleModule();
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const idToken = credential.identityToken;
    if (!idToken) return { ok: false, error: 'No identity token from Apple' };
    const { data, error } = await getSupabase().auth.signInWithIdToken({ provider: 'apple', token: idToken });
    if (error) return { ok: false, error: error.message };
    const userId = data.user?.id;
    if (!userId) return { ok: false, error: 'No session returned' };
    return { ok: true, userId };
  } catch (e) {
    // The user dismissing the sheet is a non-error.
    if (e && typeof e === 'object' && (e as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
      return { ok: false, error: 'cancelled' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Apple sign-in failed' };
  }
}
