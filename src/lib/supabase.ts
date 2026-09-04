/**
 * The Supabase client (lazy, singleton). Created only when configured; uses the
 * **anon** key (never the service role) and persists the session in encrypted
 * device storage (iOS Keychain / Android Keystore via expo-secure-store; chunked
 * to clear SecureStore's 2KB ceiling — see `sessionStorage`) with auto-refresh.
 * Throws if called unconfigured — callers gate on `isBackendConfigured()` first.
 */
import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import { sessionStorage } from './secureStorage';

let client: SupabaseClient | null = null;

/** https anywhere, or http only against a loopback host (local Supabase). */
export function isSecureEndpoint(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol === 'https:') return true;
    if (protocol !== 'http:') return false;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase is not configured (missing SUPABASE_URL / SUPABASE_ANON_KEY).');
    }
    // Everything that crosses this client is sensitive — session tokens, the
    // user's rule and journal, and push tokens. Refuse a plaintext endpoint
    // rather than silently sending them in the clear if a misconfigured or
    // injected `http://` URL ever reaches a build. A loopback host is allowed
    // so `supabase start` still works for local development.
    if (!isSecureEndpoint(SUPABASE_URL)) {
      throw new Error('Supabase URL must use https:// (http is allowed only for localhost).');
    }
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: sessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // native, not web
      },
    });
  }
  return client;
}
