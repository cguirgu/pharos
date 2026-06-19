/**
 * Backend + auth configuration, read from `app.config.ts` `extra` (injected from
 * env / EAS secrets — never committed). When Supabase isn't configured the app
 * falls back to the local dev store + a local dev sign-in, so it still runs in
 * Expo Go without keys.
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | null | undefined>;

export const SUPABASE_URL = extra.supabaseUrl ?? null;
export const SUPABASE_ANON_KEY = extra.supabaseAnonKey ?? null;
export const GOOGLE_IOS_CLIENT_ID = extra.googleIosClientId ?? null;
export const GOOGLE_WEB_CLIENT_ID = extra.googleWebClientId ?? null;

/** True when the app should talk to Supabase (keys present). */
export function isBackendConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
