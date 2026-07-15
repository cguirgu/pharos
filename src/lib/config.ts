/**
 * Backend + auth configuration, read from `app.config.ts` `extra` (injected from
 * env / EAS secrets — never committed). When Supabase isn't configured the app
 * falls back to the local dev store + a local dev sign-in, so it still runs in
 * Expo Go without keys.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

/** A non-empty string, or null (treats '', objects, undefined as "not set"). */
const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null);

export const SUPABASE_URL = str(extra.supabaseUrl);
export const SUPABASE_ANON_KEY = str(extra.supabaseAnonKey);
export const GOOGLE_IOS_CLIENT_ID = str(extra.googleIosClientId);
export const GOOGLE_WEB_CLIENT_ID = str(extra.googleWebClientId);
export const REVENUECAT_IOS_KEY = str(extra.revenueCatIosKey);

/** True when the app should talk to Supabase (keys present). */
export function isBackendConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** True when in-app purchases (the optional "Support the app" flow) are wired. */
export function isPurchasesConfigured(): boolean {
  return Boolean(REVENUECAT_IOS_KEY);
}
