/**
 * Root layout: loads the codex fonts, installs the clock, holds the splash
 * until ready, and provides gesture + safe-area context.
 */
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  CormorantGaramond_500Medium_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Spectral_400Regular,
  Spectral_500Medium,
  Spectral_600SemiBold,
  Spectral_400Regular_Italic,
} from '@expo-google-fonts/spectral';
import { useClock } from '../src/state/clock';
import { useAuth } from '../src/state/auth';
import { useRule } from '../src/state/rule';
import { useTheme } from '../src/state/theme';
import { rescheduleReminders } from '../src/platform/notifications';
import { initContent } from '../src/state/content';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Initialise the clock store (installs the system today-provider).
  useClock();

  // Wire bundled content (Synaxarium + KJV scripture) into the domain.
  useEffect(() => {
    initContent();
  }, []);

  // Restore the persisted theme before first paint (gates the splash below).
  const palette = useTheme((s) => s.palette);
  const themeReady = useTheme((s) => s.ready);
  const loadTheme = useTheme((s) => s.load);
  useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  // Restore the session on first mount (auth.load also loads the active
  // account's rule + devotion data), then reschedule due-day reminders.
  const loadAuth = useAuth((s) => s.load);
  useEffect(() => {
    void loadAuth().then(() => {
      const rule = useRule.getState();
      const today = useClock.getState().today;
      void rescheduleReminders(rule.practices, rule.logsByPractice(), today);
    });
  }, [loadAuth]);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    CormorantGaramond_500Medium_Italic,
    Spectral_400Regular,
    Spectral_500Medium,
    Spectral_600SemiBold,
    Spectral_400Regular_Italic,
  });

  useEffect(() => {
    if (fontsLoaded && themeReady) void SplashScreen.hideAsync();
  }, [fontsLoaded, themeReady]);

  if (!fontsLoaded || !themeReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
      <SafeAreaProvider>
        <StatusBar style={palette.barStyle} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="practice" options={{ presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
