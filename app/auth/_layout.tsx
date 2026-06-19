import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '../../src/ui/useStyles';

export default function AuthLayout() {
  const t = useThemeColors();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }} />;
}
