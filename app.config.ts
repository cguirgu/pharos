import type { ExpoConfig } from 'expo/config';

/**
 * Pharos Expo config.
 *
 * The EAS project is already created; its id is injected via
 * `extra.eas.projectId` (linked with `eas init --id …`). Visual identity uses
 * the codex palette — splash is the gold beacon on oxford ink (#0C1020).
 *
 * The app icon (assets/icon.png, 1024×1024, the gold beacon on oxford ink) is
 * the App Store marketing icon; Expo derives every smaller size from it. The
 * splash (assets/splash.png) recomposites that same beacon onto oxford ink so
 * the launch screen fades seamlessly into the app background.
 * TODO(fonts): bundle Noto Sans Coptic .ttf for the ornament glyphs; the two
 * Latin families load at runtime via @expo-google-fonts.
 */
const config: ExpoConfig = {
  name: 'Pharos',
  // Must match the slug of the EAS project referenced by extra.eas.projectId.
  slug: 'pharos-coptic-orthodox-friend',
  scheme: 'pharos',
  version: '0.1.0',
  // EAS Update: OTA channel + runtime version (tied to `version` above).
  runtimeVersion: { policy: 'appVersion' },
  updates: {
    url: 'https://u.expo.dev/eab8c3fa-f2dc-498b-a065-91f799b0930d',
  },
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0C1020',
  icon: './assets/icon.png',
  ios: {
    bundleIdentifier: 'com.pharos.app',
    supportsTablet: false,
    infoPlist: {
      // Optional Supabase account sync + Google sign-in use only standard HTTPS/
      // TLS, which is exempt from US export-encryption filing — so this stays
      // false. (The app still runs fully local when no backend keys are set.)
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.pharos.app',
    // Falls back to the shared `icon` until a transparent adaptive-icon
    // foreground is supplied; that's enough to build (not yet Play-submit ready).
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#0C1020',
    },
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-audio',
    [
      'expo-splash-screen',
      {
        image: './assets/splash.png',
        imageWidth: 240,
        backgroundColor: '#0C1020',
        resizeMode: 'contain',
      },
    ],
    [
      'expo-notifications',
      {
        // Reminders are local only; copy is warm, never shaming.
        color: '#C9A84A', // gold accent on Android
      },
    ],
    'expo-secure-store',
    [
      '@react-native-google-signin/google-signin',
      {
        // The iOS reversed-client-id URL scheme (from the Google iOS OAuth
        // client). Provide via the GOOGLE_IOS_URL_SCHEME env / EAS secret.
        iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME ?? 'com.googleusercontent.apps.PLACEHOLDER',
      },
    ],
  ],
  // typedRoutes is intentionally OFF: its generated route union only refreshes
  // under `expo start`, which made `tsc` reject valid new routes. Hrefs are
  // plain strings, validated at runtime and by the bundle.
  experiments: {
    typedRoutes: false,
  },
  extra: {
    eas: {
      projectId: 'eab8c3fa-f2dc-498b-a065-91f799b0930d',
    },
    // Backend + auth keys (injected from env / EAS secrets; never committed).
    // When supabaseUrl + supabaseAnonKey are present the app runs against
    // Supabase with Google sign-in; otherwise it falls back to the local dev
    // store + a local dev sign-in (so it still runs in Expo Go without keys).
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
    googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID || null,
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID || null,
  },
};

export default config;
