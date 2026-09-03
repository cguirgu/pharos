import type { ExpoConfig } from 'expo/config';

/**
 * Coptic Daily Companion Expo config.
 *
 * The EAS project is already created; its id is injected via
 * `extra.eas.projectId` (linked with `eas init --id …`). Visual identity uses
 * the codex palette — splash is the gold cross emblem on oxford ink (#0C1020).
 *
 * The app icon (assets/icon.png, 1024×1024, the gold cross emblem on oxford ink) is
 * the App Store marketing icon; Expo derives every smaller size from it. The
 * splash (assets/splash.png) recomposites that same emblem onto oxford ink so
 * the launch screen fades seamlessly into the app background.
 * Fonts: all three families ship as bundled assets via @expo-google-fonts
 * (noto-sans-coptic, cormorant-garamond, spectral) and are loaded with
 * `useFonts` in app/_layout.tsx — nothing is fetched at runtime, so the Coptic
 * ornament glyphs render offline and in a store build.
 */
const config: ExpoConfig = {
  // Home-screen label; the App Store listing carries the full "Coptic Daily Companion".
  name: 'Coptic Daily',
  // Must match the slug of the EAS project referenced by extra.eas.projectId.
  slug: 'pharos-coptic-orthodox-friend',
  scheme: 'pharos',
  version: '1.1.0',
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
    bundleIdentifier: 'com.pharosapp.app',
    supportsTablet: false,
    // Sign in with Apple — the only third-party login we offer (alongside
    // email/password), so this satisfies Guideline 4.8.
    usesAppleSignIn: true,
    // Apple privacy manifest (Guideline 5.1.1 / ITMS-91053). The app does no
    // tracking. The one required-reason API our own storage layer touches is
    // UserDefaults (via expo-secure-store + async-storage), reason CA92.1
    // ("access info from the same app"). Third-party pods ship their own
    // manifests, which Expo merges into the built PrivacyInfo.xcprivacy.
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
      ],
    },
    infoPlist: {
      // Optional Supabase account sync uses only standard HTTPS/TLS, which is
      // exempt from US export-encryption filing — so this stays false. (The app
      // still runs fully local when no backend keys are set.)
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.pharosapp.app',
    // Falls back to the shared `icon` until a transparent adaptive-icon
    // foreground is supplied; that's enough to build (not yet Play-submit ready).
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#0C1020',
    },
  },
  plugins: [
    // Build pods as static frameworks so Swift/C pods that ship as static
    // libraries get proper module maps at `pod install`. (Originally added for
    // the now-removed third-party sign-in pods; likely no longer strictly
    // required — safe to revisit on the next EAS build.)
    [
      'expo-build-properties',
      {
        ios: { useFrameworks: 'static' },
      },
    ],
    'expo-router',
    'expo-sqlite',
    'expo-audio',
    'expo-apple-authentication',
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
    // Supabase (Sign in with Apple + email/password); otherwise it falls back to
    // the local dev store (so it still runs in Expo Go without keys).
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
    // RevenueCat public iOS SDK key (optional "Support the app" in-app purchases).
    // When absent the support feature stays inert (Expo Go / unconfigured builds).
    revenueCatIosKey: process.env.REVENUECAT_IOS_KEY || null,
  },
};

export default config;
