import React from 'react';
import { Stack } from 'expo-router';
import { K } from '../../src/ui/theme';

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: K.bg } }} />;
}
