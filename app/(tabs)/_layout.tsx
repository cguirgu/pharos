/**
 * Tabs layout. The native tab bar is hidden; we render our own typographic
 * NavLedger (DESIGN-SPEC §4). Five tabs: Today · Hours · Word · Rule · You.
 */
import React from 'react';
import { View } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavLedger, type NavTab } from '../../src/ui/components';
import { copy } from '../../src/ui/copy';
import { K } from '../../src/ui/theme';

const TABS: readonly NavTab[] = [
  { key: 'today', label: copy.tabs.today },
  { key: 'hours', label: copy.tabs.hours },
  { key: 'word', label: copy.tabs.word },
  { key: 'rule', label: copy.tabs.rule },
  { key: 'you', label: copy.tabs.you },
];

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const active = (segments[segments.length - 1] as string) ?? 'today';

  return (
    <View style={{ flex: 1, backgroundColor: K.bg }}>
      <Tabs
        screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' }, sceneStyle: { backgroundColor: K.bg } }}
      >
        <Tabs.Screen name="today" />
        <Tabs.Screen name="hours" />
        <Tabs.Screen name="word" />
        <Tabs.Screen name="rule" />
        <Tabs.Screen name="you" />
      </Tabs>
      <View style={{ paddingBottom: insets.bottom, backgroundColor: K.bg }}>
        <NavLedger
          tabs={TABS}
          active={TABS.some((t) => t.key === active) ? active : 'today'}
          onPress={(key) => router.navigate(`/(tabs)/${key}` as never)}
        />
      </View>
    </View>
  );
}
