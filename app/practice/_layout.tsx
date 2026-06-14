import React from 'react';
import { Stack } from 'expo-router';
import { K } from '../../src/ui/theme';

export default function PracticeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: K.bg } }}>
      <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
