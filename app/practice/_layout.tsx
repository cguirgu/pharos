import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '../../src/ui/useStyles';

export default function PracticeLayout() {
  const t = useThemeColors();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
      <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
