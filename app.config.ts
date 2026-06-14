import type { ExpoConfig } from 'expo/config';

/**
 * Pharos Expo config.
 *
 * The EAS project is already created; its id is injected via
 * `extra.eas.projectId` (linked with `eas init --id …`). Visual identity uses
 * the codex palette — splash is the gold beacon on oxford ink (#0C1020).
 *
 * TODO(assets): generate final icon + splash artwork from `PharosSeal`
 * (src/ui/components/PharosSeal). Until then we ship the background colour only
 * (Expo provides a default icon for development / Expo Go).
 * TODO(fonts): bundle Noto Sans Coptic .ttf for the ornament glyphs; the two
 * Latin families load at runtime via @expo-google-fonts.
 */
const config: ExpoConfig = {
  name: 'Pharos',
  slug: 'pharos',
  scheme: 'pharos',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0C1020',
  ios: {
    bundleIdentifier: 'com.pharos.app',
    supportsTablet: false,
    infoPlist: {
      // Local-only app: no tracking, no accounts, no network data collection.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0C1020',
        resizeMode: 'contain',
      },
    ],
    [
      'expo-notifications',
      {
        // Reminders are local only; copy is warm, never shaming.
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
  },
};

export default config;
