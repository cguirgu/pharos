/**
 * Encrypted, chunked storage adapter for the Supabase auth session.
 *
 * Why: Supabase persists the session (JWT access + refresh tokens) through a
 * pluggable storage interface. The default AsyncStorage is plain-text on disk —
 * on a compromised device the tokens can be lifted. expo-secure-store backs onto
 * the iOS Keychain / Android Keystore, so tokens are encrypted at rest.
 *
 * SecureStore warns/refuses above ~2048 bytes per value, and a Supabase session
 * (especially with Apple user_metadata) can exceed that, so we transparently
 * CHUNK large values across several Keychain entries and reassemble on read.
 *
 * Web has no SecureStore — Expo web falls back to AsyncStorage (the prior
 * behaviour), which is acceptable since the app's primary target is native iOS.
 *
 * Shape matches what `createClient({ auth: { storage } })` expects:
 * `{ getItem, setItem, removeItem }`, all async.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/** Chunk size in UTF-16 code units. Kept well under the 2048-byte ceiling so
 *  even multi-byte content per chunk stays within the Keychain item limit. */
const CHUNK_SIZE = 1800;
/** Head-value marker: a chunked value stores `__chunks__<n>` at the base key. */
const CHUNK_MARKER = '__chunks__';

export interface SessionStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Delete any chunk entries for `key` implied by the current head value. */
async function clearChunks(key: string): Promise<void> {
  const head = await SecureStore.getItemAsync(key);
  if (head && head.startsWith(CHUNK_MARKER)) {
    const count = parseInt(head.slice(CHUNK_MARKER.length), 10) || 0;
    for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
  }
}

const secureStorage: SessionStorage = {
  async getItem(key) {
    const head = await SecureStore.getItemAsync(key);
    if (head == null) return null;
    if (!head.startsWith(CHUNK_MARKER)) return head; // single, unchunked value
    const count = parseInt(head.slice(CHUNK_MARKER.length), 10) || 0;
    let out = '';
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part == null) return null; // partial/corrupt → treat as no session
      out += part;
    }
    return out;
  },

  async setItem(key, value) {
    await clearChunks(key); // drop stale chunks from a previous larger value
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(key, `${CHUNK_MARKER}${count}`);
  },

  async removeItem(key) {
    await clearChunks(key);
    await SecureStore.deleteItemAsync(key);
  },
};

/** AsyncStorage adapter for web (SecureStore is native-only). */
const webStorage: SessionStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

/** The session storage to hand to the Supabase client for this platform. */
export const sessionStorage: SessionStorage = Platform.OS === 'web' ? webStorage : secureStorage;
