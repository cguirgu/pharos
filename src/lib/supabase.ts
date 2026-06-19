/**
 * The Supabase client (lazy, singleton). Created only when configured; uses the
 * **anon** key (never the service role) and persists the session in AsyncStorage
 * with auto-refresh. Throws if called unconfigured — callers gate on
 * `isBackendConfigured()` first.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase is not configured (missing SUPABASE_URL / SUPABASE_ANON_KEY).');
    }
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // native, not web
      },
    });
  }
  return client;
}
