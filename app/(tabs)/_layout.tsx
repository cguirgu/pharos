/**
 * Tabs layout. The native tab bar is hidden; we render our own typographic
 * NavLedger (DESIGN-SPEC §4). Tabs: Today · Word · Learn · Ask · You.
 *
 * Rule and Saved moved out of the bar and under You: both are places you shape
 * or review what you have made, rather than daily surfaces (the day's practices
 * are kept from Today). That freed the column "Ask" now occupies.
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
  { key: 'questions', label: copy.tabs.questions },
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
        <Tabs.Screen name="questions" />
        <Tabs.Screen name="you" />
      </Tabs>
      <View style={{ paddingBottom: insets.bottom, backgroundColor: t.bg }}>
        <NavLedger
          tabs={TABS}
          // A registered-but-hidden route (hours) is on no column, so light
          // none rather than falsely marking Today. NavLedger already renders an
          // unmatched key with no filled lozenge.
          active={TABS.some((x) => x.key === active) ? active : active === '(tabs)' ? 'today' : ''}
          onPress={(key) => router.navigate(`/(tabs)/${key}` as never)}
        />
      </View>
    </View>
  );
}
