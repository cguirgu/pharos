/**
 * Tabs layout. The native tab bar is hidden; we render our own typographic
 * NavLedger (DESIGN-SPEC §4). Tabs: Today · Word · Learn · Rule · Saved · You.
 * (Hours is hidden for now — its route stays registered for easy re-enable.)
 */
import React from 'react';
import { View } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavLedger, type NavTab } from '../../src/ui/components';
import { copy } from '../../src/ui/copy';
import { useThemeColors } from '../../src/ui/useStyles';

const TABS: readonly NavTab[] = [
  { key: 'today', label: copy.tabs.today },
  { key: 'word', label: copy.tabs.word },
  { key: 'learn', label: copy.tabs.learn },
  { key: 'rule', label: copy.tabs.rule },
  { key: 'saved', label: copy.tabs.saved },
  { key: 'you', label: copy.tabs.you },
];

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const t = useThemeColors();
  const active = (segments[segments.length - 1] as string) ?? 'today';

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Tabs
        screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' }, sceneStyle: { backgroundColor: t.bg } }}
      >
        <Tabs.Screen name="today" />
        <Tabs.Screen name="hours" />
        <Tabs.Screen name="learn" />
        <Tabs.Screen name="word" />
        <Tabs.Screen name="rule" />
        <Tabs.Screen name="saved" />
        <Tabs.Screen name="you" />
      </Tabs>
      <View style={{ paddingBottom: insets.bottom, backgroundColor: t.bg }}>
        <NavLedger
          tabs={TABS}
          active={TABS.some((t) => t.key === active) ? active : 'today'}
          onPress={(key) => router.navigate(`/(tabs)/${key}` as never)}
        />
      </View>
    </View>
  );
}
